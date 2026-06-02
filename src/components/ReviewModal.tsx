import React, { useState } from 'react';
import { Court } from '../types';
import { StarRating } from './StarRating';
import { BottomSheet } from './BottomSheet';

interface ReviewModalProps {
  court: Court;
  groupId: string;
  onClose: () => void;
  onSave: (data: { fun: number; arrangement: number; notes?: string; date: string }) => void;
}

export function ReviewModal({ court, groupId, onClose, onSave }: ReviewModalProps) {
  const group = court.groups.find(g => g.id === groupId);
  const existing = group?.reviews[0];
  const [fun, setFun] = useState(existing?.fun ?? 0);
  const [arrangement, setArrangement] = useState(existing?.arrangement ?? 0);
  const [notes, setNotes] = useState(existing?.notes ?? '');

  if (!group) return null;

  const handleSave = () => {
    onSave({ fun, arrangement, notes: notes.trim() || undefined, date: new Date().toISOString() });
    onClose();
  };

  const saveButton = (
    <button onClick={handleSave}
      className="w-full bg-gray-900 text-white py-3 rounded-2xl font-medium hover:bg-gray-700 transition-colors">
      บันทึกรีวิว
    </button>
  );

  return (
    <BottomSheet title={existing ? 'แก้ไขรีวิว' : 'รีวิวก๊วน'} onClose={onClose} footer={saveButton}>
      <p className="text-xs text-gray-400 -mt-3 mb-5">{group.name} · {court.name}</p>

      <div className="flex flex-col gap-4 mb-4">
        {[
          { label: '🎉 ความสนุก', desc: 'บรรยากาศ คนในก๊วน', val: fun, set: setFun },
          { label: '🤝 การจัดมือ', desc: 'ระดับพอกัน เล่นได้เต็มที่', val: arrangement, set: setArrangement },
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">โน้ต (ไม่บังคับ)</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-green-400 resize-none" />
      </div>
    </BottomSheet>
  );
}
