'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useFhevmInit, useFhevmEncrypt, useFhevmDecrypt } from '@fhevm/sdk';

export const BankingExample: React.FC = () => {
  const { isReady, fhevm } = useFhevmInit();
  const { encrypt, isEncrypting } = useFhevmEncrypt();
  const { userDecrypt, isDecrypting } = useFhevmDecrypt();

  const [amount, setAmount] = useState('');
  const [accountBalance, setAccountBalance] = useState<any>(null);
  const [encryptedBalance, setEncryptedBalance] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleDeposit = async () => {
    if (!amount) {
      setError('Please enter an amount');
      return;
    }

    setError('');
    setSuccess('');

    try {
      // Encrypt the deposit amount
      const encryptedAmount = await encrypt(parseInt(amount), 'uint64');

      // Simulate storing encrypted balance
      setEncryptedBalance(encryptedAmount);
      setSuccess(`Successfully deposited encrypted amount: ${amount}`);
      setAmount('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deposit failed');
    }
  };

  const handleCheckBalance = async () => {
    if (!encryptedBalance) {
      setError('No encrypted balance available');
      return;
    }

    setError('');

    try {
      // Decrypt balance using user decryption (requires EIP-712 signature in production)
      const decrypted = await userDecrypt(
        encryptedBalance,
        fhevm?.getConfig().contractAddress || '',
        'user-address' // In production, use actual user address
      );

      setAccountBalance(decrypted);
      setSuccess('Balance retrieved successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check balance');
    }
  };

  return (
    <Card title="🏦 Private Banking Example">
      <div className="space-y-4">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          💡 This demonstrates how confidential banking transactions can be performed using FHE.
          Deposit amounts are encrypted and balances remain private.
        </div>

        <Input
          type="number"
          label="Deposit Amount"
          placeholder="Enter amount to deposit"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={!isReady}
          helperText="Amount will be encrypted before storage"
        />

        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={handleDeposit}
            loading={isEncrypting}
            disabled={!isReady || !amount}
          >
            Deposit (Encrypted)
          </Button>

          <Button
            onClick={handleCheckBalance}
            loading={isDecrypting}
            disabled={!isReady || !encryptedBalance}
            variant="secondary"
          >
            Check Balance
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        {accountBalance !== null && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Account Balance:</h4>
            <p className="text-2xl font-bold text-green-600">${accountBalance}</p>
            <p className="text-xs text-gray-500 mt-2">
              This balance was encrypted and decrypted using FHE
            </p>
          </div>
        )}

        {encryptedBalance && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Encrypted Data (On-Chain):</h4>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(encryptedBalance, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </Card>
  );
};
