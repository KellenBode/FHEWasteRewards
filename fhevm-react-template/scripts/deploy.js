const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n===========================================");
  console.log("🚀 Privacy Waste Rewards Deployment");
  console.log("===========================================\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("📋 Deployment Information:");
  console.log("  Deployer address:", deployer.address);
  console.log("  Account balance:", ethers.formatEther(balance), "ETH");
  console.log("  Network:", network.name);
  console.log("  Chain ID:", network.config.chainId);
  console.log("");

  // Check balance
  if (balance === 0n) {
    console.error("❌ Error: Deployer account has zero balance!");
    process.exit(1);
  }

  console.log("📦 Deploying PrivacyWasteRewards contract...\n");

  // Deploy the contract
  const PrivacyWasteRewards = await ethers.getContractFactory("PrivacyWasteRewards");

  console.log("⏳ Deployment in progress...");
  const contract = await PrivacyWasteRewards.deploy();

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("\n✅ Contract deployed successfully!");
  console.log("===========================================");
  console.log("📍 Contract Address:", contractAddress);
  console.log("===========================================\n");

  // Get deployment transaction details
  const deployTx = contract.deploymentTransaction();
  if (deployTx) {
    console.log("📊 Deployment Transaction Details:");
    console.log("  Transaction Hash:", deployTx.hash);
    console.log("  Block Number:", deployTx.blockNumber);
    console.log("  Gas Used:", deployTx.gasLimit?.toString());
    console.log("");
  }

  // Get contract owner
  const owner = await contract.owner();
  console.log("👤 Contract Owner:", owner);
  console.log("");

  // Save deployment information
  const deploymentInfo = {
    network: network.name,
    chainId: network.config.chainId,
    contractAddress: contractAddress,
    contractName: "PrivacyWasteRewards",
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    transactionHash: deployTx?.hash,
    blockNumber: deployTx?.blockNumber,
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  // Save deployment info to file
  const deploymentFile = path.join(deploymentsDir, `${network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to:", deploymentFile);
  console.log("");

  // Generate Etherscan verification command
  if (network.name === "sepolia") {
    console.log("🔍 Verify contract on Etherscan:");
    console.log(`  npx hardhat verify --network sepolia ${contractAddress}`);
    console.log("");
    console.log("🌐 View on Etherscan:");
    console.log(`  https://sepolia.etherscan.io/address/${contractAddress}`);
    console.log("");
  }

  console.log("✨ Next Steps:");
  console.log("  1. Verify the contract: npm run verify");
  console.log("  2. Interact with contract: npm run interact");
  console.log("  3. Run simulation: npm run simulate");
  console.log("");
  console.log("===========================================");
  console.log("✅ Deployment Complete!");
  console.log("===========================================\n");
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment Failed!");
    console.error(error);
    process.exit(1);
  });
