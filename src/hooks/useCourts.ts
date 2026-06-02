import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, setDoc, deleteDoc, deleteField, updateDoc } from 'firebase/firestore';
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
    if ('info' in data) {
      const clean = JSON.parse(JSON.stringify(data.info ?? {}));
      // Use updateDoc so it replaces the info field entirely (not merge subfields)
      updateDoc(ref(id), { info: Object.keys(clean).length === 0 ? deleteField() : clean });
    } else {
      setDoc(ref(id), JSON.parse(JSON.stringify(data)), { merge: true });
    }
  };

  const deleteCourt = (id: string) => {
    deleteDoc(ref(id));
  };

  const addGroup = (courtId: string, group: Omit<Group, 'id' | 'courtId' | 'reviews'>) => {
    const court = get(courtId);
    if (!court) return;
    const raw = { ...group, id: crypto.randomUUID(), courtId, reviews: [] };
    const newGroup = Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== undefined)) as unknown as Group;
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
    // If notes is empty, clear all reviews for this group
    if (!review.notes) {
      setDoc(ref(courtId), { groups: court.groups.map(g => g.id === groupId ? { ...g, reviews: [] } : g) }, { merge: true });
      return;
    }
    const raw = { ...review, id: crypto.randomUUID(), groupId };
    const newReview = Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== undefined));
    setDoc(ref(courtId), {
      groups: court.groups.map(g => g.id === groupId ? { ...g, reviews: [newReview] } : g),
    }, { merge: true });
  };

  return { courts, addCourt, updateCourt, deleteCourt, addGroup, updateGroup, deleteGroup, addReview };
}
