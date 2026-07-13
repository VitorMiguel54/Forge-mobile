import { ApiError, apiClient } from '@/api/apiClient';

export type WorkoutStatus = 'available' | 'inProgress' | 'completed';

export type MobileWorkout = {
  readonly id: string;
  readonly name: string;
  readonly muscleGroups: readonly string[];
  readonly exerciseCount: number;
  readonly estimatedDurationMinutes: number;
  readonly status: WorkoutStatus;
};

export type MobileWorkoutsData = {
  readonly activeWorkout?: MobileWorkout;
  readonly savedWorkouts: readonly MobileWorkout[];
};

type ApiRecord = Record<string, unknown>;

const workoutsEndpoint = process.env.EXPO_PUBLIC_WORKOUTS_ENDPOINT;
const userProfileId = process.env.EXPO_PUBLIC_USER_PROFILE_ID;

export async function getMobileWorkouts(): Promise<MobileWorkoutsData> {
  const response = await apiClient.get<unknown>(resolveWorkoutsEndpoint());
  return mapWorkoutsResponse(response);
}

function resolveWorkoutsEndpoint(): string {
  if (workoutsEndpoint) {
    return userProfileId ? workoutsEndpoint.replace('{userProfileId}', userProfileId) : workoutsEndpoint;
  }

  if (!userProfileId) {
    throw new ApiError('Configure EXPO_PUBLIC_USER_PROFILE_ID para carregar os treinos.');
  }

  return `/mobile/users/${userProfileId}/workouts`;
}

function mapWorkoutsResponse(response: unknown): MobileWorkoutsData {
  const payload = getObject(getField(asObject(response), 'data')) ?? asObject(response) ?? {};
  const activeWorkout = mapWorkout(getField(payload, 'activeWorkout', 'active_workout'));

  return {
    activeWorkout,
    savedWorkouts: mapWorkoutList(getField(payload, 'savedWorkouts', 'saved_workouts')),
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
  if (status === 'inProgress' || status === 'completed') {
    return status;
  }

  return 'available';
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
