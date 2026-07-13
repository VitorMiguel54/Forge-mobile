import { useCallback, useEffect, useState } from 'react';

import { ApiError } from '@/api/apiClient';
import { getDashboard, type DashboardData } from '@/services/dashboardService';

export type UseDashboardResult = {
  readonly dashboard?: DashboardData;
  readonly isLoading: boolean;
  readonly error?: string;
  readonly refetch: () => Promise<void>;
};

export function useDashboard(): UseDashboardResult {
  const [dashboard, setDashboard] = useState<DashboardData>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  const loadDashboard = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
      setError(undefined);
    }

    try {
      setDashboard(await getDashboard());
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadInitialDashboard() {
      try {
        const nextDashboard = await getDashboard();

        if (!isActive) {
          return;
        }

        setDashboard(nextDashboard);
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

    void loadInitialDashboard();

    return () => {
      isActive = false;
    };
  }, []);

  return {
    dashboard,
    isLoading,
    error,
    refetch: () => loadDashboard(true),
  };
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.status ? `${error.message} Código ${error.status}.` : error.message;
  }

  return 'Não foi possível carregar a Home.';
}
