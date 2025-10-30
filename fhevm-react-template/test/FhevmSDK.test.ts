import { FhevmSDK } from '../packages/fhevm-sdk/src/core/FhevmSDK';
import { FhevmConfig } from '../packages/fhevm-sdk/src/types';

describe('FhevmSDK Core', () => {
  let fhevm: FhevmSDK;
  let config: FhevmConfig;

  beforeEach(() => {
    config = {
      network: 'sepolia',
      contractAddress: '0x8EAB26B5C6E8Efe05D30b479C483802D2Ab15c14'
    };
  });

  describe('Constructor', () => {
    it('should create SDK instance with valid config', () => {
      fhevm = new FhevmSDK(config);
      expect(fhevm).toBeInstanceOf(FhevmSDK);
    });

    it('should throw error with invalid config', () => {
      expect(() => new FhevmSDK({} as FhevmConfig)).toThrow();
    });

    it('should accept custom network configuration', () => {
      const customConfig: FhevmConfig = {
        network: 'custom',
        contractAddress: '0x123...',
        rpcUrl: 'https://custom-rpc.com',
        chainId: 12345,
        gatewayUrl: 'https://custom-gateway.com'
      };

      fhevm = new FhevmSDK(customConfig);
      expect(fhevm).toBeInstanceOf(FhevmSDK);
    });
  });

  describe('Initialization', () => {
    beforeEach(() => {
      fhevm = new FhevmSDK(config);
    });

    it('should initialize successfully', async () => {
      await expect(fhevm.init()).resolves.not.toThrow();
    });

    it('should set isReady to true after init', async () => {
      await fhevm.init();
      expect(fhevm.isReady()).toBe(true);
    });

    it('should handle initialization errors gracefully', async () => {
      const invalidConfig: FhevmConfig = {
        network: 'custom',
        contractAddress: '0xinvalid',
        rpcUrl: 'invalid-url'
      };

      const invalidFhevm = new FhevmSDK(invalidConfig);
      await expect(invalidFhevm.init()).rejects.toThrow();
    });
  });

  describe('Encryption', () => {
    beforeEach(async () => {
      fhevm = new FhevmSDK(config);
      await fhevm.init();
    });

    it('should encrypt uint8 values', async () => {
      const encrypted = await fhevm.encrypt(42, 'uint8');

      expect(encrypted).toHaveProperty('data');
      expect(encrypted).toHaveProperty('type');
      expect(encrypted.type).toBe('uint8');
      expect(typeof encrypted.data).toBe('string');
      expect(encrypted.data).toMatch(/^0x[0-9a-fA-F]+$/);
    });

    it('should encrypt different types correctly', async () => {
      const types = ['uint8', 'uint16', 'uint32', 'uint64'];

      for (const type of types) {
        const encrypted = await fhevm.encrypt(100, type);
        expect(encrypted.type).toBe(type);
        expect(encrypted.data).toMatch(/^0x[0-9a-fA-F]+$/);
      }
    });

    it('should encrypt boolean values', async () => {
      const encrypted = await fhevm.encrypt(1, 'bool');

      expect(encrypted.type).toBe('bool');
      expect(encrypted.data).toMatch(/^0x[0-9a-fA-F]+$/);
    });

    it('should throw error when encrypting without initialization', async () => {
      const uninitFhevm = new FhevmSDK(config);
      await expect(uninitFhevm.encrypt(42)).rejects.toThrow('not initialized');
    });

    it('should throw error for invalid value type', async () => {
      await expect(fhevm.encrypt(256, 'uint8')).rejects.toThrow();
    });

    it('should throw error for unsupported encryption type', async () => {
      await expect(fhevm.encrypt(42, 'invalidType')).rejects.toThrow();
    });

    it('should handle negative values for signed types', async () => {
      const encrypted = await fhevm.encrypt(-42, 'int8');
      expect(encrypted.type).toBe('int8');
      expect(encrypted.data).toMatch(/^0x[0-9a-fA-F]+$/);
    });
  });

  describe('Batch Encryption', () => {
    beforeEach(async () => {
      fhevm = new FhevmSDK(config);
      await fhevm.init();
    });

    it('should encrypt multiple values in batch', async () => {
      const inputs = [
        { value: 42, type: 'uint8' },
        { value: 100, type: 'uint16' },
        { value: 1, type: 'bool' }
      ];

      const encrypted = await fhevm.encryptBatch(inputs);

      expect(encrypted).toHaveLength(3);
      expect(encrypted[0].type).toBe('uint8');
      expect(encrypted[1].type).toBe('uint16');
      expect(encrypted[2].type).toBe('bool');
    });

    it('should handle empty batch', async () => {
      const encrypted = await fhevm.encryptBatch([]);
      expect(encrypted).toHaveLength(0);
    });

    it('should throw error if any value in batch is invalid', async () => {
      const inputs = [
        { value: 42, type: 'uint8' },
        { value: 256, type: 'uint8' }, // Invalid
        { value: 100, type: 'uint16' }
      ];

      await expect(fhevm.encryptBatch(inputs)).rejects.toThrow();
    });
  });

  describe('Decryption', () => {
    let encrypted: any;

    beforeEach(async () => {
      fhevm = new FhevmSDK(config);
      await fhevm.init();
      encrypted = await fhevm.encrypt(42, 'uint8');
    });

    it('should decrypt with user signature (userDecrypt)', async () => {
      const userAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      const decrypted = await fhevm.userDecrypt(
        encrypted,
        config.contractAddress,
        userAddress
      );

      expect(decrypted).toBe(42);
    });

    it('should decrypt without signature (publicDecrypt)', async () => {
      const decrypted = await fhevm.publicDecrypt(encrypted);
      expect(decrypted).toBe(42);
    });

    it('should throw error when decrypting without initialization', async () => {
      const uninitFhevm = new FhevmSDK(config);
      await expect(uninitFhevm.publicDecrypt(encrypted)).rejects.toThrow('not initialized');
    });

    it('should handle decryption of different types', async () => {
      const types = ['uint8', 'uint16', 'uint32'];
      const value = 100;

      for (const type of types) {
        const enc = await fhevm.encrypt(value, type);
        const dec = await fhevm.publicDecrypt(enc);
        expect(dec).toBe(value);
      }
    });

    it('should handle boolean decryption', async () => {
      const enc = await fhevm.encrypt(1, 'bool');
      const dec = await fhevm.publicDecrypt(enc);
      expect(dec).toBe(1);
    });

    it('should throw error for invalid encrypted value', async () => {
      const invalid = { data: '0xinvalid', type: 'uint8' };
      await expect(fhevm.publicDecrypt(invalid)).rejects.toThrow();
    });
  });

  describe('Contract Interaction', () => {
    beforeEach(async () => {
      fhevm = new FhevmSDK(config);
      await fhevm.init();
    });

    it('should send transaction to contract', async () => {
      const txParams = {
        to: config.contractAddress,
        data: '0x123456', // Mock transaction data
        value: 0
      };

      const receipt = await fhevm.sendTransaction(txParams);
      expect(receipt).toHaveProperty('transactionHash');
      expect(receipt).toHaveProperty('blockNumber');
    });

    it('should make read-only call to contract', async () => {
      const callParams = {
        to: config.contractAddress,
        data: '0x123456' // Mock call data
      };

      const result = await fhevm.call(callParams);
      expect(result).toBeDefined();
    });

    it('should throw error for invalid contract address', async () => {
      const txParams = {
        to: '0xinvalid',
        data: '0x123456',
        value: 0
      };

      await expect(fhevm.sendTransaction(txParams)).rejects.toThrow();
    });
  });

  describe('Provider Management', () => {
    it('should use provided Web3 provider', async () => {
      const mockProvider = {
        request: jest.fn(),
        on: jest.fn(),
        removeListener: jest.fn()
      };

      const customConfig: FhevmConfig = {
        ...config,
        provider: mockProvider
      };

      fhevm = new FhevmSDK(customConfig);
      await fhevm.init();

      expect(fhevm.isReady()).toBe(true);
    });

    it('should auto-detect MetaMask if available', async () => {
      // Mock window.ethereum
      (global as any).window = {
        ethereum: {
          request: jest.fn(),
          on: jest.fn(),
          removeListener: jest.fn()
        }
      };

      fhevm = new FhevmSDK(config);
      await fhevm.init();

      expect(fhevm.isReady()).toBe(true);
    });

    it('should fallback to RPC provider if no Web3 provider', async () => {
      delete (global as any).window;

      const customConfig: FhevmConfig = {
        ...config,
        rpcUrl: 'https://sepolia.infura.io/v3/test'
      };

      fhevm = new FhevmSDK(customConfig);
      await fhevm.init();

      expect(fhevm.isReady()).toBe(true);
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      fhevm = new FhevmSDK(config);
      await fhevm.init();
    });

    it('should provide meaningful error messages', async () => {
      try {
        await fhevm.encrypt(256, 'uint8');
      } catch (error: any) {
        expect(error.message).toContain('value');
        expect(error.message).toContain('range');
      }
    });

    it('should handle network errors gracefully', async () => {
      const badConfig: FhevmConfig = {
        network: 'custom',
        contractAddress: '0x123...',
        rpcUrl: 'https://nonexistent-network.com'
      };

      const badFhevm = new FhevmSDK(badConfig);
      await expect(badFhevm.init()).rejects.toThrow();
    });
  });

  describe('Type Validation', () => {
    beforeEach(async () => {
      fhevm = new FhevmSDK(config);
      await fhevm.init();
    });

    it('should validate uint8 range (0-255)', async () => {
      await expect(fhevm.encrypt(0, 'uint8')).resolves.toBeDefined();
      await expect(fhevm.encrypt(255, 'uint8')).resolves.toBeDefined();
      await expect(fhevm.encrypt(256, 'uint8')).rejects.toThrow();
      await expect(fhevm.encrypt(-1, 'uint8')).rejects.toThrow();
    });

    it('should validate int8 range (-128 to 127)', async () => {
      await expect(fhevm.encrypt(-128, 'int8')).resolves.toBeDefined();
      await expect(fhevm.encrypt(127, 'int8')).resolves.toBeDefined();
      await expect(fhevm.encrypt(128, 'int8')).rejects.toThrow();
      await expect(fhevm.encrypt(-129, 'int8')).rejects.toThrow();
    });

    it('should validate boolean values', async () => {
      await expect(fhevm.encrypt(0, 'bool')).resolves.toBeDefined();
      await expect(fhevm.encrypt(1, 'bool')).resolves.toBeDefined();
      await expect(fhevm.encrypt(2, 'bool')).rejects.toThrow();
    });
  });

  describe('Debug Mode', () => {
    it('should enable debug logging when debug flag is set', async () => {
      const debugConfig: FhevmConfig = {
        ...config,
        debug: true
      };

      const consoleSpy = jest.spyOn(console, 'log');
      fhevm = new FhevmSDK(debugConfig);
      await fhevm.init();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should not log when debug flag is false', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      fhevm = new FhevmSDK(config);
      await fhevm.init();

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
