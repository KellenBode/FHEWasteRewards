# Hardhat Development Framework Setup

Complete guide for Privacy Waste Rewards smart contract development using Hardhat.

---

## 🛠️ Framework Overview

This project uses **Hardhat** as the primary development framework for Ethereum smart contract development, testing, and deployment.

### Why Hardhat?

- ✅ **Professional Development Environment**: Industry-standard tool
- ✅ **Fast Compilation**: Optimized Solidity compiler
- ✅ **Comprehensive Testing**: Built-in testing framework with Mocha/Chai
- ✅ **Network Flexibility**: Easy switching between networks
- ✅ **Plugin Ecosystem**: Rich plugin architecture
- ✅ **Debugging Tools**: Advanced error messages and stack traces
- ✅ **Etherscan Integration**: Automated contract verification

---

## 📦 Project Structure

```
D:\
├── contracts/                  # Smart contracts
│   └── PrivacyWasteRewards.sol
├── scripts/                    # Deployment and interaction scripts
│   ├── deploy.js              # Main deployment script
│   ├── verify.js              # Etherscan verification
│   ├── interact.js            # Interactive CLI
│   └── simulate.js            # Automated testing scenarios
├── test/                       # Contract tests (to be created)
├── deployments/               # Deployment artifacts (auto-generated)
│   └── sepolia.json
├── artifacts/                 # Compiled contracts (auto-generated)
├── cache/                     # Hardhat cache (auto-generated)
├── hardhat.config.js          # Hardhat configuration
├── package.json               # Project dependencies
├── .env                       # Environment variables (not in git)
├── .env.example               # Environment template
└── DEPLOYMENT.md              # Deployment guide
```

---

## 🔧 Configuration Details

### hardhat.config.js

