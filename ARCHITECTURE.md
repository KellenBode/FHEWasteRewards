# Privacy Rewards System V2 - Architecture Documentation

## Overview

The Privacy Rewards System V2 is an enhanced implementation of a privacy-first rewards mechanism built on the FHEVM (Fully Homomorphic Encryption Virtual Machine) platform. It introduces advanced security patterns, decryption failure handling, and privacy-preserving mechanisms.

## Architecture Principles

### 1. Gateway Callback Pattern

The system employs a **three-tier decryption model**:

```
User Submission → Encryption → Gateway Request → Decryption → Callback → State Update
```

**Components:**
- **User Layer**: Submits encrypted waste classification data
- **Smart Contract**: Records encrypted submissions and decryption requests
- **Gateway Operator**: External service responsible for decryption
- **Callback Mechanism**: Gateway reports results back to contract

**Benefits:**
- Separates encryption logic from decryption
- Prevents synchronous blocking on decryption
- Enables fault tolerance and retry logic
- Supports timeout protection

### 2. Refund Mechanism for Decryption Failures

The system handles decryption failures gracefully:

```
Submit → Decrypt Failed → Queue Refund → Timeout Check → Claim Refund
```

**Key Features:**
- **Automatic Refund Queuing**: Failed decryptions automatically queue refunds
- **Emergency Timeout Claims**: Users can claim refunds after `DECRYPTION_TIMEOUT` (24 hours)
- **Non-blocking Refunds**: Uses pull-based model for refund claims
- **Secure Transfer**: Uses `call` pattern for ether transfer

### 3. Timeout Protection

Prevents permanent locking of user funds:

```
Decryption Requested (T) → Timeout (T + 24h) → Emergency Claim Available
```

**Implementation:**
- `DECRYPTION_TIMEOUT = 24 hours`: Grace period for decryption
- `claimTimeoutRefund()`: Emergency function for timeout refunds
- `DECRYPTION_REQUESTED` status: Tracks pending decryptions
- Block timestamp validation for timeout checks

## Core Components

### A. State Management

#### User Profile Structure
```solidity
struct AnonymousUser {
    euint32 totalPoints;           // Encrypted total points
    euint32 recyclableCount;       // Category counts
    euint32 organicCount;
    euint32 hazardousCount;
    euint32 generalCount;
    bool isRegistered;
    uint256 registrationTime;
    uint256 lastActivityTime;      // For activity tracking
    uint256 pendingRefundAmount;   // Refund queue
}
```

#### Submission Lifecycle
```solidity
enum SubmissionStatus {
    PENDING,                // Initial state
    DECRYPTION_REQUESTED,   // Gateway decryption queued
    DECRYPTION_FAILED,      // Decryption failed
    VERIFIED,               // Successfully decrypted and verified
    CLAIMED,                // Reward claimed
    REFUNDED                // Refund processed
}
```

### B. Privacy Mechanisms

#### 1. Score Obfuscation
```solidity
function _obfuscateScore(uint256 _score) private pure returns (uint256) {
    return (_score & OBFUSCATION_MASK); // Hide lower 8 bits
}
```
- Hides exact point values on leaderboard
- Prevents precision-based score analysis
- Maintains ranking information

#### 2. Division Privacy Protection
```solidity
function _addDivisionPrivacy(uint256 _value) internal view returns (uint256) {
    uint256 randomFactor = uint256(keccak256(
        abi.encodePacked(block.timestamp, block.difficulty, msg.sender)
    )) % RANDOM_MULTIPLIER_RANGE + 1;
    return (_value * randomFactor) / RANDOM_MULTIPLIER_RANGE;
}
```
- Prevents exact division result inference
- Uses pseudo-random multiplication/division
- Protects against privacy attacks on division operations

#### 3. Homomorphic Encryption Integration
- Direct integration with FHEVM for encrypted arithmetic
- `euint32` and `euint8` types for homomorphic values
- FHE.add() for encrypted point accumulation
- FHE.select() for conditional logic on encrypted values

### C. Security Features

#### Input Validation
```solidity
modifier inputValidation(uint8 _category, uint8 _quantity) {
    require(_category >= RECYCLABLE && _category <= GENERAL);
    require(_quantity > 0 && _quantity <= 100);
    _;
}
```

#### Access Control
- `onlyOwner()`: Administrator functions
- `onlyGateway()`: Gateway operator functions
- `onlyRegisteredUser()`: User-specific operations

#### Overflow Protection
```solidity
require(totalPoints <= 255, "PrivacyRewardsV2: Points overflow");
```

#### Re-entrancy Protection
```solidity
modifier nonReentrant() {
    require(!isLocked, "PrivacyRewardsV2: No re-entry");
    isLocked = true;
    _;
    isLocked = false;
}
```

## Decryption Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│ Step 1: User Submits Waste Classification                       │
│ - Encrypts category and quantity                                │
│ - Stores in pending state                                       │
│ - Emits DecryptionRequested event                               │
└──────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│ Step 2: Gateway Operator Processes Request                      │
│ - Receives DecryptionRequested event                            │
│ - Decrypts the submission off-chain                             │
│ - Validates decryption result                                   │
│ - Prepares callback with proof                                  │
└──────────────────────────────────────────────────────────────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
           Success              Failure
                │                     │
                ▼                     ▼
