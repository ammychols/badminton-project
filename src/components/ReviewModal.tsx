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
    crowd?: CrowdLevel; shuttle?: ShuttleType;
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
  const [notes, setNotes] = useState('');

  if (!group) return null;

  const canSave = fun > 0 && arrangement > 0 && travel > 0;
  const avgScore = canSave ? ((fun + arrangement + travel) / 3).toFixed(1) : '-';

  const handleSave = () => {
    if (!canSave) return;
    onSave({ fun, arrangement, travel, floor, light, air, crowd, shuttle,
      notes: notes.trim() || undefined, date: new Date().toISOString() });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center sm:items-center overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 my-auto">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-bold text-gray-800">รีวิวก๊วน</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <p className="text-sm text-gray-500 mb-5">{group.name} · {court.name}</p>

        {/* Star ratings */}
        <div className="flex flex-col gap-4 mb-5">
          <RatingRow label="🎉 ความสนุก" description="บรรยากาศ คนในก๊วน" value={fun} onChange={setFun} />
          <RatingRow label="🤝 การจัดมือ" description="ระดับพอกัน เล่นได้เต็มที่" value={arrangement} onChange={setArrangement} />
          <RatingRow label="🚗 การเดินทาง" description="ใกล้ สะดวก จอดรถง่าย" value={travel} onChange={setTravel} />
        </div>

        {/* Choice selections */}
        <div className="flex flex-col gap-3 mb-5">
          <ChoiceRow label="🏟️ พื้น" options={FLOOR_LABELS} value={floor} onChange={v => setFloor(v as FloorType)} />
          <ChoiceRow label="💡 แสง" options={LIGHT_LABELS} value={light} onChange={v => setLight(v as LightLevel)} />
          <ChoiceRow label="🌬️ อากาศ" options={AIR_LABELS} value={air} onChange={v => setAir(v as AirType)} />
          <ChoiceRow label="👥 ความหนาแน่น" options={CROWD_LABELS} value={crowd} onChange={v => setCrowd(v as CrowdLevel)} />
          <ChoiceRow label="🪶 ขนนก" options={SHUTTLE_LABELS} value={shuttle} onChange={v => setShuttle(v as ShuttleType)} />
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

function RatingRow({ label, description, value, onChange }: {
  label: string; description: string; value: number; onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
      <StarRating value={value} onChange={onChange} size="md" />
    </div>
  );
}

function ChoiceRow<T extends string>({ label, options, value, onChange }: {
  label: string; options: Record<T, string>; value: T | undefined; onChange: (v: T) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-800 mb-1.5">{label}</p>
      <div className="flex gap-2 flex-wrap">
        {(Object.entries(options) as [T, string][]).map(([key, text]) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              value === key
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
