/**
 * Client-side FHE Operations
 * Handles encryption and decryption on the client
 */

export interface EncryptedData {
  ciphertext: string;
  type: string;
  timestamp: number;
  isEncrypted: boolean;
}

export class FHEClient {
  private publicKey: string | null = null;

  async initialize(): Promise<void> {
    try {
      const response = await fetch('/api/keys');
      const data = await response.json();
      this.publicKey = data.publicKey.key;
    } catch (error) {
      console.error('Failed to initialize FHE client:', error);
      throw error;
    }
  }

  async encrypt(value: number, type: string = 'uint8'): Promise<EncryptedData | null> {
    try {
      const response = await fetch('/api/fhe/encrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value, type }),
      });

      if (!response.ok) {
        throw new Error('Encryption failed');
      }

      const data = await response.json();
      return data.encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      return null;
    }
  }

  async decrypt(encryptedData: EncryptedData, userAddress?: string): Promise<number | null> {
    try {
      const response = await fetch('/api/fhe/decrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encryptedData, userAddress }),
      });

      if (!response.ok) {
        throw new Error('Decryption failed');
      }

      const data = await response.json();
      return data.decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  }

  async compute(
    operation: 'add' | 'subtract' | 'multiply' | 'compare',
    operands: EncryptedData[]
  ): Promise<EncryptedData | null> {
    try {
      const response = await fetch('/api/fhe/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation, operands }),
      });

      if (!response.ok) {
        throw new Error('Computation failed');
      }

      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Computation error:', error);
      return null;
    }
  }

  isReady(): boolean {
    return this.publicKey !== null;
  }

  getPublicKey(): string | null {
    return this.publicKey;
  }
}

export const fheClient = new FHEClient();
