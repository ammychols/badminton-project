import React, { useState } from 'react';
import { Court, Group, DAY_LABELS, DayOfWeek } from '../types';
import { CourtsMap } from './CourtsMap';

interface CourtsViewProps {
  courts: Court[];
  onAddCourt: () => void;
  onAddGroup: (courtId: string, defaultDay?: DayOfWeek) => void;
  onDeleteCourt: (courtId: string) => void;
  onDeleteGroup: (courtId: string, groupId: string) => void;
  onAddReview: (courtId: string, groupId: string) => void;
}

const TODAY_MAP: Record<number, DayOfWeek | 'all'> = { 0: 'SUN', 1: 'MON', 2: 'TUE', 3: 'WED', 4: 'THU', 5: 'FRI', 6: 'SAT' };
const DAY_COLORS: Record<DayOfWeek, { pill: string; active: string }> = {
  MON: { pill: 'bg-yellow-100 text-yellow-700',   active: 'bg-yellow-500 text-white' },
  TUE: { pill: 'bg-pink-100 text-pink-700',        active: 'bg-pink-500 text-white' },
  WED: { pill: 'bg-green-100 text-green-700',      active: 'bg-green-600 text-white' },
  THU: { pill: 'bg-orange-100 text-orange-700',    active: 'bg-orange-500 text-white' },
  FRI: { pill: 'bg-blue-100 text-blue-700',        active: 'bg-blue-500 text-white' },
  SAT: { pill: 'bg-purple-100 text-purple-700',    active: 'bg-purple-500 text-white' },
  SUN: { pill: 'bg-red-100 text-red-600',          active: 'bg-red-500 text-white' },
};
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
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | 'all'>(TODAY_MAP[new Date().getDay()] ?? 'all');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const filteredCourts = selectedDay === 'all'
    ? courts
    : courts.filter(court => court.groups.some(g => g.days.includes(selectedDay as DayOfWeek)));

  return (
    <div className="p-4">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">สนามของฉัน</h2>
        <div className="flex items-center gap-2">
          {/* List / Map toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 font-medium transition-colors ${viewMode === 'list' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              รายการ
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 font-medium transition-colors ${viewMode === 'map' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              แผนที่
            </button>
          </div>
          <button onClick={onAddCourt} className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors">
            + เพิ่มสนาม
          </button>
        </div>
      </div>

      {/* Day filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-5 scrollbar-none">
        {DAY_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSelectedDay(key)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedDay === key
                ? (key === 'all' ? 'bg-gray-800 text-white' : DAY_COLORS[key as DayOfWeek].active)
                : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Map view */}
      {viewMode === 'map' && <CourtsMap courts={courts} />}

      {/* List view */}
      {viewMode === 'list' && (courts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-base">ยังไม่มีสนาม</p>
          <p className="text-sm mt-1">กด "+ เพิ่มสนาม" เพื่อเริ่มต้น</p>
        </div>
      ) : filteredCourts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p>ไม่มีก๊วนในวันนี้</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredCourts.map(court => {
            const visibleGroups = selectedDay === 'all'
              ? court.groups
              : court.groups.filter(g => g.days.includes(selectedDay as DayOfWeek));

            return (
              <div key={court.id} className="bg-white rounded-2xl shadow-sm border border-gray-100">

                {/* Court header */}
                <div className="flex items-start justify-between gap-3 px-4 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800">{court.name}</p>
                    {court.address && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{court.address}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => onAddGroup(court.id, selectedDay !== 'all' ? selectedDay : undefined)}
                      className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
                    >
                      + เพิ่มก๊วน
                    </button>
                    <button
                      onClick={() => { if (confirm(`ลบสนาม "${court.name}" และก๊วนทั้งหมด?`)) onDeleteCourt(court.id); }}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors px-1"
                    >
                      ลบ
                    </button>
                  </div>
                </div>

                {/* Groups */}
                <div className="border-t border-gray-100 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    {court.groups.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-3">
                        ยังไม่มีก๊วน — กด "+ เพิ่มก๊วน" ด้านบน
                      </p>
                    ) : visibleGroups.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-3">ไม่มีก๊วนในวันนี้</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {visibleGroups.map(group => (
                          <GroupCard
                            key={group.id}
                            group={group}
                            onDelete={() => onDeleteGroup(court.id, group.id)}
                            onReview={() => onAddReview(court.id, group.id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function Stars({ val }: { val: number }) {
  return <span className="text-yellow-400 tracking-tight">{'★'.repeat(val)}{'☆'.repeat(5 - val)}</span>;
}

function GroupCard({ group, onDelete, onReview }: { group: Group; onDelete: () => void; onReview: () => void }) {
  const review = group.reviews[0];

  return (
    <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex flex-col">
      {/* Header: name + days + delete */}
      <div className="px-3 pt-3 pb-2 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="font-medium text-sm text-gray-800">{group.name}</p>
            {(Object.keys(DAY_LABELS) as DayOfWeek[]).filter(day => group.days.includes(day)).map(day => (
              <span key={day} className={`text-xs px-2 py-0.5 rounded-full font-medium ${DAY_COLORS[day].pill}`}>
                {DAY_LABELS[day]}
              </span>
            ))}
          </div>
          <p className="text-xs text-green-600 mt-1">{group.startTime} – {group.endTime} น.</p>
        </div>
        <button
          onClick={() => { if (confirm(`ลบก๊วน "${group.name}"?\nการลบไม่สามารถกู้คืนได้`)) onDelete(); }}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors flex-shrink-0 text-base"
          title="ลบก๊วน"
        >
          ×
        </button>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 mx-3" />

      {/* Review section */}
      <div className="px-3 py-2 flex-1">
        {review ? (
          <div className="flex flex-col gap-1.5">
            <div className="grid grid-cols-3 gap-x-2 gap-y-1">
              {[
                { label: '🎉 ความสนุก', val: review.fun },
                { label: '🤝 การจัดมือ', val: review.arrangement },
                { label: '🚗 การเดินทาง', val: review.travel },
              ].map(({ label, val }) => (
                <div key={label} className="flex flex-col">
                  <span className="text-xs text-gray-400">{label}</span>
                  <Stars val={val} />
                </div>
              ))}
            </div>
            {review.notes && <p className="text-xs text-gray-500 italic">"{review.notes}"</p>}
          </div>
        ) : (
          <button
            onClick={onReview}
            className="w-full py-2.5 rounded-lg border border-dashed border-green-300 text-green-600 text-xs font-medium hover:bg-green-50 transition-colors"
          >
            + เพิ่มรีวิว
          </button>
        )}
      </div>

      {/* Footer */}
      {review && (
        <div className="border-t border-gray-100 px-3 py-1.5">
          <button onClick={onReview} className="text-xs text-green-600 font-medium hover:text-green-700 transition-colors py-0.5">
            แก้ไขรีวิว
          </button>
        </div>
      )}
    </div>
  );
    </div>
  );
}
