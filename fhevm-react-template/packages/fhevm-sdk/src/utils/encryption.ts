import { ethers } from 'ethers';

/**
 * Encryption utilities for FHEVM
 * In production, these would use tfhe-js library
 */

export async function encryptValue(value: number, type: string): Promise<string> {
  // Simple encryption simulation for demo
  // In production, use tfhe-js library for real FHE
  const encrypted = ethers.hexlify(ethers.toUtf8Bytes(value.toString()));
  return encrypted;
}

export async function encryptBatch(values: Array<{ value: number; type: string }>): Promise<string[]> {
  return Promise.all(values.map(v => encryptValue(v.value, v.type)));
}

export function validateEncryptionType(type: string): boolean {
  const validTypes = ['uint8', 'uint16', 'uint32', 'uint64', 'bool', 'address'];
  return validTypes.includes(type);
}

export function getEncryptionTypeSize(type: string): number {
  const sizes: { [key: string]: number } = {
    'uint8': 8,
    'uint16': 16,
    'uint32': 32,
    'uint64': 64,
    'bool': 1,
    'address': 160
  };
  return sizes[type] || 0;
}
