import { useState, useEffect, useContext } from 'react';
import { FhevmSDK } from '../core/FhevmSDK';
import { FhevmContext } from '../context/FhevmContext';

export function useFhevmInit() {
  const context = useContext(FhevmContext);

  if (!context) {
    throw new Error('useFhevmInit must be used within FhevmProvider');
  }

  return {
    fhevm: context.fhevm,
    isReady: context.isReady,
    error: context.error
  };
}
