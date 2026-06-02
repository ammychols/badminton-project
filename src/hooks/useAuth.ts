import { useState, useEffect } from 'react';
import { User, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRedirectResult(auth)
      .then(result => { if (result?.user) setUser(result.user); })
      .catch(err => setError(err.message));
    return onAuthStateChanged(auth, u => { setUser(u); setLoading(false); });
  }, []);

  const signIn = () => {
    setError(null);
    signInWithRedirect(auth, googleProvider).catch(err => setError(err.message));
  };
  const signOutUser = () => signOut(auth);

  return { user, loading, signIn, signOut: signOutUser, error };
}
