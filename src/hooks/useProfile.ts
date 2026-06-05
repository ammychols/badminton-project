import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

export function useProfile(uid: string) {
  const [gender, setGenderState] = useState<'male' | 'female' | null>(null);

  useEffect(() => {
    if (!uid) return;
    return onSnapshot(doc(db, 'users', uid, 'profile', 'main'), snap => {
      const data = snap.data();
      setGenderState((data?.gender as 'male' | 'female' | undefined) ?? null);
    });
  }, [uid]);

  const setGender = (g: 'male' | 'female' | null) => {
    if (g === null) return deleteDoc(doc(db, 'users', uid, 'profile', 'main'));
    return setDoc(doc(db, 'users', uid, 'profile', 'main'), { gender: g });
  };

  return { gender, setGender };
}
