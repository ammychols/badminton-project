import React, { useState, useRef, useEffect } from 'react';
import { Court, Group, DAY_LABELS, DayOfWeek, ALL_LEVELS, FLOOR_LABELS, AIR_LABELS, PARKING_LABELS } from '../types';
import { CourtsMap } from './CourtsMap';
import { ConfirmDialog } from './ConfirmDialog';
import { btn, emptyState, text, chip } from '../styles/tokens';

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

const WEEK_ORDER: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const AVATAR_TINTS = [
  { bg: '#E6F1FB', fg: '#185FA5' },
  { bg: '#FAEEDA', fg: '#854F0B' },
  { bg: '#EEEDFE', fg: '#534AB7' },
  { bg: '#FAECE7', fg: '#993C1D' },
  { bg: '#FBEAF0', fg: '#993556' },
];

function tintFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_TINTS[h % AVATAR_TINTS.length];
}

const COLLAPSE_KEY = 'badminton.collapsedCourts';

function loadCollapsed(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(COLLAPSE_KEY) ?? '[]')); } catch { return new Set(); }
}

function saveCollapsed(set: Set<string>) {
  localStorage.setItem(COLLAPSE_KEY, JSON.stringify([...set]));
}

// ---- GroupRow ----
// Fix 3: menu renders with position:fixed via inline style so it escapes any overflow:hidden ancestor.
function GroupRow({ group, onEdit, onDelete }: {
  group: Group;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [menu, setMenu] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!menu) return;
    const handler = (e: MouseEvent) => {
      if (btnRef.current && btnRef.current.contains(e.target as Node)) return;
      setMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menu]);

  const openMenu = () => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    // Use viewport-relative coords so position:fixed anchors correctly
    setMenuPos({
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right,
    });
    setMenu(true);
  };

  const tint = tintFor(group.id);
  const initial = group.name.charAt(0).toUpperCase();
  const days = WEEK_ORDER.filter(d => group.days.includes(d)).map(d => DAY_LABELS[d]).join(' ');
  const noTime = group.startTime === '00:00' && group.endTime === '00:00';
  const meta = noTime ? days : `${group.startTime}–${group.endTime}${days ? ` · ${days}` : ''}`;

  return (
    <div className="flex items-center gap-3 py-2.5 px-1">
      {/* Avatar */}
      <div
        className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-base font-bold overflow-hidden"
        style={{ backgroundColor: tint.bg, color: tint.fg }}
      >
        {group.image
          ? <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
          : initial}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--text-1)] truncate">{group.name}</p>
        <p className="text-xs text-[var(--text-3)] truncate">{meta}</p>
        {group.levels && group.levels.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-1">
            {ALL_LEVELS.filter(l => group.levels!.includes(l)).map(lv => (
              <span key={lv} className={`${chip.base} ${chip.gray}`}>{lv}</span>
            ))}
          </div>
        )}
      </div>

      {/* Menu — fixed-positioned dropdown so it escapes overflow:hidden */}
      <button
        ref={btnRef}
        onClick={openMenu}
        className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full text-[var(--text-3)] hover:bg-[var(--hover-bg)] transition-colors text-lg leading-none font-bold"
      >···</button>
      {menu && menuPos && (
        <div
          className="rounded-2xl overflow-hidden shadow-xl min-w-[140px]"
          style={{ position: 'fixed', top: menuPos.top, right: menuPos.right, zIndex: 200, backgroundColor: '#fff', border: '1px solid var(--card-border)' }}
        >
          <button onClick={() => { setMenu(false); onEdit(); }} className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-[var(--text-2)] hover:bg-[var(--hover-bg)] transition-colors text-left">
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            แก้ไข
          </button>
          <div style={{ borderTop: '1px solid var(--card-border)' }} />
          <button onClick={() => { setMenu(false); setConfirming(true); }} className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors text-left">
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            ลบ
          </button>
        </div>
      )}

      {confirming && <ConfirmDialog title="ลบก๊วน" message={`"${group.name}"`} onConfirm={onDelete} onCancel={() => setConfirming(false)} />}
    </div>
  );
}