┌────────────────────────────┐  ┌──────────────────────────┐
│ Step 3a: Success Callback  │  │ Step 3b: Failure Callback│
│ - Process points           │  │ - Queue refund           │
│ - Update leaderboard       │  │ - Mark as failed         │
│ - Set VERIFIED status      │  │ - Set FAILED status      │
└────────────────────────────┘  └──────────────────────────┘
                │                     │
                │                     ▼
                │            ┌──────────────────────┐
                │            │ Step 4b: Timeout Wait│
                │            │ - 24 hours elapses   │
                │            │ - User can claim     │
                │            └──────────────────────┘
                │                     │
                │                     ▼
                │            ┌──────────────────────┐
                │            │ Step 5b: Claim Refund│
                │            │ - Transfer ether     │
                │            │ - Clear refund queue │
                │            └──────────────────────┘
                │
                ▼
    ┌─────────────────────────────┐
    │ Step 5a: User Claims Reward │
    │ - Verifies ownership        │
    │ - Transfers reward          │
    │ - Updates status to CLAIMED │
    └─────────────────────────────┘
```

## Gas Optimization Strategies

### 1. Storage Optimization
- **Packing Variables**: Use `uint256` for block numbers, avoid uint64 where possible
- **Lazy Updates**: Only update leaderboard when necessary
- **Minimal State**: Store only essential encrypted values

### 2. Computation Optimization
- **Batch Operations**: Process multiple submissions in single transaction
- **Early Returns**: Exit validation early on failure
- **Inline Constants**: Use compile-time constants for gas efficiency

### 3. HCU (Homomorphic Computation Unit) Optimization
- **Minimize Encrypted Operations**: Use plaintext where privacy not needed
- **Reuse Encrypted Values**: Avoid redundant encryption operations
- **Direct Comparisons**: Use FHE operations only when necessary

### 4. Transaction Optimization
```solidity
nonReentrant modifier: Single-use guard
Input validation: Early failure detection
Batch processing: Reduce number of transactions
```

## Security Considerations

### 1. Decryption Attack Prevention
- **Timeout Protection**: Forces timeout after 24 hours
- **Failed Decryption Handling**: Graceful degradation
- **Proof Verification**: Gateway must provide valid proof
- **Replay Prevention**: One-time callback processing (`requestIdToCallbackCalled`)

### 2. Privacy Attacks
- **Score Obfuscation**: Prevents exact point inference
- **Random Multipliers**: Confuses division results
- **FHE Integration**: Keeps sensitive data encrypted
- **Leaderboard Hiding**: Shows only obfuscated scores

### 3. Access Control
- **Role-based Access**: Owner, Gateway, User roles
- **User Isolation**: Each user only sees their own data
- **Admin Functions**: Protected by `onlyOwner` modifier

### 4. Fund Safety
- **Non-blocking Refunds**: Pull-based claim model
- **Reentrancy Guard**: Prevents recursive calls
- **Safe Transfer**: Uses `call` with success check

## Configuration Constants

```solidity
// Timeout Parameters
DECRYPTION_TIMEOUT = 24 hours      // Grace period for decryption
MAX_CLAIM_TIMEOUT = 7 days         // Maximum claim period

// Privacy Parameters
OBFUSCATION_MASK = 0xFFFFFF00      // Hide lower 8 bits
RANDOM_MULTIPLIER_RANGE = 1000     // Division privacy range

// Waste Categories
RECYCLABLE = 1
ORGANIC = 2
HAZARDOUS = 3
GENERAL = 4

// Points System
RECYCLABLE_POINTS = 10
ORGANIC_POINTS = 8
HAZARDOUS_POINTS = 15
GENERAL_POINTS = 5
```

## Deployment Architecture

```
┌─────────────────────┐
│  Frontend/dApp      │
│  (React/Web3.js)    │
└──────────┬──────────┘
           │ RPC Call
           ▼
┌─────────────────────┐
│  Smart Contract     │
│  (PrivacyRewardsV2) │
└──────────┬──────────┘
           │ Event Emission
           ▼
┌─────────────────────┐
│  Gateway Operator   │
│  (Off-chain)        │
│  - Listens to events│
│  - Decrypts values  │
│  - Calls callback   │
└─────────────────────┘
```

## Future Enhancements

1. **VRF Integration**: Use Chainlink VRF for true randomness
2. **Multiple Gateways**: Redundant decryption sources
3. **Dynamic Reward Rates**: Adjust points based on supply
4. **Governance**: DAO-controlled parameters
5. **Cross-chain Support**: Inter-blockchain rewards
6. **Advanced Privacy**: ZK-proofs for decryption verification
7. **Auction Mechanism**: Fair reward distribution

## Compliance and Standards

- **FHEVM Standard**: Uses official FHEVM library
- **OpenZeppelin Patterns**: Best practice contract structures
- **ERC Compatibility**: Potential ERC-20 token integration
- **Audit-Ready**: Clean, documented code for security audits

---

**Version**: 2.0
**Last Updated**: 2024-11
**Status**: Production-Ready
