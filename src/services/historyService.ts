import { ApiError, apiClient } from '@/api/apiClient';

export type MobileHistorySummary = {
  readonly workouts: number;
  readonly totalDurationMinutes: number;
  readonly weeklyVolume: number;
};

export type MobileHistoryPage = {
  readonly page: number;
  readonly pageSize: number;
  readonly totalItems: number;
  readonly totalPages: number;
};

export type MobileHistoryWorkout = {
  readonly id: string;
  readonly name: string;
  readonly date: string;
  readonly durationMinutes: number;
  readonly volume: number;
  readonly exerciseCount: number;
  readonly muscleGroups: readonly string[];
};

export type MobileHistoryData = {
  readonly summary: MobileHistorySummary;
  readonly page: MobileHistoryPage;
  readonly workouts: readonly MobileHistoryWorkout[];
};

type ApiRecord = Record<string, unknown>;

const historyEndpoint = process.env.EXPO_PUBLIC_HISTORY_ENDPOINT;
const userProfileId = process.env.EXPO_PUBLIC_USER_PROFILE_ID;

export async function getMobileHistory(page = 1, pageSize = 20): Promise<MobileHistoryData> {
  const response = await apiClient.get<unknown>(resolveHistoryEndpoint(page, pageSize));
  return mapHistoryResponse(response);
}

function resolveHistoryEndpoint(page: number, pageSize: number): string {
  if (historyEndpoint) {
    const endpoint = userProfileId
      ? historyEndpoint.replace('{userProfileId}', userProfileId)
      : historyEndpoint;

    return appendPagination(endpoint, page, pageSize);
  }

  if (!userProfileId) {
    throw new ApiError('Configure EXPO_PUBLIC_USER_PROFILE_ID para carregar o histórico.');
  }

  return `/mobile/users/${userProfileId}/history?page=${page}&pageSize=${pageSize}`;
}

function appendPagination(endpoint: string, page: number, pageSize: number): string {
  if (endpoint.includes('page=') || endpoint.includes('pageSize=')) {
    return endpoint;
  }

  const separator = endpoint.includes('?') ? '&' : '?';
  return `${endpoint}${separator}page=${page}&pageSize=${pageSize}`;
}

function mapHistoryResponse(response: unknown): MobileHistoryData {
  const payload = getObject(getField(asObject(response), 'data')) ?? asObject(response) ?? {};

  return {
    summary: mapSummary(getObject(getField(payload, 'summary'))),
    page: mapPage(getObject(getField(payload, 'page'))),
    workouts: mapWorkoutList(getField(payload, 'workouts')),
  };
}

function mapSummary(value?: ApiRecord): MobileHistorySummary {
  return {
    workouts: getNumber(value, ['workouts']) ?? 0,
    totalDurationMinutes:
      getNumber(value, ['totalDurationMinutes', 'total_duration_minutes']) ?? 0,
    weeklyVolume: getNumber(value, ['weeklyVolume', 'weekly_volume']) ?? 0,
  };
}

function mapPage(value?: ApiRecord): MobileHistoryPage {
  return {
    page: getNumber(value, ['page']) ?? 1,
    pageSize: getNumber(value, ['pageSize', 'page_size']) ?? 20,
    totalItems: getNumber(value, ['totalItems', 'total_items']) ?? 0,
    totalPages: getNumber(value, ['totalPages', 'total_pages']) ?? 0,
  };
}

function mapWorkoutList(value: unknown): readonly MobileHistoryWorkout[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(mapWorkout).filter((workout): workout is MobileHistoryWorkout => workout !== undefined);
}

function mapWorkout(value: unknown): MobileHistoryWorkout | undefined {
  const workout = asObject(value);

  if (!workout) {
    return undefined;
  }

  return {
    id: getString(workout, ['id']) ?? '',
    name: getString(workout, ['name']) ?? '',
    date: getString(workout, ['date', 'workoutDate', 'workout_date']) ?? '',
    durationMinutes: getNumber(workout, ['durationMinutes', 'duration_minutes']) ?? 0,
    volume: getNumber(workout, ['volume']) ?? 0,
    exerciseCount: getNumber(workout, ['exerciseCount', 'exercise_count']) ?? 0,
    muscleGroups: mapMuscleGroups(getField(workout, 'muscleGroups', 'muscle_groups')),
  };
}

function mapMuscleGroups(value: unknown): readonly string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(value.filter((item): item is string => typeof item === 'string' && item.length > 0)),
  );
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
