import { ApiError, apiClient } from '@/api/apiClient';
import { getXpSummary } from '@/services/gamificationService';

export type ProfileStat = {
  readonly label: string;
  readonly value: string | number;
};

export type ProfileData = {
  readonly id: string;
  readonly name: string;
  readonly email?: string;
  readonly level: number;
  readonly currentXp: number;
  readonly xpToNextLevel?: number;
  readonly initialWeight?: number;
  readonly currentWeight?: number;
  readonly dailyWaterGoalInLiters?: number;
  readonly dailySleepGoalInHours?: number;
  readonly weeklyWorkoutGoal?: number;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly stats: readonly ProfileStat[];
};

type ApiRecord = Record<string, unknown>;

export async function getProfile(): Promise<ProfileData> {
  const userProfileId = getUserProfileId();
  const [profileResponse, homeResponse, historyResponse, xpSummary] = await Promise.all([
    apiClient.get<unknown>(`/user-profiles/${userProfileId}`),
    apiClient.get<unknown>(`/mobile/users/${userProfileId}/home`).catch(() => undefined),
    apiClient.get<unknown>(`/mobile/users/${userProfileId}/history?page=1&pageSize=1`).catch(() => undefined),
    getXpSummary().catch(() => undefined),
  ]);

  return mapProfileResponse(profileResponse, homeResponse, historyResponse, xpSummary);
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
  xpSummary: Awaited<ReturnType<typeof getXpSummary>> | undefined,
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
  const weight = getObject(getField(home, 'weight'));
  const water = getObject(getField(home, 'water'));
  const sleep = getObject(getField(home, 'sleep'));
  const totalWorkouts =
    getNumber(metricsSummary, ['completedWorkouts', 'completed_workouts']) ??
    getNumber(historySummary, ['workouts']);
  const weeklyVolume =
    getNumber(metricsSummary, ['weeklyVolumeMoved', 'weekly_volume_moved']) ??
    getNumber(historySummary, ['weeklyVolume', 'weekly_volume']);
  const totalVolume = getNumber(metricsSummary, ['totalVolumeMoved', 'total_volume_moved']);
  const totalDurationMinutes = getNumber(historySummary, ['totalDurationMinutes', 'total_duration_minutes']);
  const weeklyCompletedWorkouts = getNumber(weeklyProgress, ['completedWorkouts', 'completed_workouts']);
  const weeklyWorkoutGoal =
    getNumber(profile, ['weeklyWorkoutGoal', 'weekly_workout_goal']) ??
    getNumber(weeklyProgress, ['workoutGoal', 'workout_goal']);
  const todayWaterConsumption =
    getNumber(water, ['todayConsumption', 'today_consumption']) ??
    getNumber(metricsSummary, ['todayWaterConsumption', 'today_water_consumption']);
  const latestSleepHours =
    getNumber(sleep, ['latestHours', 'latest_hours']) ??
    getNumber(metricsSummary, ['latestSleepHours', 'latest_sleep_hours']);
  const currentWeight =
    getNumber(profile, ['currentWeight', 'current_weight']) ??
    getNumber(weight, ['currentWeight', 'current_weight']);
  const initialWeight =
    getNumber(profile, ['initialWeight', 'initial_weight']) ??
    getNumber(weight, ['initialWeight', 'initial_weight']);

  return {
    id: getString(profile, ['id']) ?? '',
    name: getString(profile, ['name']) ?? '',
    email: getString(profile, ['email']),
    level: xpSummary?.level ?? getNumber(gamification, ['level']) ?? getNumber(profile, ['level']) ?? 0,
    currentXp:
      xpSummary?.totalXp ??
      getNumber(gamification, ['currentXp', 'current_xp']) ??
      getNumber(profile, ['totalXp', 'total_xp']) ??
      0,
    xpToNextLevel:
      xpSummary?.xpToNextLevel ?? getNumber(gamification, ['xpToNextLevel', 'xp_to_next_level']),
    initialWeight,
    currentWeight,
    dailyWaterGoalInLiters:
      getNumber(profile, ['dailyWaterGoalInLiters', 'daily_water_goal_in_liters']) ??
      getNumber(water, ['dailyGoal', 'daily_goal']),
    dailySleepGoalInHours:
      getNumber(profile, ['dailySleepGoalInHours', 'daily_sleep_goal_in_hours']) ??
      getNumber(sleep, ['dailyGoal', 'daily_goal']),
    weeklyWorkoutGoal,
    createdAt: getString(profile, ['createdAt', 'created_at']),
    updatedAt: getString(profile, ['updatedAt', 'updated_at']),
    stats: [
      mapOptionalStat('Treinos', totalWorkouts),
      mapOptionalStat('Treinos na semana', weeklyCompletedWorkouts),
      mapOptionalStat('Tempo total', totalDurationMinutes, formatDuration),
      mapOptionalStat('Volume semanal', weeklyVolume, formatVolume),
      mapOptionalStat('Volume total', totalVolume, formatVolume),
      mapOptionalStat('Água hoje', todayWaterConsumption, formatLiters),
      mapOptionalStat('Sono recente', latestSleepHours, formatHours),
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

function formatLiters(value: number): string {
  return `${formatDecimal(value)} L`;
}

function formatHours(value: number): string {
  return `${formatDecimal(value)} h`;
}

function formatDecimal(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 1,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
  }).format(value);
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
