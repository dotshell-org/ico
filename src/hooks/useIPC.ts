import { useState, useCallback } from 'react';
import IPCService from '../services/IPCService';
import { useErrorHandler } from './useErrorHandler';

interface UseIPCOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  showErrorToUser?: boolean;
}

export const useIPC = <T = any>(channel: string, options: UseIPCOptions = {}) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const { handleError } = useErrorHandler();

  const invoke = useCallback(async (...args: any[]) => {
    setLoading(true);
    try {
      const result = await IPCService.invoke<T>(channel, ...args);
      setData(result);
      options.onSuccess?.(result);
      return result;
    } catch (error) {
      if (options.showErrorToUser !== false) {
        handleError(error, `IPC call to ${channel}`);
      }
      options.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [channel, options, handleError]);

  return { data, loading, invoke };
};
