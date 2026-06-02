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
          className="bg-green-600 text-white px-4 py-2 rounded-2xl text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-1"
        >
          <span className="text-base">+</span> บันทึกการตี
        </button>
      </div>

      {/* No-session-today reminder */}
      {!hasSessionToday && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2.5 mb-4 flex items-center gap-2 text-sm text-amber-700">
          <span>🏸</span>
          <span>วันนี้ยังไม่ได้บันทึก ตีแบดวันนี้มั้ย?</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-green-700">{totalSessions}</div>
          <div className="text-xs text-gray-500 mt-0.5">ครั้งทั้งหมด</div>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-blue-600">{totalGames}</div>
          <div className="text-xs text-gray-500 mt-0.5">เกมทั้งหมด</div>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-purple-600">{thisMonthSessions}</div>
          <div className="text-xs text-gray-500 mt-0.5">เดือนนี้</div>
        </div>
      </div>

      {/* Session list */}
      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-6xl mb-4">🏸</div>
          <div className="text-lg font-bold text-gray-700 mb-1">ยังไม่มีบันทึก</div>
          <div className="text-sm text-gray-400">กด "+ บันทึกการตี" เพื่อเริ่มต้น!</div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map(session => {
            const { day, full } = formatDate(session.date);
            return (
              <div
                key={session.id}
                className={`${MOOD_BG[session.mood]} border ${MOOD_BORDER[session.mood]} rounded-2xl p-4 flex gap-3 items-start`}
              >
                {/* Mood accent */}
                <div className="text-4xl leading-none pt-1 select-none">{MOOD_EMOJIS[session.mood]}</div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-gray-800 text-base leading-tight">{full}</div>
                      <div className="text-xs text-gray-500 mt-0.5">วัน{day}</div>
                    </div>
                    <button
                      onClick={() => onDeleteSession(session.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 p-1 -mt-1 -mr-1"
                      title="ลบ"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-600">
                    <span className="font-medium">{getCourtName(session.courtId)}</span>
                    <span className="text-gray-400">·</span>
                    <span>{getGroupName(session.courtId, session.groupId)}</span>
                  </div>

                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-500">
                    <span>{session.startTime} – {session.endTime}</span>
                    <span className="text-gray-400">·</span>
                    <span>{session.gamesPlayed} เกม</span>
                  </div>

                  {session.notes && (
                    <div className="mt-2 text-sm text-gray-600 italic">"{session.notes}"</div>
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
