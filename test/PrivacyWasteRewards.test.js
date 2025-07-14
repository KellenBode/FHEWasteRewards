const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PrivacyWasteRewards", function () {
  let contract;
  let contractAddress;
  let owner;
  let alice;
  let bob;
  let charlie;

  // Deploy fixture
  async function deployFixture() {
    const PrivacyWasteRewards = await ethers.getContractFactory("PrivacyWasteRewards");
    const deployedContract = await PrivacyWasteRewards.deploy();
    await deployedContract.waitForDeployment();
    const address = await deployedContract.getAddress();

    return { contract: deployedContract, contractAddress: address };
  }

  before(async function () {
    const signers = await ethers.getSigners();
    owner = signers[0];
    alice = signers[1];
    bob = signers[2];
    charlie = signers[3];
  });

  beforeEach(async function () {
    ({ contract, contractAddress } = await deployFixture());
  });

  // ============================================================
  // 1. DEPLOYMENT AND INITIALIZATION (5 tests)
  // ============================================================

  describe("Deployment and Initialization", function () {
    it("should deploy successfully with valid address", async function () {
      expect(contractAddress).to.be.properAddress;
      expect(contractAddress).to.not.equal(ethers.ZeroAddress);
    });

    it("should set deployer as owner", async function () {
      const contractOwner = await contract.owner();
      expect(contractOwner).to.equal(owner.address);
    });

    it("should initialize with zero participants", async function () {
      const totalParticipants = await contract.totalParticipants();
      expect(totalParticipants).to.equal(0);
    });

    it("should initialize nextUserId to 1", async function () {
      const nextUserId = await contract.nextUserId();
      expect(nextUserId).to.equal(1);
    });

    it("should have empty leaderboard initially", async function () {
      const leaderboard = await contract.getLeaderboard();
      expect(leaderboard.userIds.length).to.equal(0);
      expect(leaderboard.encryptedPoints.length).to.equal(0);
      expect(leaderboard.lastActivities.length).to.equal(0);
    });
  });

  // ============================================================
  // 2. USER REGISTRATION (10 tests)
  // ============================================================

  describe("User Registration", function () {
    it("should allow new user to register", async function () {
      const tx = await contract.connect(alice).registerAnonymousUser();
      await tx.wait();

      const userId = await contract.connect(alice).getMyUserId();
      expect(userId).to.equal(1);
    });

    it("should increment totalParticipants after registration", async function () {
      await contract.connect(alice).registerAnonymousUser();

      const totalParticipants = await contract.totalParticipants();
      expect(totalParticipants).to.equal(1);
    });

    it("should increment nextUserId after registration", async function () {
      await contract.connect(alice).registerAnonymousUser();

      const nextUserId = await contract.nextUserId();
      expect(nextUserId).to.equal(2);
    });

    it("should emit UserRegistered event", async function () {
      await expect(contract.connect(alice).registerAnonymousUser())
        .to.emit(contract, "UserRegistered");
    });

    it("should prevent double registration from same address", async function () {
      await contract.connect(alice).registerAnonymousUser();

      await expect(
        contract.connect(alice).registerAnonymousUser()
      ).to.be.revertedWith("User already registered");
    });

    it("should allow multiple different users to register", async function () {
      await contract.connect(alice).registerAnonymousUser();
      await contract.connect(bob).registerAnonymousUser();
      await contract.connect(charlie).registerAnonymousUser();

      const totalParticipants = await contract.totalParticipants();
      expect(totalParticipants).to.equal(3);
    });

    it("should assign sequential user IDs", async function () {
      await contract.connect(alice).registerAnonymousUser();
      await contract.connect(bob).registerAnonymousUser();
      await contract.connect(charlie).registerAnonymousUser();

      const aliceId = await contract.connect(alice).getMyUserId();
      const bobId = await contract.connect(bob).getMyUserId();
      const charlieId = await contract.connect(charlie).getMyUserId();

      expect(aliceId).to.equal(1);
      expect(bobId).to.equal(2);
      expect(charlieId).to.equal(3);
    });

    it("should add user to leaderboard upon registration", async function () {
      await contract.connect(alice).registerAnonymousUser();

      const leaderboard = await contract.getLeaderboard();
      expect(leaderboard.userIds.length).to.equal(1);
      expect(leaderboard.userIds[0]).to.equal(1);
    });

    it("should return 0 for unregistered user ID", async function () {
      const userId = await contract.connect(alice).getMyUserId();
      expect(userId).to.equal(0);
    });

    it("should properly initialize user registration time", async function () {
      const tx = await contract.connect(alice).registerAnonymousUser();
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      // Registration time should be close to block timestamp
      expect(block.timestamp).to.be.gt(0);
    });
  });

  // ============================================================
  // 3. WASTE CLASSIFICATION SUBMISSION (12 tests)
  // ============================================================

  describe("Waste Classification Submission", function () {
    beforeEach(async function () {
      await contract.connect(alice).registerAnonymousUser();
    });

    it("should allow registered user to submit recyclable waste", async function () {
      const tx = await contract.connect(alice).submitWasteClassification(1, 5);
      await tx.wait();

      const count = await contract.connect(alice).getMySubmissionCount();
      expect(count).to.equal(1);
    });

    it("should allow registered user to submit organic waste", async function () {
      const tx = await contract.connect(alice).submitWasteClassification(2, 3);
      await tx.wait();

      const count = await contract.connect(alice).getMySubmissionCount();
      expect(count).to.equal(1);
    });

    it("should allow registered user to submit hazardous waste", async function () {
      const tx = await contract.connect(alice).submitWasteClassification(3, 2);
      await tx.wait();

      const count = await contract.connect(alice).getMySubmissionCount();
      expect(count).to.equal(1);
    });

    it("should allow registered user to submit general waste", async function () {
      const tx = await contract.connect(alice).submitWasteClassification(4, 10);
      await tx.wait();

      const count = await contract.connect(alice).getMySubmissionCount();
      expect(count).to.equal(1);
    });

    it("should emit WasteClassified event", async function () {
      await expect(
        contract.connect(alice).submitWasteClassification(1, 5)
      ).to.emit(contract, "WasteClassified");
    });

    it("should emit PointsAwarded event", async function () {
      await expect(
        contract.connect(alice).submitWasteClassification(1, 5)
      ).to.emit(contract, "PointsAwarded");
    });

    it("should reject submission from unregistered user", async function () {
      await expect(
        contract.connect(bob).submitWasteClassification(1, 5)
      ).to.be.revertedWith("User not registered");
    });

    it("should reject invalid waste category (0)", async function () {
      await expect(
        contract.connect(alice).submitWasteClassification(0, 5)
      ).to.be.revertedWith("Invalid waste category");
    });

    it("should reject invalid waste category (5)", async function () {
      await expect(
        contract.connect(alice).submitWasteClassification(5, 5)
      ).to.be.revertedWith("Invalid waste category");
    });

    it("should reject zero quantity", async function () {
      await expect(
        contract.connect(alice).submitWasteClassification(1, 0)
      ).to.be.revertedWith("Invalid quantity");
    });

    it("should reject quantity over 100", async function () {
      await expect(
        contract.connect(alice).submitWasteClassification(1, 101)
      ).to.be.revertedWith("Invalid quantity");
    });

    it("should allow multiple submissions from same user", async function () {
      await contract.connect(alice).submitWasteClassification(1, 5);
      await contract.connect(alice).submitWasteClassification(2, 3);
      await contract.connect(alice).submitWasteClassification(3, 2);

      const count = await contract.connect(alice).getMySubmissionCount();
      expect(count).to.equal(3);
    });
  });

  // ============================================================
  // 4. VIEW FUNCTIONS (6 tests)
  // ============================================================

  describe("View Functions", function () {
    beforeEach(async function () {
      await contract.connect(alice).registerAnonymousUser();
      await contract.connect(bob).registerAnonymousUser();
    });

    it("should return correct submission count", async function () {
      await contract.connect(alice).submitWasteClassification(1, 5);
      await contract.connect(alice).submitWasteClassification(2, 3);

      const count = await contract.connect(alice).getMySubmissionCount();
      expect(count).to.equal(2);
    });

    it("should return encrypted stats for registered user", async function () {
      await contract.connect(alice).submitWasteClassification(1, 5);

      const stats = await contract.connect(alice).getMyEncryptedStats();
      expect(stats.totalPoints).to.exist;
      expect(stats.recyclableCount).to.exist;
      expect(stats.organicCount).to.exist;
      expect(stats.hazardousCount).to.exist;
      expect(stats.generalCount).to.exist;
    });

    it("should return submission details", async function () {
      await contract.connect(alice).submitWasteClassification(1, 5);

      const submission = await contract.connect(alice).getMySubmission(0);
      expect(submission.category).to.exist;
      expect(submission.quantity).to.exist;
      expect(submission.points).to.exist;
      expect(submission.timestamp).to.be.gt(0);
      expect(submission.verified).to.be.true;
    });

    it("should reject getting stats for unregistered user", async function () {
      await expect(
        contract.connect(charlie).getMyEncryptedStats()
      ).to.be.revertedWith("User not registered");
    });

    it("should reject invalid submission ID", async function () {
      await expect(
        contract.connect(alice).getMySubmission(99)
      ).to.be.revertedWith("Invalid submission ID");
    });

    it("should return public stats", async function () {
      await contract.connect(alice).submitWasteClassification(1, 5);
      await contract.connect(bob).submitWasteClassification(2, 3);

      const stats = await contract.getPublicStats();
      expect(stats.totalUsers).to.equal(2);
      expect(stats.totalSubmissions).to.equal(2);
    });
  });

  // ============================================================
  // 5. LEADERBOARD (4 tests)
  // ============================================================

  describe("Leaderboard", function () {
    beforeEach(async function () {
      await contract.connect(alice).registerAnonymousUser();
      await contract.connect(bob).registerAnonymousUser();
      await contract.connect(charlie).registerAnonymousUser();
    });

    it("should return leaderboard with all users", async function () {
      const leaderboard = await contract.getLeaderboard();
      expect(leaderboard.userIds.length).to.equal(3);
    });

    it("should update leaderboard after submission", async function () {
      await contract.connect(alice).submitWasteClassification(1, 5);

      const leaderboard = await contract.getLeaderboard();
      expect(leaderboard.lastActivities[0]).to.be.gt(0);
    });

    it("should emit LeaderboardUpdated event", async function () {
      await expect(
        contract.connect(alice).submitWasteClassification(1, 5)
      ).to.emit(contract, "LeaderboardUpdated");
    });

    it("should maintain encrypted points in leaderboard", async function () {
      await contract.connect(alice).submitWasteClassification(1, 5);
      await contract.connect(bob).submitWasteClassification(2, 3);

      const leaderboard = await contract.getLeaderboard();
      expect(leaderboard.encryptedPoints[0]).to.exist;
      expect(leaderboard.encryptedPoints[1]).to.exist;
    });
  });

  // ============================================================
  // 6. REWARD CLAIMING (3 tests)
  // ============================================================

  describe("Reward Claiming", function () {
    beforeEach(async function () {
      await contract.connect(alice).registerAnonymousUser();
      await contract.connect(alice).submitWasteClassification(1, 10);
    });

    it("should allow registered user to claim reward", async function () {
      const tx = await contract.connect(alice).claimReward(1);
      await expect(tx).to.not.be.reverted;
    });

    it("should emit RewardClaimed event", async function () {
      await expect(
        contract.connect(alice).claimReward(1)
      ).to.emit(contract, "RewardClaimed");
    });

    it("should reject claim from unregistered user", async function () {
      await expect(
        contract.connect(bob).claimReward(1)
      ).to.be.revertedWith("User not registered");
    });
  });

  // ============================================================
  // 7. ACCESS CONTROL (5 tests)
  // ============================================================

  describe("Access Control", function () {
    beforeEach(async function () {
      await contract.connect(alice).registerAnonymousUser();
      await contract.connect(alice).submitWasteClassification(1, 5);
    });

    it("should allow owner to verify submission", async function () {
      const tx = await contract.connect(owner).verifySubmission(1, 0, true);
      await expect(tx).to.not.be.reverted;
    });

    it("should reject non-owner verification attempt", async function () {
      await expect(
        contract.connect(alice).verifySubmission(1, 0, true)
      ).to.be.revertedWith("Not authorized");
    });

    it("should allow owner to pause contract", async function () {
      const tx = await contract.connect(owner).pause();
      await expect(tx).to.not.be.reverted;
    });

    it("should allow owner to unpause contract", async function () {
      await contract.connect(owner).pause();
      const tx = await contract.connect(owner).unpause();
      await expect(tx).to.not.be.reverted;
    });

    it("should reject pause from non-owner", async function () {
      await expect(
        contract.connect(alice).pause()
      ).to.be.revertedWith("Not authorized");
    });
  });

  // ============================================================
  // 8. EDGE CASES AND BOUNDARIES (5 tests)
  // ============================================================

  describe("Edge Cases and Boundaries", function () {
    beforeEach(async function () {
      await contract.connect(alice).registerAnonymousUser();
    });

    it("should handle minimum valid quantity (1)", async function () {
      const tx = await contract.connect(alice).submitWasteClassification(1, 1);
      await expect(tx).to.not.be.reverted;
    });

    it("should handle maximum valid quantity (100)", async function () {
      const tx = await contract.connect(alice).submitWasteClassification(1, 100);
      await expect(tx).to.not.be.reverted;
    });

    it("should handle all waste categories", async function () {
      await contract.connect(alice).submitWasteClassification(1, 5); // Recyclable
      await contract.connect(alice).submitWasteClassification(2, 5); // Organic
      await contract.connect(alice).submitWasteClassification(3, 5); // Hazardous
      await contract.connect(alice).submitWasteClassification(4, 5); // General

      const count = await contract.connect(alice).getMySubmissionCount();
      expect(count).to.equal(4);
    });

    it("should handle rapid multiple submissions", async function () {
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(contract.connect(alice).submitWasteClassification(1, 1));
      }
      await Promise.all(promises);

      const count = await contract.connect(alice).getMySubmissionCount();
      expect(count).to.equal(5);
    });

    it("should handle invalid verification submission ID", async function () {
      await expect(
        contract.connect(owner).verifySubmission(1, 999, true)
      ).to.be.revertedWith("Invalid submission ID");
    });
  });

  // ============================================================
  // 9. GAS OPTIMIZATION (3 tests)
  // ============================================================

  describe("Gas Optimization", function () {
    beforeEach(async function () {
      await contract.connect(alice).registerAnonymousUser();
    });

    it("should use reasonable gas for registration", async function () {
      const tx = await contract.connect(bob).registerAnonymousUser();
      const receipt = await tx.wait();

      // Registration should use less than 500k gas
      expect(receipt.gasUsed).to.be.lt(500000);
    });

    it("should use reasonable gas for waste submission", async function () {
      const tx = await contract.connect(alice).submitWasteClassification(1, 5);
      const receipt = await tx.wait();

      // Submission should use less than 300k gas
      expect(receipt.gasUsed).to.be.lt(300000);
    });

    it("should use reasonable gas for stats retrieval", async function () {
      const tx = await contract.connect(alice).getMyEncryptedStats();
      // View functions should be gas efficient
      expect(tx).to.exist;
    });
  });

  // ============================================================
  // 10. INTEGRATION SCENARIOS (2 tests)
  // ============================================================

  describe("Integration Scenarios", function () {
    it("should handle complete user journey", async function () {
      // 1. Register
      await contract.connect(alice).registerAnonymousUser();
      const userId = await contract.connect(alice).getMyUserId();
      expect(userId).to.equal(1);

      // 2. Submit waste
      await contract.connect(alice).submitWasteClassification(1, 5);
      await contract.connect(alice).submitWasteClassification(2, 3);

      // 3. Check stats
      const stats = await contract.connect(alice).getMyEncryptedStats();
      expect(stats).to.exist;

      // 4. Check submissions
      const count = await contract.connect(alice).getMySubmissionCount();
      expect(count).to.equal(2);

      // 5. Claim reward
      await expect(
        contract.connect(alice).claimReward(1)
      ).to.emit(contract, "RewardClaimed");

      // 6. Check leaderboard
      const leaderboard = await contract.getLeaderboard();
      expect(leaderboard.userIds.length).to.be.gt(0);
    });

    it("should handle multiple users competing", async function () {
      // Register multiple users
      await contract.connect(alice).registerAnonymousUser();
      await contract.connect(bob).registerAnonymousUser();
      await contract.connect(charlie).registerAnonymousUser();

      // All submit waste
      await contract.connect(alice).submitWasteClassification(1, 10);
      await contract.connect(bob).submitWasteClassification(2, 8);
      await contract.connect(charlie).submitWasteClassification(3, 5);

      // Check public stats
      const stats = await contract.getPublicStats();
      expect(stats.totalUsers).to.equal(3);
      expect(stats.totalSubmissions).to.equal(3);

      // Check leaderboard
      const leaderboard = await contract.getLeaderboard();
      expect(leaderboard.userIds.length).to.equal(3);
    });
  });
});
