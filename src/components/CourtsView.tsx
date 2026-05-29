import React, { useState } from 'react';
import { Court, Group, DAY_LABELS, DayOfWeek, FLOOR_LABELS, LIGHT_LABELS, AIR_LABELS, CROWD_LABELS, SHUTTLE_LABELS } from '../types';

interface CourtsViewProps {
  courts: Court[];
  onAddCourt: () => void;
  onAddGroup: (courtId: string) => void;
  onDeleteCourt: (courtId: string) => void;
  onDeleteGroup: (courtId: string, groupId: string) => void;
  onAddReview: (courtId: string, groupId: string) => void;
}

const TODAY_MAP: Record<number, DayOfWeek | 'all'> = { 0: 'SUN', 1: 'MON', 2: 'TUE', 3: 'WED', 4: 'THU', 5: 'FRI', 6: 'SAT' };
const DAY_TABS: { key: DayOfWeek | 'all'; label: string }[] = [
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'MON', label: 'จ' },
  { key: 'TUE', label: 'อ' },
  { key: 'WED', label: 'พ' },
  { key: 'THU', label: 'พฤ' },
  { key: 'FRI', label: 'ศ' },
  { key: 'SAT', label: 'ส' },
  { key: 'SUN', label: 'อา' },
];

export function CourtsView({ courts, onAddCourt, onAddGroup, onDeleteCourt, onDeleteGroup, onAddReview }: CourtsViewProps) {
  const [expandedCourt, setExpandedCourt] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | 'all'>(TODAY_MAP[new Date().getDay()] ?? 'all');

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">🏟️ สนามของฉัน</h2>
        <button onClick={onAddCourt} className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors">
          + เพิ่มสนาม
        </button>
      </div>

      {/* Day filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-5 scrollbar-none">
        {DAY_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSelectedDay(key)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedDay === key
                ? 'bg-green-600 text-white'
                : 'bg-white border border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {courts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-3">🏟️</div>
          <p>ยังไม่มีสนาม</p>
          <p className="text-sm mt-1">กดปุ่ม + เพิ่มสนาม เพื่อเริ่มต้น</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {courts.map(court => {
            const visibleGroups = selectedDay === 'all'
              ? court.groups
              : court.groups.filter(g => g.days.includes(selectedDay as DayOfWeek));
            return (
            <div key={court.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

              {/* Court header */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedCourt(expandedCourt === court.id ? null : court.id)}
              >
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0 text-xl">
                  🏸
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{court.name}</p>
                  <p className="text-xs text-gray-400 truncate">{court.address}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 text-gray-400">
                  <span className="text-xs">{court.groups.length} ก๊วน</span>
                  <span className="text-sm">{expandedCourt === court.id ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Expanded content */}
              {expandedCourt === court.id && (
                <>
                <div className="border-t border-gray-100">
                  <div className="flex flex-col sm:flex-row">
                    {/* Groups */}
                    <div className="flex-1 px-4 py-3 flex flex-col gap-2">
                      {visibleGroups.length === 0 && (
                        <p className="text-xs text-gray-400 text-center py-2">
                          {selectedDay === 'all' ? 'ยังไม่มีก๊วน' : 'ไม่มีก๊วนในวันนี้'}
                        </p>
                      )}
                      {visibleGroups.map(group => (
                        <GroupCard
                          key={group.id}
                          group={group}
                          onDelete={() => onDeleteGroup(court.id, group.id)}
                          onReview={() => onAddReview(court.id, group.id)}
                        />
                      ))}
                      <button
                        onClick={() => onAddGroup(court.id)}
                        className="w-full mt-1 border border-dashed border-green-300 text-green-600 text-sm py-2 rounded-xl hover:bg-green-50 transition-colors"
                      >
                        + เพิ่มก๊วน
                      </button>
                    </div>

                    {/* Google Map */}
                    <div className="sm:w-56 h-44 sm:h-auto sm:border-l border-t sm:border-t-0 border-gray-100 flex-shrink-0">
                      <iframe
                        title={court.name}
                        width="100%"
                        height="100%"
                        className="sm:rounded-r-2xl"
                        style={{ border: 0, minHeight: '160px' }}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(court.address || court.name)}&output=embed&z=15`}
                      />
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-100 px-4 py-2 flex justify-end">
                  <button
                    onClick={() => { if (confirm(`ลบสนาม "${court.name}" และก๊วนทั้งหมด?`)) onDeleteCourt(court.id); }}
                    className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    ลบสนาม
                  </button>
                </div>
                </>
              )}
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stars({ val }: { val: number }) {
  return <span className="text-yellow-400 tracking-tight">{'★'.repeat(val)}{'☆'.repeat(5 - val)}</span>;
}

function GroupCard({ group, onDelete, onReview }: { group: Group; onDelete: () => void; onReview: () => void }) {
  const review = group.reviews[0];

  return (
    <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
      <div className="px-3 pt-3 pb-2">
        {/* Name + time */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <p className="font-medium text-sm text-gray-800">{group.name}</p>
            <p className="text-xs text-green-600 mt-0.5">🕐 {group.startTime} – {group.endTime} น.</p>
          </div>
        </div>

        {/* Day pills */}
        <div className="flex gap-1 flex-wrap mb-2">
          {(Object.keys(DAY_LABELS) as DayOfWeek[]).map(day => (
            <span key={day} className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              group.days.includes(day) ? 'bg-green-100 text-green-700' : 'text-gray-300'
            }`}>{DAY_LABELS[day]}</span>
          ))}
        </div>

        {/* Review section */}
        {review ? (
          <div className="bg-white rounded-lg border border-gray-100 px-3 py-2 flex flex-col gap-1.5">
            {/* Star rows */}
            <div className="grid grid-cols-3 gap-x-2 gap-y-1">
              {[
                { icon: '🎉', label: 'ความสนุก', val: review.fun },
                { icon: '🤝', label: 'การจัดมือ', val: review.arrangement },
                { icon: '🚗', label: 'การเดินทาง', val: review.travel },
              ].map(({ icon, label, val }) => (
                <div key={label} className="flex flex-col">
                  <span className="text-xs text-gray-400">{icon} {label}</span>
                  <Stars val={val} />
                </div>
              ))}
            </div>
            {/* Choice chips */}
            {(review.floor || review.light || review.air || review.crowd || review.shuttle || review.shuttleBrand) && (
              <div className="flex flex-wrap gap-1 pt-1 border-t border-gray-100">
                {review.floor && <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{FLOOR_LABELS[review.floor]}</span>}
                {review.light && <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{LIGHT_LABELS[review.light]}</span>}
                {review.air && <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{AIR_LABELS[review.air]}</span>}
                {review.crowd && <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{CROWD_LABELS[review.crowd]}</span>}
                {review.shuttle && <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">🪶 {SHUTTLE_LABELS[review.shuttle]}</span>}
                {review.shuttleBrand && <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{review.shuttleBrand}</span>}
              </div>
            )}
            {review.notes && <p className="text-xs text-gray-500 pt-1 border-t border-gray-100 italic">"{review.notes}"</p>}
          </div>
        ) : (
          <p className="text-xs text-gray-400 text-center py-1">ยังไม่มีรีวิว</p>
        )}
      </div>

      {/* Action bar */}
      <div className="flex border-t border-gray-100 bg-white">
        <button onClick={onReview} className="flex-1 py-2 text-xs font-medium text-green-600 hover:bg-green-50 transition-colors">
          {review ? '✏️ แก้ไขรีวิว' : '+ รีวิว'}
        </button>
        <div className="w-px bg-gray-100" />
        <button
          onClick={() => { if (confirm(`ลบก๊วน "${group.name}"?`)) onDelete(); }}
          className="w-10 flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors text-sm"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
