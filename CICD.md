# CI/CD Documentation - Privacy Waste Rewards

Comprehensive guide for Continuous Integration and Continuous Deployment workflows.

---

## 📋 Table of Contents
- [Overview](#overview)
- [GitHub Actions Workflows](#github-actions-workflows)
- [Code Quality Tools](#code-quality-tools)
- [Testing Automation](#testing-automation)
- [Deployment Automation](#deployment-automation)
- [Security Scanning](#security-scanning)
- [Configuration](#configuration)

---

## 🎯 Overview

### CI/CD Infrastructure

**Framework**: GitHub Actions
**Node.js Versions**: 18.x, 20.x
**Testing**: Hardhat + Mocha + Chai
**Code Quality**: ESLint, Solhint, Prettier
**Coverage**: Codecov integration
**Security**: npm audit, Slither

### Workflow Triggers

All workflows run automatically on:
- ✅ Push to `main` branch
- ✅ Push to `develop` branch
- ✅ All pull requests to `main` or `develop`

---

## 🔄 GitHub Actions Workflows

### 1. test.yml - Main Testing Workflow

**Purpose**: Run comprehensive tests across multiple Node.js versions

**Triggers**:
```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
```

**Jobs**:

#### Job 1: Test (Matrix Strategy)
```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x]
```

**Steps**:
1. ✅ Checkout code
2. ✅ Setup Node.js (18.x or 20.x)
3. ✅ Install dependencies
4. ✅ Compile contracts
5. ✅ Run tests
6. ✅ Generate coverage
7. ✅ Upload to Codecov

#### Job 2: Lint Solidity
**Steps**:
1. ✅ Checkout code
2. ✅ Setup Node.js 20.x
3. ✅ Install dependencies
4. ✅ Run Solhint

#### Job 3: Lint JavaScript
**Steps**:
1. ✅ Checkout code
2. ✅ Setup Node.js 20.x
3. ✅ Install dependencies
4. ✅ Run ESLint

#### Job 4: Security Check
**Steps**:
1. ✅ Checkout code
2. ✅ Setup Node.js 20.x
3. ✅ Install dependencies
4. ✅ Run npm audit
5. ✅ Run Slither analysis

#### Job 5: Gas Report
**Steps**:
1. ✅ Checkout code
2. ✅ Setup Node.js 20.x
3. ✅ Install dependencies
4. ✅ Compile contracts
5. ✅ Generate gas report
6. ✅ Upload artifact

**File Location**: `.github/workflows/test.yml`

---

### 2. coverage.yml - Code Coverage Workflow

**Purpose**: Generate and report code coverage

**Triggers**:
```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

**Steps**:
1. ✅ Checkout code
2. ✅ Setup Node.js 20.x
3. ✅ Install dependencies
4. ✅ Run coverage
5. ✅ Upload to Codecov
6. ✅ Generate coverage badges
7. ✅ Comment on PR (if applicable)

**File Location**: `.github/workflows/coverage.yml`

---

### 3. deploy.yml - Deployment Workflow

**Purpose**: Manual deployment to networks

**Trigger**: Manual workflow dispatch

**Inputs**:
- `network`: Choice of `sepolia` or `localhost`
- `verify`: Boolean to verify on Etherscan

**Steps**:
1. ✅ Checkout code
2. ✅ Setup Node.js 20.x
3. ✅ Install dependencies
4. ✅ Compile contracts
5. ✅ Deploy to selected network
6. ✅ Verify contract (if enabled)
7. ✅ Upload deployment artifacts

**File Location**: `.github/workflows/deploy.yml`

---

## 🛠️ Code Quality Tools

### Solhint Configuration

**File**: `.solhint.json`

**Rules**:
```json
{
  "extends": "solhint:recommended",
  "rules": {
    "compiler-version": ["error", "^0.8.0"],
    "func-visibility": ["warn"],
    "quotes": ["error", "double"],
    "const-name-snakecase": "error",
    "contract-name-camelcase": "error",
    "max-line-length": ["warn", 120]
  }
}
```

**Run Locally**:
```bash
npm run lint:sol          # Check Solidity files
npm run lint:sol:fix      # Auto-fix Solidity files
```

**Ignored Files**: `.solhintignore`
- node_modules/
- artifacts/
- cache/
- coverage/

---

### ESLint Configuration

**File**: `.eslintrc.json`

**Configuration**:
```json
{
  "env": {
    "node": true,
    "mocha": true,
    "es2021": true
  },
  "extends": [
    "standard",
    "plugin:prettier/recommended"
  ]
}
```

**Run Locally**:
```bash
npm run lint:js           # Check JavaScript/TypeScript
npm run lint:js:fix       # Auto-fix JavaScript/TypeScript
```

---

### Prettier Configuration

**File**: `.prettierrc.json`

**Settings**:
```json
{
  "printWidth": 100,
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

**Special Solidity Settings**:
```json
{
  "printWidth": 120,
  "tabWidth": 4,
  "singleQuote": false
}
```

**Run Locally**:
```bash
npm run format            # Format all files
npm run format:check      # Check formatting
```

**Ignored Files**: `.prettierignore`
- node_modules/
- artifacts/
- coverage/
- *.md files

---

## 🧪 Testing Automation

### Local Test Execution

```bash
# Run unit tests
npm test

# Run all tests
npm run test:all

# Run with coverage
npm run test:coverage

# Run with gas reporting
npm run test:gas

# Run Sepolia tests
npm run test:sepolia
```

### CI Test Execution

**Automatic Triggers**:
- Every push to main/develop
- Every pull request

**Test Matrix**:
- Node.js 18.x
- Node.js 20.x

**Coverage Reporting**:
- Automatic upload to Codecov
- PR comments with coverage changes
- Coverage badges generated

---

## 🚀 Deployment Automation

### Manual Deployment

**Via GitHub Actions**:
1. Go to Actions tab
2. Select "Deploy" workflow
3. Click "Run workflow"
4. Choose network (sepolia/localhost)
5. Enable/disable verification
6. Run workflow

**Via Command Line**:
```bash
# Deploy to Sepolia
npm run deploy

# Deploy to localhost
npm run deploy:local

# Verify on Etherscan
npm run verify
```

### Deployment Artifacts

After deployment, artifacts are uploaded:
- Location: GitHub Actions artifacts
- Contains: `deployments/` directory
- Includes: Contract address, transaction hash, network info

---

## 🔒 Security Scanning

### npm Audit

**Runs**: Every test workflow
**Command**: `npm audit --audit-level=moderate`
**Purpose**: Check for known vulnerabilities in dependencies

**Run Locally**:
```bash
npm audit
npm audit fix              # Fix vulnerabilities
```

### Slither Static Analysis

**Runs**: In security-check job
**Purpose**: Static analysis of Solidity code
**Action**: `crytic/slither-action@v0.3.0`

**Install Locally**:
```bash
pip3 install slither-analyzer
```

**Run Locally**:
```bash
slither contracts/
```

---

## ⚙️ Configuration

### Required Secrets

Add these secrets to your GitHub repository:

| Secret | Description | Required For |
|--------|-------------|--------------|
| `CODECOV_TOKEN` | Codecov upload token | Coverage reporting |
| `SEPOLIA_RPC_URL` | Sepolia RPC endpoint | Sepolia deployment |
| `PRIVATE_KEY` | Deployment wallet key | All deployments |
| `ETHERSCAN_API_KEY` | Etherscan API key | Contract verification |
| `COINMARKETCAP_API_KEY` | CoinMarketCap API | Gas price in USD (optional) |

**Adding Secrets**:
1. Go to repository Settings
2. Select Secrets and variables → Actions
3. Click "New repository secret"
4. Add name and value
5. Save

### Environment Variables

**Local Development** (`.env`):
```env
SEPOLIA_RPC_URL=https://rpc.sepolia.org
PRIVATE_KEY=your_private_key
ETHERSCAN_API_KEY=your_etherscan_key
COINMARKETCAP_API_KEY=your_cmc_key
REPORT_GAS=false
```

**CI/CD** (GitHub Secrets):
- Accessed via `${{ secrets.SECRET_NAME }}`
- Never logged or exposed
- Encrypted at rest

---

## 📊 Workflow Status Badges

Add to your README.md:

```markdown
![Tests](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/Tests/badge.svg)
![Coverage](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO/branch/main/graph/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
```

---

## 🔄 Workflow Examples

### Example 1: Push to Main

```
Trigger: git push origin main

Workflows Run:
├── test.yml (Jobs: test, lint-solidity, lint-javascript, security-check, gas-report)
├── coverage.yml (Job: coverage)
└── Results: All tests pass, coverage uploaded, gas report generated
```

### Example 2: Pull Request

```
Trigger: Open PR to main

Workflows Run:
├── test.yml (All jobs)
├── coverage.yml (With PR comment)
└── Results: Tests pass, coverage diff shown in PR
```

### Example 3: Manual Deployment

```
Trigger: Manual workflow dispatch

Workflow: deploy.yml
Inputs:
├── Network: sepolia
└── Verify: true

Steps:
├── Deploy to Sepolia
├── Verify on Etherscan
└── Upload deployment artifacts
```

---

## 🐛 Troubleshooting

### Failed Tests

**Issue**: Tests fail in CI but pass locally

**Solutions**:
1. Check Node.js version mismatch
2. Ensure `npm ci` vs `npm install`
3. Review environment variables
4. Check network timeouts

```bash
# Run with same Node.js version as CI
nvm use 20
npm ci
npm test
```

### Coverage Upload Fails

**Issue**: Codecov upload fails

**Solutions**:
1. Verify `CODECOV_TOKEN` is set
2. Check token permissions
3. Ensure coverage files generated

```bash
# Generate coverage locally
npm run test:coverage
ls -la coverage/
```

### Solhint Errors

**Issue**: Solhint finds issues

**Solutions**:
1. Auto-fix when possible
2. Update `.solhint.json` rules
3. Add `// solhint-disable-next-line` for exceptions

```bash
# Auto-fix
npm run lint:sol:fix

# Check specific file
npx solhint contracts/PrivacyWasteRewards.sol
```

### Deployment Fails

**Issue**: Deployment workflow fails

**Solutions**:
1. Check secrets are set correctly
2. Verify RPC endpoint is working
3. Ensure sufficient balance for gas
4. Check network connectivity

---

## 📝 Best Practices

### 1. Branch Protection

Configure branch protection rules:
- ✅ Require pull request reviews
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Require conversation resolution

### 2. Commit Messages

Follow conventional commits:
```
feat: add new waste category
fix: correct point calculation
docs: update deployment guide
test: add leaderboard tests
ci: update Node.js version
```

### 3. Pull Request Checklist

Before merging:
- [ ] All tests pass
- [ ] Coverage maintained/improved
- [ ] Linting passes
- [ ] Security audit clean
- [ ] Gas costs acceptable
- [ ] Documentation updated

### 4. Code Review

Review focus areas:
- Logic correctness
- Security vulnerabilities
- Gas optimization
- Code clarity
- Test coverage
- Documentation completeness

---

## 📚 Resources

### Documentation
- [GitHub Actions](https://docs.github.com/en/actions)
- [Hardhat Testing](https://hardhat.org/hardhat-runner/docs/guides/test-contracts)
- [Codecov](https://docs.codecov.com/)
- [Solhint](https://github.com/protofire/solhint)
- [ESLint](https://eslint.org/docs/latest/)

### Tools
- [Slither](https://github.com/crytic/slither)
- [Prettier](https://prettier.io/)
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)

---

## ✅ CI/CD Checklist

Setup checklist:

- [x] LICENSE file created
- [x] GitHub Actions workflows configured
  - [x] test.yml (main testing)
  - [x] coverage.yml (coverage reporting)
  - [x] deploy.yml (deployment)
- [x] Code quality tools installed
  - [x] Solhint
  - [x] ESLint
  - [x] Prettier
- [x] Configuration files created
  - [x] .solhint.json
  - [x] .eslintrc.json
  - [x] .prettierrc.json
- [x] Scripts added to package.json
- [x] Security scanning configured
- [x] Gas reporting enabled
- [x] Codecov integration ready

---

**CI/CD Status**: ✅ **COMPLETE AND OPERATIONAL**

*Automated testing, quality checks, and deployment workflows ready* 🔄✨
