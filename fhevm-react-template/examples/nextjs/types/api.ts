/**
 * API Type Definitions
 */

import { EncryptedValue } from './fhe';

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface EncryptRequest {
  value: number | boolean | string;
  type: string;
}

export interface EncryptResponse {
  success: boolean;
  encrypted: EncryptedValue;
  message: string;
}

export interface DecryptRequest {
  encryptedData: EncryptedValue;
  userAddress?: string;
}

export interface DecryptResponse {
  success: boolean;
  decrypted: number | boolean | string;
  type: string;
  message: string;
}

export interface ComputeRequest {
  operation: 'add' | 'subtract' | 'multiply' | 'compare';
  operands: EncryptedValue[];
}

export interface ComputeResponse {
  success: boolean;
  operation: string;
  result: EncryptedValue;
  message: string;
}

export interface KeysResponse {
  success: boolean;
  publicKey: {
    key: string;
    type: string;
    algorithm: string;
    generated: string;
  };
  message: string;
}
