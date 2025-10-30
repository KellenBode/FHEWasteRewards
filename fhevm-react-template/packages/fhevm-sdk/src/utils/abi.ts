import { ethers } from 'ethers';

/**
 * ABI handling utilities for FHEVM contracts
 */

export function encodeEncryptedInput(encryptedValue: string, type: string): string {
  // Encode encrypted input for contract call
  const abiCoder = ethers.AbiCoder.defaultAbiCoder();
  return abiCoder.encode(['bytes', 'string'], [encryptedValue, type]);
}

export function decodeEncryptedOutput(encodedData: string): any {
  // Decode encrypted output from contract
  const abiCoder = ethers.AbiCoder.defaultAbiCoder();
  try {
    return abiCoder.decode(['bytes'], encodedData);
  } catch (error) {
    console.error('Failed to decode encrypted output:', error);
    return null;
  }
}

export function parseContractEvent(log: any, eventAbi: any): any {
  // Parse contract event logs
  const iface = new ethers.Interface([eventAbi]);
  return iface.parseLog(log);
}

export function buildFunctionCall(
  functionName: string,
  params: any[],
  abi: any[]
): string {
  // Build encoded function call data
  const iface = new ethers.Interface(abi);
  return iface.encodeFunctionData(functionName, params);
}
