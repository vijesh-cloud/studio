
'use client';

import { useDataStore } from '@/hooks/use-data-store';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, registeredUsers } = useDataStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in. Check if they exist in our data store.
        const appUser = registeredUsers.find(u => u.email === firebaseUser.email);
        if (appUser) {
            setUser({
                ...appUser,
                id: firebaseUser.uid, // Always use Firebase UID as the canonical ID
                name: firebaseUser.displayName || appUser.name,
                avatar: firebaseUser.photoURL || appUser.avatar
            });
        }
        // If the user isn't in our store, it means they've just registered.
        // The registration flow will handle adding them to the store.
      } else {
        // User is signed out.
        setUser(null);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [setUser, registeredUsers]);

  return <>{children}</>;
}


export function Providers({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  
  // This effect runs once on the client to ensure the store is hydrated from localStorage
  useEffect(() => {
    useDataStore.persist.rehydrate().then(() => setHydrated(true));
  }, []);

  if (!hydrated) {
    return null; // or a loading screen
  }

  return <AuthProvider>{children}</AuthProvider>;
}

    