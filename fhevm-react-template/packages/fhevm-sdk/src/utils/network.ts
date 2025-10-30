/**
 * Network configuration utilities for FHEVM
 */

export interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorer?: string;
}

export const NETWORKS: { [key: string]: NetworkConfig } = {
  sepolia: {
    name: 'Sepolia',
    chainId: 11155111,
    rpcUrl: 'https://sepolia.infura.io/v3/',
    explorer: 'https://sepolia.etherscan.io'
  },
  mainnet: {
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrl: 'https://mainnet.infura.io/v3/',
    explorer: 'https://etherscan.io'
  },
  localhost: {
    name: 'Localhost',
    chainId: 31337,
    rpcUrl: 'http://localhost:8545'
  }
};

export function getNetworkConfig(network: string): NetworkConfig | null {
  return NETWORKS[network] || null;
}

export function isValidNetwork(network: string): boolean {
  return network in NETWORKS;
}

export function getChainId(network: string): number | null {
  const config = getNetworkConfig(network);
  return config ? config.chainId : null;
}

export function getExplorerUrl(network: string, address: string): string | null {
  const config = getNetworkConfig(network);
  if (!config || !config.explorer) return null;
  return `${config.explorer}/address/${address}`;
}
