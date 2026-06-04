import React, { useState } from 'react';
import { Court, Session } from '../types';
import { btn, card, text, emptyState } from '../styles/tokens';

interface SessionsViewProps {
  sessions: Session[];
  courts: Court[];
  onLogSession: () => void;
  onDeleteSession: (id: string) => void;
  onEditSession: (session: Session) => void;
  onUpdateNote: (id: string, notes: string | undefined) => void;
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

function SessionRow({ session, courtName, groupName, onEdit, onDelete, onUpdateNote, isLast }: {
  session: Session; courtName: string; groupName: string;
  onEdit: () => void; onDelete: () => void; onUpdateNote: (notes: string | undefined) => void;
  isLast: boolean;
}) {
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(session.notes ?? '');
  const commitNote = () => {
    setEditingNote(false);
    const trimmed = noteText.trim() || undefined;
    if (trimmed !== session.notes) onUpdateNote(trimmed);
  };
  const [sh, sm] = session.startTime.split(':').map(Number);
  const [eh, em] = session.endTime.split(':').map(Number);
  const start = sh * 60 + sm;
  const end = eh * 60 + em;
  const durMin = (() => { if (start === 0 && end === 0) return 0; let d = end - start; if (d <= 0) d += 24 * 60; return (d > 0 && d < 24 * 60) ? d : 0; })();
  const durLabel = durMin > 0 ? (Math.floor(durMin / 60) > 0 ? `${Math.floor(durMin / 60)}ชม.` : '') + (durMin % 60 > 0 ? `${durMin % 60}น.` : '') : null;
  const hasTime = !(start === 0 && end === 0);

  return (
    <div className={`flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--hover-bg)] transition-colors group${isLast ? '' : ' border-b border-[var(--card-border)]'}`}>
      {/* Mood avatar */}
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl select-none ${MOOD_BUBBLE[session.mood]}`}>
        {MOOD_EMOJIS[session.mood]}
      </div>
      {/* Info */}
      <div className="min-w-0 w-52 flex-shrink-0 cursor-pointer" onClick={onEdit}>
        <div className="text-sm leading-snug truncate">
          <span className="font-semibold text-[var(--text-1)]">{groupName}</span>
          <span className="text-[var(--text-3)] font-normal"> · {courtName}</span>
        </div>
        <div className="text-xs text-[var(--text-3)] mt-0.5 truncate">
          {hasTime ? `${session.startTime} – ${session.endTime}` : '—'}
        </div>
        {session.notes && (
          <div className="sm:hidden text-xs text-[var(--text-4)] mt-0.5 truncate italic">{session.notes}</div>
        )}
      </div>
      {/* Note — desktop */}
      <div className="hidden sm:block flex-1 min-w-0">
        {editingNote ? (
          <textarea autoFocus value={noteText} onChange={e => setNoteText(e.target.value)}
            onFocus={e => { const l = e.target.value.length; e.target.setSelectionRange(l, l); }}
            onBlur={commitNote}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitNote(); } if (e.key === 'Escape') { setNoteText(session.notes ?? ''); setEditingNote(false); } }}
            placeholder="+ โน้ต..." rows={1}
            className="w-full text-xs text-[var(--text-2)] border border-[var(--input-b)] rounded-lg px-2.5 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-[var(--input-f)]"
            style={{ backgroundColor: 'var(--app-bg)' }}
          />
        ) : (
          <button onClick={() => { setNoteText(session.notes ?? ''); setEditingNote(true); }}
            className="w-full text-left px-2 py-1 rounded-lg hover:bg-[var(--chip-bg)] transition-colors">
            {session.notes
              ? <p className="text-xs text-[var(--text-4)] leading-snug truncate">{session.notes}</p>
              : <p className="text-xs text-[var(--dashed)] opacity-0 group-hover:opacity-100 transition-opacity">+ โน้ต</p>
            }
          </button>
        )}
      </div>
      {/* Duration + games */}
      {(durLabel || session.gamesPlayed > 0) && (
        <div className="flex-shrink-0 text-right cursor-pointer" onClick={onEdit}>
          {durLabel && <div className="text-sm font-bold text-[var(--text-1)] tabular-nums leading-tight">{durLabel}</div>}
          {session.gamesPlayed > 0 && <div className="text-xs text-[var(--text-3)] mt-0.5">{session.gamesPlayed} เกม</div>}
        </div>
      )}
      {/* Delete */}
      <button onClick={onDelete} className="text-[var(--dashed)] hover:text-red-400 transition-colors flex-shrink-0 p-1 -mr-1 opacity-0 group-hover:opacity-100">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}

function FeedList({ sessions, getCourtName, getGroupName, onEditSession, setConfirmDeleteId, onUpdateNote }: {
  sessions: Session[];
  getCourtName: (id: string) => string;
  getGroupName: (courtId: string, groupId: string) => string;
  onEditSession: (s: Session) => void;
  setConfirmDeleteId: (id: string) => void;
  onUpdateNote: (id: string, notes: string | undefined) => void;
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
          <div className={`px-1 pb-1.5 ${gi > 0 ? 'pt-4' : 'pt-0'}`}>
            <span className="text-xs font-semibold text-[var(--text-3)]">{g.label}</span>
          </div>
          {/* Session rows as individual cards */}
          <div className={`${card.base} overflow-hidden`}>
            {g.items.map((s, si) => (
              <SessionRow key={s.id} session={s}
                courtName={getCourtName(s.courtId)} groupName={getGroupName(s.courtId, s.groupId)}
                onEdit={() => onEditSession(s)} onDelete={() => setConfirmDeleteId(s.id)}
                onUpdateNote={notes => onUpdateNote(s.id, notes)}
                isLast={si === g.items.length - 1}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SessionsView({ sessions, courts, onLogSession, onDeleteSession, onEditSession, onUpdateNote }: SessionsViewProps) {
  const today = todayString();
  const thisMonth = thisMonthString();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

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
  // Desktop list: show all sessions (not month-filtered), search still works
  const allViewedSessions = sessions.filter(s => {
    if (!q) return true;
    return getCourtName(s.courtId).toLowerCase().includes(q) || getGroupName(s.courtId, s.groupId).toLowerCase().includes(q);
  });

  const totalSessions = sessions.length;
  const totalGames = sessions.reduce((sum, s) => sum + s.gamesPlayed, 0);
  const thisMonthSessions = sessions.filter(s => s.date.startsWith(thisMonth));
  const thisMonthDays = new Set(thisMonthSessions.map(s => s.date)).size;
  const thisMonthGames = thisMonthSessions.reduce((sum, s) => sum + s.gamesPlayed, 0);
  const avgGamesPerDay = thisMonthDays > 0 ? (thisMonthGames / thisMonthDays).toFixed(1) : null;
  const hasSessionToday = sessions.some(s => s.date === today);
  const streak = calcStreak(sessions);

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
      <div className="flex items-center mb-5">
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
            <div className="relative z-10 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
              <div><div className="text-2xl font-bold">{thisMonthDays}</div><div className="text-xs text-white/60">วันที่ตีเดือนนี้</div></div>
              <div><div className="text-2xl font-bold">{thisMonthGames}</div><div className="text-xs text-white/60">เกมเดือนนี้</div></div>
              <div><div className="text-2xl font-bold">{avgGamesPerDay ?? '—'}</div><div className="text-xs text-white/60">เกม/วัน</div></div>
              <div><div className="text-2xl font-bold">{avgDuration ?? '—'}</div><div className="text-xs text-white/60">เฉลี่ย/ครั้ง</div></div>
            </div>
          </div>
          {sessions.length > 0 && (
            <Heatmap sessions={sessions} viewYear={viewYear} viewMonth={viewMonth} onPrev={prevMonth} onNext={nextMonth} />
          )}
        </div>

        {/* Col 3: Session feed */}
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
              <button onClick={onLogSession}
                className="w-full py-3.5 rounded-2xl border-2 border-dashed border-[var(--dashed)] text-[var(--text-3)] text-sm font-medium hover:border-[var(--p)] hover:text-[var(--p)] transition-colors flex items-center justify-center gap-2">
                <span className="text-lg leading-none">+</span> บันทึกการตี
              </button>
              {viewedSessions.length === 0 && (
                <div className="text-center text-sm text-[var(--text-3)] py-8">{search ? `ไม่พบ "${search}"` : 'ไม่มีบันทึกในเดือนนี้'}</div>
              )}
              {viewedSessions.length > 0 && (
                <FeedList sessions={viewedSessions} getCourtName={getCourtName} getGroupName={getGroupName}
                  onEditSession={onEditSession} setConfirmDeleteId={setConfirmDeleteId} onUpdateNote={onUpdateNote} />
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
          <div className="relative z-10 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
            <div><div className="text-2xl font-bold">{thisMonthDays}</div><div className="text-xs text-white/60">วันที่ตีเดือนนี้</div></div>
            <div><div className="text-2xl font-bold">{thisMonthGames}</div><div className="text-xs text-white/60">เกมเดือนนี้</div></div>
            <div><div className="text-2xl font-bold">{avgGamesPerDay ?? '—'}</div><div className="text-xs text-white/60">เกม/วัน</div></div>
            <div><div className="text-2xl font-bold">{avgDuration ?? '—'}</div><div className="text-xs text-white/60">เฉลี่ย/ครั้ง</div></div>
          </div>
        </div>
        {!hasSessionToday && sessions.length > 0 && (
          <button onClick={onLogSession} className="w-full bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 mb-4 flex items-center gap-3 text-left hover:bg-amber-100 transition-colors">
            <span className="text-xl">🏸</span>
            <div className="flex-1"><div className="text-sm font-medium text-amber-800">วันนี้ยังไม่ได้ตี</div><div className="text-xs text-amber-600">กดบันทึกเลย</div></div>
            <span className="text-amber-400 text-lg">›</span>
          </button>
        )}
        {sessions.length > 0 && <Heatmap sessions={sessions} viewYear={viewYear} viewMonth={viewMonth} onPrev={prevMonth} onNext={nextMonth} />}
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
            <button onClick={onLogSession}
              className="w-full py-3.5 rounded-2xl border-2 border-dashed border-[var(--dashed)] text-[var(--text-3)] text-sm font-medium hover:border-[var(--p)] hover:text-[var(--p)] transition-colors flex items-center justify-center gap-2">
              <span className="text-lg leading-none">+</span> บันทึกการตี
            </button>
            {viewedSessions.length === 0 && (
              <div className="text-center text-sm text-[var(--text-3)] py-8">{search ? `ไม่พบ "${search}"` : 'ไม่มีบันทึกในเดือนนี้'}</div>
            )}
            {viewedSessions.length > 0 && (
              <FeedList sessions={viewedSessions} getCourtName={getCourtName} getGroupName={getGroupName}
                onEditSession={onEditSession} setConfirmDeleteId={setConfirmDeleteId} onUpdateNote={onUpdateNote} />
            )}
          </div>
        )}
      </div>

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
