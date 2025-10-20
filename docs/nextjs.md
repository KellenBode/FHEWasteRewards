# Next.js Integration Guide

Complete guide for integrating the FHEVM SDK with Next.js 13+ applications using the App Router.

## Quick Start

### Installation

```bash
npx create-next-app@latest my-fhevm-app
cd my-fhevm-app
npm install @fhevm/sdk ethers
```

### Project Structure

```
my-fhevm-app/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   ├── providers.tsx       # Client components wrapper
│   └── globals.css         # Global styles
├── components/
│   └── EncryptedCounter.tsx
├── .env.local              # Environment variables
├── next.config.js
├── package.json
└── tsconfig.json
```

## Setup

### 1. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_NETWORK=sepolia
NEXT_PUBLIC_CONTRACT_ADDRESS=0x8EAB26B5C6E8Efe05D30b479C483802D2Ab15c14
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
```

### 2. Create Providers Component

Create `app/providers.tsx`:

```typescript
'use client';

import { FhevmProvider } from '@fhevm/sdk';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FhevmProvider
      config={{
        network: process.env.NEXT_PUBLIC_NETWORK as 'sepolia',
        contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '',
        rpcUrl: process.env.NEXT_PUBLIC_RPC_URL
      }}
    >
      {children}
    </FhevmProvider>
  );
}
```

### 3. Update Root Layout

Update `app/layout.tsx`:

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FHEVM App',
  description: 'Privacy-preserving application with FHEVM',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### 4. Create Main Page

Update `app/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useFhevmInit, useFhevmEncrypt, useFhevmDecrypt } from '@fhevm/sdk';

