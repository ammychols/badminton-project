import React, { useState } from 'react';
import { Court } from '../types';
import { BottomSheet } from './BottomSheet';
import { text, input } from '../styles/tokens';

interface ReviewModalProps {
  court: Court;
  groupId: string;
  onClose: () => void;
  onSave: (data: { fun: number; arrangement: number; notes?: string; date: string }) => void;
}

export function ReviewModal({ court, groupId, onClose, onSave }: ReviewModalProps) {
  const group = court.groups.find(g => g.id === groupId);
  const existing = group?.reviews[0];
  const [notes, setNotes] = useState(existing?.notes ?? '');

  if (!group) return null;

  const handleSave = () => {
    onSave({ fun: 0, arrangement: 0, notes: notes.trim() || undefined, date: new Date().toJSON() });
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

      <div>
        <label className={text.label}>โน้ต (ไม่บังคับ)</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
          className={input.textarea} />
      </div>
    </BottomSheet>
  );
}
