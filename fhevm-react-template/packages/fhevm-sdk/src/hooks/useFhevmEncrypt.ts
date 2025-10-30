import { useState, useCallback } from 'react';
import { useFhevmInit } from './useFhevmInit';
import { EncryptedValue } from '../core/FhevmSDK';

export function useFhevmEncrypt() {
  const { fhevm, isReady } = useFhevmInit();
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const encrypt = useCallback(
    async (value: number, type: string = 'uint8'): Promise<EncryptedValue | null> => {
      if (!isReady || !fhevm) {
        setError(new Error('SDK not ready'));
        return null;
      }

      setIsEncrypting(true);
      setError(null);

      try {
        const encrypted = await fhevm.encrypt(value, type);
        return encrypted;
      } catch (err) {
        const error = err as Error;
        setError(error);
        return null;
      } finally {
        setIsEncrypting(false);
      }
    },
    [fhevm, isReady]
  );

  const encryptBatch = useCallback(
    async (values: Array<{ value: number; type: string }>): Promise<EncryptedValue[] | null> => {
      if (!isReady || !fhevm) {
        setError(new Error('SDK not ready'));
        return null;
      }

      setIsEncrypting(true);
      setError(null);

      try {
        const encrypted = await fhevm.encryptBatch(values);
        return encrypted;
      } catch (err) {
        const error = err as Error;
        setError(error);
        return null;
      } finally {
        setIsEncrypting(false);
      }
    },
    [fhevm, isReady]
  );

  return {
    encrypt,
    encryptBatch,
    isEncrypting,
    error
  };
}
