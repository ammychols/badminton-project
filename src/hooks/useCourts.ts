import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, setDoc, deleteDoc, deleteField, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Court, Group, Review } from '../types';
import { uploadGroupImage, deleteGroupImage } from '../utils/uploadImage';

// If the image is a base64 data URL, upload to Firebase Storage and return the https:// URL.
// Otherwise return the value as-is (already a Storage URL or undefined).
async function resolveImage(uid: string, groupId: string, image: string | undefined): Promise<string | undefined> {
  if (!image) return undefined;
  if (image.startsWith('data:')) return uploadGroupImage(uid, groupId, image);
  return image;
}

// Serialize a group for Firestore — strip undefined fields.
function toFs(group: Partial<Group>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(group).filter(([, v]) => v !== undefined));
}

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
      updateDoc(ref(id), { info: Object.keys(clean).length === 0 ? deleteField() : clean });
    } else {
      setDoc(ref(id), JSON.parse(JSON.stringify(data)), { merge: true });
    }
  };

  const deleteCourt = (id: string) => {
    const court = get(id);
    court?.groups.forEach(g => deleteGroupImage(uid, g.id));
    deleteDoc(ref(id));
  };

  const addGroup = async (courtId: string, group: Omit<Group, 'id' | 'courtId' | 'reviews'>) => {
    const court = get(courtId);
    if (!court) return;
    const groupId = crypto.randomUUID();
    const image = await resolveImage(uid, groupId, group.image);
    const newGroup = toFs({ ...group, image, id: groupId, courtId, reviews: [] });
    await setDoc(ref(courtId), { groups: [...court.groups.map(toFs), newGroup] }, { merge: true });
    return newGroup as unknown as Group;
  };

  const updateGroup = async (courtId: string, groupId: string, data: Partial<Group>) => {
    const court = get(courtId);
    if (!court) return;
    const removingImage = 'image' in data && data.image === undefined;
    const image = await resolveImage(uid, groupId, data.image);
    if (removingImage) await deleteGroupImage(uid, groupId);
    const patch = toFs({ ...data, image });
    await setDoc(ref(courtId), {
      groups: court.groups.map(g => {
        if (g.id !== groupId) return toFs(g);
        const base = toFs(g) as Record<string, unknown>;
        if (removingImage) delete base.image;
        return { ...base, ...patch };
      }),
    }, { merge: true });
  };

  const deleteGroup = (courtId: string, groupId: string) => {
    const court = get(courtId);
    if (!court) return;
    deleteGroupImage(uid, groupId);
    setDoc(ref(courtId), { groups: court.groups.filter(g => g.id !== groupId).map(toFs) }, { merge: true });
  };

  const addReview = (courtId: string, groupId: string, review: Omit<Review, 'id' | 'groupId'>) => {
    const court = get(courtId);
    if (!court) return;
    if (!review.notes) {
      setDoc(ref(courtId), { groups: court.groups.map(g => toFs({ ...g, ...(g.id === groupId ? { reviews: [] } : {}) })) }, { merge: true });
      return;
    }
    const newReview = { ...review, id: crypto.randomUUID(), groupId };
    setDoc(ref(courtId), {
      groups: court.groups.map(g => toFs({ ...g, ...(g.id === groupId ? { reviews: [newReview] } : {}) })),
    }, { merge: true });
  };

  return { courts, addCourt, updateCourt, deleteCourt, addGroup, updateGroup, deleteGroup, addReview };
}
