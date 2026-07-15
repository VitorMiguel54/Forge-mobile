import { useCallback, useEffect, useState } from 'react';

import { ApiError } from '@/api/apiClient';
import {
  getWorkoutBuilderData,
  getWorkoutExerciseLinks,
  saveWorkoutPlan,
  type AvailableExercise,
  type MuscleGroupOption,
  type WorkoutBuilderWorkout,
  type WorkoutExerciseLink,
} from '@/services/workoutBuilderService';

export type UseWorkoutBuilderResult = {
  readonly exercises: readonly AvailableExercise[];
  readonly muscleGroups: readonly MuscleGroupOption[];
  readonly workouts: readonly WorkoutBuilderWorkout[];
  readonly selectedWorkoutLinks: readonly WorkoutExerciseLink[];
  readonly isLoading: boolean;
  readonly isSaving: boolean;
  readonly isLoadingWorkout: boolean;
  readonly error?: string;
  readonly actionError?: string;
  readonly successMessage?: string;
  readonly refetch: () => Promise<void>;
  readonly loadWorkoutExercises: (workoutId: string) => Promise<readonly WorkoutExerciseLink[]>;
  readonly saveWorkout: (input: {
    readonly exerciseIds: readonly string[];
    readonly name: string;
    readonly workoutId?: string;
  }) => Promise<string | undefined>;
};

export function useWorkoutBuilder(): UseWorkoutBuilderResult {
  const [exercises, setExercises] = useState<readonly AvailableExercise[]>([]);
  const [muscleGroups, setMuscleGroups] = useState<readonly MuscleGroupOption[]>([]);
  const [workouts, setWorkouts] = useState<readonly WorkoutBuilderWorkout[]>([]);
  const [selectedWorkoutLinks, setSelectedWorkoutLinks] = useState<readonly WorkoutExerciseLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingWorkout, setIsLoadingWorkout] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [actionError, setActionError] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(undefined);

    try {
      const data = await getWorkoutBuilderData();
      setExercises(data.exercises);
      setMuscleGroups(data.muscleGroups);
      setWorkouts(data.workouts);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadWorkoutExercises = useCallback(async (workoutId: string) => {
    setIsLoadingWorkout(true);
    setActionError(undefined);
    setSuccessMessage(undefined);

    try {
      const links = await getWorkoutExerciseLinks(workoutId);
      setSelectedWorkoutLinks(links);
      return links;
    } catch (requestError) {
      setActionError(getErrorMessage(requestError));
      setSelectedWorkoutLinks([]);
      return [];
    } finally {
      setIsLoadingWorkout(false);
    }
  }, []);

  const saveWorkout = useCallback(
    async ({
      exerciseIds,
      name,
      workoutId,
    }: {
      readonly name: string;
      readonly exerciseIds: readonly string[];
      readonly workoutId?: string;
    }) => {
      setIsSaving(true);
      setActionError(undefined);
      setSuccessMessage(undefined);

      try {
        const savedWorkoutId = await saveWorkoutPlan({ exerciseIds, name, workoutId });
        const data = await getWorkoutBuilderData();
        setExercises(data.exercises);
        setMuscleGroups(data.muscleGroups);
        setWorkouts(data.workouts);
        setSuccessMessage(workoutId ? 'Treino atualizado com sucesso.' : 'Treino criado com sucesso.');
        return savedWorkoutId;
      } catch (requestError) {
        setActionError(getErrorMessage(requestError));
        return undefined;
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  useEffect(() => {
    let isActive = true;

    async function loadInitialData() {
      try {
        const data = await getWorkoutBuilderData();

        if (!isActive) {
          return;
        }

        setExercises(data.exercises);
        setMuscleGroups(data.muscleGroups);
        setWorkouts(data.workouts);
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

    void loadInitialData();

    return () => {
      isActive = false;
    };
  }, []);

  return {
    exercises,
    muscleGroups,
    workouts,
    selectedWorkoutLinks,
    isLoading,
    isLoadingWorkout,
    isSaving,
    error,
    actionError,
    successMessage,
    refetch,
    loadWorkoutExercises,
    saveWorkout,
  };
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.status ? `${error.message} Código ${error.status}.` : error.message;
  }

  return 'Não foi possível preparar o treino.';
}
