/**
 * Node.js adapter for FHEVM SDK
 * For server-side usage without React
 */

import { FhevmSDK, FhevmConfig, EncryptedValue } from '../core/FhevmSDK';

export class FhevmNode {
  private sdk: FhevmSDK;

  constructor(config: FhevmConfig) {
    this.sdk = new FhevmSDK(config);
  }

  async initialize(): Promise<void> {
    await this.sdk.init();
  }

  async encrypt(value: number, type: string = 'uint8'): Promise<EncryptedValue> {
    return this.sdk.encrypt(value, type);
  }

  async encryptBatch(values: Array<{ value: number; type: string }>): Promise<EncryptedValue[]> {
    return this.sdk.encryptBatch(values);
  }

  async userDecrypt(
    encryptedValue: EncryptedValue,
    contractAddress: string,
    userAddress: string
  ): Promise<number> {
    return this.sdk.userDecrypt(encryptedValue, contractAddress, userAddress);
  }

  async publicDecrypt(encryptedValue: EncryptedValue): Promise<number> {
    return this.sdk.publicDecrypt(encryptedValue);
  }

  getContract(abi: any[]) {
    return this.sdk.getContract(abi);
  }

  async sendTransaction(abi: any[], functionName: string, args: any[]): Promise<any> {
    return this.sdk.sendTransaction(abi, functionName, args);
  }

  async call(abi: any[], functionName: string, args: any[] = []): Promise<any> {
    return this.sdk.call(abi, functionName, args);
  }
}

export { FhevmSDK };
export type { FhevmConfig, EncryptedValue };