export default function Home() {
  const [value, setValue] = useState('');
  const [encrypted, setEncrypted] = useState<any>(null);
  const [decrypted, setDecrypted] = useState<number | null>(null);

  const { isReady } = useFhevmInit();
  const { encrypt, isEncrypting } = useFhevmEncrypt();
  const { publicDecrypt, isDecrypting } = useFhevmDecrypt();

  const handleEncrypt = async () => {
    if (!value) return;
    const result = await encrypt(parseInt(value), 'uint8');
    setEncrypted(result);
    setDecrypted(null);
  };

  const handleDecrypt = async () => {
    if (!encrypted) return;
    const result = await publicDecrypt(encrypted);
    setDecrypted(result);
  };

  if (!isReady) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto" />
          <p className="mt-4">Initializing FHEVM SDK...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-md w-full space-y-8">
        <h1 className="text-4xl font-bold text-center">Encrypted Counter</h1>

        <div className="space-y-4">
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter value (0-255)"
            min="0"
            max="255"
            className="w-full px-4 py-2 border rounded-lg"
          />

          <button
            onClick={handleEncrypt}
            disabled={isEncrypting || !value}
            className="w-full bg-blue-500 text-white py-2 rounded-lg disabled:bg-gray-300"
          >
            {isEncrypting ? 'Encrypting...' : 'Encrypt'}
          </button>

          {encrypted && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-100 rounded-lg">
                <p className="text-sm font-mono break-all">
                  {encrypted.data}
                </p>
              </div>

              <button
                onClick={handleDecrypt}
                disabled={isDecrypting}
                className="w-full bg-green-500 text-white py-2 rounded-lg disabled:bg-gray-300"
              >
                {isDecrypting ? 'Decrypting...' : 'Decrypt'}
              </button>
            </div>
          )}

          {decrypted !== null && (
            <div className="p-4 bg-green-100 rounded-lg text-center">
              <p className="text-2xl font-bold">{decrypted}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
```

## App Router Features

### Server Components vs Client Components

```typescript
// app/page.tsx (Server Component - Default)
export default function Page() {
  // Cannot use hooks here
  return <ClientComponent />;
}

// components/ClientComponent.tsx (Client Component)
'use client';

import { useFhevmEncrypt } from '@fhevm/sdk';

export default function ClientComponent() {
  const { encrypt } = useFhevmEncrypt();
  // Can use hooks here
  return <div>...</div>;
}
```

### Server Actions with FHEVM

```typescript
// app/actions.ts
'use server';

import { FhevmSDK } from '@fhevm/sdk';

export async function serverEncrypt(value: number) {
  const fhevm = new FhevmSDK({
    network: 'sepolia',
    contractAddress: process.env.CONTRACT_ADDRESS!,
    rpcUrl: process.env.RPC_URL
  });

  await fhevm.init();
  const encrypted = await fhevm.encrypt(value, 'uint8');

  return encrypted;
}

// app/page.tsx
'use client';

import { serverEncrypt } from './actions';

export default function Page() {
  const handleEncrypt = async () => {
    const encrypted = await serverEncrypt(42);
    console.log('Encrypted on server:', encrypted);
  };

  return <button onClick={handleEncrypt}>Encrypt on Server</button>;
}
```

### API Routes

```typescript
// app/api/encrypt/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { FhevmSDK } from '@fhevm/sdk';

export async function POST(request: NextRequest) {
  try {
    const { value, type } = await request.json();

    const fhevm = new FhevmSDK({
      network: 'sepolia',
      contractAddress: process.env.CONTRACT_ADDRESS!,
      rpcUrl: process.env.RPC_URL
    });

    await fhevm.init();
    const encrypted = await fhevm.encrypt(value, type || 'uint8');

    return NextResponse.json({ encrypted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Client usage
async function encryptViaAPI(value: number) {
  const response = await fetch('/api/encrypt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value, type: 'uint8' })
  });

  const { encrypted } = await response.json();
  return encrypted;
}
```

## Advanced Patterns

### Dynamic Routes

```typescript
// app/encrypted/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useFhevmDecrypt } from '@fhevm/sdk';
import { useEffect, useState } from 'react';

export default function EncryptedDataPage() {
  const params = useParams();
  const { publicDecrypt } = useFhevmDecrypt();
  const [data, setData] = useState<number | null>(null);

  useEffect(() => {
    // Fetch encrypted data by ID
    fetch(`/api/data/${params.id}`)
      .then(res => res.json())
      .then(async ({ encrypted }) => {
        const decrypted = await publicDecrypt(encrypted);
        setData(decrypted);
      });
  }, [params.id, publicDecrypt]);

  return <div>Decrypted Data: {data}</div>;
}
```

### Loading States

```typescript
// app/loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
    </div>
  );
}

// app/page.tsx
'use client';

import { Suspense } from 'react';
import EncryptedData from '@/components/EncryptedData';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading encrypted data...</div>}>
      <EncryptedData />
    </Suspense>
  );
}
```

### Error Handling

```typescript
// app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Try again
      </button>
    </div>
  );
}
```

## Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if contract address is configured
  if (!process.env.NEXT_PUBLIC_CONTRACT_ADDRESS) {
    return NextResponse.redirect(new URL('/setup', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/app/:path*',
};
```

## Data Fetching

### Client-Side Fetching

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useFhevmDecrypt } from '@fhevm/sdk';

export default function DataDisplay() {
  const [data, setData] = useState(null);
  const { publicDecrypt } = useFhevmDecrypt();

  useEffect(() => {
    async function fetchData() {
      const response = await fetch('/api/encrypted-data');
      const { encrypted } = await response.json();
      const decrypted = await publicDecrypt(encrypted);
      setData(decrypted);
    }

    fetchData();
  }, [publicDecrypt]);

  return <div>{data}</div>;
}
```

### Server-Side Fetching

```typescript
// app/data/page.tsx
import { FhevmSDK } from '@fhevm/sdk';

async function getData() {
  const fhevm = new FhevmSDK({
    network: 'sepolia',
    contractAddress: process.env.CONTRACT_ADDRESS!,
    rpcUrl: process.env.RPC_URL
  });

  await fhevm.init();

  // Fetch from contract
  const encrypted = await contract.getData();

  // Decrypt server-side
  const decrypted = await fhevm.publicDecrypt(encrypted);

  return decrypted;
}

export default async function DataPage() {
  const data = await getData();

  return (
    <div>
      <h1>Server-Fetched Data</h1>
      <p>{data}</p>
    </div>
  );
}
```

## Styling

### Tailwind CSS

```typescript
// tailwind.config.js
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

