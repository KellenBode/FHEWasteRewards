# API Reference

Complete API documentation for the Universal FHEVM SDK.

## Table of Contents

- [FhevmSDK Class](#fhevmsdk-class)
- [React Hooks](#react-hooks)
- [React Components](#react-components)
- [Types](#types)
- [Constants](#constants)

---

## FhevmSDK Class

Core SDK class providing all FHEVM functionality.

### Constructor

```typescript
new FhevmSDK(config: FhevmConfig)
```

Creates a new FhevmSDK instance.

**Parameters**:
- `config` (FhevmConfig): SDK configuration object

**Example**:
```typescript
const fhevm = new FhevmSDK({
  network: 'sepolia',
  contractAddress: '0x8EAB26B5C6E8Efe05D30b479C483802D2Ab15c14'
});
```

### Methods

#### init()

```typescript
async init(): Promise<void>
```

Initializes the SDK by setting up provider, signer, and FHEVM instance.

**Returns**: Promise that resolves when initialization is complete

**Throws**: Error if initialization fails

**Example**:
```typescript
await fhevm.init();
console.log('SDK ready to use');
```

---

#### encrypt()

```typescript
async encrypt(value: number, type?: string): Promise<EncryptedValue>
```

Encrypts a value using FHEVM.

**Parameters**:
- `value` (number): Value to encrypt
- `type` (string, optional): Encryption type. Default: 'uint8'

**Supported Types**:
- `uint8`, `uint16`, `uint32`, `uint64`, `uint128`, `uint256`
- `int8`, `int16`, `int32`, `int64`, `int128`, `int256`
- `bool`
- `address`
- `bytes`

**Returns**: Promise<EncryptedValue>

**Throws**:
- Error if SDK not initialized
- Error if value is invalid for type
- Error if encryption fails

**Example**:
```typescript
const encrypted = await fhevm.encrypt(42, 'uint8');
console.log('Encrypted:', encrypted.data);
```

---

#### encryptBatch()

```typescript
async encryptBatch(inputs: BatchEncryptInput[]): Promise<EncryptedValue[]>
```

Encrypts multiple values in a batch.

**Parameters**:
- `inputs` (BatchEncryptInput[]): Array of values to encrypt

**Returns**: Promise<EncryptedValue[]>

**Example**:
```typescript
const encrypted = await fhevm.encryptBatch([
  { value: 42, type: 'uint8' },
  { value: 100, type: 'uint16' },
  { value: true, type: 'bool' }
]);
```

---

#### userDecrypt()

```typescript
async userDecrypt(
  encryptedValue: EncryptedValue,
  contractAddress: string,
  userAddress: string
): Promise<number>
```

Decrypts a value using user signature (EIP-712).

**Parameters**:
- `encryptedValue` (EncryptedValue): Encrypted value to decrypt
- `contractAddress` (string): Contract address containing the encrypted value
- `userAddress` (string): User's Ethereum address

**Returns**: Promise<number> - Decrypted value

**Throws**:
- Error if user rejects signature
- Error if decryption fails
- Error if SDK not initialized

**Security**: Requires user signature via EIP-712 for privacy

**Example**:
```typescript
const decrypted = await fhevm.userDecrypt(
  encrypted,
  '0x8EAB26B5C6E8Efe05D30b479C483802D2Ab15c14',
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
);
console.log('Decrypted value:', decrypted);
```

---

#### publicDecrypt()

```typescript
async publicDecrypt(encryptedValue: EncryptedValue): Promise<number>
```

Decrypts a value using public oracle (no signature required).

**Parameters**:
- `encryptedValue` (EncryptedValue): Encrypted value to decrypt

**Returns**: Promise<number> - Decrypted value

**Throws**:
- Error if decryption fails
- Error if SDK not initialized

**Security**: No user signature required. Oracle knows plaintext.

**Example**:
```typescript
const decrypted = await fhevm.publicDecrypt(encrypted);
console.log('Decrypted value:', decrypted);
```

---

#### sendTransaction()

```typescript
async sendTransaction(txParams: TransactionParams): Promise<TransactionReceipt>
```

Sends a transaction to a smart contract.

**Parameters**:
- `txParams` (TransactionParams): Transaction parameters

**Returns**: Promise<TransactionReceipt>

**Example**:
```typescript
const receipt = await fhevm.sendTransaction({
  to: contractAddress,
  data: contract.methods.myFunction(encrypted).encodeABI(),
  value: 0
});
```

---

#### call()

```typescript
async call(callParams: CallParams): Promise<any>
```

Makes a read-only call to a smart contract.

**Parameters**:
- `callParams` (CallParams): Call parameters

**Returns**: Promise<any> - Call result

**Example**:
```typescript
const result = await fhevm.call({
  to: contractAddress,
  data: contract.methods.getValue().encodeABI()
});
```

---

## React Hooks

### useFhevmInit()

```typescript
function useFhevmInit(): UseFhevmInitReturn
```

Hook to access initialized SDK instance.

**Returns**:
```typescript
{
  fhevm: FhevmSDK | null;
  isReady: boolean;
  error: Error | null;
}
```

**Example**:
```typescript
function MyComponent() {
  const { fhevm, isReady, error } = useFhevmInit();

  if (!isReady) return <div>Loading SDK...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Use fhevm
}
```

---

### useFhevmEncrypt()

```typescript
function useFhevmEncrypt(): UseFhevmEncryptReturn
```

Hook for encrypting values with loading states.

**Returns**:
```typescript
{
  encrypt: (value: number, type?: string) => Promise<EncryptedValue>;
  encryptBatch: (inputs: BatchEncryptInput[]) => Promise<EncryptedValue[]>;
  isEncrypting: boolean;
  error: Error | null;
}
```

**Example**:
```typescript
function EncryptComponent() {
  const { encrypt, isEncrypting, error } = useFhevmEncrypt();

  const handleEncrypt = async () => {
    try {
      const encrypted = await encrypt(42, 'uint8');
      console.log('Encrypted:', encrypted);
    } catch (err) {
      console.error('Encryption failed:', err);
    }
  };

  return (
    <button onClick={handleEncrypt} disabled={isEncrypting}>
      {isEncrypting ? 'Encrypting...' : 'Encrypt'}
    </button>
  );
}
```

---

### useFhevmDecrypt()

```typescript
function useFhevmDecrypt(): UseFhevmDecryptReturn
```

Hook for decrypting values with loading states.

**Returns**:
```typescript
{
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

**Example**:
```typescript
function DecryptComponent({ encrypted }) {
  const { userDecrypt, isDecrypting, error } = useFhevmDecrypt();
  const [decrypted, setDecrypted] = useState(null);

  const handleDecrypt = async () => {
    const result = await userDecrypt(encrypted);
    setDecrypted(result);
  };

  return (
    <div>
      <button onClick={handleDecrypt} disabled={isDecrypting}>
        {isDecrypting ? 'Decrypting...' : 'Decrypt'}
      </button>
      {decrypted !== null && <p>Value: {decrypted}</p>}
    </div>
  );
}
```

---

## React Components

### FhevmProvider

```typescript
function FhevmProvider({
  config,
  children
}: FhevmProviderProps): JSX.Element
```

Provider component that initializes and shares SDK instance.

**Props**:
- `config` (FhevmConfig): SDK configuration
- `children` (ReactNode): Child components

**Example**:
```typescript
function App() {
  return (
    <FhevmProvider
      config={{
        network: 'sepolia',
        contractAddress: '0x8EAB26B5C6E8Efe05D30b479C483802D2Ab15c14'
      }}
    >
      <MyApp />
    </FhevmProvider>
  );
}
```

---

## Types

### FhevmConfig

SDK configuration object.

```typescript
interface FhevmConfig {
  network: 'sepolia' | 'custom';
  contractAddress: string;
  provider?: any;
  rpcUrl?: string;
  chainId?: number;
  gatewayUrl?: string;
  debug?: boolean;
}
```

**Properties**:
- `network`: Network to connect to
- `contractAddress`: Smart contract address
- `provider`: Web3 provider (optional, auto-detected if not provided)
- `rpcUrl`: Custom RPC URL (optional, uses default for network)
- `chainId`: Custom chain ID (optional, uses default for network)
- `gatewayUrl`: FHEVM gateway URL (optional, uses default)
- `debug`: Enable debug logging (optional, default: false)

---

### EncryptedValue

Represents an encrypted value.

```typescript
interface EncryptedValue {
  data: string;
  type: string;
}
```

**Properties**:
- `data`: Encrypted data as hex string
- `type`: Original data type

---

### BatchEncryptInput

Input for batch encryption.

```typescript
interface BatchEncryptInput {
  value: number | boolean | string;
  type: string;
}
```

**Properties**:
- `value`: Value to encrypt
- `type`: Encryption type

---

### TransactionParams

Parameters for sending transactions.

```typescript
interface TransactionParams {
  to: string;
  data: string;
  value?: number | string;
  gasLimit?: number;
  gasPrice?: string;
}
```

**Properties**:
- `to`: Recipient address
- `data`: Transaction data
- `value`: ETH value to send (optional)
- `gasLimit`: Gas limit (optional)
- `gasPrice`: Gas price (optional)

---

### CallParams

Parameters for contract calls.

```typescript
interface CallParams {
  to: string;
  data: string;
}
```

**Properties**:
- `to`: Contract address
- `data`: Encoded function call

---

### UseFhevmInitReturn

Return type for useFhevmInit hook.

```typescript
interface UseFhevmInitReturn {
  fhevm: FhevmSDK | null;
  isReady: boolean;
  error: Error | null;
}
```

---

### UseFhevmEncryptReturn

Return type for useFhevmEncrypt hook.

```typescript
interface UseFhevmEncryptReturn {
  encrypt: (value: number, type?: string) => Promise<EncryptedValue>;
  encryptBatch: (inputs: BatchEncryptInput[]) => Promise<EncryptedValue[]>;
  isEncrypting: boolean;
  error: Error | null;
}
```

---

### UseFhevmDecryptReturn

Return type for useFhevmDecrypt hook.

```typescript
interface UseFhevmDecryptReturn {
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

---

## Constants

### Supported Networks

```typescript
const NETWORKS = {
  sepolia: {
    chainId: 11155111,
    rpcUrl: 'https://sepolia.infura.io/v3/',
    gatewayUrl: 'https://gateway.fhevm.io/sepolia'
  },
  // Add more networks as needed
};
```

### Supported Encryption Types

```typescript
const ENCRYPTION_TYPES = [
  'uint8', 'uint16', 'uint32', 'uint64', 'uint128', 'uint256',
  'int8', 'int16', 'int32', 'int64', 'int128', 'int256',
  'bool',
  'address',
  'bytes'
];
```

---

## Error Handling

All async methods can throw errors. Always use try-catch:

```typescript
try {
  const encrypted = await fhevm.encrypt(42);
} catch (error) {
  if (error.message.includes('not initialized')) {
    console.error('SDK not initialized');
  } else if (error.message.includes('user rejected')) {
    console.error('User rejected signature');
  } else {
    console.error('Operation failed:', error);
  }
}
```

Common error messages:
- `"SDK not initialized"` - Call `await fhevm.init()` first
- `"User rejected signature"` - User denied EIP-712 signature request
- `"Invalid encryption type"` - Unsupported encryption type
- `"Invalid value"` - Value out of range for type

---

## Usage Examples

### Complete Example

```typescript
import { FhevmProvider, useFhevmEncrypt, useFhevmDecrypt } from '@fhevm/sdk';

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

function EncryptedCounter() {
  const [value, setValue] = useState('');
  const [encrypted, setEncrypted] = useState(null);
  const [decrypted, setDecrypted] = useState(null);

  const { encrypt, isEncrypting } = useFhevmEncrypt();
  const { userDecrypt, isDecrypting } = useFhevmDecrypt();

  const handleEncrypt = async () => {
    const result = await encrypt(parseInt(value), 'uint8');
    setEncrypted(result);
  };

  const handleDecrypt = async () => {
    const result = await userDecrypt(encrypted);
    setDecrypted(result);
  };

  return (
    <div>
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter value"
      />

      <button onClick={handleEncrypt} disabled={isEncrypting}>
        {isEncrypting ? 'Encrypting...' : 'Encrypt'}
      </button>

      {encrypted && (
        <button onClick={handleDecrypt} disabled={isDecrypting}>
          {isDecrypting ? 'Decrypting...' : 'Decrypt'}
        </button>
      )}

      {decrypted !== null && <p>Decrypted: {decrypted}</p>}
    </div>
  );
}
```

---

For more examples, see the [examples](../examples/) directory.
