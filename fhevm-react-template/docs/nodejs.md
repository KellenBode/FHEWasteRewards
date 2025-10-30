# Node.js Integration Guide (Optional)

Guide for using the FHEVM SDK in Node.js server-side applications, CLI tools, and backend services.

> **Note**: This is an optional integration showing server-side usage of the framework-agnostic SDK core.

## Quick Start

### Installation

```bash
mkdir my-fhevm-server
cd my-fhevm-server
npm init -y
npm install @fhevm/sdk ethers dotenv
```

### Basic Setup

```typescript
// index.ts
import { FhevmSDK } from '@fhevm/sdk';
import { config } from 'dotenv';

config();

async function main() {
  const fhevm = new FhevmSDK({
    network: 'sepolia',
    contractAddress: process.env.CONTRACT_ADDRESS!,
    rpcUrl: process.env.RPC_URL
  });

  await fhevm.init();

  // Encrypt value
  const encrypted = await fhevm.encrypt(42, 'uint8');
  console.log('Encrypted:', encrypted);

  // Decrypt value
  const decrypted = await fhevm.publicDecrypt(encrypted);
  console.log('Decrypted:', decrypted);
}

main().catch(console.error);
```

## Configuration

### Environment Variables

```env
# .env
NETWORK=sepolia
CONTRACT_ADDRESS=0x8EAB26B5C6E8Efe05D30b479C483802D2Ab15c14
RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=your_private_key_here
GATEWAY_URL=https://gateway.fhevm.io
```

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

## CLI Application

### Basic CLI

```typescript
// src/cli.ts
import { Command } from 'commander';
import { FhevmSDK } from '@fhevm/sdk';
import { config } from 'dotenv';

config();

const program = new Command();

async function getFhevm() {
  const fhevm = new FhevmSDK({
    network: process.env.NETWORK as 'sepolia',
    contractAddress: process.env.CONTRACT_ADDRESS!,
    rpcUrl: process.env.RPC_URL
  });

  await fhevm.init();
  return fhevm;
}

program
  .name('fhevm-cli')
  .description('FHEVM CLI tool for encryption operations')
  .version('1.0.0');

program
  .command('encrypt')
  .description('Encrypt a value')
  .argument('<value>', 'Value to encrypt')
  .option('-t, --type <type>', 'Encryption type', 'uint8')
  .action(async (value, options) => {
    const fhevm = await getFhevm();
    const encrypted = await fhevm.encrypt(parseInt(value), options.type);
    console.log('Encrypted:', encrypted);
  });

program
  .command('decrypt')
  .description('Decrypt a value')
  .argument('<data>', 'Encrypted data (hex)')
  .option('-t, --type <type>', 'Decryption type', 'uint8')
  .action(async (data, options) => {
    const fhevm = await getFhevm();
    const decrypted = await fhevm.publicDecrypt({ data, type: options.type });
    console.log('Decrypted:', decrypted);
  });

program.parse();
```

### Usage

```bash
# Encrypt
node dist/cli.js encrypt 42 --type uint8

# Decrypt
node dist/cli.js decrypt 0x123456... --type uint8
```

## Express Server

### REST API

```typescript
// src/server.ts
import express from 'express';
import { FhevmSDK } from '@fhevm/sdk';
import { config } from 'dotenv';

config();

const app = express();
app.use(express.json());

let fhevm: FhevmSDK;

// Initialize SDK on server start
async function initFhevm() {
  fhevm = new FhevmSDK({
    network: process.env.NETWORK as 'sepolia',
    contractAddress: process.env.CONTRACT_ADDRESS!,
    rpcUrl: process.env.RPC_URL
  });

  await fhevm.init();
  console.log('FHEVM SDK initialized');
}

// Encrypt endpoint
app.post('/api/encrypt', async (req, res) => {
  try {
    const { value, type = 'uint8' } = req.body;

    if (!value) {
      return res.status(400).json({ error: 'Value is required' });
    }

    const encrypted = await fhevm.encrypt(parseInt(value), type);
    res.json({ encrypted });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Decrypt endpoint
app.post('/api/decrypt', async (req, res) => {
  try {
    const { encrypted } = req.body;

    if (!encrypted) {
      return res.status(400).json({ error: 'Encrypted value is required' });
    }

    const decrypted = await fhevm.publicDecrypt(encrypted);
    res.json({ decrypted });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Batch encrypt endpoint
app.post('/api/encrypt/batch', async (req, res) => {
  try {
    const { values } = req.body;

    if (!Array.isArray(values)) {
      return res.status(400).json({ error: 'Values must be an array' });
    }

    const encrypted = await fhevm.encryptBatch(values);
    res.json({ encrypted });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', fhevmReady: fhevm !== undefined });
});

const PORT = process.env.PORT || 3000;

initFhevm().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
```

