# Hardhat Tasks & Custom Commands

Custom Hardhat tasks for Privacy Waste Rewards project automation.

---

## 📋 Overview

Hardhat tasks allow you to extend the framework with custom commands. This document describes how to create and use custom tasks for contract management, deployment, and testing.

---

## 🛠️ Creating Custom Tasks

### Task Template

Add tasks to `hardhat.config.js`:

```javascript
const { task } = require("hardhat/config");

task("task-name", "Task description")
  .addParam("param", "Parameter description")
  .addOptionalParam("optional", "Optional parameter", "default")
  .setAction(async (taskArgs, hre) => {
    // Task implementation
    console.log("Task executed");
  });
```

---

## 📦 Predefined Tasks

### Account Management

#### List Accounts
```bash
npx hardhat accounts --network sepolia
```

**Implementation**:
```javascript
task("accounts", "Prints the list of accounts")
  .setAction(async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
      const balance = await hre.ethers.provider.getBalance(account.address);
      console.log(
        account.address,
        hre.ethers.formatEther(balance),
        "ETH"
      );
    }
  });
```

#### Check Balance
```bash
npx hardhat balance --address 0x... --network sepolia
```

**Implementation**:
```javascript
task("balance", "Prints account balance")
  .addParam("address", "The account's address")
  .setAction(async (taskArgs, hre) => {
    const balance = await hre.ethers.provider.getBalance(taskArgs.address);
    console.log(hre.ethers.formatEther(balance), "ETH");
  });
```

---

## 🚀 Deployment Tasks

### Deploy Contract
```bash
npx hardhat deploy-contract --network sepolia
```

**Implementation**:
```javascript
task("deploy-contract", "Deploys the PrivacyWasteRewards contract")
  .setAction(async (taskArgs, hre) => {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with:", deployer.address);

    const PrivacyWasteRewards = await hre.ethers.getContractFactory(
      "PrivacyWasteRewards"
    );
    const contract = await PrivacyWasteRewards.deploy();
    await contract.waitForDeployment();

    console.log("Contract deployed to:", await contract.getAddress());
    return await contract.getAddress();
  });
```

### Verify Contract
```bash
npx hardhat verify-contract --address 0x... --network sepolia
```

**Implementation**:
```javascript
task("verify-contract", "Verifies contract on Etherscan")
  .addParam("address", "Contract address")
  .setAction(async (taskArgs, hre) => {
    await hre.run("verify:verify", {
      address: taskArgs.address,
      constructorArguments: [],
    });
  });
```

---

## 🔍 Contract Interaction Tasks

### Register User
```bash
npx hardhat register-user --contract 0x... --network sepolia
```

**Implementation**:
```javascript
task("register-user", "Registers an anonymous user")
  .addParam("contract", "Contract address")
  .setAction(async (taskArgs, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const contract = await hre.ethers.getContractAt(
      "PrivacyWasteRewards",
      taskArgs.contract
    );

    const tx = await contract.registerAnonymousUser();
    await tx.wait();
    console.log("User registered! Transaction:", tx.hash);

    const userId = await contract.getMyUserId();
    console.log("User ID:", userId.toString());
  });
```

### Submit Waste
```bash
npx hardhat submit-waste --contract 0x... --category 1 --quantity 5 --network sepolia
```

**Implementation**:
```javascript
task("submit-waste", "Submits waste classification")
  .addParam("contract", "Contract address")
  .addParam("category", "Waste category (1-4)")
  .addParam("quantity", "Quantity")
  .setAction(async (taskArgs, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const contract = await hre.ethers.getContractAt(
      "PrivacyWasteRewards",
      taskArgs.contract
    );

    const tx = await contract.submitWasteClassification(
      parseInt(taskArgs.category),
      parseInt(taskArgs.quantity)
    );
    await tx.wait();
    console.log("Waste submitted! Transaction:", tx.hash);
  });
```

### View Stats
```bash
npx hardhat view-stats --contract 0x... --network sepolia
```

