/**
 * FHE-related type definitions
 */

export type EncryptedType = 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'bool' | 'address';

export interface EncryptedValue {
  data: string;
  type: EncryptedType;
}

export interface EncryptionInput {
  value: number;
  type: EncryptedType;
}

export interface DecryptionResult {
  value: number;
  verified: boolean;
}

export interface FHEOperation {
  type: 'add' | 'subtract' | 'multiply' | 'divide' | 'compare';
  operands: EncryptedValue[];
  result?: EncryptedValue;
}

export interface FHEKeyPair {
  publicKey: string;
  privateKey?: string; // Optional, may not be exposed
}
