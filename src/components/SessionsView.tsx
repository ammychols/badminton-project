import React, { useState, useMemo } from 'react';
import { Court, Group, Session, ALL_LEVELS, DAY_LABELS, DayOfWeek, FLOOR_LABELS, AIR_LABELS, PARKING_LABELS } from '../types';
import { GroupReviewModal } from './GroupReviewModal';
import { QuickLogCard } from './QuickLogCard';
import { ConfirmDialog } from './ConfirmDialog';
import { btn, card, text, emptyState } from '../styles/tokens';
import { HeroCard, HeroSparkMonth } from './HeroCard';
import { SessionRow } from './SessionRow';
import { DetailPanel } from './DetailPanel';
import { DAY_NAMES, MONTH_SHORT, DOW_LABELS_SHORT, todayString, toDateString, thisMonthString, calcStreak, formatDate } from '../utils/date';

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
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
      นำทาง
    </a>
  );

  return (
    <DetailPanel title={court.name} subtitle={court.address} action={mapsAction} onClose={onClose}>
      <div className="px-4 py-3.5 flex flex-col gap-3 pb-8">
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
                background: panelDay === key ? 'var(--p)' : 'var(--chip-bg)',
                color: panelDay === key ? 'var(--p-text)' : 'var(--chip-t)',
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
  onQuickLog: (data: Omit<Session, 'id'>) => void;
  onDeleteSession: (id: string) => void;
  onEditSession: (session: Session) => void;
  onUpdateNote: (id: string, notes: string | undefined) => void;
  onUpdatePhoto: (id: string, image: string | undefined) => void;
  onUpdatePhotos: (id: string, photos: string[]) => void;
  onNavigateToCourt: (courtId: string) => void;
}


function ActivityCard({ sessions, viewYear, viewMonth, onPrev, onNext }: {
  sessions: { date: string; gamesPlayed: number }[];
  viewYear: number; viewMonth: number;
  onPrev: () => void; onNext: () => void;
}) {
  const WEEKS = 16;
  const todayStr = todayString();
  const now = new Date(todayStr + 'T00:00:00');

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
    return toDateString(d);
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



export function SessionsView({ sessions, courts, onLogSession, onQuickLog, onDeleteSession, onEditSession, onUpdateNote, onUpdatePhoto, onUpdatePhotos, onNavigateToCourt }: SessionsViewProps) {
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
  const thisMonthSessions = sessions.filter(s => s.date.startsWith(currentYM));
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
          <HeroCard
            clipId="rh-desk"
            totalSessions={totalSessions}
            streak={streak}
            sparkMonths={sparkMonths}
            maxSparkGames={maxSparkGames}
            thisMonthGames={thisMonthGames}
            avgGamesPerDay={avgGamesPerDay}
            avgDuration={avgDuration}
          />
          {sessions.length > 0 && (
            <ActivityCard sessions={sessions} viewYear={viewYear} viewMonth={viewMonth} onPrev={prevMonth} onNext={nextMonth} />
          )}
        </div>

        {/* Col 2: Session feed */}
        <div className="flex-1 min-w-0">
          <QuickLogCard courts={courts} sessions={sessions} onQuickLog={onQuickLog} onOpenFullForm={onLogSession} />
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
                  onEditSession={onEditSession} setConfirmDeleteId={setConfirmDeleteId} onUpdateNote={onUpdateNote} onUpdatePhotos={onUpdatePhotos} onViewInfo={setViewInfoSession} />
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
            <HeroCard
              clipId="rh-mob"
              totalSessions={totalSessions}
              streak={streak}
              sparkMonths={sparkMonths}
              maxSparkGames={maxSparkGames}
              thisMonthGames={thisMonthGames}
              avgGamesPerDay={avgGamesPerDay}
              avgDuration={avgDuration}
            />
            {sessions.length > 0 && <ActivityCard sessions={sessions} viewYear={viewYear} viewMonth={viewMonth} onPrev={prevMonth} onNext={nextMonth} />}
          </>
        )}

        {/* Feed tab */}
        {mobileTab === 'feed' && (
          <>
          <QuickLogCard courts={courts} sessions={sessions} onQuickLog={onQuickLog} onOpenFullForm={onLogSession} />
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
                  onEditSession={onEditSession} setConfirmDeleteId={setConfirmDeleteId} onUpdateNote={onUpdateNote} onUpdatePhotos={onUpdatePhotos} onViewInfo={setViewInfoSession} />
              )}
            </div>
          )}
          </>
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
