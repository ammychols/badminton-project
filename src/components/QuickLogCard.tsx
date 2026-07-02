import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Court, Group, Session, DayOfWeek, Intensity, ALL_INTENSITIES, INTENSITY_LABELS } from '../types';
import { todayString, DAY_NAMES } from '../utils/date';
import { computeGroupStats, moodLevel } from '../utils/groupStats';

// ── Exported types ──────────────────────────────────────────────────────────

export interface InlineLogData {
  courtId: string;
  groupId: string;
  date: string;
  startTime: string;
  endTime: string;
  gamesPlayed: number;
  mood: 1 | 2 | 3 | 4 | 5 | 6;
  intensity?: Intensity | Intensity[];
  cost?: number;
  notes?: string;
}

export interface TodayLock {
  courtId: string;
  groupId: string;
  date: string;
}

// ── Constants & helpers ─────────────────────────────────────────────────────

const DOW_MAP: DayOfWeek[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MOOD_EMOJIS: Record<number, string> = { 1: '😡', 2: '😴', 3: '😐', 4: '🙂', 5: '😄', 6: '🔥' };
const MOODS: (1 | 2 | 3 | 4 | 5 | 6)[] = [1, 2, 3, 4, 5, 6];

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

function padTime(h: number, m: number): string {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function bumpTime(t: string, deltaMin: number): string {
  const [h, m] = t.split(':').map(Number);
  const total = ((h * 60 + m + deltaMin) % (24 * 60) + 24 * 60) % (24 * 60);
  return padTime(Math.floor(total / 60), total % 60);
}

function defaultTimes(): { startTime: string; endTime: string } {
  const now = new Date();
  const totalMin = now.getHours() * 60 + now.getMinutes();
  const rounded = Math.round(totalMin / 15) * 15;
  const startH = Math.floor(rounded / 60) % 24;
  const startM = rounded % 60;
  const endTotal = (rounded + 120) % (24 * 60);
  return {
    startTime: padTime(startH, startM),
    endTime: padTime(Math.floor(endTotal / 60), endTotal % 60),
  };
}

// ── LockedGroupForm ─────────────────────────────────────────────────────────

function LockedGroupForm({ group, court, onUnlock, onSave }: {
  group: Group;
  court: Court;
  onUnlock: () => void;
  onSave: (data: InlineLogData) => void;
}) {
  const today = todayString();
  const tint = tintFor(group.id);
  const noTime = group.startTime === '00:00' && group.endTime === '00:00';
  const timeSubtitle = noTime ? court.name : `${court.name} · ${group.startTime}–${group.endTime}`;

  const { startTime: defStart, endTime: defEnd } = defaultTimes();
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5 | 6>(4);
  const [startTime, setStartTime] = useState(defStart);
  const [endTime, setEndTime] = useState(defEnd);
  const [intensities, setIntensities] = useState<Intensity[]>([]);
  const [cost, setCost] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState('');

  const toggleIntensity = (i: Intensity) =>
    setIntensities(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  const handleSave = () => {
    onSave({
      courtId: court.id,
      groupId: group.id,
      date: today,
      startTime,
      endTime,
      gamesPlayed,
      mood,
      intensity: intensities.length === 0 ? undefined : intensities.length === 1 ? intensities[0] : intensities,
      cost,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="bg-white rounded-[20px] border border-[var(--card-border)] shadow-[0_2px_12px_rgba(0,0,0,0.08),_0_8px_32px_rgba(0,0,0,0.05)] overflow-hidden mb-3">

      {/* Zone 1: Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div
          className="flex-shrink-0 w-12 h-12 rounded-[13px] flex items-center justify-center text-base font-bold overflow-hidden"
          style={{ backgroundColor: tint.bg, color: tint.fg }}
        >
          {(group.image?.startsWith('http') || group.image?.startsWith('data:'))
            ? <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
            : group.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-[var(--text-1)] truncate">{group.name}</p>
          <p className="text-[10px] text-[var(--text-3)] truncate">{timeSubtitle}</p>
        </div>
        <button
          onClick={onUnlock}
          className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold border border-[var(--card-border)] hover:border-[var(--p)] transition-colors"
          style={{ background: 'var(--hover-bg)', color: 'var(--text-2)' }}
        >
          เปลี่ยน
        </button>
      </div>

      <div className="px-4 pb-4 flex flex-col gap-4">

        {/* Zone 2: Hero — games + mood */}
        <div className="rounded-2xl p-4 flex flex-col gap-5" style={{ background: 'var(--hover-bg)' }}>

          {/* Games stepper */}
          <div>
            <p className="text-[11px] font-semibold text-[var(--text-3)] mb-3">ตีไปกี่เกม</p>
            <div className="flex items-center justify-center gap-5">
              <button
                onClick={() => setGamesPlayed(g => Math.max(0, g - 1))}
                className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold bg-white border border-[var(--card-border)] text-[var(--text-2)] active:bg-[var(--p-tint)] active:border-[var(--p)] transition-colors"
              >−</button>
              <span className="text-[40px] font-medium text-[var(--text-1)] w-14 text-center leading-none tabular-nums">
                {gamesPlayed}
              </span>
              <button
                onClick={() => setGamesPlayed(g => g + 1)}
                className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold bg-white border border-[var(--card-border)] text-[var(--text-2)] active:bg-[var(--p-tint)] active:border-[var(--p)] transition-colors"
              >+</button>
            </div>
          </div>

          {/* Mood picker */}
          <div>
            <p className="text-[11px] font-semibold text-[var(--text-3)] mb-3">วันนี้เป็นไงบ้าง</p>
            <div className="flex gap-1.5 px-1">
              {MOODS.map(m => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className="flex-1 aspect-square rounded-[13px] flex items-center justify-center text-xl transition-all"
                  style={mood === m ? {
                    background: 'var(--p-tint)',
                    border: '1.5px solid var(--p)',
                    transform: 'scale(1.07)',
                  } : {
                    background: 'white',
                    border: '1.5px solid transparent',
                  }}
                >
                  {MOOD_EMOJIS[m]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Zone 3: Details */}
        <div className="flex flex-col gap-[15px]">

          {/* Time */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-[12px] font-medium flex-shrink-0" style={{ color: 'var(--text-2)' }}>เวลา</span>
            <div className="flex items-center gap-2 rounded-xl px-3 py-1.5" style={{ background: 'var(--hover-bg)' }}>
              {([
                [startTime, setStartTime] as [string, React.Dispatch<React.SetStateAction<string>>],
                [endTime, setEndTime] as [string, React.Dispatch<React.SetStateAction<string>>],
              ]).map(([val, setter], idx) => (
                <React.Fragment key={idx}>
                  {idx === 1 && <span className="font-medium" style={{ color: 'var(--text-3)' }}>–</span>}
                  <div className="flex flex-col items-center">
                    <button onClick={() => setter(t => bumpTime(t, 15))} className="text-[10px] leading-none py-0.5 hover:text-[var(--p)]" style={{ color: 'var(--text-3)' }}>▲</button>
                    <span className="text-base font-medium min-w-[52px] text-center tabular-nums" style={{ color: 'var(--text-1)' }}>{val}</span>
                    <button onClick={() => setter(t => bumpTime(t, -15))} className="text-[10px] leading-none py-0.5 hover:text-[var(--p)]" style={{ color: 'var(--text-3)' }}>▼</button>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Intensity */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-[12px] font-medium flex-shrink-0" style={{ color: 'var(--text-2)' }}>ความหนัก</span>
            <div className="flex gap-1.5">
              {ALL_INTENSITIES.map(i => {
                const sel = intensities.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() => toggleIntensity(i)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                    style={sel ? {
                      background: 'var(--p-tint)',
                      color: 'var(--p-deep)',
                      border: '1.5px solid var(--p)',
                    } : {
                      background: 'var(--hover-bg)',
                      color: 'var(--text-3)',
                      border: '1.5px solid transparent',
                    }}
                  >
                    {INTENSITY_LABELS[i]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cost */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-[12px] font-medium flex-shrink-0" style={{ color: 'var(--text-2)' }}>ค่าตี</span>
            <div
              className="flex items-center rounded-xl border border-transparent focus-within:border-[var(--p)] focus-within:bg-white transition-colors overflow-hidden"
              style={{ background: 'var(--hover-bg)' }}
            >
              <span className="pl-3 pr-1 text-sm" style={{ color: 'var(--text-3)' }}>฿</span>
              <input
                type="number"
                min="0"
                placeholder="120"
                value={cost ?? ''}
                onChange={e => setCost(e.target.value === '' ? undefined : Number(e.target.value))}
                className="w-24 py-2 pr-3 text-sm bg-transparent focus:outline-none"
                style={{ color: 'var(--text-1)' }}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium" style={{ color: 'var(--text-2)' }}>โน้ต</span>
            <textarea
              rows={2}
              placeholder="บันทึกเพิ่มเติม..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-transparent focus:outline-none focus:border-[var(--p)] focus:bg-white resize-none transition-colors"
              style={{ background: 'var(--hover-bg)', color: 'var(--text-1)' }}
            />
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className="w-full py-3.5 rounded-2xl text-sm font-semibold transition-colors active:scale-[0.98]"
          style={{ background: 'var(--p)', color: 'var(--p-text)' }}
        >
          บันทึก
        </button>
      </div>
    </div>
  );
}

// ── QuickLogCard ────────────────────────────────────────────────────────────

interface QuickLogCardProps {
  courts: Court[];
  sessions: Session[];
  lock: TodayLock | null;
  onLockGroup: (courtId: string, groupId: string) => void;
  onUnlockGroup: () => void;
  onSaveInline: (data: InlineLogData) => void;
  onViewGroup: (courtId: string, groupId: string) => void;
  onOpenFullForm: () => void;
}

export function QuickLogCard({
  courts, sessions, lock,
  onLockGroup, onUnlockGroup, onSaveInline,
  onViewGroup, onOpenFullForm,
}: QuickLogCardProps) {
  const today = todayString();
  const dowIndex = new Date(today + 'T00:00:00').getDay();
  const dow = DOW_MAP[dowIndex];

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeDotIndex, setActiveDotIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setSelectedId(null);
    setActiveDotIndex(0);
  }, [candidates.map(c => c.group.id).join(',')]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.clientWidth / 2 + 10;
    const index = Math.round(el.scrollLeft / cardWidth);
    setActiveDotIndex(Math.max(0, Math.min(index, candidates.length - 1)));
  }, [candidates.length]);

  const lockedEntry = useMemo(() => {
    if (!lock || lock.date !== today) return null;
    const court = courts.find(c => c.id === lock.courtId);
    const group = court?.groups.find(g => g.id === lock.groupId);
    if (!court || !group) return null;
    return { court, group };
  }, [lock, today, courts]);

  const renderCard = (court: Court, group: Group, groupSessions: Session[]) => {
    const isSelected = selectedId === group.id;
    const stats = computeGroupStats(groupSessions);
    const tint = tintFor(group.id);
    const noTime = group.startTime === '00:00' && group.endTime === '00:00';
    const timeStr = noTime ? court.name : `${court.name} · ${group.startTime}–${group.endTime}`;

    const dash = <span style={{ color: 'var(--text-4)' }}>—</span>;
    const statRows: [React.ReactNode, string][] = [
      [stats.avgMinPerGame != null ? stats.avgMinPerGame : dash, 'นาที/เกม'],
      [stats.avgGames != null ? Math.round(stats.avgGames) : dash, 'เกม/ครั้ง'],
      [stats.avgMood != null ? MOOD_EMOJIS[moodLevel(stats.avgMood)] : dash, 'มู้ดเฉลี่ย'],
      [stats.avgCost != null ? `฿${stats.avgCost}` : dash, 'ต่อครั้ง'],
    ];

    return (
      <div
        role="button"
        tabIndex={0}
        aria-pressed={isSelected}
        onClick={() => setSelectedId(prev => prev === group.id ? null : group.id)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelectedId(prev => prev === group.id ? null : group.id); }}
        className="bg-white rounded-[18px] p-3 cursor-pointer flex flex-col active:scale-[0.985] transition-transform"
        style={isSelected
          ? {
              background: 'linear-gradient(180deg, var(--p-tint), #ffffff 60%)',
              border: '1.5px solid transparent',
              boxShadow: '0 0 0 1.5px var(--p), 0 12px 26px -12px rgba(47,191,127,0.5)',
            }
          : {
              border: '0.5px solid var(--card-border)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
            }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold overflow-hidden"
            style={{ backgroundColor: tint.bg, color: tint.fg, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}
          >
            {group.image
              ? <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
              : group.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-[var(--text-1)] truncate">{group.name}</p>
            <p className="text-[10px] text-[var(--text-3)] truncate">{timeStr}</p>
          </div>
        </div>

        {/* Hairline divider */}
        <div style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.06)', marginBottom: 12 }} />

        {/* 2×2 stat grid */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-3 mb-3">
          {statRows.map(([v, l]) => (
            <div key={l}>
              <div className="text-[15px] font-medium text-[var(--text-1)] leading-none">{v}</div>
              <div className="text-[10px] text-[var(--text-3)] mt-0.5">{l}</div>
            </div>
          ))}
        </div>

        {/* Last visit */}
        <p className="text-[10px]" style={{ color: 'var(--text-4)' }}>
          {lastVisitLabel(stats.lastVisitDate, today)}
        </p>
      </div>
    );
  };

  const renderConfirmButton = () => (
    <button
      aria-disabled={!selectedId}
      onClick={() => {
        if (!selectedId) return;
        const picked = candidates.find(c => c.group.id === selectedId);
        if (picked) onLockGroup(picked.court.id, picked.group.id);
      }}
      className="w-full py-3 rounded-2xl text-sm font-semibold mt-3 transition-colors"
      style={selectedId
        ? { background: 'var(--p)', color: 'var(--p-text)', cursor: 'pointer' }
        : { background: 'var(--hover-bg)', color: 'var(--text-3)', cursor: 'not-allowed' }}
    >
      เลือก
    </button>
  );

  if (!lockedEntry && candidates.length === 0) return null;

  return (
    <div className="mb-3">
      {/* Eyebrow */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--p)' }}>
          วันนี้ · {DAY_NAMES[dowIndex]}
        </span>
        <button onClick={onOpenFullForm} className="text-xs hover:text-[var(--text-2)] transition-colors" style={{ color: 'var(--text-3)' }}>
          บันทึกก๊วนอื่นๆ →
        </button>
      </div>

      {/* Locked form */}
      {lockedEntry && (
        <LockedGroupForm
          group={lockedEntry.group}
          court={lockedEntry.court}
          onUnlock={onUnlockGroup}
          onSave={onSaveInline}
        />
      )}

      {/* Single candidate */}
      {!lockedEntry && candidates.length === 1 && (() => {
        const { court, group, groupSessions } = candidates[0];
        return (
          <div className="flex flex-col gap-2.5">
            {renderCard(court, group, groupSessions)}
            {renderConfirmButton()}
          </div>
        );
      })()}

      {/* Multiple candidates — scrollable row */}
      {!lockedEntry && candidates.length >= 2 && (
        <div>
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="candidate-scroll flex gap-2.5 overflow-x-auto pb-1"
            style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {candidates.map(({ court, group, groupSessions }) => (
              <div
                key={group.id}
                style={{ flex: '0 0 min(calc(50vw - 22px), 296px)', scrollSnapAlign: 'start' }}
              >
                {renderCard(court, group, groupSessions)}
              </div>
            ))}
          </div>

          {candidates.length >= 3 && (
            <div className="flex justify-center gap-1 mt-2.5">
              {candidates.map((c, i) => (
                <div
                  key={c.group.id}
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    backgroundColor: i === activeDotIndex ? 'var(--p)' : '#d6d7da',
                    transition: 'background-color 0.2s',
                  }}
                />
              ))}
            </div>
          )}

          {renderConfirmButton()}
        </div>
      )}
    </div>
  );
}
