# React Integration Guide

Complete guide for integrating the FHEVM SDK with React applications.

## Quick Start

### Installation

```bash
npm install @fhevm/sdk ethers
```

### Basic Setup

```typescript
import { FhevmProvider } from '@fhevm/sdk';

function App() {
  return (
    <FhevmProvider
      config={{
        network: 'sepolia',
        contractAddress: '0x8EAB26B5C6E8Efe05D30b479C483802D2Ab15c14'
      }}
    >
      <YourApp />
    </FhevmProvider>
  );
}
```

## FhevmProvider

The `FhevmProvider` component initializes the SDK and makes it available to all child components.

### Basic Usage

```typescript
import { FhevmProvider } from '@fhevm/sdk';

function App() {
  const config = {
    network: 'sepolia',
    contractAddress: '0x8EAB26B5C6E8Efe05D30b479C483802D2Ab15c14',
    provider: window.ethereum // Optional - auto-detected if not provided
  };

  return (
    <FhevmProvider config={config}>
      <MyComponent />
    </FhevmProvider>
  );
}
```

### Configuration Options

```typescript
interface FhevmConfig {
  network: 'sepolia' | 'custom';
  contractAddress: string;
  provider?: any; // Web3 provider (optional)
  rpcUrl?: string; // Custom RPC URL (optional)
  chainId?: number; // Custom chain ID (optional)
  gatewayUrl?: string; // FHEVM gateway URL (optional)
  debug?: boolean; // Enable debug logging (optional)
}
```

### With Environment Variables

```typescript
// .env
REACT_APP_NETWORK=sepolia
REACT_APP_CONTRACT_ADDRESS=0x8EAB26B5C6E8Efe05D30b479C483802D2Ab15c14

// App.tsx
function App() {
  return (
    <FhevmProvider
      config={{
        network: process.env.REACT_APP_NETWORK,
        contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS
      }}
    >
      <MyApp />
    </FhevmProvider>
  );
}
```

## React Hooks

### useFhevmInit

Access the initialized SDK instance.

```typescript
import { useFhevmInit } from '@fhevm/sdk';

function MyComponent() {
  const { fhevm, isReady, error } = useFhevmInit();

  if (!isReady) {
    return <div>Loading SDK...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return <div>SDK ready!</div>;
}
```

**Returns**:
- `fhevm`: FhevmSDK instance or null
- `isReady`: boolean indicating initialization status
- `error`: Error object or null

### useFhevmEncrypt

Encrypt values with loading states.

```typescript
import { useFhevmEncrypt } from '@fhevm/sdk';

function EncryptComponent() {
  const { encrypt, encryptBatch, isEncrypting, error } = useFhevmEncrypt();
  const [result, setResult] = useState(null);

  const handleEncrypt = async () => {
    try {
      const encrypted = await encrypt(42, 'uint8');
      setResult(encrypted);
    } catch (err) {
      console.error('Encryption failed:', err);
    }
  };

  return (
    <div>
      <button onClick={handleEncrypt} disabled={isEncrypting}>
        {isEncrypting ? 'Encrypting...' : 'Encrypt Value'}
      </button>
      {error && <p>Error: {error.message}</p>}
      {result && <p>Encrypted: {result.data}</p>}
    </div>
  );
}
```

**Returns**:
- `encrypt(value, type)`: Encrypt single value
- `encryptBatch(inputs)`: Encrypt multiple values
- `isEncrypting`: boolean indicating encryption in progress
- `error`: Error object or null

### useFhevmDecrypt

Decrypt values with loading states.

```typescript
import { useFhevmDecrypt } from '@fhevm/sdk';
import { useAccount } from 'wagmi';

function DecryptComponent({ encrypted }) {
  const { account } = useAccount();
  const { userDecrypt, publicDecrypt, isDecrypting, error } = useFhevmDecrypt();
  const [decrypted, setDecrypted] = useState(null);

  const handleUserDecrypt = async () => {
    const result = await userDecrypt(
      encrypted,
      '0x8EAB26B5C6E8Efe05D30b479C483802D2Ab15c14',
      account
    );
    setDecrypted(result);
  };

  const handlePublicDecrypt = async () => {
    const result = await publicDecrypt(encrypted);
    setDecrypted(result);
  };

  return (
    <div>
      <button onClick={handleUserDecrypt} disabled={isDecrypting}>
        Decrypt (with signature)
      </button>
      <button onClick={handlePublicDecrypt} disabled={isDecrypting}>
        Decrypt (public)
      </button>
      {decrypted !== null && <p>Value: {decrypted}</p>}
    </div>
  );
}
```

