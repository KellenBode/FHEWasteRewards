# SDK Architecture

This document explains the internal architecture of the Universal FHEVM SDK and how different components work together.

## Overview

The FHEVM SDK is designed with a layered architecture that separates framework-agnostic core functionality from framework-specific adapters.

```
┌─────────────────────────────────────────────────┐
│           Framework-Specific Layer              │
│  (React Hooks, Vue Composables, etc.)          │
├─────────────────────────────────────────────────┤
│           Framework Adapters Layer              │
│  (React Context, Vue Plugin, etc.)             │
├─────────────────────────────────────────────────┤
│           Core SDK Layer                        │
│  (FhevmSDK Class - Framework Agnostic)         │
├─────────────────────────────────────────────────┤
│           FHEVM Dependencies Layer              │
│  (fhevmjs, ethers, etc.)                       │
└─────────────────────────────────────────────────┘
```

## Core Components

### 1. FhevmSDK Core Class

**Location**: `packages/fhevm-sdk/src/core/FhevmSDK.ts`

The core class is framework-agnostic and provides all FHEVM functionality:

```typescript
export class FhevmSDK {
  private provider: ethers.providers.Provider;
  private signer: ethers.Signer;
  private fhevmInstance: any;
  private config: FhevmConfig;

  constructor(config: FhevmConfig) {
    this.config = config;
  }

  async init(): Promise<void> {
    // Initialize provider, signer, and FHEVM instance
  }

  async encrypt(value: number, type: string): Promise<EncryptedValue> {
    // Encrypt using FHEVM
  }

  async userDecrypt(encryptedValue: EncryptedValue, contractAddress: string, userAddress: string): Promise<number> {
    // Decrypt with user signature (EIP-712)
  }

  async publicDecrypt(encryptedValue: EncryptedValue): Promise<number> {
    // Decrypt using public oracle
  }
}
```

**Key Features**:
- No framework dependencies
- Can be used in Node.js, React, Vue, vanilla JS
- Handles all FHEVM operations
- Manages provider and signer lifecycle

### 2. React Adapter

**Location**: `packages/fhevm-sdk/src/context/FhevmContext.tsx`

Provides React Context and Provider for SDK state management:

```typescript
const FhevmContext = createContext<FhevmContextType>({
  fhevm: null,
  isReady: false,
  error: null
});

export function FhevmProvider({ config, children }: FhevmProviderProps) {
  const [fhevm, setFhevm] = useState<FhevmSDK | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initSdk = async () => {
      try {
        const sdk = new FhevmSDK(config);
        await sdk.init();
        setFhevm(sdk);
        setIsReady(true);
      } catch (err) {
        setError(err as Error);
      }
    };
    initSdk();
  }, [config]);

  return (
    <FhevmContext.Provider value={{ fhevm, isReady, error }}>
      {children}
    </FhevmContext.Provider>
  );
}
```

**Benefits**:
- Single SDK instance shared across app
- Automatic initialization
- Loading and error states
- React-friendly API

### 3. React Hooks

**Location**: `packages/fhevm-sdk/src/hooks/`

Custom hooks that wrap SDK functionality:

#### useFhevmInit

```typescript
export function useFhevmInit() {
  const context = useContext(FhevmContext);

  return {
    fhevm: context.fhevm,
    isReady: context.isReady,
    error: context.error
  };
}
```

#### useFhevmEncrypt

```typescript
export function useFhevmEncrypt() {
  const { fhevm, isReady } = useFhevmInit();
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const encrypt = useCallback(async (value: number, type: string = 'uint8') => {
    if (!isReady || !fhevm) {
      throw new Error('FHEVM SDK not ready');
    }

    setIsEncrypting(true);
    setError(null);

    try {
      const result = await fhevm.encrypt(value, type);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsEncrypting(false);
    }
  }, [fhevm, isReady]);

  return { encrypt, encryptBatch, isEncrypting, error };
}
```

#### useFhevmDecrypt

```typescript
export function useFhevmDecrypt() {
  const { fhevm, isReady } = useFhevmInit();
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const userDecrypt = useCallback(async (
    encryptedValue: EncryptedValue,
    contractAddress?: string,
    userAddress?: string
  ) => {
    if (!isReady || !fhevm) {
      throw new Error('FHEVM SDK not ready');
    }

    setIsDecrypting(true);
    setError(null);

    try {
      const result = await fhevm.userDecrypt(
        encryptedValue,
        contractAddress,
        userAddress
      );
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsDecrypting(false);
    }
  }, [fhevm, isReady]);

  return { userDecrypt, publicDecrypt, isDecrypting, error };
}
```

