const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

async function loadContract() {
  // Load deployment information
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

async function displayMenu() {
  console.log("\n===========================================");
  console.log("🎮 Privacy Waste Rewards - Interactive Menu");
  console.log("===========================================");
  console.log("\n📋 Available Actions:");
  console.log("  1. View Contract Info");
  console.log("  2. Register Anonymous User");
  console.log("  3. Submit Waste Classification");
  console.log("  4. View My Stats");
  console.log("  5. View My Submissions");
  console.log("  6. View Leaderboard");
  console.log("  7. Claim Reward");
  console.log("  8. View Public Stats");
  console.log("  9. Get My User ID");
  console.log("  0. Exit");
  console.log("===========================================\n");
}

async function viewContractInfo(contract) {
  console.log("\n📊 Contract Information:");
  const owner = await contract.owner();
  const totalParticipants = await contract.totalParticipants();
  const nextUserId = await contract.nextUserId();

  console.log("  Owner:", owner);
  console.log("  Total Participants:", totalParticipants.toString());
  console.log("  Next User ID:", nextUserId.toString());
  console.log("");
}

async function registerUser(contract) {
  console.log("\n🆕 Registering Anonymous User...");
  try {
    const tx = await contract.registerAnonymousUser();
    console.log("⏳ Transaction sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ User registered successfully!");
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
      console.log("   Your User ID:", parsedEvent.args.userId.toString());
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

async function submitWaste(contract) {
  console.log("\n♻️  Waste Classification Categories:");
  console.log("  1 = Recyclable (10 points per item)");
  console.log("  2 = Organic (8 points per item)");
  console.log("  3 = Hazardous (15 points per item)");
  console.log("  4 = General (5 points per item)\n");

  const category = await question("Enter waste category (1-4): ");
  const quantity = await question("Enter quantity (1-100): ");

  try {
    console.log("\n⏳ Submitting waste classification...");
    const tx = await contract.submitWasteClassification(
      parseInt(category),
      parseInt(quantity)
    );
    console.log("   Transaction sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ Waste classified successfully!");
    console.log("   Gas used:", receipt.gasUsed.toString());
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

async function viewMyStats(contract) {
  console.log("\n📊 Fetching your encrypted stats...");
  try {
    const stats = await contract.getMyEncryptedStats();
    console.log("\n🔐 Your Encrypted Statistics:");
    console.log("  Note: These values are encrypted and only you can decrypt them");
    console.log("  Total Points (encrypted):", stats.totalPoints.toString());
    console.log("  Recyclable Count (encrypted):", stats.recyclableCount.toString());
    console.log("  Organic Count (encrypted):", stats.organicCount.toString());
    console.log("  Hazardous Count (encrypted):", stats.hazardousCount.toString());
    console.log("  General Count (encrypted):", stats.generalCount.toString());
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

async function viewMySubmissions(contract) {
  try {
    const count = await contract.getMySubmissionCount();
    console.log(`\n📝 You have ${count} submission(s)\n`);

    if (count > 0) {
      const submissionId = await question(`Enter submission ID (0-${count - 1}): `);
      const submission = await contract.getMySubmission(parseInt(submissionId));

      console.log("\n🔐 Submission Details (Encrypted):");
      console.log("  Category (encrypted):", submission.category.toString());
      console.log("  Quantity (encrypted):", submission.quantity.toString());
      console.log("  Points (encrypted):", submission.points.toString());
      console.log("  Timestamp:", new Date(Number(submission.timestamp) * 1000).toLocaleString());
      console.log("  Verified:", submission.verified);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

async function viewLeaderboard(contract) {
  console.log("\n🏆 Privacy-Preserving Leaderboard:");
  try {
    const leaderboard = await contract.getLeaderboard();
    console.log(`\n  Total Entries: ${leaderboard.userIds.length}\n`);

    for (let i = 0; i < leaderboard.userIds.length; i++) {
      console.log(`  ${i + 1}. User #${leaderboard.userIds[i]}`);
      console.log(`     Encrypted Points: ${leaderboard.encryptedPoints[i]}`);
      console.log(`     Last Activity: ${new Date(Number(leaderboard.lastActivities[i]) * 1000).toLocaleString()}`);
      console.log("");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

async function claimReward(contract) {
  console.log("\n🎁 Reward Tiers:");
  console.log("  1 = Bronze (100+ points)");
  console.log("  2 = Silver (500+ points)");
  console.log("  3 = Gold (1,000+ points)");
  console.log("  4 = Platinum (2,500+ points)\n");

  const tier = await question("Enter reward tier to claim (1-4): ");

  try {
    console.log("\n⏳ Claiming reward...");
    const tx = await contract.claimReward(parseInt(tier));
    console.log("   Transaction sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ Reward claim processed!");
    console.log("   Gas used:", receipt.gasUsed.toString());
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

async function viewPublicStats(contract) {
  console.log("\n🌍 Public Statistics:");
  try {
    const stats = await contract.getPublicStats();
    console.log("  Total Users:", stats.totalUsers.toString());
    console.log("  Total Submissions:", stats.totalSubmissions.toString());
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

async function getMyUserId(contract) {
  console.log("\n🆔 Your User ID:");
  try {
    const userId = await contract.getMyUserId();
    if (userId.toString() === "0") {
      console.log("  You are not registered yet. Please register first.");
    } else {
      console.log("  User ID:", userId.toString());
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

async function main() {
  console.log("\n===========================================");
  console.log("🚀 Privacy Waste Rewards - Contract Interaction");
  console.log("===========================================\n");

  const [signer] = await ethers.getSigners();
  console.log("📋 Your Address:", signer.address);
  console.log("📋 Network:", network.name);

  const contract = await loadContract();
  console.log("📋 Contract Address:", await contract.getAddress());

  let running = true;
  while (running) {
    await displayMenu();
    const choice = await question("Select an option: ");

    switch (choice) {
      case "1":
        await viewContractInfo(contract);
        break;
      case "2":
        await registerUser(contract);
        break;
      case "3":
        await submitWaste(contract);
        break;
      case "4":
        await viewMyStats(contract);
        break;
      case "5":
        await viewMySubmissions(contract);
        break;
      case "6":
        await viewLeaderboard(contract);
        break;
      case "7":
        await claimReward(contract);
        break;
      case "8":
        await viewPublicStats(contract);
        break;
      case "9":
        await getMyUserId(contract);
        break;
      case "0":
        running = false;
        console.log("\n👋 Goodbye!\n");
        break;
      default:
        console.log("\n❌ Invalid option. Please try again.");
    }
  }

  rl.close();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error);
    rl.close();
    process.exit(1);
  });
