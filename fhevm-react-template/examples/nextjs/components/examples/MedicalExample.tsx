'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useFhevmInit, useFhevmEncrypt, useFhevmDecrypt } from '@fhevm/sdk';

interface MedicalRecord {
  heartRate: any;
  bloodPressure: any;
  temperature: any;
}

export const MedicalExample: React.FC = () => {
  const { isReady, fhevm } = useFhevmInit();
  const { encrypt, isEncrypting } = useFhevmEncrypt();
  const { userDecrypt, isDecrypting } = useFhevmDecrypt();

  const [heartRate, setHeartRate] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [temperature, setTemperature] = useState('');
  const [encryptedRecord, setEncryptedRecord] = useState<MedicalRecord | null>(null);
  const [decryptedRecord, setDecryptedRecord] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmitRecord = async () => {
    if (!heartRate || !bloodPressure || !temperature) {
      setError('Please fill in all medical data fields');
      return;
    }

    setError('');
    setSuccess('');

    try {
      // Encrypt all medical data
      const encryptedHR = await encrypt(parseInt(heartRate), 'uint8');
      const encryptedBP = await encrypt(parseInt(bloodPressure), 'uint8');
      const encryptedTemp = await encrypt(parseInt(temperature), 'uint8');

      // Store encrypted medical record
      const record: MedicalRecord = {
        heartRate: encryptedHR,
        bloodPressure: encryptedBP,
        temperature: encryptedTemp
      };

      setEncryptedRecord(record);
      setSuccess('Medical record encrypted and stored successfully');

      // Clear form
      setHeartRate('');
      setBloodPressure('');
      setTemperature('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to encrypt medical record');
    }
  };

  const handleViewRecord = async () => {
    if (!encryptedRecord) {
      setError('No encrypted record available');
      return;
    }

    setError('');

    try {
      // Decrypt medical data (requires authorization in production)
      const contractAddress = fhevm?.getConfig().contractAddress || '';

      const hr = await userDecrypt(encryptedRecord.heartRate, contractAddress, 'user-address');
      const bp = await userDecrypt(encryptedRecord.bloodPressure, contractAddress, 'user-address');
      const temp = await userDecrypt(encryptedRecord.temperature, contractAddress, 'user-address');

      setDecryptedRecord({
        heartRate: hr,
        bloodPressure: bp,
        temperature: temp
      });

      setSuccess('Medical record decrypted successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decrypt medical record');
    }
  };

  return (
    <Card title="🏥 Private Medical Records Example">
      <div className="space-y-4">
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-800">
          💡 This demonstrates how sensitive medical data can be stored encrypted on-chain.
          Only authorized parties can decrypt and view the records.
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input
            type="number"
            label="Heart Rate (bpm)"
            placeholder="70"
            value={heartRate}
            onChange={(e) => setHeartRate(e.target.value)}
            disabled={!isReady}
            helperText="Normal: 60-100"
          />

          <Input
            type="number"
            label="Blood Pressure (mmHg)"
            placeholder="120"
            value={bloodPressure}
            onChange={(e) => setBloodPressure(e.target.value)}
            disabled={!isReady}
            helperText="Normal: 90-120"
          />

          <Input
            type="number"
            label="Temperature (°F)"
            placeholder="98"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            disabled={!isReady}
            helperText="Normal: 97-99"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={handleSubmitRecord}
            loading={isEncrypting}
            disabled={!isReady || !heartRate || !bloodPressure || !temperature}
          >
            Encrypt & Store Record
          </Button>

          <Button
            onClick={handleViewRecord}
            loading={isDecrypting}
            disabled={!isReady || !encryptedRecord}
            variant="secondary"
          >
            View Record (Decrypt)
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

        {decryptedRecord && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold mb-3 text-green-800">Decrypted Medical Record:</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Heart Rate</p>
                <p className="text-2xl font-bold text-green-700">{decryptedRecord.heartRate} bpm</p>
              </div>
              <div>
                <p className="text-gray-600">Blood Pressure</p>
                <p className="text-2xl font-bold text-green-700">{decryptedRecord.bloodPressure} mmHg</p>
              </div>
              <div>
                <p className="text-gray-600">Temperature</p>
                <p className="text-2xl font-bold text-green-700">{decryptedRecord.temperature}°F</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              All values were encrypted, stored on-chain, and decrypted securely using FHE
            </p>
          </div>
        )}

        {encryptedRecord && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Encrypted Record (On-Chain Storage):</h4>
            <pre className="text-xs overflow-auto max-h-40">
              {JSON.stringify(encryptedRecord, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </Card>
  );
};
