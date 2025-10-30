'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface FHEContextType {
  isInitialized: boolean;
  publicKey: string | null;
  error: string | null;
  initialize: () => Promise<void>;
}

const FHEContext = createContext<FHEContextType | undefined>(undefined);

export const useFHEContext = () => {
  const context = useContext(FHEContext);
  if (!context) {
    throw new Error('useFHEContext must be used within FHEProvider');
  }
  return context;
};

interface FHEProviderProps {
  children: React.ReactNode;
}

export const FHEProvider: React.FC<FHEProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initialize = async () => {
    try {
      setError(null);

      // Fetch public key from API
      const response = await fetch('/api/keys');
      if (!response.ok) {
        throw new Error('Failed to fetch FHE keys');
      }

      const data = await response.json();
      setPublicKey(data.publicKey.key);
      setIsInitialized(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize FHE';
      setError(errorMessage);
      console.error('FHE initialization error:', err);
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  const value: FHEContextType = {
    isInitialized,
    publicKey,
    error,
    initialize,
  };

  return (
    <FHEContext.Provider value={value}>
      {children}
    </FHEContext.Provider>
  );
};
