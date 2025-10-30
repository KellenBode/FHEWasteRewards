'use client';

import { FhevmProvider } from '@fhevm/sdk';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FhevmProvider
      config={{
        network: 'sepolia',
        contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x8EAB26B5C6E8Efe05D30b479C483802D2Ab15c14',
        provider: typeof window !== 'undefined' ? (window as any).ethereum : undefined
      }}
    >
      {children}
    </FhevmProvider>
  );
}
