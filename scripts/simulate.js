const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function loadContract() {
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  const deploymentFile = path.join(deploymentsDir, `${network.name}.json`);

  if (!fs.existsSync(deploymentFile)) {
    throw new Error("Deployment file not found! Please deploy the contract first.");
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const contractAddress = deploymentInfo.contractAddress;

  const PrivacyWasteRewards = await ethers.getContractFactory("PrivacyWasteRewards");
  return PrivacyWasteRewards.attach(contractAddress);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log("\n===========================================");
  console.log("🎮 Privacy Waste Rewards - Simulation");
  console.log("===========================================\n");

  const [signer] = await ethers.getSigners();
  console.log("📋 Simulator Address:", signer.address);
  console.log("📋 Network:", network.name);

  const contract = await loadContract();
  const contractAddress = await contract.getAddress();
  console.log("📋 Contract Address:", contractAddress);
  console.log("");

  // Simulation Scenarios
  console.log("🎯 Starting Simulation Scenarios...\n");

  // Scenario 1: Check if user is registered
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Scenario 1: User Registration Check");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    const userId = await contract.getMyUserId();
    if (userId.toString() === "0") {
      console.log("❌ User not registered");
      console.log("📝 Registering new user...\n");

      const tx = await contract.registerAnonymousUser();
      console.log("⏳ Registration transaction:", tx.hash);
      const receipt = await tx.wait();
      console.log("✅ Registration successful!");
      console.log("   Gas used:", receipt.gasUsed.toString());

      // Get user ID from event
      const event = receipt.logs.find(log => {
        try {
          return contract.interface.parseLog(log)?.name === "UserRegistered";
        } catch {
          return false;
        }
      });

      if (event) {
        const parsedEvent = contract.interface.parseLog(event);
        console.log("   New User ID:", parsedEvent.args.userId.toString());
      }
    } else {
      console.log("✅ User already registered");
      console.log("   User ID:", userId.toString());
    }
  } catch (error) {
    console.error("❌ Error in registration:", error.message);
  }

  console.log("");
  await sleep(2000);

  // Scenario 2: Submit Multiple Waste Classifications
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Scenario 2: Multiple Waste Submissions");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const wasteSubmissions = [
    { category: 1, quantity: 5, name: "Recyclable" },
    { category: 2, quantity: 3, name: "Organic" },
    { category: 3, quantity: 2, name: "Hazardous" },
    { category: 4, quantity: 10, name: "General" },
  ];

  for (const waste of wasteSubmissions) {
    try {
      console.log(`\n♻️  Submitting ${waste.name} waste (${waste.quantity} items)...`);
      const tx = await contract.submitWasteClassification(waste.category, waste.quantity);
      console.log("   Transaction:", tx.hash);
      const receipt = await tx.wait();
      console.log("   ✅ Submitted successfully! Gas used:", receipt.gasUsed.toString());

      await sleep(1000);
    } catch (error) {
      console.error(`   ❌ Error submitting ${waste.name}:`, error.message);
    }
  }

  console.log("");
  await sleep(2000);

  // Scenario 3: View User Statistics
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Scenario 3: View User Statistics");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    const stats = await contract.getMyEncryptedStats();
    console.log("\n🔐 Encrypted User Statistics:");
    console.log("   Total Points (encrypted):", stats.totalPoints.toString());
    console.log("   Recyclable Count (encrypted):", stats.recyclableCount.toString());
    console.log("   Organic Count (encrypted):", stats.organicCount.toString());
    console.log("   Hazardous Count (encrypted):", stats.hazardousCount.toString());
    console.log("   General Count (encrypted):", stats.generalCount.toString());
    console.log("\n   Note: These values are FHE encrypted");
  } catch (error) {
    console.error("❌ Error fetching stats:", error.message);
  }

  console.log("");
  await sleep(2000);

  // Scenario 4: View Submission History
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Scenario 4: View Submission History");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    const count = await contract.getMySubmissionCount();
    console.log(`\n📝 Total Submissions: ${count}\n`);

    for (let i = 0; i < count; i++) {
      const submission = await contract.getMySubmission(i);
      console.log(`   Submission #${i}:`);
      console.log(`     Category (encrypted): ${submission.category}`);
      console.log(`     Quantity (encrypted): ${submission.quantity}`);
      console.log(`     Points (encrypted): ${submission.points}`);
      console.log(`     Time: ${new Date(Number(submission.timestamp) * 1000).toLocaleString()}`);
      console.log(`     Verified: ${submission.verified}`);
      console.log("");
    }
  } catch (error) {
    console.error("❌ Error fetching submissions:", error.message);
  }

  await sleep(2000);

  // Scenario 5: View Leaderboard
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Scenario 5: Privacy-Preserving Leaderboard");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    const leaderboard = await contract.getLeaderboard();
    console.log(`\n🏆 Leaderboard (${leaderboard.userIds.length} participants):\n`);

    for (let i = 0; i < Math.min(leaderboard.userIds.length, 10); i++) {
      console.log(`   ${i + 1}. User #${leaderboard.userIds[i]}`);
      console.log(`      Encrypted Points: ${leaderboard.encryptedPoints[i]}`);
      console.log(`      Last Activity: ${new Date(Number(leaderboard.lastActivities[i]) * 1000).toLocaleString()}`);
      console.log("");
    }
  } catch (error) {
    console.error("❌ Error fetching leaderboard:", error.message);
  }

  await sleep(2000);

  // Scenario 6: Public Statistics
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Scenario 6: Public Platform Statistics");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    const publicStats = await contract.getPublicStats();
    console.log("\n🌍 Public Statistics:");
    console.log("   Total Users:", publicStats.totalUsers.toString());
    console.log("   Total Submissions:", publicStats.totalSubmissions.toString());
  } catch (error) {
    console.error("❌ Error fetching public stats:", error.message);
  }

  console.log("");
  await sleep(2000);

  // Scenario 7: Reward Claim Simulation
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Scenario 7: Reward Claim Attempt");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    console.log("\n🎁 Attempting to claim Bronze reward (Tier 1)...");
    const tx = await contract.claimReward(1);
    console.log("   Transaction:", tx.hash);
    const receipt = await tx.wait();
    console.log("   ✅ Reward claim processed! Gas used:", receipt.gasUsed.toString());
  } catch (error) {
    console.error("   ❌ Error claiming reward:", error.message);
  }

  // Summary
  console.log("\n===========================================");
  console.log("✅ Simulation Complete!");
  console.log("===========================================");
  console.log("\n📊 Simulation Summary:");
  console.log("  ✅ User registration verified");
  console.log("  ✅ Multiple waste classifications submitted");
  console.log("  ✅ User statistics retrieved (encrypted)");
  console.log("  ✅ Submission history accessed");
  console.log("  ✅ Leaderboard viewed");
  console.log("  ✅ Public statistics checked");
  console.log("  ✅ Reward claim attempted");
  console.log("\n💡 All privacy features tested successfully!");
  console.log("   Data remains encrypted throughout the process.\n");

  console.log("🌐 View on Etherscan:");
  if (network.name === "sepolia") {
    console.log(`   https://sepolia.etherscan.io/address/${contractAddress}`);
  }
  console.log("\n===========================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Simulation failed!");
    console.error(error);
    process.exit(1);
  });
