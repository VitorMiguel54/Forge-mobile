import { ApiError, apiClient } from '@/api/apiClient';

export type DashboardProgress = {
  readonly current: number;
  readonly target: number;
};

export type DashboardMetric = {
  readonly value: string | number;
  readonly unit?: string;
  readonly secondaryText?: string;
  readonly progress?: DashboardProgress;
};

export type DashboardListItem = {
  readonly title: string;
  readonly detail: string;
};

export type DashboardData = {
  readonly userName: string;
  readonly dayLabel: string;
  readonly guardianName: string;
  readonly guardianStatus: string;
  readonly weeklyGoal: string;
  readonly nextWorkout: DashboardListItem & {
    readonly estimate: string;
  };
  readonly quickActions: readonly DashboardListItem[];
  readonly weeklyProgress: readonly (DashboardProgress & {
    readonly label: string;
  })[];
  readonly achievement: DashboardListItem & {
    readonly status: string;
  };
  readonly recentActivity: readonly DashboardListItem[];
  readonly xp: {
    readonly level: number;
    readonly current: number;
    readonly next: number;
  };
  readonly metrics: {
    readonly volume: DashboardMetric;
    readonly water: DashboardMetric;
    readonly sleep: DashboardMetric;
    readonly weight: DashboardMetric;
  };
};

type ApiRecord = Record<string, unknown>;

const minutesPerExercise = 8;

const defaultQuickActions: readonly DashboardListItem[] = [
  { title: 'Água', detail: 'Registrar consumo' },
  { title: 'Peso', detail: 'Atualizar medida' },
  { title: 'Sono', detail: 'Registrar noite' },
];

// TODO: A API ainda não fornece identidade/status do Guardião.
const guardianFallback = {
  name: 'Guardião da Forja',
};

// TODO: A API ainda não fornece conquistas/achievement para a Home.
const achievementFallback: DashboardData['achievement'] = {
  title: 'Consistência de Aço',
  detail: 'Conquistas reais pendentes na API.',
  status: 'Pendente',
};

export async function getDashboard(): Promise<DashboardData> {
  const endpoint = resolveDashboardEndpoint();
  const response = await apiClient.get<unknown>(endpoint);
  return mapDashboardResponse(response);
}

function resolveDashboardEndpoint(): string {
  const dashboardEndpoint = process.env.EXPO_PUBLIC_DASHBOARD_ENDPOINT;
  const userProfileId = process.env.EXPO_PUBLIC_USER_PROFILE_ID;

  if (dashboardEndpoint) {
    return userProfileId ? dashboardEndpoint.replace('{userProfileId}', userProfileId) : dashboardEndpoint;
  }

  if (!userProfileId) {
    throw new ApiError('Configure EXPO_PUBLIC_USER_PROFILE_ID para carregar a Home.');
  }

  return `/mobile/users/${userProfileId}/home`;
}

