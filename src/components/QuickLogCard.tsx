import { useMemo } from 'react';
import { Court, Group, Session, DayOfWeek } from '../types';
import { todayString, DAY_NAMES } from '../utils/date';
import { computeGroupStats, moodLevel } from '../utils/groupStats';

const DOW_MAP: DayOfWeek[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MOOD_EMOJIS: Record<number, string> = { 1: '😡', 2: '😴', 3: '😐', 4: '🙂', 5: '😄', 6: '🔥' };

const AVATAR_TINTS = [
  { bg: '#E6F1FB', fg: '#185FA5' },
  { bg: '#FAEEDA', fg: '#854F0B' },
  { bg: '#EEEDFE', fg: '#534AB7' },
  { bg: '#FAECE7', fg: '#993C1D' },
  { bg: '#FBEAF0', fg: '#993556' },
];

function tintFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_TINTS[h % AVATAR_TINTS.length];
}

function daysDiff(laterDate: string, earlierDate: string): number {
  return Math.round(
    (new Date(laterDate + 'T00:00:00').getTime() - new Date(earlierDate + 'T00:00:00').getTime()) / 86400000
  );
}

function lastVisitLabel(lastVisitDate: string | null, today: string): string {
  if (!lastVisitDate) return 'ยังไม่เคยไป';
  const diff = daysDiff(today, lastVisitDate);
  if (diff === 0) return 'ไปวันนี้';
  if (diff === 1) return 'ไปเมื่อวาน';
  return `ไปล่าสุด ${diff} วันที่แล้ว`;
}

interface QuickLogCardProps {
  courts: Court[];
  sessions: Session[];
  onLogGroup: (courtId: string, groupId: string) => void;
  onViewGroup: (courtId: string, groupId: string) => void;
  onOpenFullForm: () => void;
}

export function QuickLogCard({ courts, sessions, onLogGroup, onViewGroup, onOpenFullForm }: QuickLogCardProps) {
  const today = todayString();
  const dowIndex = new Date(today + 'T00:00:00').getDay();
  const dow = DOW_MAP[dowIndex];

  const candidates = useMemo(() => {
    const list: { court: Court; group: Group; groupSessions: Session[] }[] = [];
    for (const c of courts) {
      for (const g of c.groups) {
        if (!g.days.includes(dow)) continue;
        const alreadyLogged = sessions.some(s => s.groupId === g.id && s.date === today);
        if (alreadyLogged) continue;
        const groupSessions = sessions.filter(s => s.groupId === g.id);
        list.push({ court: c, group: g, groupSessions });
      }
    }
    return list;
  }, [courts, sessions, dow, today]);

  if (candidates.length === 0) return null;

  return (
    <div className="bg-white border border-[var(--card-border)] rounded-2xl p-4 mb-3 shadow-[0_2px_12px_rgba(0,0,0,0.08),_0_8px_32px_rgba(0,0,0,0.05)]">
      {/* Eyebrow */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--p)' }}>
          วันนี้ · {DAY_NAMES[dowIndex]}
        </span>
        <button onClick={onOpenFullForm} className="text-xs text-[var(--text-3)] hover:text-[var(--text-2)] transition-colors">
          บันทึกก๊วนอื่นๆ →
        </button>
      </div>

      {/* Cards */}
      <div className={candidates.length === 1 ? 'flex flex-col gap-2' : 'grid grid-cols-2 gap-2'}>
        {candidates.map(({ court, group, groupSessions }) => {
          const stats = computeGroupStats(groupSessions);
          const tint = tintFor(group.id);
          const noTime = group.startTime === '00:00' && group.endTime === '00:00';
          const timeStr = noTime ? court.name : `${court.name} · ${group.startTime}–${group.endTime}`;

          return (
            <div
              key={group.id}
              onClick={() => onViewGroup(court.id, group.id)}
              className="border border-[var(--card-border)] rounded-2xl p-3 cursor-pointer hover:bg-[var(--hover-bg)] transition-colors active:scale-[0.98] flex flex-col"
            >
              {/* Avatar + name */}
              <div className="flex items-center gap-2.5 mb-2.5">
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden"
                  style={{ backgroundColor: tint.bg, color: tint.fg }}
                >
                  {group.image
                    ? <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
                    : group.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-1)] truncate">{group.name}</p>
                  <p className="text-[11px] text-[var(--text-3)] truncate">{timeStr}</p>
                </div>
              </div>

              {/* Stats strip */}
              {stats.count > 0 ? (
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mb-2.5">
                  {([
                    [stats.avgMinPerGame ?? '—', 'นาที/เกม'],
                    [stats.avgGames != null ? Math.round(stats.avgGames) : '—', 'เกม/ครั้ง'],
                    [stats.avgMood != null ? MOOD_EMOJIS[moodLevel(stats.avgMood)] : '—', 'มู้ด'],
                    [stats.avgCost != null ? `฿${stats.avgCost}` : '—', 'ต่อครั้ง'],
                  ] as [React.ReactNode, string][]).map(([v, l]) => (
                    <div key={l} className="flex items-baseline gap-1">
                      <span className="text-sm font-bold text-[var(--text-1)]">{v}</span>
                      <span className="text-[10px] text-[var(--text-3)]">{l}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-[var(--text-3)] mb-2.5 leading-relaxed">
                  ยังไม่มีข้อมูล
                </p>
              )}

              {/* Last visit — only when there's history */}
              {stats.count > 0 && (
                <p className="text-[11px] text-[var(--text-4)] mb-2.5">
                  {lastVisitLabel(stats.lastVisitDate, today)}
                </p>
              )}

              {/* Log button */}
              <button
                onClick={e => { e.stopPropagation(); onLogGroup(court.id, group.id); }}
                className="mt-auto w-full py-2 rounded-xl text-sm font-semibold transition-colors bg-[var(--p)] text-[var(--p-text)] hover:bg-[var(--p-h)]"
              >
                บันทึก
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
