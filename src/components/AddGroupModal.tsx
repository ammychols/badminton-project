import React, { useState } from 'react';
import { DayOfWeek, DAY_LABELS } from '../types';

interface AddGroupModalProps {
  courtName: string;
  onClose: () => void;
  onSave: (data: {
    name: string;
    days: DayOfWeek[];
    startTime: string;
    endTime: string;
    notes?: string;
  }) => void;
}

const ALL_DAYS: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export function AddGroupModal({ courtName, onClose, onSave }: AddGroupModalProps) {
  const [name, setName] = useState('');
  const [days, setDays] = useState<DayOfWeek[]>([]);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('12:00');
  const [notes, setNotes] = useState('');

  const toggleDay = (day: DayOfWeek) => {
    setDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSave = () => {
    if (!name.trim() || days.length === 0) return;
    onSave({ name: name.trim(), days, startTime, endTime, notes: notes.trim() || undefined });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center sm:items-center">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-bold text-gray-800">เพิ่มก๊วน</h3>
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
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
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

        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">เวลาเริ่ม</label>
            <input
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">เวลาเลิก</label>
            <input
              type="time"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">โน้ต (ไม่บังคับ)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder=""
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={!name.trim() || days.length === 0}
          className="w-full bg-green-600 text-white py-3 rounded-2xl font-medium hover:bg-green-700 disabled:opacity-40 transition-colors"
        >
          บันทึกก๊วน
        </button>
      </div>
    </div>
  );
}
