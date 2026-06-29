import React, { useState, useMemo } from 'react';
import { Court, Group, Session, ALL_LEVELS, DAY_LABELS, DayOfWeek, FLOOR_LABELS, AIR_LABELS, PARKING_LABELS } from '../types';
import { QuickLogCard, InlineLogData, TodayLock } from './QuickLogCard';
import { ConfirmDialog } from './ConfirmDialog';
import { btn, emptyState, text } from '../styles/tokens';
import { SessionRow } from './SessionRow';
import { DetailPanel } from './DetailPanel';
import { MONTH_SHORT, formatDate } from '../utils/date';

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

  const mapsAction = (
    <a href={mapsUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
      className="flex-shrink-0 flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl transition-colors"
      style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>
      นำทาง
    </a>
  );

  return (
    <DetailPanel title={court.name} subtitle={court.address} action={mapsAction} onClose={onClose}>
      <div className="px-4 py-3.5 flex flex-col gap-3 pb-8">
        {(court.info?.floor || court.info?.air || court.info?.parking || court.info?.notes) && (
          <div className="flex gap-2 flex-wrap">
            {court.info.floor && <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: 'var(--chip-bg)', color: 'var(--chip-t)' }}>{FLOOR_LABELS[court.info.floor]}</span>}
            {court.info.air && <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: 'var(--chip-bg)', color: 'var(--chip-t)' }}>{AIR_LABELS[court.info.air]}</span>}
            {court.info.parking && <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: 'var(--chip-bg)', color: 'var(--chip-t)' }}>{PARKING_LABELS[court.info.parking]}</span>}
            {court.info.notes && <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: 'var(--chip-bg)', color: 'var(--chip-t)' }}>{court.info.notes}</span>}
          </div>
        )}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          {DAY_TABS.map(({ key, label }) => (
            <button key={key} onClick={() => setPanelDay(key)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
              style={{ background: panelDay === key ? 'var(--p)' : 'var(--chip-bg)', color: panelDay === key ? 'var(--p-text)' : 'var(--chip-t)' }}>
              {label}
            </button>
          ))}
        </div>
        <div className="text-xs font-semibold text-[var(--text-3)] uppercase tracking-wide">ก๊วนในสนามนี้</div>
        {visibleGroups.length === 0 ? (
          <div className="text-sm text-[var(--text-3)] text-center py-6">ไม่มีก๊วนในวันนี้</div>
        ) : (
          <div className="flex flex-col gap-2">
            {visibleGroups.map(group => <PanelGroupRow key={group.id} group={group} />)}
          </div>
        )}
      </div>
    </DetailPanel>
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
  onLogSession: () => void;
  onDeleteSession: (id: string) => void;
  onEditSession: (session: Session) => void;
  onUpdateNote: (id: string, notes: string | undefined) => void;
  onUpdatePhoto: (id: string, image: string | undefined) => void;
  onUpdatePhotos: (id: string, photos: string[]) => void;
  onNavigateToCourt: (courtId: string) => void;
  onViewGroup: (courtId: string, groupId: string) => void;
  lock: TodayLock | null;
  onLockGroup: (courtId: string, groupId: string) => void;
  onUnlockGroup: () => void;
  onSaveInline: (data: InlineLogData) => void;
}

function FeedList({ sessions, getCourtName, getGroupName, onEditSession, setConfirmDeleteId, onUpdateNote, onUpdatePhotos, onViewInfo }: {
  sessions: Session[];
  getCourtName: (id: string) => string;
  getGroupName: (courtId: string, groupId: string) => string;
  onEditSession: (s: Session) => void;
  setConfirmDeleteId: (id: string) => void;
  onUpdateNote: (id: string, notes: string | undefined) => void;
  onUpdatePhotos: (id: string, photos: string[]) => void;
  onViewInfo: (s: Session) => void;
}) {
  const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date));
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
          <div className={`pb-3 ${gi > 0 ? 'pt-4' : 'pt-0'}`}>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--p)]" />
              <span className="text-xs font-bold text-[var(--text-3)]">{g.label}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {g.items.map(s => (
              <SessionRow key={s.id} session={s}
                courtName={getCourtName(s.courtId)} groupName={getGroupName(s.courtId, s.groupId)}
                onEdit={() => onEditSession(s)} onDelete={() => setConfirmDeleteId(s.id)}
                onUpdateNote={notes => onUpdateNote(s.id, notes)}
                onUpdatePhotos={photos => onUpdatePhotos(s.id, photos)}
                onViewInfo={() => onViewInfo(s)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SessionsView({ sessions, courts, onLogSession, onDeleteSession, onEditSession, onUpdateNote, onUpdatePhoto, onUpdatePhotos, onNavigateToCourt, onViewGroup, lock, onLockGroup, onUnlockGroup, onSaveInline }: SessionsViewProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [viewCourtId, setViewCourtId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentYM = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

  const [viewYear, setViewYear] = useState(currentYear);
  const [viewMonth, setViewMonth] = useState(currentMonth);
  const viewYM = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;

  const getCourtName = (courtId: string) => courts.find(c => c.id === courtId)?.name ?? 'ไม่พบสนาม';
  const getGroupName = (courtId: string, groupId: string) =>
    courts.find(c => c.id === courtId)?.groups.find(g => g.id === groupId)?.name ?? 'ไม่พบก๊วน';

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

  return (
    <div className="max-w-screen-sm mx-auto px-3 pt-5 pb-10">
      <div className="mb-5">
        <h2 className={text.pageTitle}>บันทึกการตี</h2>
      </div>

      <QuickLogCard
        courts={courts}
        sessions={sessions}
        lock={lock}
        onLockGroup={onLockGroup}
        onUnlockGroup={onUnlockGroup}
        onSaveInline={onSaveInline}
        onViewGroup={onViewGroup}
        onOpenFullForm={onLogSession}
      />

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
              onEditSession={onEditSession} setConfirmDeleteId={setConfirmDeleteId} onUpdateNote={onUpdateNote} onUpdatePhotos={onUpdatePhotos} onViewInfo={s => onViewGroup(s.courtId, s.groupId)} />
          )}
        </div>
      )}

      {viewCourtId && (() => {
        const court = courts.find(c => c.id === viewCourtId);
        if (!court) return null;
        return <CourtPanel court={court} onClose={() => setViewCourtId(null)} />;
      })()}

      {confirmDeleteId && (
        <ConfirmDialog
          title="ลบบันทึก"
          message="ลบรายการนี้ออกจากประวัติ?"
          onConfirm={() => { onDeleteSession(confirmDeleteId); setConfirmDeleteId(null); }}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  );
}
