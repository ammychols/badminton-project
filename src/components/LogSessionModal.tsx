import React, { useState, useRef } from 'react';
import { Court, Session, DayOfWeek, Intensity, ALL_INTENSITIES, INTENSITY_LABELS, INTENSITY_EMOJIS } from '../types';
import { BottomSheet } from './BottomSheet';
import { text, input } from '../styles/tokens';
import { todayString, formatDate } from '../utils/date';

interface LogSessionModalProps {
  courts: Court[];
  onClose: () => void;
  onSave: (data: Omit<Session, 'id'>) => void;
  initialSession?: Session;
}

const MOOD_EMOJIS: Record<number, string> = { 1: '😡', 2: '😴', 3: '😐', 4: '🙂', 5: '😄', 6: '🔥' };
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];
const DOW = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
const MONTH_LABELS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function TimePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [h, m] = value.split(':');
  const nearestMin = MINUTES.reduce((prev, cur) =>
    Math.abs(parseInt(cur) - parseInt(m)) < Math.abs(parseInt(prev) - parseInt(m)) ? cur : prev
  );
  return (
    <div className="flex gap-1 items-center">
      <select value={h} onChange={e => onChange(`${e.target.value}:${m}`)} className={input.timeSelect}>
        {HOURS.map(hh => <option key={hh} value={hh}>{hh}</option>)}
      </select>
      <span className="text-gray-400 font-medium">:</span>
      <select value={nearestMin} onChange={e => onChange(`${h}:${e.target.value}`)} className={input.timeSelect}>
        {MINUTES.map(mm => <option key={mm} value={mm}>{mm}</option>)}
      </select>
    </div>
  );
}

