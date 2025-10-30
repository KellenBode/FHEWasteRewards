# Decryption Guide

This guide covers decryption methods in the FHEVM SDK, including user-authorized decryption (EIP-712) and public oracle decryption.

## Overview

The FHEVM SDK provides two decryption methods:

1. **User Decryption (EIP-712)** - Requires user signature, maximum privacy
2. **Public Decryption** - No signature required, uses public oracle

## User Decryption (EIP-712)

User decryption requires the user to sign an EIP-712 message, ensuring only authorized parties can decrypt data.

### How It Works

```
1. App requests decryption
2. User signs EIP-712 typed data
3. Signature sent to FHEVM Gateway
4. Gateway verifies signature
5. Decrypted value returned
```

### Basic Usage

```typescript
import { FhevmSDK } from '@fhevm/sdk';

const fhevm = new FhevmSDK({
  network: 'sepolia',
  contractAddress: '0x...'
});

await fhevm.init();

// Decrypt with user signature
const decrypted = await fhevm.userDecrypt(
  encryptedValue,
  contractAddress,
  userAddress
);
```

### With React Hook

```typescript
import { useFhevmDecrypt } from '@fhevm/sdk';

function MyComponent() {
  const { userDecrypt, isDecrypting, error } = useFhevmDecrypt();

  const handleDecrypt = async () => {
    try {
      const result = await userDecrypt(
        encryptedValue,
        '0x8EAB26B5C6E8Efe05D30b479C483802D2Ab15c14',
        account
      );
      console.log('Decrypted value:', result);
    } catch (err) {
      console.error('Decryption failed:', err);
    }
  };

  return (
    <button onClick={handleDecrypt} disabled={isDecrypting}>
      {isDecrypting ? 'Decrypting...' : 'Decrypt'}
    </button>
  );
}
```

### EIP-712 Message Structure

The signature follows EIP-712 standard:

```typescript
const domain = {
  name: 'FHEVM',
  version: '1',
  chainId: 11155111, // Sepolia
  verifyingContract: contractAddress
};

const types = {
  Decrypt: [
    { name: 'ciphertext', type: 'bytes' },
    { name: 'userAddress', type: 'address' }
  ]
};

const value = {
  ciphertext: encryptedValue.data,
  userAddress: userAddress
};

const signature = await signer._signTypedData(domain, types, value);
```

### Parameters

**`userDecrypt(encryptedValue, contractAddress, userAddress)`**

- `encryptedValue` (EncryptedValue): The encrypted value to decrypt
  - `data` (string): Hex-encoded encrypted data
  - `type` (string): Original encryption type
- `contractAddress` (string): Smart contract address containing the encrypted value
- `userAddress` (string): User's Ethereum address for signature verification

**Returns**: `Promise<number>` - Decrypted value

### Error Handling

```typescript
try {
  const decrypted = await userDecrypt(encrypted, contractAddress, userAddress);
} catch (error) {
  if (error.message.includes('User rejected')) {
    console.error('User rejected signature request');
  } else if (error.message.includes('not authorized')) {
    console.error('User not authorized to decrypt this value');
  } else if (error.message.includes('invalid signature')) {
    console.error('Invalid signature provided');
  } else {
    console.error('Decryption failed:', error);
  }
}
```

### Security Considerations

**Advantages**:
- ✅ Maximum privacy - only user can decrypt
- ✅ Explicit user consent via signature
- ✅ No third-party knowledge of plaintext
- ✅ Audit trail via EIP-712 signature

**Limitations**:
- ⚠️ Requires user interaction
- ⚠️ User can reject signature
- ⚠️ Slower than public decryption

### Use Cases

Use user decryption when:
- Decrypting sensitive user data (balances, health records)
- User needs explicit control over decryption
- Privacy is critical
- Compliance requires user consent

---

## Public Decryption

Public decryption uses FHEVM's public oracle to decrypt values without user signature.

### How It Works

```
1. App requests decryption
2. Request sent to FHEVM Gateway
3. Gateway decrypts using public key
4. Decrypted value returned
```

### Basic Usage

```typescript
import { FhevmSDK } from '@fhevm/sdk';

const fhevm = new FhevmSDK({
  network: 'sepolia',
  contractAddress: '0x...'
});

await fhevm.init();

// Decrypt without signature
const decrypted = await fhevm.publicDecrypt(encryptedValue);
```

### With React Hook

