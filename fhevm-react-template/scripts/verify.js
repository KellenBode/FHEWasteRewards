const { run } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n===========================================");
  console.log("🔍 Contract Verification on Etherscan");
  console.log("===========================================\n");

  // Load deployment information
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  const deploymentFile = path.join(deploymentsDir, `${network.name}.json`);

  if (!fs.existsSync(deploymentFile)) {
    console.error("❌ Error: Deployment file not found!");
    console.error(`   Expected: ${deploymentFile}`);
    console.error("   Please deploy the contract first: npm run deploy");
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const contractAddress = deploymentInfo.contractAddress;

  console.log("📋 Verification Information:");
  console.log("  Network:", network.name);
  console.log("  Contract Address:", contractAddress);
  console.log("  Contract Name:", deploymentInfo.contractName);
  console.log("");

  // Verify the contract on Etherscan
  console.log("⏳ Verifying contract on Etherscan...\n");

  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
      contract: "contracts/PrivacyWasteRewards.sol:PrivacyWasteRewards",
    });

    console.log("\n✅ Contract verified successfully!");
    console.log("===========================================");
    console.log("🌐 View Verified Contract:");
    console.log(`  https://${network.name}.etherscan.io/address/${contractAddress}#code`);
    console.log("===========================================\n");

    // Update deployment info with verification status
    deploymentInfo.verified = true;
    deploymentInfo.verificationTime = new Date().toISOString();
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log("💾 Verification status updated in deployment file\n");

  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("\n✅ Contract is already verified!");
      console.log("===========================================");
      console.log("🌐 View Verified Contract:");
      console.log(`  https://${network.name}.etherscan.io/address/${contractAddress}#code`);
      console.log("===========================================\n");
    } else {
      console.error("\n❌ Verification Failed!");
      console.error("Error:", error.message);
      console.error("\nTroubleshooting:");
      console.error("  1. Check ETHERSCAN_API_KEY in .env file");
      console.error("  2. Ensure contract is deployed on correct network");
      console.error("  3. Wait a few minutes after deployment before verifying");
      process.exit(1);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Verification process failed!");
    console.error(error);
    process.exit(1);
  });