**Returns**:
- `userDecrypt(encrypted, contractAddress, userAddress)`: Decrypt with signature
- `publicDecrypt(encrypted)`: Decrypt without signature
- `isDecrypting`: boolean indicating decryption in progress
- `error`: Error object or null

## Complete Example

### Encrypted Counter

```typescript
import React, { useState } from 'react';
import {
  FhevmProvider,
  useFhevmEncrypt,
  useFhevmDecrypt,
  useFhevmInit
} from '@fhevm/sdk';
import { useAccount } from 'wagmi';

function EncryptedCounter() {
  const [value, setValue] = useState('');
  const [encrypted, setEncrypted] = useState(null);
  const [decrypted, setDecrypted] = useState(null);

  const { isReady } = useFhevmInit();
  const { encrypt, isEncrypting } = useFhevmEncrypt();
  const { userDecrypt, isDecrypting } = useFhevmDecrypt();
  const { account } = useAccount();

  const handleEncrypt = async () => {
    if (!value) return;

    const result = await encrypt(parseInt(value), 'uint8');
    setEncrypted(result);
    setDecrypted(null);
  };

  const handleDecrypt = async () => {
    if (!encrypted) return;

    const result = await userDecrypt(
      encrypted,
      '0x8EAB26B5C6E8Efe05D30b479C483802D2Ab15c14',
      account
    );
    setDecrypted(result);
  };

  if (!isReady) {
    return <div>Initializing FHEVM SDK...</div>;
  }

  return (
    <div className="encrypted-counter">
      <h2>Encrypted Counter</h2>

      <div>
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter value (0-255)"
          min="0"
          max="255"
        />
        <button onClick={handleEncrypt} disabled={isEncrypting || !value}>
          {isEncrypting ? 'Encrypting...' : 'Encrypt'}
        </button>
      </div>

      {encrypted && (
        <div>
          <p>Encrypted Data: {encrypted.data.slice(0, 20)}...</p>
          <button onClick={handleDecrypt} disabled={isDecrypting}>
            {isDecrypting ? 'Decrypting...' : 'Decrypt'}
          </button>
        </div>
      )}

      {decrypted !== null && (
        <div>
          <p>Decrypted Value: {decrypted}</p>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <FhevmProvider
      config={{
        network: 'sepolia',
        contractAddress: '0x8EAB26B5C6E8Efe05D30b479C483802D2Ab15c14'
      }}
    >
      <EncryptedCounter />
    </FhevmProvider>
  );
}

export default App;
```

## Custom Hooks

### useEncryptedState

Custom hook for managing encrypted state:

```typescript
import { useState, useCallback } from 'react';
import { useFhevmEncrypt, useFhevmDecrypt } from '@fhevm/sdk';

function useEncryptedState(initialValue = 0) {
  const [encrypted, setEncrypted] = useState(null);
  const [decrypted, setDecrypted] = useState(initialValue);

  const { encrypt } = useFhevmEncrypt();
  const { publicDecrypt } = useFhevmDecrypt();

  const setValue = useCallback(async (value: number) => {
    const enc = await encrypt(value, 'uint8');
    setEncrypted(enc);
    setDecrypted(value);
  }, [encrypt]);

  const getValue = useCallback(async () => {
    if (!encrypted) return decrypted;
    const dec = await publicDecrypt(encrypted);
    setDecrypted(dec);
    return dec;
  }, [encrypted, decrypted, publicDecrypt]);

  return {
    encrypted,
    decrypted,
    setValue,
    getValue
  };
}

// Usage
function Counter() {
  const { encrypted, decrypted, setValue, getValue } = useEncryptedState(0);

  return (
    <div>
      <p>Value: {decrypted}</p>
      <button onClick={() => setValue(decrypted + 1)}>Increment</button>
      <button onClick={getValue}>Refresh</button>
    </div>
  );
}
```

