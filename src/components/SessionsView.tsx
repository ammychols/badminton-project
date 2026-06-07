import React, { useState, useMemo, useRef } from 'react';
import { Court, Session, INTENSITY_LABELS, ALL_LEVELS } from '../types';
import { uploadGroupImage } from '../utils/uploadImage';
import { btn, card, text, emptyState } from '../styles/tokens';

interface SessionsViewProps {
  sessions: Session[];
  courts: Court[];
  justLogged?: boolean;
  onLogSession: () => void;
  onDeleteSession: (id: string) => void;
  onEditSession: (session: Session) => void;
  onUpdateNote: (id: string, notes: string | undefined) => void;
  onUpdatePhoto: (id: string, image: string | undefined) => void;
}

function RacketSVG({ clipId }: { clipId: string }) {
  // Head centered at x=190 (shifted right in viewBox so left edge never clips)
  const cx = 190, cy = 115, rx = 90, ry = 70;
  const ys = [-56, -42, -28, -14, 0, 14, 28, 42, 56];
  const xs = [-72, -54, -36, -18, 0, 18, 36, 54, 72];
  return (
    <svg width="280" height="400" viewBox="0 0 280 400" fill="none"
      className="absolute bottom-0 right-0 opacity-[0.13] pointer-events-none select-none"
      style={{ zIndex: 2, right: '-30px', bottom: '-15px' }}>
      <defs>
        <clipPath id={clipId}>
          <ellipse cx={cx} cy={cy} rx={rx - 2} ry={ry - 2} />
        </clipPath>
      </defs>
      <g transform={`rotate(-30, ${cx}, 230)`}>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} stroke="white" strokeWidth="3.5" />
        {ys.map(dy => (
          <line key={dy} x1={cx - rx} y1={cy + dy} x2={cx + rx} y2={cy + dy} stroke="white" strokeWidth="1.5" clipPath={`url(#${clipId})`} />
        ))}
        {xs.map(dx => (
          <line key={dx} x1={cx + dx} y1={cy - ry} x2={cx + dx} y2={cy + ry} stroke="white" strokeWidth="1.5" clipPath={`url(#${clipId})`} />
        ))}
        <line x1={cx} y1={cy + ry + 2} x2={cx} y2="315" stroke="white" strokeWidth="5" />
        <rect x={cx - 11} y="315" width="22" height="65" rx="9" stroke="white" strokeWidth="3.5" />
      </g>
    </svg>
  );
}

const MOOD_EMOJIS: Record<number, string> = {
  1: '😡',
  2: '😴',
  3: '😐',
  4: '🙂',
  5: '😄',
  6: '🔥',
};


const DAY_NAMES = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์'];
const MONTH_SHORT = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const DOW_LABELS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

