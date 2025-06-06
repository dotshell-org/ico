import { useState, useCallback } from 'react';

interface ErrorState {
  message: string;
  timestamp: number;
}

export const useErrorHandler = () => {
  const [error, setError] = useState<ErrorState | null>(null);

  const handleError = useCallback((error: any, context?: string) => {
    const message = error?.message || error?.toString() || 'Une erreur inattendue est survenue';
    console.error(`Error${context ? ` in ${context}` : ''}:`, error);
    
    setError({
      message: context ? `${context}: ${message}` : message,
      timestamp: Date.now()
    });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
};
