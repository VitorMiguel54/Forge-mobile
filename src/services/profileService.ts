import { ApiError, apiClient } from '@/api/apiClient';
import { getXpSummary } from '@/services/gamificationService';

export type ProfileStat = {
  readonly label: string;
  readonly value: string | number;
};

export type WeightRecordData = {
  readonly id: string;
  readonly weight: number;
  readonly date: string;
};

export type WaterIntakeData = {
  readonly id: string;
  readonly liters: number;
  readonly goalInLiters: number | undefined;
  readonly goalAchieved: boolean | undefined;
  readonly date: string;
};

export type SleepRecordData = {
  readonly id: string;
  readonly hoursSlept: number;
  readonly goalInHours: number | undefined;
  readonly goalAchieved: boolean | undefined;
  readonly date: string;
};

export type ProfileWorkoutData = {
  readonly id: string;
  readonly name: string;
  readonly date: string;
  readonly durationMinutes: number;
  readonly volume: number;
  readonly exerciseCount: number;
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
  readonly summary: {
    readonly totalWorkouts?: number;
    readonly weeklyCompletedWorkouts?: number;
    readonly totalDurationMinutes?: number;
    readonly weeklyVolume?: number;
    readonly totalVolume?: number;
    readonly todayWaterConsumption?: number;
    readonly latestSleepHours?: number;
  };
  readonly records: {
    readonly weights: readonly WeightRecordData[];
    readonly waterIntakes: readonly WaterIntakeData[];
    readonly sleepRecords: readonly SleepRecordData[];
    readonly workouts: readonly ProfileWorkoutData[];
  };
};

type ApiRecord = Record<string, unknown>;

export async function getProfile(): Promise<ProfileData> {
  const userProfileId = getUserProfileId();
  const [
    profileResponse,
    homeResponse,
    historyResponse,
    weightRecordsResponse,
    waterIntakesResponse,
    sleepRecordsResponse,
    xpSummary,
  ] = await Promise.all([
    apiClient.get<unknown>(`/user-profiles/${userProfileId}`),
    apiClient.get<unknown>(`/mobile/users/${userProfileId}/home`).catch(() => undefined),
    apiClient.get<unknown>(`/mobile/users/${userProfileId}/history?page=1&pageSize=100`).catch(() => undefined),
    apiClient.get<unknown>(`/user-profiles/${userProfileId}/weight-records`).catch(() => undefined),
    apiClient.get<unknown>(`/user-profiles/${userProfileId}/water-intakes`).catch(() => undefined),
    apiClient.get<unknown>(`/user-profiles/${userProfileId}/sleep-records`).catch(() => undefined),
    getXpSummary().catch(() => undefined),
  ]);

  return mapProfileResponse(
    profileResponse,
    homeResponse,
    historyResponse,
    weightRecordsResponse,
    waterIntakesResponse,
    sleepRecordsResponse,
    xpSummary,
  );
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
  weightRecordsResponse: unknown,
  waterIntakesResponse: unknown,
  sleepRecordsResponse: unknown,
  xpSummary: Awaited<ReturnType<typeof getXpSummary>> | undefined,
): ProfileData {
  const profile = getObject(getField(asObject(profileResponse), 'data')) ?? asObject(profileResponse);

  if (!profile) {
    throw new ApiError('Perfil não encontrado.');
  }

  const home = getObject(getField(asObject(homeResponse), 'data')) ?? asObject(homeResponse);
  const history = getObject(getField(asObject(historyResponse), 'data')) ?? asObject(historyResponse);
  const weightRecords = mapWeightRecords(weightRecordsResponse);
  const waterIntakes = mapWaterIntakes(waterIntakesResponse);
  const sleepRecords = mapSleepRecords(sleepRecordsResponse);
  const workouts = mapWorkouts(getField(history, 'workouts'));
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
    summary: {
      totalWorkouts,
      weeklyCompletedWorkouts,
      totalDurationMinutes,
      weeklyVolume,
      totalVolume,
      todayWaterConsumption,
      latestSleepHours,
    },
    records: {
      weights: weightRecords,
      waterIntakes,
      sleepRecords,
      workouts,
    },
  };
}

function mapWeightRecords(response: unknown): readonly WeightRecordData[] {
  const payload = getField(asObject(response), 'data') ?? response;

  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map((item) => {
      const record = asObject(item);
      const weight = getNumber(record, ['weight']);
      const date = getString(record, ['recordDate', 'record_date']);

      if (!record || weight === undefined || !date) {
        return undefined;
      }

      return {
        id: getString(record, ['id']) ?? `${date}-${weight}`,
        weight,
        date,
      };
    })
    .filter((record): record is WeightRecordData => record !== undefined)
    .sort(compareByDate);
}

function mapWaterIntakes(response: unknown): readonly WaterIntakeData[] {
  const payload = getField(asObject(response), 'data') ?? response;

  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map((item) => {
      const record = asObject(item);
      const liters = getNumber(record, ['liters']);
      const date = getString(record, ['intakeDate', 'intake_date']);

      if (!record || liters === undefined || !date) {
        return undefined;
      }

      return {
        id: getString(record, ['id']) ?? `${date}-${liters}`,
        liters,
        goalInLiters: getNumber(record, ['goalInLiters', 'goal_in_liters']),
        goalAchieved: getBoolean(record, ['goalAchieved', 'goal_achieved']),
        date,
      };
    })
    .filter((record): record is WaterIntakeData => record !== undefined)
    .sort(compareByDate);
}

function mapSleepRecords(response: unknown): readonly SleepRecordData[] {
  const payload = getField(asObject(response), 'data') ?? response;

  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map((item) => {
      const record = asObject(item);
      const hoursSlept = getNumber(record, ['hoursSlept', 'hours_slept']);
      const date = getString(record, ['sleepDate', 'sleep_date']);

      if (!record || hoursSlept === undefined || !date) {
        return undefined;
      }

      return {
        id: getString(record, ['id']) ?? `${date}-${hoursSlept}`,
        hoursSlept,
        goalInHours: getNumber(record, ['goalInHours', 'goal_in_hours']),
        goalAchieved: getBoolean(record, ['goalAchieved', 'goal_achieved']),
        date,
      };
    })
    .filter((record): record is SleepRecordData => record !== undefined)
    .sort(compareByDate);
}

function mapWorkouts(value: unknown): readonly ProfileWorkoutData[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      const workout = asObject(item);
      const id = getString(workout, ['id']);
      const date = getString(workout, ['date', 'workoutDate', 'workout_date']);

      if (!workout || !id || !date) {
        return undefined;
      }

      return {
        id,
        name: getString(workout, ['name']) ?? 'Treino',
        date,
        durationMinutes: getNumber(workout, ['durationMinutes', 'duration_minutes']) ?? 0,
        volume: getNumber(workout, ['volume']) ?? 0,
        exerciseCount: getNumber(workout, ['exerciseCount', 'exercise_count']) ?? 0,
      };
    })
    .filter((workout): workout is ProfileWorkoutData => workout !== undefined)
    .sort(compareByDate);
}

function compareByDate(left: { readonly date: string }, right: { readonly date: string }): number {
  return new Date(left.date).getTime() - new Date(right.date).getTime();
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
