import { ApiError, apiClient } from '@/api/apiClient';
import { getMobileWorkouts, getWorkoutById, type MobileWorkout } from '@/services/workoutsService';

export type AvailableExercise = {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly muscleGroup: string;
  readonly muscleGroupId?: string;
  readonly muscleGroupDisplayName?: string;
  readonly isCustom: boolean;
  readonly userProfileId?: string;
  readonly media?: ExerciseMedia;
};

export type MuscleGroupOption = {
  readonly id: string;
  readonly name: string;
  readonly displayName: string;
  readonly icon?: string;
  readonly displayOrder: number;
};

export type ExerciseMedia = {
  readonly type: 'placeholder' | 'image' | 'gif' | 'video';
  readonly uri?: string;
};

export type WorkoutBuilderWorkout = MobileWorkout;

export type WorkoutExerciseLink = {
  readonly id: string;
  readonly exerciseId: string;
  readonly order: number;
};

export type WorkoutExerciseSummary = {
  readonly id: string;
  readonly exerciseId: string;
  readonly name: string;
  readonly muscleGroup: string;
  readonly order: number;
};

export type SaveWorkoutPlanInput = {
  readonly exerciseIds: readonly string[];
  readonly name: string;
  readonly workoutId?: string;
};

type ApiRecord = Record<string, unknown>;

export async function getWorkoutBuilderData(): Promise<{
  readonly exercises: readonly AvailableExercise[];
  readonly muscleGroups: readonly MuscleGroupOption[];
  readonly workouts: readonly WorkoutBuilderWorkout[];
}> {
  const [exercises, muscleGroups, workoutsData] = await Promise.all([
    getAvailableExercises(),
    getMuscleGroups(),
    getMobileWorkouts(),
  ]);
  const workouts = workoutsData.savedWorkouts;

  return { exercises, muscleGroups, workouts: dedupeWorkouts(workouts) };
}

export async function getAvailableExercises(): Promise<readonly AvailableExercise[]> {
  const userProfileId = getUserProfileId('listar exercícios');
  const response = await apiClient.get<unknown>('/mobile/exercises');
  const exercises = mapExercises(response);

  return exercises.filter(
    (exercise) => !exercise.isCustom || normalizeId(exercise.userProfileId) === normalizeId(userProfileId),
  );
}

export async function getMuscleGroups(): Promise<readonly MuscleGroupOption[]> {
  const response = await apiClient.get<unknown>('/mobile/muscle-groups');
  return mapMuscleGroups(response);
}

export async function getWorkoutExerciseLinks(workoutId: string): Promise<readonly WorkoutExerciseLink[]> {
  const response = await apiClient.get<unknown>(`/workouts/${workoutId}/exercises`);
  return mapWorkoutExerciseLinks(response);
}

export async function getWorkoutExerciseSummaries(workoutId: string): Promise<readonly WorkoutExerciseSummary[]> {
  const [links, exercises] = await Promise.all([
    getWorkoutExerciseLinks(workoutId),
    getAvailableExercises(),
  ]);
  const exercisesById = new Map(exercises.map((exercise) => [exercise.id, exercise]));

  return links.map((link) => {
    const exercise = exercisesById.get(link.exerciseId);

    return {
      id: link.id,
      exerciseId: link.exerciseId,
      name: exercise?.name ?? 'Exercício indisponível',
      muscleGroup: exercise ? formatExerciseMuscleGroup(exercise) : 'Grupo indisponível',
      order: link.order,
    };
  });
}

export async function saveWorkoutPlan({
  exerciseIds,
  name,
  workoutId,
}: SaveWorkoutPlanInput): Promise<string> {
  if (workoutId) {
    await updateWorkoutName(workoutId, name);
    await replaceWorkoutExercises(workoutId, exerciseIds);
    return workoutId;
  }

  return createWorkoutWithExercises({ exerciseIds, name });
}

export async function createWorkoutWithExercises({
  exerciseIds,
  name,
}: {
  readonly exerciseIds: readonly string[];
  readonly name: string;
}): Promise<string> {
  const userProfileId = getUserProfileId('criar um treino');
  const workoutResponse = await apiClient.post<unknown>('/workouts/with-exercises', {
    userProfileId,
    name: name.trim(),
    workoutDate: new Date().toISOString(),
    location: null,
    notes: null,
    exercises: exerciseIds.map((exerciseId, index) => ({
      exerciseId,
      order: index + 1,
      notes: null,
    })),
  });
  const workout = getObject(getField(asObject(workoutResponse), 'data')) ?? asObject(workoutResponse) ?? {};
  const nextWorkoutId = getString(workout, ['id']);

  if (!nextWorkoutId) {
    throw new ApiError('A API não retornou o treino criado.');
  }

  return nextWorkoutId;
}

async function updateWorkoutName(workoutId: string, name: string): Promise<void> {
  const workout = await getWorkoutById(workoutId);

  await apiClient.put<unknown>(`/workouts/${workoutId}`, {
    userProfileId: workout.userProfileId || getUserProfileId('editar um treino'),
    name: name.trim(),
    workoutDate: workout.workoutDate || new Date().toISOString(),
    location: workout.location ?? null,
    notes: workout.notes ?? null,
  });
}

