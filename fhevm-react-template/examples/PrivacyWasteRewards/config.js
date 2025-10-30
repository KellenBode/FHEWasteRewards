// Configuration for Privacy Waste Rewards DApp
const CONFIG = {
    // Network Configuration
    NETWORKS: {
        sepolia: {
            chainId: '0xaa36a7',
            chainName: 'Sepolia Testnet',
            nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18
            },
            rpcUrls: ['https://sepolia.infura.io/v3/'],
            blockExplorerUrls: ['https://sepolia.etherscan.io/']
        }
    },

    // Contract Configuration - Update with your deployed contract address
    CONTRACT: {
        address: '0x8EAB26B5C6E8Efe05D30b479C483802D2Ab15c14', // Updated deployed contract address
        network: 'sepolia'
    },

    // Waste Categories
    WASTE_CATEGORIES: {
        1: { name: 'Recyclable', icon: '🔄', points: 10, color: '#68d391' },
        2: { name: 'Organic', icon: '🌿', points: 8, color: '#9ae6b4' },
        3: { name: 'Hazardous', icon: '⚠️', points: 15, color: '#fc8181' },
        4: { name: 'General', icon: '🗑️', points: 5, color: '#a0aec0' }
    },

    // Reward Tiers
    REWARD_TIERS: {
        1: { name: 'Bronze', minPoints: 100, description: 'Basic rewards for consistent participation' },
        2: { name: 'Silver', minPoints: 500, description: 'Enhanced rewards for active users' },
        3: { name: 'Gold', minPoints: 1000, description: 'Premium rewards for dedicated users' },
        4: { name: 'Platinum', minPoints: 2500, description: 'Exclusive rewards for top contributors' }
    }
};