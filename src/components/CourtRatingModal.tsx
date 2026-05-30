import React, { useState } from 'react';
import { Court, CourtRating } from '../types';
import { StarRating } from './StarRating';

interface CourtRatingModalProps {
  court: Court;
  onClose: () => void;
  onSave: (data: CourtRating) => void;
}

export function CourtRatingModal({ court, onClose, onSave }: CourtRatingModalProps) {
  const existing = court.rating;
  const [travel, setTravel] = useState(existing?.travel ?? 0);
  const [floor, setFloor] = useState(existing?.floor ?? 0);
  const [notes, setNotes] = useState(existing?.notes ?? '');

  const handleSave = () => {
    onSave({ travel: travel || undefined, floor: floor || undefined, notes: notes.trim() || undefined });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center sm:items-center">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md flex flex-col">
        <div className="px-5 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-0.5">
            <h3 className="text-lg font-bold text-gray-800">{existing ? 'แก้ไขคะแนนสนาม' : 'ให้คะแนนสนาม'}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
          </div>
          <p className="text-xs text-gray-400">{court.name}</p>
        </div>

        <div className="px-5 py-4 flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            {[
              { label: '🚗 การเดินทาง', desc: 'ใกล้ สะดวก จอดรถง่าย', val: travel, set: setTravel },
              { label: '🏸 พื้นสนาม', desc: 'คุณภาพพื้น ความลื่น', val: floor, set: setFloor },
            ].map(({ label, desc, val, set }) => (
              <div key={label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
                <StarRating value={val} onChange={set} size="sm" />
              </div>
            ))}
          </div>

          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="โน้ตสนาม เช่น ค่าคอร์ต ที่จอดรถ (ไม่บังคับ)"
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
          />
        </div>

        <div className="px-5 pb-5 pt-2 border-t border-gray-100">
          <button
            onClick={handleSave}
            className="w-full bg-green-600 text-white py-3 rounded-2xl font-medium hover:bg-green-700 transition-colors"
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}
