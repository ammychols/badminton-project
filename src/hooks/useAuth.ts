import { useState, useEffect } from 'react';
import { User, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Process any pending redirect result first
    getRedirectResult(auth)
      .then(result => { if (result?.user) setUser(result.user); })
      .catch(err => { if (err.code !== 'auth/no-current-user') setError(err.message); });

    return onAuthStateChanged(auth, u => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const signIn = async () => {
    setError(null);
    try {
      // Try popup first (faster UX), fall back to redirect if blocked
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
        signInWithRedirect(auth, googleProvider);
      } else {
        setError(err.message);
      }
    }
  };

  const signOutUser = () => signOut(auth);

  return { user, loading, signIn, signOut: signOutUser, error };
}
