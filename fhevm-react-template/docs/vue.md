# Vue Integration Guide (Optional)

Guide for integrating the FHEVM SDK with Vue 3 applications using composables.

> **Note**: This is an optional integration. The SDK core is framework-agnostic and can be used with Vue through composables.

## Quick Start

### Installation

```bash
npm create vue@latest my-fhevm-app
cd my-fhevm-app
npm install @fhevm/sdk ethers
```

### Basic Setup

```typescript
// src/main.ts
import { createApp } from 'vue';
import App from './App.vue';
import { createFhevmPlugin } from './plugins/fhevm';

const app = createApp(App);

app.use(createFhevmPlugin({
  network: 'sepolia',
  contractAddress: '0x8EAB26B5C6E8Efe05D30b479C483802D2Ab15c14'
}));

app.mount('#app');
```

## Create Vue Plugin

### Plugin Setup

```typescript
// src/plugins/fhevm.ts
import { FhevmSDK, FhevmConfig } from '@fhevm/sdk';
import type { App } from 'vue';

export function createFhevmPlugin(config: FhevmConfig) {
  let fhevmInstance: FhevmSDK | null = null;

  return {
    install(app: App) {
      // Create SDK instance
      fhevmInstance = new FhevmSDK(config);

      // Initialize on plugin install
      fhevmInstance.init().then(() => {
        console.log('FHEVM SDK initialized');
      });

      // Provide SDK instance
      app.provide('fhevm', fhevmInstance);

      // Global property (optional)
      app.config.globalProperties.$fhevm = fhevmInstance;
    }
  };
}
```

## Composables

### useFhevm

```typescript
// src/composables/useFhevm.ts
import { inject } from 'vue';
import type { FhevmSDK } from '@fhevm/sdk';

export function useFhevm() {
  const fhevm = inject<FhevmSDK>('fhevm');

  if (!fhevm) {
    throw new Error('FHEVM SDK not provided. Did you install the plugin?');
  }

  return { fhevm };
}
```

### useFhevmEncrypt

```typescript
// src/composables/useFhevmEncrypt.ts
import { ref } from 'vue';
import { useFhevm } from './useFhevm';
import type { EncryptedValue } from '@fhevm/sdk';

export function useFhevmEncrypt() {
  const { fhevm } = useFhevm();
  const isEncrypting = ref(false);
  const error = ref<Error | null>(null);

  const encrypt = async (value: number, type: string = 'uint8'): Promise<EncryptedValue | null> => {
    isEncrypting.value = true;
    error.value = null;

    try {
      const result = await fhevm.encrypt(value, type);
      return result;
    } catch (err) {
      error.value = err as Error;
      return null;
    } finally {
      isEncrypting.value = false;
    }
  };

  const encryptBatch = async (inputs: Array<{ value: number; type: string }>) => {
    isEncrypting.value = true;
    error.value = null;

    try {
      const result = await fhevm.encryptBatch(inputs);
      return result;
    } catch (err) {
      error.value = err as Error;
      return null;
    } finally {
      isEncrypting.value = false;
    }
  };

  return {
    encrypt,
    encryptBatch,
    isEncrypting,
    error
  };
}
```

### useFhevmDecrypt

```typescript
// src/composables/useFhevmDecrypt.ts
import { ref } from 'vue';
import { useFhevm } from './useFhevm';
import type { EncryptedValue } from '@fhevm/sdk';

export function useFhevmDecrypt() {
  const { fhevm } = useFhevm();
  const isDecrypting = ref(false);
  const error = ref<Error | null>(null);

  const userDecrypt = async (
    encryptedValue: EncryptedValue,
    contractAddress: string,
    userAddress: string
  ): Promise<number | null> => {
    isDecrypting.value = true;
    error.value = null;

    try {
      const result = await fhevm.userDecrypt(
        encryptedValue,
        contractAddress,
        userAddress
      );
      return result;
    } catch (err) {
      error.value = err as Error;
      return null;
    } finally {
      isDecrypting.value = false;
    }
  };

  const publicDecrypt = async (encryptedValue: EncryptedValue): Promise<number | null> => {
    isDecrypting.value = true;
    error.value = null;

    try {
      const result = await fhevm.publicDecrypt(encryptedValue);
      return result;
    } catch (err) {
      error.value = err as Error;
      return null;
    } finally {
      isDecrypting.value = false;
    }
  };

  return {
    userDecrypt,
    publicDecrypt,
    isDecrypting,
    error
  };
}
```

