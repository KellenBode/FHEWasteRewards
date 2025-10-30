/**
 * Validation Utilities
 * Input validation and data verification helpers
 */

import { EncryptedData } from '../fhe/types';

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate encryption type
 */
export function validateEncryptionType(type: string): ValidationResult {
  const validTypes = ['uint8', 'uint16', 'uint32', 'uint64', 'bool', 'address'];

  if (!validTypes.includes(type)) {
    return {
      valid: false,
      error: `Invalid encryption type. Must be one of: ${validTypes.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Validate value for encryption type
 */
export function validateValueForType(
  value: any,
  type: string
): ValidationResult {
  // First validate the type itself
  const typeValidation = validateEncryptionType(type);
  if (!typeValidation.valid) {
    return typeValidation;
  }

  switch (type) {
    case 'bool':
      if (typeof value !== 'boolean') {
        return { valid: false, error: 'Value must be a boolean for type "bool"' };
      }
      break;

    case 'address':
      if (typeof value !== 'string' || !/^0x[a-fA-F0-9]{40}$/.test(value)) {
        return { valid: false, error: 'Value must be a valid Ethereum address' };
      }
      break;

    case 'uint8':
    case 'uint16':
    case 'uint32':
    case 'uint64':
      if (typeof value !== 'number' || !Number.isInteger(value)) {
        return { valid: false, error: `Value must be an integer for type "${type}"` };
      }

      if (value < 0) {
        return { valid: false, error: `Value must be non-negative for type "${type}"` };
      }

      const maxValues: Record<string, number> = {
        uint8: 255,
        uint16: 65535,
        uint32: 4294967295,
        uint64: Number.MAX_SAFE_INTEGER,
      };

      if (value > maxValues[type]) {
        return {
          valid: false,
          error: `Value ${value} exceeds maximum for ${type}: ${maxValues[type]}`,
        };
      }
      break;

    default:
      return { valid: false, error: `Unsupported type: ${type}` };
  }

  return { valid: true };
}

/**
 * Validate encrypted data structure
 */
export function validateEncryptedData(data: any): ValidationResult {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Encrypted data must be an object' };
  }

  if (typeof data.ciphertext !== 'string') {
    return { valid: false, error: 'Encrypted data must have a ciphertext string' };
  }

  if (!data.ciphertext || data.ciphertext.length === 0) {
    return { valid: false, error: 'Ciphertext cannot be empty' };
  }

  if (typeof data.type !== 'string') {
    return { valid: false, error: 'Encrypted data must have a type string' };
  }

  const typeValidation = validateEncryptionType(data.type);
  if (!typeValidation.valid) {
    return typeValidation;
  }

  if (typeof data.timestamp !== 'number' || data.timestamp <= 0) {
    return { valid: false, error: 'Encrypted data must have a valid timestamp' };
  }

  if (typeof data.isEncrypted !== 'boolean') {
    return { valid: false, error: 'Encrypted data must have an isEncrypted boolean' };
  }

  return { valid: true };
}

/**
 * Validate computation operation
 */
export function validateOperation(operation: string): ValidationResult {
  const validOperations = ['add', 'subtract', 'multiply', 'compare'];

  if (!validOperations.includes(operation)) {
    return {
      valid: false,
      error: `Invalid operation. Must be one of: ${validOperations.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Validate operands for computation
 */
export function validateOperands(
  operands: any[],
  operation: string
): ValidationResult {
  if (!Array.isArray(operands)) {
    return { valid: false, error: 'Operands must be an array' };
  }

  if (operands.length < 2) {
    return { valid: false, error: 'At least two operands are required' };
  }

  // Validate each operand is properly encrypted
  for (let i = 0; i < operands.length; i++) {
    const validation = validateEncryptedData(operands[i]);
    if (!validation.valid) {
      return {
        valid: false,
        error: `Operand ${i + 1} is invalid: ${validation.error}`,
      };
    }
  }

  // Ensure all operands have the same type
  const firstType = operands[0].type;
  for (let i = 1; i < operands.length; i++) {
    if (operands[i].type !== firstType) {
      return {
        valid: false,
        error: `All operands must have the same type. Found ${firstType} and ${operands[i].type}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Validate contract address
 */
export function validateContractAddress(address: string): ValidationResult {
  if (typeof address !== 'string') {
    return { valid: false, error: 'Contract address must be a string' };
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return { valid: false, error: 'Invalid contract address format' };
  }

  return { valid: true };
}

/**
 * Validate wallet address
 */
export function validateWalletAddress(address: string): ValidationResult {
  return validateContractAddress(address);
}

/**
 * Validate network configuration
 */
export function validateNetworkConfig(config: any): ValidationResult {
  if (!config || typeof config !== 'object') {
    return { valid: false, error: 'Network config must be an object' };
  }

  if (!config.network || typeof config.network !== 'string') {
    return { valid: false, error: 'Network config must have a network string' };
  }

  if (config.contractAddress) {
    const addressValidation = validateContractAddress(config.contractAddress);
    if (!addressValidation.valid) {
      return addressValidation;
    }
  }

  return { valid: true };
}

/**
 * Validate timestamp freshness (within last 5 minutes)
 */
export function validateTimestampFreshness(timestamp: number): ValidationResult {
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;

  if (timestamp > now) {
    return { valid: false, error: 'Timestamp is in the future' };
  }

  if (now - timestamp > fiveMinutes) {
    return { valid: false, error: 'Timestamp is too old (>5 minutes)' };
  }

  return { valid: true };
}

/**
 * Batch validation helper
 */
export function validateBatch<T>(
  items: T[],
  validator: (item: T) => ValidationResult
): ValidationResult {
  for (let i = 0; i < items.length; i++) {
    const result = validator(items[i]);
    if (!result.valid) {
      return {
        valid: false,
        error: `Item ${i + 1} validation failed: ${result.error}`,
      };
    }
  }

  return { valid: true };
}
