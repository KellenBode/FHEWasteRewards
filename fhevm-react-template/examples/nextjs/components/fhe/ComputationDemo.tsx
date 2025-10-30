'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useFhevmInit, useFhevmEncrypt } from '@fhevm/sdk';

export const ComputationDemo: React.FC = () => {
  const { isReady } = useFhevmInit();
  const { encrypt, isEncrypting } = useFhevmEncrypt();
  const [value1, setValue1] = useState('');
  const [value2, setValue2] = useState('');
  const [operation, setOperation] = useState('add');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleCompute = async () => {
    if (!value1 || !value2) {
      setError('Please enter both values');
      return;
    }

    setError('');

    try {
      // Encrypt both values using SDK
      const encrypted1 = await encrypt(parseInt(value1), 'uint8');
      const encrypted2 = await encrypt(parseInt(value2), 'uint8');

      // Perform homomorphic computation
      const computeResponse = await fetch('/api/fhe/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation,
          operands: [encrypted1, encrypted2],
        }),
      });

      if (!computeResponse.ok) {
        throw new Error('Computation failed');
      }

      const computeData = await computeResponse.json();
      setResult(computeData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Computation failed');
    }
  };

  return (
    <Card title="⚙️ Homomorphic Computation Demo">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            label="First Value"
            placeholder="Enter number"
            value={value1}
            onChange={(e) => setValue1(e.target.value)}
            disabled={!isReady}
          />
          <Input
            type="number"
            label="Second Value"
            placeholder="Enter number"
            value={value2}
            onChange={(e) => setValue2(e.target.value)}
            disabled={!isReady}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Operation
          </label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
            disabled={!isReady}
          >
            <option value="add">Addition (+)</option>
            <option value="subtract">Subtraction (-)</option>
            <option value="multiply">Multiplication (×)</option>
            <option value="compare">Comparison (=)</option>
          </select>
        </div>

        <Button
          onClick={handleCompute}
          loading={isEncrypting}
          disabled={!isReady || !value1 || !value2}
        >
          Compute on Encrypted Data
        </Button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {result && (
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold mb-2">Computation Result:</h4>
            <p className="text-sm text-gray-600 mb-2">
              Operation: <span className="font-mono">{result.operation}</span>
            </p>
            <pre className="text-xs overflow-auto bg-white p-2 rounded">
              {JSON.stringify(result.result, null, 2)}
            </pre>
          </div>
        )}

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          💡 This demo encrypts both values and performs the operation on encrypted data without decrypting them.
        </div>
      </div>
    </Card>
  );
};
