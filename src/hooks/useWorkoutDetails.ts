import { useEffect, useState } from 'react';

import { ApiError } from '@/api/apiClient';
import { getWorkoutById, type WorkoutDetails } from '@/services/workoutsService';

export type UseWorkoutDetailsResult = {
  readonly workout?: WorkoutDetails;
  readonly isLoading: boolean;
  readonly error?: string;
};

export function useWorkoutDetails(id?: string): UseWorkoutDetailsResult {
  const [workout, setWorkout] = useState<WorkoutDetails>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const missingIdError = id ? undefined : 'Treino não informado.';

  useEffect(() => {
    let isActive = true;

    async function loadWorkoutDetails(workoutId: string) {
      setIsLoading(true);
      setError(undefined);

      try {
        const nextWorkout = await getWorkoutById(workoutId);

        if (!isActive) {
          return;
        }

        setWorkout(nextWorkout);
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

    if (!id) {
      return;
    }

    void loadWorkoutDetails(id);

    return () => {
      isActive = false;
    };
  }, [id]);

  return {
    workout: id ? workout : undefined,
    isLoading: id ? isLoading : false,
    error: missingIdError ?? error,
  };
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.status ? `${error.message} Código ${error.status}.` : error.message;
  }

  return 'Não foi possível carregar o treino.';
}
