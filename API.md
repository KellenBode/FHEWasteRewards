# Privacy Rewards System V2 - API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Core Functions](#core-functions)
3. [View Functions](#view-functions)
4. [Admin Functions](#admin-functions)
5. [Gateway Functions](#gateway-functions)
6. [Events](#events)
7. [Error Handling](#error-handling)
8. [Usage Examples](#usage-examples)

---

## Overview

The Privacy Rewards V2 contract provides a fully encrypted rewards system for waste classification. This document describes all public interfaces and their expected behavior.

### Base Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| Network | Sepolia | Test network for deployment |
| Solidity Version | 0.8.24 | Compiler version |
| FHE Library | @fhevm/solidity | Encryption library |
| License | MIT | Open source license |

---

## Core Functions

### registerAnonymousUser

Registers a new anonymous user in the system.

**Signature:**
```solidity
function registerAnonymousUser() external returns (uint32)
```

**Parameters:** None

**Returns:**
- `uint32`: The newly assigned user ID

**Requirements:**
- Caller must not be already registered
- Address must have 0 user ID

**Example:**
```javascript
const tx = await contract.registerAnonymousUser();
const receipt = await tx.wait();
const userId = receipt.events.find(e => e.event === 'UserRegistered').args.userId;
```

**Gas Cost:** ~150,000 (includes FHE initialization)

---

### submitWasteClassification

Submits a waste classification with encrypted data.

**Signature:**
```solidity
function submitWasteClassification(
    uint8 _category,
    uint8 _quantity
) external onlyRegisteredUser inputValidation(_category, _quantity) nonReentrant
```

**Parameters:**
| Name | Type | Description | Validation |
|------|------|-------------|------------|
| `_category` | `uint8` | Waste category (1-4) | Must be 1-4 |
| `_quantity` | `uint8` | Quantity of waste items | 1-100 |

**Category Values:**
| Value | Name | Points |
|-------|------|--------|
| 1 | RECYCLABLE | 10 |
| 2 | ORGANIC | 8 |
| 3 | HAZARDOUS | 15 |
| 4 | GENERAL | 5 |

**Events Emitted:**
- `WasteClassified(userId, submissionId)`
- `DecryptionRequested(userId, submissionId, requestId)`

**Gas Cost:** ~200,000

---

### claimPendingRefund

Claims any accumulated refund from failed decryptions.

**Signature:**
```solidity
function claimPendingRefund() external onlyRegisteredUser nonReentrant
```

**Requirements:**
- User must have pending refund amount > 0

**Events Emitted:**
- `RefundProcessed(userId, amount)`

**Gas Cost:** ~50,000

---

### claimTimeoutRefund

Claims emergency refund for timed-out decryption requests.

**Signature:**
```solidity
function claimTimeoutRefund(uint256 _submissionId) external onlyRegisteredUser nonReentrant
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `_submissionId` | `uint256` | The submission ID to claim refund for |

**Requirements:**
- Submission must be in `DECRYPTION_REQUESTED` status
- 24 hours must have elapsed since request time

**Events Emitted:**
- `TimeoutTriggered(userId, submissionId)`

**Gas Cost:** ~45,000

---

## View Functions

### getMyEncryptedStats

Returns the user's encrypted statistics.

**Signature:**
```solidity
function getMyEncryptedStats() external view onlyRegisteredUser returns (
    euint32 totalPoints,
    euint32 recyclableCount,
    euint32 organicCount,
    euint32 hazardousCount,
    euint32 generalCount
)
```

**Returns:**
| Name | Type | Description |
|------|------|-------------|
| `totalPoints` | `euint32` | Encrypted total points |
| `recyclableCount` | `euint32` | Encrypted recyclable count |
| `organicCount` | `euint32` | Encrypted organic count |
| `hazardousCount` | `euint32` | Encrypted hazardous count |
| `generalCount` | `euint32` | Encrypted general count |

**Note:** Returned values are encrypted and require FHE decryption.

---

### getMySubmission

Returns details for a specific submission.

**Signature:**
```solidity
function getMySubmission(uint256 _submissionId) external view onlyRegisteredUser returns (
    euint8 category,
    euint8 quantity,
    euint8 points,
    uint256 timestamp,
    SubmissionStatus status,
    uint256 decryptionRequestId
)
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `_submissionId` | `uint256` | The submission ID to query |

**Returns:**
| Name | Type | Description |
|------|------|-------------|
| `category` | `euint8` | Encrypted waste category |
| `quantity` | `euint8` | Encrypted quantity |
| `points` | `euint8` | Encrypted points earned |
| `timestamp` | `uint256` | Submission timestamp |
| `status` | `SubmissionStatus` | Current status |
| `decryptionRequestId` | `uint256` | Associated request ID |

---

### getLeaderboard

Returns the privacy-preserving leaderboard.

**Signature:**
```solidity
function getLeaderboard() external view returns (
    uint32[] memory userIds,
    uint256[] memory obfuscatedPoints,
    uint256[] memory lastActivities
)
```

**Returns:**
| Name | Type | Description |
|------|------|-------------|
| `userIds` | `uint32[]` | Array of user IDs |
| `obfuscatedPoints` | `uint256[]` | Obfuscated point values |
| `lastActivities` | `uint256[]` | Last activity timestamps |

---

### getMySubmissionCount

Returns the number of submissions for the caller.

**Signature:**
```solidity
function getMySubmissionCount() external view onlyRegisteredUser returns (uint256)
```

**Returns:**
- `uint256`: Total number of submissions

---

### getMyUserId

Returns the user ID for the caller.

**Signature:**
```solidity
function getMyUserId() external view returns (uint32)
```

**Returns:**
- `uint32`: User ID (0 if not registered)

---

### getPublicStats

Returns public statistics about the system.

**Signature:**
```solidity
function getPublicStats() external view returns (
    uint32 totalUsers,
    uint256 totalSubmissions
)
```

**Returns:**
| Name | Type | Description |
|------|------|-------------|
| `totalUsers` | `uint32` | Total registered users |
| `totalSubmissions` | `uint256` | Total submissions |

---

### getPendingRefund

Returns the pending refund amount for the caller.

**Signature:**
```solidity
function getPendingRefund() external view onlyRegisteredUser returns (uint256)
```

**Returns:**
- `uint256`: Pending refund amount in wei

---

## Admin Functions

### setGatewayOperator

Updates the gateway operator address.

**Signature:**
```solidity
function setGatewayOperator(address _newOperator) external onlyOwner
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `_newOperator` | `address` | New gateway operator address |

**Requirements:**
- Caller must be owner
- New operator cannot be zero address

---

### pause / unpause

Emergency pause/unpause functions.

**Signature:**
```solidity
function pause() external onlyOwner
function unpause() external onlyOwner
```

**Requirements:**
- Caller must be owner

---

## Gateway Functions

### gatewayDecryptionCallback

Callback function for gateway to report decryption results.

**Signature:**
```solidity
function gatewayDecryptionCallback(
    uint256 _requestId,
    uint32 _decryptedValue,
    bool _success
) external onlyGateway
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `_requestId` | `uint256` | Request ID from DecryptionRequested event |
| `_decryptedValue` | `uint32` | Decrypted points value |
| `_success` | `bool` | Whether decryption succeeded |

**Requirements:**
- Caller must be gateway operator
- Callback must not have been called for this request
- Request must be in PENDING status

**Events Emitted:**
- `GatewayCallbackReceived(requestId, decryptedValue)`
- `PointsAwarded(userId, points)` (on success)
- `DecryptionFailed(userId, submissionId)` (on failure)

---

## Events

### UserRegistered

Emitted when a new user registers.

```solidity
event UserRegistered(uint32 indexed userId, uint256 timestamp);
```

### WasteClassified

Emitted when waste classification is submitted.

```solidity
event WasteClassified(uint32 indexed userId, uint256 submissionId);
```

### PointsAwarded

Emitted when points are awarded to a user.

```solidity
event PointsAwarded(uint32 indexed userId, uint8 points);
```

### RewardClaimed

Emitted when a reward is claimed.

```solidity
event RewardClaimed(uint32 indexed userId, uint256 amount);
```

### LeaderboardUpdated

Emitted when leaderboard is updated.

```solidity
event LeaderboardUpdated(uint32 indexed userId);
```

### DecryptionRequested

Emitted when decryption is requested via Gateway.

```solidity
event DecryptionRequested(uint32 indexed userId, uint256 indexed submissionId, uint256 requestId);
```

### DecryptionFailed

Emitted when decryption fails.

```solidity
event DecryptionFailed(uint32 indexed userId, uint256 indexed submissionId);
```

### RefundProcessed

Emitted when refund is processed.

```solidity
event RefundProcessed(uint32 indexed userId, uint256 amount);
```

### TimeoutTriggered

Emitted when timeout is triggered for a submission.

```solidity
event TimeoutTriggered(uint32 indexed userId, uint256 indexed submissionId);
```

### GatewayCallbackReceived

Emitted when gateway callback is received.

```solidity
event GatewayCallbackReceived(uint256 indexed requestId, uint32 decryptedValue);
```

---

## Error Handling

### Custom Error Messages

| Error | Description |
|-------|-------------|
| `PrivacyRewardsV2: Not authorized` | Caller is not owner |
| `PrivacyRewardsV2: Not gateway operator` | Caller is not gateway |
| `PrivacyRewardsV2: User not registered` | User must be registered |
| `PrivacyRewardsV2: Invalid waste category` | Category out of range |
| `PrivacyRewardsV2: Invalid quantity` | Quantity out of range |
| `PrivacyRewardsV2: No re-entry` | Reentrancy detected |
| `PrivacyRewardsV2: User already registered` | Duplicate registration |
| `PrivacyRewardsV2: Points overflow` | Points exceed maximum |
| `PrivacyRewardsV2: Callback already processed` | Duplicate callback |
| `PrivacyRewardsV2: Invalid request status` | Wrong request state |
| `PrivacyRewardsV2: Invalid decrypted value` | Value out of range |
| `PrivacyRewardsV2: No pending refund` | No refund available |
| `PrivacyRewardsV2: Not pending` | Wrong submission state |
| `PrivacyRewardsV2: Not yet timed out` | Timeout not reached |
| `PrivacyRewardsV2: Invalid submission ID` | Submission not found |
| `PrivacyRewardsV2: Refund transfer failed` | ETH transfer failed |
| `PrivacyRewardsV2: Invalid gateway operator` | Zero address gateway |
| `PrivacyRewardsV2: Invalid operator` | Zero address operator |

---

## Usage Examples

### JavaScript/ethers.js

#### Register User
```javascript
const contract = new ethers.Contract(address, abi, signer);
const tx = await contract.registerAnonymousUser();
await tx.wait();
console.log("User registered");
```

#### Submit Waste Classification
```javascript
// Submit recyclable waste
const tx = await contract.submitWasteClassification(1, 5);
await tx.wait();
```

#### Listen for Events
```javascript
contract.on("DecryptionRequested", (userId, submissionId, requestId) => {
    console.log(`Decryption requested: ${requestId}`);
});

contract.on("PointsAwarded", (userId, points) => {
    console.log(`User ${userId} awarded ${points} points`);
});
```

#### Check Pending Refund
```javascript
const refund = await contract.getPendingRefund();
if (refund > 0) {
    const tx = await contract.claimPendingRefund();
    await tx.wait();
}
```

### Gateway Operator Integration

#### Listen for Decryption Requests
```javascript
contract.on("DecryptionRequested", async (userId, submissionId, requestId) => {
    try {
        // Perform off-chain decryption
        const decryptedValue = await performDecryption(requestId);

        // Report success
        const tx = await gatewayContract.gatewayDecryptionCallback(
            requestId,
            decryptedValue,
            true
        );
        await tx.wait();
    } catch (error) {
        // Report failure
        const tx = await gatewayContract.gatewayDecryptionCallback(
            requestId,
            0,
            false
        );
        await tx.wait();
    }
});
```

---

## Rate Limits and Constraints

| Constraint | Value | Description |
|------------|-------|-------------|
| Max Quantity | 100 | Maximum waste quantity per submission |
| Min Quantity | 1 | Minimum waste quantity |
| Decryption Timeout | 24 hours | Timeout for decryption |
| Max Claim Timeout | 7 days | Maximum claim period |
| Points Range | 0-255 | Valid points range |

---

## Best Practices

1. **Always check registration** before calling user functions
2. **Listen for events** to track transaction progress
3. **Handle timeouts** by implementing retry logic
4. **Batch operations** where possible to save gas
5. **Verify callback results** in gateway integration
6. **Monitor refund queue** for failed decryptions

---

**Version**: 2.0
**Last Updated**: 2024-11
