import React from 'react';
import { Court, Session } from '../types';

interface SessionsViewProps {
  sessions: Session[];
  courts: Court[];
  onLogSession: () => void;
  onDeleteSession: (id: string) => void;
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

function buildHeatmap(sessions: { date: string }[], weeks = 18) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // start from Sunday of (weeks) weeks ago
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - today.getDay() - (weeks - 1) * 7);

  const countMap: Record<string, number> = {};
  sessions.forEach(s => { countMap[s.date] = (countMap[s.date] ?? 0) + 1; });

  const cols: { date: string; count: number; month: number; day: number }[][] = [];
  for (let w = 0; w < weeks; w++) {
    const col: { date: string; count: number; month: number; day: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const dt = new Date(startDate);
      dt.setDate(startDate.getDate() + w * 7 + d);
      const dateStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
      col.push({ date: dateStr, count: countMap[dateStr] ?? 0, month: dt.getMonth(), day: dt.getDate() });
    }
    cols.push(col);
  }
  return { cols, startDate };
}

function cellColor(count: number) {
  if (count === 0) return 'bg-gray-100';
  if (count === 1) return 'bg-green-200';
  if (count === 2) return 'bg-green-400';
  return 'bg-green-600';
}

function Heatmap({ sessions }: { sessions: { date: string }[] }) {
  const { cols } = buildHeatmap(sessions, 18);
  // collect month labels: first col of each month
  const monthLabels: { col: number; label: string }[] = [];
  let lastMonth = -1;
  cols.forEach((col, ci) => {
    const m = col[0].month;
    if (m !== lastMonth) { monthLabels.push({ col: ci, label: MONTH_SHORT[m] }); lastMonth = m; }
  });

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
      <div className="text-sm font-medium text-gray-700 mb-3">กิจกรรม</div>
      <div className="overflow-x-auto">
        <div style={{ display: 'inline-block', minWidth: 'max-content' }}>
          {/* Month labels */}
          <div className="flex mb-1" style={{ paddingLeft: '20px' }}>
            {cols.map((_, ci) => {
              const label = monthLabels.find(m => m.col === ci);
              return (
                <div key={ci} className="text-xs text-gray-400" style={{ width: '14px', marginRight: '2px', whiteSpace: 'nowrap' }}>
                  {label ? label.label : ''}
                </div>
              );
            })}
          </div>
          <div className="flex gap-0.5">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 mr-1">
              {['', 'จ', '', 'พ', '', 'ศ', ''].map((l, i) => (
                <div key={i} className="text-xs text-gray-400 flex items-center justify-end" style={{ height: '12px', width: '16px', fontSize: '9px' }}>{l}</div>
              ))}
            </div>
            {cols.map((col, ci) => (
              <div key={ci} className="flex flex-col gap-0.5">
                {col.map(cell => (
                  <div
                    key={cell.date}
                    title={`${cell.date}: ${cell.count} ครั้ง`}
                    className={`rounded-sm ${cellColor(cell.count)}`}
                    style={{ width: '12px', height: '12px' }}
                  />
                ))}
              </div>
            ))}
          </div>
          {/* Legend */}
          <div className="flex items-center gap-1 mt-2 justify-end">
            <span className="text-xs text-gray-400">น้อย</span>
            {['bg-gray-100', 'bg-green-200', 'bg-green-400', 'bg-green-600'].map(c => (
              <div key={c} className={`rounded-sm ${c}`} style={{ width: '12px', height: '12px' }} />
            ))}
            <span className="text-xs text-gray-400">มาก</span>
          </div>
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

export function SessionsView({ sessions, courts, onLogSession, onDeleteSession }: SessionsViewProps) {
  const today = todayString();
  const thisMonth = thisMonthString();

  const totalSessions = sessions.length;
  const totalGames = sessions.reduce((sum, s) => sum + s.gamesPlayed, 0);
  const thisMonthSessions = sessions.filter(s => s.date.startsWith(thisMonth)).length;
  const hasSessionToday = sessions.some(s => s.date === today);

  const getCourtName = (courtId: string) => courts.find(c => c.id === courtId)?.name ?? 'ไม่พบสนาม';
  const getGroupName = (courtId: string, groupId: string) =>
    courts.find(c => c.id === courtId)?.groups.find(g => g.id === groupId)?.name ?? 'ไม่พบก๊วน';

  return (
    <div className="max-w-screen-sm mx-auto px-4 py-6">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">บันทึกการตี</h2>
        <button
          onClick={onLogSession}
          className="bg-gray-900 text-white px-4 py-2 rounded-2xl text-sm font-medium hover:bg-gray-700 transition-colors flex items-center gap-1.5"
        >
          <span className="text-lg leading-none">+</span> บันทึก
        </button>
      </div>

      {/* No-session-today reminder */}
      {!hasSessionToday && sessions.length > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-2.5 mb-4 flex items-center gap-2 text-sm text-amber-700">
          <span>🏸</span>
          <span>วันนี้ยังไม่ได้บันทึก</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="bg-white rounded-2xl p-3 text-center border border-gray-100">
          <div className="text-2xl font-bold text-gray-900">{totalSessions}</div>
          <div className="text-xs text-gray-400 mt-0.5">ครั้งทั้งหมด</div>
        </div>
        <div className="bg-white rounded-2xl p-3 text-center border border-gray-100">
          <div className="text-2xl font-bold text-gray-900">{totalGames}</div>
          <div className="text-xs text-gray-400 mt-0.5">เกมทั้งหมด</div>
        </div>
        <div className="bg-white rounded-2xl p-3 text-center border border-gray-100">
          <div className="text-2xl font-bold text-gray-900">{thisMonthSessions}</div>
          <div className="text-xs text-gray-400 mt-0.5">เดือนนี้</div>
        </div>
      </div>

      {/* Heatmap */}
      {sessions.length > 0 && <Heatmap sessions={sessions} />}

      {/* Session list */}
      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-3xl mb-4">🏸</div>
          <div className="text-base font-semibold text-gray-700 mb-1">ยังไม่มีบันทึก</div>
          <div className="text-sm text-gray-400">กด "+ บันทึก" เพื่อเริ่มต้น</div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sessions.map(session => {
            const { day, full } = formatDate(session.date);
            return (
              <div
                key={session.id}
                className="bg-white border border-gray-100 rounded-2xl px-4 py-3.5 flex gap-3 items-start"
              >
                {/* Mood pill */}
                <div className="text-2xl leading-none mt-0.5 select-none">{MOOD_EMOJIS[session.mood]}</div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-gray-800 text-sm leading-snug">{full} <span className="font-normal text-gray-400">วัน{day}</span></div>
                      <div className="text-sm text-gray-700 mt-0.5">
                        {getCourtName(session.courtId)}
                        <span className="text-gray-300 mx-1.5">·</span>
                        <span className="text-gray-500">{getGroupName(session.courtId, session.groupId)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteSession(session.id)}
                      className="text-gray-200 hover:text-red-400 transition-colors flex-shrink-0 p-1 -mt-0.5 -mr-1"
                      title="ลบ"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-400">
                    <span>{session.startTime} – {session.endTime}</span>
                    <span className="text-gray-200">·</span>
                    <span>{session.gamesPlayed} เกม</span>
                  </div>

                  {session.notes && (
                    <div className="mt-1.5 text-xs text-gray-500">{session.notes}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
