import React, { useState } from 'react';
import { Court, Group, DAY_LABELS, DayOfWeek, FLOOR_LABELS, AIR_LABELS, PARKING_LABELS, ALL_LEVELS } from '../types';
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

const DAY_COLORS: Record<DayOfWeek, { pill: string; active: string; bg: string }> = {
  MON: { pill: 'bg-yellow-100 text-yellow-700',   active: 'bg-yellow-500 text-white', bg: 'bg-yellow-400' },
  TUE: { pill: 'bg-pink-100 text-pink-700',        active: 'bg-pink-500 text-white',   bg: 'bg-pink-400' },
  WED: { pill: 'bg-green-100 text-green-700',      active: 'bg-green-600 text-white',  bg: 'bg-green-500' },
  THU: { pill: 'bg-orange-100 text-orange-700',    active: 'bg-orange-500 text-white', bg: 'bg-orange-400' },
  FRI: { pill: 'bg-blue-100 text-blue-700',        active: 'bg-blue-500 text-white',   bg: 'bg-blue-500' },
  SAT: { pill: 'bg-purple-100 text-purple-700',    active: 'bg-purple-500 text-white', bg: 'bg-purple-500' },
  SUN: { pill: 'bg-red-100 text-red-600',          active: 'bg-red-500 text-white',    bg: 'bg-red-400' },
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
    <div className="px-4 pt-5 pb-10">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 leading-tight">สนามของฉัน</h2>
          <p className="text-sm text-gray-400 mt-0.5">{courts.length} สนาม</p>
        </div>
        <button onClick={onAddCourt} className="bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-700 transition-colors">
          + เพิ่มสนาม
        </button>
      </div>

      {/* Day filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-none">
        {DAY_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSelectedDay(key)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              selectedDay === key
                ? (key === 'all' ? 'bg-gray-900 text-white' : DAY_COLORS[key as DayOfWeek].active)
                : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List / Map toggle */}
      <div className="flex rounded-full border border-gray-200 overflow-hidden text-sm w-fit mb-8 bg-white">
        <button onClick={() => setViewMode('list')} className={`w-20 py-2 font-semibold text-center transition-colors rounded-full ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-700'}`}>รายการ</button>
        <button onClick={() => setViewMode('map')}  className={`w-20 py-2 font-semibold text-center transition-colors rounded-full ${viewMode === 'map'  ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-700'}`}>แผนที่</button>
      </div>

      {viewMode === 'map' && <CourtsMap courts={filteredCourts} />}

      {viewMode === 'list' && (courts.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-6xl mb-4">🏸</p>
          <p className="text-xl font-bold text-gray-800">ยังไม่มีสนาม</p>
          <p className="text-sm text-gray-400 mt-2">กด "+ เพิ่มสนาม" เพื่อเริ่มต้น</p>
        </div>
      ) : filteredCourts.length === 0 ? (
        <div className="text-center py-24 text-gray-400">ไม่มีก๊วนในวันนี้</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredCourts.map(court => {
            const visibleGroups = selectedDay === 'all'
              ? court.groups
              : court.groups.filter(g => g.days.includes(selectedDay as DayOfWeek));

            return (
              <div key={court.id}>
                {/* Court header — lifestyle style */}
                <div className="relative bg-gray-900 rounded-3xl px-6 py-5 overflow-hidden mb-3">
                  {/* Decorative large letter background */}
                  <span className="absolute -right-2 -top-4 text-[9rem] font-black text-white/5 leading-none select-none pointer-events-none">
                    {court.name.charAt(0).toUpperCase()}
                  </span>

                  <div className="relative flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-2xl font-black text-white leading-tight mb-1">{court.name}</p>

                      {court.address && (() => {
                        const parts = court.address.split(',').map(s => s.trim()).filter(s => s && s !== 'Thailand');
                        const short = parts.slice(-2).join(' · ');
                        return (
                          <button onClick={() => setViewMode('map')} title={court.address} className="flex items-center gap-1 text-xs text-gray-500 hover:text-green-400 transition-colors text-left mb-3">
                            <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                            {short}
                          </button>
                        );
                      })()}

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {(court.info?.floor || court.info?.air || court.info?.parking || court.info?.notes) ? (
                          <button onClick={() => onRateCourt(court.id)} className="flex items-center gap-1.5 flex-wrap hover:opacity-80 transition-opacity">
                            {court.info.floor && <span className="bg-white/10 text-gray-300 text-xs px-2.5 py-1 rounded-full">{FLOOR_LABELS[court.info.floor]}</span>}
                            {court.info.air   && <span className="bg-white/10 text-gray-300 text-xs px-2.5 py-1 rounded-full">{AIR_LABELS[court.info.air]}</span>}
                            {court.info.parking && <span className="bg-white/10 text-gray-300 text-xs px-2.5 py-1 rounded-full">{PARKING_LABELS[court.info.parking]}</span>}
                            {court.info.notes && <span className="text-xs text-gray-400">{court.info.notes}</span>}
                          </button>
                        ) : (
                          <button onClick={() => onRateCourt(court.id)} className="bg-white/10 hover:bg-white/20 text-gray-400 hover:text-gray-200 text-xs px-2.5 py-1 rounded-full transition-colors">
                            + ข้อมูลสนาม
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => setConfirmDeleteCourt({ id: court.id, name: court.name })} className="text-gray-400 hover:text-red-400 transition-colors text-xs">ลบ</button>
                      <button
                        onClick={() => onAddGroup(court.id, selectedDay !== 'all' ? selectedDay : undefined)}
                        className="bg-green-500 hover:bg-green-400 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors"
                      >
                        + ก๊วน
                      </button>
                    </div>
                  </div>
                </div>

                {/* Groups */}
                {court.groups.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">ยังไม่มีก๊วน</p>
                ) : visibleGroups.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">ไม่มีก๊วนในวันนี้</p>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
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
      <span className="text-gray-300">{'★'.repeat(5 - val)}</span>
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
  const firstDay = (Object.keys(DAY_LABELS) as DayOfWeek[]).find(d => group.days.includes(d));

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      {/* Image with overlay — or colorful top strip */}
      {group.image ? (
        <div className="relative h-40 overflow-hidden">
          <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          {/* Actions float top-right */}
          <div className="absolute top-2 right-2 flex gap-1">
            <button onClick={onEdit} className="w-7 h-7 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors text-sm backdrop-blur-sm">✎</button>
            <button onClick={() => setConfirming(true)} className="w-7 h-7 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-red-500/80 transition-colors text-lg leading-none backdrop-blur-sm">×</button>
          </div>
          {/* Name + time overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
            <p className="font-black text-white text-lg leading-tight">{group.name}</p>
            <p className="text-xs text-green-300 font-semibold">{group.startTime} – {group.endTime} น.</p>
          </div>
        </div>
      ) : (
        <div className={`relative h-16 ${firstDay ? DAY_COLORS[firstDay].bg : 'bg-gray-400'} overflow-hidden`}>
          <span className="absolute -right-1 -top-2 text-6xl font-black text-white/20 leading-none select-none">{group.name.charAt(0)}</span>
          <div className="absolute top-2 right-2 flex gap-1">
            <button onClick={onEdit} className="w-6 h-6 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors text-xs">✎</button>
            <button onClick={() => setConfirming(true)} className="w-6 h-6 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-red-500/60 transition-colors text-base leading-none">×</button>
          </div>
        </div>
      )}

      <div className="px-3 pt-3 pb-3">
        {!group.image && (
          <>
            <p className="font-black text-gray-900 text-base leading-tight">{group.name}</p>
            <p className="text-xs font-semibold text-emerald-600 mt-0.5 mb-2">{group.startTime} – {group.endTime} น.</p>
          </>
        )}

        {/* Day + level pills */}
        <div className="flex items-center gap-1 flex-wrap mt-1 mb-2">
          {(Object.keys(DAY_LABELS) as DayOfWeek[]).filter(day => group.days.includes(day)).map(day => (
            <span key={day} className={`text-xs px-2 py-0.5 rounded-full font-bold ${DAY_COLORS[day].pill}`}>{DAY_LABELS[day]}</span>
          ))}
          {group.levels?.slice().sort((a, b) => ALL_LEVELS.indexOf(a) - ALL_LEVELS.indexOf(b)).map(lv => (
            <span key={lv} className="text-xs px-2 py-0.5 rounded-full font-semibold bg-gray-100 text-gray-500">{lv}</span>
          ))}
        </div>

        {group.notes && (
          <p className="text-xs text-gray-500 mb-2 leading-relaxed">{group.notes}</p>
        )}

        {/* Review */}
        <div className="border-t border-gray-100 pt-2 flex items-center justify-between gap-2">
          {review ? (
            <>
              <div className="flex flex-col gap-1.5">
                {review.notes && <p className="text-xs text-gray-500">{review.notes}</p>}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">🎉 ความสนุก</span>
                    <MiniStars val={review.fun} />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">🤝 การจัดมือ</span>
                    <MiniStars val={review.arrangement} />
                  </div>
                </div>
              </div>
              <button onClick={onReview} className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex-shrink-0">แก้ไข</button>
            </>
          ) : (
            <button onClick={onReview} className="text-xs text-emerald-600 font-semibold hover:text-emerald-700">+ เพิ่มรีวิว</button>
          )}
        </div>
      </div>

      {confirming && <ConfirmDialog name={group.name} onConfirm={onDelete} onCancel={() => setConfirming(false)} />}
    </div>
  );
}