```typescript
import { useFhevmDecrypt } from '@fhevm/sdk';

function MyComponent() {
  const { publicDecrypt, isDecrypting, error } = useFhevmDecrypt();

  const handleDecrypt = async () => {
    try {
      const result = await publicDecrypt(encryptedValue);
      console.log('Decrypted value:', result);
    } catch (err) {
      console.error('Decryption failed:', err);
    }
  };

  return (
    <button onClick={handleDecrypt} disabled={isDecrypting}>
      {isDecrypting ? 'Decrypting...' : 'Decrypt'}
    </button>
  );
}
```

### Parameters

**`publicDecrypt(encryptedValue)`**

- `encryptedValue` (EncryptedValue): The encrypted value to decrypt
  - `data` (string): Hex-encoded encrypted data
  - `type` (string): Original encryption type

**Returns**: `Promise<number>` - Decrypted value

### Error Handling

```typescript
try {
  const decrypted = await publicDecrypt(encrypted);
} catch (error) {
  if (error.message.includes('invalid ciphertext')) {
    console.error('Invalid encrypted value');
  } else if (error.message.includes('gateway unavailable')) {
    console.error('FHEVM gateway is unavailable');
  } else {
    console.error('Decryption failed:', error);
  }
}
```

### Security Considerations

**Advantages**:
- ✅ No user interaction required
- ✅ Faster decryption
- ✅ Simpler implementation
- ✅ Works for public data

**Limitations**:
- ⚠️ Oracle knows plaintext value
- ⚠️ Less privacy than user decryption
- ⚠️ Depends on oracle availability
- ⚠️ Not suitable for sensitive data

### Use Cases

Use public decryption when:
- Decrypting public or semi-public data
- No user interaction possible
- Speed is priority over privacy
- Data is not sensitive

---

## Comparison

| Feature | User Decryption | Public Decryption |
|---------|----------------|-------------------|
| **Privacy** | Maximum - only user knows | Lower - oracle knows |
| **User Interaction** | Required (signature) | Not required |
| **Speed** | Slower | Faster |
| **Use Case** | Sensitive data | Public data |
| **Authorization** | EIP-712 signature | None |
| **Dependency** | User wallet | FHEVM gateway |

---

## Batch Decryption

Decrypt multiple values efficiently:

### User Batch Decryption

```typescript
const encrypted = [
  { data: '0x...', type: 'uint8' },
  { data: '0x...', type: 'uint16' },
  { data: '0x...', type: 'uint32' }
];

const decrypted = await Promise.all(
  encrypted.map(enc =>
    fhevm.userDecrypt(enc, contractAddress, userAddress)
  )
);

console.log('Decrypted values:', decrypted);
```

### Public Batch Decryption

```typescript
const encrypted = [
  { data: '0x...', type: 'uint8' },
  { data: '0x...', type: 'uint16' },
  { data: '0x...', type: 'uint32' }
];

const decrypted = await Promise.all(
  encrypted.map(enc => fhevm.publicDecrypt(enc))
);

console.log('Decrypted values:', decrypted);
```

---

## Type-Specific Decryption

Different encrypted types return different formats:

### Numeric Types

```typescript
// uint8, uint16, uint32, uint64, uint128, uint256
const encrypted = await fhevm.encrypt(42, 'uint8');
const decrypted = await fhevm.publicDecrypt(encrypted);
// Returns: number (42)

// int8, int16, int32, int64, int128, int256
const encryptedNeg = await fhevm.encrypt(-42, 'int8');
const decryptedNeg = await fhevm.publicDecrypt(encryptedNeg);
// Returns: number (-42)
```

### Boolean Type

```typescript
const encrypted = await fhevm.encrypt(1, 'bool');
const decrypted = await fhevm.publicDecrypt(encrypted);
// Returns: number (0 or 1)

const isTrue = decrypted === 1;
```

### Address Type

```typescript
const encrypted = await fhevm.encrypt('0x742d35Cc...', 'address');
const decrypted = await fhevm.publicDecrypt(encrypted);
// Returns: string (address)
```

### Bytes Type

```typescript
const encrypted = await fhevm.encrypt('0x123456', 'bytes');
const decrypted = await fhevm.publicDecrypt(encrypted);
// Returns: string (hex)
```

---

## Advanced Patterns

### Conditional Decryption

```typescript
function DecryptButton({ encrypted, isSensitive }) {
  const { userDecrypt, publicDecrypt, isDecrypting } = useFhevmDecrypt();
  const { account } = useAccount();

  const handleDecrypt = async () => {
    if (isSensitive) {
      // Use user decryption for sensitive data
      return await userDecrypt(encrypted, contractAddress, account);
    } else {
      // Use public decryption for non-sensitive data
      return await publicDecrypt(encrypted);
    }
  };

  return (
    <button onClick={handleDecrypt} disabled={isDecrypting}>
      Decrypt
    </button>
  );
}
```

