import React, { useState } from 'react';
import { Court, Group, DAY_LABELS, DayOfWeek } from '../types';
import { CourtsMap } from './CourtsMap';

interface CourtsViewProps {
  courts: Court[];
  onAddCourt: () => void;
  onAddGroup: (courtId: string, defaultDay?: DayOfWeek) => void;
  onDeleteCourt: (courtId: string) => void;
  onDeleteGroup: (courtId: string, groupId: string) => void;
  onEditGroup: (courtId: string, groupId: string) => void;
  onRateCourt: (courtId: string) => void;
  onClearCourtRating: (courtId: string) => void;
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

export function CourtsView({ courts, onAddCourt, onAddGroup, onDeleteCourt, onDeleteGroup, onEditGroup, onRateCourt, onClearCourtRating, onAddReview }: CourtsViewProps) {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | 'all'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [confirmDeleteCourt, setConfirmDeleteCourt] = useState<{ id: string; name: string } | null>(null);

  const filteredCourts = selectedDay === 'all'
    ? courts
    : courts.filter(court => court.groups.some(g => g.days.includes(selectedDay as DayOfWeek)));

  return (
    <div className="p-4">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">สนามของฉัน</h2>
        <button onClick={onAddCourt} className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors">
          + เพิ่มสนาม
        </button>
      </div>

      {/* Day filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-3 scrollbar-none">
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

      {/* List / Map toggle */}
      <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm w-fit mb-5">
        <button
          onClick={() => setViewMode('list')}
          className={`px-4 py-1.5 font-medium transition-colors ${viewMode === 'list' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          รายการ
        </button>
        <button
          onClick={() => setViewMode('map')}
          className={`px-4 py-1.5 font-medium transition-colors ${viewMode === 'map' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          แผนที่
        </button>
      </div>

      {/* Map view */}
      {viewMode === 'map' && <CourtsMap courts={filteredCourts} />}

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
                    {/* Court ratings */}
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {court.rating?.travel ? (
                        <span className="text-xs text-gray-500">🚗 <MiniStars val={court.rating.travel} /></span>
                      ) : null}
                      {court.rating?.floor ? (
                        <span className="text-xs text-gray-500">🏸 <MiniStars val={court.rating.floor} /></span>
                      ) : null}
                      {court.rating?.notes && (
                        <span className="text-xs text-gray-400">{court.rating.notes}</span>
                      )}
                      <button onClick={() => onRateCourt(court.id)} className="text-xs text-green-600 hover:text-green-700 font-medium">
                        {court.rating ? 'แก้ไข' : '+ ให้คะแนนสนาม'}
                      </button>
                      {court.rating && (
                        <button onClick={() => onClearCourtRating(court.id)} className="text-xs text-red-400 hover:text-red-600 font-medium">
                          ลบ
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => onAddGroup(court.id, selectedDay !== 'all' ? selectedDay : undefined)}
                      className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
                    >
                      + เพิ่มก๊วน
                    </button>
                    <button
                      onClick={() => setConfirmDeleteCourt({ id: court.id, name: court.name })}
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
                            onEdit={() => onEditGroup(court.id, group.id)}
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
      {confirmDeleteCourt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center sm:items-center" onClick={() => setConfirmDeleteCourt(null)}>
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
            <p className="text-base font-semibold text-gray-800 mb-1">ลบสนาม</p>
            <p className="text-sm text-gray-400 mb-5">"{confirmDeleteCourt.name}" และก๊วนทั้งหมด</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDeleteCourt(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                ยกเลิก
              </button>
              <button onClick={() => { onDeleteCourt(confirmDeleteCourt.id); setConfirmDeleteCourt(null); }} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStars({ val }: { val: number }) {
  return (
    <span className="text-sm leading-none">
      <span className="text-yellow-400">{'★'.repeat(val)}</span>
      <span className="text-gray-200">{'★'.repeat(5 - val)}</span>
    </span>
  );
}

function ConfirmDialog({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center sm:items-center" onClick={onCancel}>
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
        <p className="text-base font-semibold text-gray-800 mb-1">ลบก๊วน</p>
        <p className="text-sm text-gray-400 mb-5">"{name}"</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            ยกเลิก
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">
            ลบ
          </button>
        </div>
      </div>
    </div>
  );
}

function GroupCard({ group, onDelete, onEdit, onReview }: { group: Group; onDelete: () => void; onEdit: () => void; onReview: () => void }) {
  const review = group.reviews[0];
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-3 pt-3 pb-2.5 flex items-start justify-between gap-2 border-b border-gray-100">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span className="font-semibold text-sm text-gray-800">{group.name}</span>
            {(Object.keys(DAY_LABELS) as DayOfWeek[]).filter(day => group.days.includes(day)).map(day => (
              <span key={day} className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${DAY_COLORS[day].pill}`}>
                {DAY_LABELS[day]}
              </span>
            ))}
            {group.levels?.map(lv => (
              <span key={lv} className="text-xs px-1.5 py-0.5 rounded font-medium bg-gray-100 text-gray-500 border border-gray-200">
                {lv}
              </span>
            ))}
          </div>
          <span className="text-sm font-semibold text-gray-700">{group.startTime} – {group.endTime} <span className="text-xs font-normal text-gray-400">น.</span></span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onEdit}
            className="w-6 h-6 flex items-center justify-center rounded-md text-gray-300 hover:text-blue-400 hover:bg-blue-50 transition-colors text-sm"
          >✎</button>
          <button
            onClick={() => setConfirming(true)}
            className="w-6 h-6 flex items-center justify-center rounded-md text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors flex-shrink-0 text-lg leading-none"
          >×</button>
        </div>
      </div>

      {/* Review */}
      <div className="border-t border-gray-100">
        {review ? (
          <div className="px-3 py-2.5 flex flex-col gap-1.5">
            {[
              { icon: '🎉', label: 'ความสนุก', val: review.fun },
              { icon: '🤝', label: 'การจัดมือ', val: review.arrangement },
            ].map(({ icon, label, val }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{icon} {label}</span>
                <MiniStars val={val} />
              </div>
            ))}
            {review.notes && (
              <p className="text-xs text-gray-500 pt-1 border-t border-gray-100">{review.notes}</p>
            )}
            <button onClick={onReview} className="text-xs text-green-600 hover:text-green-700 font-medium transition-colors pt-0.5">
              แก้ไขรีวิว
            </button>
          </div>
        ) : (
          <button onClick={onReview} className="w-full py-3 text-xs text-green-600 font-medium hover:bg-green-50 transition-colors">
            + เพิ่มรีวิว
          </button>
        )}
      </div>

      {confirming && (
        <ConfirmDialog name={group.name} onConfirm={onDelete} onCancel={() => setConfirming(false)} />
      )}
    </div>
  );
}