// ---- CourtSection ----
function CourtSection({ court, expanded, selectedDay, onToggle, onAddGroup, onEditCourt, onDeleteCourt, onEditGroup, onDeleteGroup }: {
  court: Court;
  expanded: boolean;
  selectedDay: DayOfWeek | 'all';
  onToggle: () => void;
  onAddGroup: (defaultDay?: DayOfWeek) => void;
  onEditCourt: () => void;
  onDeleteCourt: () => void;
  onEditGroup: (groupId: string) => void;
  onDeleteGroup: (groupId: string) => void;
}) {
  const [menu, setMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menu]);

  const visibleGroups = selectedDay === 'all'
    ? court.groups
    : court.groups.filter(g => g.days.includes(selectedDay));

  const courtIsEmpty = court.groups.length === 0;

  const infoChips = [
    court.info?.floor ? FLOOR_LABELS[court.info.floor] : null,
    court.info?.air ? AIR_LABELS[court.info.air] : null,
    court.info?.parking ? PARKING_LABELS[court.info.parking] : null,
    court.info?.notes ?? null,
  ].filter(Boolean) as string[];

  // Fix 3: no overflow-hidden on the card wrapper so menus can escape.
  // Rounded corners come from the card's border-radius; bg-white fills correctly because
  // all children are transparent and inherit the card's background.
  return (
    <div className="border border-[var(--card-border)] rounded-2xl bg-white shadow-sm mb-3">
      {/* Section header */}
      <div className="flex items-center gap-1 px-3 py-3">
        {/* Collapse toggle — flex-1 takes remaining space */}
        <button
          className="flex-1 min-w-0 flex items-center gap-2 text-left py-0.5"
          onClick={onToggle}
        >
          <svg
            className="flex-shrink-0 w-4 h-4 text-[var(--text-3)] transition-transform duration-150"
            style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[var(--text-1)] truncate">{court.name}</p>
            {infoChips.length > 0 && (
              <div className="flex gap-1.5 flex-wrap mt-0.5">
                {infoChips.map(c => (
                  <span key={c} className="text-xs text-[var(--text-3)]">{c}</span>
                ))}
              </div>
            )}
          </div>
          <span className="flex-shrink-0 text-xs text-[var(--text-4)] pl-1">{court.groups.length} ก๊วน</span>
        </button>

        {/* Map link — stopPropagation so it doesn't toggle section */}
        {((court.lat && court.lng) || court.address) && (
          <a
            href={court.lat && court.lng
              ? `https://www.google.com/maps/dir/?api=1&destination=${court.lat},${court.lng}`
              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(court.name + ' ' + (court.address ?? ''))}`}
            target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-[var(--text-3)] hover:bg-[var(--hover-bg)] transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          </a>
        )}

        {/* Court ··· menu — stopPropagation so it doesn't toggle section */}
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={e => { e.stopPropagation(); setMenu(v => !v); }}
            className="w-9 h-9 flex items-center justify-center rounded-full text-[var(--text-3)] hover:bg-[var(--hover-bg)] transition-colors text-lg leading-none font-bold"
          >···</button>
          {menu && (
            <div className="absolute right-0 top-10 z-50 rounded-2xl overflow-hidden shadow-xl min-w-[170px]" style={{ backgroundColor: '#fff', border: '1px solid var(--card-border)' }}>
              {/* Add group shortcut — primary action, lets user add without expanding */}
              <button onClick={() => { setMenu(false); onAddGroup(); }} className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium hover:bg-[var(--hover-bg)] transition-colors text-left" style={{ color: 'var(--p-deep)' }}>
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                เพิ่มก๊วน
              </button>
              <div style={{ borderTop: '1px solid var(--card-border)' }} />
              <button onClick={() => { setMenu(false); onEditCourt(); }} className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-[var(--text-2)] hover:bg-[var(--hover-bg)] transition-colors text-left">
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                แก้ไข
              </button>
              <div style={{ borderTop: '1px solid var(--card-border)' }} />
              <button onClick={() => { setMenu(false); setConfirmDelete(true); }} className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors text-left">
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                ลบสนาม
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Groups — only shown when expanded */}
      {expanded && (
        <div className="border-t border-[var(--card-border)] px-3 pb-2">
          {courtIsEmpty ? (
            /* Empty court — inviting centered affordance */
            <div className="flex justify-center py-5">
              <button
                onClick={() => onAddGroup()}
                className="flex items-center gap-1.5 px-5 py-2 rounded-full border border-[var(--dashed)] text-sm transition-colors hover:border-[var(--p-deep)] hover:bg-[var(--hover-bg)]"
                style={{ color: 'var(--p-deep)' }}
              >
                <span className="text-base leading-none font-medium">+</span> เพิ่มก๊วนแรก
              </button>
            </div>
          ) : (
            <>
              {visibleGroups.map(group => (
                <GroupRow
                  key={group.id}
                  group={group}
                  onEdit={() => onEditGroup(group.id)}
                  onDelete={() => onDeleteGroup(group.id)}
                />
              ))}
              {/* Quiet footer add link — below the rows, no tile/dashed circle */}
              <button
                onClick={() => onAddGroup()}
                className="flex items-center gap-1 mt-0.5 mb-1 pl-1 py-1.5 text-xs font-medium transition-colors hover:opacity-70"
                style={{ color: 'var(--p-deep)' }}
              >
                <span className="text-sm leading-none">+</span> เพิ่มก๊วน
              </button>
            </>
          )}
        </div>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="ลบสนาม"
          message={`"${court.name}" และก๊วนทั้งหมด`}
          onConfirm={onDeleteCourt}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}

// ---- CourtsView ----
export function CourtsView({ courts, highlightCourtId, onHighlightClear, onAddCourt, onAddGroup, onDeleteCourt, onDeleteGroup, onEditGroup, onRateCourt, onAddReview: _onAddReview }: CourtsViewProps) {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | 'all'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Set<string>>(loadCollapsed);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const dayFilterActive = selectedDay !== 'all';

  const toggleCollapse = (courtId: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(courtId)) next.delete(courtId); else next.add(courtId);
      saveCollapsed(next);
      return next;
    });
  };

  const isExpanded = (courtId: string) => dayFilterActive || !collapsed.has(courtId);

  useEffect(() => {
    if (!highlightCourtId) return;
    setSelectedDay('all');
    setCollapsed(prev => {
      const next = new Set(prev);
      next.delete(highlightCourtId);
      saveCollapsed(next);
      return next;
    });
    setTimeout(() => {
      sectionRefs.current[highlightCourtId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      onHighlightClear?.();
    }, 100);
  }, [highlightCourtId]);

  const q = search.trim().toLowerCase();

  const filteredCourts = courts.filter(court => {
    const dayMatch = !dayFilterActive || court.groups.some(g => g.days.includes(selectedDay as DayOfWeek));
    const searchMatch = !q || court.name.toLowerCase().includes(q) || court.groups.some(g => g.name.toLowerCase().includes(q));
    return dayMatch && searchMatch;
  });

  const showFab = viewMode === 'list' && courts.length > 0;

  return (
    <div className="max-w-screen-sm mx-auto px-4 pt-5 pb-32 sm:max-w-screen-2xl sm:px-10">
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
            className={`flex-shrink-0 ${btn.pill} ${selectedDay === key ? btn.pillActive : btn.pillInactive}`}
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
        <button onClick={() => setViewMode('map')} className={`px-5 py-1.5 font-medium text-center transition-colors rounded-full ${viewMode === 'map' ? 'bg-[var(--p)] text-[var(--p-text)]' : 'text-[var(--text-3)] hover:text-[var(--text-2)]'}`}>แผนที่</button>
      </div>

      {viewMode === 'map' && <CourtsMap courts={filteredCourts} />}

      {viewMode === 'list' && (courts.length === 0 ? (
        <div className={emptyState.wrapper}>
          <div className={emptyState.icon}>🏸</div>
          <div className={emptyState.title}>เพิ่มสนามแบดมินตัน</div>
          <div className={emptyState.subtitle}>บันทึกสนามที่ชอบไปตีไว้ที่นี่</div>
          <button onClick={onAddCourt} className={btn.primaryLg}>+ เพิ่มสนามแรก</button>
        </div>
      ) : (
        <>
          {filteredCourts.length === 0 && (
            <div className="text-center text-sm text-[var(--text-3)] py-10">
              {q ? `ไม่พบ "${search}"` : 'ไม่มีสนามที่เปิดวันนี้'}
            </div>
          )}

          {filteredCourts.map(court => (
            <div key={court.id} ref={el => { sectionRefs.current[court.id] = el; }}>
              <CourtSection
                court={court}
                expanded={isExpanded(court.id)}
                selectedDay={selectedDay}
                onToggle={() => toggleCollapse(court.id)}
                onAddGroup={(defaultDay) => onAddGroup(court.id, defaultDay)}
                onEditCourt={() => onRateCourt(court.id)}
                onDeleteCourt={() => onDeleteCourt(court.id)}
                onEditGroup={(groupId) => onEditGroup(court.id, groupId)}
                onDeleteGroup={(groupId) => onDeleteGroup(court.id, groupId)}
              />
            </div>
          ))}
        </>
      ))}

      {/* Fix 1: Fixed FAB — visible without scrolling, above bottom nav, below dropdowns (z-45) */}
      {showFab && (
        <button
          onClick={onAddCourt}
          className="fixed right-6 flex items-center gap-2 bg-[var(--p)] text-[var(--p-text)] px-5 py-3 rounded-full shadow-lg text-sm font-semibold hover:bg-[var(--p-h)] transition-colors"
          style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom))', zIndex: 45 }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          เพิ่มสนาม
        </button>
      )}
    </div>
  );
}
