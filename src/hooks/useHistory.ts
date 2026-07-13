import { useCallback, useEffect, useState } from 'react';

import { ApiError } from '@/api/apiClient';
import { getMobileHistory, type MobileHistoryData } from '@/services/historyService';

export type UseHistoryResult = {
  readonly history?: MobileHistoryData;
  readonly isLoading: boolean;
  readonly error?: string;
  readonly refetch: () => Promise<void>;
};

export function useHistory(): UseHistoryResult {
  const [history, setHistory] = useState<MobileHistoryData>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(undefined);

    try {
      setHistory(await getMobileHistory());
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadInitialHistory() {
      try {
        const nextHistory = await getMobileHistory();

        if (!isActive) {
          return;
        }

        setHistory(nextHistory);
        setError(undefined);
      } catch (requestError) {
        if (isActive) {
          setError(getErrorMessage(requestError));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadInitialHistory();

    return () => {
      isActive = false;
    };
  }, []);

  return {
    history,
    isLoading,
    error,
    refetch,
  };
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.status ? `${error.message} Codigo ${error.status}.` : error.message;
  }

  return 'Nao foi possivel carregar o historico.';
}
