import React, { useState, useMemo } from 'react';
import { Court, Session } from '../types';
import { QuickLogCard, InlineLogData, TodayLock } from './QuickLogCard';
import { ConfirmDialog } from './ConfirmDialog';
import { btn, emptyState, text } from '../styles/tokens';
import { SessionRow } from './SessionRow';
import { MONTH_SHORT, formatDate } from '../utils/date';

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
  const [search, setSearch] = useState('');

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentYM = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

  const [monthFilter, setMonthFilter] = useState<string | null>(null);
  const [groupFilterId, setGroupFilterId] = useState<string | null>(null);
  const [moodFilter, setMoodFilter] = useState<number | null>(null);

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
    if (groupFilterId) {
      if (s.groupId !== groupFilterId) return false;
    } else if (monthFilter) {
      if (!s.date.startsWith(monthFilter)) return false;
    }
    if (moodFilter !== null && s.mood !== moodFilter) return false;
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
        onSelectionChange={(groupId) => { setGroupFilterId(groupId); if (groupId) setMonthFilter(null); }}
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
            {/* Search */}
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--dashed)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="ค้นหา"
                className="w-full py-2 pl-9 pr-3 text-base leading-none bg-white border border-[var(--input-b)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--input-f)] placeholder-[var(--dashed)]"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--dashed)] hover:text-[var(--text-3)]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
            {/* Month filter */}
            <select
              value={monthFilter ?? 'all'}
              onChange={e => {
                const v = e.target.value;
                setGroupFilterId(null);
                setMonthFilter(v === 'all' ? null : v);
              }}
              className="flex-shrink-0 py-2 px-3 text-base leading-none font-medium rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--input-f)]"
              style={{ color: monthFilter ? 'var(--p-deep)' : 'var(--text-1)', borderColor: monthFilter ? 'var(--p)' : 'var(--input-b)', backgroundColor: monthFilter ? 'var(--p-tint)' : 'white' }}
            >
              <option value="all">เดือน</option>
              {availableMonths.map(({ ym, label, yearLabel }) => (
                <option key={ym} value={ym}>{label}{yearLabel}</option>
              ))}
            </select>
            {/* Mood filter */}
            <select
              value={moodFilter ?? 'all'}
              onChange={e => {
                const v = e.target.value;
                setMoodFilter(v === 'all' ? null : Number(v));
              }}
              className="flex-shrink-0 py-2 px-3 text-base leading-none font-medium rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--input-f)]"
              style={{ color: moodFilter !== null ? 'var(--p-deep)' : 'var(--text-1)', borderColor: moodFilter !== null ? 'var(--p)' : 'var(--input-b)', backgroundColor: moodFilter !== null ? 'var(--p-tint)' : 'white' }}
            >
              <option value="all">มู้ด</option>
              <option value="1">😡</option>
              <option value="2">😴</option>
              <option value="3">😐</option>
              <option value="4">🙂</option>
              <option value="5">😄</option>
              <option value="6">🔥</option>
            </select>
          </div>

          {viewedSessions.length === 0 && (
            <div className="text-center text-sm text-[var(--text-3)] py-8">
              {search
                ? `ไม่พบ "${search}"`
                : groupFilterId
                  ? 'ยังไม่มีบันทึกของก๊วนนี้'
                  : monthFilter && moodFilter !== null
                    ? 'ไม่มีบันทึกที่ตรงกัน'
                    : moodFilter !== null
                      ? 'ไม่มีบันทึกที่มู้ดนี้'
                      : monthFilter
                        ? 'ไม่มีบันทึกในเดือนนี้'
                        : 'ยังไม่มีบันทึก'}
            </div>
          )}
          {viewedSessions.length > 0 && (
            <FeedList sessions={viewedSessions} getCourtName={getCourtName} getGroupName={getGroupName}
              onEditSession={onEditSession} setConfirmDeleteId={setConfirmDeleteId} onUpdateNote={onUpdateNote} onUpdatePhotos={onUpdatePhotos} onViewInfo={s => onViewGroup(s.courtId, s.groupId)} />
          )}
        </div>
      )}

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
