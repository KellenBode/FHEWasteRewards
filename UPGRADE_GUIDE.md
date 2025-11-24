# Privacy Rewards V2 - Upgrade Guide

## Overview

This guide walks you through the upgrade from the original Privacy Waste Rewards contract to the enhanced Privacy Rewards V2 contract, which includes refund mechanisms, timeout protection, and Gateway callback architecture.

## What's New in V2

### 1. **Gateway Callback Architecture**
   - **Feature**: Decoupled decryption with callback pattern
   - **Benefit**: Non-blocking decryption requests, fault tolerance
   - **Implementation**: `gatewayDecryptionCallback()` function

### 2. **Refund Mechanism**
   - **Feature**: Automatic refund queuing for failed decryptions
   - **Benefit**: User funds are protected
   - **Implementation**: `claimPendingRefund()` function

### 3. **Timeout Protection**
   - **Feature**: Emergency timeout claims after 24 hours
   - **Benefit**: Prevents permanent fund locks
   - **Implementation**: `claimTimeoutRefund()` function

### 4. **Privacy Enhancements**
   - **Feature**: Score obfuscation on leaderboard
   - **Feature**: Division privacy protection with random multipliers
   - **Benefit**: Enhanced privacy against attacks

### 5. **Improved Security**
   - **Feature**: Input validation modifiers
   - **Feature**: Non-reentrant protection
   - **Feature**: Role-based access control
   - **Feature**: Overflow protection

## Step-by-Step Upgrade Process

### Phase 1: Preparation

#### Step 1.1: Backup Current Deployment
```bash
# Save current deployment info
cp deployments/sepolia.json deployments/sepolia.backup.json

# Save current contract source
cp contracts/PrivacyWasteRewards.sol contracts/PrivacyWasteRewards.backup.sol
```

#### Step 1.2: Review New Contract
```bash
# Read the new contract documentation
cat ARCHITECTURE.md
cat API.md
```

#### Step 1.3: Set Up Gateway Operator
```bash
# Identify the address that will run Gateway decryption service
# This should be a secure, always-online service
export GATEWAY_OPERATOR_ADDRESS="0x..."
```

### Phase 2: Deployment

#### Step 2.1: Compile V2 Contract
```bash
npm run compile
```

Expected output:
```
Compiled 2 Solidity files successfully
```

#### Step 2.2: Deploy V2 Contract
```bash
# Create deployment script
cat > scripts/deployV2.js << 'EOF'
const hre = require("hardhat");

async function main() {
  const gatewayOperator = process.env.GATEWAY_OPERATOR_ADDRESS;

  if (!gatewayOperator || gatewayOperator === "0x") {
    throw new Error("GATEWAY_OPERATOR_ADDRESS not set in environment");
  }

  console.log("Deploying PrivacyRewardsV2...");
  console.log("Gateway Operator:", gatewayOperator);

  const contract = await hre.ethers.deployContract("PrivacyRewardsV2", [
    gatewayOperator,
  ]);

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("✓ PrivacyRewardsV2 deployed to:", address);

  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    contract: "PrivacyRewardsV2",
    address: address,
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId,
    gatewayOperator: gatewayOperator,
    deploymentTime: new Date().toISOString(),
  };

  fs.writeFileSync(
    "deployments/sepolia-v2.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment info saved to deployments/sepolia-v2.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
EOF

# Run deployment
node scripts/deployV2.js
```

#### Step 2.3: Verify Deployment
```bash
# Update hardhat.config.js to include V2 in verification
# Then verify with:
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <GATEWAY_ADDRESS>
```

### Phase 3: Testing

#### Step 3.1: Run Unit Tests
```bash
# Test the V2 contract locally
npm run test -- test/PrivacyRewardsV2.test.js
```

Expected output:
```
✓ Deployment & Initialization (6 tests)
✓ User Registration (9 tests)
✓ Waste Classification Submission (12 tests)
✓ View Functions (6 tests)
✓ Leaderboard (4 tests)
✓ Refund Mechanism (2 tests)
✓ Gateway Callback (2 tests)
✓ Access Control (6 tests)
✓ Gas Optimization (2 tests)
✓ Integration Scenarios (2 tests)

Total: 51 tests passing
```

