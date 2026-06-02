import React, { useState } from 'react';
import { DayOfWeek, DAY_LABELS, GroupLevel, ALL_LEVELS } from '../types';
import { BottomSheet } from './BottomSheet';
import { text, input } from '../styles/tokens';

interface AddGroupModalProps {
  courtName: string;
  defaultDay?: DayOfWeek;
  initialValues?: { name: string; days: DayOfWeek[]; startTime: string; endTime: string; levels?: GroupLevel[]; notes?: string; image?: string };
  onClose: () => void;
  onSave: (data: {
    name: string; days: DayOfWeek[]; startTime: string; endTime: string;
    levels?: GroupLevel[]; notes?: string; image?: string;
  }) => void;
}

const ALL_DAYS: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];
const SELECT_CLS = input.timeSelect;

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

export function AddGroupModal({ courtName, defaultDay, initialValues, onClose, onSave }: AddGroupModalProps) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [days, setDays] = useState<DayOfWeek[]>(initialValues?.days ?? (defaultDay ? [defaultDay] : []));
  const [startTime, setStartTime] = useState(initialValues?.startTime ?? '08:00');
  const [endTime, setEndTime] = useState(initialValues?.endTime ?? '12:00');
  const [levels, setLevels] = useState<GroupLevel[]>(initialValues?.levels ?? []);
  const [image, setImage] = useState<string | undefined>(initialValues?.image);

  const toggleLevel = (lv: GroupLevel) =>
    setLevels(prev => prev.includes(lv) ? prev.filter(l => l !== lv) : [...prev, lv]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const toggleDay = (day: DayOfWeek) =>
    setDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);

  const handleSave = () => {
    if (!name.trim() || days.length === 0) return;
    onClose();
    onSave({ name: name.trim(), days, startTime, endTime, levels: levels.length ? levels : undefined, image });
  };

  const saveButton = (
    <button onClick={handleSave} disabled={!name.trim() || days.length === 0}
      className="w-full bg-gray-900 text-white py-3 rounded-2xl font-medium hover:bg-gray-700 disabled:opacity-40 transition-colors">
      {initialValues ? 'บันทึกการแก้ไข' : 'บันทึกก๊วน'}
    </button>
  );

  return (
    <BottomSheet title={initialValues ? 'แก้ไขก๊วน' : 'เพิ่มก๊วน'} onClose={onClose} footer={saveButton}>
      <p className="text-xs text-gray-400 -mt-3 mb-4">{courtName}</p>

      <div className="mb-4">
        <label className={text.label}>ชื่อก๊วน *</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)}
          placeholder="เช่น ก๊วนเช้าวันเสาร์"
          className={input.base} />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">รูปก๊วน (ไม่บังคับ)</label>
        {image ? (
          <div className="relative">
            <img src={image} alt="group" className="w-full h-36 object-cover rounded-xl" />
            <button type="button" onClick={() => setImage(undefined)} className="absolute top-2 right-2 bg-black/50 text-white w-7 h-7 rounded-full text-lg leading-none flex items-center justify-center hover:bg-black/70">×</button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
            <span className="text-2xl mb-1">📷</span>
            <span className="text-xs text-gray-400">กดเพื่อเลือกรูป</span>
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">วันที่เปิด *</label>
        <div className="flex gap-2 flex-wrap">
          {ALL_DAYS.map(day => (
            <button key={day} onClick={() => toggleDay(day)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                days.includes(day) ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {DAY_LABELS[day]}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">มือ (ระดับ)</label>
        <div className="flex gap-2 flex-wrap">
          {ALL_LEVELS.map(lv => (
            <button key={lv} type="button" onClick={() => toggleLevel(lv)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                levels.includes(lv) ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {lv}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <label className={text.label}>เวลาเริ่ม</label>
          <TimePicker value={startTime} onChange={setStartTime} />
        </div>
        <div className="flex-1">
          <label className={text.label}>เวลาเลิก</label>
          <TimePicker value={endTime} onChange={setEndTime} />
        </div>
      </div>

    </BottomSheet>
  );
}