## Components

### Encrypted Counter Example

```vue
<!-- src/components/EncryptedCounter.vue -->
<template>
  <div class="encrypted-counter">
    <h2>Encrypted Counter</h2>

    <div class="input-group">
      <input
        v-model.number="value"
        type="number"
        placeholder="Enter value (0-255)"
        min="0"
        max="255"
      />
      <button @click="handleEncrypt" :disabled="isEncrypting || !value">
        {{ isEncrypting ? 'Encrypting...' : 'Encrypt' }}
      </button>
    </div>

    <div v-if="encrypted" class="encrypted-data">
      <p class="label">Encrypted Data:</p>
      <p class="data">{{ encrypted.data }}</p>

      <button @click="handleDecrypt" :disabled="isDecrypting">
        {{ isDecrypting ? 'Decrypting...' : 'Decrypt' }}
      </button>
    </div>

    <div v-if="decrypted !== null" class="decrypted-value">
      <p class="label">Decrypted Value:</p>
      <p class="value">{{ decrypted }}</p>
    </div>

    <p v-if="error" class="error">{{ error.message }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useFhevmEncrypt, useFhevmDecrypt } from '@/composables';

const value = ref<number | null>(null);
const encrypted = ref<any>(null);
const decrypted = ref<number | null>(null);

const { encrypt, isEncrypting, error: encryptError } = useFhevmEncrypt();
const { publicDecrypt, isDecrypting, error: decryptError } = useFhevmDecrypt();

const error = ref<Error | null>(null);

const handleEncrypt = async () => {
  if (!value.value) return;

  const result = await encrypt(value.value, 'uint8');
  if (result) {
    encrypted.value = result;
    decrypted.value = null;
  } else {
    error.value = encryptError.value;
  }
};

const handleDecrypt = async () => {
  if (!encrypted.value) return;

  const result = await publicDecrypt(encrypted.value);
  if (result !== null) {
    decrypted.value = result;
  } else {
    error.value = decryptError.value;
  }
};
</script>

<style scoped>
.encrypted-counter {
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
}

.input-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 0.5rem 1rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.encrypted-data,
.decrypted-value {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.label {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.data {
  font-family: monospace;
  word-break: break-all;
  font-size: 0.875rem;
}

.value {
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
}

.error {
  color: #ff0000;
  margin-top: 1rem;
}
</style>
```

### Usage in App

```vue
<!-- src/App.vue -->
<template>
  <div id="app">
    <EncryptedCounter />
  </div>
</template>

<script setup lang="ts">
import EncryptedCounter from './components/EncryptedCounter.vue';
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
```

## State Management (Pinia)

### FHEVM Store

```typescript
// src/stores/fhevm.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { FhevmSDK, EncryptedValue } from '@fhevm/sdk';

export const useFhevmStore = defineStore('fhevm', () => {
  const sdk = ref<FhevmSDK | null>(null);
  const isReady = ref(false);
  const error = ref<Error | null>(null);

  async function init(fhevmInstance: FhevmSDK) {
    try {
      sdk.value = fhevmInstance;
      await fhevmInstance.init();
      isReady.value = true;
    } catch (err) {
      error.value = err as Error;
    }
  }

  async function encrypt(value: number, type: string = 'uint8'): Promise<EncryptedValue | null> {
    if (!sdk.value) return null;
    try {
      return await sdk.value.encrypt(value, type);
    } catch (err) {
      error.value = err as Error;
      return null;
    }
  }

  async function decrypt(encrypted: EncryptedValue): Promise<number | null> {
    if (!sdk.value) return null;
    try {
      return await sdk.value.publicDecrypt(encrypted);
    } catch (err) {
      error.value = err as Error;
      return null;
    }
  }

  return {
    sdk,
    isReady,
    error,
    init,
    encrypt,
    decrypt
  };
});
```

### Usage in Component

```vue
<script setup lang="ts">
import { useFhevmStore } from '@/stores/fhevm';

const fhevmStore = useFhevmStore();

const handleEncrypt = async () => {
  const encrypted = await fhevmStore.encrypt(42, 'uint8');
  console.log('Encrypted:', encrypted);
};
</script>
```