**Benefits**:
- Loading states automatically managed
- Error handling built-in
- Type-safe API
- Familiar React patterns

## Data Flow

### Encryption Flow

```
User Input (42)
    ↓
useFhevmEncrypt hook
    ↓
FhevmSDK.encrypt()
    ↓
fhevmjs library
    ↓
Encrypted Value (0x...)
    ↓
Smart Contract
```

### Decryption Flow (User Decrypt)

```
Encrypted Value (0x...)
    ↓
useFhevmDecrypt hook
    ↓
FhevmSDK.userDecrypt()
    ↓
User Signature (EIP-712)
    ↓
FHEVM Gateway
    ↓
Decrypted Value (42)
    ↓
Application
```

### Decryption Flow (Public Decrypt)

```
Encrypted Value (0x...)
    ↓
useFhevmDecrypt hook
    ↓
FhevmSDK.publicDecrypt()
    ↓
FHEVM Gateway (no signature)
    ↓
Decrypted Value (42)
    ↓
Application
```

## Initialization Process

### Step 1: SDK Configuration

```typescript
const config: FhevmConfig = {
  network: 'sepolia',
  contractAddress: '0x...',
  provider: window.ethereum
};
```

### Step 2: Provider Detection

```typescript
// Auto-detect MetaMask or use provided provider
if (config.provider) {
  this.provider = new ethers.providers.Web3Provider(config.provider);
} else if (typeof window !== 'undefined' && window.ethereum) {
  this.provider = new ethers.providers.Web3Provider(window.ethereum);
} else {
  // Fallback to RPC provider
  this.provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
}
```

### Step 3: Signer Setup

```typescript
// Get signer for transactions
this.signer = this.provider.getSigner();
```

### Step 4: FHEVM Instance Creation

```typescript
// Initialize FHEVM instance
this.fhevmInstance = await createInstance({
  chainId: this.config.chainId,
  networkUrl: this.config.rpcUrl,
  gatewayUrl: this.config.gatewayUrl
});
```

### Step 5: Ready State

```typescript
// SDK is now ready to use
this.isInitialized = true;
```

## Type System

### Core Types

```typescript
export interface FhevmConfig {
  network: 'sepolia' | 'custom';
  contractAddress: string;
  provider?: any;
  rpcUrl?: string;
  chainId?: number;
  gatewayUrl?: string;
}

export interface EncryptedValue {
  data: string;
  type: string;
}

export interface EncryptionResult {
  encrypted: EncryptedValue;
  proof?: string;
}

export interface DecryptionResult {
  decrypted: number | boolean | string;
  type: string;
}
```

### React-Specific Types

```typescript
export interface FhevmContextType {
  fhevm: FhevmSDK | null;
  isReady: boolean;
  error: Error | null;
}

export interface FhevmProviderProps {
  config: FhevmConfig;
  children: React.ReactNode;
}

export interface UseEncryptReturn {
  encrypt: (value: number, type?: string) => Promise<EncryptedValue>;
  encryptBatch: (values: BatchEncryptInput[]) => Promise<EncryptedValue[]>;
  isEncrypting: boolean;
  error: Error | null;
}

export interface UseDecryptReturn {
  userDecrypt: (
    encryptedValue: EncryptedValue,
    contractAddress?: string,
    userAddress?: string
  ) => Promise<number>;
  publicDecrypt: (encryptedValue: EncryptedValue) => Promise<number>;
  isDecrypting: boolean;
  error: Error | null;
}
```

## Extension Points

The SDK is designed to be easily extensible:

### 1. Add New Framework Adapter

Create a new adapter for Vue, Angular, etc.:

```typescript
// packages/fhevm-sdk/src/adapters/vue.ts
import { FhevmSDK } from '../core/FhevmSDK';

export function createVuePlugin(config: FhevmConfig) {
  return {
    install(app: any) {
      const fhevm = new FhevmSDK(config);
      app.config.globalProperties.$fhevm = fhevm;
    }
  };
}
```

