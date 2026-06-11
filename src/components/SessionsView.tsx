import React, { useState, useMemo, useRef } from 'react';
import { Court, Group, Session, INTENSITY_LABELS, ALL_LEVELS, DAY_LABELS, DayOfWeek, FLOOR_LABELS, AIR_LABELS, PARKING_LABELS } from '../types';
import { GroupReviewModal } from './GroupReviewModal';
import { uploadGroupImage } from '../utils/uploadImage';
import { btn, card, text, emptyState } from '../styles/tokens';

// ── Court slide-over panel (triggered from session feed) ──────────────────────
function CourtPanel({ court, onClose }: { court: Court; onClose: () => void }) {
  const [panelDay, setPanelDay] = useState<DayOfWeek | 'all'>('all');
  const visibleGroups = panelDay === 'all' ? court.groups : court.groups.filter(g => g.days.includes(panelDay));

  const mapsUrl = court.lat && court.lng
    ? `https://www.google.com/maps/dir/?api=1&destination=${court.lat},${court.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(court.name + ' ' + court.address)}`;

  const DAY_TABS: { key: DayOfWeek | 'all'; label: string }[] = [
    { key: 'all', label: 'ทั้งหมด' },
    { key: 'MON', label: 'จ' }, { key: 'TUE', label: 'อ' }, { key: 'WED', label: 'พ' },
    { key: 'THU', label: 'พฤ' }, { key: 'FRI', label: 'ศ' }, { key: 'SAT', label: 'ส' }, { key: 'SUN', label: 'อา' },
  ];

  return (
    <>
      <div className="fixed inset-0 z-[59]" style={{ backgroundColor: 'rgba(15,23,42,0.5)' }} onClick={onClose} />
      <style>{`
        .court-panel { top:0; right:0; bottom:0; left:0; }
        @media(min-width:640px){ .court-panel { top:57px; left:auto; width:480px; box-shadow:-8px 0 32px rgba(0,0,0,.2); } }
      `}</style>
      <div className="court-panel fixed z-[60] flex flex-col" style={{ backgroundColor: 'var(--app-bg)' }}>
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-2.5 flex-shrink-0" style={{ backgroundColor: 'var(--nav-bg)', borderBottom: '1px solid var(--nav-border)' }}>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          </button>
          <div className="min-w-0 flex-1">
            <div className="font-extrabold text-white text-sm leading-tight truncate">{court.name}</div>
            {court.address && <div className="text-xs text-white/50 truncate">{court.address}</div>}
          </div>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
            className="flex-shrink-0 flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl transition-colors"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
            นำทาง
          </a>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 py-3.5 flex flex-col gap-3 pb-8">
          {/* Info chips */}
          {(court.info?.floor || court.info?.air || court.info?.parking || court.info?.notes) && (
            <div className="flex gap-2 flex-wrap">
              {court.info.floor && <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: 'var(--chip-bg)', color: 'var(--chip-t)' }}>{FLOOR_LABELS[court.info.floor]}</span>}
              {court.info.air && <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: 'var(--chip-bg)', color: 'var(--chip-t)' }}>{AIR_LABELS[court.info.air]}</span>}
              {court.info.parking && <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: 'var(--chip-bg)', color: 'var(--chip-t)' }}>{PARKING_LABELS[court.info.parking]}</span>}
              {court.info.notes && <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: 'var(--chip-bg)', color: 'var(--chip-t)' }}>{court.info.notes}</span>}
            </div>
          )}

          {/* Day filter */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
            {DAY_TABS.map(({ key, label }) => (
              <button key={key} onClick={() => setPanelDay(key)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                style={{
                  background: panelDay === key ? '#84cc16' : 'var(--chip-bg)',
                  color: panelDay === key ? '#0f172a' : 'var(--chip-t)',
                }}>
                {label}
              </button>
            ))}
          </div>

          {/* Groups */}
          <div className="text-xs font-semibold text-[var(--text-3)] uppercase tracking-wide">ก๊วนในสนามนี้</div>
          {visibleGroups.length === 0 ? (
            <div className="text-sm text-[var(--text-3)] text-center py-6">ไม่มีก๊วนในวันนี้</div>
          ) : (
            <div className="flex flex-col gap-2">
              {visibleGroups.map(group => <PanelGroupRow key={group.id} group={group} />)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function PanelGroupRow({ group }: { group: Group }) {
  return (
    <div className="bg-white rounded-2xl p-3.5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
      {group.image && (
        <div className="relative h-28 rounded-xl overflow-hidden mb-3">
          <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}
      <div className="font-bold text-[#0f172a] text-sm">{group.name}</div>
      {group.startTime && group.endTime && (
        <div className="text-xs text-[#64748b] mt-0.5">{group.startTime} – {group.endTime} น.</div>
      )}
      <div className="flex gap-1.5 flex-wrap mt-2">
        {(Object.keys(DAY_LABELS) as DayOfWeek[]).filter(d => group.days.includes(d)).map(d => (
          <span key={d} className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: '#f1f5f9', color: '#475569' }}>{DAY_LABELS[d]}</span>
        ))}
        {group.levels?.slice().sort((a, b) => ALL_LEVELS.indexOf(a) - ALL_LEVELS.indexOf(b)).map(lv => (
          <span key={lv} className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: '#f1f5f9', color: '#475569' }}>{lv}</span>
        ))}
      </div>
      {group.notes && <p className="text-xs text-[#94a3b8] mt-2 leading-relaxed">{group.notes}</p>}
    </div>
  );
}

interface SessionsViewProps {
  sessions: Session[];
  courts: Court[];
  justLogged?: boolean;
  onLogSession: () => void;
  onDeleteSession: (id: string) => void;
  onEditSession: (session: Session) => void;
  onUpdateNote: (id: string, notes: string | undefined) => void;
  onUpdatePhoto: (id: string, image: string | undefined) => void;
  onUpdatePhotos: (id: string, photos: string[]) => void;
  onNavigateToCourt: (courtId: string) => void;
}

function RacketSVG({ clipId }: { clipId: string }) {
  // Head in upper-right area; handle extends down-right out of the card (clipped by overflow:hidden)
  const cx = 155, cy = 95, rx = 78, ry = 60;
  const ys = [-48, -36, -24, -12, 0, 12, 24, 36, 48];
  const xs = [-62, -47, -31, -16, 0, 16, 31, 47, 62];
  return (
    <svg width="240" height="340" viewBox="0 0 240 340" fill="none"
      className="absolute top-0 right-0 opacity-[0.14] pointer-events-none select-none"
      style={{ zIndex: 2, right: '-12px', top: '-12px' }}>
      <defs>
        <clipPath id={clipId}>
          <ellipse cx={cx} cy={cy} rx={rx - 2} ry={ry - 2} />
        </clipPath>
      </defs>
      <g transform={`rotate(18, ${cx}, ${cy})`}>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} stroke="white" strokeWidth="3.5" />
        {ys.map(dy => (
          <line key={dy} x1={cx - rx} y1={cy + dy} x2={cx + rx} y2={cy + dy} stroke="white" strokeWidth="1.5" clipPath={`url(#${clipId})`} />
        ))}
        {xs.map(dx => (
          <line key={dx} x1={cx + dx} y1={cy - ry} x2={cx + dx} y2={cy + ry} stroke="white" strokeWidth="1.5" clipPath={`url(#${clipId})`} />
        ))}
        <line x1={cx} y1={cy + ry + 2} x2={cx} y2="285" stroke="white" strokeWidth="5" />
        <rect x={cx - 10} y="285" width="20" height="55" rx="8" stroke="white" strokeWidth="3.5" />
      </g>
    </svg>
  );
}

const MOOD_EMOJIS: Record<number, string> = {
  1: '😡',
  2: '😴',
  3: '😐',
  4: '🙂',
  5: '😄',
  6: '🔥',
};


const DAY_NAMES = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์'];
const MONTH_SHORT = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const DOW_LABELS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
const DOW_LABELS_SHORT = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'];

function ActivityCard({ sessions, viewYear, viewMonth, onPrev, onNext }: {
  sessions: { date: string; gamesPlayed: number }[];
  viewYear: number; viewMonth: number;
  onPrev: () => void; onNext: () => void;
}) {
  const WEEKS = 16;
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  // Sum gamesPlayed per day
  const countMap: Record<string, number> = {};
  for (const s of sessions) {
    countMap[s.date] = (countMap[s.date] || 0) + s.gamesPlayed;
  }

  // DOW frequency — sum gamesPlayed per day-of-week
  const dowCount = Array(7).fill(0);
  for (const s of sessions) {
    const d = new Date(s.date + 'T00:00:00');
    dowCount[(d.getDay() + 6) % 7] += 1;
  }
  const maxDow = Math.max(...dowCount, 1);

  // Build 16-week grid: col=0 is oldest, col=15 is most recent
  // row=0=Mon ... row=6=Sun
  const todayDow = (now.getDay() + 6) % 7; // Mon=0
  const getDateForCell = (col: number, row: number) => {
    const daysAgo = (WEEKS - 1 - col) * 7 + (todayDow - row);
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().slice(0, 10);
  };

  const heatColor = (games: number) => {
    if (games === 0) return 'var(--bar-i)';
    if (games <= 3) return 'color-mix(in srgb, var(--p) 22%, transparent)';
    if (games <= 5) return 'color-mix(in srgb, var(--p) 53%, transparent)';
    return 'var(--p)';
  };

  return (
    <div className={`${card.padded} mb-4`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-[var(--text-1)]">กิจกรรม</span>
        <div className="flex items-center gap-3">
          {([['1-3','22%'],['4-5','53%'],['6+','100%']] as [string, string][]).map(([label, opacity]) => (
            <div key={label} className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: `color-mix(in srgb, var(--p) ${opacity}, transparent)` }}/>
              <span className="text-[10px] text-[var(--text-4)] font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="flex gap-1">
        {/* DOW labels */}
        <div className="flex flex-col gap-[3px] pt-px flex-shrink-0">
          {DOW_LABELS_SHORT.map(d => (
            <div key={d} className="h-[14px] flex items-center justify-end text-[9px] font-semibold text-[var(--text-4)] w-4">{d}</div>
          ))}
        </div>
        {/* Week columns */}
        <div className="flex gap-[3px] flex-1">
          {Array.from({ length: WEEKS }, (_, col) => (
            <div key={col} className="flex flex-col gap-[3px] flex-1">
              {Array.from({ length: 7 }, (_, row) => {
                const dateStr = getDateForCell(col, row);
                const isFuture = dateStr > todayStr;
                const isToday = dateStr === todayStr;
                const count = countMap[dateStr] || 0;
                return (
                  <div key={row} className="h-[14px] rounded-[3px]"
                    style={{
                      background: isFuture ? 'transparent' : heatColor(count),
                      outline: isToday ? '1.5px solid var(--p)' : 'none',
                      outlineOffset: '1px',
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[var(--card-border)] my-3"/>

      {/* DOW frequency bars */}
      <div>
        <div className="text-[11px] font-semibold text-[var(--text-4)] mb-2">วันที่ตีบ่อย</div>
        <div className="flex gap-1.5 items-end">
          {DOW_LABELS_SHORT.map((d, i) => {
            const cnt = dowCount[i];
            const h = Math.max((cnt / maxDow) * 40, cnt > 0 ? 6 : 2);
            return (
              <div key={d} className="flex-1 flex flex-col items-center gap-0.5">
                {cnt > 0 && <span className="text-[9px] font-bold tabular-nums" style={{ color: 'var(--p)' }}>{cnt}</span>}
                <div className="w-full rounded-t-[3px]" style={{ height: h, backgroundColor: cnt > 0 ? 'var(--p)' : 'var(--bar-i)' }}/>
                <span className="text-[9px] text-[var(--text-4)] font-medium">{d}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  const day = DAY_NAMES[d.getDay()];
  const dd = d.getDate();
  const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear() + 543;
  return { day, full: `${dd} ${month} ${year}` };
}

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function thisMonthString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

const INTENSITY_CHIP: Record<string, string> = {
  light: 'bg-emerald-50 text-emerald-600',
  medium: 'bg-amber-50 text-amber-600',
  heavy: 'bg-red-50 text-red-500',
};

const MOOD_BUBBLE: Record<number, string> = {
  1: 'bg-red-50',
  2: 'bg-slate-100',
  3: 'bg-blue-50',
  4: 'bg-amber-50',
  5: 'bg-emerald-50',
  6: 'bg-orange-50',
};

function calcStreak(sessions: { date: string }[]): number {
  if (sessions.length === 0) return 0;
  const dates = [...new Set(sessions.map(s => s.date))].sort().reverse();
  const today = todayString();
  const yesterday = (() => { const d = new Date(); d.setDate(d.getDate() - 1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })();
  if (dates[0] !== today && dates[0] !== yesterday) return 0;
  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i-1] + 'T00:00:00');
    const curr = new Date(dates[i] + 'T00:00:00');
    prev.setDate(prev.getDate() - 1);
    if (prev.toISOString().slice(0,10) === curr.toISOString().slice(0,10)) streak++;
    else break;
  }
  return streak;
}


function SessionRow({ session, courtName, groupName, onEdit, onDelete, onUpdateNote, onUpdatePhoto, onUpdatePhotos, onViewInfo, onViewCourt }: {
  session: Session; courtName: string; groupName: string;
  onEdit: () => void; onDelete: () => void;
  onUpdateNote: (notes: string | undefined) => void;
  onUpdatePhoto: (image: string | undefined) => void;
  onUpdatePhotos: (photos: string[]) => void;
  onViewInfo: () => void;
  onViewCourt: () => void;
}) {
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(session.notes ?? '');
  const [lightbox, setLightbox] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);
  const commitNote = () => {
    setEditingNote(false);
    const trimmed = noteText.trim() || undefined;
    if (trimmed !== session.notes) onUpdateNote(trimmed);
  };
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async ev => {
      const compressed = await uploadGroupImage('', '', ev.target?.result as string);
      const existing = session.photos ?? (session.image ? [session.image] : []);
      onUpdatePhotos([...existing, compressed]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };
  const allPhotos = session.photos ?? (session.image ? [session.image] : []);
  const [sh, sm] = session.startTime.split(':').map(Number);
  const [eh, em] = session.endTime.split(':').map(Number);
  const start = sh * 60 + sm;
  const end = eh * 60 + em;
  const durMin = (() => { if (start === 0 && end === 0) return 0; let d = end - start; if (d <= 0) d += 24 * 60; return (d > 0 && d < 24 * 60) ? d : 0; })();
  const durLabel = durMin > 0 ? (Math.floor(durMin / 60) > 0 ? `${Math.floor(durMin / 60)}ชม.` : '') + (durMin % 60 > 0 ? `${durMin % 60}น.` : '') : null;
  const hasTime = !(start === 0 && end === 0);
  const minPerGame = (durMin > 0 && session.gamesPlayed > 0) ? Math.round(durMin / session.gamesPlayed) : null;

  const metaDivider = <span className="text-[var(--text-4)]">·</span>;

  return (
    <div className="group bg-white border border-[var(--card-border)] rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.08),_0_8px_32px_rgba(0,0,0,0.05)] overflow-hidden transition-colors hover:border-[color-mix(in_srgb,var(--p)_35%,transparent)] flex flex-col sm:flex-row">
      {/* Left: all content */}
      <div className="flex-1 min-w-0 flex flex-col p-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0 text-2xl select-none ${MOOD_BUBBLE[session.mood]}`}>
            {MOOD_EMOJIS[session.mood]}
          </div>
          {/* Group + court names — only the name text triggers info */}
          <div className="min-w-0 flex-1">
            <div className="text-sm leading-snug">
              <button onClick={onViewInfo} className="font-bold text-[var(--text-1)] text-[15px] tracking-tight hover:underline hover:text-[var(--p)] transition-colors">{groupName}</button>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-[var(--text-3)]">
              <button onClick={onViewCourt} className="hover:text-[var(--p)] transition-colors truncate">{courtName}</button>
              {session.intensity && (() => {
                const lvs = Array.isArray(session.intensity) ? session.intensity : [session.intensity];
                const ivColorMap: Record<string, string> = { light: '#16a34a', medium: '#ca8a04', heavy: '#ef4444' };
                return lvs.map(lv => (
                  <React.Fragment key={lv}>
                    <span className="text-[var(--text-4)]">·</span>
                    <span className="font-semibold" style={{ color: ivColorMap[lv] }}>{INTENSITY_LABELS[lv]}</span>
                  </React.Fragment>
                ));
              })()}
            </div>
          </div>
          <div className="flex items-center gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity flex-shrink-0">
            {!session.image && (
              <button onClick={() => photoInputRef.current?.click()} title="เพิ่มรูป" className="text-[var(--text-3)] hover:text-[var(--p)] transition-colors p-1.5 rounded-lg hover:bg-[var(--chip-bg)]">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            )}
            <div ref={menuRef} className="relative">
              <button onClick={() => setMenuOpen(v => !v)} className="p-1.5 rounded-lg hover:bg-[var(--chip-bg)] transition-colors" style={{ color: 'var(--text-3)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-8 z-20 bg-white rounded-xl border border-[var(--card-border)] overflow-hidden min-w-[120px]" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
                  <button onClick={() => { setMenuOpen(false); onEdit(); }} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-[var(--text-1)] hover:bg-[var(--chip-bg)] transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[var(--text-3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 16H9v-3z" />
                    </svg>
                    แก้ไข
                  </button>
                  <div className="h-px bg-[var(--card-border)]"/>
                  <button onClick={() => { setMenuOpen(false); onDelete(); }} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    ลบ
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="mt-3 flex-1">
          {editingNote ? (
            <textarea autoFocus value={noteText} onChange={e => setNoteText(e.target.value)}
              onFocus={e => { const l = e.target.value.length; e.target.setSelectionRange(l, l); }}
              onBlur={commitNote}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitNote(); } if (e.key === 'Escape') { setNoteText(session.notes ?? ''); setEditingNote(false); } }}
              placeholder="เพิ่มโน้ต..." rows={2}
              className="w-full text-sm text-[var(--text-2)] border border-[var(--input-b)] rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-[var(--input-f)]"
              style={{ backgroundColor: 'var(--app-bg)' }}
            />
          ) : (
            <button onClick={() => { setNoteText(session.notes ?? ''); setEditingNote(true); }}
              className="w-full text-left rounded-xl px-2 py-1.5 -mx-2 -my-1.5 hover:bg-[var(--chip-bg)] transition-colors group/note">
              {session.notes
                ? <p className="text-[13.5px] text-[var(--text-2)] leading-relaxed whitespace-pre-wrap">{session.notes}</p>
                : <p className="text-sm text-[var(--text-3)] opacity-60 group-hover:opacity-100 transition-opacity">+ เพิ่มโน้ต...</p>
              }
            </button>
          )}
        </div>

        {/* Meta footer */}
        {(hasTime || session.gamesPlayed > 0) && (
          <div className="mt-3 pt-2.5 border-t border-[var(--card-border)] flex items-center flex-wrap gap-x-2 gap-y-1 text-xs">
            {hasTime && <span className="tabular-nums text-[var(--text-3)]">{session.startTime} – {session.endTime}</span>}
            {hasTime && durLabel && metaDivider}
            {durLabel && <span className="font-semibold tabular-nums text-[var(--text-2)]">{durLabel}</span>}
            {(hasTime || durLabel) && session.gamesPlayed > 0 && metaDivider}
            {session.gamesPlayed > 0 && <span className="font-bold tabular-nums text-[var(--text-2)]">{session.gamesPlayed} เกม</span>}
            {minPerGame && metaDivider}
            {minPerGame && <span className="tabular-nums text-[var(--text-3)]">{minPerGame} นาที/เกม</span>}
          </div>
        )}

        {/* Photo strip */}
        <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        {allPhotos.length > 0 && (
          <div className="flex gap-1.5 mt-3 pt-3 border-t border-[var(--card-border)]" style={{ maxHeight: 160 }}>
            {allPhotos.slice(0, 3).map((photo, i) => (
              <div key={i} className="relative flex-1 rounded-xl overflow-hidden cursor-pointer" style={{ height: 160 }} onClick={() => setLightbox(true)}>
                <img src={photo} alt="" className="w-full h-full object-cover" />
                {i === 2 && allPhotos.length > 3 && (
                  <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">+{allPhotos.length - 3}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); const next = allPhotos.filter((_, idx) => idx !== i); onUpdatePhotos(next); }}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center text-[10px] hover:bg-red-500/80 transition-colors opacity-0 group-hover:opacity-100"
                >✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && allPhotos.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setLightbox(false)}
        >
          <img
            src={allPhotos[0]}
            alt="session"
            className="max-w-[92vw] max-h-[88vh] rounded-2xl object-contain shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center text-lg hover:bg-white/30 transition-colors"
          >✕</button>
        </div>
      )}
    </div>
  );
}

function FeedList({ sessions, getCourtName, getGroupName, onEditSession, setConfirmDeleteId, onUpdateNote, onUpdatePhoto, onUpdatePhotos, onViewInfo, onViewCourt }: {
  sessions: Session[];
  getCourtName: (id: string) => string;
  getGroupName: (courtId: string, groupId: string) => string;
  onEditSession: (s: Session) => void;
  setConfirmDeleteId: (id: string) => void;
  onUpdateNote: (id: string, notes: string | undefined) => void;
  onUpdatePhoto: (id: string, image: string | undefined) => void;
  onUpdatePhotos: (id: string, photos: string[]) => void;
  onViewInfo: (s: Session) => void;
  onViewCourt: (courtId: string) => void;
}) {
  const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date));
  // Group by date
  const groups: { date: string; label: string; items: Session[] }[] = [];
  for (const s of sorted) {
    const last = groups[groups.length - 1];
    if (last && last.date === s.date) { last.items.push(s); }
    else {
      const { day, full } = formatDate(s.date);
      groups.push({ date: s.date, label: `วัน${day} ${full}`, items: [s] });
    }
  }
  return (
    <div className="flex flex-col gap-1">
      {groups.map((g, gi) => (
        <div key={g.date}>
          {/* Date label */}
          <div className={`pb-3 ${gi > 0 ? 'pt-4' : 'pt-0'}`}>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--p)]"/>
              <span className="text-xs font-bold text-[var(--text-3)]">{g.label}</span>
            </div>
          </div>
          {/* Each session as its own feed card */}
          <div className="flex flex-col gap-2">
            {g.items.map(s => (
              <SessionRow key={s.id} session={s}
                courtName={getCourtName(s.courtId)} groupName={getGroupName(s.courtId, s.groupId)}
                onEdit={() => onEditSession(s)} onDelete={() => setConfirmDeleteId(s.id)}
                onUpdateNote={notes => onUpdateNote(s.id, notes)}
                onUpdatePhoto={image => onUpdatePhoto(s.id, image)}
                onUpdatePhotos={photos => onUpdatePhotos(s.id, photos)}
                onViewInfo={() => onViewInfo(s)}
                onViewCourt={() => onViewCourt(s.courtId)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}



export function SessionsView({ sessions, courts, justLogged, onLogSession, onDeleteSession, onEditSession, onUpdateNote, onUpdatePhoto, onUpdatePhotos, onNavigateToCourt }: SessionsViewProps) {
  const today = todayString();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [viewInfoSession, setViewInfoSession] = useState<Session | null>(null);
  const [viewCourtId, setViewCourtId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [mobileTab, setMobileTab] = useState<'feed' | 'stats'>('feed');

  const getCourtName = (courtId: string) => courts.find(c => c.id === courtId)?.name ?? 'ไม่พบสนาม';
  const getGroupName = (courtId: string, groupId: string) =>
    courts.find(c => c.id === courtId)?.groups.find(g => g.id === groupId)?.name ?? 'ไม่พบก๊วน';

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const [viewYear, setViewYear] = useState(currentYear);
  const [viewMonth, setViewMonth] = useState(currentMonth);
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewYear > currentYear || (viewYear === currentYear && viewMonth >= currentMonth)) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };
  const viewYM = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;

  // Months that have at least one session (+ current month always included)
  const currentYM = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const availableMonths = useMemo(() => {
    const ymSet = new Set(sessions.map(s => s.date.slice(0, 7)));
    ymSet.add(currentYM);
    return [...ymSet].sort().map(ym => {
      const [y, m] = ym.split('-').map(Number);
      return { ym, label: MONTH_SHORT[m - 1], year: y, yearLabel: y !== currentYear ? ` ${y + 543}` : '' };
    });
  }, [sessions, currentYM, currentYear]);

  const q = search.trim().toLowerCase();
  const viewedSessions = sessions.filter(s => {
    if (!s.date.startsWith(viewYM)) return false;
    if (!q) return true;
    return getCourtName(s.courtId).toLowerCase().includes(q) || getGroupName(s.courtId, s.groupId).toLowerCase().includes(q);
  });
  const isNextDisabled = viewYear > currentYear || (viewYear === currentYear && viewMonth >= currentMonth);
  const totalSessions = sessions.length;
  const totalGames = sessions.reduce((sum, s) => sum + s.gamesPlayed, 0);

  // Last 6 months sparkline
  const sparkMonths = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const games = sessions.filter(s => s.date.startsWith(ym)).reduce((sum, s) => sum + s.gamesPlayed, 0);
    return { label: MONTH_SHORT[d.getMonth()], games, isCurrent: i === 5 };
  });
  const maxSparkGames = Math.max(...sparkMonths.map(m => m.games), 1);
  const thisMonthSessions = sessions.filter(s => s.date.startsWith(viewYM));
  const thisMonthDays = new Set(thisMonthSessions.map(s => s.date)).size;
  const thisMonthGames = thisMonthSessions.reduce((sum, s) => sum + s.gamesPlayed, 0);
  const avgGamesPerDay = thisMonthDays > 0 ? (thisMonthGames / thisMonthDays).toFixed(1) : null;
  const hasSessionToday = sessions.some(s => s.date === today);
  const streak = calcStreak(sessions);
  const sortedDates = [...new Set(sessions.map(s => s.date))].sort();
  const lastSessionDate = sortedDates[sortedDates.length - 1];
  const daysSinceLast = lastSessionDate
    ? Math.floor((new Date(today + 'T00:00:00').getTime() - new Date(lastSessionDate + 'T00:00:00').getTime()) / 86400000)
    : null;


  const sessionDurations = thisMonthSessions.map(s => {
    const [sh, sm] = s.startTime.split(':').map(Number);
    const [eh, em] = s.endTime.split(':').map(Number);
    return (eh * 60 + em) - (sh * 60 + sm);
  }).filter(d => d > 0);
  const avgMinutes = sessionDurations.length > 0
    ? Math.round(sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length)
    : null;
  const avgDuration = avgMinutes
    ? avgMinutes >= 60
      ? `${Math.floor(avgMinutes / 60)}ชม.${avgMinutes % 60 > 0 ? `${avgMinutes % 60}น.` : ''}`
      : `${avgMinutes}น.`
    : null;

  return (
    <div className="max-w-screen-sm mx-auto px-3 pt-5 pb-10 sm:max-w-screen-2xl sm:px-10">
      {/* Header */}
      <div className="mb-5">
        <h2 className={text.pageTitle}>บันทึกการตี</h2>
      </div>

      {/* ── Desktop: 2-column dashboard ── */}
      <div className="hidden sm:flex sm:gap-5 sm:items-start">
        {/* Col 1: Hero card + Heatmap below */}
        <div className="w-[400px] flex-shrink-0">
          <div className="relative rounded-3xl p-6 mb-4 text-white overflow-hidden shadow-xl" style={{background: 'linear-gradient(135deg, var(--hero-from) 0%, #0f172a 55%, var(--hero-to) 100%)'}}>
            <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full blur-3xl" style={{background: 'rgba(255,255,255,0.18)'}} />
            <div className="absolute -bottom-12 -left-8 w-52 h-52 rounded-full blur-3xl" style={{background: 'rgba(255,255,255,0.10)'}} />
            <div className="absolute top-0 right-8 w-36 h-36 rounded-full blur-3xl" style={{background: 'var(--hero-gold, rgba(255,255,255,0.08))'}} />
            <div className="absolute bottom-2 right-1/4 w-20 h-20 rounded-full blur-2xl" style={{background: 'var(--hero-gold2, rgba(255,255,255,0.06))'}} />
            <div className="absolute inset-0 opacity-[0.12]" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '180px 180px'}} />
            <div className="absolute inset-0 rounded-3xl" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.15)'}} />
            <RacketSVG clipId="rh-desk" />
            <div className="relative z-10 flex items-end justify-between mb-3">
              <div>
                <div className="text-xs text-white/60 mb-0.5">ตีไปทั้งหมด</div>
                <div className="flex items-end gap-1.5 leading-none">
                  <span className="text-5xl font-black">{totalSessions}</span>
                  <span className="text-lg text-white/60 mb-1">ครั้ง</span>
                </div>
              </div>
              {streak >= 2 && (
                <div className="flex items-center gap-1.5 bg-orange-500/20 text-orange-300 px-3 py-1.5 rounded-full">
                  <span className="text-lg">🔥</span>
                  <span className="text-sm font-semibold">{streak} วันติด</span>
                </div>
              )}
            </div>
            {/* Sparkline */}
            <div className="relative z-10 flex items-end gap-2 mb-4" style={{ height: 68 }}>
              {sparkMonths.map((m, i) => {
                const h = m.games > 0 ? Math.max((m.games / maxSparkGames) * 42, 8) : 4;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
                    {m.games > 0 && (
                      <span className="text-[10px] font-bold tabular-nums leading-none mb-0.5"
                        style={{ color: m.isCurrent ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.45)' }}>{m.games}</span>
                    )}
                    <div className="w-full rounded-t-[4px] transition-all"
                      style={{ height: h, backgroundColor: m.isCurrent ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.18)' }} />
                    <span className="text-[9px] font-medium leading-none mt-0.5"
                      style={{ color: m.isCurrent ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.35)' }}>{m.label}</span>
                  </div>
                );
              })}
            </div>
            <div className="relative z-10 border-t border-white/10 pt-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center"><div className="text-xl font-black">{thisMonthGames}</div><div className="text-[10px] text-white/50 font-medium mt-0.5">เกม</div></div>
                <div className="text-center"><div className="text-xl font-black">{avgGamesPerDay ?? '—'}</div><div className="text-[10px] text-white/50 font-medium mt-0.5">เกม/วัน</div></div>
                <div className="text-center"><div className="text-xl font-black">{avgDuration ?? '—'}</div><div className="text-[10px] text-white/50 font-medium mt-0.5">เฉลี่ย</div></div>
              </div>
            </div>
          </div>
          {sessions.length > 0 && (
            <ActivityCard sessions={sessions} viewYear={viewYear} viewMonth={viewMonth} onPrev={prevMonth} onNext={nextMonth} />
          )}
        </div>

        {/* Col 2: Session feed */}
        <div className="flex-1 min-w-0">
          {sessions.length === 0 ? (
            <div className={emptyState.wrapper}>
              <div className={emptyState.icon}>🏸</div>
              <div className={emptyState.title}>เริ่มบันทึกการตีแบด</div>
              <div className={emptyState.subtitle}>ติดตามพัฒนาการและสถิติของคุณ</div>
              <button onClick={onLogSession} className={btn.primaryLg}>+ บันทึกครั้งแรก</button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 items-center">
                {/* Search */}
                <div className="relative flex-1">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--dashed)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
                  </svg>
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="ค้นหาก๊วน หรือสนาม..."
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-[var(--input-b)] rounded-2xl focus:outline-none focus:ring-1 focus:ring-[var(--input-f)] placeholder-[var(--dashed)]"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--dashed)] hover:text-[var(--text-3)]">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
                {/* Month filter dropdown */}
                <select
                  value={viewYM}
                  onChange={e => { const [y, m] = e.target.value.split('-').map(Number); setViewYear(y); setViewMonth(m - 1); }}
                  className="flex-shrink-0 px-3 py-2 rounded-2xl text-xs font-semibold border bg-white focus:outline-none"
                  style={{ color: 'var(--text-1)', borderColor: 'var(--input-b)' }}
                >
                  {availableMonths.map(({ ym, label, yearLabel }) => (
                    <option key={ym} value={ym}>{label}{yearLabel}</option>
                  ))}
                </select>
              </div>
              {viewedSessions.length === 0 && (
                <div className="text-center text-sm text-[var(--text-3)] py-8">{search ? `ไม่พบ "${search}"` : 'ไม่มีบันทึกในเดือนนี้'}</div>
              )}
              {viewedSessions.length > 0 && (
                <FeedList sessions={viewedSessions} getCourtName={getCourtName} getGroupName={getGroupName}
                  onEditSession={onEditSession} setConfirmDeleteId={setConfirmDeleteId} onUpdateNote={onUpdateNote} onUpdatePhoto={onUpdatePhoto} onUpdatePhotos={onUpdatePhotos} onViewInfo={setViewInfoSession} onViewCourt={setViewCourtId} />
              )}
            </div>
          )}
        </div>


      </div>

      {/* ── Mobile: tabs ── */}
      <div className="sm:hidden" onTouchStart={e => { const t = e.touches[0]; (e.currentTarget as HTMLElement).dataset.tx = String(t.clientX); }} onTouchEnd={e => { const startX = Number((e.currentTarget as HTMLElement).dataset.tx ?? 0); const dx = e.changedTouches[0].clientX - startX; if (Math.abs(dx) > 50) setMobileTab(dx < 0 ? 'stats' : 'feed'); }}>
        {/* Tab switcher */}
        <div className="flex rounded-2xl p-1 mb-4" style={{ backgroundColor: 'var(--chip-bg)' }}>
          {(['feed', 'stats'] as const).map(tab => (
            <button key={tab} onClick={() => setMobileTab(tab)}
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                backgroundColor: mobileTab === tab ? '#ffffff' : 'transparent',
                color: mobileTab === tab ? 'var(--text-1)' : 'var(--text-3)',
                boxShadow: mobileTab === tab ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}>
              {tab === 'feed' ? 'ฟีด' : 'สถิติ'}
            </button>
          ))}
        </div>

        {/* Stats tab */}
        {mobileTab === 'stats' && (
          <>
            <div className="relative rounded-3xl p-6 mb-4 text-white overflow-hidden shadow-xl" style={{background: 'linear-gradient(135deg, var(--hero-from) 0%, #0f172a 55%, var(--hero-to) 100%)'}}>
              <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full blur-3xl" style={{background: 'rgba(255,255,255,0.18)'}} />
              <div className="absolute -bottom-12 -left-8 w-52 h-52 rounded-full blur-3xl" style={{background: 'rgba(255,255,255,0.10)'}} />
              <div className="absolute top-0 right-8 w-36 h-36 rounded-full blur-3xl" style={{background: 'var(--hero-gold, rgba(255,255,255,0.08))'}} />
              <div className="absolute bottom-2 right-1/4 w-20 h-20 rounded-full blur-2xl" style={{background: 'var(--hero-gold2, rgba(255,255,255,0.06))'}} />
              <div className="absolute inset-0 opacity-[0.12]" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '180px 180px'}} />
              <div className="absolute inset-0 rounded-3xl" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.15)'}} />
              <RacketSVG clipId="rh-mob" />
              <div className="relative z-10 flex items-end justify-between mb-3">
                <div>
                  <div className="text-xs text-white/60 mb-0.5">ตีไปทั้งหมด</div>
                  <div className="flex items-end gap-1.5 leading-none">
                    <span className="text-5xl font-black">{totalSessions}</span>
                    <span className="text-lg text-white/60 mb-1">ครั้ง</span>
                  </div>
                </div>
                {streak >= 2 && (
                  <div className="flex items-center gap-1.5 bg-orange-500/20 text-orange-300 px-3 py-1.5 rounded-full">
                    <span className="text-lg">🔥</span>
                    <span className="text-sm font-semibold">{streak} วันติด</span>
                  </div>
                )}
              </div>
              {/* Sparkline */}
              <div className="relative z-10 flex items-end gap-2 mb-4" style={{ height: 68 }}>
                {sparkMonths.map((m, i) => {
                  const h = m.games > 0 ? Math.max((m.games / maxSparkGames) * 42, 8) : 4;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
                      {m.games > 0 && (
                        <span className="text-[10px] font-bold tabular-nums leading-none mb-0.5"
                          style={{ color: m.isCurrent ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.45)' }}>{m.games}</span>
                      )}
                      <div className="w-full rounded-t-[4px]"
                        style={{ height: h, backgroundColor: m.isCurrent ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.18)' }} />
                      <span className="text-[9px] font-medium leading-none mt-0.5"
                        style={{ color: m.isCurrent ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.35)' }}>{m.label}</span>
                    </div>
                  );
                })}
              </div>
              <div className="relative z-10 border-t border-white/10 pt-3">
                <div className="grid grid-cols-3 gap-2">
                    <div className="text-center"><div className="text-xl font-black">{thisMonthGames}</div><div className="text-[10px] text-white/50 font-medium mt-0.5">เกม</div></div>
                  <div className="text-center"><div className="text-xl font-black">{avgGamesPerDay ?? '—'}</div><div className="text-[10px] text-white/50 font-medium mt-0.5">เกม/วัน</div></div>
                  <div className="text-center"><div className="text-xl font-black">{avgDuration ?? '—'}</div><div className="text-[10px] text-white/50 font-medium mt-0.5">เฉลี่ย</div></div>
                </div>
              </div>
            </div>
            {sessions.length > 0 && <ActivityCard sessions={sessions} viewYear={viewYear} viewMonth={viewMonth} onPrev={prevMonth} onNext={nextMonth} />}
          </>
        )}

        {/* Feed tab */}
        {mobileTab === 'feed' && (
          sessions.length === 0 ? (
            <div className={emptyState.wrapper}>
              <div className={emptyState.icon}>🏸</div>
              <div className={emptyState.title}>เริ่มบันทึกการตีแบด</div>
              <div className={emptyState.subtitle}>ติดตามพัฒนาการและสถิติของคุณ</div>
              <button onClick={onLogSession} className={btn.primaryLg}>+ บันทึกครั้งแรก</button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--dashed)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
                  </svg>
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="ค้นหาก๊วน หรือสนาม..."
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-[var(--input-b)] rounded-2xl focus:outline-none focus:ring-1 focus:ring-[var(--input-f)] placeholder-[var(--dashed)]"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--dashed)] hover:text-[var(--text-3)]">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
                {/* Month filter dropdown */}
                <select
                  value={viewYM}
                  onChange={e => { const [y, m] = e.target.value.split('-').map(Number); setViewYear(y); setViewMonth(m - 1); }}
                  className="flex-shrink-0 px-3 py-2 rounded-2xl text-xs font-semibold border bg-white focus:outline-none"
                  style={{ color: 'var(--text-1)', borderColor: 'var(--input-b)' }}
                >
                  {availableMonths.map(({ ym, label, yearLabel }) => (
                    <option key={ym} value={ym}>{label}{yearLabel}</option>
                  ))}
                </select>
              </div>
              {viewedSessions.length === 0 && (
                <div className="text-center text-sm text-[var(--text-3)] py-8">{search ? `ไม่พบ "${search}"` : 'ไม่มีบันทึกในเดือนนี้'}</div>
              )}
              {viewedSessions.length > 0 && (
                <FeedList sessions={viewedSessions} getCourtName={getCourtName} getGroupName={getGroupName}
                  onEditSession={onEditSession} setConfirmDeleteId={setConfirmDeleteId} onUpdateNote={onUpdateNote} onUpdatePhoto={onUpdatePhoto} onUpdatePhotos={onUpdatePhotos} onViewInfo={setViewInfoSession} onViewCourt={setViewCourtId} />
              )}
            </div>
          )
        )}
      </div>

      {/* Group / Court info sheet */}
      {viewCourtId && (() => {
        const court = courts.find(c => c.id === viewCourtId);
        if (!court) return null;
        return <CourtPanel court={court} onClose={() => setViewCourtId(null)} />;
      })()}

      {viewInfoSession && (() => {
        const court = courts.find(c => c.id === viewInfoSession.courtId);
        const group = court?.groups.find(g => g.id === viewInfoSession.groupId);
        if (!court || !group) return null;
        const groupSessions = sessions.filter(s => s.courtId === court.id && s.groupId === group.id);
        return (
          <GroupReviewModal
            group={group}
            court={court}
            sessions={groupSessions}
            onClose={() => setViewInfoSession(null)}
            onNavigateToCourt={() => { setViewInfoSession(null); onNavigateToCourt(court.id); }}
          />
        );
      })()}

      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center sm:items-center" onClick={() => setConfirmDeleteId(null)}>
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
            <p className="text-base font-semibold text-[var(--text-1)] mb-1">ลบบันทึก</p>
            <p className="text-sm text-[var(--text-3)] mb-5">ลบรายการนี้ออกจากประวัติ?</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-[var(--input-b)] text-sm text-[var(--text-2)] hover:bg-[var(--hover-bg)] transition-colors">ยกเลิก</button>
              <button onClick={() => { onDeleteSession(confirmDeleteId); setConfirmDeleteId(null); }} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">ลบ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
