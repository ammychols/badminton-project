import React, { useState } from 'react';
import { Court, Session } from '../types';
import { btn, card, text, emptyState } from '../styles/tokens';

interface SessionsViewProps {
  sessions: Session[];
  courts: Court[];
  onLogSession: () => void;
  onDeleteSession: (id: string) => void;
  onEditSession: (session: Session) => void;
}

const MOOD_EMOJIS: Record<number, string> = {
  1: '😴',
  2: '😐',
  3: '🙂',
  4: '😄',
  5: '🔥',
};

const MOOD_BG: Record<number, string> = {
  1: 'bg-gray-50',
  2: 'bg-blue-50',
  3: 'bg-yellow-50',
  4: 'bg-green-50',
  5: 'bg-orange-50',
};

const MOOD_BORDER: Record<number, string> = {
  1: 'border-gray-200',
  2: 'border-blue-100',
  3: 'border-yellow-100',
  4: 'border-green-100',
  5: 'border-orange-200',
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
          const heightPct = Math.max((count / maxMonth) * 64, count > 0 ? 8 : 4);
          return (
            <div key={ym} className="flex-1 flex flex-col items-center gap-1">
              <div className="text-xs font-semibold text-gray-700">{count > 0 ? count : ''}</div>
              <div className="w-full flex items-end" style={{ height: '64px' }}>
                <div
                  className={`w-full rounded-t-lg transition-all ${isCurrent ? 'bg-gray-900' : 'bg-gray-200'}`}
                  style={{ height: `${heightPct}px` }}
                />
              </div>
              <div className={`text-xs ${isCurrent ? 'font-semibold text-gray-900' : 'text-gray-400'}`}>{label}</div>
            </div>
          );
        })}
      </div>

      {/* Calendar with month nav */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <button onClick={onPrev} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors text-lg leading-none">‹</button>
          <span className="text-xs font-medium text-gray-600">{MONTH_SHORT[viewMonth]} {viewYear + 543} — วันที่ตี</span>
          <button onClick={onNext} disabled={isNextDisabled}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors text-lg leading-none disabled:opacity-20 disabled:cursor-default">›</button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {DOW_LABELS.map(d => (
            <div key={d} className="text-center text-xs text-gray-300 pb-1">{d}</div>
          ))}
          {Array(firstDow).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
            const isToday = isViewingCurrentMonth && d === now.getDate();
            const hasSession = sessionDays.has(d);
            return (
              <div key={d} className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-medium transition-all ${
                hasSession ? 'bg-gray-900 text-white' : isToday ? 'text-gray-800' : 'text-gray-300'
              }`}>
                {d}
                {isToday && <span className={`w-1 h-1 rounded-full mt-0.5 ${hasSession ? 'bg-white/60' : 'bg-gray-900'}`} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Day of week frequency */}
      <div>
        <div className="text-xs font-medium text-gray-500 mb-2">วันที่ตีบ่อย</div>
        <div className="flex gap-1.5 items-end">
          {DOW_LABELS.map((label, i) => {
            const count = dowCount[i];
            const heightPct = Math.max((count / maxDow) * 32, count > 0 ? 4 : 2);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                <div className="text-xs font-semibold text-gray-600" style={{ minHeight: '16px' }}>
                  {count > 0 ? count : ''}
                </div>
                <div className="w-full flex items-end" style={{ height: '32px' }}>
                  <div className="w-full rounded-t-md bg-green-400" style={{ height: `${heightPct}px`, opacity: count > 0 ? 1 : 0.2 }} />
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
  1: 'bg-gray-400',
  2: 'bg-blue-400',
  3: 'bg-yellow-400',
  4: 'bg-green-400',
  5: 'bg-orange-400',
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

export function SessionsView({ sessions, courts, onLogSession, onDeleteSession, onEditSession }: SessionsViewProps) {
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
      <div className="flex items-center justify-between mb-5">
        <h2 className={text.pageTitle}>บันทึกการตี</h2>
        <button
          onClick={onLogSession}
          className={btn.primaryIcon}
        >
          <span className="text-lg leading-none">+</span> บันทึก
        </button>
      </div>

      {/* Hero stats */}
      <div className="bg-gray-900 rounded-3xl p-5 mb-4 text-white">
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="text-xs text-gray-400 mb-0.5">ตีไปทั้งหมด</div>
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
        <div className="flex gap-4 border-t border-white/10 pt-4">
          <div>
            <div className="text-2xl font-bold">{thisMonthDays}</div>
            <div className="text-xs text-gray-400">วันที่ตีเดือนนี้</div>
          </div>
          <div className="w-px bg-white/10" />
          <div>
            <div className="text-2xl font-bold">{thisMonthGames}</div>
            <div className="text-xs text-gray-400">เกมเดือนนี้</div>
          </div>
          <div className="w-px bg-white/10" />
          <div>
            <div className="text-2xl font-bold">{avgGamesPerDay ?? '—'}</div>
            <div className="text-xs text-gray-400">เกม/วัน</div>
          </div>
          <div className="w-px bg-white/10" />
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

      {/* Session list */}
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
          {viewedSessions.length === 0 && (
            <div className="text-center text-sm text-gray-400 py-8">ไม่มีบันทึกในเดือนนี้</div>
          )}
          {viewedSessions.map(session => {
            const { day, full } = formatDate(session.date);
            return (
              <div
                key={session.id}
                onClick={() => onEditSession(session)}
                className={`${card.base} overflow-hidden flex cursor-pointer active:scale-[0.99] transition-transform`}
              >
                {/* Mood accent bar */}
                <div className={`w-1 flex-shrink-0 ${MOOD_ACCENT[session.mood]}`} />

                <div className="flex-1 px-4 py-3.5 flex gap-3 items-start min-w-0">
                  <div className="text-2xl leading-none mt-0.5 select-none">{MOOD_EMOJIS[session.mood]}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-gray-900 leading-snug">
                          {getCourtName(session.courtId)}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {getGroupName(session.courtId, session.groupId)} · วัน{day} {full}
                        </div>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); setConfirmDeleteId(session.id); }}
                        className="text-gray-200 hover:text-red-400 transition-colors flex-shrink-0 p-1 -mt-0.5 -mr-1"
                        title="ลบ"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">
                        {session.startTime} – {session.endTime}
                      </span>
                      {session.gamesPlayed > 0 && (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">
                          {session.gamesPlayed} เกม
                        </span>
                      )}
                    </div>

                    {session.notes && (
                      <div className="mt-2 text-xs text-gray-500 leading-relaxed">{session.notes}</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
