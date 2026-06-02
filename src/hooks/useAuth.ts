import { useState, useEffect } from 'react';
import { User, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, u => { setUser(u); setLoading(false); });
  }, []);

  const signIn = () => signInWithPopup(auth, googleProvider);
  const signOutUser = () => signOut(auth);

  return { user, loading, signIn, signOut: signOutUser };
}
