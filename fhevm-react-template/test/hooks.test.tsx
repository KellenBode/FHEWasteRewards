import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import { FhevmProvider } from '../packages/fhevm-sdk/src/context/FhevmContext';
import { useFhevmInit } from '../packages/fhevm-sdk/src/hooks/useFhevmInit';
import { useFhevmEncrypt } from '../packages/fhevm-sdk/src/hooks/useFhevmEncrypt';
import { useFhevmDecrypt } from '../packages/fhevm-sdk/src/hooks/useFhevmDecrypt';
import { FhevmConfig } from '../packages/fhevm-sdk/src/types';

const mockConfig: FhevmConfig = {
  network: 'sepolia',
  contractAddress: '0x8EAB26B5C6E8Efe05D30b479C483802D2Ab15c14'
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <FhevmProvider config={mockConfig}>{children}</FhevmProvider>
);

describe('React Hooks', () => {
  describe('useFhevmInit', () => {
    it('should return SDK instance when initialized', async () => {
      const { result } = renderHook(() => useFhevmInit(), { wrapper });

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      expect(result.current.fhevm).toBeDefined();
      expect(result.current.error).toBeNull();
    });

    it('should start with isReady false', () => {
      const { result } = renderHook(() => useFhevmInit(), { wrapper });
      expect(result.current.isReady).toBe(false);
    });

    it('should handle initialization errors', async () => {
      const badConfig: FhevmConfig = {
        network: 'custom',
        contractAddress: '0xinvalid',
        rpcUrl: 'invalid-url'
      };

      const errorWrapper = ({ children }: { children: React.ReactNode }) => (
        <FhevmProvider config={badConfig}>{children}</FhevmProvider>
      );

      const { result } = renderHook(() => useFhevmInit(), { wrapper: errorWrapper });

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });

      expect(result.current.isReady).toBe(false);
      expect(result.current.fhevm).toBeNull();
    });
  });

  describe('useFhevmEncrypt', () => {
    it('should encrypt values successfully', async () => {
      const { result } = renderHook(() => useFhevmEncrypt(), { wrapper });

      await waitFor(() => {
        expect(result.current.encrypt).toBeDefined();
      });

      let encrypted: any;

      await act(async () => {
        encrypted = await result.current.encrypt(42, 'uint8');
      });

      expect(encrypted).toHaveProperty('data');
      expect(encrypted).toHaveProperty('type');
      expect(encrypted.type).toBe('uint8');
    });

    it('should set isEncrypting to true during encryption', async () => {
      const { result } = renderHook(() => useFhevmEncrypt(), { wrapper });

      await waitFor(() => {
        expect(result.current.encrypt).toBeDefined();
      });

      act(() => {
        result.current.encrypt(42, 'uint8');
      });

      expect(result.current.isEncrypting).toBe(true);

      await waitFor(() => {
        expect(result.current.isEncrypting).toBe(false);
      });
    });

    it('should handle encryption errors', async () => {
      const { result } = renderHook(() => useFhevmEncrypt(), { wrapper });

      await waitFor(() => {
        expect(result.current.encrypt).toBeDefined();
      });

      await act(async () => {
        try {
          await result.current.encrypt(256, 'uint8'); // Invalid value
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.isEncrypting).toBe(false);
    });

    it('should encrypt batch of values', async () => {
      const { result } = renderHook(() => useFhevmEncrypt(), { wrapper });

      await waitFor(() => {
        expect(result.current.encryptBatch).toBeDefined();
      });

      let encrypted: any;

      await act(async () => {
        encrypted = await result.current.encryptBatch([
          { value: 42, type: 'uint8' },
          { value: 100, type: 'uint16' },
          { value: 1, type: 'bool' }
        ]);
      });

      expect(encrypted).toHaveLength(3);
      expect(encrypted[0].type).toBe('uint8');
      expect(encrypted[1].type).toBe('uint16');
      expect(encrypted[2].type).toBe('bool');
    });

    it('should throw error when encrypting before initialization', async () => {
      const { result } = renderHook(() => useFhevmEncrypt(), { wrapper });

      // Try to encrypt before SDK is ready
      await act(async () => {
        try {
          await result.current.encrypt(42);
        } catch (error: any) {
          expect(error.message).toContain('not ready');
        }
      });
    });
  });

  describe('useFhevmDecrypt', () => {
    let encryptedValue: any;

    beforeEach(async () => {
      const { result: encryptResult } = renderHook(() => useFhevmEncrypt(), { wrapper });

      await waitFor(() => {
        expect(encryptResult.current.encrypt).toBeDefined();
      });

      await act(async () => {
        encryptedValue = await encryptResult.current.encrypt(42, 'uint8');
      });
    });

    it('should decrypt with user signature', async () => {
      const { result } = renderHook(() => useFhevmDecrypt(), { wrapper });

      await waitFor(() => {
        expect(result.current.userDecrypt).toBeDefined();
      });

      let decrypted: any;

      await act(async () => {
        decrypted = await result.current.userDecrypt(
          encryptedValue,
          mockConfig.contractAddress,
          '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
        );
      });

      expect(decrypted).toBe(42);
    });

    it('should decrypt without signature (public)', async () => {
      const { result } = renderHook(() => useFhevmDecrypt(), { wrapper });

      await waitFor(() => {
        expect(result.current.publicDecrypt).toBeDefined();
      });

      let decrypted: any;

      await act(async () => {
        decrypted = await result.current.publicDecrypt(encryptedValue);
      });

      expect(decrypted).toBe(42);
    });

    it('should set isDecrypting to true during decryption', async () => {
      const { result } = renderHook(() => useFhevmDecrypt(), { wrapper });

      await waitFor(() => {
        expect(result.current.publicDecrypt).toBeDefined();
      });

      act(() => {
        result.current.publicDecrypt(encryptedValue);
      });

      expect(result.current.isDecrypting).toBe(true);

      await waitFor(() => {
        expect(result.current.isDecrypting).toBe(false);
      });
    });

    it('should handle decryption errors', async () => {
      const { result } = renderHook(() => useFhevmDecrypt(), { wrapper });

      await waitFor(() => {
        expect(result.current.publicDecrypt).toBeDefined();
      });

      const invalidValue = { data: '0xinvalid', type: 'uint8' };

      await act(async () => {
        try {
          await result.current.publicDecrypt(invalidValue);
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.isDecrypting).toBe(false);
    });
  });

  describe('Hook Integration', () => {
    it('should work together for complete flow', async () => {
      const { result: encryptResult } = renderHook(() => useFhevmEncrypt(), { wrapper });
      const { result: decryptResult } = renderHook(() => useFhevmDecrypt(), { wrapper });

      await waitFor(() => {
        expect(encryptResult.current.encrypt).toBeDefined();
        expect(decryptResult.current.publicDecrypt).toBeDefined();
      });

      // Encrypt
      let encrypted: any;
      await act(async () => {
        encrypted = await encryptResult.current.encrypt(42, 'uint8');
      });

      expect(encrypted).toBeDefined();

      // Decrypt
      let decrypted: any;
      await act(async () => {
        decrypted = await decryptResult.current.publicDecrypt(encrypted);
      });

      expect(decrypted).toBe(42);
    });

    it('should handle multiple encryptions in sequence', async () => {
      const { result } = renderHook(() => useFhevmEncrypt(), { wrapper });

      await waitFor(() => {
        expect(result.current.encrypt).toBeDefined();
      });

      const values = [10, 20, 30];
      const encrypted = [];

      for (const value of values) {
        await act(async () => {
          const enc = await result.current.encrypt(value, 'uint8');
          encrypted.push(enc);
        });
      }

      expect(encrypted).toHaveLength(3);
      encrypted.forEach((enc) => {
        expect(enc).toHaveProperty('data');
        expect(enc.type).toBe('uint8');
      });
    });
  });

  describe('Error Recovery', () => {
    it('should recover from encryption error', async () => {
      const { result } = renderHook(() => useFhevmEncrypt(), { wrapper });

      await waitFor(() => {
        expect(result.current.encrypt).toBeDefined();
      });

      // Cause error
      await act(async () => {
        try {
          await result.current.encrypt(256, 'uint8');
        } catch (error) {
          // Expected
        }
      });

      expect(result.current.error).toBeDefined();

      // Should be able to encrypt again
      let encrypted: any;
      await act(async () => {
        encrypted = await result.current.encrypt(42, 'uint8');
      });

      expect(encrypted).toBeDefined();
      expect(result.current.isEncrypting).toBe(false);
    });
  });

  describe('Provider Context', () => {
    it('should throw error when hooks used outside provider', () => {
      expect(() => {
        renderHook(() => useFhevmInit());
      }).toThrow();
    });

    it('should share SDK instance across multiple hooks', async () => {
      const { result: initResult } = renderHook(() => useFhevmInit(), { wrapper });
      const { result: encryptResult } = renderHook(() => useFhevmEncrypt(), { wrapper });

      await waitFor(() => {
        expect(initResult.current.isReady).toBe(true);
      });

      expect(initResult.current.fhevm).toBe(encryptResult.current.fhevm);
    });
  });
});
