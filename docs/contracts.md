# Contract Interaction Guide

This guide covers interacting with FHEVM smart contracts using the SDK, including sending encrypted data, calling contract functions, and handling encrypted responses.

## Overview

The FHEVM SDK provides methods to:
- Send encrypted values to smart contracts
- Call contract functions with encrypted parameters
- Handle encrypted return values
- Manage transaction lifecycle

## Basic Contract Interaction

### Setup Contract Instance

```typescript
import { ethers } from 'ethers';
import { FhevmSDK } from '@fhevm/sdk';

// Initialize SDK
const fhevm = new FhevmSDK({
  network: 'sepolia',
  contractAddress: '0x8EAB26B5C6E8Efe05D30b479C483802D2Ab15c14'
});

await fhevm.init();

// Setup contract
const contractABI = [...]; // Your contract ABI
const contract = new ethers.Contract(
  '0x8EAB26B5C6E8Efe05D30b479C483802D2Ab15c14',
  contractABI,
  fhevm.getSigner()
);
```

## Sending Encrypted Data to Contracts

### Encrypt and Send

```typescript
// Encrypt value
const value = 42;
const encrypted = await fhevm.encrypt(value, 'uint8');

// Send to contract
const tx = await contract.submitEncryptedValue(encrypted.data);
await tx.wait();

console.log('Transaction confirmed:', tx.hash);
```

### Complete Example

```typescript
async function submitWasteClassification(category, quantity) {
  // Encrypt both parameters
  const encryptedCategory = await fhevm.encrypt(category, 'uint8');
  const encryptedQuantity = await fhevm.encrypt(quantity, 'uint8');

  // Call contract function
  const tx = await contract.submitWasteClassification(
    encryptedCategory.data,
    encryptedQuantity.data
  );

  // Wait for confirmation
  const receipt = await tx.wait();

  console.log('Submitted successfully');
  console.log('Gas used:', receipt.gasUsed.toString());

  return receipt;
}
```

## Reading Encrypted State

### Get Encrypted Value

```typescript
// Call view function to get encrypted value
const encryptedBalance = await contract.getMyBalance();

// Decrypt for user
const balance = await fhevm.userDecrypt(
  { data: encryptedBalance, type: 'uint64' },
  contract.address,
  userAddress
);

console.log('Your balance:', balance);
```

### Complete Flow

```typescript
async function getUserStats(userAddress) {
  // Get encrypted stats from contract
  const stats = await contract.getUserStats(userAddress);

  // Decrypt each field
  const [totalPoints, submissionCount] = await Promise.all([
    fhevm.userDecrypt(
      { data: stats.totalPoints, type: 'uint64' },
      contract.address,
      userAddress
    ),
    fhevm.userDecrypt(
      { data: stats.submissionCount, type: 'uint8' },
      contract.address,
      userAddress
    )
  ]);

  return {
    totalPoints,
    submissionCount
  };
}
```

## Contract Function Examples

### Example Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/TFHE.sol";

contract PrivacyWasteRewards {
    struct UserStats {
        euint64 totalPoints;
        euint8 submissionCount;
    }

    mapping(address => UserStats) private userStats;

    // Submit encrypted waste classification
    function submitWasteClassification(
        bytes calldata encryptedCategory,
        bytes calldata encryptedQuantity
    ) external returns (euint64) {
        euint8 category = TFHE.asEuint8(encryptedCategory);
        euint8 quantity = TFHE.asEuint8(encryptedQuantity);

        // Calculate points (encrypted)
        euint64 points = calculatePoints(category, quantity);

        // Add to user's total
        UserStats storage stats = userStats[msg.sender];
        stats.totalPoints = TFHE.add(stats.totalPoints, points);
        stats.submissionCount = TFHE.add(stats.submissionCount, TFHE.asEuint8(1));

        return points;
    }

    // Get user's encrypted statistics
    function getMyStats() external view returns (UserStats memory) {
        return userStats[msg.sender];
    }
}
```

### Client-Side Integration

```typescript
import { ethers } from 'ethers';
import { FhevmSDK } from '@fhevm/sdk';

