import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useCourts } from './hooks/useCourts';
import { useSessions } from './hooks/useSessions';
import { CourtsView } from './components/CourtsView';
import { SessionsView } from './components/SessionsView';
import { AddCourtModal } from './components/AddCourtModal';
import { AddGroupModal } from './components/AddGroupModal';
import { ReviewModal } from './components/ReviewModal';
import { CourtInfoModal } from './components/CourtInfoModal';
import { LogSessionModal } from './components/LogSessionModal';
import { AppIcon } from './components/AppIcon';

import { Court, DayOfWeek } from './types';

type Tab = 'courts' | 'sessions';

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
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center px-6">
      <div className="mb-10 text-center">
        <div className="flex justify-center mb-6">
          <AppIcon size={96} />
        </div>
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
  const [tab, setTab] = useState<Tab>(() => (localStorage.getItem('activeTab') as Tab) ?? 'courts');
  const switchTab = (t: Tab) => { setTab(t); localStorage.setItem('activeTab', t); };
  const [modal, setModal] = useState<ModalState | null>(null);

  const [showUserMenu, setShowUserMenu] = useState(false);
  const { courts, addCourt, deleteCourt, addGroup, updateGroup, updateCourt, deleteGroup, addReview } = useCourts(user?.uid ?? '');
  const { sessions, addSession, deleteSession, updateSession } = useSessions(user?.uid ?? '');

  const closeModal = () => setModal(null);
  const openModal = (m: ModalState) => { setShowUserMenu(false); setModal(m); };
  const activeCourt = modal?.courtSnapshot ?? (modal?.courtId ? courts.find(c => c.id === modal.courtId) : undefined);
  const activeGroup = activeCourt && modal?.groupId ? activeCourt.groups.find(g => g.id === modal.groupId) : undefined;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-3xl animate-spin">🏸</div>
      </div>
    );
  }

  if (!user) return <LoginScreen onSignIn={signIn} error={error} />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-none mx-auto px-4 py-3 flex items-center justify-between">
          <AppIcon size={28} />
          <h1 className="text-lg font-bold text-gray-900">BadmintonTracker</h1>
          <button onClick={() => setShowUserMenu(v => !v)} className="flex items-center gap-2">
            <img src={user.photoURL ?? ''} alt="" className="w-7 h-7 rounded-full" />
          </button>
        </div>
      </header>

      {showUserMenu && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setShowUserMenu(false)} />
          <div className="fixed top-14 right-4 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-[70] min-w-[200px]">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-800 truncate">{user.displayName}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
            <button onClick={() => { signOut(); setShowUserMenu(false); }}
              className="w-full text-left px-4 py-3 text-sm text-red-500 font-medium hover:bg-red-50 transition-colors">
              ออกจากระบบ
            </button>
          </div>
        </>
      )}

      <main className="flex-1 pb-20">
        {tab === 'courts' ? (
          <CourtsView
            courts={courts}
            onAddCourt={() => openModal({ type: 'addCourt' })}
            onAddGroup={(courtId, defaultDay) => openModal({ type: 'addGroup', courtId, defaultDay })}
            onDeleteCourt={deleteCourt}
            onDeleteGroup={deleteGroup}
            onEditGroup={(courtId, groupId) => openModal({ type: 'editGroup', courtId, groupId })}
            onRateCourt={courtId => openModal({ type: 'courtInfo', courtId })}
            onAddReview={(courtId, groupId, notes) => addReview(courtId, groupId, { fun: 0, arrangement: 0, notes: notes || undefined, date: new Date().toISOString() })}
          />
        ) : (
          <SessionsView
            sessions={sessions}
            courts={courts}
            onLogSession={() => openModal({ type: 'logSession' })}
            onDeleteSession={deleteSession}
            onEditSession={session => openModal({ type: 'logSession', sessionId: session.id })}
          />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40">
        <div className="flex items-center justify-center gap-2 px-6 py-2">
          <button onClick={() => switchTab('sessions')}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${tab === 'sessions' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-800'}`}>
            <span>📝</span><span>บันทึก</span>
          </button>
          <button onClick={() => switchTab('courts')}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${tab === 'courts' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-800'}`}>
            <span>🏸</span><span>สนาม</span>
          </button>
        </div>
      </nav>

      {modal?.type === 'addCourt' && (
        <AddCourtModal onClose={closeModal} onSave={data => {
          const newCourt = addCourt(data);
          setModal({ type: 'courtInfo', courtId: newCourt.id, isNewCourt: true, courtSnapshot: newCourt });
        }} />
      )}
      {modal?.type === 'addGroup' && modal.courtId && activeCourt && (
        <AddGroupModal courtName={activeCourt.name} defaultDay={modal.defaultDay} onClose={closeModal} onSave={data => { addGroup(modal.courtId!, data); closeModal(); }} />
      )}
      {modal?.type === 'editGroup' && modal.courtId && modal.groupId && activeCourt && activeGroup && (
        <AddGroupModal
          courtName={activeCourt.name}
          initialValues={{ name: activeGroup.name, days: activeGroup.days, startTime: activeGroup.startTime, endTime: activeGroup.endTime, levels: activeGroup.levels, notes: activeGroup.notes, image: activeGroup.image }}
          onClose={closeModal}
          onSave={data => { updateGroup(modal.courtId!, modal.groupId!, data); closeModal(); }}
        />
      )}
      {modal?.type === 'courtInfo' && modal.courtId && activeCourt && (
        <CourtInfoModal
          court={activeCourt}
          onClose={closeModal}
          isNewCourt={modal.isNewCourt}
          onSave={data => { updateCourt(modal.courtId!, { info: data }); closeModal(); }}
        />
      )}
      {modal?.type === 'review' && modal.courtId && modal.groupId && activeCourt && (
        <ReviewModal
          court={activeCourt}
          groupId={modal.groupId}
          onClose={closeModal}
          onSave={data => { addReview(modal.courtId!, modal.groupId!, data); closeModal(); }}
        />
      )}
      {modal?.type === 'logSession' && (
        <LogSessionModal
          courts={courts}
          onClose={closeModal}
          initialSession={modal.sessionId ? sessions.find(s => s.id === modal.sessionId) : undefined}
          onSave={data => {
            if (modal.sessionId) updateSession(modal.sessionId, data);
            else addSession(data);
            closeModal();
          }}
        />
      )}
    </div>
  );
}
