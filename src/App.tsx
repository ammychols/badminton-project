import React, { useState } from 'react';
import { useCourts } from './hooks/useCourts';
import { useSessions } from './hooks/useSessions';
import { CourtsView } from './components/CourtsView';
import { SessionsView } from './components/SessionsView';
import { AddCourtModal } from './components/AddCourtModal';
import { AddGroupModal } from './components/AddGroupModal';
import { ReviewModal } from './components/ReviewModal';
import { CourtInfoModal } from './components/CourtInfoModal';
import { LogSessionModal } from './components/LogSessionModal';

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

export default function App() {
  const [tab, setTab] = useState<Tab>(() => (localStorage.getItem('activeTab') as Tab) ?? 'courts');

  const switchTab = (t: Tab) => { setTab(t); localStorage.setItem('activeTab', t); };
  const [modal, setModal] = useState<ModalState | null>(null);
  const { courts, addCourt, deleteCourt, addGroup, updateGroup, updateCourt, deleteGroup, addReview } = useCourts();
  const { sessions, addSession, deleteSession, updateSession } = useSessions();

  const closeModal = () => setModal(null);
  const activeCourt = modal?.courtSnapshot ?? (modal?.courtId ? courts.find(c => c.id === modal.courtId) : undefined);
  const activeGroup = activeCourt && modal?.groupId ? activeCourt.groups.find(g => g.id === modal.groupId) : undefined;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-gray-900 sticky top-0 z-40">
        <div className="max-w-none mx-auto px-5 py-3.5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-lg flex-shrink-0">🏸</div>
          <div className="leading-none tracking-tight">
            <span className="text-white font-black text-base uppercase">Badminton</span>
            <span className="text-green-400 font-black text-base uppercase">Tracker</span>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-20">
        {tab === 'courts' ? (
          <CourtsView
              courts={courts}
              onAddCourt={() => setModal({ type: 'addCourt' })}
              onAddGroup={(courtId, defaultDay) => setModal({ type: 'addGroup', courtId, defaultDay })}
              onDeleteCourt={deleteCourt}
              onDeleteGroup={deleteGroup}
              onEditGroup={(courtId, groupId) => setModal({ type: 'editGroup', courtId, groupId })}
              onRateCourt={courtId => setModal({ type: 'courtInfo', courtId })}
              onAddReview={(courtId, groupId, notes) => addReview(courtId, groupId, { fun: 0, arrangement: 0, notes: notes || undefined, date: new Date().toISOString() })}
            />
        ) : (
          <SessionsView
            sessions={sessions}
            courts={courts}
            onLogSession={() => setModal({ type: 'logSession' })}
            onDeleteSession={deleteSession}
            onEditSession={session => setModal({ type: 'logSession', sessionId: session.id })}
          />
        )}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40">
        <div className="flex items-center justify-center gap-2 px-6 py-2">
          <button
            onClick={() => switchTab('sessions')}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              tab === 'sessions'
                ? 'bg-gray-900 text-white'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <span>📝</span>
            <span>บันทึก</span>
          </button>
          <button
            onClick={() => switchTab('courts')}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              tab === 'courts'
                ? 'bg-gray-900 text-white'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <span>🏸</span>
            <span>สนาม</span>
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
          onSave={data => {
            updateCourt(modal.courtId!, { info: data });
            closeModal();
          }}
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