class WasteRewardsClient {
  private fhevm: FhevmSDK;
  private contract: ethers.Contract;

  constructor(contractAddress: string) {
    this.fhevm = new FhevmSDK({
      network: 'sepolia',
      contractAddress
    });
  }

  async init() {
    await this.fhevm.init();

    const abi = [...]; // Contract ABI
    this.contract = new ethers.Contract(
      this.fhevm.config.contractAddress,
      abi,
      this.fhevm.getSigner()
    );
  }

  // Submit waste classification
  async submitWaste(category: number, quantity: number) {
    // Encrypt parameters
    const encCategory = await this.fhevm.encrypt(category, 'uint8');
    const encQuantity = await this.fhevm.encrypt(quantity, 'uint8');

    // Send transaction
    const tx = await this.contract.submitWasteClassification(
      encCategory.data,
      encQuantity.data
    );

    const receipt = await tx.wait();
    return receipt;
  }

  // Get user statistics
  async getMyStats(userAddress: string) {
    // Call contract
    const stats = await this.contract.getMyStats();

    // Decrypt values
    const totalPoints = await this.fhevm.userDecrypt(
      { data: stats.totalPoints, type: 'uint64' },
      this.contract.address,
      userAddress
    );

    const submissionCount = await this.fhevm.userDecrypt(
      { data: stats.submissionCount, type: 'uint8' },
      this.contract.address,
      userAddress
    );

    return { totalPoints, submissionCount };
  }
}
```

## React Integration

### Custom Hook for Contract

```typescript
import { useState } from 'react';
import { useFhevmInit, useFhevmEncrypt, useFhevmDecrypt } from '@fhevm/sdk';
import { useContract } from 'wagmi';