### useContractEncrypted

Custom hook for encrypted contract interactions:

```typescript
import { useState, useCallback } from 'react';
import { useFhevmEncrypt, useFhevmDecrypt } from '@fhevm/sdk';
import { useContract, useAccount } from 'wagmi';

function useContractEncrypted(contractAddress: string, abi: any) {
  const { encrypt } = useFhevmEncrypt();
  const { userDecrypt } = useFhevmDecrypt();
  const { account } = useAccount();
  const contract = useContract({ address: contractAddress, abi });

  const writeEncrypted = useCallback(
    async (functionName: string, ...args: any[]) => {
      // Encrypt arguments that need encryption
      const encryptedArgs = await Promise.all(
        args.map(arg =>
          typeof arg === 'number' ? encrypt(arg, 'uint8') : arg
        )
      );

      // Call contract
      const tx = await contract[functionName](...encryptedArgs.map(e => e.data));
      return await tx.wait();
    },
    [contract, encrypt]
  );

  const readEncrypted = useCallback(
    async (functionName: string, ...args: any[]) => {
      const result = await contract[functionName](...args);

      // Decrypt result
      const decrypted = await userDecrypt(
        { data: result, type: 'uint8' },
        contractAddress,
        account
      );

      return decrypted;
    },
    [contract, userDecrypt, contractAddress, account]
  );

  return { writeEncrypted, readEncrypted };
}

// Usage
function MyComponent() {
  const { writeEncrypted, readEncrypted } = useContractEncrypted(
    '0x8EAB26B5C6E8Efe05D30b479C483802D2Ab15c14',
    MyContractABI
  );

  const submitValue = async () => {
    await writeEncrypted('setValue', 42);
  };

  const getValue = async () => {
    const value = await readEncrypted('getValue');
    console.log('Value:', value);
  };

  return (
    <div>
      <button onClick={submitValue}>Submit</button>
      <button onClick={getValue}>Get Value</button>
    </div>
  );
}
```

## State Management

### With Redux

```typescript
// store/fhevmSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { FhevmSDK } from '@fhevm/sdk';

export const initFhevm = createAsyncThunk('fhevm/init', async (config) => {
  const fhevm = new FhevmSDK(config);
  await fhevm.init();
  return fhevm;
});

const fhevmSlice = createSlice({
  name: 'fhevm',
  initialState: {
    instance: null,
    isReady: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(initFhevm.fulfilled, (state, action) => {
        state.instance = action.payload;
        state.isReady = true;
      })
      .addCase(initFhevm.rejected, (state, action) => {
        state.error = action.error.message;
      });
  }
});

export default fhevmSlice.reducer;

// Component usage
function MyComponent() {
  const dispatch = useDispatch();
  const { instance, isReady } = useSelector(state => state.fhevm);

  useEffect(() => {
    dispatch(initFhevm({ network: 'sepolia', contractAddress: '0x...' }));
  }, [dispatch]);

  if (!isReady) return <div>Loading...</div>;

  // Use instance
}
```

### With Context API

```typescript
// FhevmContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { FhevmSDK } from '@fhevm/sdk';

interface FhevmContextValue {
  fhevm: FhevmSDK | null;
  isReady: boolean;
  encrypt: (value: number, type: string) => Promise<any>;
  decrypt: (encrypted: any) => Promise<number>;
}

const FhevmContext = createContext<FhevmContextValue>(null);

export function FhevmContextProvider({ config, children }) {
  const [fhevm, setFhevm] = useState<FhevmSDK | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      const sdk = new FhevmSDK(config);
      await sdk.init();
      setFhevm(sdk);
      setIsReady(true);
    };
    init();
  }, [config]);

  const encrypt = async (value: number, type: string) => {
    if (!fhevm) throw new Error('SDK not ready');
    return await fhevm.encrypt(value, type);
  };

  const decrypt = async (encrypted: any) => {
    if (!fhevm) throw new Error('SDK not ready');
    return await fhevm.publicDecrypt(encrypted);
  };

  return (
    <FhevmContext.Provider value={{ fhevm, isReady, encrypt, decrypt }}>
      {children}
    </FhevmContext.Provider>
  );
}

export function useFhevm() {
  const context = useContext(FhevmContext);
  if (!context) {
    throw new Error('useFhevm must be used within FhevmContextProvider');
  }
  return context;
}
```

