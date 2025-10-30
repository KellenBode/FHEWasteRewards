'use client';

import { FHEProvider } from '../components/fhe/FHEProvider';
import { EncryptionDemo } from '../components/fhe/EncryptionDemo';
import { ComputationDemo } from '../components/fhe/ComputationDemo';
import { KeyManager } from '../components/fhe/KeyManager';
import { BankingExample } from '../components/examples/BankingExample';
import { MedicalExample } from '../components/examples/MedicalExample';

export default function Home() {
  return (
    <FHEProvider>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🔐 FHEVM Next.js Example
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Complete demonstration of Fully Homomorphic Encryption with Next.js 14 App Router
            </p>
          </div>

          {/* Key Manager */}
          <div className="mb-8">
            <KeyManager />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Encryption Demo */}
            <EncryptionDemo />

            {/* Computation Demo */}
            <ComputationDemo />
          </div>

          {/* Use Case Examples */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              🎯 Real-World Use Cases
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Banking Example */}
              <BankingExample />

              {/* Medical Example */}
              <MedicalExample />
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              📚 About This Example
            </h2>
            <div className="prose max-w-none text-gray-600">
              <p className="mb-4">
                This Next.js 14 example demonstrates a complete FHE implementation with:
              </p>
              <ul className="space-y-2 mb-4">
                <li><strong>App Router Architecture</strong> - Using Next.js 14 app directory</li>
                <li><strong>API Routes</strong> - Server-side FHE operations (/api/fhe/*)</li>
                <li><strong>Client Components</strong> - React components with 'use client'</li>
                <li><strong>Custom Hooks</strong> - Reusable FHE logic (useFHE, useEncryption, useComputation)</li>
                <li><strong>Type Safety</strong> - Full TypeScript support</li>
                <li><strong>Homomorphic Operations</strong> - Compute on encrypted data</li>
              </ul>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-800">
                  <strong>⚠️ Note:</strong> This is a demonstration using simulated encryption.
                  For production use, integrate the tfhe-js library for real FHE operations.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>Built with Next.js 14, React 18, and FHEVM SDK</p>
          </div>
        </div>
      </main>
    </FHEProvider>
  );
}