**Implementation**:
```javascript
task("view-stats", "Views user encrypted stats")
  .addParam("contract", "Contract address")
  .setAction(async (taskArgs, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const contract = await hre.ethers.getContractAt(
      "PrivacyWasteRewards",
      taskArgs.contract
    );

    const stats = await contract.getMyEncryptedStats();
    console.log("Encrypted Statistics:");
    console.log("  Total Points:", stats.totalPoints.toString());
    console.log("  Recyclable:", stats.recyclableCount.toString());
    console.log("  Organic:", stats.organicCount.toString());
    console.log("  Hazardous:", stats.hazardousCount.toString());
    console.log("  General:", stats.generalCount.toString());
  });
```

---

## 📊 Monitoring Tasks

### Contract Info
```bash
npx hardhat contract-info --address 0x... --network sepolia
```

**Implementation**:
```javascript
task("contract-info", "Displays contract information")
  .addParam("address", "Contract address")
  .setAction(async (taskArgs, hre) => {
    const contract = await hre.ethers.getContractAt(
      "PrivacyWasteRewards",
      taskArgs.address
    );

    const owner = await contract.owner();
    const totalParticipants = await contract.totalParticipants();
    const nextUserId = await contract.nextUserId();
    const publicStats = await contract.getPublicStats();

    console.log("Contract Information:");
    console.log("  Address:", taskArgs.address);
    console.log("  Owner:", owner);
    console.log("  Total Participants:", totalParticipants.toString());
    console.log("  Next User ID:", nextUserId.toString());
    console.log("  Total Submissions:", publicStats.totalSubmissions.toString());
  });
```

### Watch Events
```bash
npx hardhat watch-events --contract 0x... --network sepolia
```

**Implementation**:
```javascript
task("watch-events", "Watches contract events")
  .addParam("contract", "Contract address")
  .setAction(async (taskArgs, hre) => {
    const contract = await hre.ethers.getContractAt(
      "PrivacyWasteRewards",
      taskArgs.contract
    );

    console.log("Watching events...\n");

    contract.on("UserRegistered", (userId, timestamp) => {
      console.log(`[UserRegistered] User #${userId} at ${new Date(Number(timestamp) * 1000)}`);
    });

    contract.on("WasteClassified", (userId, submissionId) => {
      console.log(`[WasteClassified] User #${userId}, Submission #${submissionId}`);
    });

    contract.on("PointsAwarded", (userId, points) => {
      console.log(`[PointsAwarded] User #${userId} earned ${points} points`);
    });

    contract.on("RewardClaimed", (userId, amount) => {
      console.log(`[RewardClaimed] User #${userId} claimed tier ${amount}`);
    });

    // Keep running
    await new Promise(() => {});
  });
```

---

## 🧪 Testing Tasks

### Run Coverage
```bash
npx hardhat coverage
```

**Implementation**:
```javascript
task("coverage", "Generates test coverage report")
  .setAction(async (taskArgs, hre) => {
    await hre.run("coverage");
  });
```

### Gas Report
```bash
npx hardhat test --gas-report
```

Configure in `hardhat.config.js`:
```javascript
module.exports = {
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    outputFile: "gas-report.txt",
    noColors: true,
  },
};
```

---

## 🔧 Utility Tasks

### Clean Build
```bash
npx hardhat clean-build
```

**Implementation**:
```javascript
task("clean-build", "Cleans and rebuilds contracts")
  .setAction(async (taskArgs, hre) => {
    await hre.run("clean");
    await hre.run("compile");
    console.log("Build cleaned and recompiled");
  });
```

### Network Info
```bash
npx hardhat network-info --network sepolia
```

**Implementation**:
```javascript
task("network-info", "Displays network information")
  .setAction(async (taskArgs, hre) => {
    const network = await hre.ethers.provider.getNetwork();
    const blockNumber = await hre.ethers.provider.getBlockNumber();
    const gasPrice = await hre.ethers.provider.getFeeData();

    console.log("Network Information:");
    console.log("  Name:", hre.network.name);
    console.log("  Chain ID:", network.chainId.toString());
    console.log("  Block Number:", blockNumber);
    console.log("  Gas Price:", hre.ethers.formatUnits(gasPrice.gasPrice, "gwei"), "gwei");
  });
