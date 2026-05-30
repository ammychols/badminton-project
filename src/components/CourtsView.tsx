import React, { useState } from 'react';
import { Court, Group, DAY_LABELS, DayOfWeek, FLOOR_LABELS, AIR_LABELS, PARKING_LABELS } from '../types';
import { CourtsMap } from './CourtsMap';

interface CourtsViewProps {
  courts: Court[];
  onAddCourt: () => void;
  onAddGroup: (courtId: string, defaultDay?: DayOfWeek) => void;
  onDeleteCourt: (courtId: string) => void;
  onDeleteGroup: (courtId: string, groupId: string) => void;
  onEditGroup: (courtId: string, groupId: string) => void;
  onRateCourt: (courtId: string) => void;
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

export function CourtsView({ courts, onAddCourt, onAddGroup, onDeleteCourt, onDeleteGroup, onEditGroup, onRateCourt, onAddReview }: CourtsViewProps) {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | 'all'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [confirmDeleteCourt, setConfirmDeleteCourt] = useState<{ id: string; name: string } | null>(null);

  const filteredCourts = selectedDay === 'all'
    ? courts
    : courts.filter(court => court.groups.some(g => g.days.includes(selectedDay as DayOfWeek)));

  return (
    <div className="p-4">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold text-gray-900">สนามของฉัน</h2>
        <button onClick={onAddCourt} className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm">
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
                ? (key === 'all' ? 'bg-gray-900 text-white' : DAY_COLORS[key as DayOfWeek].active)
                : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List / Map toggle */}
      <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm w-fit mb-6 bg-white">
        <button onClick={() => setViewMode('list')} className={`px-4 py-1.5 font-medium transition-colors ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>รายการ</button>
        <button onClick={() => setViewMode('map')}  className={`px-4 py-1.5 font-medium transition-colors ${viewMode === 'map'  ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>แผนที่</button>
      </div>

      {viewMode === 'map' && <CourtsMap courts={filteredCourts} />}

      {viewMode === 'list' && (courts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🏸</p>
          <p className="font-medium text-gray-500">ยังไม่มีสนาม</p>
          <p className="text-sm mt-1">กด "+ เพิ่มสนาม" เพื่อเริ่มต้น</p>
        </div>
      ) : filteredCourts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">ไม่มีก๊วนในวันนี้</div>
      ) : (
        <div className="flex flex-col gap-5">
          {filteredCourts.map(court => {
            const visibleGroups = selectedDay === 'all'
              ? court.groups
              : court.groups.filter(g => g.days.includes(selectedDay as DayOfWeek));

            return (
              <div key={court.id} className="rounded-2xl overflow-hidden shadow-md border border-gray-100">

                {/* Court header — dark gradient */}
                <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Initial badge + name */}
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                          <span className="text-white font-bold text-sm">{court.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <p className="font-bold text-white text-lg leading-tight">{court.name}</p>
                      </div>
                      {court.address && (
                        <p className="text-xs text-gray-400 ml-12 truncate">{court.address}</p>
                      )}
                      {/* Info chips */}
                      {(court.info?.floor || court.info?.air || court.info?.parking || court.info?.notes) && (
                        <div className="flex items-center gap-1.5 mt-2.5 ml-12 flex-wrap">
                          {court.info.floor && <span className="bg-white/10 text-gray-300 text-xs px-2.5 py-0.5 rounded-full">{FLOOR_LABELS[court.info.floor]}</span>}
                          {court.info.air   && <span className="bg-white/10 text-gray-300 text-xs px-2.5 py-0.5 rounded-full">{AIR_LABELS[court.info.air]}</span>}
                          {court.info.parking && <span className="bg-white/10 text-gray-300 text-xs px-2.5 py-0.5 rounded-full">{PARKING_LABELS[court.info.parking]}</span>}
                          {court.info.notes && <span className="text-xs text-gray-400">{court.info.notes}</span>}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => onRateCourt(court.id)} className="text-gray-500 hover:text-gray-300 transition-colors text-sm" title="ข้อมูลสนาม">✎</button>
                      <button
                        onClick={() => onAddGroup(court.id, selectedDay !== 'all' ? selectedDay : undefined)}
                        className="bg-green-500 hover:bg-green-400 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                      >
                        + ก๊วน
                      </button>
                      <button onClick={() => setConfirmDeleteCourt({ id: court.id, name: court.name })} className="text-gray-600 hover:text-red-400 transition-colors text-xs">ลบ</button>
                    </div>
                  </div>
                </div>

                {/* Groups */}
                <div className="bg-gray-50 px-4 py-3 flex flex-col gap-2">
                  {court.groups.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-3">ยังไม่มีก๊วน</p>
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
              <button onClick={() => setConfirmDeleteCourt(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">ยกเลิก</button>
              <button onClick={() => { onDeleteCourt(confirmDeleteCourt.id); setConfirmDeleteCourt(null); }} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">ลบ</button>
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
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">ยกเลิก</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">ลบ</button>
        </div>
      </div>
    </div>
  );
}

function GroupCard({ group, onDelete, onEdit, onReview }: { group: Group; onDelete: () => void; onEdit: () => void; onReview: () => void }) {
  const review = group.reviews[0];
  const [confirming, setConfirming] = useState(false);

  // Pick the first day's color for the left accent
  const firstDay = (Object.keys(DAY_LABELS) as DayOfWeek[]).find(d => group.days.includes(d));
  const accentClass = firstDay ? DAY_COLORS[firstDay].active : 'bg-gray-400';

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex-1 min-w-0 px-3 py-3">
        {/* Top row: name + time + actions */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <span className="font-extrabold text-base text-gray-900 block truncate leading-tight">{group.name}</span>
            <span className="text-xs font-medium text-emerald-600 mt-0.5 block">{group.startTime} – {group.endTime} น.</span>
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0 -mt-0.5">
            <button onClick={onEdit} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-blue-400 hover:bg-blue-50 transition-colors text-sm">✎</button>
            <button onClick={() => setConfirming(true)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors text-xl leading-none">×</button>
          </div>
        </div>

        {/* Pills row: day + levels */}
        <div className="flex items-center gap-1 flex-wrap mb-2.5">
          {(Object.keys(DAY_LABELS) as DayOfWeek[]).filter(day => group.days.includes(day)).map(day => (
            <span key={day} className={`text-xs px-2 py-0.5 rounded-full font-semibold ${DAY_COLORS[day].pill}`}>{DAY_LABELS[day]}</span>
          ))}
          {group.levels?.map(lv => (
            <span key={lv} className="text-xs px-1.5 py-0.5 rounded-md font-medium bg-gray-100 text-gray-500">{lv}</span>
          ))}
        </div>

        {/* Review section */}
        {review ? (
          <div className="border-t border-gray-100 pt-2">
            {/* Inline stars */}
            <div className="flex flex-col gap-0.5 mb-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-700">ความสนุก</span>
                <MiniStars val={review.fun} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-700">การจัดมือ</span>
                <MiniStars val={review.arrangement} />
              </div>
            </div>
            {review.notes && <p className="text-xs text-gray-400 mb-1">{review.notes}</p>}
            <button onClick={onReview} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">แก้ไขรีวิว</button>
          </div>
        ) : (
          <button onClick={onReview} className="w-full text-xs text-emerald-600 font-medium py-1.5 rounded-lg border border-dashed border-emerald-200 hover:bg-emerald-50 transition-colors">
            + เพิ่มรีวิว
          </button>
        )}
      </div>

      {confirming && <ConfirmDialog name={group.name} onConfirm={onDelete} onCancel={() => setConfirming(false)} />}
    </div>
  );
}
