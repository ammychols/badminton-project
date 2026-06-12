import { useState } from 'react';
import { Court, CourtInfo, FloorType, AirType, ParkingType, FLOOR_LABELS, AIR_LABELS, PARKING_LABELS } from '../types';
import { text, input, btn } from '../styles/tokens';
import { BottomSheet } from './BottomSheet';

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
      <label className={text.label}>{label}</label>
      <div className="flex gap-2 flex-wrap">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(value === opt ? undefined : opt)}
            className={`${btn.pill} ${value === opt ? btn.pillActive : btn.pillInactive}`}
          >
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
    onClose();
    onSave({ floor, air, parking, notes: notes.trim() || undefined });
  };

  return (
    <BottomSheet
      title="ข้อมูลสนาม"
      subtitle={court.name}
      onClose={onClose}
      footer={
        <div className="flex gap-2">
          {isNewCourt && (
            <button onClick={onClose} className={btn.cancel}>ข้าม</button>
          )}
          <button onClick={handleSave} className={`${btn.primaryLg} flex-1`}>บันทึก</button>
        </div>
      }
    >
      <ChipGroup label="พื้นสนาม" options={['concrete', 'wood', 'rubber'] as FloorType[]} labels={FLOOR_LABELS} value={floor} onChange={setFloor} />
      <ChipGroup label="อากาศ" options={['aircon', 'fan', 'stuffy'] as AirType[]} labels={AIR_LABELS} value={air} onChange={setAir} />
      <ChipGroup label="ที่จอดรถ" options={['easy', 'limited', 'none'] as ParkingType[]} labels={PARKING_LABELS} value={parking} onChange={setParking} />
      <div className="mb-2">
        <label className={text.label}>โน้ต (ไม่บังคับ)</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="เช่น ค่าคอร์ท 80 บาท, มีน้ำดื่มฟรี"
          rows={3}
          className={input.textarea}
        />
      </div>
    </BottomSheet>
  );
}
