import React, { useState } from 'react';
import { Court, CourtInfo, FloorType, AirType, ParkingType, FLOOR_LABELS, AIR_LABELS, PARKING_LABELS } from '../types';
import { BottomSheet } from './BottomSheet';
import { text } from '../styles/tokens';

interface CourtInfoModalProps {
  court: Court;
  onClose: () => void;
  onSave: (data: CourtInfo) => void;
  isNewCourt?: boolean;
}

function ChipGroup<T extends string>({
  label, options, labels, value, onChange,
}: {
  label: string; options: T[]; labels: Record<T, string>;
  value: T | undefined; onChange: (v: T | undefined) => void;
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex gap-2 flex-wrap">
        {options.map(opt => (
          <button key={opt} type="button" onClick={() => onChange(value === opt ? undefined : opt)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              value === opt ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {labels[opt]}
          </button>
        ))}
      </div>
    </div>
  );
}

export function CourtInfoModal({ court, onClose, onSave, isNewCourt }: CourtInfoModalProps) {
  const existing = court.info;
  const [floor, setFloor] = useState<FloorType | undefined>(existing?.floor);
  const [air, setAir] = useState<AirType | undefined>(existing?.air);
  const [parking, setParking] = useState<ParkingType | undefined>(existing?.parking);
  const [notes, setNotes] = useState(existing?.notes ?? '');

  const handleSave = () => {
    onSave({ floor, air, parking, notes: notes.trim() || undefined });
  };

  const footer = (
    <div className="flex gap-2">
      {isNewCourt && (
        <button onClick={onClose} className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
          ข้าม
        </button>
      )}
      <button onClick={handleSave}
        className="flex-1 bg-gray-900 text-white py-3 rounded-2xl font-medium hover:bg-gray-700 transition-colors">
        บันทึก
      </button>
    </div>
  );

  return (
    <BottomSheet title="ข้อมูลสนาม" onClose={onClose} footer={footer}>
      <p className="text-xs text-gray-400 -mt-3 mb-5">{court.name}</p>
      <ChipGroup label="พื้นสนาม" options={['concrete', 'wood', 'rubber'] as FloorType[]} labels={FLOOR_LABELS} value={floor} onChange={setFloor} />
      <ChipGroup label="อากาศ" options={['aircon', 'fan', 'stuffy'] as AirType[]} labels={AIR_LABELS} value={air} onChange={setAir} />
      <ChipGroup label="ที่จอดรถ" options={['easy', 'limited', 'none'] as ParkingType[]} labels={PARKING_LABELS} value={parking} onChange={setParking} />
      <div className="mb-2">
        <label className={text.label}>โน้ต (ไม่บังคับ)</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="เช่น ค่าคอร์ท 80 บาท, มีน้ำดื่มฟรี" rows={3}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-green-400 resize-none" />
      </div>
    </BottomSheet>
  );
}
