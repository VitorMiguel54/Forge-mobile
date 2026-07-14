import { ApiError, apiClient } from '@/api/apiClient';

export type AvailableExercise = {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly muscleGroup: string;
  readonly isCustom: boolean;
  readonly userProfileId?: string;
};

type ApiRecord = Record<string, unknown>;

export async function getAvailableExercises(): Promise<readonly AvailableExercise[]> {
  const userProfileId = getUserProfileId('listar exercícios');
  const response = await apiClient.get<unknown>('/exercises');
  const exercises = mapExercises(response);

  return exercises.filter(
    (exercise) => !exercise.isCustom || normalizeId(exercise.userProfileId) === normalizeId(userProfileId),
  );
}

export async function createWorkoutWithExercises({
  exerciseIds,
  name,
}: {
  readonly exerciseIds: readonly string[];
  readonly name: string;
}): Promise<string> {
  const userProfileId = getUserProfileId('criar um treino');
  const workoutResponse = await apiClient.post<unknown>('/workouts', {
    userProfileId,
    name: name.trim(),
    workoutDate: new Date().toISOString(),
    location: null,
    notes: null,
  });
  const workout = getObject(getField(asObject(workoutResponse), 'data')) ?? asObject(workoutResponse) ?? {};
  const workoutId = getString(workout, ['id']);

  if (!workoutId) {
    throw new ApiError('A API não retornou o treino criado.');
  }

  await Promise.all(
    exerciseIds.map((exerciseId, index) =>
      apiClient.post<unknown>(`/workouts/${workoutId}/exercises`, {
        exerciseId,
        order: index + 1,
        notes: null,
      }),
    ),
  );

  return workoutId;
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

  if (!id || !name) {
    return undefined;
  }

  return {
    id,
    name,
    description: getString(exercise, ['description']),
    muscleGroup: getString(exercise, ['muscleGroup', 'muscle_group']) ?? 'Other',
    isCustom: getBoolean(exercise, ['isCustom', 'is_custom']) ?? false,
    userProfileId: getString(exercise, ['userProfileId', 'user_profile_id']),
  };
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
