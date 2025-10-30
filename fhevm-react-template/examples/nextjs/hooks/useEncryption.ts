'use client';

import { useState, useCallback } from 'react';
import { fheClient, EncryptedData } from '../lib/fhe/client';

export function useEncryption() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const encrypt = useCallback(async (value: number, type: string = 'uint8'): Promise<EncryptedData | null> => {
    setLoading(true);
    setError(null);

    try {
      const encrypted = await fheClient.encrypt(value, type);
      return encrypted;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Encryption failed';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    encrypt,
    loading,
    error,
  };
}
