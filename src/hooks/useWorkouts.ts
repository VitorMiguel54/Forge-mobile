import { useCallback, useEffect, useState } from 'react';

import { ApiError } from '@/api/apiClient';
import {
  cancelWorkout as cancelWorkoutRequest,
  deleteWorkout as deleteWorkoutRequest,
  createWorkout as createWorkoutRequest,
  getMobileWorkouts,
  reorderWorkouts as reorderWorkoutsRequest,
  startWorkout as startWorkoutRequest,
  type MobileWorkout,
  type MobileWorkoutsData,
  type WorkoutDetails,
} from '@/services/workoutsService';
import {
  getWorkoutExerciseSummaries,
  type WorkoutExerciseSummary,
} from '@/services/workoutBuilderService';

export type UseWorkoutsResult = {
  readonly workouts?: MobileWorkoutsData;
  readonly isLoading: boolean;
  readonly isCreating: boolean;
  readonly isStartingId?: string;
  readonly isDeletingId?: string;
  readonly isCancellingId?: string;
  readonly isReordering: boolean;
  readonly isLoadingExercisesId?: string;
  readonly error?: string;
  readonly actionError?: string;
  readonly successMessage?: string;
  readonly workoutExercisesByWorkoutId: Readonly<Record<string, readonly WorkoutExerciseSummary[]>>;
  readonly refetch: () => Promise<void>;
  readonly createWorkout: () => Promise<WorkoutDetails | undefined>;
  readonly startWorkout: (id: string) => Promise<WorkoutDetails | undefined>;
  readonly cancelWorkout: (id: string) => Promise<boolean>;
  readonly deleteWorkout: (id: string) => Promise<boolean>;
  readonly reorderWorkouts: (nextWorkouts: readonly MobileWorkout[]) => Promise<boolean>;
  readonly loadWorkoutExercises: (id: string) => Promise<readonly WorkoutExerciseSummary[]>;
};

export function useWorkouts(): UseWorkoutsResult {
  const [workouts, setWorkouts] = useState<MobileWorkoutsData>();
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isStartingId, setIsStartingId] = useState<string>();
  const [isDeletingId, setIsDeletingId] = useState<string>();
  const [isCancellingId, setIsCancellingId] = useState<string>();
  const [isReordering, setIsReordering] = useState(false);
  const [isLoadingExercisesId, setIsLoadingExercisesId] = useState<string>();
  const [error, setError] = useState<string>();
  const [actionError, setActionError] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();
  const [workoutExercisesByWorkoutId, setWorkoutExercisesByWorkoutId] = useState<
    Readonly<Record<string, readonly WorkoutExerciseSummary[]>>
  >({});

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
    setSuccessMessage(undefined);

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

  const startWorkout = useCallback(async (id: string) => {
    setIsStartingId(id);
    setActionError(undefined);
    setSuccessMessage(undefined);

    try {
      const startedWorkout = await startWorkoutRequest(id);
      setWorkouts(await getMobileWorkouts());
      return startedWorkout;
    } catch (requestError) {
      setActionError(getErrorMessage(requestError));
      return undefined;
    } finally {
      setIsStartingId(undefined);
    }
  }, []);

  const deleteWorkout = useCallback(async (id: string) => {
    setIsDeletingId(id);
    setActionError(undefined);
    setSuccessMessage(undefined);

    try {
      await deleteWorkoutRequest(id);
      setWorkouts((currentWorkouts) =>
        currentWorkouts
          ? {
              ...currentWorkouts,
              savedWorkouts: currentWorkouts.savedWorkouts.filter((workout) => workout.id !== id),
            }
          : currentWorkouts,
      );
      setWorkoutExercisesByWorkoutId((currentExercises) => {
        const nextExercises = { ...currentExercises };
        delete nextExercises[id];
        return nextExercises;
      });
      setSuccessMessage('Treino excluído dos salvos. O histórico concluído foi preservado.');
      return true;
    } catch (requestError) {
      setActionError(getErrorMessage(requestError));
      return false;
    } finally {
      setIsDeletingId(undefined);
    }
  }, []);

  const cancelWorkout = useCallback(async (id: string) => {
    setIsCancellingId(id);
    setActionError(undefined);
    setSuccessMessage(undefined);

    try {
      await cancelWorkoutRequest(id);
      setWorkouts(await getMobileWorkouts());
      setSuccessMessage('Treino cancelado.');
      return true;
    } catch (requestError) {
      setActionError(getErrorMessage(requestError));
      return false;
    } finally {
      setIsCancellingId(undefined);
    }
  }, []);

  const reorderWorkouts = useCallback(async (nextSavedWorkouts: readonly MobileWorkout[]) => {
    let previousSavedWorkouts: readonly MobileWorkout[] = [];
    setIsReordering(true);
    setActionError(undefined);
    setSuccessMessage(undefined);

    setWorkouts((currentWorkouts) => {
      previousSavedWorkouts = currentWorkouts?.savedWorkouts ?? [];

      return currentWorkouts
        ? {
            ...currentWorkouts,
            savedWorkouts: nextSavedWorkouts,
          }
        : currentWorkouts;
    });

    try {
      await reorderWorkoutsRequest(
        nextSavedWorkouts.map((workout, index) => ({
          workoutId: workout.id,
          displayOrder: index + 1,
        })),
      );
      return true;
    } catch (requestError) {
      setWorkouts((currentWorkouts) =>
        currentWorkouts
          ? {
              ...currentWorkouts,
              savedWorkouts: previousSavedWorkouts,
            }
          : currentWorkouts,
      );
      setActionError(getErrorMessage(requestError));
      return false;
    } finally {
      setIsReordering(false);
    }
  }, []);

  const loadWorkoutExercises = useCallback(async (id: string) => {
    setIsLoadingExercisesId(id);
    setActionError(undefined);

    try {
      const summaries = await getWorkoutExerciseSummaries(id);
      setWorkoutExercisesByWorkoutId((currentExercises) => ({
        ...currentExercises,
        [id]: summaries,
      }));
      return summaries;
    } catch (requestError) {
      setActionError(getErrorMessage(requestError));
      return [];
    } finally {
      setIsLoadingExercisesId(undefined);
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
    isStartingId,
    isDeletingId,
    isCancellingId,
    isReordering,
    isLoadingExercisesId,
    error,
    actionError,
    successMessage,
    workoutExercisesByWorkoutId,
    refetch,
    createWorkout,
    startWorkout,
    cancelWorkout,
    deleteWorkout,
    reorderWorkouts,
    loadWorkoutExercises,
  };
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.status ? `${error.message} Código ${error.status}.` : error.message;
  }

  return 'Não foi possível carregar os treinos.';
}
