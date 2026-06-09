import React, { useState, useMemo, useRef } from 'react';
import { Court, Session, INTENSITY_LABELS, ALL_LEVELS } from '../types';
import { GroupReviewModal } from './GroupReviewModal';
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
  onUpdatePhotos: (id: string, images: string[]) => void;
  onNavigateToCourt: (courtId: string) => void;
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
const DOW_LABELS_SHORT = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'];

function ActivityCard({ sessions, viewYear, viewMonth, onPrev, onNext }: {
  sessions: { date: string }[];
  viewYear: number; viewMonth: number;
  onPrev: () => void; onNext: () => void;
}) {
  const WEEKS = 16;
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  // Build a map of date -> game count (sessions per day)
  const countMap: Record<string, number> = {};
  for (const s of sessions) {
    countMap[s.date] = (countMap[s.date] || 0) + 1;
  }

  // DOW frequency (Mon=0 ... Sun=6)
  const dowCount = Array(7).fill(0);
  for (const s of sessions) {
    const d = new Date(s.date + 'T00:00:00');
    dowCount[(d.getDay() + 6) % 7]++;
  }
  const maxDow = Math.max(...dowCount, 1);

  // Build 16-week grid: col=0 is oldest, col=15 is most recent
  // row=0=Mon ... row=6=Sun
  const todayDow = (now.getDay() + 6) % 7; // Mon=0
  const getDateForCell = (col: number, row: number) => {
    const daysAgo = (WEEKS - 1 - col) * 7 + (todayDow - row);
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().slice(0, 10);
  };

  const heatColor = (count: number) => {
    if (count === 0) return 'var(--bar-i)';
    if (count <= 3) return 'color-mix(in srgb, var(--p) 22%, transparent)';
    if (count <= 5) return 'color-mix(in srgb, var(--p) 53%, transparent)';
    return 'var(--p)';
  };

  return (
    <div className={`${card.padded} mb-4`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-[var(--text-1)]">กิจกรรม</span>
        <div className="flex items-center gap-3">
          {([['2-3','22%'],['4-5','53%'],['6+','100%']] as [string,string][]).map(([label, opacity]) => (
            <div key={label} className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: `color-mix(in srgb, var(--p) ${opacity}, transparent)` }}/>
              <span className="text-[10px] text-[var(--text-4)] font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="flex gap-1">
        {/* DOW labels */}
        <div className="flex flex-col gap-[3px] pt-px flex-shrink-0">
          {DOW_LABELS_SHORT.map(d => (
            <div key={d} className="h-[14px] flex items-center justify-end text-[9px] font-semibold text-[var(--text-4)] w-4">{d}</div>
          ))}
        </div>
        {/* Week columns */}
        <div className="flex gap-[3px] flex-1">
          {Array.from({ length: WEEKS }, (_, col) => (
            <div key={col} className="flex flex-col gap-[3px] flex-1">
              {Array.from({ length: 7 }, (_, row) => {
                const dateStr = getDateForCell(col, row);
                const isFuture = dateStr > todayStr;
                const isToday = dateStr === todayStr;
                const count = countMap[dateStr] || 0;
                return (
                  <div key={row} className="h-[14px] rounded-[3px]"
                    style={{
                      background: isFuture ? 'transparent' : heatColor(count),
                      outline: isToday ? '1.5px solid var(--p)' : 'none',
                      outlineOffset: '1px',
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[var(--card-border)] my-3"/>

      {/* DOW frequency bars */}
      <div>
        <div className="text-[11px] font-semibold text-[var(--text-4)] mb-2">วันที่ตีบ่อย</div>
        <div className="flex gap-1.5 items-end">
          {DOW_LABELS_SHORT.map((d, i) => {
            const cnt = dowCount[i];
            const h = Math.max((cnt / maxDow) * 34, cnt > 0 ? 5 : 2);
            return (
              <div key={d} className="flex-1 flex flex-col items-center gap-[3px]">
                <div className="text-[9px] font-bold leading-none" style={{ color: cnt > 0 ? 'var(--text-2)' : 'transparent' }}>{cnt > 0 ? cnt : '-'}</div>
                <div className="w-full rounded-t-[3px]" style={{ height: h, backgroundColor: cnt > 0 ? 'var(--bar-a)' : 'var(--bar-i)' }}/>
                <span className="text-[11px] font-medium" style={{ color: cnt > 0 ? 'var(--text-3)' : 'var(--text-4)' }}>{d}</span>
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


function SessionRow({ session, courtName, groupName, onEdit, onDelete, onUpdateNote, onUpdatePhotos, onViewInfo }: {
  session: Session; courtName: string; groupName: string;
  onEdit: () => void; onDelete: () => void;
  onUpdateNote: (notes: string | undefined) => void;
  onUpdatePhotos: (images: string[]) => void;
  onViewInfo: () => void;
}) {
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(session.notes ?? '');
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Normalise: merge legacy `image` field into `images` array
  const photos: string[] = session.images ?? (session.image ? [session.image] : []);

  const commitNote = () => {
    setEditingNote(false);
    const trimmed = noteText.trim() || undefined;
    if (trimmed !== session.notes) onUpdateNote(trimmed);
  };
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const newImages: string[] = [];
    for (const file of files) {
      await new Promise<void>(resolve => {
        const reader = new FileReader();
        reader.onload = async ev => {
          const compressed = await uploadGroupImage('', '', ev.target?.result as string);
          newImages.push(compressed);
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }
    onUpdatePhotos([...photos, ...newImages]);
    e.target.value = '';
  };
  const deletePhoto = (idx: number) => {
    onUpdatePhotos(photos.filter((_, i) => i !== idx));
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

  const PHOTO_MAX = 3;
  const shownPhotos = photos.slice(0, PHOTO_MAX);
  const extraPhotos = photos.length - PHOTO_MAX;

  return (
    <div className="group bg-white border border-[var(--card-border)] rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.08),_0_8px_32px_rgba(0,0,0,0.05)] overflow-hidden transition-colors hover:border-[color-mix(in_srgb,var(--p)_35%,transparent)]">
      <div className="flex flex-col p-[18px]">
        {/* Header */}
        <div className="flex items-start gap-2.5">
          <div className={`w-11 h-11 rounded-[16px] flex items-center justify-center flex-shrink-0 text-[22px] select-none ${MOOD_BUBBLE[session.mood]}`}>
            {MOOD_EMOJIS[session.mood]}
          </div>
          <div className="min-w-0 flex-1">
            <button onClick={onViewInfo} className="font-bold text-[var(--text-1)] text-[15px] tracking-tight hover:underline hover:text-[var(--p)] transition-colors leading-snug">{groupName}</button>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-[var(--text-3)]">
              <button onClick={onViewInfo} className="hover:text-[var(--p)] transition-colors truncate">{courtName}</button>
              {session.intensity && (() => {
                const lvs = Array.isArray(session.intensity) ? session.intensity : [session.intensity];
                const ivColorMap: Record<string, string> = { light: '#16a34a', medium: '#ca8a04', heavy: '#ef4444' };
                return lvs.map(lv => (
                  <React.Fragment key={lv}>
                    <span className="text-[var(--text-4)]">·</span>
                    <span className="font-bold" style={{ color: ivColorMap[lv] }}>{INTENSITY_LABELS[lv]}</span>
                  </React.Fragment>
                ));
              })()}
            </div>
          </div>
          <div className="flex items-center gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button onClick={() => photoInputRef.current?.click()} title="เพิ่มรูป" className="text-[var(--text-4)] hover:text-[var(--p)] transition-colors p-1 rounded-lg hover:bg-[var(--chip-bg)]">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </button>
            <button onClick={onEdit} title="แก้ไข" className="text-[var(--text-4)] hover:text-[var(--p)] transition-colors p-1 rounded-lg hover:bg-[var(--chip-bg)]">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>
            </button>
          </div>
        </div>

        {/* Note */}
        {editingNote ? (
          <textarea autoFocus value={noteText} onChange={e => setNoteText(e.target.value)}
            onFocus={e => { const l = e.target.value.length; e.target.setSelectionRange(l, l); }}
            onBlur={commitNote}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitNote(); } if (e.key === 'Escape') { setNoteText(session.notes ?? ''); setEditingNote(false); } }}
            placeholder="เพิ่มโน้ต..." rows={2}
            className="mt-2.5 w-full text-sm text-[var(--text-2)] border border-[var(--input-b)] rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-[var(--input-f)]"
            style={{ backgroundColor: 'var(--app-bg)' }}
          />
        ) : session.notes ? (
          <button onClick={() => { setNoteText(session.notes ?? ''); setEditingNote(true); }} className="mt-2.5 w-full text-left">
            <p className="text-[13.5px] text-[var(--text-2)] leading-relaxed whitespace-pre-wrap">{session.notes}</p>
          </button>
        ) : (
          <button onClick={() => { setNoteText(''); setEditingNote(true); }}
            className="mt-2 w-full text-left text-sm text-[var(--text-3)] opacity-0 group-hover:opacity-60 transition-opacity">+ เพิ่มโน้ต...</button>
        )}

        {/* Photos row */}
        <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoChange} />
        {photos.length > 0 && (
          <div className="mt-2.5 flex gap-1.5">
            {shownPhotos.map((src, idx) => {
              const isOverflow = idx === PHOTO_MAX - 1 && extraPhotos > 0;
              return (
                <div key={idx} className="relative flex-1 rounded-xl overflow-hidden cursor-pointer" style={{ height: 92 }}
                  onClick={() => !isOverflow && setLightboxIdx(idx)}>
                  <img src={src} alt="" className="w-full h-full object-cover block" />
                  {isOverflow ? (
                    <div className="absolute inset-0 flex items-center justify-center text-white font-extrabold text-lg" style={{ background: 'rgba(15,23,42,.58)' }}>+{extraPhotos}</div>
                  ) : (
                    <button title="ลบรูป" onClick={e => { e.stopPropagation(); deletePhoto(idx); }}
                      className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'rgba(15,23,42,.65)' }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Meta footer */}
        {(hasTime || session.gamesPlayed > 0) && (
          <div className="mt-2.5 pt-2.5 border-t border-[var(--card-border)] flex items-center flex-wrap gap-x-2 gap-y-1 text-xs">
            {hasTime && <span className="tabular-nums text-[var(--text-3)] font-medium">{session.startTime} – {session.endTime}</span>}
            {hasTime && durLabel && metaDivider}
            {durLabel && <span className="font-bold tabular-nums text-[var(--text-2)]">{durLabel}</span>}
            {(hasTime || durLabel) && session.gamesPlayed > 0 && metaDivider}
            {session.gamesPlayed > 0 && <span className="font-bold tabular-nums text-[var(--text-2)]">{session.gamesPlayed} เกม</span>}
            {minPerGame && metaDivider}
            {minPerGame && <span className="tabular-nums text-[var(--text-3)]">{minPerGame} นาที/เกม</span>}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && photos[lightboxIdx] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setLightboxIdx(null)}
        >
          <img
            src={photos[lightboxIdx]}
            alt="session"
            className="max-w-[92vw] max-h-[88vh] rounded-2xl object-contain shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={() => setLightboxIdx(null)}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center text-lg hover:bg-white/30 transition-colors"
          >✕</button>
        </div>
      )}
    </div>
  );
}

function FeedList({ sessions, getCourtName, getGroupName, onEditSession, setConfirmDeleteId, onUpdateNote, onUpdatePhotos, onViewInfo }: {
  sessions: Session[];
  getCourtName: (id: string) => string;
  getGroupName: (courtId: string, groupId: string) => string;
  onEditSession: (s: Session) => void;
  setConfirmDeleteId: (id: string) => void;
  onUpdateNote: (id: string, notes: string | undefined) => void;
  onUpdatePhotos: (id: string, images: string[]) => void;
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
          <div className={`pb-3 ${gi > 0 ? 'pt-4' : 'pt-0'}`}>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--p)]"/>
              <span className="text-xs font-bold text-[var(--text-3)]">{g.label}</span>
            </div>
          </div>
          {/* Each session as its own feed card */}
          <div className="flex flex-col gap-2">
            {g.items.map(s => (
              <SessionRow key={s.id} session={s}
                courtName={getCourtName(s.courtId)} groupName={getGroupName(s.courtId, s.groupId)}
                onEdit={() => onEditSession(s)} onDelete={() => setConfirmDeleteId(s.id)}
                onUpdateNote={notes => onUpdateNote(s.id, notes)}
                onUpdatePhotos={images => onUpdatePhotos(s.id, images)}
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
    const lvs = Array.isArray(s.intensity) ? s.intensity : [s.intensity];
    gi[s.groupId].sum += lvs.reduce((acc, lv) => acc + INTENSITY_SCORE[lv], 0) / lvs.length;
    gi[s.groupId].count++;
    if (lvs.includes('heavy')) gi[s.groupId].heavy++;
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

export function SessionsView({ sessions, courts, justLogged, onLogSession, onDeleteSession, onEditSession, onUpdateNote, onUpdatePhotos, onNavigateToCourt }: SessionsViewProps) {
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
          <div className="relative rounded-3xl p-5 mb-4 text-white overflow-hidden shadow-xl" style={{background: 'linear-gradient(135deg, var(--hero-from) 0%, #0f172a 55%, var(--hero-to) 100%)'}}>
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
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center"><div className="text-xl font-black">{thisMonthDays}</div><div className="text-[10px] text-white/50 font-medium mt-0.5">วันตี</div></div>
                <div className="text-center"><div className="text-xl font-black">{thisMonthGames}</div><div className="text-[10px] text-white/50 font-medium mt-0.5">เกม</div></div>
                <div className="text-center"><div className="text-xl font-black">{avgGamesPerDay ?? '—'}</div><div className="text-[10px] text-white/50 font-medium mt-0.5">เกม/วัน</div></div>
                <div className="text-center"><div className="text-xl font-black">{avgDuration ?? '—'}</div><div className="text-[10px] text-white/50 font-medium mt-0.5">เฉลี่ย</div></div>
              </div>
            </div>
          </div>
          {sessions.length > 0 && (
            <ActivityCard sessions={sessions} viewYear={viewYear} viewMonth={viewMonth} onPrev={prevMonth} onNext={nextMonth} />
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
                  onEditSession={onEditSession} setConfirmDeleteId={setConfirmDeleteId} onUpdateNote={onUpdateNote} onUpdatePhotos={onUpdatePhotos} onViewInfo={setViewInfoSession} />
              )}
            </div>
          )}
        </div>


      </div>

      {/* ── Mobile: stacked ── */}
      <div className="sm:hidden">
        <div className="relative rounded-3xl p-5 mb-4 text-white overflow-hidden shadow-xl" style={{background: 'linear-gradient(135deg, var(--hero-from) 0%, #0f172a 55%, var(--hero-to) 100%)'}}>
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
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center"><div className="text-xl font-black">{thisMonthDays}</div><div className="text-[10px] text-white/50 font-medium mt-0.5">วันตี</div></div>
              <div className="text-center"><div className="text-xl font-black">{thisMonthGames}</div><div className="text-[10px] text-white/50 font-medium mt-0.5">เกม</div></div>
              <div className="text-center"><div className="text-xl font-black">{avgGamesPerDay ?? '—'}</div><div className="text-[10px] text-white/50 font-medium mt-0.5">เกม/วัน</div></div>
              <div className="text-center"><div className="text-xl font-black">{avgDuration ?? '—'}</div><div className="text-[10px] text-white/50 font-medium mt-0.5">เฉลี่ย</div></div>
            </div>
          </div>
        </div>
        {sessions.length > 0 && <ActivityCard sessions={sessions} viewYear={viewYear} viewMonth={viewMonth} onPrev={prevMonth} onNext={nextMonth} />}
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
                onEditSession={onEditSession} setConfirmDeleteId={setConfirmDeleteId} onUpdateNote={onUpdateNote} onUpdatePhotos={onUpdatePhotos} onViewInfo={setViewInfoSession} />
            )}
          </div>
        )}
      </div>

      {/* Group / Court info sheet */}
      {viewInfoSession && (() => {
        const court = courts.find(c => c.id === viewInfoSession.courtId);
        const group = court?.groups.find(g => g.id === viewInfoSession.groupId);
        if (!court || !group) return null;
        const groupSessions = sessions.filter(s => s.courtId === court.id && s.groupId === group.id);
        return (
          <GroupReviewModal
            group={group}
            court={court}
            sessions={groupSessions}
            onClose={() => setViewInfoSession(null)}
            onNavigateToCourt={() => { setViewInfoSession(null); onNavigateToCourt(court.id); }}
          />
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
