import { ApiError, apiClient } from '@/api/apiClient';

export type ProfileStat = {
  readonly label: string;
  readonly value: string | number;
};

export type ProfileData = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly level: number;
  readonly currentXp: number;
  readonly xpToNextLevel?: number;
  readonly initialWeight: number;
  readonly currentWeight: number;
  readonly dailyWaterGoalInLiters: number;
  readonly dailySleepGoalInHours: number;
  readonly weeklyWorkoutGoal: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly stats: readonly ProfileStat[];
};

type ApiRecord = Record<string, unknown>;

export async function getProfile(): Promise<ProfileData> {
  const userProfileId = getUserProfileId();
  const [profileResponse, homeResponse, historyResponse] = await Promise.all([
    apiClient.get<unknown>(`/user-profiles/${userProfileId}`),
    apiClient.get<unknown>(`/mobile/users/${userProfileId}/home`).catch(() => undefined),
    apiClient.get<unknown>(`/mobile/users/${userProfileId}/history?page=1&pageSize=1`).catch(() => undefined),
  ]);

  return mapProfileResponse(profileResponse, homeResponse, historyResponse);
}

function getUserProfileId(): string {
  const userProfileId = process.env.EXPO_PUBLIC_USER_PROFILE_ID;

  if (!userProfileId) {
    throw new ApiError('Configure EXPO_PUBLIC_USER_PROFILE_ID para carregar o Perfil.');
  }

  return userProfileId;
}

function mapProfileResponse(
  profileResponse: unknown,
  homeResponse: unknown,
  historyResponse: unknown,
): ProfileData {
  const profile = getObject(getField(asObject(profileResponse), 'data')) ?? asObject(profileResponse);

  if (!profile) {
    throw new ApiError('Perfil não encontrado.');
  }

  const home = getObject(getField(asObject(homeResponse), 'data')) ?? asObject(homeResponse);
  const history = getObject(getField(asObject(historyResponse), 'data')) ?? asObject(historyResponse);
  const gamification = getObject(getField(home, 'gamification'));
  const metricsSummary = getObject(getField(home, 'metricsSummary', 'metrics_summary'));
  const historySummary = getObject(getField(history, 'summary'));
  const weeklyProgress = getObject(getField(home, 'weeklyProgress', 'weekly_progress'));
  const totalWorkouts =
    getNumber(metricsSummary, ['completedWorkouts', 'completed_workouts']) ??
    getNumber(historySummary, ['workouts']);
  const weeklyVolume =
    getNumber(metricsSummary, ['weeklyVolumeMoved', 'weekly_volume_moved']) ??
    getNumber(historySummary, ['weeklyVolume', 'weekly_volume']);
  const totalVolume = getNumber(metricsSummary, ['totalVolumeMoved', 'total_volume_moved']);
  const totalDurationMinutes = getNumber(historySummary, ['totalDurationMinutes', 'total_duration_minutes']);
  const weeklyCompletedWorkouts = getNumber(weeklyProgress, ['completedWorkouts', 'completed_workouts']);

  return {
    id: getString(profile, ['id']) ?? '',
    name: getString(profile, ['name']) ?? '',
    email: getString(profile, ['email']) ?? '',
    level: getNumber(gamification, ['level']) ?? getNumber(profile, ['level']) ?? 0,
    currentXp:
      getNumber(gamification, ['currentXp', 'current_xp']) ??
      getNumber(profile, ['totalXp', 'total_xp']) ??
      0,
    xpToNextLevel: getNumber(gamification, ['xpToNextLevel', 'xp_to_next_level']),
    initialWeight: getNumber(profile, ['initialWeight', 'initial_weight']) ?? 0,
    currentWeight: getNumber(profile, ['currentWeight', 'current_weight']) ?? 0,
    dailyWaterGoalInLiters:
      getNumber(profile, ['dailyWaterGoalInLiters', 'daily_water_goal_in_liters']) ?? 0,
    dailySleepGoalInHours:
      getNumber(profile, ['dailySleepGoalInHours', 'daily_sleep_goal_in_hours']) ?? 0,
    weeklyWorkoutGoal: getNumber(profile, ['weeklyWorkoutGoal', 'weekly_workout_goal']) ?? 0,
    createdAt: getString(profile, ['createdAt', 'created_at']) ?? '',
    updatedAt: getString(profile, ['updatedAt', 'updated_at']) ?? '',
    stats: [
      mapOptionalStat('Treinos', totalWorkouts),
      mapOptionalStat('Treinos na semana', weeklyCompletedWorkouts),
      mapOptionalStat('Tempo total', totalDurationMinutes, formatDuration),
      mapOptionalStat('Volume semanal', weeklyVolume, formatVolume),
      mapOptionalStat('Volume total', totalVolume, formatVolume),
    ].filter((stat): stat is ProfileStat => stat !== undefined),
  };
}

function mapOptionalStat(
  label: string,
  value?: number,
  formatter: (value: number) => string | number = (nextValue) => nextValue,
): ProfileStat | undefined {
  if (value === undefined) {
    return undefined;
  }

  return {
    label,
    value: formatter(value),
  };
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

function formatVolume(volume: number): string {
  if (volume >= 1000) {
    return `${Number((volume / 1000).toFixed(1))}k kg`;
  }

  return `${volume} kg`;
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