function Heatmap({ sessions, viewYear, viewMonth, onPrev, onNext }: {
  sessions: { date: string }[];
  viewYear: number; viewMonth: number;
  onPrev: () => void; onNext: () => void;
}) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const isNextDisabled = viewYear > currentYear || (viewYear === currentYear && viewMonth >= currentMonth);

  // Build last 6 months summary (always relative to today)
  const currentYM = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const monthStats = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(currentYear, currentMonth - (5 - i), 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const count = sessions.filter(s => s.date.startsWith(ym)).length;
    return { label: MONTH_SHORT[d.getMonth()], count, ym };
  });
  const maxMonth = Math.max(...monthStats.map(m => m.count), 1);

  // Build viewed month calendar
  const viewYM = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const sessionDays = new Set(sessions.filter(s => s.date.startsWith(viewYM)).map(s => parseInt(s.date.slice(8))));
  const isViewingCurrentMonth = viewYM === currentYM;

  // Day-of-week frequency for selected month
  const dowCount = Array(7).fill(0);
  sessions.filter(s => s.date.startsWith(viewYM)).forEach(s => { const d = new Date(s.date + 'T00:00:00'); dowCount[d.getDay()]++; });
  const maxDow = Math.max(...dowCount, 1);

  return (
    <div className={`${card.padded} mb-4`}>
      <div className="text-sm font-semibold text-[var(--text-1)] mb-4">สถิติรายเดือน</div>

      {/* Monthly bars */}
      <div className="flex items-end gap-1.5 mb-5">
        {monthStats.map(({ label, count, ym }) => {
          const isCurrent = ym === currentYM;
          const heightPct = Math.max((count / maxMonth) * 80, count > 0 ? 8 : 3);
          return (
            <div key={ym} className="flex-1 flex flex-col items-center gap-1">
              <div className="text-xs font-semibold text-[var(--text-2)]">{count > 0 ? count : ''}</div>
              <div className="w-full flex items-end" style={{ height: '80px' }}>
                <div className="w-full rounded-t-xl" style={{ height: `${heightPct}px`, backgroundColor: isCurrent ? 'var(--bar-a)' : 'var(--bar-i)' }} />
              </div>
              <div className="text-xs" style={{ fontWeight: isCurrent ? 'bold' : 'normal', color: isCurrent ? 'var(--bar-a)' : 'var(--text-3)' }}>{label}</div>
            </div>
          );
        })}
      </div>

      {/* Calendar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onPrev} className="w-8 h-8 flex items-center justify-center rounded-full transition-colors text-lg" style={{ color: 'var(--text-4)' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--hover-bg)')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}>‹</button>
          <span className="text-sm font-semibold text-[var(--text-2)]">{MONTH_SHORT[viewMonth]} {viewYear + 543}</span>
          <button onClick={onNext} disabled={isNextDisabled}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors text-lg disabled:opacity-20 disabled:cursor-default" style={{ color: 'var(--text-4)' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--hover-bg)')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}>›</button>
        </div>
        <div className="grid grid-cols-7 mb-1">
          {DOW_LABELS.map(d => (
            <div key={d} className="text-center text-xs py-1" style={{ color: 'var(--text-3)' }}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {Array(firstDow).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
            const isToday = isViewingCurrentMonth && d === now.getDate();
            const hasSession = sessionDays.has(d);
            return (
              <div key={d} className="aspect-square flex flex-col items-center justify-center rounded-full text-sm"
                style={{
                  fontWeight: isToday || hasSession ? 600 : undefined,
                  color: hasSession ? 'var(--text-1)' : isToday ? 'var(--text-1)' : 'var(--text-3)',
                  backgroundColor: isToday ? 'var(--chip-bg)' : undefined,
                }}>
                {d}
                <span className="w-1 h-1 rounded-full" style={{ backgroundColor: hasSession ? 'var(--bar-a)' : 'transparent', marginTop: '1px' }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* DOW frequency */}
      <div>
        <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-4)' }}>วันที่ตีบ่อย</div>
        <div className="flex gap-1.5 items-end">
          {DOW_LABELS.map((label, i) => {
            const count = dowCount[i];
            const heightPct = Math.max((count / maxDow) * 40, count > 0 ? 4 : 2);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                <div className="text-xs font-semibold text-[var(--chip-t)]" style={{ minHeight: '16px' }}>{count > 0 ? count : ''}</div>
                <div className="w-full flex items-end" style={{ height: '40px' }}>
                  <div className="w-full rounded-t-lg" style={{ height: `${heightPct}px`, backgroundColor: count > 0 ? 'var(--bar-a)' : 'var(--bar-i)' }} />
                </div>
                <div className="text-xs text-[var(--text-3)]">{label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  const day = DAY_NAMES[d.getDay()];
  const dd = d.getDate();
  const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear() + 543;
  return { day, full: `${dd} ${month} ${year}` };
}

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function thisMonthString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

const INTENSITY_CHIP: Record<string, string> = {
  light: 'bg-emerald-50 text-emerald-600',
  medium: 'bg-amber-50 text-amber-600',
  heavy: 'bg-red-50 text-red-500',
};

const MOOD_BUBBLE: Record<number, string> = {
  1: 'bg-red-50',
  2: 'bg-slate-100',
  3: 'bg-blue-50',
  4: 'bg-amber-50',
  5: 'bg-emerald-50',
  6: 'bg-orange-50',
};

function calcStreak(sessions: { date: string }[]): number {
  if (sessions.length === 0) return 0;
  const dates = [...new Set(sessions.map(s => s.date))].sort().reverse();
  const today = todayString();
  const yesterday = (() => { const d = new Date(); d.setDate(d.getDate() - 1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })();
  if (dates[0] !== today && dates[0] !== yesterday) return 0;
  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i-1] + 'T00:00:00');
    const curr = new Date(dates[i] + 'T00:00:00');
    prev.setDate(prev.getDate() - 1);
    if (prev.toISOString().slice(0,10) === curr.toISOString().slice(0,10)) streak++;
    else break;
  }
  return streak;
}


function SessionRow({ session, courtName, groupName, onEdit, onDelete, onUpdateNote, onUpdatePhoto, onViewInfo }: {
  session: Session; courtName: string; groupName: string;
  onEdit: () => void; onDelete: () => void;
  onUpdateNote: (notes: string | undefined) => void;
  onUpdatePhoto: (image: string | undefined) => void;
  onViewInfo: () => void;
}) {
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(session.notes ?? '');
  const [lightbox, setLightbox] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const commitNote = () => {
    setEditingNote(false);
    const trimmed = noteText.trim() || undefined;
    if (trimmed !== session.notes) onUpdateNote(trimmed);
  };
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async ev => {
      const compressed = await uploadGroupImage('', '', ev.target?.result as string);
      onUpdatePhoto(compressed);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };
  const [sh, sm] = session.startTime.split(':').map(Number);
  const [eh, em] = session.endTime.split(':').map(Number);
  const start = sh * 60 + sm;
  const end = eh * 60 + em;
  const durMin = (() => { if (start === 0 && end === 0) return 0; let d = end - start; if (d <= 0) d += 24 * 60; return (d > 0 && d < 24 * 60) ? d : 0; })();
  const durLabel = durMin > 0 ? (Math.floor(durMin / 60) > 0 ? `${Math.floor(durMin / 60)}ชม.` : '') + (durMin % 60 > 0 ? `${durMin % 60}น.` : '') : null;
  const hasTime = !(start === 0 && end === 0);
  const minPerGame = (durMin > 0 && session.gamesPlayed > 0) ? Math.round(durMin / session.gamesPlayed) : null;

  const metaDivider = <span className="text-[var(--text-4)]">·</span>;

  return (
    <div className="group bg-white border border-[var(--card-border)] rounded-2xl shadow-md overflow-hidden transition-colors hover:border-[color-mix(in_srgb,var(--p)_35%,transparent)] flex flex-col sm:flex-row">
      {/* Left: all content */}
      <div className="flex-1 min-w-0 flex flex-col p-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl select-none ${MOOD_BUBBLE[session.mood]}`}>
            {MOOD_EMOJIS[session.mood]}
          </div>
          {/* Group + court names — only the name text triggers info */}
          <div className="min-w-0 flex-1">
            <div className="text-sm leading-snug">
              <button onClick={onViewInfo} className="font-semibold text-[var(--text-1)] hover:underline hover:text-[var(--p)] transition-colors">{groupName}</button>
              <span className="text-[var(--text-3)] font-normal"> · </span>
              <button onClick={onViewInfo} className="text-[var(--text-3)] hover:underline hover:text-[var(--p)] transition-colors font-normal">{courtName}</button>
            </div>
            {session.intensity && (
              <div className="mt-0.5">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium leading-tight ${INTENSITY_CHIP[session.intensity]}`}>
                  {INTENSITY_LABELS[session.intensity]}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button onClick={onEdit} title="แก้ไข" className="text-[var(--text-3)] hover:text-[var(--p)] transition-colors p-1.5 rounded-lg hover:bg-[var(--chip-bg)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 16H9v-3z" />
              </svg>
            </button>
            <button onClick={() => photoInputRef.current?.click()} title="เพิ่มรูป" className={`text-[var(--text-3)] hover:text-[var(--p)] transition-colors p-1.5 rounded-lg hover:bg-[var(--chip-bg)] ${session.image ? 'hidden' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button onClick={onDelete} title="ลบ" className="text-[var(--text-3)] hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Note */}
        <div className="mt-3 flex-1">
          {editingNote ? (
            <textarea autoFocus value={noteText} onChange={e => setNoteText(e.target.value)}
              onFocus={e => { const l = e.target.value.length; e.target.setSelectionRange(l, l); }}
              onBlur={commitNote}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitNote(); } if (e.key === 'Escape') { setNoteText(session.notes ?? ''); setEditingNote(false); } }}
              placeholder="เพิ่มโน้ต..." rows={2}
              className="w-full text-sm text-[var(--text-2)] border border-[var(--input-b)] rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-[var(--input-f)]"
              style={{ backgroundColor: 'var(--app-bg)' }}
            />
          ) : (
            <button onClick={() => { setNoteText(session.notes ?? ''); setEditingNote(true); }}
              className="w-full text-left rounded-xl px-2 py-1.5 -mx-2 -my-1.5 hover:bg-[var(--chip-bg)] transition-colors group/note">
              {session.notes
                ? <p className="text-[15px] text-[var(--text-1)] leading-relaxed whitespace-pre-wrap border-l-2 border-[color-mix(in_srgb,var(--p)_40%,transparent)] group-hover/note:border-[var(--p)] pl-3 transition-colors">{session.notes}</p>
                : <p className="text-sm text-[var(--text-3)] opacity-60 group-hover:opacity-100 transition-opacity">+ เพิ่มโน้ต...</p>
              }
            </button>
          )}
        </div>

        {/* Meta footer */}
        {(hasTime || session.gamesPlayed > 0) && (
          <div className="mt-3 pt-2.5 border-t border-[var(--card-border)] flex items-center flex-wrap gap-x-2 gap-y-1 text-xs">
            {hasTime && <span className="tabular-nums text-[var(--text-3)]">{session.startTime} – {session.endTime}</span>}
            {hasTime && durLabel && metaDivider}
            {durLabel && <span className="font-semibold tabular-nums text-[var(--text-2)]">{durLabel}</span>}
            {(hasTime || durLabel) && session.gamesPlayed > 0 && metaDivider}
            {session.gamesPlayed > 0 && <span className="font-bold tabular-nums text-[var(--text-2)]">{session.gamesPlayed} เกม</span>}
            {minPerGame && metaDivider}
            {minPerGame && <span className="tabular-nums text-[var(--text-3)]">{minPerGame} นาที/เกม</span>}
          </div>
        )}
      </div>

      {/* Right: photo */}
      <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
      {session.image ? (
        <div className="relative aspect-[4/3] sm:aspect-auto sm:w-44 flex-shrink-0 sm:m-3 rounded-none sm:rounded-2xl overflow-hidden cursor-pointer" onClick={() => setLightbox(true)}>
          <img src={session.image} alt="session" className="w-full h-full object-cover" />
          {/* Hover overlay with actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              title="เปลี่ยนรูป"
              onClick={e => { e.stopPropagation(); photoInputRef.current?.click(); }}
              className="w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button
              type="button"
              title="ลบรูป"
              onClick={e => { e.stopPropagation(); onUpdatePhoto(undefined); }}
              className="w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center text-xs hover:bg-red-500/80 transition-colors"
            >✕</button>
          </div>
        </div>
      ) : null}

      {/* Lightbox */}
      {lightbox && session.image && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setLightbox(false)}
        >
          <img
            src={session.image}
            alt="session"
            className="max-w-[92vw] max-h-[88vh] rounded-2xl object-contain shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center text-lg hover:bg-white/30 transition-colors"
          >✕</button>
        </div>
      )}
    </div>
  );
}

function FeedList({ sessions, getCourtName, getGroupName, onEditSession, setConfirmDeleteId, onUpdateNote, onUpdatePhoto, onViewInfo }: {
  sessions: Session[];
  getCourtName: (id: string) => string;
  getGroupName: (courtId: string, groupId: string) => string;
  onEditSession: (s: Session) => void;
  setConfirmDeleteId: (id: string) => void;
  onUpdateNote: (id: string, notes: string | undefined) => void;
  onUpdatePhoto: (id: string, image: string | undefined) => void;
  onViewInfo: (s: Session) => void;
}) {
  const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date));
  // Group by date
  const groups: { date: string; label: string; items: Session[] }[] = [];
  for (const s of sorted) {
    const last = groups[groups.length - 1];
    if (last && last.date === s.date) { last.items.push(s); }
    else {
      const { day, full } = formatDate(s.date);
      groups.push({ date: s.date, label: `วัน${day} ${full}`, items: [s] });
    }
  }
  return (
    <div className="flex flex-col gap-1">
      {groups.map((g, gi) => (
        <div key={g.date}>
          {/* Date label */}
          <div className={`px-1 pb-2 ${gi > 0 ? 'pt-4' : 'pt-0'}`}>
            <span className="text-xs font-semibold text-[var(--text-3)]">{g.label}</span>
          </div>
          {/* Each session as its own feed card */}
          <div className="flex flex-col gap-2">
            {g.items.map(s => (
              <SessionRow key={s.id} session={s}
                courtName={getCourtName(s.courtId)} groupName={getGroupName(s.courtId, s.groupId)}
                onEdit={() => onEditSession(s)} onDelete={() => setConfirmDeleteId(s.id)}
                onUpdateNote={notes => onUpdateNote(s.id, notes)}
                onUpdatePhoto={image => onUpdatePhoto(s.id, image)}
                onViewInfo={() => onViewInfo(s)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function computeInsights(
  sessions: Session[],
  getCourtName: (id: string) => string,
  getGroupName: (courtId: string, groupId: string) => string
): Array<{ emoji: string; text: string }> {
  if (sessions.length < 1) return [];
  const out: Array<{ emoji: string; text: string }> = [];

  // Most visited group
  const gc: Record<string, { count: number; courtId: string }> = {};
  for (const s of sessions) {
    if (!gc[s.groupId]) gc[s.groupId] = { count: 0, courtId: s.courtId };
    gc[s.groupId].count++;
  }
  const topG = Object.entries(gc).sort((a, b) => b[1].count - a[1].count)[0];
  if (topG[1].count >= 2)
    out.push({ emoji: '🏸', text: `ก๊วน ${getGroupName(topG[1].courtId, topG[0])} เป็นที่ที่ไปบ่อยที่สุด (${topG[1].count} ครั้ง)` });

  // Best single session
  const maxGames = Math.max(...sessions.map(s => s.gamesPlayed));
  if (maxGames >= 3) {
    const topSessions = sessions.filter(s => s.gamesPlayed === maxGames);
    const label = topSessions.length === 1
      ? ` — ${getGroupName(topSessions[0].courtId, topSessions[0].groupId)}`
      : '';
    out.push({ emoji: '⚡', text: `สถิติสูงสุด ${maxGames} เกมใน 1 ครั้ง${label}` });
  }

  // Favourite day of week
  const dc: Record<number, number> = {};
  const DL = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์'];
  for (const s of sessions) dc[new Date(s.date + 'T00:00:00').getDay()] = (dc[new Date(s.date + 'T00:00:00').getDay()] || 0) + 1;
  const topD = Object.entries(dc).sort((a, b) => Number(b[1]) - Number(a[1]))[0];
  if (Number(topD[1]) >= 2)
    out.push({ emoji: '📅', text: `วัน${DL[Number(topD[0])]}เป็นวันที่ตีบ่อยที่สุด (${topD[1]} ครั้ง)` });

  // Month comparison
  const now2 = new Date();
  const tmStr = `${now2.getFullYear()}-${String(now2.getMonth() + 1).padStart(2, '0')}`;
  const lmD = new Date(now2.getFullYear(), now2.getMonth() - 1, 1);
  const lmStr = `${lmD.getFullYear()}-${String(lmD.getMonth() + 1).padStart(2, '0')}`;
  const tmG = sessions.filter(s => s.date.startsWith(tmStr)).reduce((sum, s) => sum + s.gamesPlayed, 0);
  const lmG = sessions.filter(s => s.date.startsWith(lmStr)).reduce((sum, s) => sum + s.gamesPlayed, 0);
  if (lmG > 0 && tmG > 0) {
    const diff = tmG - lmG;
    if (diff > 0) out.push({ emoji: '📈', text: `เดือนนี้ตีมากกว่าเดือนที่แล้ว ${diff} เกม` });
    else if (diff < 0) out.push({ emoji: '📉', text: `เดือนนี้ตีน้อยกว่าเดือนที่แล้ว ${Math.abs(diff)} เกม` });
  }

  // Best mood group
  if (sessions.length >= 5) {
    const gm: Record<string, { sum: number; count: number; courtId: string }> = {};
    for (const s of sessions) {
      if (!gm[s.groupId]) gm[s.groupId] = { sum: 0, count: 0, courtId: s.courtId };
      gm[s.groupId].sum += s.mood; gm[s.groupId].count++;
    }
    const bm = Object.entries(gm).filter(([, v]) => v.count >= 2).sort((a, b) => (b[1].sum / b[1].count) - (a[1].sum / a[1].count))[0];
    if (bm) out.push({ emoji: '😄', text: `อารมณ์ดีที่สุดเมื่อตีกับก๊วน ${getGroupName(bm[1].courtId, bm[0])}` });
  }

  // All-time best streak
  const allD = [...new Set(sessions.map(s => s.date))].sort();
  let maxSt = 1, curSt = 1;
  for (let i = 1; i < allD.length; i++) {
    const p = new Date(allD[i - 1] + 'T00:00:00'); p.setDate(p.getDate() + 1);
    if (p.toISOString().slice(0, 10) === allD[i]) { curSt++; maxSt = Math.max(maxSt, curSt); } else curSt = 1;
  }
  if (maxSt >= 3) out.push({ emoji: '🔥', text: `best streak ของคุณคือ ${maxSt} วันติดต่อกัน` });

  // Time preference
  const timed = sessions.filter(s => !(s.startTime === '00:00' && s.endTime === '00:00'));
  if (timed.length >= 3) {
    const avgH = Math.round(timed.map(s => Number(s.startTime.split(':')[0])).reduce((a, b) => a + b, 0) / timed.length);
    const tl = avgH < 12 ? 'ช่วงเช้า' : avgH < 17 ? 'ช่วงบ่าย' : avgH < 20 ? 'ช่วงเย็น' : 'ช่วงค่ำ';
    out.push({ emoji: '⏰', text: `ชอบตี${tl} (เริ่มเฉลี่ย ${String(avgH).padStart(2, '0')}:00 น.)` });
  }

  // Longest wait (max min/game) — sessions with both time and games recorded
  const withMpg = sessions
    .filter(s => s.gamesPlayed > 0 && !(s.startTime === '00:00' && s.endTime === '00:00'))
    .map(s => {
      const [sh, sm] = s.startTime.split(':').map(Number);
      const [eh, em] = s.endTime.split(':').map(Number);
      let dur = (eh * 60 + em) - (sh * 60 + sm);
      if (dur <= 0) dur += 24 * 60;
      return { mpg: Math.round(dur / s.gamesPlayed), courtId: s.courtId, groupId: s.groupId };
    });
  if (withMpg.length >= 3) {
    const top = withMpg.reduce((a, b) => b.mpg > a.mpg ? b : a);
    if (top.mpg >= 30)
      out.push({ emoji: '⏳', text: `รอนานสุด ${top.mpg} นาที/เกม — ${getGroupName(top.courtId, top.groupId)}` });
  }

  // Heaviest group — which group most often delivers heavy games
  const INTENSITY_SCORE: Record<string, number> = { light: 1, medium: 2, heavy: 3 };
  const gi: Record<string, { sum: number; count: number; heavy: number; courtId: string }> = {};
  for (const s of sessions) {
    if (!s.intensity) continue;
    if (!gi[s.groupId]) gi[s.groupId] = { sum: 0, count: 0, heavy: 0, courtId: s.courtId };
    gi[s.groupId].sum += INTENSITY_SCORE[s.intensity];
    gi[s.groupId].count++;
    if (s.intensity === 'heavy') gi[s.groupId].heavy++;
  }
  const ranked = Object.entries(gi)
    .filter(([, v]) => v.count >= 2)
    .sort((a, b) => (b[1].sum / b[1].count) - (a[1].sum / a[1].count));
  if (ranked.length > 0) {
    const top = ranked[0];
    const bottom = ranked[ranked.length - 1];
    if (top[1].sum / top[1].count >= 2.5)
      out.push({ emoji: '🔥', text: `ไปก๊วน ${getGroupName(top[1].courtId, top[0])} มักเจอเกมหนัก เตรียมตัวให้พร้อม!` });
    else if (bottom[1].sum / bottom[1].count <= 1.5)
      out.push({ emoji: '🌿', text: `ก๊วน ${getGroupName(bottom[1].courtId, bottom[0])} เล่นสบายๆ ชิลล์ๆ` });
  }

  return out;
}

export function SessionsView({ sessions, courts, justLogged, onLogSession, onDeleteSession, onEditSession, onUpdateNote, onUpdatePhoto }: SessionsViewProps) {
  const today = todayString();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [viewInfoSession, setViewInfoSession] = useState<Session | null>(null);
  const [search, setSearch] = useState('');
  const [insightIdx, setInsightIdx] = useState(0);
  const insightTouchX = useRef<number | null>(null);

  const getCourtName = (courtId: string) => courts.find(c => c.id === courtId)?.name ?? 'ไม่พบสนาม';
  const getGroupName = (courtId: string, groupId: string) =>
    courts.find(c => c.id === courtId)?.groups.find(g => g.id === groupId)?.name ?? 'ไม่พบก๊วน';

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const [viewYear, setViewYear] = useState(currentYear);
  const [viewMonth, setViewMonth] = useState(currentMonth);
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewYear > currentYear || (viewYear === currentYear && viewMonth >= currentMonth)) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };
  const viewYM = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;
  const q = search.trim().toLowerCase();
  const viewedSessions = sessions.filter(s => {
    if (!s.date.startsWith(viewYM)) return false;
    if (!q) return true;
    return getCourtName(s.courtId).toLowerCase().includes(q) || getGroupName(s.courtId, s.groupId).toLowerCase().includes(q);
  });
  const isNextDisabled = viewYear > currentYear || (viewYear === currentYear && viewMonth >= currentMonth);
  const totalSessions = sessions.length;
  const totalGames = sessions.reduce((sum, s) => sum + s.gamesPlayed, 0);
  const thisMonthSessions = sessions.filter(s => s.date.startsWith(viewYM));
  const thisMonthDays = new Set(thisMonthSessions.map(s => s.date)).size;
  const thisMonthGames = thisMonthSessions.reduce((sum, s) => sum + s.gamesPlayed, 0);
  const avgGamesPerDay = thisMonthDays > 0 ? (thisMonthGames / thisMonthDays).toFixed(1) : null;
  const hasSessionToday = sessions.some(s => s.date === today);
  const streak = calcStreak(sessions);
  const sortedDates = [...new Set(sessions.map(s => s.date))].sort();
  const lastSessionDate = sortedDates[sortedDates.length - 1];
  const daysSinceLast = lastSessionDate
    ? Math.floor((new Date(today + 'T00:00:00').getTime() - new Date(lastSessionDate + 'T00:00:00').getTime()) / 86400000)
    : null;

  type NudgeStyle = 'emerald' | 'orange' | 'amber' | 'slate';
  const nudge: { emoji: string; message: string; sub?: string; btnLabel: string; style: NudgeStyle } | null = (() => {
    if (!sessions.length) return null;
    if (justLogged) {
      if (streak >= 5) return { emoji: '🔥', message: `${streak} วันติดต่อกันแล้ว!`, sub: 'ฟอร์มร้อนแรงมาก ไปต่อเลย', btnLabel: 'บันทึกอีกครั้ง', style: 'orange' };
      if (streak >= 3) return { emoji: '🎉', message: 'บันทึกแล้ว!', sub: `ตีติดกัน ${streak} วัน สุดยอด!`, btnLabel: 'บันทึกอีกครั้ง', style: 'emerald' };
      return { emoji: '🎉', message: 'บันทึกแล้ว!', sub: 'ตีดีมากวันนี้ เก่งมาก', btnLabel: 'บันทึกอีกครั้ง', style: 'emerald' };
    }
    if (hasSessionToday) {
      if (streak >= 5) return { emoji: '🔥', message: `${streak} วันติดต่อกัน!`, sub: 'ฟอร์มร้อนแรงมาก ยอดเยี่ยม!', btnLabel: 'บันทึกอีกครั้ง', style: 'orange' };
      if (streak >= 3) return { emoji: '🔥', message: `ตีติดกัน ${streak} วันแล้ว!`, sub: 'รักษาฟอร์มนี้ไว้', btnLabel: 'บันทึกอีกครั้ง', style: 'orange' };
      return { emoji: '✅', message: 'ตีแล้ววันนี้', btnLabel: '+ บันทึกอีกครั้ง', style: 'slate' };
    }
    if (streak >= 3) return { emoji: '🔥', message: `Streak ${streak} วัน กำลังมา!`, sub: 'ตีวันนี้ด้วยจะได้ครบ', btnLabel: 'บันทึกเลย →', style: 'amber' };
    if (daysSinceLast !== null && daysSinceLast > 14) return { emoji: '😢', message: `ห่างหายไป ${daysSinceLast} วันแล้ว`, sub: 'กลับมาตีได้เลย!', btnLabel: 'บันทึกเลย →', style: 'slate' };
    if (daysSinceLast !== null && daysSinceLast > 7) return { emoji: '😴', message: `หยุดไป ${daysSinceLast} วัน`, sub: 'เริ่มตีใหม่ได้เลย', btnLabel: 'บันทึกเลย →', style: 'slate' };
    return { emoji: '🏸', message: 'วันนี้ยังไม่ได้ตี', btnLabel: 'บันทึกเลย →', style: 'amber' };
  })();

  const NUDGE_STYLES: Record<NudgeStyle, { wrap: string; text: string; pill: string }> = {
    emerald: { wrap: 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 shadow-emerald-100', text: 'text-emerald-800', pill: 'bg-emerald-500 hover:bg-emerald-600' },
    orange:  { wrap: 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 shadow-orange-100',   text: 'text-orange-800',  pill: 'bg-orange-500 hover:bg-orange-600'   },
    amber:   { wrap: 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 shadow-amber-100',     text: 'text-amber-800',   pill: 'bg-amber-500 hover:bg-amber-600'     },
    slate:   { wrap: 'bg-gradient-to-r from-slate-100 to-gray-100 border-slate-200 shadow-slate-100',     text: 'text-slate-700',   pill: 'bg-slate-500 hover:bg-slate-600'     },
  };

  const insights = useMemo(
    () => computeInsights(sessions, getCourtName, getGroupName),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessions, courts]
  );
  const activeInsight = insights.length > 0 ? insights[insightIdx % insights.length] : null;
  React.useEffect(() => {
    setInsightIdx(0);
  }, [insights.length]);
  React.useEffect(() => {
    if (insights.length <= 1) return;
    const t = setInterval(() => setInsightIdx(i => i + 1), 4000);
    return () => clearInterval(t);
  }, [insights.length]);

  const sessionDurations = thisMonthSessions.map(s => {
    const [sh, sm] = s.startTime.split(':').map(Number);
    const [eh, em] = s.endTime.split(':').map(Number);
    return (eh * 60 + em) - (sh * 60 + sm);
  }).filter(d => d > 0);
  const avgMinutes = sessionDurations.length > 0
    ? Math.round(sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length)
    : null;
  const avgDuration = avgMinutes
    ? avgMinutes >= 60
      ? `${Math.floor(avgMinutes / 60)}ชม.${avgMinutes % 60 > 0 ? `${avgMinutes % 60}น.` : ''}`
      : `${avgMinutes}น.`
    : null;

  return (
    <div className="max-w-screen-sm mx-auto px-4 pt-5 pb-10 sm:max-w-screen-2xl sm:px-10">
      {/* Header */}
      <div className="mb-5">
        <h2 className={text.pageTitle}>บันทึกการตี</h2>
      </div>

      {/* ── Desktop: 2-column dashboard ── */}
      <div className="hidden sm:flex sm:gap-5 sm:items-start">
        {/* Col 1: Hero card + Heatmap below */}
        <div className="w-[340px] flex-shrink-0">
          <div className="relative rounded-3xl p-5 mb-4 text-white overflow-hidden shadow-xl" style={{background: 'linear-gradient(135deg, var(--hero-from) 0%, var(--p) 60%, var(--hero-to) 100%)'}}>
            <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full blur-3xl" style={{background: 'rgba(255,255,255,0.18)'}} />
            <div className="absolute -bottom-12 -left-8 w-52 h-52 rounded-full blur-3xl" style={{background: 'rgba(255,255,255,0.10)'}} />
            <div className="absolute top-0 right-8 w-36 h-36 rounded-full blur-3xl" style={{background: 'var(--hero-gold, rgba(255,255,255,0.08))'}} />
            <div className="absolute bottom-2 right-1/4 w-20 h-20 rounded-full blur-2xl" style={{background: 'var(--hero-gold2, rgba(255,255,255,0.06))'}} />
            <div className="absolute inset-0 opacity-[0.12]" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '180px 180px'}} />
            <div className="absolute inset-0 rounded-3xl" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.15)'}} />
            <RacketSVG clipId="rh-desk" />
            <div className="relative z-10 flex items-end justify-between mb-4">
              <div>
                <div className="text-xs text-white/60 mb-0.5">ตีไปทั้งหมด</div>
                <div className="flex items-end gap-1.5 leading-none">
                  <span className="text-5xl font-black">{totalGames}</span>
                  <span className="text-lg text-white/60 mb-1">เกม</span>
                </div>
              </div>
              {streak >= 2 && (
                <div className="flex items-center gap-1.5 bg-orange-500/20 text-orange-300 px-3 py-1.5 rounded-full">
                  <span className="text-lg">🔥</span>
                  <span className="text-sm font-semibold">{streak} วันติด</span>
                </div>
              )}
            </div>
            <div className="relative z-10 border-t border-white/10 pt-3">
              <div className="flex items-center justify-between mb-3">
                <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors text-lg leading-none">‹</button>
                <span className="text-xs text-white/70 font-medium">{MONTH_SHORT[viewMonth]} {viewYear + 543}</span>
                <button onClick={nextMonth} disabled={isNextDisabled} className="w-7 h-7 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors text-lg leading-none disabled:opacity-30 disabled:cursor-default">›</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><div className="text-2xl font-bold">{thisMonthDays}</div><div className="text-xs text-white/60">วันที่ตี</div></div>
                <div><div className="text-2xl font-bold">{thisMonthGames}</div><div className="text-xs text-white/60">เกม</div></div>
                <div><div className="text-2xl font-bold">{avgGamesPerDay ?? '—'}</div><div className="text-xs text-white/60">เกม/วัน</div></div>
                <div><div className="text-2xl font-bold">{avgDuration ?? '—'}</div><div className="text-xs text-white/60">เฉลี่ย/ครั้ง</div></div>
              </div>
            </div>
          </div>
          {sessions.length > 0 && (
            <Heatmap sessions={sessions} viewYear={viewYear} viewMonth={viewMonth} onPrev={prevMonth} onNext={nextMonth} />
          )}
        </div>

        {/* Col 2: Session feed */}
        <div className="flex-1 min-w-0">
          {sessions.length === 0 ? (
            <div className={emptyState.wrapper}>
              <div className={emptyState.icon}>🏸</div>
              <div className={emptyState.title}>เริ่มบันทึกการตีแบด</div>
              <div className={emptyState.subtitle}>ติดตามพัฒนาการและสถิติของคุณ</div>
              <button onClick={onLogSession} className={btn.primaryLg}>+ บันทึกครั้งแรก</button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--dashed)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
                </svg>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="ค้นหาก๊วน หรือสนาม..."
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-[var(--input-b)] rounded-2xl focus:outline-none focus:ring-1 focus:ring-[var(--input-f)] placeholder-[var(--dashed)]"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--dashed)] hover:text-[var(--text-3)]">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              {(activeInsight || nudge) && (
                <div className="hidden sm:flex gap-2">
                  {/* Insight — left */}
                  {activeInsight && (
                    <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-2xl border bg-[var(--chip-bg)] border-[var(--card-border)] min-w-0 overflow-hidden">
                      <span key={insightIdx % insights.length} className="flex items-center gap-2 flex-1 min-w-0 animate-insight-in">
                        <span className="text-base flex-shrink-0">{activeInsight.emoji}</span>
                        <span className="text-sm text-[var(--text-2)] min-w-0 truncate">{activeInsight.text}</span>
                      </span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {insights.map((_, i) => (
                          <span key={i} className="rounded-full transition-all inline-block"
                            style={{ width: i === insightIdx % insights.length ? '14px' : '5px', height: '5px', backgroundColor: i === insightIdx % insights.length ? 'var(--p)' : 'var(--text-3)', opacity: i === insightIdx % insights.length ? 1 : 0.4 }} />
                        ))}
                        {insights.length > 1 && (
                          <button onClick={() => setInsightIdx(i => i + 1)}
                            className="ml-1 text-xs text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors leading-none">›</button>
                        )}
                      </div>
                    </div>
                  )}
                  {/* State nudge — right */}
                  {nudge && (() => { const ns = NUDGE_STYLES[nudge.style]; return (
                    <div className={`flex-1 flex items-center gap-3 px-4 py-2.5 rounded-2xl border shadow-sm ${ns.wrap}`}>
                      <span className="text-xl flex-shrink-0">{nudge.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm font-semibold ${ns.text}`}>{nudge.message}</span>
                        {nudge.sub && <span className={`text-xs opacity-75 ${ns.text}`}> — {nudge.sub}</span>}
                      </div>
                      <button onClick={onLogSession} className={`text-xs font-bold whitespace-nowrap text-white px-3.5 py-1.5 rounded-full transition-all active:scale-95 flex-shrink-0 shadow-sm ${ns.pill}`}>{nudge.btnLabel}</button>
                    </div>
                  ); })()}
                </div>
              )}
              {viewedSessions.length === 0 && (
                <div className="text-center text-sm text-[var(--text-3)] py-8">{search ? `ไม่พบ "${search}"` : 'ไม่มีบันทึกในเดือนนี้'}</div>
              )}
              {viewedSessions.length > 0 && (
                <FeedList sessions={viewedSessions} getCourtName={getCourtName} getGroupName={getGroupName}
                  onEditSession={onEditSession} setConfirmDeleteId={setConfirmDeleteId} onUpdateNote={onUpdateNote} onUpdatePhoto={onUpdatePhoto} onViewInfo={setViewInfoSession} />
              )}
            </div>
          )}
        </div>


      </div>

      {/* ── Mobile: stacked ── */}
      <div className="sm:hidden">
        <div className="relative rounded-3xl p-5 mb-4 text-white overflow-hidden shadow-xl" style={{background: 'linear-gradient(135deg, var(--hero-from) 0%, var(--p) 60%, var(--hero-to) 100%)'}}>
          <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full blur-3xl" style={{background: 'rgba(255,255,255,0.18)'}} />
          <div className="absolute -bottom-12 -left-8 w-52 h-52 rounded-full blur-3xl" style={{background: 'rgba(255,255,255,0.10)'}} />
          <div className="absolute top-0 right-8 w-36 h-36 rounded-full blur-3xl" style={{background: 'var(--hero-gold, rgba(255,255,255,0.08))'}} />
          <div className="absolute bottom-2 right-1/4 w-20 h-20 rounded-full blur-2xl" style={{background: 'var(--hero-gold2, rgba(255,255,255,0.06))'}} />
          <div className="absolute inset-0 opacity-[0.12]" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '180px 180px'}} />
          <div className="absolute inset-0 rounded-3xl" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.15)'}} />
          <RacketSVG clipId="rh-mob" />
          <div className="relative z-10 flex items-end justify-between mb-4">
            <div>
              <div className="text-xs text-white/60 mb-0.5">ตีไปทั้งหมด</div>
              <div className="flex items-end gap-1.5 leading-none">
                <span className="text-5xl font-black">{totalGames}</span>
                <span className="text-lg text-white/60 mb-1">เกม</span>
              </div>
            </div>
            {streak >= 2 && (
              <div className="flex items-center gap-1.5 bg-orange-500/20 text-orange-300 px-3 py-1.5 rounded-full">
                <span className="text-lg">🔥</span>
                <span className="text-sm font-semibold">{streak} วันติด</span>
              </div>
            )}
          </div>
          <div className="relative z-10 border-t border-white/10 pt-3">
            <div className="flex items-center justify-between mb-3">
              <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors text-lg leading-none">‹</button>
              <span className="text-xs text-white/70 font-medium">{MONTH_SHORT[viewMonth]} {viewYear + 543}</span>
              <button onClick={nextMonth} disabled={isNextDisabled} className="w-7 h-7 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors text-lg leading-none disabled:opacity-30 disabled:cursor-default">›</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><div className="text-2xl font-bold">{thisMonthDays}</div><div className="text-xs text-white/60">วันที่ตี</div></div>
              <div><div className="text-2xl font-bold">{thisMonthGames}</div><div className="text-xs text-white/60">เกม</div></div>
              <div><div className="text-2xl font-bold">{avgGamesPerDay ?? '—'}</div><div className="text-xs text-white/60">เกม/วัน</div></div>
              <div><div className="text-2xl font-bold">{avgDuration ?? '—'}</div><div className="text-xs text-white/60">เฉลี่ย/ครั้ง</div></div>
            </div>
          </div>
        </div>
        {sessions.length > 0 && <Heatmap sessions={sessions} viewYear={viewYear} viewMonth={viewMonth} onPrev={prevMonth} onNext={nextMonth} />}
        {activeInsight && (
          <div className={`${card.padded} mb-4 flex flex-col gap-3 overflow-hidden`}
            style={{ touchAction: 'pan-y' }}
            onTouchStart={e => { insightTouchX.current = e.touches[0].clientX; }}
            onTouchEnd={e => {
              if (insightTouchX.current === null) return;
              const dx = e.changedTouches[0].clientX - insightTouchX.current;
              insightTouchX.current = null;
              if (Math.abs(dx) < 40) return;
              if (dx < 0) setInsightIdx(i => i + 1);
              else setInsightIdx(i => (i - 1 + insights.length) % insights.length);
            }}
          >
            <div key={insightIdx % insights.length} className="flex items-start gap-3 animate-insight-in">
              <span className="text-2xl flex-shrink-0 mt-0.5">{activeInsight.emoji}</span>
              <p className="text-sm text-[var(--text-2)] leading-relaxed flex-1">{activeInsight.text}</p>
            </div>
            {insights.length > 1 && (
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {insights.map((_, i) => (
                    <button key={i} onClick={() => setInsightIdx(i)}
                      className="rounded-full transition-all"
                      style={{ width: i === insightIdx % insights.length ? '20px' : '7px', height: '7px', backgroundColor: i === insightIdx % insights.length ? 'var(--p)' : 'var(--text-3)' }} />
                  ))}
                </div>
                <button onClick={() => setInsightIdx(i => i + 1)}
                  className="text-xs text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors">
                  ถัดไป ›
                </button>
              </div>
            )}
          </div>
        )}
        {nudge && (() => { const ns = NUDGE_STYLES[nudge.style]; return (
          <button onClick={onLogSession} className={`w-full border rounded-2xl px-4 py-3.5 mb-4 flex items-center gap-3 text-left transition-all active:scale-[0.98] shadow-sm ${ns.wrap}`}>
            <span className="text-2xl flex-shrink-0">{nudge.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-bold ${ns.text}`}>{nudge.message}</div>
              {nudge.sub && <div className={`text-xs mt-0.5 opacity-80 ${ns.text}`}>{nudge.sub}</div>}
            </div>
            <span className={`text-xs font-bold whitespace-nowrap text-white px-3.5 py-2 rounded-full flex-shrink-0 shadow-sm ${ns.pill}`}>{nudge.btnLabel}</span>
          </button>
        ); })()}
        {sessions.length === 0 ? (
          <div className={emptyState.wrapper}>
            <div className={emptyState.icon}>🏸</div>
            <div className={emptyState.title}>เริ่มบันทึกการตีแบด</div>
            <div className={emptyState.subtitle}>ติดตามพัฒนาการและสถิติของคุณ</div>
            <button onClick={onLogSession} className={btn.primaryLg}>+ บันทึกครั้งแรก</button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 mt-4">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--dashed)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
              </svg>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="ค้นหาก๊วน หรือสนาม..."
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-[var(--input-b)] rounded-2xl focus:outline-none focus:ring-1 focus:ring-[var(--input-f)] placeholder-[var(--dashed)]"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--dashed)] hover:text-[var(--text-3)]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {viewedSessions.length === 0 && (
              <div className="text-center text-sm text-[var(--text-3)] py-8">{search ? `ไม่พบ "${search}"` : 'ไม่มีบันทึกในเดือนนี้'}</div>
            )}
            {viewedSessions.length > 0 && (
              <FeedList sessions={viewedSessions} getCourtName={getCourtName} getGroupName={getGroupName}
                onEditSession={onEditSession} setConfirmDeleteId={setConfirmDeleteId} onUpdateNote={onUpdateNote} onUpdatePhoto={onUpdatePhoto} onViewInfo={setViewInfoSession} />
            )}
          </div>
        )}
      </div>

      {/* Group / Court info sheet */}
      {viewInfoSession && (() => {
        const court = courts.find(c => c.id === viewInfoSession.courtId);
        const group = court?.groups.find(g => g.id === viewInfoSession.groupId);
        if (!court || !group) return null;
        const dayMap: Record<string, string> = { MON: 'จ', TUE: 'อ', WED: 'พ', THU: 'พฤ', FRI: 'ศ', SAT: 'ส', SUN: 'อา' };
        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center sm:items-center" onClick={() => setViewInfoSession(null)}>
            <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex items-start justify-between px-5 pt-5 pb-3">
                <div className="min-w-0">
                  <p className="text-base font-bold text-[var(--text-1)]"><span className="text-xs font-semibold text-[var(--p)] bg-[color-mix(in_srgb,var(--p)_12%,transparent)] px-1.5 py-0.5 rounded-md mr-1.5">ก๊วน</span>{group.name}</p>
                  <p className="text-sm text-[var(--text-3)] mt-0.5">{court.name}</p>
                  {court.address && <p className="text-xs text-[var(--text-4)] mt-0.5">{court.address}</p>}
                </div>
                <button onClick={() => setViewInfoSession(null)} className="w-8 h-8 rounded-full bg-[var(--chip-bg)] flex items-center justify-center text-[var(--text-3)] text-sm ml-3 flex-shrink-0">✕</button>
              </div>
              <div className="px-5 pb-6 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[var(--chip-bg)] flex items-center justify-center text-base flex-shrink-0">📅</div>
                  <div>
                    <div className="text-xs text-[var(--text-3)] mb-0.5">วัน · เวลา</div>
                    <div className="text-sm font-medium text-[var(--text-1)]">
                      {group.days.map(d => dayMap[d] ?? d).join(' ')}
                      {group.startTime && group.endTime ? ` · ${group.startTime}–${group.endTime}` : ''}
                    </div>
                  </div>
                </div>
                {group.levels && group.levels.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[var(--chip-bg)] flex items-center justify-center text-base flex-shrink-0">🏸</div>
                    <div>
                      <div className="text-xs text-[var(--text-3)] mb-0.5">ระดับ</div>
                      <div className="text-sm font-medium text-[var(--text-1)]">{[...group.levels].sort((a, b) => ALL_LEVELS.indexOf(a) - ALL_LEVELS.indexOf(b)).join(' · ')}</div>
                    </div>
                  </div>
                )}
                {group.notes && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[var(--chip-bg)] flex items-center justify-center text-base flex-shrink-0">📝</div>
                    <div>
                      <div className="text-xs text-[var(--text-3)] mb-0.5">โน้ต</div>
                      <div className="text-sm text-[var(--text-2)] leading-relaxed">{group.notes}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center sm:items-center" onClick={() => setConfirmDeleteId(null)}>
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
            <p className="text-base font-semibold text-[var(--text-1)] mb-1">ลบบันทึก</p>
            <p className="text-sm text-[var(--text-3)] mb-5">ลบรายการนี้ออกจากประวัติ?</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-[var(--input-b)] text-sm text-[var(--text-2)] hover:bg-[var(--hover-bg)] transition-colors">ยกเลิก</button>
              <button onClick={() => { onDeleteSession(confirmDeleteId); setConfirmDeleteId(null); }} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">ลบ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
