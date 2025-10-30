/**
 * EIP-712 signing utilities for FHEVM
 * Used for user decryption authorization
 */

export interface EIP712Domain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
}

export interface DecryptionRequest {
  contractAddress: string;
  handle: string;
  userAddress: string;
}

export function createEIP712Domain(
  contractAddress: string,
  chainId: number
): EIP712Domain {
  return {
    name: 'FHEVM',
    version: '1',
    chainId,
    verifyingContract: contractAddress
  };
}

export function createDecryptionMessage(
  contractAddress: string,
  handle: string,
  userAddress: string
): DecryptionRequest {
  return {
    contractAddress,
    handle,
    userAddress
  };
}

export async function signEIP712(
  signer: any,
  domain: EIP712Domain,
  types: any,
  message: any
): Promise<string> {
  // Sign the typed data according to EIP-712
  return signer.signTypedData(domain, types, message);
}

export const DECRYPTION_TYPES = {
  DecryptionRequest: [
    { name: 'contractAddress', type: 'address' },
    { name: 'handle', type: 'bytes32' },
    { name: 'userAddress', type: 'address' }
  ]
};
