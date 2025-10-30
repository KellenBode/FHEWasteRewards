/**
 * Vue adapter for FHEVM SDK (Optional - Future Enhancement)
 * This demonstrates framework-agnostic architecture
 */

import { ref, computed, onMounted } from 'vue';
import { FhevmSDK, FhevmConfig, EncryptedValue } from '../core/FhevmSDK';

export function useFhevmVue(config: FhevmConfig) {
  const fhevm = ref<FhevmSDK | null>(null);
  const isReady = ref(false);
  const error = ref<string | null>(null);

  onMounted(async () => {
    try {
      fhevm.value = new FhevmSDK(config);
      await fhevm.value.init();
      isReady.value = true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Initialization failed';
    }
  });

  const encrypt = async (value: number, type: string = 'uint8'): Promise<EncryptedValue> => {
    if (!fhevm.value) {
      throw new Error('SDK not initialized');
    }
    return fhevm.value.encrypt(value, type);
  };

  const userDecrypt = async (
    encryptedValue: EncryptedValue,
    contractAddress: string,
    userAddress: string
  ): Promise<number> => {
    if (!fhevm.value) {
      throw new Error('SDK not initialized');
    }
    return fhevm.value.userDecrypt(encryptedValue, contractAddress, userAddress);
  };

  return {
    fhevm: computed(() => fhevm.value),
    isReady: computed(() => isReady.value),
    error: computed(() => error.value),
    encrypt,
    userDecrypt
  };
}
