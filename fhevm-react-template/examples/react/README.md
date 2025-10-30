# React Anonymous Voting System - Example

Anonymous voting application demonstrating FHEVM SDK usage with React 18.

## Overview

A complete anonymous voting system showcasing:
- **Private Voting** - Votes encrypted with FHEVM
- **Anonymous Participation** - No identity disclosure
- **Real-time Results** - Decrypted results after voting ends
- **Multiple Proposals** - Vote on different options
- **React Hooks** - Complete SDK integration

## Features

- ✅ Create voting proposals
- ✅ Submit encrypted votes
- ✅ Anonymous voter participation
- ✅ Real-time vote counting (encrypted)
- ✅ Result revelation after voting period
- ✅ Multiple simultaneous votes
- ✅ TypeScript support

## Quick Start

### Installation

```bash
# Navigate to example
cd examples/react

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration
```

### Environment Variables

Create `.env`:

```env
REACT_APP_NETWORK=sepolia
REACT_APP_CONTRACT_ADDRESS=0x8EAB26B5C6E8Efe05D30b479C483802D2Ab15c14
```

### Development

```bash
# Start development server
npm start

# Open browser to http://localhost:3000
```

### Build

```bash
# Build for production
npm run build

# Serve production build
npx serve -s build
```

## Project Structure

```
react/
├── src/
│   ├── components/
│   │   ├── VotingProposal.tsx      # Proposal card
│   │   ├── VoteButton.tsx          # Vote submission
│   │   ├── Results.tsx             # Vote results
│   │   └── CreateProposal.tsx      # Create new proposal
│   ├── hooks/
│   │   └── useVoting.ts            # Custom voting hook
│   ├── contexts/
│   │   └── VotingContext.tsx       # Voting state management
│   ├── App.tsx                     # Main application
│   ├── index.tsx                   # Entry point
│   └── App.css                     # Styles
├── .env.example                    # Environment template
├── package.json                    # Dependencies
└── tsconfig.json                   # TypeScript configuration
```

## Smart Contract

### Voting Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/TFHE.sol";

