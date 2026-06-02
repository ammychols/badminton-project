import React, { useState } from 'react';
import { Court, Session, DayOfWeek } from '../types';
import { BottomSheet } from './BottomSheet';
import { text, input } from '../styles/tokens';

interface LogSessionModalProps {
  courts: Court[];
  onClose: () => void;
  onSave: (data: Omit<Session, 'id'>) => void;
  initialSession?: Session;
}

const MOOD_EMOJIS: Record<number, string> = { 1: '😴', 2: '😐', 3: '🙂', 4: '😄', 5: '🔥' };
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];
const DOW = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
const MONTH_LABELS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

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
        <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition-colors text-lg">‹</button>
        <span className="text-sm font-semibold text-gray-800">{MONTH_LABELS[viewMonth]} {viewYear + 543}</span>
        <button onClick={nextMonth} disabled={isNextDisabled}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition-colors text-lg disabled:opacity-20 disabled:cursor-default">›</button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DOW.map(d => (
          <div key={d} className="text-center text-xs text-gray-400 py-1">{d}</div>
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
              className={`aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all mx-0.5 ${
                isSel
                  ? 'bg-gray-900 text-white'
                  : isFuture
                  ? 'text-gray-200 cursor-default'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {d}
              {isToday && (
                <span className={`w-1 h-1 rounded-full mt-0.5 ${isSel ? 'bg-white/60' : 'bg-gray-900'}`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function LogSessionModal({ courts, onClose, onSave, initialSession }: LogSessionModalProps) {
  const [date, setDate] = useState(initialSession?.date ?? todayString());
  const [courtId, setCourtId] = useState(initialSession?.courtId ?? courts[0]?.id ?? '');
  const [groupId, setGroupId] = useState(initialSession?.groupId ?? courts[0]?.groups[0]?.id ?? '');
  const [startTime, setStartTime] = useState(initialSession?.startTime ?? '08:00');
  const [endTime, setEndTime] = useState(initialSession?.endTime ?? '10:00');
  const [gamesPlayed, setGamesPlayed] = useState(initialSession?.gamesPlayed ?? 0);
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(initialSession?.mood ?? 3);
  const [notes, setNotes] = useState(initialSession?.notes ?? '');

  const DOW_MAP: DayOfWeek[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const selectedDow = DOW_MAP[new Date(date + 'T00:00:00').getDay()];

  const filteredCourts = courts.filter(c => c.groups.some(g => g.days.includes(selectedDow)));
  const displayCourts = filteredCourts.length > 0 ? filteredCourts : courts;

  const selectedCourt = courts.find(c => c.id === courtId);
  const allGroups = selectedCourt?.groups ?? [];
  const groups = allGroups.filter(g => g.days.includes(selectedDow));
  const displayGroups = groups.length > 0 ? groups : allGroups;

  const handleCourtChange = (id: string) => {
    setCourtId(id);
    const court = courts.find(c => c.id === id);
    const g = court?.groups.filter(g => g.days.includes(selectedDow)) ?? [];
    setGroupId((g.length > 0 ? g : court?.groups ?? [])[0]?.id ?? '');
  };

  const handleDateChange = (d: string) => {
    setDate(d);
    const dow = DOW_MAP[new Date(d + 'T00:00:00').getDay()];
    const filtered = courts.filter(c => c.groups.some(g => g.days.includes(dow)));
    const newCourt = filtered.find(c => c.id === courtId) ? selectedCourt : (filtered[0] ?? courts[0]);
    if (newCourt && newCourt.id !== courtId) setCourtId(newCourt.id);
    const g = newCourt?.groups.filter(g => g.days.includes(dow)) ?? [];
    const newGroupId = (g.length > 0 ? g : newCourt?.groups ?? [])[0]?.id ?? '';
    setGroupId(newGroupId);
  };

  const handleSave = () => {
    if (!courtId || !groupId) return;
    onSave({ courtId, groupId, date, startTime, endTime, gamesPlayed, mood, notes: notes.trim() || undefined });
    onClose();
  };

  const saveButton = (
    <button onClick={handleSave} disabled={!courtId || !groupId}
      className="w-full bg-gray-900 text-white py-3 rounded-2xl font-medium hover:bg-gray-700 disabled:opacity-40 transition-colors">
      บันทึก
    </button>
  );

  return (
    <BottomSheet title={initialSession ? 'แก้ไขบันทึก' : 'บันทึกการตี'} onClose={onClose} footer={saveButton}>
      {/* Calendar */}
      <div className="bg-gray-50 rounded-2xl p-3 mb-4">
        <MiniCalendar selected={date} onChange={handleDateChange} />
      </div>

      {/* Court + Group */}
      <div className="grid grid-cols-2 gap-3 mb-1">
        <div>
          <label className={text.label}>สนาม</label>
          <select value={courtId} onChange={e => handleCourtChange(e.target.value)} className={input.base}>
            {displayCourts.length === 0 && <option value="">ยังไม่มีสนาม</option>}
            {displayCourts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className={text.label}>ก๊วน</label>
          <select value={groupId} onChange={e => setGroupId(e.target.value)} className={input.base}>
            {displayGroups.length === 0 && <option value="">ไม่มีก๊วน</option>}
            {displayGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
      </div>
      {filteredCourts.length === 0 && courts.length > 0 && (
        <p className="text-xs text-amber-500 mb-3">⚠ ไม่มีก๊วนที่เปิดวันนี้ — แสดงทั้งหมด</p>
      )}
      {filteredCourts.length > 0 && groups.length === 0 && allGroups.length > 0 && (
        <p className="text-xs text-amber-500 mb-3">⚠ ก๊วนนี้ไม่เปิดวันนี้ — แสดงทั้งหมด</p>
      )}
      {filteredCourts.length > 0 && groups.length > 0 && <div className="mb-3" />}

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
              className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 text-lg font-bold hover:bg-gray-200 flex items-center justify-center flex-shrink-0">−</button>
            <span className="text-lg font-bold text-gray-800 flex-1 text-center">{gamesPlayed}</span>
            <button type="button" onClick={() => setGamesPlayed(g => g + 1)}
              className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 text-lg font-bold hover:bg-gray-200 flex items-center justify-center flex-shrink-0">+</button>
          </div>
        </div>
      </div>

      {/* Mood */}
      <div className="mb-4">
        <label className={text.label}>อารมณ์</label>
        <div className="flex gap-2">
          {([1, 2, 3, 4, 5] as const).map(m => (
            <button key={m} type="button" onClick={() => setMood(m)}
              className={`flex-1 py-2 rounded-2xl text-2xl transition-all ${mood === m ? 'bg-gray-900 scale-105' : 'bg-gray-100 opacity-50 hover:opacity-80'}`}>
              {MOOD_EMOJIS[m]}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-2">
        <label className={text.label}>โน้ต (ไม่บังคับ)</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="เช่น วันนี้เล่นดีมาก!" rows={2}
          className={input.textarea} />
      </div>
    </BottomSheet>
  );
}
