import { useCallback, useEffect, useState } from 'react';

import { ApiError } from '@/api/apiClient';
import { getGamification, type GamificationData } from '@/services/gamificationService';

export type UseGamificationResult = {
  readonly gamification?: GamificationData;
  readonly isLoading: boolean;
  readonly error?: string;
  readonly refetch: () => Promise<void>;
};

export function useGamification(): UseGamificationResult {
  const [gamification, setGamification] = useState<GamificationData>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(undefined);

    try {
      setGamification(await getGamification());
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadInitialGamification() {
      try {
        const nextGamification = await getGamification();

        if (!isActive) {
          return;
        }

        setGamification(nextGamification);
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

    void loadInitialGamification();

    return () => {
      isActive = false;
    };
  }, []);

  return {
    gamification,
    isLoading,
    error,
    refetch,
  };
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.status ? `${error.message} Código ${error.status}.` : error.message;
  }

  return 'Não foi possível carregar a gamificação.';
}
