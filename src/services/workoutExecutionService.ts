import { apiClient } from '@/api/apiClient';
import { getDashboard } from '@/services/dashboardService';
import { getGamification, type AchievementItem } from '@/services/gamificationService';
import { getMobileHistory } from '@/services/historyService';
import { getProfile } from '@/services/profileService';
import { getMobileWorkouts, type WorkoutStatus } from '@/services/workoutsService';

export type WorkoutExecutionSetInput = {
  readonly setNumber: number;
  readonly repetitions: number;
  readonly weight: number;
  readonly notes?: string;
};

export type WorkoutExecutionSet = WorkoutExecutionSetInput & {
  readonly id: string;
  readonly workoutExerciseId: string;
  readonly volume: number;
};

export type WorkoutExecutionExercise = {
  readonly id: string;
  readonly workoutId: string;
  readonly exerciseId: string;
  readonly name: string;
  readonly muscleGroup?: string;
  readonly order: number;
  readonly notes?: string;
  readonly sets: readonly WorkoutExecutionSet[];
};

export type WorkoutExecutionData = {
  readonly workout: {
    readonly id: string;
    readonly name: string;
    readonly workoutDate: string;
    readonly totalVolume: number;
    readonly status: WorkoutStatus;
    readonly isFinalized: boolean;
  };
  readonly exercises: readonly WorkoutExecutionExercise[];
};

export type WorkoutCompletionSummary = {
  readonly xpGained: number;
  readonly totalXp: number;
  readonly previousLevel: number;
  readonly newLevel: number;
  readonly unlockedAchievements: readonly AchievementItem[];
};

type ApiRecord = Record<string, unknown>;

export async function getWorkoutExecution(workoutId: string): Promise<WorkoutExecutionData> {
  const [workoutResponse, workoutExercisesResponse, exerciseCatalogResponse, mobileWorkouts] = await Promise.all([
    apiClient.get<unknown>(`/workouts/${workoutId}`),
    apiClient.get<unknown>(`/workouts/${workoutId}/exercises`),
    apiClient.get<unknown>('/exercises'),
    getMobileWorkouts(),
  ]);
  const workoutStatus = getWorkoutStatus(workoutId, mobileWorkouts);
  const workout = mapWorkout(workoutResponse, workoutStatus);
  const workoutExercises = mapWorkoutExercises(workoutExercisesResponse);
  const exerciseCatalog = mapExerciseCatalog(exerciseCatalogResponse);
  const setLists = await Promise.all(
    workoutExercises.map((workoutExercise) =>
      apiClient.get<unknown>(`/workout-exercises/${workoutExercise.id}/sets`),
    ),
  );

  return {
    workout,
    exercises: workoutExercises
      .map((workoutExercise, index) => {
        const exercise = exerciseCatalog.get(workoutExercise.exerciseId);

        return {
          ...workoutExercise,
          name: exercise?.name ?? 'Exercício sem nome',
          muscleGroup: exercise?.muscleGroup,
          sets: mapWorkoutSets(setLists[index]),
        };
      })
      .sort((first, second) => first.order - second.order),
  };
}

export async function createWorkoutSet(
  workoutExerciseId: string,
  input: WorkoutExecutionSetInput,
): Promise<WorkoutExecutionSet> {
  const response = await apiClient.post<unknown>(`/workout-exercises/${workoutExerciseId}/sets`, {
    setNumber: input.setNumber,
    repetitions: input.repetitions,
    weight: input.weight,
    notes: input.notes?.trim() || null,
  });

  return mapWorkoutSet(response);
}

export async function updateWorkoutSet(
  workoutSetId: string,
  input: WorkoutExecutionSetInput,
): Promise<WorkoutExecutionSet> {
  const response = await apiClient.put<unknown>(`/workout-sets/${workoutSetId}`, {
    setNumber: input.setNumber,
    repetitions: input.repetitions,
    weight: input.weight,
    notes: input.notes?.trim() || null,
  });

  return mapWorkoutSet(response);
}

export async function deleteWorkoutSet(workoutSetId: string): Promise<void> {
  await apiClient.delete<unknown>(`/workout-sets/${workoutSetId}`);
}

export async function finishWorkout(workoutId: string): Promise<WorkoutCompletionSummary> {
  const previousGamification = await getGamification();

  await apiClient.post<unknown>(`/workouts/${workoutId}/finish`);
  const nextGamification = await getGamification();

  await Promise.all([getDashboard(), getMobileHistory(), getMobileWorkouts(), getProfile()]);

  return buildCompletionSummary(previousGamification, nextGamification);
}

