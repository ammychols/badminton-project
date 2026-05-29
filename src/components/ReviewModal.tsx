import React, { useState } from 'react';
import { Court } from '../types';
import { StarRating } from './StarRating';

interface ReviewModalProps {
  court: Court;
  groupId: string;
  onClose: () => void;
  onSave: (data: { fun: number; arrangement: number; travel: number; notes?: string; date: string }) => void;
}

export function ReviewModal({ court, groupId, onClose, onSave }: ReviewModalProps) {
  const group = court.groups.find(g => g.id === groupId);
  const [fun, setFun] = useState(0);
  const [arrangement, setArrangement] = useState(0);
  const [travel, setTravel] = useState(0);
  const [notes, setNotes] = useState('');

  if (!group) return null;

  const canSave = fun > 0 && arrangement > 0 && travel > 0;
  const avgScore = canSave ? ((fun + arrangement + travel) / 3).toFixed(1) : '-';

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      fun,
      arrangement,
      travel,
      notes: notes.trim() || undefined,
      date: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center sm:items-center">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-bold text-gray-800">รีวิวก๊วน</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <p className="text-sm text-gray-500 mb-5">
          {group.name} · {court.name}
        </p>

        <div className="flex flex-col gap-5 mb-5">
          <RatingRow
            label="🎉 ความสนุก"
            description="บรรยากาศ ความสนุก เพื่อนๆ"
            value={fun}
            onChange={setFun}
          />
          <RatingRow
            label="🤝 การจัดมือ"
            description="จัดมือดีไหม เล่นได้เต็มที่ไหม"
            value={arrangement}
            onChange={setArrangement}
          />
          <RatingRow
            label="🚗 การเดินทาง"
            description="ใกล้ หาจอดรถง่าย ทำเลดีไหม"
            value={travel}
            onChange={setTravel}
          />
        </div>

        {canSave && (
          <div className="bg-green-50 rounded-xl p-3 text-center mb-4">
            <p className="text-sm text-gray-500">คะแนนรวม</p>
            <p className="text-3xl font-bold text-green-600">{avgScore}</p>
            <p className="text-xs text-gray-400">/ 5.0</p>
          </div>
        )}

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">บันทึกเพิ่มเติม</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="ความรู้สึกวันนี้..."
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={!canSave}
          className="w-full bg-green-600 text-white py-3 rounded-2xl font-medium hover:bg-green-700 disabled:opacity-40 transition-colors"
        >
          บันทึกรีวิว
        </button>
      </div>
    </div>
  );
}

function RatingRow({
  label, description, value, onChange
}: {
  label: string; description: string; value: number; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-sm font-medium text-gray-800">{label}</p>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
        <StarRating value={value} onChange={onChange} size="md" />
      </div>
    </div>
  );
}