function mapDashboardResponse(response: unknown): DashboardData {
  const payload = getObject(getField(asObject(response), 'data')) ?? asObject(response) ?? {};
  const user = getObject(getField(payload, 'user'));
  const gamification = getObject(getField(payload, 'gamification'));
  const weight = getObject(getField(payload, 'weight'));
  const water = getObject(getField(payload, 'water'));
  const sleep = getObject(getField(payload, 'sleep'));
  const weeklyProgress = getObject(getField(payload, 'weeklyProgress', 'weekly_progress'));
  const activeWorkout = getObject(getField(payload, 'activeWorkout', 'active_workout'));
  const metricsSummary = getObject(getField(payload, 'metricsSummary', 'metrics_summary'));
  const weeklyCompletedWorkouts =
    getNumber(weeklyProgress, ['completedWorkouts', 'completed_workouts']) ?? 0;
  const weeklyWorkoutGoal =
    getNumber(weeklyProgress, ['workoutGoal', 'workout_goal']) ?? 0;
  const todayWaterConsumption = getNumber(water, ['todayConsumption', 'today_consumption']) ?? 0;
  const dailyWaterGoal = getNumber(water, ['dailyGoal', 'daily_goal']) ?? 0;
  const latestSleepHours = getNumber(sleep, ['latestHours', 'latest_hours']) ?? 0;
  const dailySleepGoal = getNumber(sleep, ['dailyGoal', 'daily_goal']) ?? 0;
  const weeklyVolumeMoved =
    getNumber(metricsSummary, ['weeklyVolumeMoved', 'weekly_volume_moved']) ??
    getNumber(metricsSummary, ['totalVolumeMoved', 'total_volume_moved']) ??
    0;
  const currentWeight = getNumber(weight, ['currentWeight', 'current_weight']);
  const weightDifference = getNumber(weight, ['difference']);

  return {
    userName:
      getString(payload, ['userName', 'user_name', 'name']) ??
      getString(user, ['name']) ??
      'Usuário',
    dayLabel: getString(payload, ['dayLabel', 'day_label']) ?? formatTodayLabel(),
    guardianName: getString(payload, ['guardianName', 'guardian_name']) ?? guardianFallback.name,
    guardianStatus:
      getString(payload, ['guardianStatus', 'guardian_status']) ??
      getGuardianStatus(activeWorkout, weeklyCompletedWorkouts, weeklyWorkoutGoal),
    weeklyGoal:
      getString(payload, ['weeklyGoal', 'weekly_goal']) ??
      `${weeklyCompletedWorkouts} de ${weeklyWorkoutGoal} treinos na semana`,
    nextWorkout: mapNextWorkout(
      getObject(getField(payload, 'nextWorkout', 'next_workout')) ?? activeWorkout,
    ),
    quickActions: mapList(getField(payload, 'quickActions', 'quick_actions'), defaultQuickActions),
    weeklyProgress: mapWeeklyProgress(
      getField(payload, 'weeklyProgress', 'weekly_progress'),
      {
        completedWorkouts: weeklyCompletedWorkouts,
        workoutGoal: weeklyWorkoutGoal,
        todayWaterConsumption: Number(todayWaterConsumption),
        dailyWaterGoal,
        latestSleepHours: Number(latestSleepHours),
        dailySleepGoal,
      },
    ),
    achievement: mapAchievement(getObject(getField(payload, 'achievement'))),
    recentActivity: mapList(
      getField(payload, 'recentActivity', 'recent_activity'),
      buildRecentActivity({
        activeWorkout,
        currentWeight,
        latestSleepHours,
        todayWaterConsumption: Number(todayWaterConsumption),
      }),
    ),
    xp: mapXp(getObject(getField(payload, 'xp')) ?? gamification),
    metrics: mapMetrics(getObject(getField(payload, 'metrics')), {
      weeklyVolumeMoved,
      todayWaterConsumption: Number(todayWaterConsumption),
      dailyWaterGoal,
      latestSleepHours: Number(latestSleepHours),
      dailySleepGoal,
      currentWeight,
      weightDifference,
    }),
  };
}

function mapNextWorkout(value?: ApiRecord): DashboardData['nextWorkout'] {
  const exerciseCount = getNumber(value, ['exerciseCount', 'exercise_count']) ?? 0;

  if (!value) {
    return {
      title: 'Nenhum treino em andamento',
      detail: 'Crie ou inicie um treino para continuar.',
      estimate: '0 min',
    };
  }

  return {
    title: getString(value, ['title', 'name']) ?? 'Treino em andamento',
    detail:
      getString(value, ['detail', 'description']) ??
      getWorkoutDateDetail(getString(value, ['workoutDate', 'workout_date'])) ??
      `${exerciseCount} exercícios`,
    estimate:
      getString(value, ['estimate', 'estimatedDuration', 'estimated_duration']) ??
      formatDuration(exerciseCount * minutesPerExercise),
  };
}