The main configuration file for Hardhat:

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    // Local network
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    // Testnet
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155111,
      gasPrice: "auto",
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
```

### Key Configuration Sections

#### 1. Solidity Compiler

```javascript
solidity: {
  version: "0.8.24",        // Solidity version
  settings: {
    optimizer: {
      enabled: true,         // Enable optimization
      runs: 200,            // Optimization runs
    },
    viaIR: true,            // Use IR-based compiler
  },
}
```

#### 2. Networks Configuration

**Hardhat Network** (Default):
- Built-in local network
- Fast and deterministic
- Perfect for testing

**Localhost**:
- Connects to `hardhat node` instance
- Persistent local blockchain

**Sepolia Testnet**:
- Public Ethereum testnet
- Free testnet ETH available
- Production-like environment

#### 3. Etherscan Integration

Enables automatic contract verification:

```javascript
etherscan: {
  apiKey: {
    sepolia: process.env.ETHERSCAN_API_KEY,
  },
}
```

---

## 📜 Available Scripts

### Package.json Scripts

```json
{
  "scripts": {
    "compile": "hardhat compile",
    "test": "hardhat test",
    "deploy": "hardhat run scripts/deploy.js --network sepolia",
    "deploy:local": "hardhat run scripts/deploy.js --network localhost",
    "verify": "hardhat run scripts/verify.js --network sepolia",
    "interact": "hardhat run scripts/interact.js --network sepolia",
    "simulate": "hardhat run scripts/simulate.js --network sepolia",
    "node": "hardhat node",
    "clean": "hardhat clean"
  }
}
```

### Script Descriptions

| Script | Command | Description |
|--------|---------|-------------|
| **Compile** | `npm run compile` | Compiles all smart contracts |
| **Test** | `npm run test` | Runs contract test suite |
| **Deploy** | `npm run deploy` | Deploys to Sepolia testnet |
| **Deploy Local** | `npm run deploy:local` | Deploys to local network |
| **Verify** | `npm run verify` | Verifies contract on Etherscan |
| **Interact** | `npm run interact` | Interactive contract CLI |
| **Simulate** | `npm run simulate` | Runs automated scenarios |
| **Node** | `npm run node` | Starts local Hardhat node |
| **Clean** | `npm run clean` | Cleans build artifacts |

---

## 🚀 Deployment Scripts

### 1. deploy.js

Main deployment script with comprehensive logging:

**Features**:
- ✅ Account balance checking
- ✅ Network information display
- ✅ Deployment progress tracking
- ✅ Transaction details logging
- ✅ Automatic deployment info saving
- ✅ Etherscan verification commands

**Usage**:
```bash
npm run deploy              # Deploy to Sepolia
npm run deploy:local        # Deploy to local network
```

**Output**: Creates `deployments/sepolia.json` with:
```json
{
  "network": "sepolia",
  "chainId": 11155111,
  "contractAddress": "0x...",
  "contractName": "PrivacyWasteRewards",
  "deployer": "0x...",
  "deploymentTime": "2024-...",
  "transactionHash": "0x...",
  "blockNumber": 1234567
}
```

### 2. verify.js

Etherscan verification script:

**Features**:
- ✅ Reads deployment info automatically
- ✅ Handles already-verified contracts
- ✅ Updates deployment file with verification status
- ✅ Provides troubleshooting guidance

**Usage**:
```bash
npm run verify
```

### 3. interact.js

Interactive command-line interface:

**Features**:
- ✅ User-friendly menu system
- ✅ All contract functions accessible
- ✅ Real-time transaction feedback
- ✅ Input validation
- ✅ Error handling

**Available Actions**:
1. View Contract Info
2. Register Anonymous User
3. Submit Waste Classification
4. View My Stats (Encrypted)
5. View My Submissions
6. View Leaderboard
7. Claim Reward
8. View Public Stats
9. Get My User ID

**Usage**:
```bash
npm run interact
# Then follow the interactive menu
```

### 4. simulate.js

Comprehensive automated testing:

**Features**:
- ✅ Full user journey simulation
- ✅ Multiple test scenarios
- ✅ Encrypted data verification
- ✅ Gas usage tracking
- ✅ Success/failure reporting

**Scenarios**:
1. User Registration Check
2. Multiple Waste Submissions
3. View User Statistics
4. View Submission History
5. Privacy-Preserving Leaderboard
6. Public Platform Statistics
7. Reward Claim Attempt

**Usage**:
```bash
npm run simulate
```

---

## 🔌 Hardhat Plugins

### Installed Plugins

#### 1. @nomicfoundation/hardhat-toolbox

All-in-one plugin bundle including:
- Hardhat Ethers
- Hardhat Chai Matchers
- Hardhat Network Helpers
- Hardhat Verify
- Gas Reporter
- Solidity Coverage
- TypeScript support

#### 2. @nomicfoundation/hardhat-verify

Contract verification on Etherscan:
```javascript
await run("verify:verify", {
  address: contractAddress,
  constructorArguments: [],
});
```

---

## 🌐 Network Configuration

### Local Development

#### Start Local Node

```bash
npm run node
```

Creates a local Ethereum network at `http://127.0.0.1:8545` with:
- 20 pre-funded accounts
- Instant mining
- Console logging
- RPC endpoint

#### Deploy Locally

```bash
npm run deploy:local
```

### Testnet Deployment (Sepolia)

#### Prerequisites

1. **Get Sepolia ETH**:
   - https://sepoliafaucet.com/
   - https://www.infura.io/faucet/sepolia

2. **Configure RPC**:
   ```env
   SEPOLIA_RPC_URL=https://rpc.sepolia.org
   # Or use Alchemy:
   # SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
   ```

3. **Add Private Key**:
   ```env
   PRIVATE_KEY=your_private_key_without_0x
   ```

#### Deploy to Sepolia

```bash
npm run deploy
```

### Network Switching

Change network by modifying the script command:

```bash
# Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Localhost
npx hardhat run scripts/deploy.js --network localhost

# Hardhat (default)
npx hardhat run scripts/deploy.js
```

---

## 🧪 Testing Framework

### Test Structure

Create tests in `test/` directory:

```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PrivacyWasteRewards", function () {
  let contract;
  let owner;
  let user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const PrivacyWasteRewards = await ethers.getContractFactory(
      "PrivacyWasteRewards"
    );
    contract = await PrivacyWasteRewards.deploy();
    await contract.waitForDeployment();
  });

  it("Should deploy with correct owner", async function () {
    expect(await contract.owner()).to.equal(owner.address);
  });

  it("Should register user", async function () {
    await contract.connect(user).registerAnonymousUser();
    const userId = await contract.connect(user).getMyUserId();
    expect(userId).to.equal(1);
  });

  // Add more tests...
});
```

