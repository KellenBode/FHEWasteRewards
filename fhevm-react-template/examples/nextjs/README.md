# Next.js FHEVM Example - Complete Implementation

Comprehensive Next.js 14 example demonstrating Fully Homomorphic Encryption with the App Router, API routes, and modular architecture.

## Overview

A comprehensive FHE implementation showcasing:
- **Next.js 14 App Router** - Modern app directory structure
- **API Routes** - Server-side encryption operations
- **Client Components** - React components with FHE capabilities
- **Custom Hooks** - Reusable FHE logic
- **TypeScript** - Full type safety throughout
- **Modular Architecture** - Clean separation of concerns

## Features

- ✅ Encryption & Decryption operations
- ✅ Homomorphic computations (add, subtract, multiply, compare)
- ✅ Key management system
- ✅ Multiple API endpoints for FHE operations
- ✅ Reusable UI components (Button, Input, Card)
- ✅ Custom React hooks (useFHE, useEncryption, useComputation)
- ✅ TypeScript with comprehensive type definitions
- ✅ Tailwind CSS styling
- ✅ Next.js 14 App Router architecture

## Quick Start

### Installation

```bash
# Navigate to example
cd examples/nextjs

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your configuration
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_NETWORK=sepolia
NEXT_PUBLIC_CONTRACT_ADDRESS=0x8EAB26B5C6E8Efe05D30b479C483802D2Ab15c14
```

### Development

```bash
# Start development server
npm run dev

# Open browser to http://localhost:3000
```

### Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
nextjs/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Main page with FHE demos
│   ├── globals.css             # Global styles
│   └── api/                    # API routes
│       ├── fhe/
│       │   ├── route.ts         # Main FHE operations
│       │   ├── encrypt/route.ts # Encryption endpoint
│       │   ├── decrypt/route.ts # Decryption endpoint
│       │   └── compute/route.ts # Homomorphic computation
│       └── keys/route.ts       # Key management
│
├── components/                 # React components
│   ├── ui/                     # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Card.tsx
│   └── fhe/                    # FHE components
│       ├── FHEProvider.tsx     # Context provider
│       ├── EncryptionDemo.tsx  # Encryption demo
│       ├── ComputationDemo.tsx # Computation demo
│       └── KeyManager.tsx      # Key management UI
│
├── lib/                        # Utility libraries
│   └── fhe/
│       ├── client.ts           # FHE client operations
│       └── types.ts            # Type definitions
│
├── hooks/                      # Custom React hooks
│   ├── useFHE.ts               # Main FHE hook
│   ├── useEncryption.ts        # Encryption hook
│   └── useComputation.ts       # Computation hook
│
├── types/                      # TypeScript types
│   ├── fhe.ts                  # FHE types
│   └── api.ts                  # API types
│
├── package.json
└── tsconfig.json
```

## Key Concepts

### API Routes

Server-side FHE operations are handled through API routes:

- **`/api/fhe`** - General FHE operations status
- **`/api/fhe/encrypt`** - Encrypt values
- **`/api/fhe/decrypt`** - Decrypt encrypted data
- **`/api/fhe/compute`** - Perform homomorphic computations
- **`/api/keys`** - Key management (generate, retrieve)

### Client Components

Next.js 14 uses Server Components by default. Mark interactive components with `'use client'`:

```typescript
'use client'; // Required for hooks and interactivity

import { useFHE } from '../hooks/useFHE';

export function MyComponent() {
  const { isReady } = useFHE(); // ✅ Works
}
```

### Custom Hooks

Three main hooks for FHE operations:

- **`useFHE()`** - Initialize and access FHE client
- **`useEncryption()`** - Encrypt data
- **`useComputation()`** - Perform homomorphic operations

### FHE Provider

The `FHEProvider` component wraps the app and provides FHE context to all child components.

### Type Safety

All FHE operations are fully typed with TypeScript definitions in the `types/` directory.

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables in Vercel

1. Go to your project on Vercel
2. Settings → Environment Variables
3. Add:
   - `NEXT_PUBLIC_NETWORK` = `sepolia`
   - `NEXT_PUBLIC_CONTRACT_ADDRESS` = `0x...`

## Learn More

### Documentation

- **Main README**: [../../README.md](../../README.md)
- **FHEVM Documentation**: https://docs.zama.ai/
- **Next.js Docs**: https://nextjs.org/docs

### Related Examples

- **Privacy Waste Rewards**: [../privacy-waste-rewards/](../privacy-waste-rewards/) - Complete privacy-preserving application
- **React Example**: [../react/](../react/) - React 18 with Vite implementation

## API Reference

### Encryption

```typescript
POST /api/fhe/encrypt
Body: { value: number, type: string }
Response: { success: boolean, encrypted: EncryptedValue }
```

### Decryption

```typescript
POST /api/fhe/decrypt
Body: { encryptedData: EncryptedValue, userAddress?: string }
Response: { success: boolean, decrypted: number }
```

### Computation

```typescript
POST /api/fhe/compute
Body: { operation: string, operands: EncryptedValue[] }
Response: { success: boolean, result: EncryptedValue }
```

## Resources

- **GitHub**: https://github.com/AidenKuhn/fhevm-react-template
- **Zama FHEVM**: https://docs.zama.ai/
- **Next.js**: https://nextjs.org

## License

MIT License - see [../../LICENSE](../../LICENSE)

---

**Complete Next.js 14 example demonstrating Fully Homomorphic Encryption** 🔐✨

*Comprehensive implementation with API routes, custom hooks, and modular architecture!*
