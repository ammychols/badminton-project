import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Session } from '../types';

export function useSessions(uid: string) {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    if (!uid) return;
    return onSnapshot(collection(db, 'users', uid, 'sessions'), snap => {
      setSessions(snap.docs.map(d => d.data() as Session));
    });
  }, [uid]);

  const ref = (id: string) => doc(db, 'users', uid, 'sessions', id);

  const addSession = (data: Omit<Session, 'id'>) => {
    const id = crypto.randomUUID();
    const raw = { ...data, id };
    const session = Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== undefined)) as Session;
    setDoc(ref(id), session);
    return session;
  };

  const deleteSession = (id: string) => deleteDoc(ref(id));

  const updateSession = (id: string, data: Omit<Session, 'id'>) => {
    updateDoc(ref(id), data as any);
  };

  const sortedSessions = [...sessions].sort((a, b) => {
    const d = b.date.localeCompare(a.date);
    return d !== 0 ? d : b.startTime.localeCompare(a.startTime);
  });

  return { sessions: sortedSessions, addSession, deleteSession, updateSession };
}
