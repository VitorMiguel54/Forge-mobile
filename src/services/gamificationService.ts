import { ApiError, apiClient } from '@/api/apiClient';

export type XpTransaction = {
  readonly id: string;
  readonly userProfileId: string;
  readonly amount: number;
  readonly source: string;
  readonly description: string;
  readonly referenceId?: string;
  readonly createdAt: string;
};

export type XpSummary = {
  readonly userProfileId: string;
  readonly totalXp: number;
  readonly level: number;
  readonly xpToNextLevel: number;
  readonly transactions: readonly XpTransaction[];
};

export type AchievementCategory =
  | 'Workout'
  | 'Hydration'
  | 'Sleep'
  | 'Progression'
  | 'Consistency'
  | 'Secret'
  | string;

export type AchievementCatalogItem = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: AchievementCategory;
  readonly requiredValue: number;
  readonly isSecret: boolean;
  readonly xpReward: number;
};

export type UserAchievement = {
  readonly id: string;
  readonly userProfileId: string;
  readonly achievementId: string;
  readonly unlockedAt: string;
};

export type AchievementItem = AchievementCatalogItem & {
  readonly unlocked: boolean;
  readonly unlockedAt?: string;
};

export type GamificationData = {
  readonly xp: XpSummary;
  readonly achievements: readonly AchievementItem[];
  readonly unlockedAchievements: readonly AchievementItem[];
  readonly summary: {
    readonly unlocked: number;
    readonly available: number;
    readonly progressPercent: number;
  };
};

type ApiRecord = Record<string, unknown>;

export async function getXpSummary(): Promise<XpSummary> {
  const userProfileId = getUserProfileId('carregar XP');
  const response = await apiClient.get<unknown>(`/user-profiles/${userProfileId}/xp`);

  return mapXpSummary(response);
}

export async function getGamification(): Promise<GamificationData> {
  const userProfileId = getUserProfileId('carregar gamificação');
  const [xpResponse, catalogResponse, unlockedResponse] = await Promise.all([
    apiClient.get<unknown>(`/user-profiles/${userProfileId}/xp`),
    apiClient.get<unknown>('/achievements'),
    apiClient.get<unknown>(`/user-profiles/${userProfileId}/achievements`),
  ]);
  const xp = mapXpSummary(xpResponse);
  const catalog = mapAchievementCatalog(catalogResponse);
  const unlocked = mapUserAchievements(unlockedResponse);
  const unlockedByAchievementId = new Map(
    unlocked.map((achievement) => [achievement.achievementId, achievement]),
  );
  const achievements = catalog.map((achievement) => {
    const userAchievement = unlockedByAchievementId.get(achievement.id);

    return {
      ...achievement,
      unlocked: Boolean(userAchievement),
      unlockedAt: userAchievement?.unlockedAt,
    };
  });
  const unlockedAchievements = achievements.filter((achievement) => achievement.unlocked);
  const available = achievements.length;

  return {
    xp,
    achievements,
    unlockedAchievements,
    summary: {
      unlocked: unlockedAchievements.length,
      available,
      progressPercent: available > 0 ? Math.round((unlockedAchievements.length / available) * 100) : 0,
    },
  };
}

function getUserProfileId(action: string): string {
  const userProfileId = process.env.EXPO_PUBLIC_USER_PROFILE_ID;

  if (!userProfileId) {
    throw new ApiError(`Configure EXPO_PUBLIC_USER_PROFILE_ID para ${action}.`);
  }

  return userProfileId;
}

function mapXpSummary(response: unknown): XpSummary {
  const value = getObject(getField(asObject(response), 'data')) ?? asObject(response) ?? {};

  return {
    userProfileId: getString(value, ['userProfileId', 'user_profile_id']) ?? '',
    totalXp: getNumber(value, ['totalXp', 'total_xp']) ?? 0,
    level: getNumber(value, ['level']) ?? 0,
    xpToNextLevel: getNumber(value, ['xpToNextLevel', 'xp_to_next_level']) ?? 0,
    transactions: mapTransactions(getField(value, 'transactions')),
  };
}

function mapTransactions(value: unknown): readonly XpTransaction[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => {
    const transaction = asObject(item) ?? {};

    return {
      id: getString(transaction, ['id']) ?? '',
      userProfileId: getString(transaction, ['userProfileId', 'user_profile_id']) ?? '',
      amount: getNumber(transaction, ['amount']) ?? 0,
      source: getString(transaction, ['source']) ?? '',
      description: getString(transaction, ['description']) ?? '',
      referenceId: getString(transaction, ['referenceId', 'reference_id']),
      createdAt: getString(transaction, ['createdAt', 'created_at']) ?? '',
    };
  });
}

function mapAchievementCatalog(response: unknown): readonly AchievementCatalogItem[] {
  const value = getObject(getField(asObject(response), 'data')) ?? response;

  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => {
    const achievement = asObject(item) ?? {};

    return {
      id: getString(achievement, ['id']) ?? '',
      name: getString(achievement, ['name']) ?? '',
      description: getString(achievement, ['description']) ?? '',
      category: getString(achievement, ['category']) ?? 'Workout',
      requiredValue: getNumber(achievement, ['requiredValue', 'required_value']) ?? 0,
      isSecret: getBoolean(achievement, ['isSecret', 'is_secret']) ?? false,
      xpReward: getNumber(achievement, ['xpReward', 'xp_reward']) ?? 0,
    };
  });
}

function mapUserAchievements(response: unknown): readonly UserAchievement[] {
  const value = getObject(getField(asObject(response), 'data')) ?? response;

  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => {
    const achievement = asObject(item) ?? {};

    return {
      id: getString(achievement, ['id']) ?? '',
      userProfileId: getString(achievement, ['userProfileId', 'user_profile_id']) ?? '',
      achievementId: getString(achievement, ['achievementId', 'achievement_id']) ?? '',
      unlockedAt: getString(achievement, ['unlockedAt', 'unlocked_at']) ?? '',
    };
  });
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
