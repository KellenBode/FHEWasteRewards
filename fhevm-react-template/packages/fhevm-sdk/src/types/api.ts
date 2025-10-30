/**
 * API type definitions for FHEVM SDK
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface EncryptionRequest {
  value: number;
  type: string;
}

export interface EncryptionResponse {
  encrypted: {
    data: string;
    type: string;
  };
}

export interface DecryptionRequest {
  encryptedData: string;
  signature?: string;
}

export interface DecryptionResponse {
  decrypted: number;
  verified: boolean;
}

export interface ContractCallRequest {
  functionName: string;
  params: any[];
}

export interface ContractCallResponse {
  result: any;
  txHash?: string;
}