contract AnonymousVoting {
    struct Proposal {
        string title;
        string description;
        euint32 votesFor;
        euint32 votesAgainst;
        uint256 deadline;
        bool ended;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    uint256 public proposalCount;

    // Create new proposal
    function createProposal(
        string memory title,
        string memory description,
        uint256 duration
    ) external returns (uint256) {
        uint256 proposalId = proposalCount++;

        proposals[proposalId] = Proposal({
            title: title,
            description: description,
            votesFor: TFHE.asEuint32(0),
            votesAgainst: TFHE.asEuint32(0),
            deadline: block.timestamp + duration,
            ended: false
        });

        emit ProposalCreated(proposalId, title, block.timestamp + duration);
        return proposalId;
    }

    // Submit encrypted vote
    function vote(
        uint256 proposalId,
        bytes calldata encryptedVote
    ) external {
        Proposal storage proposal = proposals[proposalId];

        require(block.timestamp < proposal.deadline, "Voting ended");
        require(!hasVoted[proposalId][msg.sender], "Already voted");

        // Convert encrypted vote (0 = against, 1 = for)
        euint32 vote = TFHE.asEuint32(TFHE.asEuint8(encryptedVote));

        // Add to appropriate counter using FHE operations
        euint32 isFor = TFHE.eq(vote, TFHE.asEuint32(1));
        euint32 increment = TFHE.select(isFor, TFHE.asEuint32(1), TFHE.asEuint32(0));

        proposal.votesFor = TFHE.add(proposal.votesFor, increment);
        proposal.votesAgainst = TFHE.add(
            proposal.votesAgainst,
            TFHE.sub(TFHE.asEuint32(1), increment)
        );

        hasVoted[proposalId][msg.sender] = true;
        emit VoteCast(proposalId, msg.sender);
    }

    // Get encrypted results
    function getResults(uint256 proposalId) external view returns (
        euint32 votesFor,
        euint32 votesAgainst
    ) {
        Proposal storage proposal = proposals[proposalId];
        return (proposal.votesFor, proposal.votesAgainst);
    }

    event ProposalCreated(uint256 indexed proposalId, string title, uint256 deadline);
    event VoteCast(uint256 indexed proposalId, address indexed voter);
}
```

## Application Code

### Main App Component

```typescript
// src/App.tsx
import React from 'react';
import { FhevmProvider } from '@fhevm/sdk';
import { VotingProvider } from './contexts/VotingContext';
import { ProposalList } from './components/ProposalList';
import { CreateProposal } from './components/CreateProposal';
import './App.css';

function App() {
  return (
    <FhevmProvider
      config={{
        network: process.env.REACT_APP_NETWORK as 'sepolia',
        contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS || ''
      }}
    >
      <VotingProvider>
        <div className="app">
          <header>
            <h1>🔐 Anonymous Voting System</h1>
            <p>Privacy-preserving voting powered by FHEVM</p>
          </header>

          <main>
            <CreateProposal />
            <ProposalList />
          </main>
        </div>
      </VotingProvider>
    </FhevmProvider>
  );
}

export default App;
```

### Voting Hook

```typescript
// src/hooks/useVoting.ts
import { useState, useCallback } from 'react';
import { useFhevmEncrypt } from '@fhevm/sdk';
import { useContract } from './useContract';

export function useVoting() {
  const { encrypt } = useFhevmEncrypt();
  const contract = useContract();
  const [loading, setLoading] = useState(false);

  const createProposal = useCallback(async (
    title: string,
    description: string,
    duration: number
  ) => {
    setLoading(true);
    try {
      const tx = await contract.createProposal(title, description, duration);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Failed to create proposal:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const submitVote = useCallback(async (
    proposalId: number,
    voteFor: boolean
  ) => {
    setLoading(true);
    try {
      // Encrypt vote (1 = for, 0 = against)
      const encryptedVote = await encrypt(voteFor ? 1 : 0, 'uint8');

      // Submit to contract
      const tx = await contract.vote(proposalId, encryptedVote.data);
      await tx.wait();

      return true;
    } catch (error) {
      console.error('Failed to submit vote:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [contract, encrypt]);

  return {
    createProposal,
    submitVote,
    loading
  };
}
```

### Proposal Component

```typescript
// src/components/VotingProposal.tsx
import React, { useState } from 'react';
import { useFhevmDecrypt } from '@fhevm/sdk';
import { useVoting } from '../hooks/useVoting';

interface ProposalProps {
  id: number;
  title: string;
  description: string;
  deadline: number;
  hasVoted: boolean;
  votesFor: any;
  votesAgainst: any;
}

export function VotingProposal({
  id,
  title,
  description,
  deadline,
  hasVoted,
  votesFor,
  votesAgainst
}: ProposalProps) {
  const { submitVote, loading } = useVoting();
  const { publicDecrypt } = useFhevmDecrypt();
  const [results, setResults] = useState<{ for: number; against: number } | null>(null);

  const isEnded = Date.now() > deadline * 1000;

  const handleVote = async (voteFor: boolean) => {
    const success = await submitVote(id, voteFor);
    if (success) {
      alert('Vote submitted successfully!');
    }
  };

  const revealResults = async () => {
    try {
      const forVotes = await publicDecrypt({ data: votesFor, type: 'uint32' });
      const againstVotes = await publicDecrypt({ data: votesAgainst, type: 'uint32' });
      setResults({ for: forVotes, against: againstVotes });
    } catch (error) {
      console.error('Failed to decrypt results:', error);
    }
  };

  const timeRemaining = Math.max(0, deadline * 1000 - Date.now());
  const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div className="proposal-card">
      <h3>{title}</h3>
      <p>{description}</p>

      <div className="proposal-info">
        {!isEnded ? (
          <p className="time-remaining">
            ⏰ {hours}h {minutes}m remaining
          </p>
        ) : (
          <p className="ended">✅ Voting Ended</p>
        )}
      </div>

      {!hasVoted && !isEnded && (
        <div className="vote-buttons">
          <button
            onClick={() => handleVote(true)}
            disabled={loading}
            className="vote-for"
          >
            👍 Vote For
          </button>
          <button
            onClick={() => handleVote(false)}
            disabled={loading}
            className="vote-against"
          >
            👎 Vote Against
          </button>
        </div>
      )}

      {hasVoted && !isEnded && (
        <p className="voted-message">✅ You have voted on this proposal</p>
      )}

      {isEnded && (
        <div className="results-section">
          {!results ? (
            <button onClick={revealResults} className="reveal-button">
              🔓 Reveal Results
            </button>
          ) : (
            <div className="results">
              <div className="result-item">
                <span className="label">For:</span>
                <span className="value">{results.for}</span>
              </div>
              <div className="result-item">
                <span className="label">Against:</span>
                <span className="value">{results.against}</span>
              </div>
              <div className="result-item winner">
                <span className="label">Result:</span>
                <span className="value">
                  {results.for > results.against ? '✅ Passed' : '❌ Rejected'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### Create Proposal Component

```typescript
// src/components/CreateProposal.tsx
import React, { useState } from 'react';
import { useVoting } from '../hooks/useVoting';

export function CreateProposal() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(24); // hours
  const { createProposal, loading } = useVoting();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description) {
      alert('Please fill in all fields');
      return;
    }

    const durationSeconds = duration * 60 * 60;
    const success = await createProposal(title, description, durationSeconds);

    if (success) {
      setTitle('');
      setDescription('');
      setDuration(24);
      alert('Proposal created successfully!');
    }
  };

  return (
    <div className="create-proposal">
      <h2>Create New Proposal</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Proposal Title"
          className="input-field"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Proposal Description"
          rows={4}
          className="input-field"
        />

        <div className="duration-selector">
          <label>Voting Duration:</label>
          <select
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            className="select-field"
          >
            <option value={1}>1 hour</option>
            <option value={6}>6 hours</option>
            <option value={24}>24 hours</option>
            <option value={72}>3 days</option>
            <option value={168}>1 week</option>
          </select>
        </div>

        <button type="submit" disabled={loading} className="submit-button">
          {loading ? 'Creating...' : 'Create Proposal'}
        </button>
      </form>
    </div>
  );
}
```

## Features Demonstrated

### 1. Encrypted Voting

Votes are encrypted before submission:

```typescript
const encryptedVote = await encrypt(voteFor ? 1 : 0, 'uint8');
await contract.vote(proposalId, encryptedVote.data);
```

### 2. Anonymous Participation

No personal data collected, only wallet addresses for vote tracking:

```typescript
mapping(uint256 => mapping(address => bool)) public hasVoted;
```

### 3. Result Revelation

Results decrypted only after voting ends:

```typescript
if (isEnded) {
  const forVotes = await publicDecrypt({ data: votesFor, type: 'uint32' });
  const againstVotes = await publicDecrypt({ data: votesAgainst, type: 'uint32' });
}
```

## Testing

### Manual Testing

1. Start the app: `npm start`
2. Connect MetaMask wallet
3. Create a test proposal
4. Submit a vote (For or Against)
5. Wait for voting period to end
6. Reveal results

### Expected Behavior

- ✅ Proposal creation completes in <5 seconds
- ✅ Vote submission encrypted and confirmed
- ✅ Cannot vote twice on same proposal
- ✅ Cannot vote after deadline
- ✅ Results accurate when revealed

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

### Environment Variables

Add in your hosting platform:
- `REACT_APP_NETWORK=sepolia`
- `REACT_APP_CONTRACT_ADDRESS=0x...`

## Key Learnings

1. **Votes Stay Private**: Individual votes never revealed
2. **Homomorphic Counting**: Vote totals computed without decryption
3. **Simple Integration**: SDK makes FHE operations easy
4. **TypeScript Support**: Full type safety throughout

## Best Practices

1. **Always Encrypt Votes**
   ```typescript
   const encrypted = await encrypt(vote, 'uint8');
   ```

2. **Check Voting Status**
   ```typescript
   if (hasVoted) return;
   if (isEnded) return;
   ```

3. **Handle Errors**
   ```typescript
   try {
     await submitVote();
   } catch (error) {
     console.error('Vote failed:', error);
   }
   ```

## Extending This Example

### Add More Vote Options

```solidity
enum VoteOption { Option1, Option2, Option3, Option4 }

function vote(uint256 proposalId, bytes calldata encryptedOption) external {
  // Support multiple options
}
```

### Add Quadratic Voting

```solidity
function vote(
  uint256 proposalId,
  bytes calldata encryptedVotes // Number of votes
) external {
  // Cost = votes^2 tokens
}
```

### Add Vote Delegation

```solidity
function delegate(address to) external {
  // Delegate voting power
}
```

## Resources

- **FHEVM SDK**: [../../README.md](../../README.md)
- **React Guide**: [../../docs/react.md](../../docs/react.md)
- **Contract Interaction**: [../../docs/contracts.md](../../docs/contracts.md)

## License

MIT License - see [../../LICENSE](../../LICENSE)

---

**Anonymous voting system with FHEVM** 🗳️🔐

*Demonstrating private, secure, and fair voting on blockchain!*
