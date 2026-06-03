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
  1: '😴',
  2: '😐',
  3: '🙂',
  4: '😄',
  5: '🔥',
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
      <div className="text-sm font-semibold text-gray-800 mb-4">สถิติรายเดือน</div>

      {/* Monthly bars */}
      <div className="flex items-end gap-1.5 mb-5">
        {monthStats.map(({ label, count, ym }) => {
          const isCurrent = ym === currentYM;
          const heightPct = Math.max((count / maxMonth) * 80, count > 0 ? 8 : 3);
          return (
            <div key={ym} className="flex-1 flex flex-col items-center gap-1">
              <div className="text-xs font-semibold text-gray-700">{count > 0 ? count : ''}</div>
              <div className="w-full flex items-end" style={{ height: '80px' }}>
                <div className={`w-full rounded-t-xl transition-all ${isCurrent ? 'bg-gray-900' : 'bg-gray-100'}`} style={{ height: `${heightPct}px` }} />
              </div>
              <div className={`text-xs ${isCurrent ? 'font-bold text-gray-900' : 'text-gray-400'}`}>{label}</div>
            </div>
          );
        })}
      </div>

      {/* Calendar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onPrev} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors text-lg">‹</button>
          <span className="text-sm font-semibold text-gray-700">{MONTH_SHORT[viewMonth]} {viewYear + 543}</span>
          <button onClick={onNext} disabled={isNextDisabled}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors text-lg disabled:opacity-20 disabled:cursor-default">›</button>
        </div>
        <div className="grid grid-cols-7 mb-1">
          {DOW_LABELS.map(d => (
            <div key={d} className="text-center text-xs text-gray-400 py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {Array(firstDow).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
            const isToday = isViewingCurrentMonth && d === now.getDate();
            const hasSession = sessionDays.has(d);
            return (
              <div key={d} className={`aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all ${
                hasSession ? 'bg-gray-900 text-white' : isToday ? 'text-gray-800' : 'text-gray-300'
              }`}>
                {d}
                {isToday && <span className={`w-1 h-1 rounded-full mt-0.5 ${hasSession ? 'bg-white/60' : 'bg-gray-900'}`} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* DOW frequency */}
      <div>
        <div className="text-xs font-medium text-gray-500 mb-2">วันที่ตีบ่อย</div>
        <div className="flex gap-1.5 items-end">
          {DOW_LABELS.map((label, i) => {
            const count = dowCount[i];
            const heightPct = Math.max((count / maxDow) * 40, count > 0 ? 4 : 2);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                <div className="text-xs font-semibold text-gray-600" style={{ minHeight: '16px' }}>{count > 0 ? count : ''}</div>
                <div className="w-full flex items-end" style={{ height: '40px' }}>
                  <div className="w-full rounded-t-lg bg-emerald-400" style={{ height: `${heightPct}px`, opacity: count > 0 ? 1 : 0.15 }} />
                </div>
                <div className="text-xs text-gray-400">{label}</div>
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

const MOOD_ACCENT: Record<number, string> = {
  1: 'bg-slate-300',
  2: 'bg-blue-400',
  3: 'bg-amber-400',
  4: 'bg-emerald-400',
  5: 'bg-orange-500',
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

function SessionCard({ session, courtName, groupName, dateLabel, onEdit, onDelete, onUpdateNote }: {
  session: Session; courtName: string; groupName: string; dateLabel: string;
  onEdit: () => void; onDelete: () => void; onUpdateNote: (notes: string | undefined) => void;
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
    <div className={`${card.base} overflow-hidden flex`}>
      <div className={`w-1.5 flex-shrink-0 rounded-l-2xl ${MOOD_ACCENT[session.mood]}`} />
      <div className="flex-1 px-4 py-3.5 min-w-0 flex flex-col gap-2">
        {/* Main row */}
        <div className="flex items-start gap-3">
          {/* Left: emoji + info */}
          <div className="flex gap-3 items-start flex-1 min-w-0 cursor-pointer" onClick={onEdit}>
            <div className="text-2xl leading-none mt-0.5 select-none">{MOOD_EMOJIS[session.mood]}</div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-gray-900 leading-snug">{courtName}</div>
              <div className="text-xs text-gray-400 mt-0.5">{groupName} · {dateLabel}</div>
            </div>
          </div>
          {/* Right: time stats */}
          <div className="flex-shrink-0 text-right flex flex-col items-end gap-0.5 cursor-pointer" onClick={onEdit}>
            {hasTime && (
              <div className="text-sm font-medium text-gray-700 tabular-nums">{session.startTime} – {session.endTime}</div>
            )}
            {durLabel && (
              <div className="text-xs text-gray-400">{durLabel}</div>
            )}
            {session.gamesPlayed > 0 && (
              <div className="text-xs text-gray-400">{session.gamesPlayed} เกม</div>
            )}
          </div>
          {/* Delete */}
          <button onClick={onDelete} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 p-1 -mt-0.5 -mr-1 self-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        {/* Inline note */}
        <div className="border-t border-gray-100 pt-2">
          {editingNote ? (
            <textarea autoFocus value={noteText} onChange={e => setNoteText(e.target.value)} onFocus={e => { const l = e.target.value.length; e.target.setSelectionRange(l, l); }}
              onBlur={commitNote}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitNote(); } if (e.key === 'Escape') { setNoteText(session.notes ?? ''); setEditingNote(false); } }}
              placeholder="เพิ่มโน้ต..." rows={2}
              className="w-full text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
          ) : (
            <button onClick={() => { setNoteText(session.notes ?? ''); setEditingNote(true); }} className="w-full text-left">
              {session.notes
                ? <p className="text-xs text-gray-500 leading-relaxed hover:text-gray-700 transition-colors">{session.notes}</p>
                : <p className="text-xs text-gray-300 hover:text-gray-400 transition-colors">+ เพิ่มโน้ต</p>
              }
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function SessionsView({ sessions, courts, onLogSession, onDeleteSession, onEditSession, onUpdateNote }: SessionsViewProps) {
  const today = todayString();
  const thisMonth = thisMonthString();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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
  const viewedSessions = sessions.filter(s => s.date.startsWith(viewYM));

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

  const getCourtName = (courtId: string) => courts.find(c => c.id === courtId)?.name ?? 'ไม่พบสนาม';
  const getGroupName = (courtId: string, groupId: string) =>
    courts.find(c => c.id === courtId)?.groups.find(g => g.id === groupId)?.name ?? 'ไม่พบก๊วน';

  return (
    <div className="max-w-screen-sm mx-auto px-4 pt-5 pb-10 sm:max-w-screen-2xl sm:px-10">
      {/* Header */}
      <div className="flex items-center mb-5">
        <h2 className={text.pageTitle}>บันทึกการตี</h2>
      </div>

      <div className="sm:flex sm:gap-6 sm:items-start">
        {/* Left column: stats + calendar */}
        <div className="sm:w-80 sm:flex-shrink-0 sm:sticky sm:top-4">
          {/* Hero stats */}
          <div className="relative rounded-3xl p-5 mb-4 text-white overflow-hidden" style={{background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #533483 100%)'}}>
            <div className="absolute inset-0 opacity-30" style={{background: 'radial-gradient(ellipse at 20% 80%, #f97316 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, #8b5cf6 0%, transparent 50%)'}} />
            <div className="relative z-10 flex items-end justify-between mb-4">
              <div>
                <div className="text-xs text-white/60 mb-0.5">ตีไปทั้งหมด</div>
                <div className="flex items-end gap-1.5 leading-none">
                  <span className="text-5xl font-black">{totalGames}</span>
                  <span className="text-lg text-gray-400 mb-1">เกม</span>
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
              <div>
                <div className="text-2xl font-bold">{thisMonthDays}</div>
                <div className="text-xs text-gray-400">วันที่ตีเดือนนี้</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{thisMonthGames}</div>
                <div className="text-xs text-gray-400">เกมเดือนนี้</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{avgGamesPerDay ?? '—'}</div>
                <div className="text-xs text-gray-400">เกม/วัน</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{avgDuration ?? '—'}</div>
                <div className="text-xs text-gray-400">เฉลี่ย/ครั้ง</div>
              </div>
            </div>
          </div>

          {/* Today nudge */}
          {!hasSessionToday && sessions.length > 0 && (
            <button onClick={onLogSession} className="w-full bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 mb-4 flex items-center gap-3 text-left hover:bg-amber-100 transition-colors">
              <span className="text-xl">🏸</span>
              <div className="flex-1">
                <div className="text-sm font-medium text-amber-800">วันนี้ยังไม่ได้ตี</div>
                <div className="text-xs text-amber-600">กดบันทึกเลย</div>
              </div>
              <span className="text-amber-400 text-lg">›</span>
            </button>
          )}

          {/* Heatmap */}
          {sessions.length > 0 && <Heatmap sessions={sessions} viewYear={viewYear} viewMonth={viewMonth} onPrev={prevMonth} onNext={nextMonth} />}
        </div>

        {/* Right column: session list */}
        <div className="sm:flex-1 sm:min-w-0">
          {sessions.length === 0 ? (
            <div className={emptyState.wrapper}>
              <div className={emptyState.icon}>🏸</div>
              <div className={emptyState.title}>เริ่มบันทึกการตีแบด</div>
              <div className={emptyState.subtitle}>ติดตามพัฒนาการและสถิติของคุณ</div>
              <button onClick={onLogSession} className={btn.primaryLg}>
                + บันทึกครั้งแรก
              </button>
            </div>
          ) : (
          <div className="flex flex-col gap-2">
            <button
              onClick={onLogSession}
              className="w-full py-3.5 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 text-sm font-medium hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <span className="text-lg leading-none">+</span> บันทึกการตี
            </button>
            {viewedSessions.length === 0 && (
              <div className="text-center text-sm text-gray-400 py-8">ไม่มีบันทึกในเดือนนี้</div>
            )}
            {[...viewedSessions].sort((a, b) => b.date.localeCompare(a.date)).map(session => {
              const { day, full } = formatDate(session.date);
              return (
                <SessionCard
                  key={session.id}
                  session={session}
                  courtName={getCourtName(session.courtId)}
                  groupName={getGroupName(session.courtId, session.groupId)}
                  dateLabel={`วัน${day} ${full}`}
                  onEdit={() => onEditSession(session)}
                  onDelete={() => setConfirmDeleteId(session.id)}
                  onUpdateNote={notes => onUpdateNote(session.id, notes)}
                />
              );
            })}
          </div>
          )}
        </div>{/* end right col */}
      </div>{/* end sm:flex */}

      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center sm:items-center" onClick={() => setConfirmDeleteId(null)}>
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
            <p className="text-base font-semibold text-gray-800 mb-1">ลบบันทึก</p>
            <p className="text-sm text-gray-400 mb-5">ลบรายการนี้ออกจากประวัติ?</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">ยกเลิก</button>
              <button onClick={() => { onDeleteSession(confirmDeleteId); setConfirmDeleteId(null); }} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">ลบ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