function useWasteRewards(contractAddress: string) {
  const { fhevm, isReady } = useFhevmInit();
  const { encrypt } = useFhevmEncrypt();
  const { userDecrypt } = useFhevmDecrypt();
  const [loading, setLoading] = useState(false);

  const contract = useContract({
    address: contractAddress,
    abi: WasteRewardsABI
  });

  const submitWaste = async (category: number, quantity: number) => {
    setLoading(true);
    try {
      // Encrypt
      const encCategory = await encrypt(category, 'uint8');
      const encQuantity = await encrypt(quantity, 'uint8');

      // Submit
      const tx = await contract.submitWasteClassification(
        encCategory.data,
        encQuantity.data
      );

      await tx.wait();
      return true;
    } catch (error) {
      console.error('Submission failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getStats = async (userAddress: string) => {
    const stats = await contract.getMyStats();

    const totalPoints = await userDecrypt(
      { data: stats.totalPoints, type: 'uint64' },
      contractAddress,
      userAddress
    );

    return { totalPoints };
  };

  return {
    submitWaste,
    getStats,
    loading,
    isReady
  };
}
```

### Component Usage

```typescript
function WasteSubmission() {
  const { account } = useAccount();
  const { submitWaste, getStats, loading } = useWasteRewards(
    '0x8EAB26B5C6E8Efe05D30b479C483802D2Ab15c14'
  );

  const handleSubmit = async () => {
    const success = await submitWaste(1, 10); // Category 1, Quantity 10

    if (success) {
      alert('Waste submitted successfully!');

      // Get updated stats
      const stats = await getStats(account);
      console.log('New total points:', stats.totalPoints);
    }
  };

  return (
    <button onClick={handleSubmit} disabled={loading}>
      {loading ? 'Submitting...' : 'Submit Waste'}
    </button>
  );
}
```

## Transaction Management

### Gas Estimation

```typescript
async function estimateGas(category: number, quantity: number) {
  const encCategory = await fhevm.encrypt(category, 'uint8');
  const encQuantity = await fhevm.encrypt(quantity, 'uint8');

  // Estimate gas
  const gasEstimate = await contract.estimateGas.submitWasteClassification(
    encCategory.data,
    encQuantity.data
  );

  console.log('Estimated gas:', gasEstimate.toString());

  // Add 20% buffer
  const gasLimit = gasEstimate.mul(120).div(100);

  return gasLimit;
}
```

### Transaction with Custom Gas

```typescript
async function submitWithCustomGas(category: number, quantity: number) {
  const encrypted = await Promise.all([
    fhevm.encrypt(category, 'uint8'),
    fhevm.encrypt(quantity, 'uint8')
  ]);

  const gasLimit = await estimateGas(category, quantity);

  const tx = await contract.submitWasteClassification(
    encrypted[0].data,
    encrypted[1].data,
    {
      gasLimit,
      gasPrice: ethers.utils.parseUnits('20', 'gwei')
    }
  );

  return await tx.wait();
}
```

### Transaction Monitoring

```typescript
async function submitWithMonitoring(category: number, quantity: number) {
  const encrypted = await Promise.all([
    fhevm.encrypt(category, 'uint8'),
    fhevm.encrypt(quantity, 'uint8')
  ]);

  // Send transaction
  const tx = await contract.submitWasteClassification(
    encrypted[0].data,
    encrypted[1].data
  );

  console.log('Transaction sent:', tx.hash);

  // Monitor confirmations
  tx.wait(1).then(() => {
    console.log('1 confirmation received');
  });

  tx.wait(3).then(() => {
    console.log('3 confirmations received - transaction finalized');
  });

  // Wait for final confirmation
  const receipt = await tx.wait();
  return receipt;
}
```

## Event Handling

### Listen for Events

```typescript
// Listen for specific event
contract.on('WasteSubmitted', (user, points, event) => {
  console.log('Waste submitted by:', user);
  console.log('Points earned:', points.toString());
  console.log('Block number:', event.blockNumber);
});

// Listen for all events
contract.on('*', (event) => {
  console.log('Event:', event);
});
```

### Query Past Events

```typescript
async function getPastSubmissions(userAddress: string) {
  const filter = contract.filters.WasteSubmitted(userAddress);

  const events = await contract.queryFilter(filter, -10000); // Last 10000 blocks

  return events.map(event => ({
    user: event.args.user,
    category: event.args.category,
    quantity: event.args.quantity,
    timestamp: event.args.timestamp,
    blockNumber: event.blockNumber
  }));
}
```

## Batch Operations

### Batch Encrypt and Send

```typescript
async function batchSubmit(submissions: Array<{category: number, quantity: number}>) {
  // Encrypt all values
  const encrypted = await Promise.all(
    submissions.flatMap(s => [
      fhevm.encrypt(s.category, 'uint8'),
      fhevm.encrypt(s.quantity, 'uint8')
    ])
  );

  // Prepare batch data
  const categories = encrypted.filter((_, i) => i % 2 === 0).map(e => e.data);
  const quantities = encrypted.filter((_, i) => i % 2 === 1).map(e => e.data);

  // Send batch transaction
  const tx = await contract.batchSubmitWaste(categories, quantities);
  const receipt = await tx.wait();

  return receipt;
}
```

## Error Handling

### Comprehensive Error Handling

```typescript
async function safeContractCall(category: number, quantity: number) {
  try {
    // Encrypt
    const encrypted = await Promise.all([
      fhevm.encrypt(category, 'uint8'),
      fhevm.encrypt(quantity, 'uint8')
    ]);

    // Submit
    const tx = await contract.submitWasteClassification(
      encrypted[0].data,
      encrypted[1].data
    );

    const receipt = await tx.wait();
    return { success: true, receipt };

  } catch (error: any) {
    // User rejected transaction
    if (error.code === 4001) {
      return { success: false, error: 'User rejected transaction' };
    }

    // Insufficient funds
    if (error.code === 'INSUFFICIENT_FUNDS') {
      return { success: false, error: 'Insufficient funds for gas' };
    }

    // Contract revert
    if (error.message.includes('revert')) {
      const reason = error.reason || 'Contract reverted';
      return { success: false, error: reason };
    }

    // Network error
    if (error.message.includes('network')) {
      return { success: false, error: 'Network connection error' };
    }

    // Unknown error
    return { success: false, error: error.message };
  }
}
```

## Advanced Patterns

### Optimistic Updates

```typescript
function useOptimisticSubmit() {
  const [localStats, setLocalStats] = useState({ totalPoints: 0 });
  const { submitWaste } = useWasteRewards(contractAddress);

  const optimisticSubmit = async (category: number, quantity: number) => {
    // Calculate expected points
    const expectedPoints = category * quantity;

    // Update UI optimistically
    setLocalStats(prev => ({
      totalPoints: prev.totalPoints + expectedPoints
    }));

    try {
      // Submit to blockchain
      await submitWaste(category, quantity);
    } catch (error) {
      // Revert optimistic update on error
      setLocalStats(prev => ({
        totalPoints: prev.totalPoints - expectedPoints
      }));
      throw error;
    }
  };

  return { optimisticSubmit, localStats };
}
```

### Retry Logic

```typescript
async function submitWithRetry(
  category: number,
  quantity: number,
  maxRetries = 3
) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await submitWaste(category, quantity);
      return result;
    } catch (error) {
      if (attempt === maxRetries) throw error;

      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));

      console.log(`Retry attempt ${attempt + 1}/${maxRetries}`);
    }
  }
}
```

## Testing Contract Interactions

### Unit Test Example

```typescript
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('Contract Interaction', () => {
  let fhevm: FhevmSDK;
  let contract: any;

  beforeEach(async () => {
    fhevm = new FhevmSDK({
      network: 'sepolia',
      contractAddress: '0x...'
    });
    await fhevm.init();

    const Contract = await ethers.getContractFactory('PrivacyWasteRewards');
    contract = await Contract.deploy();
    await contract.deployed();
  });

  it('should submit encrypted waste', async () => {
    const category = 1;
    const quantity = 10;

    const encCategory = await fhevm.encrypt(category, 'uint8');
    const encQuantity = await fhevm.encrypt(quantity, 'uint8');

    const tx = await contract.submitWasteClassification(
      encCategory.data,
      encQuantity.data
    );

    await expect(tx).to.emit(contract, 'WasteSubmitted');
  });
});
```

## Best Practices

1. **Always Encrypt Sensitive Data**
   ```typescript
   // ✅ Good
   const encrypted = await fhevm.encrypt(sensitiveValue, 'uint8');
   await contract.submit(encrypted.data);

   // ❌ Bad
   await contract.submit(sensitiveValue); // Unencrypted!
   ```

2. **Handle Transaction Failures**
   ```typescript
   try {
     const tx = await contract.submit(data);
     await tx.wait();
   } catch (error) {
     // Handle error appropriately
   }
   ```

3. **Validate Inputs Before Encryption**
   ```typescript
   if (value < 0 || value > 255) {
     throw new Error('Value out of range for uint8');
   }
   const encrypted = await fhevm.encrypt(value, 'uint8');
   ```

4. **Use Appropriate Gas Limits**
   ```typescript
   const gasEstimate = await contract.estimateGas.submit(data);
   const gasLimit = gasEstimate.mul(120).div(100); // 20% buffer
   ```

5. **Cache Decrypted Values**
   ```typescript
   const cache = new Map();
   async function getCachedValue(encryptedData) {
     if (!cache.has(encryptedData.data)) {
       const decrypted = await fhevm.publicDecrypt(encryptedData);
       cache.set(encryptedData.data, decrypted);
     }
     return cache.get(encryptedData.data);
   }
   ```

---

## Next Steps

- Explore [React Integration](./react.md)
- Learn about [Next.js Setup](./nextjs.md)
- See [Complete Examples](../examples/)

---

**Making contract interactions private and secure with FHEVM** 🔐
