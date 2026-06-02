import React, { useState } from 'react';
import { Court, Group, DAY_LABELS, DayOfWeek, FLOOR_LABELS, AIR_LABELS, PARKING_LABELS, ALL_LEVELS } from '../types';
import { CourtsMap } from './CourtsMap';
import { btn, emptyState, text } from '../styles/tokens';

interface CourtsViewProps {
  courts: Court[];
  onAddCourt: () => void;
  onAddGroup: (courtId: string, defaultDay?: DayOfWeek) => void;
  onDeleteCourt: (courtId: string) => void;
  onDeleteGroup: (courtId: string, groupId: string) => void;
  onEditGroup: (courtId: string, groupId: string) => void;
  onRateCourt: (courtId: string) => void;
  onAddReview: (courtId: string, groupId: string, notes: string) => void;
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
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(() => courts[0]?.id ?? null);
  const [confirmDeleteCourt, setConfirmDeleteCourt] = useState<{ id: string; name: string } | null>(null);

  const filteredCourts = selectedDay === 'all'
    ? courts
    : courts.filter(court => court.groups.some(g => g.days.includes(selectedDay as DayOfWeek)));

  const selectedCourt = courts.find(c => c.id === selectedCourtId) ?? filteredCourts[0] ?? null;
  const visibleGroups = selectedCourt
    ? (selectedDay === 'all' ? selectedCourt.groups : selectedCourt.groups.filter(g => g.days.includes(selectedDay as DayOfWeek)))
    : [];

