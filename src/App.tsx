import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from './hooks/useAuth';
import { useCourts } from './hooks/useCourts';
import { useSessions } from './hooks/useSessions';
import { useProfile } from './hooks/useProfile';
import { CourtsView } from './components/CourtsView';
import { SessionsView } from './components/SessionsView';
import { StatsView } from './components/StatsView';
import { AddCourtModal } from './components/AddCourtModal';
import { AddGroupModal } from './components/AddGroupModal';
import { ReviewModal } from './components/ReviewModal';
import { CourtInfoModal } from './components/CourtInfoModal';
import { LogSessionModal } from './components/LogSessionModal';
import { LogCelebration } from './components/LogCelebration';
import { GroupScorecard } from './components/GroupScorecard';
import { InlineLogData, TodayLock } from './components/QuickLogCard';
import { calcStreak, thisMonthString, todayString } from './utils/date';
import { Z } from './styles/overlay';

import { Court, DayOfWeek } from './types';

type Tab = 'courts' | 'sessions' | 'stats';

interface ModalState {
  type: 'addCourt' | 'addGroup' | 'editGroup' | 'review' | 'courtInfo' | 'logSession';
  courtId?: string;
  groupId?: string;
  defaultDay?: DayOfWeek;
  isNewCourt?: boolean;
  courtSnapshot?: Court;
  sessionId?: string;
}

function LoginScreen({ onSignIn, error }: { onSignIn: () => void; error: string | null }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: 'var(--nav-bg)' }}>
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">BadmintonTracker</h1>
        <p className="text-sm text-slate-400">บันทึกสนาม · ก๊วน · สถิติการตี</p>
      </div>
      <button
        onClick={onSignIn}
        className="flex items-center gap-3 bg-white rounded-2xl px-6 py-3.5 shadow-lg hover:bg-gray-100 active:scale-95 transition-all"
      >
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span className="text-sm font-semibold text-gray-800">เข้าสู่ระบบด้วย Google</span>
      </button>
      {error && <p className="mt-4 text-xs text-red-400 text-center max-w-xs">{error}</p>}
      <p className="mt-8 text-xs text-slate-500 text-center">ข้อมูลจะ sync ทุก device ที่ใช้ account เดียวกัน</p>
    </div>
  );
}

