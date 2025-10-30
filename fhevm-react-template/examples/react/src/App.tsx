import React from 'react';
import { FhevmProvider } from '@fhevm/sdk';
import VotingApp from './components/VotingApp';
import './App.css';

function App() {
  return (
    <FhevmProvider
      config={{
        network: 'sepolia',
        contractAddress: '0x8EAB26B5C6E8Efe05D30b479C483802D2Ab15c14',
        provider: typeof window !== 'undefined' ? (window as any).ethereum : undefined
      }}
    >
      <div className="app">
        <header className="app-header">
          <h1>🗳️ Anonymous Voting System</h1>
          <p>Powered by FHEVM SDK - Privacy-Preserving Blockchain Voting</p>
        </header>
        <main className="app-main">
          <VotingApp />
        </main>
        <footer className="app-footer">
          <p>Built with React 18, Vite, and FHEVM SDK</p>
        </footer>
      </div>
    </FhevmProvider>
  );
}

export default App;