// Component with Tailwind
export default function EncryptedCard({ encrypted }) {
  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-8">
        <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
          Encrypted Data
        </div>
        <p className="mt-2 text-gray-500 font-mono break-all">
          {encrypted.data}
        </p>
      </div>
    </div>
  );
}
```

## Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables in Vercel

1. Go to Project Settings
2. Navigate to Environment Variables
3. Add:
   - `NEXT_PUBLIC_NETWORK=sepolia`
   - `NEXT_PUBLIC_CONTRACT_ADDRESS=0x...`
   - `NEXT_PUBLIC_RPC_URL=https://...`

### Build Optimization

```javascript
// next.config.js
module.exports = {
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizePackageImports: ['@fhevm/sdk'],
  },
};
```

## Performance

### Code Splitting

```typescript
// Dynamic import for heavy components
import dynamic from 'next/dynamic';

const EncryptedCounter = dynamic(
  () => import('@/components/EncryptedCounter'),
  {
    loading: () => <p>Loading...</p>,
    ssr: false // Disable SSR for client-only components
  }
);

export default function Page() {
  return <EncryptedCounter />;
}
```

### Memoization

```typescript
'use client';

import { useMemo } from 'react';
import { useFhevmInit } from '@fhevm/sdk';

export default function OptimizedComponent() {
  const { fhevm } = useFhevmInit();

  const memoizedConfig = useMemo(() => ({
    network: 'sepolia',
    contractAddress: '0x...'
  }), []);

  return <div>...</div>;
}
```

## Testing

### Unit Tests

```typescript
// __tests__/page.test.tsx
import { render, screen } from '@testing-library/react';
import { FhevmProvider } from '@fhevm/sdk';
import Home from '@/app/page';

describe('Home', () => {
  it('renders encrypted counter', () => {
    render(
      <FhevmProvider config={{ network: 'sepolia', contractAddress: '0x...' }}>
        <Home />
      </FhevmProvider>
    );

    expect(screen.getByText('Encrypted Counter')).toBeInTheDocument();
  });
});
```

### E2E Tests with Playwright

```typescript
// e2e/encryption.spec.ts
import { test, expect } from '@playwright/test';

test('encrypt and decrypt value', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Wait for SDK initialization
  await page.waitForSelector('text=Encrypted Counter');

  // Enter value
  await page.fill('input[type=number]', '42');

  // Click encrypt
  await page.click('text=Encrypt');

  // Wait for encrypted data
  await page.waitForSelector('text=/0x[0-9a-f]+/');

  // Click decrypt
  await page.click('text=Decrypt');

  // Verify decrypted value
  await expect(page.locator('text=42')).toBeVisible();
});
```

## Best Practices

1. **Use 'use client' Directive**
   ```typescript
   'use client'; // At top of file for client components
   ```

2. **Environment Variables**
   ```typescript
   // Use NEXT_PUBLIC_ prefix for client-side variables
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
   ```

3. **Optimize Bundle Size**
   ```typescript
   // Dynamic imports for heavy components
   const Heavy = dynamic(() => import('./Heavy'), { ssr: false });
   ```

4. **Error Boundaries**
   ```typescript
   // Create error.tsx for error handling
   'use client';
   export default function Error({ error, reset }) {
     return <div>Error: {error.message}</div>;
   }
   ```

5. **Loading States**
   ```typescript
   // Create loading.tsx for loading UI
   export default function Loading() {
     return <div>Loading...</div>;
   }
   ```

## Troubleshooting

### Hydration Errors

```typescript
// Disable SSR for components using window/ethereum
import dynamic from 'next/dynamic';

const ClientOnly = dynamic(() => import('./ClientOnly'), {
  ssr: false
});
```

### Environment Variables Not Working

```typescript
// Ensure NEXT_PUBLIC_ prefix for client-side
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...

// Restart dev server after adding variables
npm run dev
```

---

## Next Steps

- Explore [React Integration](./react.md)
- Learn about [Contract Interaction](./contracts.md)
- See [Complete Example](../examples/nextjs/)

---

**Building privacy-preserving Next.js apps with FHEVM** ⚡🔐
