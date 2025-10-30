// Privacy Waste Rewards DApp
class PrivacyWasteRewardsApp {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.userAddress = null;
        this.userId = null;

        // Contract configuration - Update with your deployed contract address
        this.contractAddress = "0x8EAB26B5C6E8Efe05D30b479C483802D2Ab15c14"; // Updated deployed contract address
        this.contractABI = [
            "function registerAnonymousUser() external returns (uint32)",
            "function submitWasteClassification(uint8 _category, uint8 _quantity) external",
            "function getMyEncryptedStats() external view returns (uint32 totalPoints, uint32 recyclableCount, uint32 organicCount, uint32 hazardousCount, uint32 generalCount)",
            "function getMySubmission(uint256 _submissionId) external view returns (uint8 category, uint8 quantity, uint8 points, uint256 timestamp, bool verified)",
            "function getMySubmissionCount() external view returns (uint256)",
            "function getMyUserId() external view returns (uint32)",
            "function getPublicStats() external view returns (uint32 totalUsers, uint256 totalSubmissions)",
            "function getLeaderboard() external view returns (uint32[] memory userIds, uint32[] memory encryptedPoints, uint256[] memory lastActivities)",
            "function claimReward(uint32 _rewardTier) external",
            "function totalParticipants() external view returns (uint32)",
            "event UserRegistered(uint32 indexed userId, uint256 timestamp)",
            "event WasteClassified(uint32 indexed userId, uint256 submissionId)",
            "event PointsAwarded(uint32 indexed userId, uint8 points)",
            "event RewardClaimed(uint32 indexed userId, uint256 amount)",
            "event LeaderboardUpdated(uint32 indexed userId)"
        ];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkWalletConnection();
    }

    setupEventListeners() {
        document.getElementById('connectWallet').addEventListener('click', () => this.connectWallet());
        document.getElementById('registerUser').addEventListener('click', () => this.registerUser());
        document.getElementById('submitWaste').addEventListener('click', () => this.submitWasteClassification());
        document.getElementById('loadStats').addEventListener('click', () => this.loadUserStats());
        document.getElementById('loadPublicStats').addEventListener('click', () => this.loadPublicStats());
        document.getElementById('loadLeaderboard').addEventListener('click', () => this.loadLeaderboard());
        document.getElementById('loadHistory').addEventListener('click', () => this.loadSubmissionHistory());
        document.getElementById('claimReward').addEventListener('click', () => this.claimReward());

        // Listen for account changes
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    this.disconnect();
                } else {
                    this.userAddress = accounts[0];
                    this.updateUI();
                    this.loadUserId();
                }
            });

            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
        }
    }

    async checkWalletConnection() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    await this.connectWallet();
                }
            } catch (error) {
                console.error('Error checking wallet connection:', error);
            }
        } else {
            this.showStatus('Please install MetaMask to use this application', 'error');
        }
    }

    async connectWallet() {
        try {
            if (typeof window.ethereum === 'undefined') {
                throw new Error('MetaMask is not installed');
            }

            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

            // Create provider and signer
            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            this.signer = this.provider.getSigner();
            this.userAddress = accounts[0];

            // Check network
            const network = await this.provider.getNetwork();

            // Validate contract address
            if (this.contractAddress === "YOUR_CONTRACT_ADDRESS_HERE" || this.contractAddress === "0x0000000000000000000000000000000000000000") {
                throw new Error('Please update the contract address in app.js');
            }

            // Create contract instance
            this.contract = new ethers.Contract(this.contractAddress, this.contractABI, this.signer);

            this.updateUI();
            await this.loadUserId();

            this.showStatus('Wallet connected successfully!', 'success');

            // Enable buttons
            document.getElementById('registerUser').disabled = false;
            document.getElementById('submitWaste').disabled = this.userId === 0;
            document.getElementById('loadStats').disabled = this.userId === 0;
            document.getElementById('loadHistory').disabled = this.userId === 0;
            document.getElementById('claimReward').disabled = this.userId === 0;

        } catch (error) {
            console.error('Error connecting wallet:', error);
            this.showStatus(`Failed to connect wallet: ${error.message}`, 'error');
        }
    }

    async loadUserId() {
        try {
            if (!this.contract) return;

            const userId = await this.contract.getMyUserId();
            this.userId = userId.toNumber();

            document.getElementById('userId').textContent = this.userId > 0 ? this.userId : 'Not registered';

            // Update button states
            if (this.userId > 0) {
                document.getElementById('registerUser').textContent = 'Already Registered';
                document.getElementById('registerUser').disabled = true;
                document.getElementById('submitWaste').disabled = false;
                document.getElementById('loadStats').disabled = false;
                document.getElementById('loadHistory').disabled = false;
                document.getElementById('claimReward').disabled = false;
            }
        } catch (error) {
            console.error('Error loading user ID:', error);
            this.userId = 0;
        }
    }

    updateUI() {
        if (this.userAddress) {
            document.getElementById('userAddress').textContent = `${this.userAddress.substring(0, 6)}...${this.userAddress.substring(38)}`;
            document.getElementById('walletInfo').classList.remove('hidden');
            document.getElementById('connectWallet').textContent = 'Connected';
            document.getElementById('connectWallet').disabled = true;
        }

        if (this.provider) {
            this.provider.getNetwork().then(network => {
                document.getElementById('networkName').textContent = network.name;
            });
        }
    }

    disconnect() {
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.userAddress = null;
        this.userId = 0;

        document.getElementById('walletInfo').classList.add('hidden');
        document.getElementById('connectWallet').textContent = 'Connect MetaMask';
        document.getElementById('connectWallet').disabled = false;
        document.getElementById('userId').textContent = 'Not registered';

        // Disable buttons
        document.getElementById('registerUser').disabled = true;
        document.getElementById('submitWaste').disabled = true;
        document.getElementById('loadStats').disabled = true;
        document.getElementById('loadHistory').disabled = true;
        document.getElementById('claimReward').disabled = true;

        this.showStatus('Wallet disconnected', 'info');
    }

    async registerUser() {
        try {
            if (!this.contract) {
                throw new Error('Contract not connected');
            }

            this.showStatus('Registering anonymous user...', 'info');

            const tx = await this.contract.registerAnonymousUser();
            await tx.wait();

            await this.loadUserId();
            this.showStatus('Anonymous user registered successfully!', 'success');

        } catch (error) {
            console.error('Error registering user:', error);
            this.showStatus(`Registration failed: ${error.message}`, 'error');
        }
    }

    async submitWasteClassification() {
        try {
            if (!this.contract || this.userId === 0) {
                throw new Error('User not registered');
            }

            const category = parseInt(document.getElementById('wasteCategory').value);
            const quantity = parseInt(document.getElementById('quantity').value);

            if (quantity < 1 || quantity > 100) {
                throw new Error('Quantity must be between 1 and 100');
            }

            this.showSubmissionStatus('Submitting waste classification...', 'info');

            const tx = await this.contract.submitWasteClassification(category, quantity);
            await tx.wait();

            this.showSubmissionStatus('Waste classification submitted successfully!', 'success');

            // Reset form
            document.getElementById('quantity').value = 1;

        } catch (error) {
            console.error('Error submitting waste:', error);
            this.showSubmissionStatus(`Submission failed: ${error.message}`, 'error');
        }
    }

    async loadUserStats() {
        try {
            if (!this.contract || this.userId === 0) {
                throw new Error('User not registered');
            }

            const stats = await this.contract.getMyEncryptedStats();
            const submissionCount = await this.contract.getMySubmissionCount();

            // Note: These are encrypted values, in a real app you'd need to decrypt them
            document.getElementById('totalPoints').textContent = 'Encrypted';
            document.getElementById('recyclableCount').textContent = 'Encrypted';
            document.getElementById('organicCount').textContent = 'Encrypted';
            document.getElementById('hazardousCount').textContent = 'Encrypted';
            document.getElementById('generalCount').textContent = 'Encrypted';
            document.getElementById('submissionCount').textContent = submissionCount.toString();

            document.getElementById('userStats').classList.remove('hidden');

        } catch (error) {
            console.error('Error loading user stats:', error);
            this.showStatus(`Failed to load stats: ${error.message}`, 'error');
        }
    }

    async loadPublicStats() {
        try {
            if (!this.contract) {
                throw new Error('Contract not connected');
            }

            const stats = await this.contract.getPublicStats();

            document.getElementById('globalUsers').textContent = stats.totalUsers.toString();
            document.getElementById('globalSubmissions').textContent = stats.totalSubmissions.toString();

        } catch (error) {
            console.error('Error loading public stats:', error);
            this.showStatus(`Failed to load global stats: ${error.message}`, 'error');
        }
    }

    async loadLeaderboard() {
        try {
            if (!this.contract) {
                throw new Error('Contract not connected');
            }

            const leaderboard = await this.contract.getLeaderboard();
            const leaderboardDiv = document.getElementById('leaderboard');

            if (leaderboard.userIds.length === 0) {
                leaderboardDiv.innerHTML = '<p>No users on leaderboard yet</p>';
                return;
            }

            let html = '';
            for (let i = 0; i < leaderboard.userIds.length; i++) {
                const userId = leaderboard.userIds[i];
                const lastActivity = new Date(leaderboard.lastActivities[i].toNumber() * 1000).toLocaleDateString();

                html += `
                    <div class="leaderboard-entry">
                        <div>
                            <strong>User #${userId}</strong>
                            <br><small>Last active: ${lastActivity}</small>
                        </div>
                        <div>
                            <strong>Points: Encrypted</strong>
                        </div>
                    </div>
                `;
            }

            leaderboardDiv.innerHTML = html;

        } catch (error) {
            console.error('Error loading leaderboard:', error);
            this.showStatus(`Failed to load leaderboard: ${error.message}`, 'error');
        }
    }

    async loadSubmissionHistory() {
        try {
            if (!this.contract || this.userId === 0) {
                throw new Error('User not registered');
            }

            const submissionCount = await this.contract.getMySubmissionCount();
            const historyDiv = document.getElementById('submissionHistory');

            if (submissionCount.eq(0)) {
                historyDiv.innerHTML = '<p>No submissions yet</p>';
                return;
            }

            let html = '';
            for (let i = 0; i < submissionCount.toNumber(); i++) {
                try {
                    const submission = await this.contract.getMySubmission(i);
                    const timestamp = new Date(submission.timestamp.toNumber() * 1000);
                    const verified = submission.verified ? '✅' : '⏳';

                    html += `
                        <div class="submission-item">
                            <div><strong>Submission #${i + 1}</strong> ${verified}</div>
                            <div>Category: Encrypted | Quantity: Encrypted | Points: Encrypted</div>
                            <div><small>${timestamp.toLocaleString()}</small></div>
                        </div>
                    `;
                } catch (error) {
                    console.error(`Error loading submission ${i}:`, error);
                }
            }

            historyDiv.innerHTML = html;

        } catch (error) {
            console.error('Error loading submission history:', error);
            this.showStatus(`Failed to load history: ${error.message}`, 'error');
        }
    }

    async claimReward() {
        try {
            if (!this.contract || this.userId === 0) {
                throw new Error('User not registered');
            }

            const rewardTier = parseInt(document.getElementById('rewardTier').value);

            this.showRewardStatus('Claiming reward...', 'info');

            const tx = await this.contract.claimReward(rewardTier);
            await tx.wait();

            this.showRewardStatus('Reward claimed successfully!', 'success');

        } catch (error) {
            console.error('Error claiming reward:', error);
            this.showRewardStatus(`Reward claim failed: ${error.message}`, 'error');
        }
    }

    showStatus(message, type) {
        const statusDiv = document.getElementById('connectionStatus');
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
    }

    showSubmissionStatus(message, type) {
        const statusDiv = document.getElementById('submissionStatus');
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
    }

    showRewardStatus(message, type) {
        const statusDiv = document.getElementById('rewardStatus');
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
    }

    showRegistrationStatus(message, type) {
        const statusDiv = document.getElementById('registrationStatus');
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait for ethers to be available
    if (typeof ethers === 'undefined') {
        console.error('Ethers.js not loaded');
        document.getElementById('connectionStatus').textContent = 'Error: Ethers.js library not loaded';
        document.getElementById('connectionStatus').className = 'status error';
        return;
    }

    console.log('Ethers.js loaded successfully');
    new PrivacyWasteRewardsApp();
});