'use client';

import { useState, useEffect, useCallback } from 'react';
import { fheClient, EncryptedData } from '../lib/fhe/client';

export function useFHE() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await fheClient.initialize();
        setIsReady(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Initialization failed');
      }
    };

    init();
  }, []);

  return {
    isReady,
    error,
    client: fheClient,
  };
}
