import React, { useState, useEffect, useRef } from 'react';
import { Court, Group, DAY_LABELS, DayOfWeek, FLOOR_LABELS, AIR_LABELS, PARKING_LABELS, ALL_LEVELS } from '../types';
import { CourtsMap } from './CourtsMap';
import { ConfirmDialog } from './ConfirmDialog';
import { btn, emptyState, text } from '../styles/tokens';

interface CourtsViewProps {
  courts: Court[];
  highlightCourtId?: string | null;
  onHighlightClear?: () => void;
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


export function CourtsView({ courts, highlightCourtId, onHighlightClear, onAddCourt, onAddGroup, onDeleteCourt, onDeleteGroup, onEditGroup, onRateCourt, onAddReview }: CourtsViewProps) {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | 'all'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(() => courts[0]?.id ?? null);
  const courtRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [confirmDeleteCourt, setConfirmDeleteCourt] = useState<{ id: string; name: string } | null>(null);
  const [search, setSearch] = useState('');
  const [courtMenu, setCourtMenu] = useState(false);
  const courtMenuRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!courtMenu) return;
    const handler = (e: MouseEvent) => {
      if (courtMenuRef.current && !courtMenuRef.current.contains(e.target as Node)) setCourtMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [courtMenu]);

  useEffect(() => {
    if (!highlightCourtId) return;
    setSelectedCourtId(highlightCourtId);
    setSelectedDay('all');
    setTimeout(() => {
      courtRefs.current[highlightCourtId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      onHighlightClear?.();
    }, 100);
  }, [highlightCourtId]);

  const q = search.trim().toLowerCase();
  const filteredCourts = courts.filter(court => {
    const dayMatch = selectedDay === 'all' || court.groups.some(g => g.days.includes(selectedDay as DayOfWeek));
    const searchMatch = !q || court.name.toLowerCase().includes(q) || court.groups.some(g => g.name.toLowerCase().includes(q));
    return dayMatch && searchMatch;
  });

  const selectedCourt = filteredCourts.find(c => c.id === selectedCourtId) ?? filteredCourts[0] ?? null;

  // Reset day filter when a group is added to the currently selected court
  const prevCourtSnapshot = useRef<{ id: string; count: number } | null>(null);
  const courtSnapshot = selectedCourt ? { id: selectedCourt.id, count: selectedCourt.groups.length } : null;
  useEffect(() => {
    const prev = prevCourtSnapshot.current;
    if (prev && courtSnapshot && prev.id === courtSnapshot.id && courtSnapshot.count > prev.count) {
      setSelectedDay('all');
    }
    prevCourtSnapshot.current = courtSnapshot;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courtSnapshot?.id, courtSnapshot?.count]);

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
          placeholder="ค้นหาก๊วน หรือสนาม..."
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
        <button onClick={() => setViewMode('list')} className={`px-5 py-1.5 font-medium text-center transition-colors rounded-full ${viewMode === 'list' ? 'bg-[var(--p)] text-[var(--p-text)]' : 'text-[var(--text-3)] hover:text-[var(--text-2)]'}`}>รายการ</button>
        <button onClick={() => setViewMode('map')}  className={`px-5 py-1.5 font-medium text-center transition-colors rounded-full ${viewMode === 'map'  ? 'bg-[var(--p)] text-[var(--p-text)]' : 'text-[var(--text-3)] hover:text-[var(--text-2)]'}`}>แผนที่</button>
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
            {/* Add court card — first */}
            <div className="flex-shrink-0 w-48 sm:w-auto">
              <button
                onClick={onAddCourt}
                className="w-full h-full min-h-[88px] border-2 border-dashed border-[var(--dashed)] rounded-2xl flex flex-col items-center justify-center gap-1 text-[var(--text-3)] hover:border-[var(--p)] hover:text-[var(--p)] transition-colors"
              >
                <span className="text-2xl leading-none">+</span>
                <span className="text-xs font-medium">เพิ่มสนาม</span>
              </button>
            </div>
            {filteredCourts.map(court => {
              const isSelected = selectedCourt?.id === court.id;
              return (
                <div key={court.id} ref={el => { courtRefs.current[court.id] = el; }} className="relative flex-shrink-0 w-40 sm:w-auto">
                  <button
                    onClick={() => setSelectedCourtId(isSelected ? null : court.id)}
                    className="relative text-left rounded-2xl overflow-hidden w-full transition-all"
                    style={{
                      background: 'linear-gradient(150deg, #010120 0%, #0d0d35 100%)',
                      opacity: isSelected ? 1 : 0.6,
                    }}
                  >
                    <div className="px-3.5 pt-3 pb-3 min-h-[88px] flex flex-col justify-between">
                      {/* Top: name + pin icon */}
                      <div className="flex items-start justify-between gap-1 mb-1.5">
                        <p className="font-bold text-sm leading-tight text-white">{court.name}</p>
                        {((court.lat && court.lng) || court.address) ? (
                          <a
                            href={court.lat && court.lng ? `https://www.google.com/maps/dir/?api=1&destination=${court.lat},${court.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(court.name + ' ' + (court.address ?? ''))}`}
                            target="_blank" rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg transition-colors"
                            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          </a>
                        ) : null}
                      </div>
                      {/* Address */}
                      {court.address && (() => {
                        const parts = court.address.split(',').map(s => s.trim()).filter(s => s && s !== 'Thailand' && !/^\d{5}/.test(s) && s.length > 1);
                        const short = parts.length >= 2 ? parts.slice(-2).join(' · ') : parts[0] ?? court.address;
                        return <p className="text-xs truncate mb-2.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{short}</p>;
                      })()}
                      {/* Group count */}
                      <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>{court.groups.length} ก๊วน</p>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Selected court groups */}
          {selectedCourt && (
            <div>
              {/* Court detail bar */}
              <div className="mb-4 pb-3 border-b border-[var(--input-b)]">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-[var(--text-1)] leading-tight truncate">{selectedCourt.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      {(selectedCourt.info?.floor || selectedCourt.info?.air || selectedCourt.info?.parking || selectedCourt.info?.notes) ? (
                        <>
                          {selectedCourt.info.floor && <span className="bg-[var(--chip-bg)] text-[var(--chip-t)] text-xs px-2 py-0.5 rounded-full">{FLOOR_LABELS[selectedCourt.info.floor]}</span>}
                          {selectedCourt.info.air   && <span className="bg-[var(--chip-bg)] text-[var(--chip-t)] text-xs px-2 py-0.5 rounded-full">{AIR_LABELS[selectedCourt.info.air]}</span>}
                          {selectedCourt.info.parking && <span className="bg-[var(--chip-bg)] text-[var(--chip-t)] text-xs px-2 py-0.5 rounded-full">{PARKING_LABELS[selectedCourt.info.parking]}</span>}
                          {selectedCourt.info.notes && <span className="bg-[var(--chip-bg)] text-[var(--chip-t)] text-xs px-2 py-0.5 rounded-full">{selectedCourt.info.notes}</span>}
                        </>
                      ) : null}
                    </div>
                  </div>
                  <div className="relative flex-shrink-0" ref={courtMenuRef}>
                    <button
                      onClick={() => setCourtMenu(v => !v)}
                      className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--text-3)] hover:bg-[var(--hover-bg)] transition-colors text-lg leading-none font-bold"
                    >···</button>
                    {courtMenu && (
                      <div className="absolute right-0 top-9 z-50 rounded-2xl overflow-hidden shadow-xl min-w-[170px]" style={{ backgroundColor: '#fff', border: '1px solid var(--card-border)' }}>
                        <button
                          onClick={() => { setCourtMenu(false); onRateCourt(selectedCourt.id); }}
                          className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-[var(--text-2)] hover:bg-[var(--hover-bg)] transition-colors text-left"
                        >
                          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          แก้ไข
                        </button>
                        <div style={{ borderTop: '1px solid var(--card-border)' }}/>
                        <button
                          onClick={() => { setCourtMenu(false); setConfirmDeleteCourt({ id: selectedCourt.id, name: selectedCourt.name }); }}
                          className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors text-left"
                        >
                          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                          ลบสนาม
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Add group card — first */}
                <button
                  onClick={() => onAddGroup(selectedCourt.id, selectedDay !== 'all' ? selectedDay : undefined)}
                  className="min-h-[88px] border-2 border-dashed border-[var(--dashed)] rounded-2xl flex flex-col items-center justify-center gap-1 text-[var(--text-3)] hover:border-[var(--p)] hover:text-[var(--p)] transition-colors"
                >
                  <span className="text-2xl leading-none">+</span>
                  <span className="text-xs font-medium">เพิ่มก๊วน</span>
                </button>
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
            </div>
          )}
        </>
      ))}

      {confirmDeleteCourt && (
        <ConfirmDialog
          title="ลบสนาม"
          message={`"${confirmDeleteCourt.name}" และก๊วนทั้งหมด`}
          onConfirm={() => { onDeleteCourt(confirmDeleteCourt.id); setConfirmDeleteCourt(null); setSelectedCourtId(null); }}
          onCancel={() => setConfirmDeleteCourt(null)}
        />
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


function GroupCard({ group, onDelete, onEdit, onSaveNote }: { group: Group; onDelete: () => void; onEdit: () => void; onSaveNote: (notes: string) => void }) {
  const review = group.reviews[0];
  const [confirming, setConfirming] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(review?.notes ?? '');
  const [groupMenu, setGroupMenu] = useState(false);
  const groupMenuRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!groupMenu) return;
    const handler = (e: MouseEvent) => { if (groupMenuRef.current && !groupMenuRef.current.contains(e.target as Node)) setGroupMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [groupMenu]);
  const firstDay = (Object.keys(DAY_LABELS) as DayOfWeek[]).find(d => group.days.includes(d));

  const commitNote = () => {
    setEditingNote(false);
    onSaveNote(noteText.trim());
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[var(--card-border)]">
      {group.image ? (
        <div className="relative h-40 overflow-hidden rounded-t-2xl">
          <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div ref={groupMenuRef} className="absolute top-2 right-2">
            <button onClick={() => setGroupMenu(v => !v)} className="w-7 h-7 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors backdrop-blur-sm font-bold text-base leading-none">···</button>
            {groupMenu && (
              <div className="absolute right-0 top-9 z-50 rounded-2xl overflow-hidden shadow-xl min-w-[140px]" style={{ backgroundColor: '#fff', border: '1px solid var(--card-border)' }}>
                <button onClick={() => { setGroupMenu(false); onEdit(); }} className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-[var(--text-2)] hover:bg-[var(--hover-bg)] transition-colors text-left">
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  แก้ไข
                </button>
                <div style={{ borderTop: '1px solid var(--card-border)' }}/>
                <button onClick={() => { setGroupMenu(false); setConfirming(true); }} className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors text-left">
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  ลบ
                </button>
              </div>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
            <p className="font-semibold text-white text-base leading-tight">{group.name}</p>
            <p className="text-xs text-white/60 mt-0.5">{group.startTime} – {group.endTime} น.</p>
          </div>
        </div>
      ) : (
        <div className={`relative h-16 ${firstDay ? DAY_COLORS[firstDay].bg : 'bg-[var(--text-4)]'} overflow-visible rounded-t-2xl`}>
          <span className="absolute -right-1 -top-2 text-6xl font-black text-white/20 leading-none select-none">{group.name.charAt(0)}</span>
          <div ref={groupMenuRef} className="absolute top-2 right-2">
            <button onClick={() => setGroupMenu(v => !v)} className="w-7 h-7 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors font-bold text-base leading-none">···</button>
            {groupMenu && (
              <div className="absolute right-0 top-9 z-50 rounded-2xl overflow-hidden shadow-xl min-w-[140px]" style={{ backgroundColor: '#fff', border: '1px solid var(--card-border)' }}>
                <button onClick={() => { setGroupMenu(false); onEdit(); }} className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-[var(--text-2)] hover:bg-[var(--hover-bg)] transition-colors text-left">
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  แก้ไข
                </button>
                <div style={{ borderTop: '1px solid var(--card-border)' }}/>
                <button onClick={() => { setGroupMenu(false); setConfirming(true); }} className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors text-left">
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  ลบ
                </button>
              </div>
            )}
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
      {confirming && <ConfirmDialog title="ลบก๊วน" message={`"${group.name}"`} onConfirm={onDelete} onCancel={() => setConfirming(false)} />}
    </div>
  );
}
