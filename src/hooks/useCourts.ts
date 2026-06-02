import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Court, Group, Review } from '../types';

export function useCourts(uid: string) {
  const [courts, setCourts] = useState<Court[]>([]);

  useEffect(() => {
    if (!uid) return;
    return onSnapshot(collection(db, 'users', uid, 'courts'), snap => {
      setCourts(snap.docs.map(d => d.data() as Court));
    });
  }, [uid]);

  const ref = (courtId: string) => doc(db, 'users', uid, 'courts', courtId);
  const get = (courtId: string) => courts.find(c => c.id === courtId);

  const addCourt = (data: Omit<Court, 'id' | 'createdAt' | 'groups'>) => {
    const id = crypto.randomUUID();
    const court: Court = { ...data, id, createdAt: new Date().toISOString(), groups: [] };
    setDoc(ref(id), court);
    return court;
  };

  const updateCourt = (id: string, data: Partial<Court>) => {
    updateDoc(ref(id), data as any);
  };

  const deleteCourt = (id: string) => {
    deleteDoc(ref(id));
  };

  const addGroup = (courtId: string, group: Omit<Group, 'id' | 'courtId' | 'reviews'>) => {
    const court = get(courtId);
    if (!court) return;
    const newGroup: Group = { ...group, id: crypto.randomUUID(), courtId, reviews: [] };
    updateDoc(ref(courtId), { groups: [...court.groups, newGroup] });
    return newGroup;
  };

  const updateGroup = (courtId: string, groupId: string, data: Partial<Group>) => {
    const court = get(courtId);
    if (!court) return;
    updateDoc(ref(courtId), { groups: court.groups.map(g => g.id === groupId ? { ...g, ...data } : g) });
  };

  const deleteGroup = (courtId: string, groupId: string) => {
    const court = get(courtId);
    if (!court) return;
    updateDoc(ref(courtId), { groups: court.groups.filter(g => g.id !== groupId) });
  };

  const addReview = (courtId: string, groupId: string, review: Omit<Review, 'id' | 'groupId'>) => {
    const court = get(courtId);
    if (!court) return;
    const newReview: Review = { ...review, id: crypto.randomUUID(), groupId };
    updateDoc(ref(courtId), {
      groups: court.groups.map(g => g.id === groupId ? { ...g, reviews: [newReview] } : g),
    });
  };

  return { courts, addCourt, updateCourt, deleteCourt, addGroup, updateGroup, deleteGroup, addReview };
}
