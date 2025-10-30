import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { FhevmSDK, FhevmConfig } from '../core/FhevmSDK';

export interface FhevmContextValue {
  fhevm: FhevmSDK | null;
  isReady: boolean;
  error: Error | null;
}

export const FhevmContext = createContext<FhevmContextValue | null>(null);

export interface FhevmProviderProps {
  config: FhevmConfig;
  children: ReactNode;
}

export function FhevmProvider({ config, children }: FhevmProviderProps) {
  const [fhevm, setFhevm] = useState<FhevmSDK | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initSdk = async () => {
      try {
        const sdk = new FhevmSDK(config);
        await sdk.init();
        setFhevm(sdk);
        setIsReady(true);
      } catch (err) {
        setError(err as Error);
        console.error('Failed to initialize FHEVM SDK:', err);
      }
    };

    initSdk();
  }, [config]);

  const value: FhevmContextValue = {
    fhevm,
    isReady,
    error
  };

  return <FhevmContext.Provider value={value}>{children}</FhevmContext.Provider>;
}