  return (
    <div className="max-w-screen-sm mx-auto px-4 pt-5 pb-10 sm:max-w-screen-2xl sm:px-10">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-5">
        <h2 className={text.pageTitle}>สนามของฉัน</h2>
        <button onClick={onAddCourt} className={btn.primaryIcon}>
          <span className="text-lg leading-none">+</span> เพิ่มสนาม
        </button>
      </div>

      {/* Day filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-4 scrollbar-none">
        {DAY_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSelectedDay(key)}
            className={`flex-shrink-0 ${btn.pill} ${
              selectedDay === key
                ? (key === 'all' ? btn.pillActive : DAY_COLORS[key as DayOfWeek].active)
                : btn.pillInactive
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List / Map toggle */}
      <div className="flex rounded-full border border-gray-200 overflow-hidden text-sm w-fit mb-5 bg-white">
        <button onClick={() => setViewMode('list')} className={`px-5 py-1.5 font-medium text-center transition-colors rounded-full ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-700'}`}>รายการ</button>
        <button onClick={() => setViewMode('map')}  className={`px-5 py-1.5 font-medium text-center transition-colors rounded-full ${viewMode === 'map'  ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-700'}`}>แผนที่</button>
      </div>

      {viewMode === 'map' && <CourtsMap courts={filteredCourts} />}

      {viewMode === 'list' && (courts.length === 0 ? (
        <div className={emptyState.wrapper}>
          <div className={emptyState.icon}>🏸</div>
          <div className={emptyState.title}>เพิ่มสนามแบดมินตัน</div>
          <div className={emptyState.subtitle}>บันทึกสนามที่ชอบไปตีไว้ที่นี่</div>
          <button onClick={onAddCourt} className={btn.primaryLg}>
            + เพิ่มสนามแรก
          </button>
        </div>
      ) : (
        <>
          {/* Court grid */}
          <div className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-3 sm:mb-6 flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
            {filteredCourts.map(court => {
              const isSelected = selectedCourt?.id === court.id;
              return (
                <div key={court.id} className="relative flex-shrink-0 w-48 sm:w-auto">
                  <button
                    onClick={() => setSelectedCourtId(isSelected ? null : court.id)}
                    onMouseDown={e => e.preventDefault()}
                    className={`relative text-left rounded-2xl px-4 py-3 overflow-hidden transition-all w-full ${
                      isSelected ? 'bg-gray-800' : 'bg-gray-900/80 hover:bg-gray-800'
                    }`}
                  >
                    <span className="absolute -right-1 -bottom-2 text-6xl font-black text-white/5 leading-none select-none pointer-events-none">
                      {court.name.charAt(0).toUpperCase()}
                    </span>
                    <p className="font-semibold text-white text-sm leading-tight truncate mb-1 pr-5">{court.name}</p>
                    {court.address && (() => {
                      const parts = court.address
                        .split(',')
                        .map(s => s.trim())
                        .filter(s => s && s !== 'Thailand' && !/^\d{5}/.test(s) && s.length > 1);
                      const short = parts.length >= 2
                        ? parts.slice(-2).join(' · ')
                        : parts[0] ?? court.address;
                      return <p className="text-xs text-gray-400 truncate max-w-full">{short}</p>;
                    })()}
                    <p className="text-xs text-gray-500 mt-1">{court.groups.length} ก๊วน</p>
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setConfirmDeleteCourt({ id: court.id, name: court.name }); }}
                    className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-white/10 text-white/40 hover:bg-red-500/80 hover:text-white transition-colors"
                    title="ลบสนาม"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Selected court groups */}
          {selectedCourt && (
            <div>
              {/* Court detail bar */}
              <div className="mb-4 pb-3 border-b border-gray-200">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold text-gray-900 leading-tight">{selectedCourt.name}</h3>
                  <button
                    onClick={() => onAddGroup(selectedCourt.id, selectedDay !== 'all' ? selectedDay : undefined)}
                    className="bg-gray-900 hover:bg-gray-700 text-white text-xs font-medium px-3 py-1.5 rounded-full transition-colors whitespace-nowrap flex-shrink-0"
                  >
                    + ก๊วน
                  </button>
                </div>
                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(selectedCourt.info?.floor || selectedCourt.info?.air || selectedCourt.info?.parking) ? (
                      <button onClick={() => onRateCourt(selectedCourt.id)} className="flex items-center gap-1.5 hover:opacity-70 transition-opacity">
                        {selectedCourt.info.floor && <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">{FLOOR_LABELS[selectedCourt.info.floor]}</span>}
                        {selectedCourt.info.air   && <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">{AIR_LABELS[selectedCourt.info.air]}</span>}
                        {selectedCourt.info.parking && <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">{PARKING_LABELS[selectedCourt.info.parking]}</span>}
                      </button>
                    ) : (
                      <button onClick={() => onRateCourt(selectedCourt.id)} className="text-xs text-gray-400 hover:text-gray-600">+ ข้อมูลสนาม</button>
                    )}
                  </div>
                  {selectedCourt.info?.notes && (
                    <p className="text-xs text-gray-400 leading-relaxed">{selectedCourt.info.notes}</p>
                  )}
                </div>
              </div>

              {visibleGroups.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-12">
                  {selectedCourt.groups.length === 0 ? 'ยังไม่มีก๊วน' : 'ไม่มีก๊วนในวันนี้'}
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {visibleGroups.map(group => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      onDelete={() => onDeleteGroup(selectedCourt.id, group.id)}
                      onEdit={() => onEditGroup(selectedCourt.id, group.id)}
                      onSaveNote={(notes) => onAddReview(selectedCourt.id, group.id, notes)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      ))}

      {confirmDeleteCourt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center sm:items-center" onClick={() => setConfirmDeleteCourt(null)}>
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
            <p className="text-base font-semibold text-gray-800 mb-1">ลบสนาม</p>
            <p className="text-sm text-gray-400 mb-5">"{confirmDeleteCourt.name}" และก๊วนทั้งหมด</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDeleteCourt(null)} className={btn.cancel}>ยกเลิก</button>
              <button onClick={() => { onDeleteCourt(confirmDeleteCourt.id); setConfirmDeleteCourt(null); setSelectedCourtId(null); }} className={btn.danger}>ลบ</button>
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
          <button onClick={onCancel} className={btn.cancel}>ยกเลิก</button>
          <button onClick={onConfirm} className={btn.danger}>ลบ</button>
        </div>
      </div>
    </div>
  );
}

function GroupCard({ group, onDelete, onEdit, onSaveNote }: { group: Group; onDelete: () => void; onEdit: () => void; onSaveNote: (notes: string) => void }) {
  const review = group.reviews[0];
  const [confirming, setConfirming] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(review?.notes ?? '');
  const firstDay = (Object.keys(DAY_LABELS) as DayOfWeek[]).find(d => group.days.includes(d));

  const commitNote = () => {
    setEditingNote(false);
    onSaveNote(noteText.trim());
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      {group.image ? (
        <div className="relative h-40 overflow-hidden">
          <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute top-2 right-2 flex gap-1">
            <button onClick={onEdit} className="w-7 h-7 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors text-sm backdrop-blur-sm">✎</button>
            <button onClick={() => setConfirming(true)} className="w-7 h-7 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-red-500/80 transition-colors backdrop-blur-sm">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
            <p className="font-semibold text-white text-base leading-tight">{group.name}</p>
            <p className="text-xs text-white/60 mt-0.5">{group.startTime} – {group.endTime} น.</p>
          </div>
        </div>
      ) : (
        <div className={`relative h-16 ${firstDay ? DAY_COLORS[firstDay].bg : 'bg-gray-400'} overflow-hidden`}>
          <span className="absolute -right-1 -top-2 text-6xl font-black text-white/20 leading-none select-none">{group.name.charAt(0)}</span>
          <div className="absolute top-2 right-2 flex gap-1">
            <button onClick={onEdit} className="w-6 h-6 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors text-xs">✎</button>
            <button onClick={() => setConfirming(true)} className="w-6 h-6 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-red-500/60 transition-colors">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              </button>
          </div>
        </div>
      )}

      <div className="px-3 pt-3 pb-3">
        {!group.image && (
          <>
            <p className="font-semibold text-gray-900 text-base leading-tight">{group.name}</p>
            <p className="text-xs text-gray-400 mt-0.5 mb-2">{group.startTime} – {group.endTime} น.</p>
          </>
        )}
        <div className="flex items-center gap-1 flex-wrap mt-1 mb-2">
          {(Object.keys(DAY_LABELS) as DayOfWeek[]).filter(day => group.days.includes(day)).map(day => (
            <span key={day} className={`text-xs px-2 py-0.5 rounded-full font-bold ${DAY_COLORS[day].pill}`}>{DAY_LABELS[day]}</span>
          ))}
          {group.levels?.slice().sort((a, b) => ALL_LEVELS.indexOf(a) - ALL_LEVELS.indexOf(b)).map(lv => (
            <span key={lv} className="text-xs px-2 py-0.5 rounded-full font-semibold bg-gray-100 text-gray-500">{lv}</span>
          ))}
        </div>
        {group.notes && <p className="text-xs text-gray-400 mb-2 leading-relaxed">{group.notes}</p>}
        <div className="border-t border-gray-100 pt-2">
          {editingNote ? (
            <textarea
              autoFocus
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              onBlur={commitNote}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitNote(); } if (e.key === 'Escape') { setNoteText(review?.notes ?? ''); setEditingNote(false); } }}
              placeholder="บันทึกความเห็น..."
              rows={2}
              className="w-full text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
          ) : (
            <button
              onClick={() => { setNoteText(review?.notes ?? ''); setEditingNote(true); }}
              className="w-full text-left"
            >
              {review?.notes
                ? <p className="text-xs text-gray-500 leading-relaxed hover:text-gray-700 transition-colors">{review.notes}</p>
                : <p className="text-xs text-gray-300 hover:text-gray-400 transition-colors">+ บันทึกความเห็น</p>
              }
            </button>
          )}
        </div>
      </div>
      {confirming && <ConfirmDialog name={group.name} onConfirm={onDelete} onCancel={() => setConfirming(false)} />}
    </div>
  );
}
