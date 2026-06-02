import { useState, useEffect } from 'react';
import { User, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRedirectResult(auth).catch(() => {});
    return onAuthStateChanged(auth, u => { setUser(u); setLoading(false); });
  }, []);

  const signIn = () => signInWithRedirect(auth, googleProvider);
  const signOutUser = () => signOut(auth);

  return { user, loading, signIn, signOut: signOutUser };
}
