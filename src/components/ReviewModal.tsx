import React, { useState } from 'react';
import { Court } from '../types';
import { StarRating } from './StarRating';

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

  const canSave = fun > 0 && arrangement > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave({ fun, arrangement, notes: notes.trim() || undefined, date: new Date().toISOString() });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center sm:items-center">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md flex flex-col">
        <div className="px-5 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-0.5">
            <h3 className="text-lg font-bold text-gray-800">{existing ? 'แก้ไขรีวิว' : 'รีวิวก๊วน'}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
          </div>
          <p className="text-xs text-gray-400">{group.name} · {court.name}</p>
        </div>

        <div className="px-5 py-4 flex flex-col gap-4">
          <div className="flex flex-col gap-3">
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
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder=""
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
            />
          </div>
        </div>

        <div className="px-5 pb-5 pt-2 border-t border-gray-100">
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="w-full bg-green-600 text-white py-3 rounded-2xl font-medium hover:bg-green-700 disabled:opacity-40 transition-colors"
          >
            บันทึกรีวิว
          </button>
        </div>
      </div>
    </div>
  );
}
