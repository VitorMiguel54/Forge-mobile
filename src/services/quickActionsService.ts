import { ApiError, apiClient } from '@/api/apiClient';

export type QuickActionKind = 'weight' | 'water' | 'sleep';

export type QuickActionInput = {
  readonly kind: QuickActionKind;
  readonly value: number;
};

export async function registerQuickAction(input: QuickActionInput): Promise<void> {
  const userProfileId = getUserProfileId();
  const now = new Date().toISOString();

  if (input.kind === 'weight') {
    await apiClient.post<unknown>(`/user-profiles/${userProfileId}/weight-records`, {
      weight: input.value,
      recordDate: now,
    });
    return;
  }

  if (input.kind === 'water') {
    await apiClient.post<unknown>(`/user-profiles/${userProfileId}/water-intakes`, {
      liters: input.value,
      intakeDate: now,
    });
    return;
  }

  await apiClient.post<unknown>(`/user-profiles/${userProfileId}/sleep-records`, {
    hoursSlept: input.value,
    sleepDate: now,
  });
}

function getUserProfileId(): string {
  const userProfileId = process.env.EXPO_PUBLIC_USER_PROFILE_ID;

  if (!userProfileId) {
    throw new ApiError('Configure EXPO_PUBLIC_USER_PROFILE_ID para registrar ações rápidas.');
  }

  return userProfileId;
}
