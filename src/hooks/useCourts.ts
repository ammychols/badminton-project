import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, setDoc, deleteDoc, deleteField, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Court, Group, Review } from '../types';

// Images are stored in localStorage (not Firestore) to stay under Firestore's 1MB document limit.
const imgKey = (id: string) => `grp_img_${id}`;

function saveImg(id: string, img: string | undefined) {
  img ? localStorage.setItem(imgKey(id), img) : localStorage.removeItem(imgKey(id));
}
function loadImg(id: string): string | undefined {
  return localStorage.getItem(imgKey(id)) ?? undefined;
}

// Merge localStorage images into groups fetched from Firestore.
// If a group has an image in Firestore (legacy), migrate it to localStorage.
function withImgs(groups: Group[]): Group[] {
  return groups.map(g => {
    const local = loadImg(g.id);
    if (local) return { ...g, image: local };
    if (g.image) {
      saveImg(g.id, g.image); // migrate existing Firestore image → localStorage
      return g;
    }
    return g;
  });
}

// Strip image fields before writing to Firestore so documents stay small.
function toFirestore(groups: Group[]): Omit<Group, 'image'>[] {
  return groups.map(({ image: _img, ...rest }) => rest);
}

export function useCourts(uid: string) {
  const [courts, setCourts] = useState<Court[]>([]);

  useEffect(() => {
    if (!uid) return;
    return onSnapshot(collection(db, 'users', uid, 'courts'), snap => {
      setCourts(snap.docs.map(d => {
        const court = d.data() as Court;
        return { ...court, groups: withImgs(court.groups) };
      }));
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
      updateDoc(ref(id), { info: Object.keys(clean).length === 0 ? deleteField() : clean });
    } else {
      setDoc(ref(id), JSON.parse(JSON.stringify(data)), { merge: true });
    }
  };

  const deleteCourt = (id: string) => {
    const court = get(id);
    court?.groups.forEach(g => saveImg(g.id, undefined));
    deleteDoc(ref(id));
  };

  const addGroup = (courtId: string, group: Omit<Group, 'id' | 'courtId' | 'reviews'>) => {
    const court = get(courtId);
    if (!court) return;
    const raw = { ...group, id: crypto.randomUUID(), courtId, reviews: [] };
    const newGroup = Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== undefined)) as unknown as Group;
    saveImg(newGroup.id, newGroup.image);
    setDoc(ref(courtId), { groups: [...toFirestore(court.groups), ...toFirestore([newGroup])] }, { merge: true });
    return newGroup;
  };

  const updateGroup = (courtId: string, groupId: string, data: Partial<Group>) => {
    const court = get(courtId);
    if (!court) return;
    if ('image' in data) saveImg(groupId, data.image);
    const { image: _img, ...cleanNoImg } = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined)
    ) as Partial<Group>;
    setDoc(ref(courtId), {
      groups: toFirestore(court.groups).map(g => g.id === groupId ? { ...g, ...cleanNoImg } : g),
    }, { merge: true });
  };

  const deleteGroup = (courtId: string, groupId: string) => {
    const court = get(courtId);
    if (!court) return;
    saveImg(groupId, undefined);
    setDoc(ref(courtId), { groups: toFirestore(court.groups).filter(g => g.id !== groupId) }, { merge: true });
  };

  const addReview = (courtId: string, groupId: string, review: Omit<Review, 'id' | 'groupId'>) => {
    const court = get(courtId);
    if (!court) return;
    if (!review.notes) {
      setDoc(ref(courtId), { groups: toFirestore(court.groups).map(g => g.id === groupId ? { ...g, reviews: [] } : g) }, { merge: true });
      return;
    }
    const raw = { ...review, id: crypto.randomUUID(), groupId };
    const newReview = Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== undefined));
    setDoc(ref(courtId), {
      groups: toFirestore(court.groups).map(g => g.id === groupId ? { ...g, reviews: [newReview] } : g),
    }, { merge: true });
  };

  return { courts, addCourt, updateCourt, deleteCourt, addGroup, updateGroup, deleteGroup, addReview };
}
