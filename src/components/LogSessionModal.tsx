import React, { useState } from 'react';
import { Court, Session } from '../types';
import { BottomSheet } from './BottomSheet';

interface LogSessionModalProps {
  courts: Court[];
  onClose: () => void;
  onSave: (data: Omit<Session, 'id'>) => void;
}

const MOOD_EMOJIS: Record<number, string> = { 1: '😴', 2: '😐', 3: '🙂', 4: '😄', 5: '🔥' };
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];
const SELECT_CLS = 'flex-1 border border-gray-200 rounded-xl px-2 py-2 text-base focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white appearance-none text-center';
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
      <select value={h} onChange={e => onChange(`${e.target.value}:${m}`)} className={SELECT_CLS}>
        {HOURS.map(hh => <option key={hh} value={hh}>{hh}</option>)}
      </select>
      <span className="text-gray-400 font-medium">:</span>
      <select value={nearestMin} onChange={e => onChange(`${h}:${e.target.value}`)} className={SELECT_CLS}>
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
              className={`aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all mx-0.5 ${
                isSel
                  ? 'bg-gray-900 text-white'
                  : isToday
                  ? 'ring-2 ring-gray-300 text-gray-800'
                  : isFuture
                  ? 'text-gray-200 cursor-default'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function LogSessionModal({ courts, onClose, onSave }: LogSessionModalProps) {
  const [date, setDate] = useState(todayString());
  const [courtId, setCourtId] = useState(courts[0]?.id ?? '');
  const [groupId, setGroupId] = useState(() => courts[0]?.groups[0]?.id ?? '');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('10:00');
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [notes, setNotes] = useState('');

  const selectedCourt = courts.find(c => c.id === courtId);
  const groups = selectedCourt?.groups ?? [];

  const handleCourtChange = (id: string) => {
    setCourtId(id);
    setGroupId(courts.find(c => c.id === id)?.groups[0]?.id ?? '');
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
    <BottomSheet title="บันทึกการตี" onClose={onClose} footer={saveButton}>
      {/* Calendar */}
      <div className="bg-gray-50 rounded-2xl p-3 mb-5">
        <MiniCalendar selected={date} onChange={setDate} />
      </div>

      {/* Court */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">สนาม</label>
        <select value={courtId} onChange={e => handleCourtChange(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white">
          {courts.length === 0 && <option value="">ยังไม่มีสนาม</option>}
          {courts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Group */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">ก๊วน</label>
        <select value={groupId} onChange={e => setGroupId(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white">
          {groups.length === 0 && <option value="">ยังไม่มีก๊วนในสนามนี้</option>}
          {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </div>

      {/* Times */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">เวลาเริ่ม</label>
          <TimePicker value={startTime} onChange={setStartTime} />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">เวลาเลิก</label>
          <TimePicker value={endTime} onChange={setEndTime} />
        </div>
      </div>

      {/* Games */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">จำนวนเกมที่เล่น</label>
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => setGamesPlayed(g => Math.max(0, g - 1))}
            className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 text-xl font-bold hover:bg-gray-200 flex items-center justify-center">−</button>
          <span className="text-2xl font-bold text-gray-800 w-8 text-center">{gamesPlayed}</span>
          <button type="button" onClick={() => setGamesPlayed(g => g + 1)}
            className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 text-xl font-bold hover:bg-gray-200 flex items-center justify-center">+</button>
        </div>
      </div>

      {/* Mood */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">อารมณ์วันนี้</label>
        <div className="flex gap-2 justify-between">
          {([1, 2, 3, 4, 5] as const).map(m => (
            <button key={m} type="button" onClick={() => setMood(m)}
              className={`flex-1 py-2 rounded-2xl text-3xl transition-all ${mood === m ? 'bg-gray-900 scale-110' : 'bg-gray-100 opacity-50 hover:opacity-80'}`}>
              {MOOD_EMOJIS[m]}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">โน้ต (ไม่บังคับ)</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="เช่น วันนี้เล่นดีมาก!" rows={3}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none" />
      </div>
    </BottomSheet>
  );
}
