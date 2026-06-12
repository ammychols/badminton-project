import { useMemo, useState } from 'react';
import { Court, Group, Session, DayOfWeek } from '../types';
import { todayString, DAY_NAMES } from '../utils/date';
import { btn } from '../styles/tokens';

const DOW_MAP: DayOfWeek[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MOOD_EMOJIS: Record<number, string> = { 1: '😡', 2: '😴', 3: '😐', 4: '🙂', 5: '😄', 6: '🔥' };

interface QuickLogCardProps {
  courts: Court[];
  sessions: Session[];
  onQuickLog: (data: Omit<Session, 'id'>) => void;
  /** Opens the full LogSessionModal for detailed entry. */
  onOpenFullForm: () => void;
}

/**
 * The "confirm, don't ask" surface for the core loop.
 * Shows only when a group is scheduled today (per its `days`) and hasn't been
 * logged yet today — so it appears exactly when the user most likely just
 * played, prefilled with the group and their typical game count.
 *
 * Deliberately saves startTime/endTime as '00:00' (the app's "no time"
 * sentinel), matching the full form's default. The schedule time shown on the
 * card is informational only.
 */
export function QuickLogCard({ courts, sessions, onQuickLog, onOpenFullForm }: QuickLogCardProps) {
  const today = todayString();
  const dowIndex = new Date(today + 'T00:00:00').getDay();
  const dow = DOW_MAP[dowIndex];

  // Groups scheduled today that don't have a session logged today yet.
  const candidates = useMemo(() => {
    const list: { court: Court; group: Group }[] = [];
    for (const c of courts) {
      for (const g of c.groups) {
        if (!g.days.includes(dow)) continue;
        const alreadyLogged = sessions.some(s => s.groupId === g.id && s.date === today);
        if (!alreadyLogged) list.push({ court: c, group: g });
      }
    }
    return list;
  }, [courts, sessions, dow, today]);

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [games, setGames] = useState(0);
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5 | 6>(4);

  const active = candidates.find(x => x.group.id === selectedGroupId) ?? candidates[0];

  if (!active) return null;

  const scheduleTime = active.group.startTime && active.group.endTime
    ? `${active.group.startTime} – ${active.group.endTime}`
    : null;

  const handleSwitchGroup = (id: string) => {
    setSelectedGroupId(id);
    setGames(0);
  };

  const handleSave = () => {
    onQuickLog({
      courtId: active.court.id,
      groupId: active.group.id,
      date: today,
      startTime: '00:00',
      endTime: '00:00',
      gamesPlayed: games,
      mood,
      intensity: undefined,
      notes: undefined,
    });
    // Reset for the next candidate (this group disappears from the list).
    setSelectedGroupId(null);
    setGames(0);
    setMood(4);
  };

  return (
    <div className="bg-white border border-[var(--card-border)] rounded-2xl p-4 mb-3 shadow-[0_2px_12px_rgba(0,0,0,0.08),_0_8px_32px_rgba(0,0,0,0.05)]">
      {/* Eyebrow */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--p)' }}>
          วันนี้ · {DAY_NAMES[dowIndex]}
        </span>
        <button onClick={onOpenFullForm} className="text-xs text-[var(--text-3)] hover:text-[var(--text-2)] transition-colors">
          กรอกแบบละเอียด →
        </button>
      </div>

      {/* Group identity (+ switcher when multiple groups today) */}
      {candidates.length > 1 ? (
        <div className="flex gap-1.5 flex-wrap mb-1.5">
          {candidates.map(({ group }) => (
            <button
              key={group.id}
              onClick={() => handleSwitchGroup(group.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                group.id === active.group.id
                  ? 'bg-[var(--p)] text-white'
                  : 'bg-[var(--chip-bg)] text-[var(--text-2)] hover:bg-[var(--bar-i)]'
              }`}
            >
              {group.name}
            </button>
          ))}
        </div>
      ) : (
        <div className="font-bold text-[var(--text-1)] text-base leading-snug">ตี {active.group.name} วันนี้?</div>
      )}
      <div className="text-xs text-[var(--text-3)] mb-3">
        {active.court.name}
        {scheduleTime && <span> · {scheduleTime}</span>}
      </div>

      {/* Games + mood, one row each */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs font-medium text-[var(--text-3)] w-12 flex-shrink-0">เกม</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="ลดจำนวนเกม"
            onClick={() => setGames(g => Math.max(0, g - 1))}
            className="w-9 h-9 rounded-full bg-[var(--chip-bg)] text-[var(--text-2)] text-xl font-bold hover:bg-[var(--bar-i)] flex items-center justify-center"
          >−</button>
          <span className="text-2xl font-black text-[var(--text-1)] tabular-nums w-10 text-center">{games}</span>
          <button
            type="button"
            aria-label="เพิ่มจำนวนเกม"
            onClick={() => setGames(g => g + 1)}
            className="w-9 h-9 rounded-full bg-[var(--chip-bg)] text-[var(--text-2)] text-xl font-bold hover:bg-[var(--bar-i)] flex items-center justify-center"
          >+</button>
        </div>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs font-medium text-[var(--text-3)] w-12 flex-shrink-0">อารมณ์</span>
        <div className="flex gap-1.5 flex-1">
          {([1, 2, 3, 4, 5, 6] as const).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setMood(m)}
              aria-label={`อารมณ์ระดับ ${m}`}
              className={`flex-1 py-1.5 rounded-xl text-xl transition-all ${
                mood === m ? 'bg-[var(--p)] scale-105' : 'bg-[var(--chip-bg)] opacity-50 hover:opacity-80'
              }`}
            >
              {MOOD_EMOJIS[m]}
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleSave} className={`${btn.primaryLg} w-full`}>
        บันทึกเลย
      </button>
    </div>
  );
}