### 2. Add New Encryption Types

Extend supported encryption types:

```typescript
export class FhevmSDK {
  async encryptCustomType(value: CustomValue): Promise<EncryptedValue> {
    // Custom encryption logic
  }
}
```

### 3. Add Middleware

Add pre/post processing:

```typescript
export class FhevmSDK {
  private middleware: Middleware[] = [];

  use(middleware: Middleware) {
    this.middleware.push(middleware);
  }

  async encrypt(value: number, type: string): Promise<EncryptedValue> {
    // Pre-encryption middleware
    for (const mw of this.middleware) {
      if (mw.beforeEncrypt) {
        await mw.beforeEncrypt(value, type);
      }
    }

    // Encryption
    const result = await this.doEncrypt(value, type);

    // Post-encryption middleware
    for (const mw of this.middleware) {
      if (mw.afterEncrypt) {
        await mw.afterEncrypt(result);
      }
    }

    return result;
  }
}
```

## Performance Considerations

### 1. Single SDK Instance

FhevmProvider ensures only one SDK instance is created per app:

```typescript
// ✅ Good - Single instance
<FhevmProvider config={config}>
  <App />
</FhevmProvider>

// ❌ Bad - Multiple instances
function Component() {
  const fhevm = new FhevmSDK(config); // Creates new instance every render
}
```

### 2. Lazy Initialization

SDK initialization happens asynchronously and only once:

```typescript
useEffect(() => {
  if (!fhevm) {
    initSdk(); // Only runs once
  }
}, [fhevm]);
```

### 3. Batch Operations

Use batch operations for multiple encryptions:

```typescript
// ✅ Good - Batch operation
const encrypted = await encryptBatch([
  { value: 1, type: 'uint8' },
  { value: 2, type: 'uint8' },
  { value: 3, type: 'uint8' }
]);

// ❌ Less efficient - Multiple calls
const enc1 = await encrypt(1);
const enc2 = await encrypt(2);
const enc3 = await encrypt(3);
```

## Security Considerations

### 1. Private Key Protection

Never expose private keys in client code:

```typescript
// ❌ NEVER do this
const fhevm = new FhevmSDK({
  privateKey: 'your-private-key' // NEVER!
});

// ✅ Use MetaMask or other wallet
const fhevm = new FhevmSDK({
  provider: window.ethereum // Safe
});
```

### 2. User Consent for Decryption

Always require user signature for sensitive decryption:

```typescript
// ✅ Requires user signature
const decrypted = await userDecrypt(encrypted);

// ⚠️ No signature required - use carefully
const decrypted = await publicDecrypt(encrypted);
```

### 3. Contract Address Validation

Validate contract addresses before operations:

```typescript
if (!ethers.utils.isAddress(contractAddress)) {
  throw new Error('Invalid contract address');
}
```

## Testing Strategy

### 1. Unit Tests

Test core SDK functionality:

```typescript
describe('FhevmSDK', () => {
  it('should encrypt values correctly', async () => {
    const fhevm = new FhevmSDK(config);
    await fhevm.init();
    const encrypted = await fhevm.encrypt(42, 'uint8');
    expect(encrypted).toHaveProperty('data');
    expect(encrypted.type).toBe('uint8');
  });
});
```

### 2. Integration Tests

Test SDK with React hooks:

```typescript
describe('useFhevmEncrypt', () => {
  it('should encrypt values with hook', async () => {
    const { result } = renderHook(() => useFhevmEncrypt(), {
      wrapper: ({ children }) => (
        <FhevmProvider config={config}>{children}</FhevmProvider>
      )
    });

    await waitFor(() => expect(result.current.encrypt).toBeDefined());

    const encrypted = await result.current.encrypt(42);
    expect(encrypted).toHaveProperty('data');
  });
});
```

### 3. E2E Tests

Test complete user flows:

```typescript
describe('Encryption Flow E2E', () => {
  it('should encrypt, send to contract, and decrypt', async () => {
    // Test complete flow
  });
});
```

## Debugging

Enable debug logging:

```typescript
const fhevm = new FhevmSDK({
  ...config,
  debug: true
});

// Logs all operations
await fhevm.encrypt(42); // Logs: "Encrypting value 42 as uint8..."
```

---

This architecture enables building on any framework while maintaining consistency and type safety. 🏗️
