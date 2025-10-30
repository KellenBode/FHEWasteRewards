# FHEVM SDK

**Universal SDK for Building Confidential Applications with Fully Homomorphic Encryption**

## Overview

FHEVM SDK is a framework-agnostic, developer-friendly SDK for building confidential frontends with Zama's Fully Homomorphic Encryption Virtual Machine (FHEVM). It provides a consistent API across React, Next.js, Vue, Node.js, and vanilla JavaScript.

## Features

- **Framework Agnostic** - Works with React, Next.js, Vue, Node.js, or vanilla JavaScript
- **Unified Interface** - Single package wrapping all required dependencies
- **Developer Friendly** - Intuitive hooks and modular API structure
- **Production Ready** - Minimal lines to get started
- **Type Safe** - Full TypeScript support
- **Modular** - Import only what you need

## Installation

```bash
npm install @fhevm/sdk ethers
```

## Quick Start

### React/Next.js

```typescript
import { FhevmProvider, useFhevmEncrypt, useFhevmDecrypt } from '@fhevm/sdk';

function App() {
  return (
    <FhevmProvider
      config={{
        network: 'sepolia',
        contractAddress: '0x...'
      }}
    >
      <YourComponent />
    </FhevmProvider>
  );
}

function YourComponent() {
  const { encrypt } = useFhevmEncrypt();
  const { userDecrypt } = useFhevmDecrypt();

  const handleEncrypt = async () => {
    const encrypted = await encrypt(42, 'uint8');
    console.log('Encrypted:', encrypted);
  };

  return <button onClick={handleEncrypt}>Encrypt</button>;
}
```

### Vanilla JavaScript

```typescript
import { FhevmSDK } from '@fhevm/sdk';

const fhevm = new FhevmSDK({
  network: 'sepolia',
  contractAddress: '0x...',
  provider: window.ethereum
});

await fhevm.init();

// Encrypt
const encrypted = await fhevm.encrypt(42, 'uint8');

// Decrypt
const decrypted = await fhevm.userDecrypt(encrypted, contractAddress, userAddress);
```

## Core API

### FhevmSDK Class

```typescript
const fhevm = new FhevmSDK({
  network: 'sepolia',
  contractAddress: '0x...',
  provider: window.ethereum
});

await fhevm.init();
```

### Encryption

```typescript
// Single value
const encrypted = await fhevm.encrypt(42, 'uint8');

// Batch encryption
const batch = await fhevm.encryptBatch([
  { value: 42, type: 'uint8' },
  { value: 1000, type: 'uint64' }
]);
```

### Decryption

```typescript
// User decryption (requires EIP-712 signature)
const value = await fhevm.userDecrypt(encrypted, contractAddress, userAddress);

// Public decryption (oracle-based)
const publicValue = await fhevm.publicDecrypt(encrypted);
```

### Contract Interaction

```typescript
// Get contract instance
const contract = fhevm.getContract(abi);

// Send transaction
const tx = await fhevm.sendTransaction(abi, 'functionName', [arg1, arg2]);

// Call view function
const result = await fhevm.call(abi, 'viewFunction');
```

## React Hooks

### useFhevmInit

```typescript
const { fhevm, isReady, error } = useFhevmInit();
```

### useFhevmEncrypt

```typescript
const { encrypt, isEncrypting } = useFhevmEncrypt();
const encrypted = await encrypt(42, 'uint8');
```

### useFhevmDecrypt

```typescript
const { userDecrypt, publicDecrypt, isDecrypting } = useFhevmDecrypt();
const value = await userDecrypt(encrypted, contractAddress, userAddress);
```

## Supported Types

- `uint8` - 8-bit unsigned integer
- `uint16` - 16-bit unsigned integer
- `uint32` - 32-bit unsigned integer
- `uint64` - 64-bit unsigned integer
- `bool` - Boolean
- `address` - Ethereum address

## Architecture

```
┌─────────────────────────────────────┐
│      Framework Layer (Optional)      │
│   React Hooks | Vue Composables     │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         SDK Core (Universal)         │
│  - FhevmSDK Class                   │
│  - Encryption/Decryption Utils      │
│  - Contract Interaction Layer       │
│  - EIP-712 Signing                  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Zama FHEVM Dependencies        │
│  - fhevmjs (encryption library)     │
│  - Ethers.js (blockchain layer)     │
└─────────────────────────────────────┘
```

## Examples

See the `/examples` directory for complete examples:

- **Next.js** - Next.js 14 encrypted counter
- **React** - React 18 voting system (Vite)
- **Privacy Waste Rewards** - Complete privacy application

## Documentation

For detailed documentation, visit the main repository README.

## License

MIT License - see LICENSE for details.

## Links

- GitHub: https://github.com/AidenKuhn/fhevm-react-template
- Documentation: See main README.md
- Zama FHEVM: https://docs.zama.ai/