### Caching Decrypted Values

```typescript
function CachedDecryption({ encrypted }) {
  const [decrypted, setDecrypted] = useState<number | null>(null);
  const { publicDecrypt } = useFhevmDecrypt();

  useEffect(() => {
    // Cache decrypted value to avoid repeated decryption
    const decrypt = async () => {
      if (!decrypted && encrypted) {
        const result = await publicDecrypt(encrypted);
        setDecrypted(result);
      }
    };
    decrypt();
  }, [encrypted, decrypted, publicDecrypt]);

  return <div>Value: {decrypted ?? 'Loading...'}</div>;
}
```

### Permission-Based Decryption

```typescript
async function smartDecrypt(encrypted, contractAddress, userAddress, userRole) {
  // Admin can decrypt without signature
  if (userRole === 'admin') {
    return await fhevm.publicDecrypt(encrypted);
  }

  // Regular users need signature
  return await fhevm.userDecrypt(encrypted, contractAddress, userAddress);
}
```

---

## Integration with Smart Contracts

### Contract-Controlled Decryption

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/TFHE.sol";

contract PrivateData {
    mapping(address => euint64) private balances;

    // Only user can decrypt their own balance
    function getMyBalance() public view returns (euint64) {
        return balances[msg.sender];
    }

    // Admin can decrypt any balance (use with caution!)
    function getBalanceOf(address user) public view onlyAdmin returns (euint64) {
        return balances[user];
    }
}
```

### Client-Side Decryption

```typescript
// Get encrypted balance from contract
const encryptedBalance = await contract.getMyBalance();

// Decrypt with user signature
const balance = await fhevm.userDecrypt(
  { data: encryptedBalance, type: 'uint64' },
  contractAddress,
  account
);

console.log('Your balance:', balance);
```

---

## Performance Optimization

### Minimize Decryption Calls

```typescript
// ❌ Bad - Multiple decryption calls
const value1 = await publicDecrypt(encrypted1);
const value2 = await publicDecrypt(encrypted2);
const value3 = await publicDecrypt(encrypted3);

// ✅ Good - Batch decryption
const [value1, value2, value3] = await Promise.all([
  publicDecrypt(encrypted1),
  publicDecrypt(encrypted2),
  publicDecrypt(encrypted3)
]);
```

### Cache Decrypted Values

```typescript
const decryptionCache = new Map();

async function cachedDecrypt(encrypted) {
  const key = encrypted.data;

  if (decryptionCache.has(key)) {
    return decryptionCache.get(key);
  }

  const decrypted = await fhevm.publicDecrypt(encrypted);
  decryptionCache.set(key, decrypted);
  return decrypted;
}
```

---

## Troubleshooting

### User Rejects Signature

```typescript
try {
  const decrypted = await userDecrypt(encrypted, contractAddress, account);
} catch (error) {
  if (error.code === 4001) {
    // User rejected signature
    alert('Please approve the signature to decrypt your data');
  }
}
```

### Gateway Unavailable

```typescript
try {
  const decrypted = await publicDecrypt(encrypted);
} catch (error) {
  if (error.message.includes('gateway')) {
    // Try again with exponential backoff
    await new Promise(resolve => setTimeout(resolve, 2000));
    return await publicDecrypt(encrypted);
  }
}
```

### Invalid Ciphertext

```typescript
try {
  const decrypted = await publicDecrypt(encrypted);
} catch (error) {
  if (error.message.includes('invalid ciphertext')) {
    console.error('Encrypted value is corrupted or invalid');
    // Handle invalid data
  }
}
```

---

## Best Practices

1. **Choose the Right Method**
   - Use `userDecrypt()` for sensitive data
   - Use `publicDecrypt()` for public or semi-public data

2. **Handle User Rejection**
   - Always catch signature rejection errors
   - Provide clear UI feedback
   - Allow users to retry

3. **Optimize Performance**
   - Batch decrypt multiple values
   - Cache decrypted values when appropriate
   - Minimize unnecessary decryption calls

4. **Security First**
   - Never expose decryption keys
   - Validate decrypted values
   - Use HTTPS for gateway communication

5. **User Experience**
   - Show loading states during decryption
   - Provide clear error messages
   - Allow users to cancel long operations

---

## Next Steps

- Learn about [Contract Interaction](./contracts.md)
- Explore [React Integration](./react.md)
- See [Examples](../examples/)

---

**Remember**: User decryption = Maximum Privacy | Public decryption = Convenience
