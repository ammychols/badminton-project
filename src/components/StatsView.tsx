import React, { useState } from 'react';
import { Session } from '../types';
import { HeroCard } from './HeroCard';
import { card, text } from '../styles/tokens';
import { MONTH_SHORT, DOW_LABELS_SHORT, todayString, toDateString, calcStreak } from '../utils/date';

function ActivityCard({ sessions, viewYear, viewMonth, onPrev, onNext }: {
  sessions: { date: string; gamesPlayed: number }[];
  viewYear: number; viewMonth: number;
  onPrev: () => void; onNext: () => void;
}) {
  const WEEKS = 16;
  const todayStr = todayString();
  const now = new Date(todayStr + 'T00:00:00');

  const countMap: Record<string, number> = {};
  for (const s of sessions) {
    countMap[s.date] = (countMap[s.date] || 0) + s.gamesPlayed;
  }

  const dowCount = Array(7).fill(0);
  for (const s of sessions) {
    const d = new Date(s.date + 'T00:00:00');
    dowCount[(d.getDay() + 6) % 7] += 1;
  }
  const maxDow = Math.max(...dowCount, 1);

  const todayDow = (now.getDay() + 6) % 7;
  const getDateForCell = (col: number, row: number) => {
    const daysAgo = (WEEKS - 1 - col) * 7 + (todayDow - row);
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    return toDateString(d);
  };

  const heatColor = (games: number) => {
    if (games === 0) return 'var(--bar-i)';
    if (games <= 3) return 'color-mix(in srgb, var(--p) 22%, transparent)';
    if (games <= 5) return 'color-mix(in srgb, var(--p) 53%, transparent)';
    return 'var(--p)';
  };

  return (
    <div className={`${card.padded} mb-4`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-[var(--text-1)]">กิจกรรม</span>
        <div className="flex items-center gap-3">
          {([['1-3', '22%'], ['4-5', '53%'], ['6+', '100%']] as [string, string][]).map(([label, opacity]) => (
            <div key={label} className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: `color-mix(in srgb, var(--p) ${opacity}, transparent)` }} />
              <span className="text-[10px] text-[var(--text-4)] font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-1">
        <div className="flex flex-col gap-[3px] pt-px flex-shrink-0">
          {DOW_LABELS_SHORT.map(d => (
            <div key={d} className="h-[14px] flex items-center justify-end text-[9px] font-semibold text-[var(--text-4)] w-4">{d}</div>
          ))}
        </div>
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

      <div className="border-t border-[var(--card-border)] my-3" />

      <div>
        <div className="text-[11px] font-semibold text-[var(--text-4)] mb-2">วันที่ตีบ่อย</div>
        <div className="flex gap-1.5 items-end">
          {DOW_LABELS_SHORT.map((d, i) => {
            const cnt = dowCount[i];
            const h = Math.max((cnt / maxDow) * 40, cnt > 0 ? 6 : 2);
            return (
              <div key={d} className="flex-1 flex flex-col items-center gap-0.5">
                {cnt > 0 && <span className="text-[9px] font-bold tabular-nums" style={{ color: 'var(--p)' }}>{cnt}</span>}
                <div className="w-full rounded-t-[3px]" style={{ height: h, backgroundColor: cnt > 0 ? 'var(--p)' : 'var(--bar-i)' }} />
                <span className="text-[9px] text-[var(--text-4)] font-medium">{d}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function StatsView({ sessions }: { sessions: Session[] }) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentYM = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

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

  const sparkMonths = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const games = sessions.filter(s => s.date.startsWith(ym)).length;
    return { label: MONTH_SHORT[d.getMonth()], games, isCurrent: i === 5 };
  });
  const maxSparkGames = Math.max(...sparkMonths.map(m => m.games), 1);

  const thisMonthSessions = sessions.filter(s => s.date.startsWith(currentYM));
  const thisMonthDays = new Set(thisMonthSessions.map(s => s.date)).size;
  const thisMonthGames = thisMonthSessions.reduce((sum, s) => sum + s.gamesPlayed, 0);
  const avgGamesPerDay = thisMonthDays > 0 ? (thisMonthGames / thisMonthDays).toFixed(1) : null;
  const streak = calcStreak(sessions);
  const totalSessions = sessions.length;

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
    <div className="max-w-screen-sm mx-auto px-3 pt-5 pb-10">
      <div className="mb-5">
        <h2 className={text.pageTitle}>สถิติ</h2>
      </div>
      <HeroCard
        clipId="rh-stats"
        totalSessions={totalSessions}
        streak={streak}
        sparkMonths={sparkMonths}
        maxSparkGames={maxSparkGames}
        thisMonthGames={thisMonthGames}
        avgGamesPerDay={avgGamesPerDay}
        avgDuration={avgDuration}
      />
      {sessions.length > 0
        ? <ActivityCard sessions={sessions} viewYear={viewYear} viewMonth={viewMonth} onPrev={prevMonth} onNext={nextMonth} />
        : <p className="text-sm text-[var(--text-3)] text-center py-6">ยังไม่มีข้อมูล</p>
      }
    </div>
  );
}
