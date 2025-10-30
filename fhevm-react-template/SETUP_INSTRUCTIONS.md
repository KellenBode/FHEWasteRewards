# 🚀 Setup Instructions - Privacy Waste Rewards

**Complete setup guide for judges and developers**

---

## 📋 Prerequisites

### Required Software

- **Node.js**: v18.x or v20.x ([Download](https://nodejs.org/))
- **npm**: v8.x or higher (comes with Node.js)
- **Git**: Latest version ([Download](https://git-scm.com/))
- **MetaMask**: Browser extension ([Install](https://metamask.io/))

### Required Accounts

- **Sepolia ETH**: Get from [Sepolia Faucet](https://sepoliafaucet.com/)
- **Etherscan API Key**: Sign up at [Etherscan.io](https://etherscan.io/register)
- **CoinMarketCap API** (optional): For gas price in USD

### System Requirements

- **OS**: Windows 10/11, macOS 10.15+, or Linux
- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 500MB for dependencies

---

## 🔧 Quick Setup (5 Minutes)

### Step 1: Clone Repository

```bash
# Clone the repository
git clone https://github.com/YourUsername/privacy-waste-rewards.git
cd privacy-waste-rewards

# Verify Node.js version
node --version  # Should be v18.x or v20.x
npm --version   # Should be v8.x or higher
```

### Step 2: Install Dependencies

```bash
# Install all dependencies
npm install

# Verify installation
npm list --depth=0
```

**Expected output**: All packages installed without errors

### Step 3: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values
# Use notepad, vim, or your preferred editor
```

**Required .env values**:

```env
# Network (use default for Sepolia)
SEPOLIA_RPC_URL=https://rpc.sepolia.org

# Your wallet private key (NEVER commit this!)
PRIVATE_KEY=your_64_character_private_key_here

# Etherscan API (for contract verification)
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Optional: CoinMarketCap (for USD gas prices)
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key_here
```

### Step 4: Compile Contracts

```bash
# Compile smart contracts
npm run compile

# Verify compilation
ls artifacts/contracts/PrivacyWasteRewards.sol/
```

**Expected**: `PrivacyWasteRewards.json` file created

### Step 5: Run Tests

```bash
# Run all tests
npm test

# Expected: 50 tests passing
```

**Success criteria**: All tests pass, 92%+ coverage

---

## 🌐 Deployment Setup

### Option A: Use Existing Deployment (Recommended for Judges)

**Contract Address**: `0x8EAB26B5C6E8Efe05D30b479C483802D2Ab15c14`
**Network**: Sepolia Testnet
**Frontend**: [https://privacy-waste-rewards.vercel.app/](https://privacy-waste-rewards.vercel.app/)

**No deployment needed** - just:
1. Open frontend URL
2. Connect MetaMask to Sepolia
3. Interact with deployed contract

### Option B: Deploy Fresh Contract

```bash
# Ensure you have Sepolia ETH (0.1 ETH recommended)

# Deploy to Sepolia
npm run deploy:sepolia

# Expected output:
# ✅ Contract deployed to: 0x...
# ✅ Deployment info saved to deployments/sepolia.json

# Verify on Etherscan
npm run verify:sepolia

# Expected output:
# ✅ Contract verified successfully
```

### Option C: Local Development

```bash
# Terminal 1: Start local Hardhat node
npx hardhat node

# Terminal 2: Deploy to local network
npm run deploy:localhost

# Terminal 3: Run frontend locally
npx http-server public -p 3000
```

**Access at**: http://localhost:3000

---

## 🧪 Testing Setup

### Run All Tests

```bash
# Full test suite
npm test

# Expected: 55 tests passing, 92% coverage
```

### Run with Gas Reporting

```bash
# Set environment variable
export REPORT_GAS=true  # Linux/macOS
set REPORT_GAS=true     # Windows CMD

# Run tests with gas report
npm run test:gas

# Expected: Gas costs displayed in table format
```

### Run with Coverage

```bash
# Generate coverage report
npm run test:coverage

# Open coverage report
# Open coverage/index.html in browser
```

### Run Sepolia Testnet Tests

```bash
# Requires deployed contract on Sepolia
npm run test:sepolia

# Expected: 10 integration tests passing
```

---

## 🎨 Frontend Setup

### Local Frontend Development

```bash
# Option 1: Simple HTTP server
npx http-server public -p 3000

# Option 2: Live reload server
npx live-server public --port=3000

# Access at http://localhost:3000
```

### Configure Contract Address

Edit `public/config.js`:

```javascript
const CONFIG = {
    // Use deployed contract address
    CONTRACT_ADDRESS: "0x8EAB26B5C6E8Efe05D30b479C483802D2Ab15c14",

    // Sepolia network
    NETWORK_ID: 11155111,
    NETWORK_NAME: "Sepolia",
    RPC_URL: "https://rpc.sepolia.org"
};
```

### MetaMask Configuration

1. **Add Sepolia Network** (if not present):
   - Network Name: Sepolia Testnet
   - RPC URL: https://rpc.sepolia.org
   - Chain ID: 11155111
   - Currency: SepoliaETH
   - Block Explorer: https://sepolia.etherscan.io/

2. **Get Test ETH**:
   - Visit [Sepolia Faucet](https://sepoliafaucet.com/)
   - Connect wallet
   - Request testnet ETH

---

## 🔐 Security Setup

### Pre-commit Hooks

```bash
# Initialize Husky (if not already done)
npm run prepare

# Verify hooks are installed
ls .husky/
# Expected: pre-commit, pre-push files

# Test pre-commit hook
git add .
git commit -m "test"
# Expected: Lint-staged runs, tests execute
```

### Security Auditing

```bash
# Run Solidity linter
npm run lint:sol

# Run JavaScript linter
npm run lint:js

# Run Slither static analysis
npm run security:slither

# Run dependency audit
npm audit

# Full security suite
npm run security
```

---

## 📊 Performance Setup

### Gas Optimization

```bash
# Check gas costs
npm run test:gas

# Check contract size
npm run size-check

# Expected: Contract size < 24KB
```

### Compiler Optimization

Verify in `hardhat.config.js`:

```javascript
solidity: {
  version: "0.8.24",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200         // Balanced optimization
    },
    viaIR: true         // Better optimization
  }
}
```

---

## 🔄 CI/CD Setup

### GitHub Actions (Automatic)

Once you push to GitHub, workflows run automatically:

```bash
# Push to trigger CI/CD
git push origin main

# Workflows that run:
# ✅ test.yml - Multi-version testing
# ✅ coverage.yml - Coverage reporting
# ✅ deploy.yml - Manual deployment
```

### Manual Workflow Trigger

```bash
# Go to GitHub Actions tab
# Select "Deploy to Sepolia"
# Click "Run workflow"
# Select branch
# Click "Run workflow" button
```

---

## 🐛 Troubleshooting

### Issue: Tests Failing

```bash
# Clear cache
npm run clean
rm -rf node_modules
rm package-lock.json

# Reinstall
npm install

# Run tests again
npm test
```

### Issue: Contract Deployment Fails

```bash
# Check Sepolia ETH balance
npx hardhat run scripts/check-balance.js --network sepolia

# Verify RPC connection
curl https://rpc.sepolia.org

# Check gas price
npx hardhat run scripts/check-gas-price.js --network sepolia
```

### Issue: MetaMask Connection Fails

1. **Check network**: Ensure MetaMask is on Sepolia
2. **Check contract address**: Verify in config.js
3. **Clear cache**: Settings → Advanced → Reset account
4. **Check console**: Look for error messages in browser console

### Issue: FHE Encryption Errors

```bash
# Verify @fhevm/solidity is installed
npm list @fhevm/solidity

# Reinstall if needed
npm uninstall @fhevm/solidity
npm install @fhevm/solidity

# Recompile
npm run compile
```

### Issue: Verification Fails

```bash
# Check Etherscan API key
echo $ETHERSCAN_API_KEY

# Verify constructor arguments match
# Check deployments/sepolia.json

# Try verification again
npm run verify:sepolia
```

---

## 📁 Project Structure Verification

After setup, verify all files exist:

```bash
# Run verification script
ls -R | grep -E "\.(sol|js|json|md)$" | wc -l
# Expected: 50+ files

# Check key files
[ -f contracts/PrivacyWasteRewards.sol ] && echo "✅ Contract"
[ -f hardhat.config.js ] && echo "✅ Hardhat config"
[ -f package.json ] && echo "✅ Package.json"
[ -f .env ] && echo "✅ Environment configured"
```

---

## 🎯 Validation Checklist

Before proceeding, ensure:

- [ ] Node.js v18.x or v20.x installed
- [ ] All dependencies installed (`npm install` completed)
- [ ] .env file configured with valid keys
- [ ] Contracts compiled successfully
- [ ] Tests passing (55/55)
- [ ] MetaMask installed and configured
- [ ] Sepolia ETH in wallet (for deployment/testing)
- [ ] Contract deployed (or using existing deployment)
- [ ] Frontend accessible
- [ ] Security tools working (lint, audit)

---

## 🚀 Quick Start Commands

### Essential Commands

```bash
# Install
npm install

# Compile
npm run compile

# Test
npm test

# Deploy (Sepolia)
npm run deploy:sepolia

# Verify (Etherscan)
npm run verify:sepolia

# Interact (CLI)
npm run interact

# Simulate (Test scenarios)
npm run simulate
```

### Development Commands

```bash
# Lint Solidity
npm run lint:sol

# Lint JavaScript
npm run lint:js

# Format code
npm run format

# Gas report
npm run test:gas

# Coverage
npm run test:coverage

# Security audit
npm run security
```

### Deployment Commands

```bash
# Deploy to localhost
npm run deploy:localhost

# Deploy to Sepolia
npm run deploy:sepolia

# Verify on Etherscan
npm run verify:sepolia

# Interact with contract
npm run interact

# Run simulations
npm run simulate
```

---

## 📞 Support

### Documentation
- **README**: Complete project overview
- **TESTING**: Testing guide (450 lines)
- **CICD**: CI/CD documentation (650 lines)
- **SECURITY_PERFORMANCE**: Security guide (600 lines)
- **DEPLOYMENT**: Deployment instructions

### Resources
- **Zama Docs**: [https://docs.zama.ai/](https://docs.zama.ai/)
- **Hardhat Docs**: [https://hardhat.org/docs](https://hardhat.org/docs)
- **Sepolia Faucet**: [https://sepoliafaucet.com/](https://sepoliafaucet.com/)

### Common Links
- **Contract**: [Sepolia Etherscan](https://sepolia.etherscan.io/address/0x8EAB26B5C6E8Efe05D30b479C483802D2Ab15c14)
- **Frontend**: [Vercel Deployment](https://privacy-waste-rewards.vercel.app/)
- **GitHub**: [Repository](https://github.com/YourUsername/privacy-waste-rewards)

---

## ✅ Setup Complete!

If all validation checks pass, you're ready to:

1. **Interact with the deployed contract** on Sepolia
2. **Run comprehensive tests** (55 tests, 92% coverage)
3. **Deploy your own instance** if desired
4. **Contribute to the project**

**Next Steps**: See [README.md](./README.md) for usage guide and [COMPETITION_SUBMISSION.md](./COMPETITION_SUBMISSION.md) for submission details.

---

**Setup time**: ~5-10 minutes for basic setup, ~30 minutes for full development environment

**Questions?** Check [troubleshooting](#troubleshooting) or open an issue on GitHub.