export default function App() {
  const { user, loading, signIn, signOut, error } = useAuth();
  const [tab, setTab] = useState<Tab>(() => {
    const stored = localStorage.getItem('activeTab');
    return (['courts', 'sessions', 'stats'] as Tab[]).includes(stored as Tab) ? (stored as Tab) : 'sessions';
  });
  const switchTab = (t: Tab) => { setTab(t); localStorage.setItem('activeTab', t); };
  const [highlightCourtId, setHighlightCourtId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [viewGroupKey, setViewGroupKey] = useState<{ courtId: string; groupId: string } | null>(null);

  // Today-lock: persists across reloads; auto-discarded when date changes
  const [todayLock, setTodayLock] = useState<TodayLock | null>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('todayLock') ?? 'null') as TodayLock | null;
      return stored?.date === todayString() ? stored : null;
    } catch { return null; }
  });
  const lockGroup = (courtId: string, groupId: string) => {
    const lock: TodayLock = { courtId, groupId, date: todayString() };
    setTodayLock(lock);
    localStorage.setItem('todayLock', JSON.stringify(lock));
  };
  const unlockGroup = () => {
    setTodayLock(null);
    localStorage.removeItem('todayLock');
  };
  const saveInline = (data: InlineLogData) => {
    addSession(data);
    triggerJustLogged();
    unlockGroup();
  };

  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!showUserMenu) return;
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showUserMenu]);
  const { courts, addCourt, deleteCourt, addGroup, updateGroup, updateCourt, deleteGroup, addReview } = useCourts(user?.uid ?? '');
  const { sessions, addSession, deleteSession, updateSession } = useSessions(user?.uid ?? '');

  // Show QuickLogCard (today picker) when there are still unlogged groups today.
  const hasQuickLogCandidate = useMemo(() => {
    const DOW_MAP: DayOfWeek[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const today = todayString();
    const dow = DOW_MAP[new Date(today + 'T00:00:00').getDay()];
    return courts.some(c => c.groups.some(g =>
      g.days.includes(dow) && !sessions.some(s => s.groupId === g.id && s.date === today)
    ));
  }, [courts, sessions]);
  const [justLogged, setJustLogged] = useState(false);
  const justLoggedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerJustLogged = () => {
    if (justLoggedTimerRef.current) clearTimeout(justLoggedTimerRef.current);
    setJustLogged(true);
    justLoggedTimerRef.current = setTimeout(() => setJustLogged(false), 5000);
  };

  const closeModal = () => setModal(null);
  const openModal = (m: ModalState) => { setShowUserMenu(false); setModal(m); };
  const activeCourt = modal?.courtSnapshot ?? (modal?.courtId ? courts.find(c => c.id === modal.courtId) : undefined);
  const activeGroup = activeCourt && modal?.groupId ? activeCourt.groups.find(g => g.id === modal.groupId) : undefined;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--app-bg)' }}>
        <div className="text-3xl animate-spin">🏸</div>
      </div>
    );
  }

  if (!user) return <LoginScreen onSignIn={signIn} error={error} />;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--app-bg)' }}>
      <header className="sticky top-0 z-40" style={{ backgroundColor: 'var(--nav-bg)', borderBottom: '1px solid var(--nav-border)', paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-none mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold" style={{ color: '#ffffff' }}>🏸 BadmintonTracker</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowUserMenu(v => !v)} className="flex items-center gap-2">
              <img src={user.photoURL ?? ''} alt="" className="w-7 h-7 rounded-full" />
            </button>
          </div>
        </div>
      </header>

      {showUserMenu && (
        <div ref={userMenuRef} className="fixed top-14 right-4 rounded-2xl shadow-xl overflow-hidden min-w-[200px]" style={{ zIndex: Z.dropdown, backgroundColor: '#ffffff', border: '1px solid var(--card-border)' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--card-border)' }}>
            <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-1)' }}>{user.displayName}</p>
            <p className="text-xs truncate" style={{ color: 'var(--text-3)' }}>{user.email}</p>
          </div>
          <button onClick={() => { signOut(); setShowUserMenu(false); }}
            className="w-full text-left px-4 py-3 text-sm text-red-500 font-medium hover:bg-red-50 transition-colors">
            ออกจากระบบ
          </button>
        </div>
      )}

      <main className="flex-1 pb-20">
        {tab === 'courts' && (
          <CourtsView
            courts={courts}
            highlightCourtId={highlightCourtId}
            onHighlightClear={() => setHighlightCourtId(null)}
            onAddCourt={() => openModal({ type: 'addCourt' })}
            onAddGroup={(courtId, defaultDay) => openModal({ type: 'addGroup', courtId, defaultDay })}
            onDeleteCourt={deleteCourt}
            onDeleteGroup={deleteGroup}
            onEditGroup={(courtId, groupId) => openModal({ type: 'editGroup', courtId, groupId })}
            onRateCourt={courtId => openModal({ type: 'courtInfo', courtId })}
            onAddReview={(courtId, groupId, notes) => addReview(courtId, groupId, { fun: 0, arrangement: 0, notes: notes || undefined, date: new Date().toJSON() })}
            onViewGroup={(courtId, groupId) => setViewGroupKey({ courtId, groupId })}
          />
        )}
        {tab === 'stats' && <StatsView sessions={sessions} />}
        {tab === 'sessions' && (
          <SessionsView
            sessions={sessions}
            courts={courts}
            onLogSession={() => openModal({ type: 'logSession' })}
            onDeleteSession={deleteSession}
            onEditSession={session => openModal({ type: 'logSession', sessionId: session.id })}
            onUpdateNote={(id, notes) => {
              const s = sessions.find(s => s.id === id);
              if (s) updateSession(id, { ...s, notes });
            }}
            onUpdatePhoto={(id, image) => {
              const s = sessions.find(s => s.id === id);
              if (s) updateSession(id, { ...s, image });
            }}
            onUpdatePhotos={(id, photos) => {
              const s = sessions.find(s => s.id === id);
              if (s) updateSession(id, { ...s, photos });
            }}
            onNavigateToCourt={courtId => { setHighlightCourtId(courtId); switchTab('courts'); }}
            onViewGroup={(courtId, groupId) => setViewGroupKey({ courtId, groupId })}
            lock={todayLock}
            onLockGroup={lockGroup}
            onUnlockGroup={unlockGroup}
            onSaveInline={saveInline}
          />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40" style={{ backgroundColor: 'var(--nav-bg)', borderTop: '1px solid var(--nav-border)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {/* FAB — บันทึก tab only, hidden when QuickLogCard has candidates */}
        {tab === 'sessions' && !hasQuickLogCandidate && (
          <button
            onClick={() => openModal({ type: 'logSession' })}
            className="absolute w-14 h-14 rounded-full flex items-center justify-center transition-transform active:scale-95"
            style={{ background: 'var(--p)', bottom: '100%', right: '20px', marginBottom: '12px', boxShadow: '0 4px 20px rgba(47,191,127,0.4)' }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--p-text)" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        )}
        <div className="flex items-center h-14">
          {([
            { key: 'sessions', label: 'บันทึก', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 7h6M9 11h6M9 15h4"/></svg> },
            { key: 'stats', label: 'สถิติ', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="12" width="4" height="10" rx="1"/><rect x="9" y="7" width="4" height="15" rx="1"/><rect x="16" y="3" width="4" height="19" rx="1"/></svg> },
            { key: 'courts', label: 'สนาม', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="12" y1="5" x2="12" y2="19"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M7 5v14M17 5v14" strokeWidth="1" strokeDasharray="2 2"/></svg> },
          ] as { key: 'sessions' | 'stats' | 'courts'; label: string; icon: React.ReactNode }[]).map(({ key, label, icon }) => {
            const active = tab === key;
            return (
              <button key={key} onClick={() => switchTab(key)}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors"
                style={{ color: active ? 'var(--nav-active)' : 'var(--nav-inactive)' }}>
                {icon}
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {justLogged && (
        <LogCelebration
          streak={calcStreak(sessions)}
          monthGames={sessions
            .filter(s => s.date.startsWith(thisMonthString()))
            .reduce((sum, s) => sum + s.gamesPlayed, 0)}
        />
      )}

      {viewGroupKey && (() => {
        const court = courts.find(c => c.id === viewGroupKey.courtId);
        const group = court?.groups.find(g => g.id === viewGroupKey.groupId);
        if (!court || !group) return null;
        const groupSessions = sessions.filter(s => s.courtId === court.id && s.groupId === group.id);
        return (
          <GroupScorecard
            group={group}
            court={court}
            sessions={groupSessions}
            onClose={() => setViewGroupKey(null)}
            onNavigateToCourt={() => { setViewGroupKey(null); setHighlightCourtId(court.id); switchTab('courts'); }}
          />
        );
      })()}

      {modal?.type === 'addCourt' && (
        <AddCourtModal onClose={closeModal} onSave={data => {
          const newCourt = addCourt(data);
          openModal({ type: 'courtInfo', courtId: newCourt.id, isNewCourt: true, courtSnapshot: newCourt });
        }} />
      )}
      {modal?.type === 'addGroup' && modal.courtId && activeCourt && (
        <AddGroupModal courtName={activeCourt.name} defaultDay={modal.defaultDay} onClose={closeModal} onSave={data => { closeModal(); addGroup(modal.courtId!, data).catch(console.error); }} />
      )}
      {modal?.type === 'editGroup' && modal.courtId && modal.groupId && activeCourt && activeGroup && (
        <AddGroupModal
          courtName={activeCourt.name}
          initialValues={{ name: activeGroup.name, days: activeGroup.days, startTime: activeGroup.startTime, endTime: activeGroup.endTime, levels: activeGroup.levels, notes: activeGroup.notes, image: activeGroup.image }}
          onClose={closeModal}
          onSave={data => { closeModal(); updateGroup(modal.courtId!, modal.groupId!, data).catch(console.error); }}
        />
      )}
      {modal?.type === 'courtInfo' && modal.courtId && activeCourt && (
        <CourtInfoModal
          court={activeCourt}
          onClose={closeModal}
          isNewCourt={modal.isNewCourt}
          onSave={data => { closeModal(); updateCourt(modal.courtId!, { info: data }); }}
        />
      )}
      {modal?.type === 'review' && modal.courtId && modal.groupId && activeCourt && (
        <ReviewModal
          court={activeCourt}
          groupId={modal.groupId}
          onClose={closeModal}
          onSave={data => { closeModal(); addReview(modal.courtId!, modal.groupId!, data); }}
        />
      )}
      {modal?.type === 'logSession' && (
        <LogSessionModal
          courts={courts}
          onClose={closeModal}
          initialSession={modal.sessionId ? sessions.find(s => s.id === modal.sessionId) : undefined}
          prefill={!modal.sessionId ? { courtId: modal.courtId, groupId: modal.groupId } : undefined}
          onSave={data => {
            if (modal.sessionId) updateSession(modal.sessionId, data);
            else { addSession(data); triggerJustLogged(); }
            closeModal();
          }}
        />
      )}
    </div>
  );
}
