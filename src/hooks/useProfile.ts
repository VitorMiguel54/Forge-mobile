import { useCallback, useEffect, useState } from 'react';

import { ApiError } from '@/api/apiClient';
import { getProfile, type ProfileData } from '@/services/profileService';

export type UseProfileResult = {
  readonly profile?: ProfileData;
  readonly isLoading: boolean;
  readonly error?: string;
  readonly refetch: () => Promise<void>;
};

export function useProfile(): UseProfileResult {
  const [profile, setProfile] = useState<ProfileData>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(undefined);

    try {
      setProfile(await getProfile());
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadInitialProfile() {
      try {
        const nextProfile = await getProfile();

        if (!isActive) {
          return;
        }

        setProfile(nextProfile);
        setError(undefined);
      } catch (requestError) {
        if (isActive) {
          setError(getErrorMessage(requestError));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadInitialProfile();

    return () => {
      isActive = false;
    };
  }, []);

  return {
    profile,
    isLoading,
    error,
    refetch,
  };
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.status ? `${error.message} Código ${error.status}.` : error.message;
  }

  return 'Não foi possível carregar o Perfil.';
}
