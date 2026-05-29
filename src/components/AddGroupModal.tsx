import React, { useState } from 'react';
import { DayOfWeek, DAY_LABELS, GroupLevel, ALL_LEVELS } from '../types';

interface AddGroupModalProps {
  courtName: string;
  defaultDay?: DayOfWeek;
  initialValues?: { name: string; days: DayOfWeek[]; startTime: string; endTime: string; levels?: GroupLevel[]; notes?: string };
  onClose: () => void;
  onSave: (data: {
    name: string;
    days: DayOfWeek[];
    startTime: string;
    endTime: string;
    levels?: GroupLevel[];
    notes?: string;
  }) => void;
}

const ALL_DAYS: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export function AddGroupModal({ courtName, defaultDay, initialValues, onClose, onSave }: AddGroupModalProps) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [days, setDays] = useState<DayOfWeek[]>(initialValues?.days ?? (defaultDay ? [defaultDay] : []));
  const [startTime, setStartTime] = useState(initialValues?.startTime ?? '08:00');
  const [endTime, setEndTime] = useState(initialValues?.endTime ?? '12:00');
  const [levels, setLevels] = useState<GroupLevel[]>(initialValues?.levels ?? []);
  const toggleLevel = (lv: GroupLevel) =>
    setLevels(prev => prev.includes(lv) ? prev.filter(l => l !== lv) : [...prev, lv]);
  const [notes, setNotes] = useState(initialValues?.notes ?? '');

  const toggleDay = (day: DayOfWeek) => {
    setDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSave = () => {
    if (!name.trim() || days.length === 0) return;
    onSave({ name: name.trim(), days, startTime, endTime, levels: levels.length ? levels : undefined, notes: notes.trim() || undefined });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center sm:items-center">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-bold text-gray-800">{initialValues ? 'แก้ไขก๊วน' : 'เพิ่มก๊วน'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <p className="text-xs text-gray-400 mb-4">{courtName}</p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อก๊วน *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="เช่น ก๊วนเช้าวันเสาร์"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">วันที่เปิด *</label>
          <div className="flex gap-2 flex-wrap">
            {ALL_DAYS.map(day => (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  days.includes(day)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {DAY_LABELS[day]}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">มือ (ระดับ)</label>
          <div className="flex gap-2 flex-wrap">
            {ALL_LEVELS.map(lv => (
              <button
                key={lv}
                type="button"
                onClick={() => toggleLevel(lv)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  levels.includes(lv) ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {lv}
              </button>
            ))}
          </div>
        </div>

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

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">โน้ต (ไม่บังคับ)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder=""
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={!name.trim() || days.length === 0}
          className="w-full bg-green-600 text-white py-3 rounded-2xl font-medium hover:bg-green-700 disabled:opacity-40 transition-colors"
        >
          {initialValues ? 'บันทึกการแก้ไข' : 'บันทึกก๊วน'}
        </button>
      </div>
    </div>
  );
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];
const SELECT_CLS = 'flex-1 border border-gray-200 rounded-xl px-2 py-2 text-base focus:outline-none focus:ring-2 focus:ring-green-400 bg-white appearance-none text-center';

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