#### Step 3.2: Test Gateway Integration
```bash
# Create a test gateway service
cat > scripts/testGateway.js << 'EOF'
const hre = require("hardhat");
const fs = require("fs");

async function testGatewayFlow() {
  const deploymentInfo = JSON.parse(
    fs.readFileSync("deployments/sepolia-v2.json", "utf8")
  );
  const contractAddress = deploymentInfo.address;

  console.log("Testing Gateway Integration...");
  console.log("Contract:", contractAddress);

  // Listen for DecryptionRequested events
  const contract = await hre.ethers.getContractAt(
    "PrivacyRewardsV2",
    contractAddress
  );

  contract.on("DecryptionRequested", async (userId, submissionId, requestId) => {
    console.log(`Decryption requested: ${requestId}`);
    console.log(`User ID: ${userId}, Submission ID: ${submissionId}`);

    // Simulate off-chain decryption
    const decryptedValue = 50; // Example decrypted points
    const success = true;

    console.log(`Calling gateway callback...`);
    // Note: This would be called by the actual gateway service
  });

  // Keep listening
  await new Promise(resolve => setTimeout(resolve, 300000)); // 5 minutes
}

testGatewayFlow().catch(console.error);
EOF

# Run test
node scripts/testGateway.js
```

#### Step 3.3: Simulate User Flow
```bash
cat > scripts/simulateV2.js << 'EOF'
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const deploymentInfo = JSON.parse(
    fs.readFileSync("deployments/sepolia-v2.json", "utf8")
  );

  const [deployer] = await hre.ethers.getSigners();
  const contract = await hre.ethers.getContractAt(
    "PrivacyRewardsV2",
    deploymentInfo.address
  );

  console.log("=== Privacy Rewards V2 Simulation ===\n");

  // Test 1: User Registration
  console.log("1. Registering user...");
  let tx = await contract.registerAnonymousUser();
  await tx.wait();
  console.log("✓ User registered\n");

  // Test 2: Check User ID
  console.log("2. Getting user ID...");
  const userId = await contract.getMyUserId();
  console.log(`✓ User ID: ${userId}\n`);

  // Test 3: Submit Waste
  console.log("3. Submitting waste classification...");
  tx = await contract.submitWasteClassification(1, 5); // Recyclable, 5 items
  const receipt = await tx.wait();
  console.log("✓ Waste submitted\n");

  // Test 4: Check Submission Count
  console.log("4. Checking submission count...");
  const count = await contract.getMySubmissionCount();
  console.log(`✓ Submission count: ${count}\n`);

  // Test 5: View Leaderboard
  console.log("5. Viewing leaderboard...");
  const leaderboard = await contract.getLeaderboard();
  console.log(`✓ Leaderboard users: ${leaderboard.userIds.length}\n`);

  // Test 6: Check Pending Refund
  console.log("6. Checking pending refund...");
  const refund = await contract.getPendingRefund();
  console.log(`✓ Pending refund: ${refund} wei\n`);

  console.log("=== All tests completed ===");
}

main().catch(console.error);
EOF

node scripts/simulateV2.js
```

### Phase 4: Migration

#### Step 4.1: User Communication
```markdown
# Notify Users About V2 Upgrade

## Breaking Changes
None. V2 is backward compatible with V1 where possible.

## New Features Available
- Automatic refund handling for failed decryptions
- Timeout protection (24-hour grace period)
- Enhanced privacy features
- Improved access control

## New Functions to Use
- `gatewayDecryptionCallback()` - Gateway operator use only
- `claimPendingRefund()` - Claim failed decryption refunds
- `claimTimeoutRefund()` - Emergency timeout claims
- `setGatewayOperator()` - Update gateway operator
```

#### Step 4.2: Gradual Rollout (Optional)
If you want to run both versions in parallel:

```solidity
// In your interface contract:
address public v1Contract = "0x...";
address public v2Contract = "0x...";

function submitToV2(uint8 category, uint8 quantity) external {
  // New submissions go to V2
  IPrivacyRewardsV2(v2Contract).submitWasteClassification(category, quantity);
}

function claimFromV1() external {
  // Still support V1 claims
  IPrivacyRewardsV1(v1Contract).claimReward(0);
}
```

