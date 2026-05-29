import React, { useState } from 'react';
import { useCourts } from './hooks/useCourts';
import { CourtsView } from './components/CourtsView';
import { AddCourtModal } from './components/AddCourtModal';
import { AddGroupModal } from './components/AddGroupModal';
import { ReviewModal } from './components/ReviewModal';

interface ModalState {
  type: 'addCourt' | 'addGroup' | 'review';
  courtId?: string;
  groupId?: string;
}

export default function App() {
  const [modal, setModal] = useState<ModalState | null>(null);
  const { courts, addCourt, deleteCourt, addGroup, deleteGroup, addReview } = useCourts();

  const closeModal = () => setModal(null);
  const activeCourt = modal?.courtId ? courts.find(c => c.id === modal.courtId) : undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-2">
          <span className="text-2xl">🏸</span>
          <h1 className="text-lg font-bold text-green-700">BadmintonTracker</h1>
        </div>
      </header>

      <main className="pb-8">
        <CourtsView
          courts={courts}
          onAddCourt={() => setModal({ type: 'addCourt' })}
          onAddGroup={courtId => setModal({ type: 'addGroup', courtId })}
          onDeleteCourt={deleteCourt}
          onDeleteGroup={deleteGroup}
          onAddReview={(courtId, groupId) => setModal({ type: 'review', courtId, groupId })}
        />
      </main>

      {modal?.type === 'addCourt' && (
        <AddCourtModal onClose={closeModal} onSave={data => { addCourt(data); closeModal(); }} />
      )}
      {modal?.type === 'addGroup' && modal.courtId && activeCourt && (
        <AddGroupModal courtName={activeCourt.name} onClose={closeModal} onSave={data => { addGroup(modal.courtId!, data); closeModal(); }} />
      )}
      {modal?.type === 'review' && modal.courtId && modal.groupId && activeCourt && (
        <ReviewModal
          court={activeCourt}
          groupId={modal.groupId}
          onClose={closeModal}
          onSave={data => { addReview(modal.courtId!, modal.groupId!, data); closeModal(); }}
        />
      )}
    </div>
  );
}
