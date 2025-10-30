/**
 * React adapter for FHEVM SDK
 * Exports React-specific hooks and components
 */

export { FhevmProvider, FhevmContext } from '../context/FhevmContext';
export type { FhevmContextValue, FhevmProviderProps } from '../context/FhevmContext';

export { useFhevmInit } from '../hooks/useFhevmInit';
export { useFhevmEncrypt } from '../hooks/useFhevmEncrypt';
export { useFhevmDecrypt } from '../hooks/useFhevmDecrypt';

// Re-export core for convenience
export { FhevmSDK } from '../core/FhevmSDK';
export type { FhevmConfig, EncryptedValue } from '../core/FhevmSDK';