function MiniCalendar({ selected, onChange }: { selected: string; onChange: (d: string) => void }) {
  const today = new Date();
  const selDate = new Date(selected + 'T00:00:00');
  const [viewYear, setViewYear] = useState(selDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selDate.getMonth());

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const todayStr = todayString();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    const now = new Date();
    if (viewYear > now.getFullYear() || (viewYear === now.getFullYear() && viewMonth >= now.getMonth())) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const isNextDisabled = viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth >= today.getMonth());

  return (
    <div className="select-none">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--hover-bg)] text-[var(--text-4)] transition-colors text-lg">‹</button>
        <span className="text-sm font-semibold text-[var(--text-1)]">{MONTH_LABELS[viewMonth]} {viewYear + 543}</span>
        <button onClick={nextMonth} disabled={isNextDisabled}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--hover-bg)] text-[var(--text-4)] transition-colors text-lg disabled:opacity-20 disabled:cursor-default">›</button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DOW.map(d => (
          <div key={d} className="text-center text-xs text-[var(--text-3)] py-1">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {Array(firstDow).fill(null).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
          const dateStr = toDateStr(viewYear, viewMonth, d);
          const isSel = dateStr === selected;
          const isToday = dateStr === todayStr;
          const isFuture = dateStr > todayStr;
          return (
            <button
              key={d}
              disabled={isFuture}
              onClick={() => onChange(dateStr)}
              className="aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all mx-0.5"
              style={{
                backgroundColor: isSel ? 'var(--cal-sel)' : undefined,
                color: isSel ? 'white' : isFuture ? 'var(--dashed)' : 'var(--text-2)',
                cursor: isFuture ? 'default' : undefined,
              }}
              onMouseEnter={e => { if (!isSel && !isFuture) e.currentTarget.style.backgroundColor = 'var(--hover-bg)'; }}
              onMouseLeave={e => { if (!isSel) e.currentTarget.style.backgroundColor = ''; }}
            >
              {d}
              {isToday && (
                <span className="w-1 h-1 rounded-full mt-0.5" style={{ backgroundColor: isSel ? 'rgba(255,255,255,0.6)' : 'var(--cal-sel)' }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NoteField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const commit = () => setEditing(false);
  if (editing) {
    return (
      <div className="mb-2">
        <textarea
          ref={ref}
          autoFocus
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={e => { const l = e.target.value.length; e.target.setSelectionRange(l, l); }}
          onBlur={commit}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commit(); } if (e.key === 'Escape') commit(); }}
          placeholder="เช่น วันนี้เล่นดีมาก!"
          rows={2}
          className="w-full text-sm text-[var(--text-2)] border border-[var(--input-b)] rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-[var(--input-f)]"
          style={{ backgroundColor: 'var(--app-bg)' }}
        />
      </div>
    );
  }
  return (
    <button type="button" onClick={() => setEditing(true)} className="w-full text-left mb-2 px-3 py-2.5 rounded-xl border border-dashed border-[var(--dashed)] hover:border-[var(--p)] transition-colors">
      {value
        ? <p className="text-sm text-[var(--text-2)] leading-relaxed">{value}</p>
        : <p className="text-sm text-[var(--text-3)]">+ เพิ่มโน้ต...</p>
      }
    </button>
  );
}

function defaultTimes() {
  return { start: '00:00', end: '00:00' };
}

export function LogSessionModal({ courts, onClose, onSave, initialSession }: LogSessionModalProps) {
  const { start: defaultStart, end: defaultEnd } = defaultTimes();
  const DOW_MAP: DayOfWeek[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const initDate = initialSession?.date ?? todayString();
  const initDow = DOW_MAP[new Date(initDate + 'T00:00:00').getDay()];
  const defaultCourt = courts.find(c => c.groups.some(g => g.days.includes(initDow)));
  const defaultGroup = defaultCourt?.groups.find(g => g.days.includes(initDow));

  const [date, setDate] = useState(initDate);
  const [courtId, setCourtId] = useState(initialSession?.courtId ?? defaultCourt?.id ?? '');
  const [groupId, setGroupId] = useState(initialSession?.groupId ?? defaultGroup?.id ?? '');
  const [startTime, setStartTime] = useState(initialSession?.startTime ?? defaultStart);
  const [endTime, setEndTime] = useState(initialSession?.endTime ?? defaultEnd);
  const [gamesPlayed, setGamesPlayed] = useState(initialSession?.gamesPlayed ?? 0);
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5 | 6>(initialSession?.mood ?? 3);
  const [intensities, setIntensities] = useState<Intensity[]>(
    initialSession?.intensity ? (Array.isArray(initialSession.intensity) ? initialSession.intensity : [initialSession.intensity]) : []
  );
  const [cost, setCost] = useState<number | undefined>(initialSession?.cost);
  const [notes, setNotes] = useState(initialSession?.notes ?? '');
  const [calendarOpen, setCalendarOpen] = useState(false);

  const { day, full } = formatDate(date);
  const isToday = date === todayString();

  const selectedDow = DOW_MAP[new Date(date + 'T00:00:00').getDay()];

  const filteredCourts = courts.filter(c => c.groups.some(g => g.days.includes(selectedDow)));
  const noCourtsToday = filteredCourts.length === 0;

  const selectedCourt = courts.find(c => c.id === courtId);
  const allGroups = selectedCourt?.groups ?? [];
  const filteredGroups = allGroups.filter(g => g.days.includes(selectedDow));
  const noGroupsToday = !noCourtsToday && filteredGroups.length === 0;

  const handleCourtChange = (id: string) => {
    setCourtId(id);
    const court = courts.find(c => c.id === id);
    const g = court?.groups.filter(g => g.days.includes(selectedDow)) ?? [];
    setGroupId(g[0]?.id ?? '');
  };

  const handleDateChange = (d: string) => {
    setDate(d);
    const dow = DOW_MAP[new Date(d + 'T00:00:00').getDay()];
    const filtered = courts.filter(c => c.groups.some(g => g.days.includes(dow)));
    const newCourt = filtered[0];
    setCourtId(newCourt?.id ?? '');
    setGroupId(newCourt?.groups.filter(g => g.days.includes(dow))[0]?.id ?? '');
  };

  const handleSave = () => {
    if (!courtId || !groupId || noCourtsToday || noGroupsToday) return;
    onClose();
    const intensity = intensities.length === 0 ? undefined : intensities.length === 1 ? intensities[0] : intensities;
    onSave({ courtId, groupId, date, startTime, endTime, gamesPlayed, mood, intensity, cost, notes: notes.trim() || undefined });
  };

  const saveButton = (
    <button onClick={handleSave} disabled={!courtId || !groupId || noCourtsToday || noGroupsToday}
      className="w-full bg-[var(--p)] text-[var(--p-text)] py-3 rounded-2xl font-medium hover:bg-[var(--p-h)] disabled:opacity-40 transition-colors">
      บันทึก
    </button>
  );

  return (
    <BottomSheet title={initialSession ? 'แก้ไขบันทึก' : 'บันทึกการตี'} onClose={onClose} footer={saveButton}>
      {/* Date — แถบยุบ กดเพอกางปฏิทิน */}
      <div className="mb-4">
        <label className={text.label}>วันที่</label>
        <button
          type="button"
          onClick={() => setCalendarOpen(v => !v)}
          aria-expanded={calendarOpen}
          className="w-full flex items-center justify-between border border-[var(--input-b)] rounded-xl px-3 py-2 text-base bg-white focus:outline-none focus:ring-2 focus:ring-[var(--input-f)]"
        >
          <span className="text-[var(--text-1)]">
            {isToday ? 'วันนี้' : `วัน${day}`} · {full}
          </span>
          <svg
            className={`w-4 h-4 transition-transform ${calendarOpen ? 'rotate-180' : ''}`}
            style={{ color: 'var(--text-3)' }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {calendarOpen && (
          <div className="rounded-2xl p-3 mt-2 border border-[var(--input-b)]" style={{ backgroundColor: 'var(--app-bg)' }}>
            <MiniCalendar
              selected={date}
              onChange={d => { handleDateChange(d); setCalendarOpen(false); }}
            />
          </div>
        )}
      </div>

      {/* Court + Group */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className={text.label}>สนาม</label>
          <select
            value={courtId}
            onChange={e => handleCourtChange(e.target.value)}
            disabled={noCourtsToday}
            className={`${input.base} disabled:opacity-50`}
            style={{ '--disabled-bg': 'var(--app-bg)' } as React.CSSProperties}
          >
            {noCourtsToday
              ? <option value="">ไม่มีก๊วนเปิดวันนี้</option>
              : filteredCourts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
            }
          </select>
        </div>
        <div>
          <label className={text.label}>ก๊วน</label>
          <select
            value={groupId}
            onChange={e => setGroupId(e.target.value)}
            disabled={noCourtsToday || noGroupsToday}
            className={`${input.base} disabled:opacity-50`}
          >
            {noCourtsToday || noGroupsToday
              ? <option value="">ไม่มีก๊วนเปิดวันนี้</option>
              : filteredGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)
            }
          </select>
        </div>
      </div>

      {/* Time + Games */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <label className={text.label}>เริ่ม</label>
          <TimePicker value={startTime} onChange={setStartTime} />
        </div>
        <div>
          <label className={text.label}>เลิก</label>
          <TimePicker value={endTime} onChange={setEndTime} />
        </div>
        <div>
          <label className={text.label}>เกม</label>
          <div className="flex items-center gap-1.5 h-[42px]">
            <button type="button" onClick={() => setGamesPlayed(g => Math.max(0, g - 1))}
              className="w-8 h-8 rounded-full bg-[var(--chip-bg)] text-[var(--text-2)] text-lg font-bold hover:bg-[var(--bar-i)] flex items-center justify-center flex-shrink-0">−</button>
            <span className="text-lg font-bold text-[var(--text-1)] flex-1 text-center">{gamesPlayed}</span>
            <button type="button" onClick={() => setGamesPlayed(g => g + 1)}
              className="w-8 h-8 rounded-full bg-[var(--chip-bg)] text-[var(--text-2)] text-lg font-bold hover:bg-[var(--bar-i)] flex items-center justify-center flex-shrink-0">+</button>
          </div>
        </div>
      </div>

      {/* Mood */}
      <div className="mb-4">
        <label className={text.label}>อารมณ์</label>
        <div className="flex gap-2">
          {([1, 2, 3, 4, 5, 6] as const).map(m => (
            <button key={m} type="button" onClick={() => setMood(m)}
              className={`flex-1 py-2 rounded-2xl text-2xl transition-all ${mood === m ? 'bg-[var(--p-tint)] scale-105 shadow-[0_0_0_2px_var(--p)]' : 'bg-[var(--chip-bg)] opacity-50 hover:opacity-80'}`}>
              {MOOD_EMOJIS[m]}
            </button>
          ))}
        </div>
      </div>

      {/* Intensity */}
      <div className="mb-4">
        <label className={text.label}>ความหนัก</label>
        <div className="flex gap-2">
          {ALL_INTENSITIES.map(lv => {
            const selected = intensities.includes(lv);
            return (
              <button key={lv} type="button"
                onClick={() => setIntensities(prev => prev.includes(lv) ? prev.filter(x => x !== lv) : [...prev, lv])}
                className={`flex-1 py-2.5 rounded-2xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                  selected ? 'bg-[var(--p)] text-[var(--p-text)] scale-105' : 'bg-[var(--chip-bg)] text-[var(--text-2)] hover:bg-[var(--bar-i)]'
                }`}>
                <span className="text-xs">{INTENSITY_EMOJIS[lv]}</span>
                {INTENSITY_LABELS[lv]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cost */}
      <div className="mb-4">
        <label className={text.label}>ค่าใช้จ่าย (บาท)</label>
        <input type="number" inputMode="numeric" min={0} className={input.base}
          value={cost ?? ''} placeholder="120"
          onChange={e => { const n = parseInt(e.target.value, 10); setCost(Number.isNaN(n) ? undefined : Math.max(0, n)); }} />
      </div>

      {/* Notes */}
      <div className="mb-2">
        <label className={text.label}>โน้ต</label>
        <NoteField value={notes} onChange={setNotes} />
      </div>

    </BottomSheet>
  );
}
