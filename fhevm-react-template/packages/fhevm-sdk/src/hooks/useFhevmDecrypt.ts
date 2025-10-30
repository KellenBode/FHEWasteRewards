import { useState, useCallback } from 'react';
import { useFhevmInit } from './useFhevmInit';
import { EncryptedValue } from '../core/FhevmSDK';

export function useFhevmDecrypt() {
  const { fhevm, isReady } = useFhevmInit();
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const userDecrypt = useCallback(
    async (
      encryptedValue: EncryptedValue,
      contractAddress?: string,
      userAddress?: string
    ): Promise<number | null> => {
      if (!isReady || !fhevm) {
        setError(new Error('SDK not ready'));
        return null;
      }

      setIsDecrypting(true);
      setError(null);

      try {
        const contract = contractAddress || fhevm.getConfig().contractAddress;
        const user = userAddress || (await fhevm.getSigner()?.getAddress()) || '';
        const decrypted = await fhevm.userDecrypt(encryptedValue, contract, user);
        return decrypted;
      } catch (err) {
        const error = err as Error;
        setError(error);
        return null;
      } finally {
        setIsDecrypting(false);
      }
    },
    [fhevm, isReady]
  );

  const publicDecrypt = useCallback(
    async (encryptedValue: EncryptedValue): Promise<number | null> => {
      if (!isReady || !fhevm) {
        setError(new Error('SDK not ready'));
        return null;
      }

      setIsDecrypting(true);
      setError(null);

      try {
        const decrypted = await fhevm.publicDecrypt(encryptedValue);
        return decrypted;
      } catch (err) {
        const error = err as Error;
        setError(error);
        return null;
      } finally {
        setIsDecrypting(false);
      }
    },
    [fhevm, isReady]
  );

  return {
    userDecrypt,
    publicDecrypt,
    isDecrypting,
    error
  };
}
