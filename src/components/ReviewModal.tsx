import React, { useState } from 'react';
import { Court, FloorType, LightLevel, AirType, CrowdLevel, ShuttleType,
  FLOOR_LABELS, LIGHT_LABELS, AIR_LABELS, CROWD_LABELS, SHUTTLE_LABELS } from '../types';
import { StarRating } from './StarRating';

interface ReviewModalProps {
  court: Court;
  groupId: string;
  onClose: () => void;
  onSave: (data: {
    fun: number; arrangement: number; travel: number;
    floor?: FloorType; light?: LightLevel; air?: AirType;
    crowd?: CrowdLevel; shuttle?: ShuttleType; shuttleBrand?: string;
    notes?: string; date: string;
  }) => void;
}

export function ReviewModal({ court, groupId, onClose, onSave }: ReviewModalProps) {
  const group = court.groups.find(g => g.id === groupId);
  const [fun, setFun] = useState(0);
  const [arrangement, setArrangement] = useState(0);
  const [travel, setTravel] = useState(0);
  const [floor, setFloor] = useState<FloorType | undefined>();
  const [light, setLight] = useState<LightLevel | undefined>();
  const [air, setAir] = useState<AirType | undefined>();
  const [crowd, setCrowd] = useState<CrowdLevel | undefined>();
  const [shuttle, setShuttle] = useState<ShuttleType | undefined>();
  const [shuttleBrand, setShuttleBrand] = useState('');
  const [notes, setNotes] = useState('');

  if (!group) return null;

  const canSave = fun > 0 && arrangement > 0 && travel > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave({ fun, arrangement, travel, floor, light, air, crowd, shuttle,
      shuttleBrand: shuttleBrand.trim() || undefined,
      notes: notes.trim() || undefined, date: new Date().toISOString() });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center sm:items-center">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-0.5">
            <h3 className="text-lg font-bold text-gray-800">รีวิวก๊วน</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
          </div>
          <p className="text-xs text-gray-400">{group.name} · {court.name}</p>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-4">

          {/* Star ratings — compact rows */}
          <div className="flex flex-col gap-2.5">
            {[
              { label: '🎉 ความสนุก', desc: 'บรรยากาศ คนในก๊วน', val: fun, set: setFun },
              { label: '🤝 การจัดมือ', desc: 'ระดับพอกัน เล่นได้เต็มที่', val: arrangement, set: setArrangement },
              { label: '🚗 การเดินทาง', desc: 'ใกล้ สะดวก จอดรถง่าย', val: travel, set: setTravel },
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

          {/* Choice chips — 2 per row grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <ChoiceRow label="🏟️ พื้น" options={FLOOR_LABELS} value={floor} onChange={v => setFloor(v as FloorType)} />
            <ChoiceRow label="💡 แสง" options={LIGHT_LABELS} value={light} onChange={v => setLight(v as LightLevel)} />
            <ChoiceRow label="🌬️ อากาศ" options={AIR_LABELS} value={air} onChange={v => setAir(v as AirType)} />
            <ChoiceRow label="👥 ความหนาแน่น" options={CROWD_LABELS} value={crowd} onChange={v => setCrowd(v as CrowdLevel)} />
            <div className="col-span-2">
              <p className="text-xs font-medium text-gray-600 mb-1">🪶 ลูกขนไก่ — ความทน</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {(Object.entries(SHUTTLE_LABELS) as [ShuttleType, string][]).map(([key, text]) => (
                  <button key={key} onClick={() => setShuttle(key)}
                    className={`px-2.5 py-1 rounded-full text-xs transition-colors ${shuttle === key ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {text}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={shuttleBrand}
                onChange={e => setShuttleBrand(e.target.value)}
                placeholder="ยี่ห้อ / รุ่น เช่น RSL No.1"
                className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
          </div>

          {/* Notes */}
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder=""
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
          />
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex-1 bg-green-600 text-white py-3 rounded-2xl font-medium hover:bg-green-700 disabled:opacity-40 transition-colors"
          >
            บันทึกรีวิว
          </button>
        </div>
      </div>
    </div>
  );
}

function ChoiceRow<T extends string>({ label, options, value, onChange }: {
  label: string; options: Record<T, string>; value: T | undefined; onChange: (v: T) => void;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-600 mb-1">{label}</p>
      <div className="flex flex-wrap gap-1">
        {(Object.entries(options) as [T, string][]).map(([key, text]) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
              value === key ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
