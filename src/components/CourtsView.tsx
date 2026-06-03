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
  const [search, setSearch] = useState('');

  const q = search.trim().toLowerCase();
  const filteredCourts = courts.filter(court => {
    const dayMatch = selectedDay === 'all' || court.groups.some(g => g.days.includes(selectedDay as DayOfWeek));
    const searchMatch = !q || court.name.toLowerCase().includes(q) || court.groups.some(g => g.name.toLowerCase().includes(q));
    return dayMatch && searchMatch;
  });

  const selectedCourt = filteredCourts.find(c => c.id === selectedCourtId) ?? filteredCourts[0] ?? null;
  const visibleGroups = selectedCourt
    ? (selectedDay === 'all' ? selectedCourt.groups : selectedCourt.groups.filter(g => g.days.includes(selectedDay as DayOfWeek)))
    : [];

  return (
    <div className="max-w-screen-sm mx-auto px-4 pt-5 pb-10 sm:max-w-screen-2xl sm:px-10">
      {/* Top bar */}
      <div className="flex items-center mb-5">
        <h2 className={text.pageTitle}>สนามของฉัน</h2>
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

      {/* Search */}
      <div className="relative mb-4">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--dashed)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
        </svg>
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="ค้นหาสนาม หรือก๊วน..."
          className="w-full pl-9 pr-8 py-2.5 text-sm bg-white border border-[var(--input-b)] rounded-2xl focus:outline-none focus:ring-1 focus:ring-[var(--input-f)] placeholder-[var(--dashed)]"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--dashed)] hover:text-[var(--text-3)]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* List / Map toggle */}
      <div className="flex rounded-full border border-[var(--input-b)] overflow-hidden text-sm w-fit mb-5 bg-white">
        <button onClick={() => setViewMode('list')} className={`px-5 py-1.5 font-medium text-center transition-colors rounded-full ${viewMode === 'list' ? 'bg-[var(--p)] text-white' : 'text-[var(--text-3)] hover:text-[var(--text-2)]'}`}>รายการ</button>
        <button onClick={() => setViewMode('map')}  className={`px-5 py-1.5 font-medium text-center transition-colors rounded-full ${viewMode === 'map'  ? 'bg-[var(--p)] text-white' : 'text-[var(--text-3)] hover:text-[var(--text-2)]'}`}>แผนที่</button>
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
          {filteredCourts.length === 0 && q && (
            <div className="text-center text-sm text-[var(--text-3)] py-10">ไม่พบ "{search}"</div>
          )}
          <div className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-3 sm:mb-6 flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
            {filteredCourts.map(court => {
              const isSelected = selectedCourt?.id === court.id;
              return (
                <div key={court.id} className="relative flex-shrink-0 w-48 sm:w-auto">
                  <button
                    onClick={() => setSelectedCourtId(isSelected ? null : court.id)}
                    onMouseDown={e => e.preventDefault()}
                    className="relative text-left rounded-2xl px-4 py-3 overflow-hidden transition-all w-full"
                    style={{ backgroundColor: isSelected ? 'var(--p-h)' : 'var(--p)', opacity: isSelected ? 1 : 0.9 }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--p-h)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = isSelected ? 'var(--p-h)' : 'var(--p)')}
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
                      return <p className="text-xs text-white/50 truncate max-w-full">{short}</p>;
                    })()}
                    <p className="text-xs text-white/40 mt-1">{court.groups.length} ก๊วน</p>
                  </button>
                  <div className="absolute top-2 right-2 flex gap-1">
                    {(court.lat && court.lng) || court.address ? (
                      <a
                        href={court.lat && court.lng
                          ? `https://www.google.com/maps/dir/?api=1&destination=${court.lat},${court.lng}`
                          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(court.name + ' ' + court.address)}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="w-6 h-6 flex items-center justify-center rounded-full bg-white/10 text-white/40 hover:bg-blue-500/80 hover:text-white transition-colors"
                        title="นำทาง"
                      >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                      </a>
                    ) : null}
                    <button
                      onClick={e => { e.stopPropagation(); setConfirmDeleteCourt({ id: court.id, name: court.name }); }}
                      className="w-6 h-6 flex items-center justify-center rounded-full bg-white/10 text-white/40 hover:bg-red-500/80 hover:text-white transition-colors"
                      title="ลบสนาม"
                    >
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    </button>
                  </div>
                </div>
              );
            })}
            {/* Add court card */}
            <div className="flex-shrink-0 w-48 sm:w-auto">
              <button
                onClick={onAddCourt}
                className="w-full h-full min-h-[88px] border-2 border-dashed border-[var(--dashed)] rounded-2xl flex flex-col items-center justify-center gap-1 text-[var(--text-3)] hover:border-[var(--p)] hover:text-[var(--p)] transition-colors"
              >
                <span className="text-2xl leading-none">+</span>
                <span className="text-xs font-medium">เพิ่มสนาม</span>
              </button>
            </div>
          </div>

          {/* Selected court groups */}
          {selectedCourt && (
            <div>
              {/* Court detail bar */}
              <div className="mb-4 pb-3 border-b border-[var(--input-b)]">
                <div className="flex items-start gap-3">
                  <h3 className="text-base font-semibold text-[var(--text-1)] leading-tight">{selectedCourt.name}</h3>
                </div>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  {(selectedCourt.info?.floor || selectedCourt.info?.air || selectedCourt.info?.parking || selectedCourt.info?.notes) ? (
                    <button onClick={() => onRateCourt(selectedCourt.id)} className="flex items-center gap-1.5 flex-wrap hover:opacity-70 transition-opacity">
                      {selectedCourt.info.floor && <span className="bg-[var(--chip-bg)] text-[var(--chip-t)] text-xs px-2 py-0.5 rounded-full">{FLOOR_LABELS[selectedCourt.info.floor]}</span>}
                      {selectedCourt.info.air   && <span className="bg-[var(--chip-bg)] text-[var(--chip-t)] text-xs px-2 py-0.5 rounded-full">{AIR_LABELS[selectedCourt.info.air]}</span>}
                      {selectedCourt.info.parking && <span className="bg-[var(--chip-bg)] text-[var(--chip-t)] text-xs px-2 py-0.5 rounded-full">{PARKING_LABELS[selectedCourt.info.parking]}</span>}
                      {selectedCourt.info.notes && <span className="bg-[var(--chip-bg)] text-[var(--chip-t)] text-xs px-2 py-0.5 rounded-full">{selectedCourt.info.notes}</span>}
                    </button>
                  ) : (
                    <button onClick={() => onRateCourt(selectedCourt.id)} className="text-xs text-[var(--text-3)] hover:text-[var(--p)]">+ ข้อมูลสนาม</button>
                  )}
                </div>
              </div>

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
                {/* Add group card */}
                <button
                  onClick={() => onAddGroup(selectedCourt.id, selectedDay !== 'all' ? selectedDay : undefined)}
                  className="min-h-[88px] border-2 border-dashed border-[var(--dashed)] rounded-2xl flex flex-col items-center justify-center gap-1 text-[var(--text-3)] hover:border-[var(--p)] hover:text-[var(--p)] transition-colors"
                >
                  <span className="text-2xl leading-none">+</span>
                  <span className="text-xs font-medium">เพิ่มก๊วน</span>
                </button>
              </div>
            </div>
          )}
        </>
      ))}

      {confirmDeleteCourt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center sm:items-center" onClick={() => setConfirmDeleteCourt(null)}>
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
            <p className="text-base font-semibold text-[var(--text-1)] mb-1">ลบสนาม</p>
            <p className="text-sm text-[var(--text-3)] mb-5">"{confirmDeleteCourt.name}" และก๊วนทั้งหมด</p>
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
      <span className="text-[var(--dashed)]">{'★'.repeat(5 - val)}</span>
    </span>
  );
}

