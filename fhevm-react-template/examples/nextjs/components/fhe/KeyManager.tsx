'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useFHEContext } from './FHEProvider';

export const KeyManager: React.FC = () => {
  const { isInitialized, publicKey, initialize } = useFHEContext();
  const [loading, setLoading] = useState(false);
  const [newKeys, setNewKeys] = useState<any>(null);
  const [error, setError] = useState('');

  const handleGenerateKeys = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate' }),
      });

      if (!response.ok) {
        throw new Error('Key generation failed');
      }

      const data = await response.json();
      setNewKeys(data.keys);
      await initialize();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Key generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="🔑 Key Management">
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">FHE Status:</h4>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            isInitialized
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {isInitialized ? '✅ Initialized' : '⏳ Initializing...'}
          </div>
        </div>

        {publicKey && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Current Public Key:</h4>
            <p className="text-xs font-mono break-all text-gray-600">
              {publicKey.substring(0, 50)}...
            </p>
          </div>
        )}

        <Button
          onClick={handleGenerateKeys}
          loading={loading}
          variant="secondary"
        >
          Generate New Keys
        </Button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {newKeys && (
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold mb-2 text-green-800">✅ New Keys Generated!</h4>
            <div className="space-y-2 text-xs">
              <div>
                <span className="font-semibold">Public Key:</span>
                <p className="font-mono text-gray-600 break-all">{newKeys.publicKey.substring(0, 40)}...</p>
              </div>
              <div>
                <span className="font-semibold">Private Key:</span>
                <p className="font-mono text-gray-600">****** (hidden for security)</p>
              </div>
            </div>
          </div>
        )}

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          🔐 In production, private keys should never be exposed to the client.
        </div>
      </div>
    </Card>
  );
};
