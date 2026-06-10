import React, { useState } from 'react';
import { Court, CourtInfo, FloorType, AirType, ParkingType, FLOOR_LABELS, AIR_LABELS, PARKING_LABELS } from '../types';
import { text, input } from '../styles/tokens';

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
    onClose();
    onSave({ floor, air, parking, notes: notes.trim() || undefined });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className="w-full max-w-sm rounded-3xl overflow-hidden flex flex-col" style={{ backgroundColor: 'var(--app-bg)', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--card-border)' }}>
          <div>
            <p className="text-base font-extrabold text-[var(--text-1)]">ข้อมูลสนาม</p>
            <p className="text-xs text-[var(--text-3)] mt-0.5">{court.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-[var(--chip-bg)] transition-colors" style={{ color: 'var(--text-3)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        {/* Body */}
        <div className="overflow-y-auto px-5 py-4 flex-1">
          <ChipGroup label="พื้นสนาม" options={['concrete', 'wood', 'rubber'] as FloorType[]} labels={FLOOR_LABELS} value={floor} onChange={setFloor} />
          <ChipGroup label="อากาศ" options={['aircon', 'fan', 'stuffy'] as AirType[]} labels={AIR_LABELS} value={air} onChange={setAir} />
          <ChipGroup label="ที่จอดรถ" options={['easy', 'limited', 'none'] as ParkingType[]} labels={PARKING_LABELS} value={parking} onChange={setParking} />
          <div className="mb-2">
            <label className={text.label}>โน้ต (ไม่บังคับ)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="เช่น ค่าคอร์ท 80 บาท, มีน้ำดื่มฟรี" rows={3}
              className={input.textarea} />
          </div>
        </div>
        {/* Footer */}
        <div className="px-5 py-4 flex gap-2 flex-shrink-0" style={{ borderTop: '1px solid var(--card-border)' }}>
          {isNewCourt && (
            <button onClick={onClose} className="flex-1 py-3 rounded-2xl border border-[var(--card-border)] text-sm text-[var(--text-3)] hover:bg-[var(--chip-bg)] transition-colors">
              ข้าม
            </button>
          )}
          <button onClick={handleSave} className="flex-1 py-3 rounded-2xl text-sm font-semibold text-[#0f172a] transition-colors" style={{ background: '#34d399' }}>
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}
