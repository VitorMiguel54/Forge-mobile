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

// TODO: Remover os fallbacks campo a campo quando o endpoint mobile entregar todo o contrato da Home.
const dashboardFallback: DashboardData = {
  userName: 'Rafael',
  dayLabel: 'Hoje',
  guardianName: 'Guardiao da Forja',
  guardianStatus: 'Pronto para o proximo treino',
  weeklyGoal: '3 de 5 treinos na semana',
  nextWorkout: {
    title: 'Treino de forca',
    detail: 'Peito, ombro e triceps',
    estimate: '45 min',
  },
  quickActions: [
    { title: 'Agua', detail: 'Registrar 300 ml' },
    { title: 'Peso', detail: 'Atualizar medida' },
    { title: 'Sono', detail: 'Registrar noite' },
  ],
  weeklyProgress: [
    { label: 'Treinos', current: 3, target: 5 },
    { label: 'Agua', current: 5, target: 7 },
    { label: 'Sono', current: 4, target: 7 },
  ],
  achievement: {
    title: 'Consistencia de Aco',
    detail: '3 treinos concluidos nesta semana',
    status: 'Em progresso',
  },
  recentActivity: [
    { title: 'Supino reto', detail: '4 series registradas' },
    { title: 'Agua', detail: '1.8 L consumidos hoje' },
    { title: 'Sono', detail: '7.2 h na ultima noite' },
  ],
  xp: {
    level: 7,
    current: 320,
    next: 500,
  },
  metrics: {
    volume: {
      value: '12.8k',
      unit: 'kg',
      secondaryText: 'Volume da semana',
    },
    water: {
      value: 1.8,
      unit: 'L',
      secondaryText: 'Meta diaria: 2.5 L',
      progress: { current: 1.8, target: 2.5 },
    },
    sleep: {
      value: 7.2,
      unit: 'h',
      secondaryText: 'Ultima noite',
      progress: { current: 7.2, target: 8 },
    },
    weight: {
      value: 82.4,
      unit: 'kg',
      secondaryText: '-1.6 kg desde o inicio',
    },
  },
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
    getNumber(weeklyProgress, ['completedWorkouts', 'completed_workouts']) ??
    dashboardFallback.weeklyProgress[0].current;
  const weeklyWorkoutGoal =
    getNumber(weeklyProgress, ['workoutGoal', 'workout_goal']) ??
    dashboardFallback.weeklyProgress[0].target;
  const todayWaterConsumption =
    getNumber(water, ['todayConsumption', 'today_consumption']) ?? dashboardFallback.metrics.water.value;
  const dailyWaterGoal = getNumber(water, ['dailyGoal', 'daily_goal']) ?? 2.5;
  const latestSleepHours =
    getNumber(sleep, ['latestHours', 'latest_hours']) ?? dashboardFallback.metrics.sleep.value;
  const dailySleepGoal = getNumber(sleep, ['dailyGoal', 'daily_goal']) ?? 8;
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
      dashboardFallback.userName,
    dayLabel: getString(payload, ['dayLabel', 'day_label']) ?? dashboardFallback.dayLabel,
    guardianName: getString(payload, ['guardianName', 'guardian_name']) ?? dashboardFallback.guardianName,
    guardianStatus:
      getString(payload, ['guardianStatus', 'guardian_status']) ?? dashboardFallback.guardianStatus,
    weeklyGoal:
      getString(payload, ['weeklyGoal', 'weekly_goal']) ??
      `${weeklyCompletedWorkouts} de ${weeklyWorkoutGoal} treinos na semana`,
    nextWorkout: mapNextWorkout(
      getObject(getField(payload, 'nextWorkout', 'next_workout')) ?? activeWorkout,
    ),
    quickActions: mapList(getField(payload, 'quickActions', 'quick_actions'), dashboardFallback.quickActions),
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
      dashboardFallback.recentActivity,
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
  return {
    title: getString(value, ['title']) ?? dashboardFallback.nextWorkout.title,
    detail:
      getString(value, ['detail', 'description']) ??
      getWorkoutDateDetail(getString(value, ['workoutDate', 'workout_date'])) ??
      dashboardFallback.nextWorkout.detail,
    estimate:
      getString(value, ['estimate', 'estimatedDuration', 'estimated_duration']) ??
      dashboardFallback.nextWorkout.estimate,
  };
}

function mapAchievement(value?: ApiRecord): DashboardData['achievement'] {
  return {
    title: getString(value, ['title']) ?? dashboardFallback.achievement.title,
    detail: getString(value, ['detail', 'description']) ?? dashboardFallback.achievement.detail,
    status: getString(value, ['status']) ?? dashboardFallback.achievement.status,
  };
}

function mapXp(value?: ApiRecord): DashboardData['xp'] {
  return {
    level: getNumber(value, ['level']) ?? dashboardFallback.xp.level,
    current: getNumber(value, ['current', 'currentXp', 'current_xp']) ?? dashboardFallback.xp.current,
    next:
      getNumber(value, ['next', 'nextLevelXp', 'next_level_xp', 'xpToNextLevel', 'xp_to_next_level']) ??
      dashboardFallback.xp.next,
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
      secondaryText: `Meta diaria: ${apiMetrics.dailyWaterGoal} L`,
      progress: { current: apiMetrics.todayWaterConsumption, target: apiMetrics.dailyWaterGoal },
    }),
    sleep: mapMetric(getObject(getField(value, 'sleep')), {
      value: apiMetrics.latestSleepHours,
      unit: 'h',
      secondaryText: 'Ultima noite',
      progress: { current: apiMetrics.latestSleepHours, target: apiMetrics.dailySleepGoal },
    }),
    weight: mapMetric(getObject(getField(value, 'weight')), {
      value: apiMetrics.currentWeight ?? dashboardFallback.metrics.weight.value,
      unit: 'kg',
      secondaryText:
        apiMetrics.weightDifference === undefined
          ? dashboardFallback.metrics.weight.secondaryText
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
      { label: 'Agua', current: apiProgress.todayWaterConsumption, target: apiProgress.dailyWaterGoal },
      { label: 'Sono', current: apiProgress.latestSleepHours, target: apiProgress.dailySleepGoal },
    ];
  }

  return value.map((item, index) => {
    const object = asObject(item);
    const fallback = dashboardFallback.weeklyProgress[index] ?? dashboardFallback.weeklyProgress[0];

    return {
      label: getString(object, ['label', 'title']) ?? fallback.label,
      current: getNumber(object, ['current']) ?? fallback.current,
      target: getNumber(object, ['target']) ?? fallback.target,
    };
  });
}

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

function formatCompactNumber(value: number): string | number {
  if (value >= 1000) {
    return `${Number((value / 1000).toFixed(1))}k`;
  }

  return value;
}

function formatWeightDifference(value: number): string {
  if (value === 0) {
    return 'Sem variacao desde o inicio';
  }

  return `${value > 0 ? '+' : ''}${value} kg desde o inicio`;
}