async function replaceWorkoutExercises(
  workoutId: string,
  exerciseIds: readonly string[],
): Promise<void> {
  const currentLinks = await getWorkoutExerciseLinks(workoutId);

  for (const link of currentLinks) {
    await apiClient.delete<unknown>(`/workouts/${workoutId}/exercises/${link.id}`);
  }

  await addWorkoutExercises(workoutId, exerciseIds);
}

async function addWorkoutExercises(workoutId: string, exerciseIds: readonly string[]): Promise<void> {
  for (const [index, exerciseId] of exerciseIds.entries()) {
    await apiClient.post<unknown>(`/workouts/${workoutId}/exercises`, {
      exerciseId,
      order: index + 1,
      notes: null,
    });
  }
}

function dedupeWorkouts(workouts: readonly WorkoutBuilderWorkout[]): readonly WorkoutBuilderWorkout[] {
  const seenIds = new Set<string>();

  return workouts.filter((workout) => {
    if (!workout.id || seenIds.has(workout.id)) {
      return false;
    }

    seenIds.add(workout.id);
    return true;
  });
}

function getUserProfileId(action: string): string {
  const userProfileId = process.env.EXPO_PUBLIC_USER_PROFILE_ID;

  if (!userProfileId) {
    throw new ApiError(`Configure EXPO_PUBLIC_USER_PROFILE_ID para ${action}.`);
  }

  return userProfileId;
}

function mapExercises(response: unknown): readonly AvailableExercise[] {
  const value = getObject(getField(asObject(response), 'data')) ?? response;

  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(mapExercise).filter((exercise): exercise is AvailableExercise => exercise !== undefined);
}

function mapExercise(value: unknown): AvailableExercise | undefined {
  const exercise = asObject(value);
  const id = getString(exercise, ['id']);
  const name = getString(exercise, ['name']);
  const muscleGroupDisplayName = getString(exercise, ['muscleGroupDisplayName', 'muscle_group_display_name']);

  if (!id || !name) {
    return undefined;
  }

  return {
    id,
    name,
    description: getString(exercise, ['description']),
    muscleGroup: getString(exercise, ['muscleGroup', 'muscle_group']) ?? 'Other',
    muscleGroupId: getString(exercise, ['muscleGroupId', 'muscle_group_id']),
    muscleGroupDisplayName,
    isCustom: getBoolean(exercise, ['isCustom', 'is_custom']) ?? false,
    userProfileId: getString(exercise, ['userProfileId', 'user_profile_id']),
    media: { type: 'placeholder' },
  };
}

function mapMuscleGroups(response: unknown): readonly MuscleGroupOption[] {
  const value = getObject(getField(asObject(response), 'data')) ?? response;

  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(mapMuscleGroup)
    .filter((muscleGroup): muscleGroup is MuscleGroupOption => muscleGroup !== undefined)
    .sort((first, second) => first.displayOrder - second.displayOrder);
}

function mapMuscleGroup(value: unknown): MuscleGroupOption | undefined {
  const muscleGroup = asObject(value);
  const id = getString(muscleGroup, ['id']);
  const name = getString(muscleGroup, ['name']);
  const displayName = getString(muscleGroup, ['displayName', 'display_name']);

  if (!id || !name || !displayName) {
    return undefined;
  }

  return {
    id,
    name,
    displayName,
    icon: getString(muscleGroup, ['icon']),
    displayOrder: getNumber(muscleGroup, ['displayOrder', 'display_order']) ?? 999,
  };
}

function mapWorkoutExerciseLinks(response: unknown): readonly WorkoutExerciseLink[] {
  const value = getObject(getField(asObject(response), 'data')) ?? response;

  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(mapWorkoutExerciseLink)
    .filter((link): link is WorkoutExerciseLink => link !== undefined)
    .sort((first, second) => first.order - second.order);
}

function mapWorkoutExerciseLink(value: unknown): WorkoutExerciseLink | undefined {
  const link = asObject(value);
  const id = getString(link, ['id']);
  const exerciseId = getString(link, ['exerciseId', 'exercise_id']);

  if (!id || !exerciseId) {
    return undefined;
  }

  return {
    id,
    exerciseId,
    order: getNumber(link, ['order']) ?? 0,
  };
}

function formatExerciseMuscleGroup(exercise: AvailableExercise): string {
  return exercise.muscleGroupDisplayName ?? exercise.muscleGroup;
}

function normalizeId(value?: string): string {
  return value?.toLowerCase() ?? '';
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

function getBoolean(object: ApiRecord | undefined, keys: readonly string[]): boolean | undefined {
  const value = getField(object, ...keys);
  return typeof value === 'boolean' ? value : undefined;
}

function getObject(value: unknown): ApiRecord | undefined {
  return asObject(value);
}

function asObject(value: unknown): ApiRecord | undefined {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as ApiRecord) : undefined;
}
