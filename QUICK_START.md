# Quick Start Guide

Fast track to deploying and using Privacy Waste Rewards contract.

---

## ⚡ 5-Minute Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
# Copy example file
cp .env.example .env

# Edit .env and add:
# - SEPOLIA_RPC_URL
# - PRIVATE_KEY
# - ETHERSCAN_API_KEY
```

### 3. Get Testnet ETH
Visit: https://sepoliafaucet.com/

### 4. Compile
```bash
npm run compile
```

### 5. Deploy
```bash
npm run deploy
```

### 6. Verify
```bash
npm run verify
```

### 7. Test
```bash
npm run simulate
```

✅ **Done!** Your contract is deployed and verified.

---

## 🎯 Essential Commands

| Action | Command |
|--------|---------|
| Compile contracts | `npm run compile` |
| Deploy to Sepolia | `npm run deploy` |
| Verify on Etherscan | `npm run verify` |
| Interactive mode | `npm run interact` |
| Run simulation | `npm run simulate` |
| Start local node | `npm run node` |
| Clean artifacts | `npm run clean` |

---

## 📋 Deployment Checklist

- [ ] Node.js v18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` configured with:
  - [ ] SEPOLIA_RPC_URL
  - [ ] PRIVATE_KEY
  - [ ] ETHERSCAN_API_KEY
- [ ] Testnet ETH acquired (0.1+ ETH)
- [ ] Contracts compiled (`npm run compile`)
- [ ] Deployed to network (`npm run deploy`)
- [ ] Verified on Etherscan (`npm run verify`)
- [ ] Tested interaction (`npm run simulate`)

---

## 🔗 Important Links

### Current Deployment
- **Contract**: `0x8EAB26B5C6E8Efe05D30b479C483802D2Ab15c14`
- **Network**: Sepolia Testnet
- **Explorer**: https://sepolia.etherscan.io/address/0x8EAB26B5C6E8Efe05D30b479C483802D2Ab15c14

### Faucets
- Sepolia: https://sepoliafaucet.com/
- Alchemy: https://sepoliafaucet.com/
- Infura: https://www.infura.io/faucet/sepolia

### Tools
- Etherscan API: https://etherscan.io/myapikey
- Alchemy Dashboard: https://dashboard.alchemy.com/
- Infura Dashboard: https://infura.io/dashboard

---

## 🆘 Quick Troubleshooting

### Deployment Fails
```bash
# Check balance
# Need 0.1+ ETH on Sepolia

# Verify .env configuration
cat .env
```

### Verification Fails
```bash
# Wait 1-2 minutes after deployment
# Then retry:
npm run verify
```

### Compilation Errors
```bash
npm run clean
npm install
npm run compile
```

---

## 📖 Documentation

- **Full Deployment Guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Hardhat Setup**: See [HARDHAT_SETUP.md](./HARDHAT_SETUP.md)
- **Contract Details**: See [README.md](./README.md)

---

## 🎮 Interactive Usage Example

```bash
npm run interact

# Menu appears:
# 1. View Contract Info
# 2. Register Anonymous User  ← Start here
# 3. Submit Waste Classification
# 4. View My Stats
# ...

# Select option 2 to register
# Then option 3 to submit waste
# Then option 4 to view stats
```

---

## 🤖 Automated Testing Example

```bash
npm run simulate

# Runs complete workflow:
# ✅ User registration
# ✅ Waste submissions (all categories)
# ✅ Stats retrieval
# ✅ Leaderboard check
# ✅ Reward claim
```

---

## 🔐 Contract Functions Quick Reference

### User Functions
```javascript
// Register (one-time)
await contract.registerAnonymousUser();

// Submit waste
await contract.submitWasteClassification(1, 5); // category, quantity

// Get your stats
await contract.getMyEncryptedStats();

// Get your ID
await contract.getMyUserId();

// View submission
await contract.getMySubmission(0);

// Claim reward
await contract.claimReward(1); // tier
```

### Public Functions
```javascript
// Public stats
await contract.getPublicStats();

// Leaderboard
await contract.getLeaderboard();
```

### Waste Categories
- `1` = Recyclable (10 points/item)
- `2` = Organic (8 points/item)
- `3` = Hazardous (15 points/item)
- `4` = General (5 points/item)

### Reward Tiers
- `1` = Bronze (100+ points)
- `2` = Silver (500+ points)
- `3` = Gold (1,000+ points)
- `4` = Platinum (2,500+ points)

---

## 💡 Pro Tips

1. **Test Locally First**: Use `npm run node` + `npm run deploy:local`
2. **Save Gas**: Batch operations when possible
3. **Monitor Events**: Check Etherscan for emitted events
4. **Backup Keys**: Save private keys securely
5. **Use Scripts**: Automate with custom scripts in `scripts/`

---

## 🚀 Production Deployment

For mainnet deployment:

1. ✅ Complete security audit
2. ✅ Test extensively on testnet
3. ✅ Use hardware wallet for deployment
4. ✅ Verify contract immediately after deployment
5. ✅ Monitor contract activity
6. ✅ Set up alerts for important events

⚠️ **Never deploy to mainnet without thorough testing!**

---

*Get started in minutes with Privacy Waste Rewards* ⚡🔐