```

### Estimate Gas
```bash
npx hardhat estimate-gas --contract 0x... --method registerAnonymousUser --network sepolia
```

**Implementation**:
```javascript
task("estimate-gas", "Estimates gas for contract method")
  .addParam("contract", "Contract address")
  .addParam("method", "Method name")
  .setAction(async (taskArgs, hre) => {
    const contract = await hre.ethers.getContractAt(
      "PrivacyWasteRewards",
      taskArgs.contract
    );

    const gasEstimate = await contract[taskArgs.method].estimateGas();
    console.log(`Gas estimate for ${taskArgs.method}:`, gasEstimate.toString());

    const gasPrice = await hre.ethers.provider.getFeeData();
    const cost = gasEstimate * gasPrice.gasPrice;
    console.log("Estimated cost:", hre.ethers.formatEther(cost), "ETH");
  });
```

---

## 📝 Complete Task Configuration

Add all tasks to `hardhat.config.js`:

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

const { task } = require("hardhat/config");

// Account tasks
task("accounts", "Prints the list of accounts")
  .setAction(async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();
    for (const account of accounts) {
      const balance = await hre.ethers.provider.getBalance(account.address);
      console.log(account.address, hre.ethers.formatEther(balance), "ETH");
    }
  });

task("balance", "Prints account balance")
  .addParam("address", "The account's address")
  .setAction(async (taskArgs, hre) => {
    const balance = await hre.ethers.provider.getBalance(taskArgs.address);
    console.log(hre.ethers.formatEther(balance), "ETH");
  });

// Contract tasks
task("contract-info", "Displays contract information")
  .addParam("address", "Contract address")
  .setAction(async (taskArgs, hre) => {
    const contract = await hre.ethers.getContractAt(
      "PrivacyWasteRewards",
      taskArgs.address
    );
    const owner = await contract.owner();
    const totalParticipants = await contract.totalParticipants();
    const nextUserId = await contract.nextUserId();

    console.log("Contract Information:");
    console.log("  Address:", taskArgs.address);
    console.log("  Owner:", owner);
    console.log("  Total Participants:", totalParticipants.toString());
    console.log("  Next User ID:", nextUserId.toString());
  });

// Network tasks
task("network-info", "Displays network information")
  .setAction(async (taskArgs, hre) => {
    const network = await hre.ethers.provider.getNetwork();
    const blockNumber = await hre.ethers.provider.getBlockNumber();
    const gasPrice = await hre.ethers.provider.getFeeData();

    console.log("Network Information:");
    console.log("  Name:", hre.network.name);
    console.log("  Chain ID:", network.chainId.toString());
    console.log("  Block Number:", blockNumber);
    console.log("  Gas Price:", hre.ethers.formatUnits(gasPrice.gasPrice, "gwei"), "gwei");
  });

// Main configuration
module.exports = {
  solidity: "0.8.24",
  networks: {
    // ... network config
  },
};
```

---

## 🚀 Usage Examples

### Complete Workflow

```bash
# 1. Check accounts
npx hardhat accounts --network sepolia

# 2. Check network
npx hardhat network-info --network sepolia

# 3. Compile
npm run compile

# 4. Deploy
npm run deploy

# 5. Get contract info
npx hardhat contract-info --address 0x... --network sepolia

# 6. Register user
npx hardhat register-user --contract 0x... --network sepolia

# 7. Submit waste
npx hardhat submit-waste --contract 0x... --category 1 --quantity 5 --network sepolia

# 8. View stats
npx hardhat view-stats --contract 0x... --network sepolia

# 9. Watch events
npx hardhat watch-events --contract 0x... --network sepolia
```

---

## 💡 Best Practices

1. **Error Handling**: Always wrap task actions in try-catch
2. **Validation**: Validate all input parameters
3. **Logging**: Provide clear console output
4. **Documentation**: Add descriptions for all tasks
5. **Testing**: Test tasks on local network first
6. **Reusability**: Create modular, reusable tasks

---

## 🔗 Resources

- Hardhat Tasks: https://hardhat.org/hardhat-runner/docs/advanced/create-task
- Ethers.js: https://docs.ethers.org/v6/
- Hardhat Runtime Environment: https://hardhat.org/hardhat-runner/docs/advanced/hardhat-runtime-environment

---

*Automate your workflow with custom Hardhat tasks* 🛠️⚡