function mapAchievement(value?: ApiRecord): DashboardData['achievement'] {
  return {
    title: getString(value, ['title']) ?? achievementFallback.title,
    detail: getString(value, ['detail', 'description']) ?? achievementFallback.detail,
    status: getString(value, ['status']) ?? achievementFallback.status,
  };
}

function mapXp(value?: ApiRecord): DashboardData['xp'] {
  return {
    level: getNumber(value, ['level']) ?? 0,
    current: getNumber(value, ['current', 'currentXp', 'current_xp']) ?? 0,
    next:
      getNumber(value, ['next', 'nextLevelXp', 'next_level_xp', 'xpToNextLevel', 'xp_to_next_level']) ??
      0,
  };
}

function mapMetrics(
  value: ApiRecord | undefined,
  apiMetrics: {
    readonly weeklyVolumeMoved: number;
    readonly todayWaterConsumption: number;
    readonly dailyWaterGoal: number;
    readonly latestSleepHours: number;
    readonly dailySleepGoal: number;
    readonly currentWeight?: number;
    readonly weightDifference?: number;
  },
): DashboardData['metrics'] {
  return {
    volume: mapMetric(getObject(getField(value, 'volume')), {
      value: formatCompactNumber(apiMetrics.weeklyVolumeMoved),
      unit: 'kg',
      secondaryText: 'Volume da semana',
    }),
    water: mapMetric(getObject(getField(value, 'water')), {
      value: apiMetrics.todayWaterConsumption,
      unit: 'L',
      secondaryText: `Meta diária: ${apiMetrics.dailyWaterGoal} L`,
      progress: { current: apiMetrics.todayWaterConsumption, target: apiMetrics.dailyWaterGoal },
    }),
    sleep: mapMetric(getObject(getField(value, 'sleep')), {
      value: apiMetrics.latestSleepHours,
      unit: 'h',
      secondaryText: 'Última noite',
      progress: { current: apiMetrics.latestSleepHours, target: apiMetrics.dailySleepGoal },
    }),
    weight: mapMetric(getObject(getField(value, 'weight')), {
      value: apiMetrics.currentWeight ?? 0,
      unit: 'kg',
      secondaryText:
        apiMetrics.weightDifference === undefined
          ? 'Sem registro de peso'
          : formatWeightDifference(apiMetrics.weightDifference),
    }),
  };
}

function mapMetric(value: ApiRecord | undefined, fallback: DashboardMetric): DashboardMetric {
  return {
    value: getStringOrNumber(value, ['value']) ?? fallback.value,
    unit: getString(value, ['unit']) ?? fallback.unit,
    secondaryText: getString(value, ['secondaryText', 'secondary_text']) ?? fallback.secondaryText,
    progress: mapProgress(getObject(getField(value, 'progress'))) ?? fallback.progress,
  };
}

function mapWeeklyProgress(
  value: unknown,
  apiProgress: {
    readonly completedWorkouts: number;
    readonly workoutGoal: number;
    readonly todayWaterConsumption: number;
    readonly dailyWaterGoal: number;
    readonly latestSleepHours: number;
    readonly dailySleepGoal: number;
  },
): DashboardData['weeklyProgress'] {
  if (!Array.isArray(value)) {
    return [
      { label: 'Treinos', current: apiProgress.completedWorkouts, target: apiProgress.workoutGoal },
      { label: 'Água', current: apiProgress.todayWaterConsumption, target: apiProgress.dailyWaterGoal },
      { label: 'Sono', current: apiProgress.latestSleepHours, target: apiProgress.dailySleepGoal },
    ];
  }

  return value.map((item, index) => {
    const object = asObject(item);
    const fallback = defaultProgress[index] ?? defaultProgress[0];

    return {
      label: getString(object, ['label', 'title']) ?? fallback.label,
      current: getNumber(object, ['current']) ?? fallback.current,
      target: getNumber(object, ['target']) ?? fallback.target,
    };
  });
}

const defaultProgress = [
  { label: 'Treinos', current: 0, target: 0 },
  { label: 'Água', current: 0, target: 0 },
  { label: 'Sono', current: 0, target: 0 },
] as const;

