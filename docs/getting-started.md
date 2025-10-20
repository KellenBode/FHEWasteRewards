# Getting Started with FHEVM SDK

Welcome to the Universal FHEVM SDK! This guide will help you get started with building privacy-preserving applications using Fully Homomorphic Encryption (FHE).

## What is FHEVM?

FHEVM (Fully Homomorphic Encryption Virtual Machine) by Zama enables blockchain smart contracts to perform computations on encrypted data without ever decrypting it. This allows building applications with complete data privacy.

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **MetaMask** or another Web3 wallet
- Basic knowledge of React/Next.js
- Familiarity with Ethereum smart contracts

## Quick Start

Get started with FHEVM SDK in less than 10 lines of code:

### Installation

```bash
npm install @fhevm/sdk
```

### Basic Usage

```typescript
import { FhevmSDK } from '@fhevm/sdk';

// Initialize SDK
const fhevm = new FhevmSDK({
  network: 'sepolia',
  contractAddress: '0x8EAB26B5C6E8Efe05D30b479C483802D2Ab15c14'
});

await fhevm.init();

// Encrypt data
const encrypted = await fhevm.encrypt(42, 'uint8');

// Use in contract call
const tx = await fhevm.sendTransaction({
  to: contractAddress,
  data: contract.methods.addEncryptedValue(encrypted).encodeABI()
});

// Decrypt result
const decrypted = await fhevm.userDecrypt(result, contractAddress, userAddress);
```

That's it! You're now using FHEVM encryption in just 6 lines.

## Using with React

For React applications, use the provided hooks:

```typescript
import { FhevmProvider, useFhevmEncrypt, useFhevmDecrypt } from '@fhevm/sdk';

function App() {
  return (
    <FhevmProvider config={{ network: 'sepolia', contractAddress: '0x...' }}>
      <MyComponent />
    </FhevmProvider>
  );
}

function MyComponent() {
  const { encrypt, isEncrypting } = useFhevmEncrypt();
  const { userDecrypt, isDecrypting } = useFhevmDecrypt();

  const handleEncrypt = async () => {
    const encrypted = await encrypt(42);
    console.log('Encrypted value:', encrypted);
  };

  return (
    <button onClick={handleEncrypt} disabled={isEncrypting}>
      Encrypt Value
    </button>
  );
}
```

## Using with Next.js

For Next.js 14+ with App Router:

### Step 1: Create Providers Component

```typescript
// app/providers.tsx
'use client';

import { FhevmProvider } from '@fhevm/sdk';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FhevmProvider
      config={{
        network: 'sepolia',
        contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
      }}
    >
      {children}
    </FhevmProvider>
  );
}
```

### Step 2: Wrap Your App

```typescript
// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### Step 3: Use SDK in Components

```typescript
// app/page.tsx
'use client';

import { useFhevmEncrypt } from '@fhevm/sdk';

export default function HomePage() {
  const { encrypt } = useFhevmEncrypt();

  // Use encrypt function
}
```

## Core Concepts

### 1. Encryption

Encrypt values before sending to smart contracts:

```typescript
const encrypted = await fhevm.encrypt(value, type);
```

Supported types:
- `uint8`, `uint16`, `uint32`, `uint64`, `uint128`, `uint256`
- `int8`, `int16`, `int32`, `int64`, `int128`, `int256`
- `bool`
- `address`
- `bytes`

### 2. User Decryption (EIP-712)

Decrypt values using user signature (requires user permission):

```typescript
const decrypted = await fhevm.userDecrypt(
  encryptedValue,
  contractAddress,
  userAddress
);
```

This method:
- Requires user signature via EIP-712
- Provides maximum privacy
- User controls decryption permission

### 3. Public Decryption

Decrypt values using public oracle (no signature required):

```typescript
const decrypted = await fhevm.publicDecrypt(encryptedValue);
```

This method:
- No user signature required
- Faster decryption
- Less privacy (oracle knows plaintext)

### 4. Batch Operations

Encrypt multiple values at once:

```typescript
const encrypted = await fhevm.encryptBatch([
  { value: 42, type: 'uint8' },
  { value: 100, type: 'uint16' },
  { value: true, type: 'bool' }
]);
```

## Network Configuration

### Sepolia Testnet

```typescript
const fhevm = new FhevmSDK({
  network: 'sepolia',
  contractAddress: '0x...'
});
```

### Custom Network

```typescript
const fhevm = new FhevmSDK({
  network: 'custom',
  rpcUrl: 'https://custom-rpc-url.com',
  chainId: 12345,
  gatewayUrl: 'https://gateway.fhevm.custom',
  contractAddress: '0x...'
});
```

### Using Existing Provider

```typescript
const fhevm = new FhevmSDK({
  network: 'sepolia',
  provider: window.ethereum, // MetaMask or other Web3 provider
  contractAddress: '0x...'
});
```

## Environment Variables

Create a `.env` file:

```bash
# Network Configuration
NEXT_PUBLIC_NETWORK=sepolia

# Contract Address
NEXT_PUBLIC_CONTRACT_ADDRESS=0x8EAB26B5C6E8Efe05D30b479C483802D2Ab15c14

# RPC URL (optional, uses default if not set)
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY

# Gateway URL (optional, uses default if not set)
NEXT_PUBLIC_GATEWAY_URL=https://gateway.fhevm.io
```

## TypeScript Support

The SDK is written in TypeScript and provides full type definitions:

```typescript
import { FhevmSDK, EncryptedValue, FhevmConfig } from '@fhevm/sdk';

const config: FhevmConfig = {
  network: 'sepolia',
  contractAddress: '0x...'
};

const fhevm = new FhevmSDK(config);
const encrypted: EncryptedValue = await fhevm.encrypt(42, 'uint8');
```

## Error Handling

The SDK provides detailed error messages:

```typescript
try {
  const encrypted = await fhevm.encrypt(42);
} catch (error) {
  if (error.message.includes('not initialized')) {
    console.error('SDK not initialized. Call await fhevm.init() first.');
  } else if (error.message.includes('user rejected')) {
    console.error('User rejected the signature request');
  } else {
    console.error('Encryption failed:', error);
  }
}
```

## Next Steps

- Read the [SDK Architecture](./architecture.md) guide
- Check out [API Reference](./api-reference.md)
- Explore [framework-specific guides](./frameworks/)
- See [example applications](../examples/)

## Resources

- **GitHub Repository**: https://github.com/AidenKuhn/fhevm-react-template
- **Live Example**: https://fhe-waste-rewards.vercel.app/
- **Zama FHEVM Docs**: https://docs.zama.ai/
- **FHEVM Contracts**: https://github.com/zama-ai/fhevm

## Support

If you encounter any issues:

1. Check the [Troubleshooting Guide](../SETUP_INSTRUCTIONS.md#troubleshooting)
2. Review the [API Reference](./api-reference.md)
3. Look at working [examples](../examples/)
4. Open an issue on GitHub

---

**Ready to build privacy-preserving dApps!** 🔐✨
