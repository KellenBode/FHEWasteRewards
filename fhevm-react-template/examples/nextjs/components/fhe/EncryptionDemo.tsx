'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useFhevmEncrypt, useFhevmInit } from '@fhevm/sdk';

export const EncryptionDemo: React.FC = () => {
  const { isReady } = useFhevmInit();
  const { encrypt, isEncrypting } = useFhevmEncrypt();
  const [value, setValue] = useState('');
  const [encryptedData, setEncryptedData] = useState<any>(null);
  const [error, setError] = useState('');

  const handleEncrypt = async () => {
    if (!value) {
      setError('Please enter a value');
      return;
    }

    setError('');

    try {
      const encrypted = await encrypt(parseInt(value), 'uint8');
      setEncryptedData(encrypted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Encryption failed');
    }
  };

  return (
    <Card title="🔒 Encryption Demo">
      <div className="space-y-4">
        <Input
          type="number"
          label="Value to Encrypt"
          placeholder="Enter a number (0-255)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={!isReady}
          helperText="Enter a value between 0 and 255"
        />

        <Button
          onClick={handleEncrypt}
          loading={isEncrypting}
          disabled={!isReady || !value}
        >
          Encrypt Value
        </Button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {encryptedData && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Encrypted Result:</h4>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(encryptedData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </Card>
  );
};
