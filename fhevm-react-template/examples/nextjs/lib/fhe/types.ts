/**
 * FHE Type Definitions
 */

export type FHEDataType = 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'bool' | 'address';

export interface EncryptedValue {
  ciphertext: string;
  type: FHEDataType;
  timestamp: number;
  isEncrypted: boolean;
}

export interface FHEKeyPair {
  publicKey: string;
  privateKey: string;
  timestamp: number;
}

export interface FHEOperation {
  operation: 'add' | 'subtract' | 'multiply' | 'compare';
  operands: EncryptedValue[];
}

export interface FHEComputationResult {
  success: boolean;
  operation: string;
  result: EncryptedValue;
  message?: string;
}

export interface FHEConfig {
  network?: string;
  contractAddress?: string;
  publicKey?: string;
}