### Run Tests

```bash
npm test                    # Run all tests
npm run test:coverage      # With coverage report
```

---

## 🔍 Debugging

### Hardhat Console

Interactive JavaScript console:

```bash
npx hardhat console --network sepolia
```

```javascript
> const contract = await ethers.getContractAt(
    "PrivacyWasteRewards",
    "0x..."
  );
> await contract.owner();
> await contract.totalParticipants();
```

### Console.log in Contracts

Add logging to contracts (removed in production):

```solidity
import "hardhat/console.sol";

contract Example {
  function test() public {
    console.log("Value:", someValue);
  }
}
```

### Error Stack Traces

Hardhat provides detailed error messages:

```
Error: VM Exception while processing transaction: reverted with reason string 'Not authorized'
  at PrivacyWasteRewards.submitWasteClassification (contracts/PrivacyWasteRewards.sol:124)
```

---

## 📊 Gas Reporting

Enable gas reporting in `hardhat.config.js`:

```javascript
module.exports = {
  gasReporter: {
    enabled: true,
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
};
```

Output:
```
·----------------------------------------|---------------------------|-------------|
|  Solc version: 0.8.24                  ·  Optimizer enabled: true  ·  Runs: 200  │
·········································|···························|·············|
|  Methods                               ·               Gas         ·  USD Cost   │
·····················|···················|·········|·········|·······|·············|
|  Contract          ·  Method           ·  Min    ·  Max    ·  Avg  ·  $ (avg)    │
·····················|···················|·········|·········|·······|·············|
|  PrivacyWaste...   ·  registerUser     ·  50000  ·  55000  ·52500  ·  $2.10      │
```

---

## 🔐 Security Best Practices

### 1. Private Key Management

✅ **DO**:
- Use `.env` file (gitignored)
- Use separate wallets for dev/prod
- Use hardware wallets for mainnet

❌ **DON'T**:
- Commit private keys to git
- Share private keys
- Use mainnet keys for testing

### 2. Contract Security

✅ **DO**:
- Audit before mainnet deployment
- Test thoroughly on testnets
- Use established libraries (OpenZeppelin)
- Follow security patterns

❌ **DON'T**:
- Deploy untested contracts
- Skip audits for production
- Ignore compiler warnings

---

## 🛠️ Troubleshooting

### Common Issues

#### 1. Compilation Errors

```bash
npm run clean
npm run compile
```

#### 2. Network Connection Issues

Check `.env` configuration:
```env
SEPOLIA_RPC_URL=https://rpc.sepolia.org
PRIVATE_KEY=your_key_here
```

#### 3. Gas Estimation Failed

Increase gas limit or check contract logic:
```javascript
await contract.method({ gasLimit: 500000 });
```

#### 4. Nonce Too High

Reset Hardhat network:
```bash
npx hardhat clean
npm run node  # Restart node
```

---

## 📚 Additional Resources

### Hardhat Documentation
- Official Docs: https://hardhat.org/docs
- Tutorial: https://hardhat.org/tutorial
- Plugins: https://hardhat.org/plugins

### Ethers.js v6
- Documentation: https://docs.ethers.org/v6/
- Migration Guide: https://docs.ethers.org/v6/migrating/

### Testing
- Mocha: https://mochajs.org/
- Chai: https://www.chaijs.com/
- Hardhat Testing: https://hardhat.org/tutorial/testing-contracts

---

## ✨ Next Steps

1. ✅ Review hardhat.config.js
2. ✅ Configure .env file
3. ✅ Compile contracts: `npm run compile`
4. ✅ Deploy to testnet: `npm run deploy`
5. ✅ Verify on Etherscan: `npm run verify`
6. ✅ Test interaction: `npm run interact`
7. ✅ Run simulation: `npm run simulate`

---

*Complete Hardhat development environment for Privacy Waste Rewards* 🛠️🔐