### Client Usage

```bash
# Encrypt
curl -X POST http://localhost:3000/api/encrypt \
  -H "Content-Type: application/json" \
  -d '{"value": 42, "type": "uint8"}'

# Decrypt
curl -X POST http://localhost:3000/api/decrypt \
  -H "Content-Type: application/json" \
  -d '{"encrypted": {"data": "0x...", "type": "uint8"}}'

# Batch encrypt
curl -X POST http://localhost:3000/api/encrypt/batch \
  -H "Content-Type: application/json" \
  -d '{"values": [{"value": 10, "type": "uint8"}, {"value": 20, "type": "uint8"}]}'
```

## Background Jobs

### Queue Worker

```typescript
// src/worker.ts
import { Queue, Worker } from 'bullmq';
import { FhevmSDK } from '@fhevm/sdk';
import { config } from 'dotenv';

config();

const fhevm = new FhevmSDK({
  network: process.env.NETWORK as 'sepolia',
  contractAddress: process.env.CONTRACT_ADDRESS!,
  rpcUrl: process.env.RPC_URL
});

const encryptionQueue = new Queue('encryption', {
  connection: {
    host: 'localhost',
    port: 6379
  }
});

const worker = new Worker('encryption', async (job) => {
  const { value, type } = job.data;

  console.log(`Processing job ${job.id}: encrypting ${value}`);

  const encrypted = await fhevm.encrypt(value, type);

  return { encrypted };
}, {
  connection: {
    host: 'localhost',
    port: 6379
  }
});

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

// Initialize FHEVM before processing jobs
(async () => {
  await fhevm.init();
  console.log('Worker started and FHEVM initialized');
})();
```

### Add Jobs

```typescript
// Add job to queue
await encryptionQueue.add('encrypt-value', {
  value: 42,
  type: 'uint8'
});
```

## Database Integration

### MongoDB Example

```typescript
// src/db.ts
import mongoose from 'mongoose';
import { FhevmSDK } from '@fhevm/sdk';

const EncryptedDataSchema = new mongoose.Schema({
  plainValue: Number,
  encryptedData: String,
  encryptedType: String,
  createdAt: { type: Date, default: Date.now }
});

const EncryptedData = mongoose.model('EncryptedData', EncryptedDataSchema);

class EncryptedDataService {
  private fhevm: FhevmSDK;

  constructor(fhevm: FhevmSDK) {
    this.fhevm = fhevm;
  }

  async saveEncrypted(value: number, type: string = 'uint8') {
    const encrypted = await this.fhevm.encrypt(value, type);

    const data = new EncryptedData({
      plainValue: value,
      encryptedData: encrypted.data,
      encryptedType: encrypted.type
    });

    await data.save();
    return data;
  }

  async getAndDecrypt(id: string) {
    const data = await EncryptedData.findById(id);
    if (!data) return null;

    const decrypted = await this.fhevm.publicDecrypt({
      data: data.encryptedData,
      type: data.encryptedType
    });

    return {
      id: data._id,
      decrypted,
      createdAt: data.createdAt
    };
  }
}

export { EncryptedDataService };
```

## Batch Processing

### Process Multiple Values

```typescript
// src/batch.ts
import { FhevmSDK } from '@fhevm/sdk';

async function batchEncryptAndStore(values: number[]) {
  const fhevm = new FhevmSDK({
    network: 'sepolia',
    contractAddress: process.env.CONTRACT_ADDRESS!,
    rpcUrl: process.env.RPC_URL
  });

  await fhevm.init();

  // Encrypt all values in parallel
  const encrypted = await Promise.all(
    values.map(value => fhevm.encrypt(value, 'uint8'))
  );

  console.log(`Encrypted ${encrypted.length} values`);

  return encrypted;
}

// Usage
const values = [10, 20, 30, 40, 50];
const encrypted = await batchEncryptAndStore(values);
```

## Scheduled Tasks

### Cron Jobs

