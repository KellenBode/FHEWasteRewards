'use client';

import { useState, useCallback } from 'react';
import { fheClient, EncryptedData } from '../lib/fhe/client';

export function useComputation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const compute = useCallback(async (
    operation: 'add' | 'subtract' | 'multiply' | 'compare',
    operands: EncryptedData[]
  ): Promise<EncryptedData | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await fheClient.compute(operation, operands);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Computation failed';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    compute,
    loading,
    error,
  };
}
