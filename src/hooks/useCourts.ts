import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
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

  // Use setDoc merge so it works even if doc was just created (no race condition)
  const updateCourt = (id: string, data: Partial<Court>) => {
    setDoc(ref(id), data, { merge: true });
  };

  const deleteCourt = (id: string) => {
    deleteDoc(ref(id));
  };

  const addGroup = (courtId: string, group: Omit<Group, 'id' | 'courtId' | 'reviews'>) => {
    const court = get(courtId);
    if (!court) return;
    const raw = { ...group, id: crypto.randomUUID(), courtId, reviews: [] };
    const newGroup = Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== undefined)) as Group;
    setDoc(ref(courtId), { groups: [...court.groups, newGroup] }, { merge: true });
    return newGroup;
  };

  const updateGroup = (courtId: string, groupId: string, data: Partial<Group>) => {
    const court = get(courtId);
    if (!court) return;
    const clean = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
    setDoc(ref(courtId), { groups: court.groups.map(g => g.id === groupId ? { ...g, ...clean } : g) }, { merge: true });
  };

  const deleteGroup = (courtId: string, groupId: string) => {
    const court = get(courtId);
    if (!court) return;
    setDoc(ref(courtId), { groups: court.groups.filter(g => g.id !== groupId) }, { merge: true });
  };

  const addReview = (courtId: string, groupId: string, review: Omit<Review, 'id' | 'groupId'>) => {
    const court = get(courtId);
    if (!court) return;
    const newReview: Review = { ...review, id: crypto.randomUUID(), groupId };
    setDoc(ref(courtId), {
      groups: court.groups.map(g => g.id === groupId ? { ...g, reviews: [newReview] } : g),
    }, { merge: true });
  };

  return { courts, addCourt, updateCourt, deleteCourt, addGroup, updateGroup, deleteGroup, addReview };
}