## TypeScript Support

### Type Definitions

```typescript
import { FhevmSDK, EncryptedValue, FhevmConfig } from '@fhevm/sdk';

interface MyComponentProps {
  contractAddress: string;
  onEncrypt?: (encrypted: EncryptedValue) => void;
}

function MyComponent({ contractAddress, onEncrypt }: MyComponentProps) {
  const { encrypt } = useFhevmEncrypt();

  const handleEncrypt = async (value: number) => {
    const encrypted: EncryptedValue = await encrypt(value, 'uint8');
    onEncrypt?.(encrypted);
  };

  return <button onClick={() => handleEncrypt(42)}>Encrypt</button>;
}
```

### Generic Components

```typescript
interface EncryptedDisplayProps<T> {
  encrypted: EncryptedValue;
  render: (decrypted: T) => React.ReactNode;
}

function EncryptedDisplay<T extends number | string>({
  encrypted,
  render
}: EncryptedDisplayProps<T>) {
  const [decrypted, setDecrypted] = useState<T | null>(null);
  const { publicDecrypt } = useFhevmDecrypt();

  useEffect(() => {
    publicDecrypt(encrypted).then(value => setDecrypted(value as T));
  }, [encrypted, publicDecrypt]);

  if (decrypted === null) return <div>Loading...</div>;

  return <>{render(decrypted)}</>;
}

// Usage
<EncryptedDisplay
  encrypted={encryptedValue}
  render={(value) => <div>Value: {value}</div>}
/>
```

## Testing

### Unit Tests with React Testing Library

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FhevmProvider } from '@fhevm/sdk';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should encrypt and decrypt value', async () => {
    render(
      <FhevmProvider config={{ network: 'sepolia', contractAddress: '0x...' }}>
        <MyComponent />
      </FhevmProvider>
    );

    // Wait for SDK to initialize
    await waitFor(() => {
      expect(screen.queryByText('Loading SDK...')).not.toBeInTheDocument();
    });

    // Enter value
    const input = screen.getByPlaceholderText('Enter value');
    await userEvent.type(input, '42');

    // Click encrypt
    const encryptBtn = screen.getByText('Encrypt');
    await userEvent.click(encryptBtn);

    // Wait for encryption
    await waitFor(() => {
      expect(screen.getByText(/Encrypted Data:/)).toBeInTheDocument();
    });

    // Click decrypt
    const decryptBtn = screen.getByText('Decrypt');
    await userEvent.click(decryptBtn);

    // Verify decrypted value
    await waitFor(() => {
      expect(screen.getByText('Decrypted Value: 42')).toBeInTheDocument();
    });
  });
});
```

## Best Practices

1. **Use FhevmProvider at Root**
   ```typescript
   // ✅ Good
   <FhevmProvider config={config}>
     <App />
   </FhevmProvider>

   // ❌ Bad - Multiple providers
   <FhevmProvider><Component1 /></FhevmProvider>
   <FhevmProvider><Component2 /></FhevmProvider>
   ```

2. **Check isReady Before Operations**
   ```typescript
   const { isReady } = useFhevmInit();
   if (!isReady) return <Loading />;
   ```

3. **Handle Loading States**
   ```typescript
   const { encrypt, isEncrypting } = useFhevmEncrypt();
   <button disabled={isEncrypting}>
     {isEncrypting ? 'Encrypting...' : 'Encrypt'}
   </button>
   ```

4. **Use Environment Variables**
   ```typescript
   <FhevmProvider
     config={{
       network: process.env.REACT_APP_NETWORK,
       contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS
     }}
   >
   ```

5. **Memoize Callbacks**
   ```typescript
   const handleEncrypt = useCallback(async () => {
     const encrypted = await encrypt(value, 'uint8');
   }, [value, encrypt]);
   ```

---

## Next Steps

- Explore [Next.js Integration](./nextjs.md)
- Learn about [Contract Interaction](./contracts.md)
- See [Complete Examples](../examples/react/)

---

**Building privacy-preserving React apps with FHEVM** ⚛️🔐
