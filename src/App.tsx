import React, { useState } from 'react';
import { useCourts } from './hooks/useCourts';
import { CourtsView } from './components/CourtsView';
import { AddCourtModal } from './components/AddCourtModal';
import { AddGroupModal } from './components/AddGroupModal';
import { ReviewModal } from './components/ReviewModal';
import { CourtRatingModal } from './components/CourtRatingModal';

import { DayOfWeek } from './types';

interface ModalState {
  type: 'addCourt' | 'addGroup' | 'editGroup' | 'review' | 'rateCourt';
  courtId?: string;
  groupId?: string;
  defaultDay?: DayOfWeek;
}

export default function App() {
  const [modal, setModal] = useState<ModalState | null>(null);
  const { courts, addCourt, deleteCourt, addGroup, updateGroup, updateCourt, deleteGroup, addReview } = useCourts();

  const closeModal = () => setModal(null);
  const activeCourt = modal?.courtId ? courts.find(c => c.id === modal.courtId) : undefined;
  const activeGroup = activeCourt && modal?.groupId ? activeCourt.groups.find(g => g.id === modal.groupId) : undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-none mx-auto px-4 py-3 flex items-center gap-2">
          <h1 className="text-lg font-bold text-green-700">BadmintonTracker</h1>
        </div>
      </header>

      <main className="pb-8">
        <CourtsView
          courts={courts}
          onAddCourt={() => setModal({ type: 'addCourt' })}
          onAddGroup={(courtId, defaultDay) => setModal({ type: 'addGroup', courtId, defaultDay })}
          onDeleteCourt={deleteCourt}
          onDeleteGroup={deleteGroup}
          onEditGroup={(courtId, groupId) => setModal({ type: 'editGroup', courtId, groupId })}
          onRateCourt={courtId => setModal({ type: 'rateCourt', courtId })}
          onClearCourtRating={courtId => updateCourt(courtId, { rating: undefined })}
          onAddReview={(courtId, groupId) => setModal({ type: 'review', courtId, groupId })}
        />
      </main>

      {modal?.type === 'addCourt' && (
        <AddCourtModal onClose={closeModal} onSave={data => {
          const newCourt = addCourt(data);
          setModal({ type: 'addGroup', courtId: newCourt.id });
        }} />
      )}
      {modal?.type === 'addGroup' && modal.courtId && activeCourt && (
        <AddGroupModal courtName={activeCourt.name} defaultDay={modal.defaultDay} onClose={closeModal} onSave={data => { addGroup(modal.courtId!, data); closeModal(); }} />
      )}
      {modal?.type === 'editGroup' && modal.courtId && modal.groupId && activeCourt && activeGroup && (
        <AddGroupModal
          courtName={activeCourt.name}
          initialValues={{ name: activeGroup.name, days: activeGroup.days, startTime: activeGroup.startTime, endTime: activeGroup.endTime, levels: activeGroup.levels, notes: activeGroup.notes }}
          onClose={closeModal}
          onSave={data => { updateGroup(modal.courtId!, modal.groupId!, data); closeModal(); }}
        />
      )}
      {modal?.type === 'rateCourt' && modal.courtId && activeCourt && (
        <CourtRatingModal
          court={activeCourt}
          onClose={closeModal}
          onSave={data => { updateCourt(modal.courtId!, { rating: data }); closeModal(); }}
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
    </div>
  );
}
