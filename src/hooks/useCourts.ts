import { useState, useEffect } from 'react';
import { Court } from '../types';

const STORAGE_KEY = 'badminton-courts';

export function useCourts() {
  const [courts, setCourts] = useState<Court[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courts));
  }, [courts]);

  const addCourt = (court: Omit<Court, 'id' | 'createdAt' | 'groups'>) => {
    const newCourt: Court = {
      ...court,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      groups: [],
    };
    setCourts(prev => [...prev, newCourt]);
    return newCourt;
  };

  const updateCourt = (id: string, data: Partial<Court>) => {
    setCourts(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteCourt = (id: string) => {
    setCourts(prev => prev.filter(c => c.id !== id));
  };

  const addGroup = (courtId: string, group: Omit<import('../types').Group, 'id' | 'courtId' | 'reviews'>) => {
    const newGroup: import('../types').Group = {
      ...group,
      id: crypto.randomUUID(),
      courtId,
      reviews: [],
    };
    setCourts(prev => prev.map(c =>
      c.id === courtId ? { ...c, groups: [...c.groups, newGroup] } : c
    ));
    return newGroup;
  };

  const updateGroup = (courtId: string, groupId: string, data: Partial<import('../types').Group>) => {
    setCourts(prev => prev.map(c =>
      c.id === courtId
        ? { ...c, groups: c.groups.map(g => g.id === groupId ? { ...g, ...data } : g) }
        : c
    ));
  };

  const deleteGroup = (courtId: string, groupId: string) => {
    setCourts(prev => prev.map(c =>
      c.id === courtId
        ? { ...c, groups: c.groups.filter(g => g.id !== groupId) }
        : c
    ));
  };

  const addReview = (
    courtId: string,
    groupId: string,
    review: Omit<import('../types').Review, 'id' | 'groupId'>
  ) => {
    const newReview: import('../types').Review = {
      ...review,
      id: crypto.randomUUID(),
      groupId,
    };
    setCourts(prev => prev.map(c =>
      c.id === courtId
        ? {
            ...c,
            groups: c.groups.map(g =>
              g.id === groupId ? { ...g, reviews: [newReview] } : g
            ),
          }
        : c
    ));
  };

  return { courts, addCourt, updateCourt, deleteCourt, addGroup, updateGroup, deleteGroup, addReview };
}