```typescript
// src/cron.ts
import cron from 'node-cron';
import { FhevmSDK } from '@fhevm/sdk';

const fhevm = new FhevmSDK({
  network: 'sepolia',
  contractAddress: process.env.CONTRACT_ADDRESS!,
  rpcUrl: process.env.RPC_URL
});

async function encryptDailyData() {
  console.log('Running daily encryption task...');

  // Fetch data from database or API
  const data = await fetchDailyData();

  // Encrypt data
  const encrypted = await fhevm.encryptBatch(
    data.map(value => ({ value, type: 'uint8' }))
  );

  // Store encrypted data
  await storeEncryptedData(encrypted);

  console.log('Daily encryption complete');
}

// Run every day at midnight
cron.schedule('0 0 * * *', async () => {
  await encryptDailyData();
});

(async () => {
  await fhevm.init();
  console.log('Cron scheduler started');
})();
```

## Testing

### Unit Tests (Jest)

```typescript
// __tests__/encryption.test.ts
import { FhevmSDK } from '@fhevm/sdk';

describe('Encryption Service', () => {
  let fhevm: FhevmSDK;

  beforeAll(async () => {
    fhevm = new FhevmSDK({
      network: 'sepolia',
      contractAddress: process.env.CONTRACT_ADDRESS!,
      rpcUrl: process.env.RPC_URL
    });

    await fhevm.init();
  });

  it('should encrypt and decrypt value', async () => {
    const value = 42;
    const encrypted = await fhevm.encrypt(value, 'uint8');

    expect(encrypted).toHaveProperty('data');
    expect(encrypted.type).toBe('uint8');

    const decrypted = await fhevm.publicDecrypt(encrypted);
    expect(decrypted).toBe(value);
  });

  it('should batch encrypt values', async () => {
    const values = [
      { value: 10, type: 'uint8' },
      { value: 20, type: 'uint8' }
    ];

    const encrypted = await fhevm.encryptBatch(values);

    expect(encrypted).toHaveLength(2);
    encrypted.forEach(enc => {
      expect(enc).toHaveProperty('data');
      expect(enc.type).toBe('uint8');
    });
  });
});
```

## Error Handling

### Retry Logic

```typescript
async function encryptWithRetry(
  value: number,
  type: string = 'uint8',
  maxRetries: number = 3
) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const encrypted = await fhevm.encrypt(value, type);
      return encrypted;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);

      if (attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

### Graceful Shutdown

```typescript
// src/server.ts
let server;

async function gracefulShutdown() {
  console.log('Received shutdown signal');

  // Close server
  if (server) {
    server.close(() => {
      console.log('HTTP server closed');
    });
  }

  // Cleanup FHEVM SDK
  if (fhevm) {
    await fhevm.cleanup();
    console.log('FHEVM SDK cleaned up');
  }

  process.exit(0);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
initFhevm().then(() => {
  server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
```

## Performance Optimization

### Connection Pooling

```typescript
class FhevmPool {
  private pool: FhevmSDK[] = [];
  private poolSize: number;

  constructor(config: FhevmConfig, poolSize: number = 5) {
    this.poolSize = poolSize;
  }

  async init() {
    for (let i = 0; i < this.poolSize; i++) {
      const sdk = new FhevmSDK(config);
      await sdk.init();
      this.pool.push(sdk);
    }
  }

  getSDK(): FhevmSDK {
    // Round-robin selection
    return this.pool[Math.floor(Math.random() * this.pool.length)];
  }
}

// Usage
const pool = new FhevmPool(config, 5);
await pool.init();

const sdk = pool.getSDK();
const encrypted = await sdk.encrypt(42, 'uint8');
```

## Monitoring

### Logging

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

async function encryptWithLogging(value: number, type: string) {
  logger.info('Starting encryption', { value, type });

  try {
    const encrypted = await fhevm.encrypt(value, type);
    logger.info('Encryption successful', { encrypted: encrypted.data });
    return encrypted;
  } catch (error: any) {
    logger.error('Encryption failed', { error: error.message });
    throw error;
  }
}
```

## Best Practices

1. **Environment Variables**
   - Never commit private keys
   - Use `.env` files for configuration
   - Validate environment variables on startup

2. **Error Handling**
   - Implement retry logic for network errors
   - Log errors for debugging
   - Handle graceful shutdown

3. **Performance**
   - Use batch operations when possible
   - Implement connection pooling
   - Cache decrypted values when appropriate

4. **Security**
   - Store private keys securely
   - Use HTTPS for API endpoints
   - Validate all inputs

5. **Testing**
   - Write unit tests for all functions
   - Test error scenarios
   - Use test networks for development

---

## Next Steps

- Explore [React Integration](./react.md)
- Learn about [Contract Interaction](./contracts.md)
- See [API Reference](./api-reference.md)

---

**Building privacy-preserving Node.js applications with FHEVM** 🔐
