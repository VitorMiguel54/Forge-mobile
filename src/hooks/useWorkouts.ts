import { useCallback, useEffect, useState } from 'react';

import { ApiError } from '@/api/apiClient';
import {
  createWorkout as createWorkoutRequest,
  getMobileWorkouts,
  type MobileWorkoutsData,
  type WorkoutDetails,
} from '@/services/workoutsService';

export type UseWorkoutsResult = {
  readonly workouts?: MobileWorkoutsData;
  readonly isLoading: boolean;
  readonly isCreating: boolean;
  readonly error?: string;
  readonly actionError?: string;
  readonly refetch: () => Promise<void>;
  readonly createWorkout: () => Promise<WorkoutDetails | undefined>;
};

export function useWorkouts(): UseWorkoutsResult {
  const [workouts, setWorkouts] = useState<MobileWorkoutsData>();
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string>();
  const [actionError, setActionError] = useState<string>();

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

  const createWorkout = useCallback(async () => {
    setIsCreating(true);
    setActionError(undefined);

    try {
      const createdWorkout = await createWorkoutRequest();
      setWorkouts(await getMobileWorkouts());
      return createdWorkout;
    } catch (requestError) {
      setActionError(getErrorMessage(requestError));
      return undefined;
    } finally {
      setIsCreating(false);
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
    isCreating,
    error,
    actionError,
    refetch,
    createWorkout,
  };
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.status ? `${error.message} Código ${error.status}.` : error.message;
  }

  return 'Não foi possível carregar os treinos.';
}
