import { useCallback, useEffect, useState } from 'react';

import { ApiError } from '@/api/apiClient';
import {
  createWorkoutSet,
  deleteWorkoutSet,
  finishWorkout,
  getWorkoutExecution,
  updateWorkoutSet,
  type WorkoutExecutionData,
  type WorkoutExecutionSet,
  type WorkoutExecutionSetInput,
} from '@/services/workoutExecutionService';

export type UseWorkoutExecutionResult = {
  readonly execution?: WorkoutExecutionData;
  readonly currentExerciseIndex: number;
  readonly isLoading: boolean;
  readonly isRegistering: boolean;
  readonly isFinishing: boolean;
  readonly error?: string;
  readonly actionError?: string;
  readonly successMessage?: string;
  readonly registeredSetIds: ReadonlySet<string>;
  readonly refetch: () => Promise<void>;
  readonly goToNextExercise: () => void;
  readonly goToPreviousExercise: () => void;
  readonly updateSet: (setId: string, input: WorkoutExecutionSetInput) => Promise<void>;
  readonly deleteSet: (setId: string) => Promise<void>;
  readonly registerNewSet: (workoutExerciseId: string, input: WorkoutExecutionSetInput) => Promise<void>;
  readonly finish: () => Promise<boolean>;
};

export function useWorkoutExecution(workoutId?: string): UseWorkoutExecutionResult {
  const [execution, setExecution] = useState<WorkoutExecutionData>();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(Boolean(workoutId));
  const [isRegistering, setIsRegistering] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [error, setError] = useState<string>();
  const [actionError, setActionError] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();
  const [registeredSetIds, setRegisteredSetIds] = useState<ReadonlySet<string>>(new Set());
  const missingWorkoutIdError = workoutId ? undefined : 'Treino não informado.';
  const isFinalized = execution?.workout.isFinalized ?? false;

  const loadExecution = useCallback(async () => {
    if (!workoutId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      const nextExecution = await getWorkoutExecution(workoutId);
      setExecution(nextExecution);
      setCurrentExerciseIndex((index) =>
        Math.min(index, Math.max(nextExecution.exercises.length - 1, 0)),
      );
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, [workoutId]);

  const updateSet = useCallback(
    async (setId: string, input: WorkoutExecutionSetInput) => {
      if (isFinalized) {
        setActionError('Treino finalizado não permite alterações.');
        return;
      }

      setIsRegistering(true);
      setActionError(undefined);
      setSuccessMessage(undefined);

      try {
        const updatedSet = await updateWorkoutSet(setId, input);
        setExecution((currentExecution) => replaceSet(currentExecution, updatedSet));
        setRegisteredSetIds((currentIds) => new Set(currentIds).add(updatedSet.id));
        setSuccessMessage(`Série ${updatedSet.setNumber} atualizada.`);
      } catch (requestError) {
        setActionError(getErrorMessage(requestError));
      } finally {
        setIsRegistering(false);
      }
    },
    [isFinalized],
  );

  const deleteSet = useCallback(
    async (setId: string) => {
      if (isFinalized) {
        setActionError('Treino finalizado não permite alterações.');
        return;
      }

      setIsRegistering(true);
      setActionError(undefined);
      setSuccessMessage(undefined);

      try {
        await deleteWorkoutSet(setId);
        setExecution((currentExecution) => removeSet(currentExecution, setId));
        setRegisteredSetIds((currentIds) => {
          const nextIds = new Set(currentIds);
          nextIds.delete(setId);
          return nextIds;
        });
        setSuccessMessage('Série excluída.');
      } catch (requestError) {
        setActionError(getErrorMessage(requestError));
      } finally {
        setIsRegistering(false);
      }
    },
    [isFinalized],
  );

  const registerNewSet = useCallback(
    async (workoutExerciseId: string, input: WorkoutExecutionSetInput) => {
      if (isFinalized) {
        setActionError('Treino finalizado não permite alterações.');
        return;
      }

      setIsRegistering(true);
      setActionError(undefined);
      setSuccessMessage(undefined);

      try {
        const createdSet = await createWorkoutSet(workoutExerciseId, input);
        setExecution((currentExecution) => appendSet(currentExecution, createdSet));
        setRegisteredSetIds((currentIds) => new Set(currentIds).add(createdSet.id));
        setSuccessMessage(`Série ${createdSet.setNumber} registrada.`);
      } catch (requestError) {
        setActionError(getErrorMessage(requestError));
      } finally {
        setIsRegistering(false);
      }
    },
    [isFinalized],
  );

  const finish = useCallback(async () => {
    if (!workoutId) {
      setActionError('Treino não informado.');
      return false;
    }

    if (isFinalized) {
      setActionError('Este treino já está finalizado.');
      return false;
    }

    setIsFinishing(true);
    setActionError(undefined);
    setSuccessMessage(undefined);

    try {
      await finishWorkout(workoutId);
      setSuccessMessage('Treino finalizado. Home, Treinos, Histórico, Perfil e Conquistas foram atualizados pela API.');
      return true;
    } catch (requestError) {
      setActionError(getErrorMessage(requestError));
      return false;
    } finally {
      setIsFinishing(false);
    }
  }, [isFinalized, workoutId]);

  useEffect(() => {
    let isActive = true;

    async function loadInitialExecution(nextWorkoutId: string) {
      try {
        const nextExecution = await getWorkoutExecution(nextWorkoutId);

        if (!isActive) {
          return;
        }

        setExecution(nextExecution);
        setCurrentExerciseIndex((index) =>
          Math.min(index, Math.max(nextExecution.exercises.length - 1, 0)),
        );
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

    if (workoutId) {
      void loadInitialExecution(workoutId);
    }

    return () => {
      isActive = false;
    };
  }, [workoutId]);

  return {
    execution,
    currentExerciseIndex,
    isLoading,
    isRegistering,
    isFinishing,
    error: missingWorkoutIdError ?? error,
    actionError,
    successMessage,
    registeredSetIds,
    refetch: loadExecution,
    goToNextExercise: () =>
      setCurrentExerciseIndex((index) =>
        Math.min(index + 1, Math.max((execution?.exercises.length ?? 1) - 1, 0)),
      ),
    goToPreviousExercise: () => setCurrentExerciseIndex((index) => Math.max(index - 1, 0)),
    updateSet,
    deleteSet,
    registerNewSet,
    finish,
  };
}

function replaceSet(
  execution: WorkoutExecutionData | undefined,
  nextSet: WorkoutExecutionSet,
): WorkoutExecutionData | undefined {
  if (!execution) {
    return execution;
  }

  return {
    ...execution,
    exercises: execution.exercises.map((exercise) => ({
      ...exercise,
      sets: exercise.sets
        .map((set) => (set.id === nextSet.id ? nextSet : set))
        .sort((first, second) => first.setNumber - second.setNumber),
    })),
  };
}

function appendSet(
  execution: WorkoutExecutionData | undefined,
  nextSet: WorkoutExecutionSet,
): WorkoutExecutionData | undefined {
  if (!execution) {
    return execution;
  }

  return {
    ...execution,
    exercises: execution.exercises.map((exercise) =>
      exercise.id === nextSet.workoutExerciseId
        ? {
            ...exercise,
            sets: [...exercise.sets, nextSet].sort(
              (first, second) => first.setNumber - second.setNumber,
            ),
          }
        : exercise,
    ),
  };
}

function removeSet(
  execution: WorkoutExecutionData | undefined,
  setId: string,
): WorkoutExecutionData | undefined {
  if (!execution) {
    return execution;
  }

  return {
    ...execution,
    exercises: execution.exercises.map((exercise) => ({
      ...exercise,
      sets: exercise.sets.filter((set) => set.id !== setId),
    })),
  };
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.status ? `${error.message} Código ${error.status}.` : error.message;
  }

  return 'Não foi possível executar a ação.';
}
