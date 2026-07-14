import { useCallback, useEffect, useState } from 'react';

import { ApiError } from '@/api/apiClient';
import {
  createWorkoutWithExercises,
  getAvailableExercises,
  type AvailableExercise,
} from '@/services/workoutBuilderService';

export type UseWorkoutBuilderResult = {
  readonly exercises: readonly AvailableExercise[];
  readonly isLoading: boolean;
  readonly isCreating: boolean;
  readonly error?: string;
  readonly actionError?: string;
  readonly refetch: () => Promise<void>;
  readonly createWorkout: (input: {
    readonly name: string;
    readonly exerciseIds: readonly string[];
  }) => Promise<string | undefined>;
};

export function useWorkoutBuilder(): UseWorkoutBuilderResult {
  const [exercises, setExercises] = useState<readonly AvailableExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string>();
  const [actionError, setActionError] = useState<string>();

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(undefined);

    try {
      setExercises(await getAvailableExercises());
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createWorkout = useCallback(
    async ({ exerciseIds, name }: { readonly name: string; readonly exerciseIds: readonly string[] }) => {
      setIsCreating(true);
      setActionError(undefined);

      try {
        return await createWorkoutWithExercises({ exerciseIds, name });
      } catch (requestError) {
        setActionError(getErrorMessage(requestError));
        return undefined;
      } finally {
        setIsCreating(false);
      }
    },
    [],
  );

  useEffect(() => {
    let isActive = true;

    async function loadInitialExercises() {
      try {
        const nextExercises = await getAvailableExercises();

        if (!isActive) {
          return;
        }

        setExercises(nextExercises);
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

    void loadInitialExercises();

    return () => {
      isActive = false;
    };
  }, []);

  return {
    exercises,
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

  return 'Não foi possível preparar o treino.';
}
