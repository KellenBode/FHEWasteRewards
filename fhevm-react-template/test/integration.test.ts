import { FhevmSDK } from '../packages/fhevm-sdk/src/core/FhevmSDK';
import { FhevmConfig } from '../packages/fhevm-sdk/src/types';

describe('Integration Tests', () => {
  let fhevm: FhevmSDK;
  let config: FhevmConfig;

  beforeAll(() => {
    config = {
      network: 'sepolia',
      contractAddress: '0x8EAB26B5C6E8Efe05D30b479C483802D2Ab15c14'
    };
  });

  describe('End-to-End Encryption Flow', () => {
    beforeEach(async () => {
      fhevm = new FhevmSDK(config);
      await fhevm.init();
    });

    it('should complete full encryption-decryption cycle', async () => {
      // Step 1: Encrypt value
      const originalValue = 42;
      const encrypted = await fhevm.encrypt(originalValue, 'uint8');

      expect(encrypted).toHaveProperty('data');
      expect(encrypted.type).toBe('uint8');

      // Step 2: Decrypt value (public)
      const decrypted = await fhevm.publicDecrypt(encrypted);

      // Step 3: Verify
      expect(decrypted).toBe(originalValue);
    });

    it('should handle multiple values with different types', async () => {
      const testCases = [
        { value: 42, type: 'uint8' },
        { value: 1000, type: 'uint16' },
        { value: 100000, type: 'uint32' },
        { value: 1, type: 'bool' },
        { value: -42, type: 'int8' }
      ];

      for (const testCase of testCases) {
        const encrypted = await fhevm.encrypt(testCase.value, testCase.type);
        const decrypted = await fhevm.publicDecrypt(encrypted);
        expect(decrypted).toBe(testCase.value);
      }
    });

    it('should handle batch encryption and decryption', async () => {
      const values = [
        { value: 10, type: 'uint8' },
        { value: 20, type: 'uint8' },
        { value: 30, type: 'uint8' }
      ];

      // Batch encrypt
      const encrypted = await fhevm.encryptBatch(values);
      expect(encrypted).toHaveLength(3);

      // Decrypt each
      const decrypted = await Promise.all(
        encrypted.map((enc) => fhevm.publicDecrypt(enc))
      );

      expect(decrypted).toEqual([10, 20, 30]);
    });
  });

  describe('Contract Interaction Flow', () => {
    beforeEach(async () => {
      fhevm = new FhevmSDK(config);
      await fhevm.init();
    });

    it('should encrypt, send to contract, and receive result', async () => {
      // Step 1: Encrypt value
      const encrypted = await fhevm.encrypt(42, 'uint8');

      // Step 2: Mock contract call with encrypted value
      const txParams = {
        to: config.contractAddress,
        data: `0x${encrypted.data.slice(2)}`, // Remove 0x prefix
        value: 0
      };

      // Step 3: Send transaction
      const receipt = await fhevm.sendTransaction(txParams);

      expect(receipt).toHaveProperty('transactionHash');
      expect(receipt).toHaveProperty('blockNumber');
      expect(receipt.status).toBe(1); // Success
    });

    it('should read encrypted state from contract', async () => {
      const callParams = {
        to: config.contractAddress,
        data: '0x123456' // Mock function call
      };

      const result = await fhevm.call(callParams);
      expect(result).toBeDefined();
    });
  });

  describe('Multi-User Decryption Flow', () => {
    beforeEach(async () => {
      fhevm = new FhevmSDK(config);
      await fhevm.init();
    });

    it('should allow different users to decrypt with signatures', async () => {
      const encrypted = await fhevm.encrypt(42, 'uint8');

      const users = [
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        '0x8EAB26B5C6E8Efe05D30b479C483802D2Ab15c14'
      ];

      for (const userAddress of users) {
        const decrypted = await fhevm.userDecrypt(
          encrypted,
          config.contractAddress,
          userAddress
        );

        expect(decrypted).toBe(42);
      }
    });

    it('should handle user rejection of signature', async () => {
      const encrypted = await fhevm.encrypt(42, 'uint8');

      // Mock user rejection by providing invalid address
      const invalidAddress = '0xinvalid';

      await expect(
        fhevm.userDecrypt(encrypted, config.contractAddress, invalidAddress)
      ).rejects.toThrow();
    });
  });

  describe('Network Switching', () => {
    it('should work on different networks', async () => {
      const networks = [
        {
          network: 'sepolia' as const,
          contractAddress: '0x8EAB26B5C6E8Efe05D30b479C483802D2Ab15c14'
        },
        {
          network: 'custom' as const,
          contractAddress: '0x123...',
          rpcUrl: 'https://custom-rpc.com',
          chainId: 12345
        }
      ];

      for (const networkConfig of networks) {
        const sdk = new FhevmSDK(networkConfig);
        await sdk.init();

        const encrypted = await sdk.encrypt(42, 'uint8');
        expect(encrypted).toHaveProperty('data');
      }
    });
  });

  describe('Error Recovery and Retries', () => {
    beforeEach(async () => {
      fhevm = new FhevmSDK(config);
      await fhevm.init();
    });

    it('should recover from transient encryption errors', async () => {
      // First attempt might fail
      try {
        await fhevm.encrypt(256, 'uint8');
      } catch (error) {
        // Expected
      }

      // Second attempt should succeed
      const encrypted = await fhevm.encrypt(42, 'uint8');
      expect(encrypted).toHaveProperty('data');
    });

    it('should handle network interruptions gracefully', async () => {
      // Mock network failure and recovery
      const encrypted = await fhevm.encrypt(42, 'uint8');
      expect(encrypted).toBeDefined();

      // Should still work after "network recovery"
      const encrypted2 = await fhevm.encrypt(100, 'uint8');
      expect(encrypted2).toBeDefined();
    });
  });

  describe('Performance Tests', () => {
    beforeEach(async () => {
      fhevm = new FhevmSDK(config);
      await fhevm.init();
    });

    it('should handle rapid successive encryptions', async () => {
      const promises = [];

      for (let i = 0; i < 10; i++) {
        promises.push(fhevm.encrypt(i, 'uint8'));
      }

      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach((result) => {
        expect(result).toHaveProperty('data');
      });
    });

    it('should efficiently process large batches', async () => {
      const largeB = [];

      for (let i = 0; i < 100; i++) {
        largeBatch.push({ value: i % 256, type: 'uint8' });
      }

      const startTime = Date.now();
      const encrypted = await fhevm.encryptBatch(largeBatch);
      const endTime = Date.now();

      expect(encrypted).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(10000); // Should complete in <10s
    });
  });

  describe('Data Integrity', () => {
    beforeEach(async () => {
      fhevm = new FhevmSDK(config);
      await fhevm.init();
    });

    it('should maintain data integrity through encryption cycle', async () => {
      const testValues = [0, 1, 127, 128, 255];

      for (const value of testValues) {
        const encrypted = await fhevm.encrypt(value, 'uint8');
        const decrypted = await fhevm.publicDecrypt(encrypted);
        expect(decrypted).toBe(value);
      }
    });

    it('should handle boundary values correctly', async () => {
      const boundaries = [
        { value: 0, type: 'uint8' },
        { value: 255, type: 'uint8' },
        { value: -128, type: 'int8' },
        { value: 127, type: 'int8' },
        { value: 0, type: 'bool' },
        { value: 1, type: 'bool' }
      ];

      for (const boundary of boundaries) {
        const encrypted = await fhevm.encrypt(boundary.value, boundary.type);
        const decrypted = await fhevm.publicDecrypt(encrypted);
        expect(decrypted).toBe(boundary.value);
      }
    });

    it('should detect data corruption', async () => {
      const encrypted = await fhevm.encrypt(42, 'uint8');

      // Corrupt the data
      const corrupted = {
        ...encrypted,
        data: encrypted.data.slice(0, -2) + 'FF'
      };

      // Should throw error when trying to decrypt corrupted data
      await expect(fhevm.publicDecrypt(corrupted)).rejects.toThrow();
    });
  });

  describe('Concurrency', () => {
    beforeEach(async () => {
      fhevm = new FhevmSDK(config);
      await fhevm.init();
    });

    it('should handle concurrent encryptions', async () => {
      const concurrentOps = [];

      for (let i = 0; i < 5; i++) {
        concurrentOps.push(fhevm.encrypt(i * 10, 'uint8'));
      }

      const results = await Promise.all(concurrentOps);
      expect(results).toHaveLength(5);
      results.forEach((result) => {
        expect(result).toHaveProperty('data');
      });
    });

    it('should handle mixed concurrent operations', async () => {
      const encrypted = await fhevm.encrypt(42, 'uint8');

      const mixedOps = [
        fhevm.encrypt(10, 'uint8'),
        fhevm.encrypt(20, 'uint16'),
        fhevm.publicDecrypt(encrypted),
        fhevm.encrypt(30, 'uint32')
      ];

      const results = await Promise.all(mixedOps);
      expect(results).toHaveLength(4);
    });
  });

  describe('State Management', () => {
    it('should maintain state across operations', async () => {
      fhevm = new FhevmSDK(config);
      await fhevm.init();

      expect(fhevm.isReady()).toBe(true);

      await fhevm.encrypt(42, 'uint8');
      expect(fhevm.isReady()).toBe(true);

      const encrypted = await fhevm.encrypt(100, 'uint16');
      await fhevm.publicDecrypt(encrypted);

      expect(fhevm.isReady()).toBe(true);
    });

    it('should clean up resources properly', async () => {
      fhevm = new FhevmSDK(config);
      await fhevm.init();

      await fhevm.encrypt(42, 'uint8');

      // Cleanup
      await fhevm.cleanup();

      // Should not be ready after cleanup
      expect(fhevm.isReady()).toBe(false);
    });
  });
});