function buildCompletionSummary(
  previousGamification: Awaited<ReturnType<typeof getGamification>>,
  nextGamification: Awaited<ReturnType<typeof getGamification>>,
): WorkoutCompletionSummary {
  const previousUnlockedAchievementIds = new Set(
    previousGamification.unlockedAchievements.map((achievement) => achievement.id),
  );

  return {
    xpGained: Math.max(nextGamification.xp.totalXp - previousGamification.xp.totalXp, 0),
    totalXp: nextGamification.xp.totalXp,
    previousLevel: previousGamification.xp.level,
    newLevel: nextGamification.xp.level,
    unlockedAchievements: nextGamification.unlockedAchievements.filter(
      (achievement) => !previousUnlockedAchievementIds.has(achievement.id),
    ),
  };
}

function mapWorkout(response: unknown, status: WorkoutStatus): WorkoutExecutionData['workout'] {
  const workout = getObject(getField(asObject(response), 'data')) ?? asObject(response) ?? {};

  return {
    id: getString(workout, ['id']) ?? '',
    name: getString(workout, ['name']) ?? '',
    workoutDate: getString(workout, ['workoutDate', 'workout_date']) ?? '',
    totalVolume: getNumber(workout, ['totalVolume', 'total_volume']) ?? 0,
    status,
    isFinalized: status === 'completed',
  };
}

function getWorkoutStatus(
  workoutId: string,
  mobileWorkouts: Awaited<ReturnType<typeof getMobileWorkouts>>,
): WorkoutStatus {
  const workouts = [
    ...(mobileWorkouts.activeWorkout ? [mobileWorkouts.activeWorkout] : []),
    ...mobileWorkouts.savedWorkouts,
  ];

  return workouts.find((workout) => workout.id === workoutId)?.status ?? 'available';
}

function mapWorkoutExercises(response: unknown): readonly Omit<WorkoutExecutionExercise, 'name' | 'sets'>[] {
  const value = getObject(getField(asObject(response), 'data')) ?? response;

  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(mapWorkoutExercise).filter((exercise): exercise is Omit<WorkoutExecutionExercise, 'name' | 'sets'> => exercise !== undefined);
}

function mapWorkoutExercise(value: unknown): Omit<WorkoutExecutionExercise, 'name' | 'sets'> | undefined {
  const workoutExercise = asObject(value);

  if (!workoutExercise) {
    return undefined;
  }

  return {
    id: getString(workoutExercise, ['id']) ?? '',
    workoutId: getString(workoutExercise, ['workoutId', 'workout_id']) ?? '',
    exerciseId: getString(workoutExercise, ['exerciseId', 'exercise_id']) ?? '',
    muscleGroup: undefined,
    order: getNumber(workoutExercise, ['order']) ?? 0,
    notes: getString(workoutExercise, ['notes']),
  };
}

function mapExerciseCatalog(response: unknown): ReadonlyMap<string, { readonly name: string; readonly muscleGroup?: string }> {
  const value = getObject(getField(asObject(response), 'data')) ?? response;

  if (!Array.isArray(value)) {
    return new Map();
  }

  const entries: [string, { readonly name: string; readonly muscleGroup?: string }][] = [];

  value.forEach((item) => {
    const exercise = asObject(item);
    const id = getString(exercise, ['id']);
    const name = getString(exercise, ['name']);

    if (id && name) {
      entries.push([id, { name, muscleGroup: getString(exercise, ['muscleGroup', 'muscle_group']) }]);
    }
  });

  return new Map(entries);
}

function mapWorkoutSets(response: unknown): readonly WorkoutExecutionSet[] {
  const value = getObject(getField(asObject(response), 'data')) ?? response;

  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(mapWorkoutSet).sort((first, second) => first.setNumber - second.setNumber);
}

function mapWorkoutSet(response: unknown): WorkoutExecutionSet {
  const workoutSet = getObject(getField(asObject(response), 'data')) ?? asObject(response) ?? {};

  return {
    id: getString(workoutSet, ['id']) ?? '',
    workoutExerciseId: getString(workoutSet, ['workoutExerciseId', 'workout_exercise_id']) ?? '',
    setNumber: getNumber(workoutSet, ['setNumber', 'set_number']) ?? 0,
    repetitions: getNumber(workoutSet, ['repetitions']) ?? 0,
    weight: getNumber(workoutSet, ['weight']) ?? 0,
    volume: getNumber(workoutSet, ['volume']) ?? 0,
    notes: getString(workoutSet, ['notes']),
  };
}

function getField(object: ApiRecord | undefined, ...keys: string[]): unknown {
  const matchedKey = keys.find((key) => object?.[key] !== undefined);
  return matchedKey ? object?.[matchedKey] : undefined;
}

function getString(object: ApiRecord | undefined, keys: readonly string[]): string | undefined {
  const value = getField(object, ...keys);
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function getNumber(object: ApiRecord | undefined, keys: readonly string[]): number | undefined {
  const value = getField(object, ...keys);
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function getObject(value: unknown): ApiRecord | undefined {
  return asObject(value);
}

function asObject(value: unknown): ApiRecord | undefined {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as ApiRecord) : undefined;
}
