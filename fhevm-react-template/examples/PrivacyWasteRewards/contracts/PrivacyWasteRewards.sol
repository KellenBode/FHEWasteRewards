// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, euint32, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract PrivacyWasteRewards is SepoliaConfig {

    address public owner;
    uint32 public totalParticipants;
    uint32 public nextUserId;

    // Waste categories: 1=Recyclable, 2=Organic, 3=Hazardous, 4=General
    uint8 constant RECYCLABLE = 1;
    uint8 constant ORGANIC = 2;
    uint8 constant HAZARDOUS = 3;
    uint8 constant GENERAL = 4;

    // Reward points for different waste types
    uint8 constant RECYCLABLE_POINTS = 10;
    uint8 constant ORGANIC_POINTS = 8;
    uint8 constant HAZARDOUS_POINTS = 15;
    uint8 constant GENERAL_POINTS = 5;

    struct AnonymousUser {
        euint32 totalPoints;
        euint32 recyclableCount;
        euint32 organicCount;
        euint32 hazardousCount;
        euint32 generalCount;
        bool isRegistered;
        uint256 registrationTime;
    }

    struct WasteSubmission {
        euint8 wasteCategory;
        euint8 quantity;
        euint8 pointsEarned;
        uint256 timestamp;
        bool verified;
    }

    struct LeaderboardEntry {
        uint32 userId;
        euint32 encryptedPoints;
        uint256 lastActivity;
    }

    mapping(uint32 => AnonymousUser) public anonymousUsers;
    mapping(uint32 => mapping(uint256 => WasteSubmission)) public userSubmissions;
    mapping(uint32 => uint256) public userSubmissionCount;
    mapping(address => uint32) private addressToUserId;

    // Privacy-preserving leaderboard
    LeaderboardEntry[] public leaderboard;

    event UserRegistered(uint32 indexed userId, uint256 timestamp);
    event WasteClassified(uint32 indexed userId, uint256 submissionId);
    event PointsAwarded(uint32 indexed userId, uint8 points);
    event RewardClaimed(uint32 indexed userId, uint256 amount);
    event LeaderboardUpdated(uint32 indexed userId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier onlyRegisteredUser() {
        uint32 userId = addressToUserId[msg.sender];
        require(userId != 0 && anonymousUsers[userId].isRegistered, "User not registered");
        _;
    }

    constructor() {
        owner = msg.sender;
        nextUserId = 1;
        totalParticipants = 0;
    }

    // Anonymous user registration
    function registerAnonymousUser() external returns (uint32) {
        require(addressToUserId[msg.sender] == 0, "User already registered");

        uint32 userId = nextUserId++;
        addressToUserId[msg.sender] = userId;

        // Initialize with encrypted zero values
        euint32 zeroPoints = FHE.asEuint32(0);
        euint32 zeroCount = FHE.asEuint32(0);

        anonymousUsers[userId] = AnonymousUser({
            totalPoints: zeroPoints,
            recyclableCount: zeroCount,
            organicCount: zeroCount,
            hazardousCount: zeroCount,
            generalCount: zeroCount,
            isRegistered: true,
            registrationTime: block.timestamp
        });

        // Set FHE permissions
        FHE.allowThis(zeroPoints);
        FHE.allow(zeroPoints, msg.sender);
        FHE.allowThis(zeroCount);
        FHE.allow(zeroCount, msg.sender);

        totalParticipants++;

        // Add to leaderboard
        leaderboard.push(LeaderboardEntry({
            userId: userId,
            encryptedPoints: zeroPoints,
            lastActivity: block.timestamp
        }));

        emit UserRegistered(userId, block.timestamp);
        return userId;
    }

    // Submit waste classification (encrypted)
    function submitWasteClassification(
        uint8 _category,
        uint8 _quantity
    ) external onlyRegisteredUser {
        require(_category >= 1 && _category <= 4, "Invalid waste category");
        require(_quantity > 0 && _quantity <= 100, "Invalid quantity");

        uint32 userId = addressToUserId[msg.sender];
        uint256 submissionId = userSubmissionCount[userId]++;

        // Calculate points based on category
        uint8 pointsPerItem = _getPointsForCategory(_category);
        uint8 totalPoints = pointsPerItem * _quantity;

        // Encrypt the submission data
        euint8 encryptedCategory = FHE.asEuint8(_category);
        euint8 encryptedQuantity = FHE.asEuint8(_quantity);
        euint8 encryptedPoints = FHE.asEuint8(totalPoints);

        // Store encrypted submission
        userSubmissions[userId][submissionId] = WasteSubmission({
            wasteCategory: encryptedCategory,
            quantity: encryptedQuantity,
            pointsEarned: encryptedPoints,
            timestamp: block.timestamp,
            verified: true
        });

        // Update user stats (encrypted operations)
        AnonymousUser storage user = anonymousUsers[userId];
        user.totalPoints = FHE.add(user.totalPoints, FHE.asEuint32(totalPoints));

        // Update category-specific counts
        euint32 quantityAsUint32 = FHE.asEuint32(_quantity);
        if (_category == RECYCLABLE) {
            user.recyclableCount = FHE.add(user.recyclableCount, quantityAsUint32);
        } else if (_category == ORGANIC) {
            user.organicCount = FHE.add(user.organicCount, quantityAsUint32);
        } else if (_category == HAZARDOUS) {
            user.hazardousCount = FHE.add(user.hazardousCount, quantityAsUint32);
        } else if (_category == GENERAL) {
            user.generalCount = FHE.add(user.generalCount, quantityAsUint32);
        }

        // Set FHE permissions
        FHE.allowThis(encryptedCategory);
        FHE.allowThis(encryptedQuantity);
        FHE.allowThis(encryptedPoints);
        FHE.allow(encryptedCategory, msg.sender);
        FHE.allow(encryptedQuantity, msg.sender);
        FHE.allow(encryptedPoints, msg.sender);

        FHE.allowThis(user.totalPoints);
        FHE.allow(user.totalPoints, msg.sender);

        // Update leaderboard
        _updateLeaderboard(userId, user.totalPoints);

        emit WasteClassified(userId, submissionId);
        emit PointsAwarded(userId, totalPoints);
    }

    // Get user's encrypted points (only accessible by the user)
    function getMyEncryptedStats() external view onlyRegisteredUser returns (
        euint32 totalPoints,
        euint32 recyclableCount,
        euint32 organicCount,
        euint32 hazardousCount,
        euint32 generalCount
    ) {
        uint32 userId = addressToUserId[msg.sender];
        AnonymousUser storage user = anonymousUsers[userId];

        return (
            user.totalPoints,
            user.recyclableCount,
            user.organicCount,
            user.hazardousCount,
            user.generalCount
        );
    }

    // Get submission details (encrypted, only for the user)
    function getMySubmission(uint256 _submissionId) external view onlyRegisteredUser returns (
        euint8 category,
        euint8 quantity,
        euint8 points,
        uint256 timestamp,
        bool verified
    ) {
        uint32 userId = addressToUserId[msg.sender];
        require(_submissionId < userSubmissionCount[userId], "Invalid submission ID");

        WasteSubmission storage submission = userSubmissions[userId][_submissionId];
        return (
            submission.wasteCategory,
            submission.quantity,
            submission.pointsEarned,
            submission.timestamp,
            submission.verified
        );
    }

    // Privacy-preserving leaderboard (shows encrypted points)
    function getLeaderboard() external view returns (
        uint32[] memory userIds,
        euint32[] memory encryptedPoints,
        uint256[] memory lastActivities
    ) {
        uint256 length = leaderboard.length;
        userIds = new uint32[](length);
        encryptedPoints = new euint32[](length);
        lastActivities = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            userIds[i] = leaderboard[i].userId;
            encryptedPoints[i] = leaderboard[i].encryptedPoints;
            lastActivities[i] = leaderboard[i].lastActivity;
        }

        return (userIds, encryptedPoints, lastActivities);
    }

    // Reward redemption (simplified - would integrate with token contract)
    function claimReward(uint32 _rewardTier) external onlyRegisteredUser {
        uint32 userId = addressToUserId[msg.sender];
        AnonymousUser storage user = anonymousUsers[userId];

        // In a real implementation, this would decrypt points and check eligibility
        // For now, we emit an event for off-chain processing
        emit RewardClaimed(userId, _rewardTier);
    }

    // Internal function to get points for waste category
    function _getPointsForCategory(uint8 _category) private pure returns (uint8) {
        if (_category == RECYCLABLE) return RECYCLABLE_POINTS;
        if (_category == ORGANIC) return ORGANIC_POINTS;
        if (_category == HAZARDOUS) return HAZARDOUS_POINTS;
        if (_category == GENERAL) return GENERAL_POINTS;
        return 0;
    }

    // Update leaderboard position
    function _updateLeaderboard(uint32 _userId, euint32 _newPoints) private {
        // Find and update existing entry or add new one
        for (uint256 i = 0; i < leaderboard.length; i++) {
            if (leaderboard[i].userId == _userId) {
                leaderboard[i].encryptedPoints = _newPoints;
                leaderboard[i].lastActivity = block.timestamp;
                emit LeaderboardUpdated(_userId);
                return;
            }
        }
    }

    // Get user's submission count
    function getMySubmissionCount() external view onlyRegisteredUser returns (uint256) {
        uint32 userId = addressToUserId[msg.sender];
        return userSubmissionCount[userId];
    }

    // Get my user ID
    function getMyUserId() external view returns (uint32) {
        return addressToUserId[msg.sender];
    }

    // Get public stats
    function getPublicStats() external view returns (
        uint32 totalUsers,
        uint256 totalSubmissions
    ) {
        uint256 submissions = 0;
        for (uint32 i = 1; i < nextUserId; i++) {
            submissions += userSubmissionCount[i];
        }

        return (totalParticipants, submissions);
    }

    // Admin function to verify waste submissions (could be automated)
    function verifySubmission(uint32 _userId, uint256 _submissionId, bool _verified) external onlyOwner {
        require(_submissionId < userSubmissionCount[_userId], "Invalid submission ID");
        userSubmissions[_userId][_submissionId].verified = _verified;
    }

    // Emergency functions
    function pause() external onlyOwner {
        // Pause contract functionality if needed
    }

    function unpause() external onlyOwner {
        // Resume contract functionality
    }
}