#### Step 4.3: Deprecate V1 (Optional)
```solidity
// In V1 contract, emit deprecation events:
event V1Deprecated(string message);

function submitWasteClassification(uint8 _category, uint8 _quantity) external {
  emit V1Deprecated("Please use V2: https://sepolia.etherscan.io/address/0x...");
  // Revert to force migration
  revert("V1 is deprecated. Please use V2.");
}
```

### Phase 5: Gateway Operator Setup

#### Step 5.1: Deploy Gateway Service
The gateway operator must be a service that:

1. **Listens for Events**
```javascript
contract.on("DecryptionRequested", async (userId, submissionId, requestId) => {
  // Process decryption request
});
```

2. **Performs Decryption**
```javascript
// Decrypt the submitted values
const decryptedValue = await performDecryption(encryptedData);
```

3. **Calls Callback**
```javascript
await contract.gatewayDecryptionCallback(requestId, decryptedValue, true);
```

#### Step 5.2: Security Considerations
- **Fund Management**: Gateway doesn't hold user funds
- **Rate Limiting**: Implement request throttling
- **Logging**: Log all decryption attempts
- **Monitoring**: Alert on failures
- **Redundancy**: Consider backup gateway operators

```javascript
// Example: Multiple gateway operators
const gateways = [
  "0x...", // Primary gateway
  "0x...", // Secondary gateway
];

// Update to new gateway if primary fails:
await contract.setGatewayOperator(gateways[1]);
```

### Phase 6: Monitoring

#### Step 6.1: Set Up Event Monitoring
```javascript
// Monitor DecryptionRequested events
contract.on("DecryptionRequested", (userId, submissionId, requestId) => {
  console.log(`Request: ${requestId}`);
  metrics.decryptionRequests++;
});

// Monitor PointsAwarded events
contract.on("PointsAwarded", (userId, points) => {
  console.log(`User ${userId} awarded ${points} points`);
  metrics.pointsAwarded += points;
});

// Monitor RefundProcessed events
contract.on("RefundProcessed", (userId, amount) => {
  console.log(`Refund to ${userId}: ${amount} wei`);
  metrics.refundsProcessed++;
});
```

#### Step 6.2: Create Health Check
```bash
#!/bin/bash

# Check contract is responsive
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_call","params":[...],"id":1}'

# Check gateway operator is set
npx hardhat run --network sepolia << 'EOF'
const contract = await ethers.getContractAt("PrivacyRewardsV2", "0x...");
const gateway = await contract.gatewayOperator();
console.log("Gateway:", gateway);
EOF
```

## Rollback Procedure

If issues arise, you can rollback:

```bash
# 1. Stop directing traffic to V2
# 2. Update frontend to use V1 contract address
# 3. Restore from backup:
cp deployments/sepolia.backup.json deployments/sepolia.json

# 4. Notify users
# 5. Investigate and fix issues
# 6. Redeploy V2 when ready
```

## Testing Checklist

Before going live:

- [ ] Contract compiles without errors
- [ ] All 51 tests pass locally
- [ ] V2 deployed to testnet
- [ ] V2 contract verified on Etherscan
- [ ] Gateway integration tested
- [ ] User simulation successful
- [ ] Gas costs acceptable
- [ ] Event monitoring set up
- [ ] Monitoring dashboard created
- [ ] Rollback procedure documented
- [ ] User communication sent
- [ ] Gateway operator ready

## Troubleshooting

### Issue: Callback fails with "Callback already processed"
**Solution**: Ensure gateway operator isn't sending duplicate callbacks. Implement idempotency.

### Issue: Users can't claim pending refunds
**Solution**: Check if refunds were properly queued. Query `getPendingRefund()`.

### Issue: Gateway operator not authorized
**Solution**: Verify `gatewayOperator` is set correctly with `contract.gatewayOperator()`.

### Issue: Timeout claims fail
**Solution**: Ensure 24 hours have passed. Check submission status first.

## Support

For issues or questions:
1. Check ARCHITECTURE.md for design details
2. Check API.md for function specifications
3. Review test cases in test/PrivacyRewardsV2.test.js
4. Check event logs for detailed transaction info

---

**Version**: 2.0
**Status**: Production-Ready
**Last Updated**: 2024-11
