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
}

export default function App() {
  const [tab, setTab] = useState<Tab>('courts');
  const [modal, setModal] = useState<ModalState | null>(null);
  const { courts, addCourt, deleteCourt, addGroup, updateGroup, updateCourt, deleteGroup, addReview } = useCourts();
  const { sessions, addSession, deleteSession } = useSessions();

  const closeModal = () => setModal(null);
  const activeCourt = modal?.courtSnapshot ?? (modal?.courtId ? courts.find(c => c.id === modal.courtId) : undefined);
  const activeGroup = activeCourt && modal?.groupId ? activeCourt.groups.find(g => g.id === modal.groupId) : undefined;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-none mx-auto px-4 py-3 flex items-center gap-2">
          <h1 className="text-lg font-bold text-green-700">BadmintonTracker</h1>
        </div>
      </header>

      <main className="flex-1 pb-20">
        {tab === 'courts' ? (
          <div className="max-w-screen-2xl mx-auto px-4">
            <CourtsView
              courts={courts}
              onAddCourt={() => setModal({ type: 'addCourt' })}
              onAddGroup={(courtId, defaultDay) => setModal({ type: 'addGroup', courtId, defaultDay })}
              onDeleteCourt={deleteCourt}
              onDeleteGroup={deleteGroup}
              onEditGroup={(courtId, groupId) => setModal({ type: 'editGroup', courtId, groupId })}
              onRateCourt={courtId => setModal({ type: 'courtInfo', courtId })}
              onAddReview={(courtId, groupId) => setModal({ type: 'review', courtId, groupId })}
            />
          </div>
        ) : (
          <SessionsView
            sessions={sessions}
            courts={courts}
            onLogSession={() => setModal({ type: 'logSession' })}
            onDeleteSession={deleteSession}
          />
        )}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40">
        <div className="flex items-center justify-center gap-2 px-6 py-2">
          <button
            onClick={() => setTab('sessions')}
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
            onClick={() => setTab('courts')}
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
          onSave={data => { addSession(data); closeModal(); }}
        />
      )}
    </div>
  );
}
