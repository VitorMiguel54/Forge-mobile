import { ApiError, apiClient } from '@/api/apiClient';

export type WorkoutStatus = 'available' | 'inProgress' | 'completed' | 'cancelled';

export type MobileWorkout = {
  readonly id: string;
  readonly name: string;
  readonly displayOrder: number;
  readonly muscleGroups: readonly string[];
  readonly exerciseCount: number;
  readonly estimatedDurationMinutes: number;
  readonly status: WorkoutStatus;
};

export type MobileWorkoutsData = {
  readonly activeWorkout?: MobileWorkout;
  readonly savedWorkouts: readonly MobileWorkout[];
};

export type WorkoutDetails = {
  readonly id: string;
  readonly userProfileId: string;
  readonly name: string;
  readonly workoutDate: string;
  readonly location?: string;
  readonly notes?: string;
  readonly totalVolume: number;
  readonly status?: string;
  readonly templateWorkoutId?: string;
  readonly isArchived: boolean;
};

type ApiRecord = Record<string, unknown>;

export async function getMobileWorkouts(): Promise<MobileWorkoutsData> {
  const response = await apiClient.get<unknown>(resolveWorkoutsEndpoint());
  return mapWorkoutsResponse(response);
}

export async function createWorkout(): Promise<WorkoutDetails> {
  const userProfileId = getUserProfileId('criar um treino');
  const response = await apiClient.post<unknown>('/workouts', {
    userProfileId,
    name: getDefaultWorkoutName(),
    workoutDate: new Date().toISOString(),
    location: null,
    notes: null,
  });

  return mapWorkoutDetails(response);
}

export async function getWorkoutById(id: string): Promise<WorkoutDetails> {
  const response = await apiClient.get<unknown>(`/workouts/${id}`);
  return mapWorkoutDetails(response);
}

export async function startWorkout(id: string): Promise<WorkoutDetails> {
  const response = await apiClient.post<unknown>(`/workouts/${id}/start`);
  return mapWorkoutDetails(response);
}

export async function cancelWorkout(id: string): Promise<WorkoutDetails> {
  const response = await apiClient.post<unknown>(`/workouts/${id}/cancel`);
  return mapWorkoutDetails(response);
}

export async function deleteWorkout(id: string): Promise<void> {
  await apiClient.delete<unknown>(`/workouts/${id}`);
}

export async function reorderWorkouts(items: readonly { readonly workoutId: string; readonly displayOrder: number }[]): Promise<void> {
  const userProfileId = getUserProfileId('reordenar os treinos');

  await apiClient.put<unknown>('/workouts/reorder', {
    userProfileId,
    items,
  });
}

function resolveWorkoutsEndpoint(): string {
  const workoutsEndpoint = process.env.EXPO_PUBLIC_WORKOUTS_ENDPOINT;
  const userProfileId = process.env.EXPO_PUBLIC_USER_PROFILE_ID;

  if (workoutsEndpoint) {
    return userProfileId ? workoutsEndpoint.replace('{userProfileId}', userProfileId) : workoutsEndpoint;
  }

  if (!userProfileId) {
    throw new ApiError('Configure EXPO_PUBLIC_USER_PROFILE_ID para carregar os treinos.');
  }

  return `/mobile/users/${userProfileId}/workouts`;
}

function getUserProfileId(action: string): string {
  const userProfileId = process.env.EXPO_PUBLIC_USER_PROFILE_ID;

  if (!userProfileId) {
    throw new ApiError(`Configure EXPO_PUBLIC_USER_PROFILE_ID para ${action}.`);
  }

  return userProfileId;
}

function mapWorkoutsResponse(response: unknown): MobileWorkoutsData {
  const payload = getObject(getField(asObject(response), 'data')) ?? asObject(response) ?? {};
  const activeWorkout = mapWorkout(getField(payload, 'activeWorkout', 'active_workout'));

  return {
    activeWorkout,
    savedWorkouts: mapWorkoutList(getField(payload, 'savedWorkouts', 'saved_workouts')),
  };
}

function mapWorkoutDetails(response: unknown): WorkoutDetails {
  const workout = getObject(getField(asObject(response), 'data')) ?? asObject(response) ?? {};

  return {
    id: getString(workout, ['id']) ?? '',
    userProfileId: getString(workout, ['userProfileId', 'user_profile_id']) ?? '',
    name: getString(workout, ['name']) ?? '',
    workoutDate: getString(workout, ['workoutDate', 'workout_date']) ?? '',
    location: getString(workout, ['location']),
    notes: getString(workout, ['notes']),
    totalVolume: getNumber(workout, ['totalVolume', 'total_volume']) ?? 0,
    status: getString(workout, ['status']),
    templateWorkoutId: getString(workout, ['templateWorkoutId', 'template_workout_id']),
    isArchived: getBoolean(workout, ['isArchived', 'is_archived']) ?? false,
  };
}

function mapWorkoutList(value: unknown): readonly MobileWorkout[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(mapWorkout).filter((workout): workout is MobileWorkout => workout !== undefined);
}

function mapWorkout(value: unknown): MobileWorkout | undefined {
  const workout = asObject(value);

  if (!workout) {
    return undefined;
  }

  return {
    id: getString(workout, ['id']) ?? '',
    name: getString(workout, ['name']) ?? '',
    displayOrder: getNumber(workout, ['displayOrder', 'display_order']) ?? 0,
    muscleGroups: mapMuscleGroups(getField(workout, 'muscleGroups', 'muscle_groups')),
    exerciseCount: getNumber(workout, ['exerciseCount', 'exercise_count']) ?? 0,
    estimatedDurationMinutes:
      getNumber(workout, ['estimatedDurationMinutes', 'estimated_duration_minutes']) ?? 0,
    status: mapWorkoutStatus(getString(workout, ['status'])),
  };
}

function mapMuscleGroups(value: unknown): readonly string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string' && item.length > 0);
}

function mapWorkoutStatus(status?: string): WorkoutStatus {
  if (status === 'inProgress' || status === 'completed' || status === 'cancelled') {
    return status;
  }

  return 'available';
}

function getDefaultWorkoutName(): string {
  const date = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(new Date());

  return `Treino ${date}`;
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