function ConfirmDialog({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center sm:items-center" onClick={onCancel}>
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
        <p className="text-base font-semibold text-[var(--text-1)] mb-1">ลบก๊วน</p>
        <p className="text-sm text-[var(--text-3)] mb-5">"{name}"</p>
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
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[var(--card-border)]">
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
        <div className={`relative h-16 ${firstDay ? DAY_COLORS[firstDay].bg : 'bg-[var(--text-4)]'} overflow-hidden`}>
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
            <p className="font-semibold text-[var(--text-1)] text-base leading-tight">{group.name}</p>
            <p className="text-xs text-[var(--text-3)] mt-0.5 mb-2">{group.startTime} – {group.endTime} น.</p>
          </>
        )}
        <div className="flex items-center gap-1 flex-wrap mt-1 mb-2">
          {(Object.keys(DAY_LABELS) as DayOfWeek[]).filter(day => group.days.includes(day)).map(day => (
            <span key={day} className={`text-xs px-2 py-0.5 rounded-full font-bold ${DAY_COLORS[day].pill}`}>{DAY_LABELS[day]}</span>
          ))}
          {group.levels?.slice().sort((a, b) => ALL_LEVELS.indexOf(a) - ALL_LEVELS.indexOf(b)).map(lv => (
            <span key={lv} className="text-xs px-2 py-0.5 rounded-full font-semibold bg-[var(--chip-bg)] text-[var(--chip-t)]">{lv}</span>
          ))}
        </div>
        {group.notes && <p className="text-xs text-[var(--text-3)] mb-2 leading-relaxed">{group.notes}</p>}
        <div className="border-t border-[var(--card-border)] pt-2">
          {editingNote ? (
            <textarea
              autoFocus
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              onFocus={e => { const l = e.target.value.length; e.target.setSelectionRange(l, l); }}
              onBlur={commitNote}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitNote(); } if (e.key === 'Escape') { setNoteText(review?.notes ?? ''); setEditingNote(false); } }}
              placeholder="บันทึกความเห็น..."
              rows={2}
              className="w-full text-xs text-[var(--text-2)] border border-[var(--input-b)] rounded-lg px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-[var(--input-f)]"
              style={{ backgroundColor: 'var(--app-bg)' }}
            />
          ) : (
            <button
              onClick={() => { setNoteText(review?.notes ?? ''); setEditingNote(true); }}
              className="w-full text-left"
            >
              {review?.notes
                ? <p className="text-xs text-[var(--text-4)] leading-relaxed hover:text-[var(--text-2)] transition-colors">{review.notes}</p>
                : <p className="text-xs text-[var(--dashed)] hover:text-[var(--text-3)] transition-colors">+ บันทึกความเห็น</p>
              }
            </button>
          )}
        </div>
      </div>
      {confirming && <ConfirmDialog name={group.name} onConfirm={onDelete} onCancel={() => setConfirming(false)} />}
    </div>
  );
}
