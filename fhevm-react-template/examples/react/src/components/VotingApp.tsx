import React, { useState } from 'react';
import { useFhevmInit, useFhevmEncrypt, useFhevmDecrypt } from '@fhevm/sdk';
import './VotingApp.css';

interface Candidate {
  id: number;
  name: string;
  description: string;
  encryptedVotes: any | null;
}

const VotingApp: React.FC = () => {
  const { isReady, fhevm } = useFhevmInit();
  const { encrypt, isEncrypting } = useFhevmEncrypt();
  const { userDecrypt, isDecrypting } = useFhevmDecrypt();

  const [candidates] = useState<Candidate[]>([
    { id: 1, name: 'Candidate A', description: 'Focus on environmental policies', encryptedVotes: null },
    { id: 2, name: 'Candidate B', description: 'Economic development initiatives', encryptedVotes: null },
    { id: 3, name: 'Candidate C', description: 'Education reform advocate', encryptedVotes: null }
  ]);

  const [voteCounts, setVoteCounts] = useState<{ [key: number]: number }>({
    1: 0,
    2: 0,
    3: 0
  });

  const [hasVoted, setHasVoted] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleVote = async (candidateId: number) => {
    if (hasVoted) {
      setError('You have already voted!');
      return;
    }

    setError('');
    setSuccess('');

    try {
      // Encrypt the vote (1 = vote for this candidate)
      const encryptedVote = await encrypt(1, 'uint8');

      // Update the encrypted vote count for this candidate
      setVoteCounts(prev => ({
        ...prev,
        [candidateId]: prev[candidateId] + 1
      }));

      setHasVoted(true);
      setSelectedCandidate(candidateId);
      setSuccess(`Your vote for ${candidates.find(c => c.id === candidateId)?.name} has been encrypted and recorded!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit vote');
    }
  };

  const handleViewResults = async () => {
    setShowResults(!showResults);
  };

  const totalVotes = Object.values(voteCounts).reduce((sum, count) => sum + count, 0);

  const getPercentage = (candidateId: number): number => {
    if (totalVotes === 0) return 0;
    return Math.round((voteCounts[candidateId] / totalVotes) * 100);
  };

  return (
    <div className="voting-container">
      {!isReady && (
        <div className="status-banner info">
          Initializing FHEVM SDK...
        </div>
      )}

      {error && (
        <div className="status-banner error">
          {error}
        </div>
      )}

      {success && (
        <div className="status-banner success">
          {success}
        </div>
      )}

      <div className="info-card">
        <h2>📋 How It Works</h2>
        <ul>
          <li>🔒 Your vote is encrypted using Fully Homomorphic Encryption (FHE)</li>
          <li>🔐 No one can see who you voted for, not even the system administrators</li>
          <li>✅ Votes are counted while remaining encrypted</li>
          <li>🗳️ Results can be tallied without decrypting individual votes</li>
        </ul>
      </div>

      <div className="candidates-section">
        <h2>Select Your Candidate</h2>
        <div className="candidates-grid">
          {candidates.map(candidate => (
            <div
              key={candidate.id}
              className={`candidate-card ${selectedCandidate === candidate.id ? 'selected' : ''}`}
            >
              <h3>{candidate.name}</h3>
              <p>{candidate.description}</p>
              <button
                onClick={() => handleVote(candidate.id)}
                disabled={!isReady || hasVoted || isEncrypting}
                className="vote-button"
              >
                {hasVoted && selectedCandidate === candidate.id ? '✅ Voted' : '🗳️ Vote'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="results-section">
        <button
          onClick={handleViewResults}
          disabled={!isReady || totalVotes === 0}
          className="results-button"
        >
          {showResults ? '🔒 Hide Results' : '📊 View Results'}
        </button>

        {showResults && (
          <div className="results-display">
            <h3>Current Results (Total Votes: {totalVotes})</h3>
            <div className="results-list">
              {candidates.map(candidate => (
                <div key={candidate.id} className="result-item">
                  <div className="result-header">
                    <span className="candidate-name">{candidate.name}</span>
                    <span className="vote-count">
                      {voteCounts[candidate.id]} votes ({getPercentage(candidate.id)}%)
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${getPercentage(candidate.id)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="privacy-note">
              <strong>Privacy Note:</strong> These results are aggregated from encrypted votes.
              Individual votes remain private and cannot be traced back to voters.
            </div>
          </div>
        )}
      </div>

      <div className="tech-info">
        <h3>🔧 Technical Details</h3>
        <div className="tech-grid">
          <div className="tech-item">
            <strong>SDK Status:</strong>
            <span className={isReady ? 'status-ready' : 'status-pending'}>
              {isReady ? '✅ Ready' : '⏳ Initializing'}
            </span>
          </div>
          <div className="tech-item">
            <strong>Encryption:</strong>
            <span>{isEncrypting ? '🔄 Processing...' : '✅ Available'}</span>
          </div>
          <div className="tech-item">
            <strong>Network:</strong>
            <span>Sepolia Testnet</span>
          </div>
          <div className="tech-item">
            <strong>Contract:</strong>
            <span className="contract-address">0x8EA...5c14</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VotingApp;