## Composition API Patterns

### Reusable Composable

```typescript
// src/composables/useEncryptedValue.ts
import { ref, computed } from 'vue';
import { useFhevmEncrypt, useFhevmDecrypt } from './';
import type { EncryptedValue } from '@fhevm/sdk';

export function useEncryptedValue(initialValue: number = 0) {
  const plainValue = ref(initialValue);
  const encrypted = ref<EncryptedValue | null>(null);
  const decrypted = ref<number | null>(null);

  const { encrypt, isEncrypting } = useFhevmEncrypt();
  const { publicDecrypt, isDecrypting } = useFhevmDecrypt();

  const isLoading = computed(() => isEncrypting.value || isDecrypting.value);

  const encryptValue = async () => {
    const result = await encrypt(plainValue.value, 'uint8');
    if (result) {
      encrypted.value = result;
      decrypted.value = null;
    }
  };

  const decryptValue = async () => {
    if (!encrypted.value) return;
    const result = await publicDecrypt(encrypted.value);
    if (result !== null) {
      decrypted.value = result;
    }
  };

  return {
    plainValue,
    encrypted,
    decrypted,
    encryptValue,
    decryptValue,
    isLoading
  };
}

// Usage
const { plainValue, encrypted, encryptValue, isLoading } = useEncryptedValue(42);
```

## TypeScript Support

### Type Definitions

```typescript
// src/types/fhevm.d.ts
import '@vue/runtime-core';
import type { FhevmSDK } from '@fhevm/sdk';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $fhevm: FhevmSDK;
  }
}

export {};
```

## Testing

### Unit Tests (Vitest)

```typescript
// src/components/__tests__/EncryptedCounter.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import EncryptedCounter from '../EncryptedCounter.vue';
import { createFhevmPlugin } from '@/plugins/fhevm';

describe('EncryptedCounter', () => {
  let wrapper;

  beforeEach(() => {
    const plugin = createFhevmPlugin({
      network: 'sepolia',
      contractAddress: '0x...'
    });

    wrapper = mount(EncryptedCounter, {
      global: {
        plugins: [plugin]
      }
    });
  });

  it('renders correctly', () => {
    expect(wrapper.find('h2').text()).toBe('Encrypted Counter');
  });

  it('encrypts value on button click', async () => {
    const input = wrapper.find('input[type="number"]');
    await input.setValue(42);

    const button = wrapper.find('button');
    await button.trigger('click');

    // Wait for encryption
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.encrypted).toBeTruthy();
  });
});
```

## Best Practices

1. **Use Composables**
   ```typescript
   // ✅ Good - Reusable composable
   const { encrypt, isEncrypting } = useFhevmEncrypt();

   // ❌ Bad - Direct SDK access in component
   const sdk = inject('fhevm');
   ```

2. **Provide Type Safety**
   ```typescript
   // Use TypeScript for all composables
   export function useFhevm(): { fhevm: FhevmSDK } {
     // ...
   }
   ```

3. **Handle Loading States**
   ```vue
   <button :disabled="isEncrypting">
     {{ isEncrypting ? 'Encrypting...' : 'Encrypt' }}
   </button>
   ```

4. **Error Handling**
   ```typescript
   const { encrypt, error } = useFhevmEncrypt();

   watchEffect(() => {
     if (error.value) {
       console.error('Encryption error:', error.value);
     }
   });
   ```

5. **Use Provide/Inject**
   ```typescript
   // Plugin provides SDK
   app.provide('fhevm', fhevmInstance);

   // Component injects SDK
   const fhevm = inject<FhevmSDK>('fhevm');
   ```

## Environment Variables

```env
# .env
VITE_NETWORK=sepolia
VITE_CONTRACT_ADDRESS=0x8EAB26B5C6E8Efe05D30b479C483802D2Ab15c14
```

```typescript
// Usage
const config = {
  network: import.meta.env.VITE_NETWORK,
  contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS
};
```

## Build and Deploy

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Next Steps

- Explore [React Integration](./react.md)
- Learn about [Contract Interaction](./contracts.md)
- See [Node.js Usage](./nodejs.md)

---

**Building privacy-preserving Vue apps with FHEVM** 🔐
