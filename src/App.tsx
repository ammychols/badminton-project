import React, { useState } from 'react';
import { useCourts } from './hooks/useCourts';
import { TodayView } from './components/TodayView';
import { CourtsView } from './components/CourtsView';
import { AddCourtModal } from './components/AddCourtModal';
import { AddGroupModal } from './components/AddGroupModal';
import { ReviewModal } from './components/ReviewModal';

type Tab = 'today' | 'courts';

interface ModalState {
  type: 'addCourt' | 'addGroup' | 'review';
  courtId?: string;
  groupId?: string;
}

export default function App() {
  const [tab, setTab] = useState<Tab>('today');
  const [modal, setModal] = useState<ModalState | null>(null);

  const {
    courts,
    addCourt,
    deleteCourt,
    addGroup,
    deleteGroup,
    addReview,
  } = useCourts();

  const closeModal = () => setModal(null);

  const activeCourt = modal?.courtId ? courts.find(c => c.id === modal.courtId) : undefined;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-2">
          <span className="text-2xl">🏸</span>
          <h1 className="text-lg font-bold text-green-700">BadmintonTracker</h1>
        </div>
      </header>

      {/* Content */}
      <main className="pb-24">
        {tab === 'today' && (
          <TodayView
            courts={courts}
            onAddReview={(courtId, groupId) =>
              setModal({ type: 'review', courtId, groupId })
            }
          />
        )}
        {tab === 'courts' && (
          <CourtsView
            courts={courts}
            onAddCourt={() => setModal({ type: 'addCourt' })}
            onAddGroup={courtId => setModal({ type: 'addGroup', courtId })}
            onDeleteCourt={deleteCourt}
            onDeleteGroup={deleteGroup}
          />
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40">
        <div className="max-w-lg mx-auto flex">
          <TabButton
            icon="🏸"
            label="วันนี้"
            active={tab === 'today'}
            onClick={() => setTab('today')}
          />
          <TabButton
            icon="🏟️"
            label="สนาม"
            active={tab === 'courts'}
            onClick={() => setTab('courts')}
          />
        </div>
      </nav>

      {/* Modals */}
      {modal?.type === 'addCourt' && (
        <AddCourtModal
          onClose={closeModal}
          onSave={data => { addCourt(data); closeModal(); }}
        />
      )}

      {modal?.type === 'addGroup' && modal.courtId && activeCourt && (
        <AddGroupModal
          courtName={activeCourt.name}
          onClose={closeModal}
          onSave={data => { addGroup(modal.courtId!, data); closeModal(); }}
        />
      )}

      {modal?.type === 'review' && modal.courtId && modal.groupId && activeCourt && (
        <ReviewModal
          court={activeCourt}
          groupId={modal.groupId}
          onClose={closeModal}
          onSave={data => {
            addReview(modal.courtId!, modal.groupId!, data);
            closeModal();
          }}
        />
      )}
    </div>
  );
}

function TabButton({
  icon, label, active, onClick
}: {
  icon: string; label: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${
        active ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
      {active && <div className="w-4 h-0.5 bg-green-500 rounded-full mt-0.5" />}
    </button>
  );
}
