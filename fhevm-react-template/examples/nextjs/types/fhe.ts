/**
 * FHE Type Definitions for Next.js Application
 */

export type FHEDataType = 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'bool' | 'address';

export interface EncryptedValue {
  ciphertext: string;
  type: FHEDataType;
  timestamp: number;
  isEncrypted: boolean;
}

export interface DecryptedValue {
  value: number | boolean | string;
  type: FHEDataType;
  timestamp: number;
}

export interface FHEPublicKey {
  key: string;
  type: 'public';
  algorithm: string;
  generated: string;
}

export interface FHEPrivateKey {
  key: string;
  type: 'private';
  algorithm: string;
  generated: string;
}

export interface FHEOperationResult {
  success: boolean;
  operation: string;
  result: EncryptedValue;
  message?: string;
}