function mapList(value: unknown, fallback: readonly DashboardListItem[]): readonly DashboardListItem[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  return value.map((item, index) => {
    const object = asObject(item);
    const fallbackItem = fallback[index] ?? fallback[0];

    return {
      title: getString(object, ['title']) ?? fallbackItem.title,
      detail: getString(object, ['detail', 'description']) ?? fallbackItem.detail,
    };
  });
}

function mapProgress(value?: ApiRecord): DashboardProgress | undefined {
  const current = getNumber(value, ['current']);
  const target = getNumber(value, ['target']);

  if (current === undefined || target === undefined) {
    return undefined;
  }

  return { current, target };
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

function getStringOrNumber(
  object: ApiRecord | undefined,
  keys: readonly string[],
): string | number | undefined {
  const value = getField(object, ...keys);
  return typeof value === 'string' || typeof value === 'number' ? value : undefined;
}

function getObject(value: unknown): ApiRecord | undefined {
  return asObject(value);
}

function asObject(value: unknown): ApiRecord | undefined {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as ApiRecord) : undefined;
}

function getWorkoutDateDetail(date?: string): string | undefined {
  if (!date) {
    return undefined;
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return undefined;
  }

  return `Iniciado em ${new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(parsedDate)}`;
}

function getGuardianStatus(
  activeWorkout: ApiRecord | undefined,
  completedWorkouts: number,
  workoutGoal: number,
): string {
  const activeWorkoutName = getString(activeWorkout, ['name', 'title']);

  if (activeWorkoutName) {
    return `${activeWorkoutName} em andamento`;
  }

  if (workoutGoal > 0 && completedWorkouts >= workoutGoal) {
    return 'Meta semanal concluída';
  }

  return 'Pronto para o próximo treino';
}

function buildRecentActivity({
  activeWorkout,
  currentWeight,
  latestSleepHours,
  todayWaterConsumption,
}: {
  readonly activeWorkout?: ApiRecord;
  readonly currentWeight?: number;
  readonly latestSleepHours: number;
  readonly todayWaterConsumption: number;
}): readonly DashboardListItem[] {
  const activities: DashboardListItem[] = [];
  const activeWorkoutName = getString(activeWorkout, ['name', 'title']);
  const activeWorkoutExerciseCount = getNumber(activeWorkout, ['exerciseCount', 'exercise_count']) ?? 0;

  if (activeWorkoutName) {
    activities.push({
      title: activeWorkoutName,
      detail: `${activeWorkoutExerciseCount} exercícios em andamento`,
    });
  }

  activities.push({
    title: 'Água',
    detail: `${formatDecimal(todayWaterConsumption)} L consumidos hoje`,
  });

  if (latestSleepHours > 0) {
    activities.push({
      title: 'Sono',
      detail: `${formatDecimal(latestSleepHours)} h na última noite`,
    });
  }

  if (currentWeight !== undefined) {
    activities.push({
      title: 'Peso',
      detail: `${formatDecimal(currentWeight)} kg no registro atual`,
    });
  }

  return activities;
}

function formatTodayLabel(): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    weekday: 'long',
  }).format(new Date());
}

function formatCompactNumber(value: number): string | number {
  if (value >= 1000) {
    return `${Number((value / 1000).toFixed(1))}k`;
  }

  return value;
}

function formatDuration(minutes: number): string {
  return `${Math.max(minutes, 0)} min`;
}

function formatDecimal(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 1,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
  }).format(value);
}

function formatWeightDifference(value: number): string {
  const roundedValue = Math.round(value * 10) / 10;

  if (roundedValue === 0) {
    return 'Sem variação desde o início';
  }

  const formattedValue = new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 1,
    minimumFractionDigits: Number.isInteger(roundedValue) ? 0 : 1,
  }).format(Math.abs(roundedValue));
  const direction = roundedValue > 0 ? 'acima' : 'abaixo';

  return `${formattedValue} kg ${direction} do início`;
}
