'use client';

import { useDataStore } from '@/hooks/use-data-store';
import { useEffect, useState } from 'react';

export function StoreInitializer() {
  const [hydrated, setHydrated] = useState(false);
  
  // This effect runs once on the client to ensure the store is hydrated from localStorage
  useEffect(() => {
    useDataStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  return hydrated ? null : null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StoreInitializer />
      {children}
    </>
  );
}
