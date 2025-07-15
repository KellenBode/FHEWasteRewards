# Privacy Waste Rewards - Deployment Guide

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Deployment Process](#deployment-process)
- [Contract Verification](#contract-verification)
- [Interaction](#interaction)
- [Testing & Simulation](#testing--simulation)
- [Deployed Contract Information](#deployed-contract-information)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying the Privacy Waste Rewards contract, ensure you have:

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: Latest version
- **Wallet**: MetaMask or similar Web3 wallet
- **Testnet ETH**: Sepolia testnet ETH for deployment
- **API Keys**:
  - Etherscan API key (for contract verification)
  - RPC provider URL (Alchemy, Infura, or public RPC)

---

## Installation

### 1. Clone or Navigate to Project Directory

```bash
cd D:\
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- Hardhat development framework
- Ethers.js v6
- FHE Solidity library
- Hardhat plugins (verification, testing tools)

### 3. Verify Installation

```bash
npx hardhat --version
```

Expected output:
```
Hardhat version 2.19.4
```

---

## Configuration

### 1. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

### 2. Configure `.env` File

Edit `.env` and add your credentials:

```env
# Network Configuration
SEPOLIA_RPC_URL=https://rpc.sepolia.org
# Or use Alchemy/Infura:
# SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY

# Private Key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Etherscan API Key
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

⚠️ **Security Warning**:
- Never commit `.env` file to version control
- Keep your private keys secure
- Use test wallets for testnet deployments

### 3. Get Testnet ETH

For Sepolia testnet, get free ETH from:
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)

You'll need approximately 0.1-0.2 ETH for deployment.

---

## Deployment Process

### 1. Compile Contracts

First, compile the smart contracts:

```bash
npm run compile
```

Expected output:
```
Compiled 1 Solidity file successfully
```

### 2. Deploy to Sepolia Testnet

```bash
npm run deploy
```

The deployment script will:
1. Connect to Sepolia network
2. Deploy the PrivacyWasteRewards contract
3. Save deployment information to `deployments/sepolia.json`
4. Display contract address and transaction details

Example output:
```
===========================================
🚀 Privacy Waste Rewards Deployment
===========================================

📋 Deployment Information:
  Deployer address: 0x1234...5678
  Account balance: 0.15 ETH
  Network: sepolia
  Chain ID: 11155111

📦 Deploying PrivacyWasteRewards contract...

⏳ Deployment in progress...

✅ Contract deployed successfully!
===========================================
📍 Contract Address: 0xABCD...EF01
===========================================

📊 Deployment Transaction Details:
  Transaction Hash: 0x789...abc
  Block Number: 4567890
  Gas Used: 2500000

👤 Contract Owner: 0x1234...5678

💾 Deployment info saved to: deployments/sepolia.json

🔍 Verify contract on Etherscan:
  npx hardhat verify --network sepolia 0xABCD...EF01

🌐 View on Etherscan:
  https://sepolia.etherscan.io/address/0xABCD...EF01
```

### 3. Deploy to Local Network (Optional)

For local testing:

```bash
# Terminal 1: Start local Hardhat node
npm run node

# Terminal 2: Deploy to local network
npm run deploy:local
```

---

## Contract Verification

After deployment, verify the contract on Etherscan:

```bash
npm run verify
```

The verification script will:
1. Read deployment information from `deployments/sepolia.json`
2. Submit contract source code to Etherscan
3. Update deployment file with verification status

Example output:
```
===========================================
🔍 Contract Verification on Etherscan
===========================================

📋 Verification Information:
  Network: sepolia
  Contract Address: 0xABCD...EF01
  Contract Name: PrivacyWasteRewards

⏳ Verifying contract on Etherscan...

✅ Contract verified successfully!
===========================================
🌐 View Verified Contract:
  https://sepolia.etherscan.io/address/0xABCD...EF01#code
===========================================

💾 Verification status updated in deployment file
```

---

## Interaction

### Interactive CLI

Run the interactive contract interface:

```bash
npm run interact
```

Available actions:
1. **View Contract Info** - Display contract statistics
2. **Register Anonymous User** - Create anonymous account
3. **Submit Waste Classification** - Submit waste data
4. **View My Stats** - See encrypted statistics
5. **View My Submissions** - Check submission history
6. **View Leaderboard** - See privacy-preserving rankings
7. **Claim Reward** - Redeem earned points
8. **View Public Stats** - Platform-wide statistics
9. **Get My User ID** - Retrieve your anonymous ID

Example session:
```
===========================================
🎮 Privacy Waste Rewards - Interactive Menu
===========================================

📋 Available Actions:
  1. View Contract Info
  2. Register Anonymous User
  3. Submit Waste Classification
  ...

Select an option: 2

🆕 Registering Anonymous User...
⏳ Transaction sent: 0x123...
✅ User registered successfully!
   Gas used: 250000
   Your User ID: 1
```

---

## Testing & Simulation

### Run Automated Simulation

Execute comprehensive simulation scenarios:

```bash
npm run simulate
```

The simulation will:
1. ✅ Check/register user
2. ✅ Submit multiple waste classifications
3. ✅ Retrieve encrypted statistics
4. ✅ View submission history
5. ✅ Check leaderboard
6. ✅ View public statistics
7. ✅ Attempt reward claim

Example output:
```
===========================================
🎮 Privacy Waste Rewards - Simulation
===========================================

Scenario 1: User Registration Check
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ User registered successfully!
   New User ID: 1

Scenario 2: Multiple Waste Submissions
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
♻️  Submitting Recyclable waste (5 items)...
   ✅ Submitted successfully!
...

✅ Simulation Complete!
```

### Run Contract Tests

Create test files in `test/` directory and run:

```bash
npm test
```

---

## Deployed Contract Information

### Current Deployment (Sepolia Testnet)

**Contract Name**: PrivacyWasteRewards

**Contract Address**: `0x8EAB26B5C6E8Efe05D30b479C483802D2Ab15c14`

**Network**: Sepolia Testnet

**Chain ID**: 11155111

**Etherscan Link**: [View on Etherscan](https://sepolia.etherscan.io/address/0x8EAB26B5C6E8Efe05D30b479C483802D2Ab15c14)

**Deployment Date**: Check `deployments/sepolia.json`

### Contract Features

- **Anonymous Registration**: Zero-knowledge user registration
- **Encrypted Waste Tracking**: FHE-based privacy-preserving data
- **Point System**: Reward points for different waste categories
  - Recyclable: 10 points/item
  - Organic: 8 points/item
  - Hazardous: 15 points/item
  - General: 5 points/item
- **Privacy-Preserving Leaderboard**: Compete anonymously
- **Reward Tiers**: Bronze, Silver, Gold, Platinum

### Key Functions

```solidity
// User Management
registerAnonymousUser() returns (uint32)
getMyUserId() returns (uint32)

// Waste Submission
submitWasteClassification(uint8 category, uint8 quantity)

// Data Retrieval (Encrypted)
getMyEncryptedStats() returns (...)
getMySubmission(uint256 submissionId) returns (...)
getMySubmissionCount() returns (uint256)

// Leaderboard
getLeaderboard() returns (...)

// Rewards
claimReward(uint32 rewardTier)

// Public Stats
getPublicStats() returns (uint32 totalUsers, uint256 totalSubmissions)
```

---

## Troubleshooting

### Common Issues

#### 1. Deployment Fails - Insufficient Funds

**Error**: `insufficient funds for gas`

**Solution**:
- Check wallet balance: Need at least 0.1 ETH
- Get testnet ETH from faucets listed above
- Verify correct network in MetaMask

#### 2. Verification Fails - Invalid API Key

**Error**: `Invalid API Key`

**Solution**:
- Get Etherscan API key from [etherscan.io/myapikey](https://etherscan.io/myapikey)
- Add to `.env` file: `ETHERSCAN_API_KEY=your_key`
- Ensure no extra spaces in `.env` file

#### 3. RPC Connection Issues

**Error**: `could not detect network`

**Solution**:
- Check RPC URL in `.env` file
- Try alternative RPC providers (Alchemy, Infura)
- Verify network connectivity

#### 4. Contract Already Deployed

**Error**: `already deployed`

**Solution**:
- Use different deployer address
- Deploy to different network
- Or interact with existing deployment

#### 5. FHE Library Import Issues

**Error**: `Cannot find module '@fhevm/solidity'`

**Solution**:
```bash
npm install @fhevm/solidity --save
npm run compile
```

#### 6. Transaction Timeout

**Error**: `timeout exceeded`

**Solution**:
- Increase gas limit in transaction
- Wait for network congestion to clear
- Try again with higher gas price

### Getting Help

If you encounter issues not listed here:

1. **Check Logs**: Review error messages carefully
2. **Verify Configuration**: Ensure `.env` is correctly configured
3. **Network Status**: Check if network is operational
4. **Documentation**: Review contract comments and function docs
5. **Community**: Seek help from blockchain development communities

---

## Additional Commands

```bash
# Clean build artifacts
npm run clean

# Compile contracts only
npm run compile

# Run local node
npm run node

# Deploy to local network
npm run deploy:local

# Run specific script
npx hardhat run scripts/your-script.js --network sepolia
```

---

## Security Best Practices

1. ✅ Never share private keys
2. ✅ Use separate wallets for testnet/mainnet
3. ✅ Verify contract addresses before interaction
4. ✅ Keep `.env` file secure and gitignored
5. ✅ Audit contracts before mainnet deployment
6. ✅ Test thoroughly on testnet first
7. ✅ Monitor contract activity on Etherscan

---

## Next Steps

After successful deployment:

1. ✅ Verify contract on Etherscan
2. ✅ Test all contract functions via interact script
3. ✅ Run simulation to ensure proper operation
4. ✅ Update frontend configuration with contract address
5. ✅ Document any custom deployment parameters
6. ✅ Set up monitoring for contract events

---

## Resources

- **Hardhat Documentation**: https://hardhat.org/docs
- **Ethers.js Documentation**: https://docs.ethers.org/v6/
- **Sepolia Testnet**: https://sepolia.dev/
- **Etherscan**: https://sepolia.etherscan.io/
- **FHE Library**: https://docs.zama.ai/fhevm

---

*Built with privacy-first principles for sustainable environmental action* 🌱🔐
