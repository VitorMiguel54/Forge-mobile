import { apiClient } from '@/api/apiClient';

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

const dashboardEndpoint = process.env.EXPO_PUBLIC_DASHBOARD_ENDPOINT ?? '/mobile/dashboard';

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
  const response = await apiClient.get<unknown>(dashboardEndpoint);
  return mapDashboardResponse(response);
}

function mapDashboardResponse(response: unknown): DashboardData {
  const payload = getObject(getField(asObject(response), 'data')) ?? asObject(response) ?? {};

  return {
    userName: getString(payload, ['userName', 'user_name', 'name']) ?? dashboardFallback.userName,
    dayLabel: getString(payload, ['dayLabel', 'day_label']) ?? dashboardFallback.dayLabel,
    guardianName: getString(payload, ['guardianName', 'guardian_name']) ?? dashboardFallback.guardianName,
    guardianStatus:
      getString(payload, ['guardianStatus', 'guardian_status']) ?? dashboardFallback.guardianStatus,
    weeklyGoal: getString(payload, ['weeklyGoal', 'weekly_goal']) ?? dashboardFallback.weeklyGoal,
    nextWorkout: mapNextWorkout(getObject(getField(payload, 'nextWorkout', 'next_workout'))),
    quickActions: mapList(getField(payload, 'quickActions', 'quick_actions'), dashboardFallback.quickActions),
    weeklyProgress: mapWeeklyProgress(getField(payload, 'weeklyProgress', 'weekly_progress')),
    achievement: mapAchievement(getObject(getField(payload, 'achievement'))),
    recentActivity: mapList(
      getField(payload, 'recentActivity', 'recent_activity'),
      dashboardFallback.recentActivity,
    ),
    xp: mapXp(getObject(getField(payload, 'xp'))),
    metrics: mapMetrics(getObject(getField(payload, 'metrics'))),
  };
}

function mapNextWorkout(value?: ApiRecord): DashboardData['nextWorkout'] {
  return {
    title: getString(value, ['title']) ?? dashboardFallback.nextWorkout.title,
    detail: getString(value, ['detail', 'description']) ?? dashboardFallback.nextWorkout.detail,
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
    next: getNumber(value, ['next', 'nextLevelXp', 'next_level_xp']) ?? dashboardFallback.xp.next,
  };
}

function mapMetrics(value?: ApiRecord): DashboardData['metrics'] {
  return {
    volume: mapMetric(getObject(getField(value, 'volume')), dashboardFallback.metrics.volume),
    water: mapMetric(getObject(getField(value, 'water')), dashboardFallback.metrics.water),
    sleep: mapMetric(getObject(getField(value, 'sleep')), dashboardFallback.metrics.sleep),
    weight: mapMetric(getObject(getField(value, 'weight')), dashboardFallback.metrics.weight),
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

function mapWeeklyProgress(value: unknown): DashboardData['weeklyProgress'] {
  if (!Array.isArray(value)) {
    return dashboardFallback.weeklyProgress;
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
