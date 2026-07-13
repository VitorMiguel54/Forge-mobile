import { useCallback, useEffect, useState } from 'react';

import { ApiError } from '@/api/apiClient';
import { getMobileWorkouts, type MobileWorkoutsData } from '@/services/workoutsService';

export type UseWorkoutsResult = {
  readonly workouts?: MobileWorkoutsData;
  readonly isLoading: boolean;
  readonly error?: string;
  readonly refetch: () => Promise<void>;
};

export function useWorkouts(): UseWorkoutsResult {
  const [workouts, setWorkouts] = useState<MobileWorkoutsData>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(undefined);

    try {
      setWorkouts(await getMobileWorkouts());
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadInitialWorkouts() {
      try {
        const nextWorkouts = await getMobileWorkouts();

        if (!isActive) {
          return;
        }

        setWorkouts(nextWorkouts);
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

    void loadInitialWorkouts();

    return () => {
      isActive = false;
    };
  }, []);

  return {
    workouts,
    isLoading,
    error,
    refetch,
  };
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.status ? `${error.message} Codigo ${error.status}.` : error.message;
  }

  return 'Nao foi possivel carregar os treinos.';
}
