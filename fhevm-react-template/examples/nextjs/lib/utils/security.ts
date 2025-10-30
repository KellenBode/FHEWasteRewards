/**
 * Security Utilities
 * Helper functions for secure operations in FHE applications
 */

import { EncryptedData } from '../fhe/types';

/**
 * Sanitize user input to prevent injection attacks
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

/**
 * Validate Ethereum address format
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate encrypted data structure
 */
export function isValidEncryptedData(data: any): data is EncryptedData {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.ciphertext === 'string' &&
    typeof data.type === 'string' &&
    typeof data.timestamp === 'number' &&
    typeof data.isEncrypted === 'boolean'
  );
}

/**
 * Validate numeric input range for encryption
 */
export function validateNumericInput(
  value: number,
  type: string
): { valid: boolean; error?: string } {
  if (!Number.isFinite(value)) {
    return { valid: false, error: 'Value must be a finite number' };
  }

  if (value < 0) {
    return { valid: false, error: 'Value must be non-negative' };
  }

  const limits: Record<string, number> = {
    uint8: 2 ** 8 - 1,
    uint16: 2 ** 16 - 1,
    uint32: 2 ** 32 - 1,
    uint64: Number.MAX_SAFE_INTEGER,
  };

  const maxValue = limits[type];
  if (maxValue && value > maxValue) {
    return {
      valid: false,
      error: `Value exceeds maximum for ${type}: ${maxValue}`,
    };
  }

  return { valid: true };
}

/**
 * Generate a secure random ID
 */
export function generateSecureId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}_${random}`;
}

/**
 * Hash sensitive data for logging (one-way hash)
 */
export function hashForLogging(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Validate API response structure
 */
export function validateApiResponse(response: any): {
  valid: boolean;
  error?: string;
} {
  if (!response) {
    return { valid: false, error: 'Empty response' };
  }

  if (response.error) {
    return { valid: false, error: response.error };
  }

  return { valid: true };
}

/**
 * Rate limiting check (simple implementation)
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly windowMs: number = 60000; // 1 minute
  private readonly maxRequests: number = 10;

  check(identifier: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];

    // Remove old requests outside the time window
    const recentRequests = userRequests.filter(
      time => now - time < this.windowMs
    );

    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    return true;
  }

  reset(identifier: string): void {
    this.requests.delete(identifier);
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Constant-time string comparison to prevent timing attacks
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Sanitize error messages for client display
 */
export function sanitizeError(error: any): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    // Don't expose internal stack traces to clients
    return error.message.split('\n')[0];
  }

  return 'An unexpected error occurred';
}
