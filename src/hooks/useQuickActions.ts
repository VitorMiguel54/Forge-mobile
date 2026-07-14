import { useCallback, useState } from 'react';

import { ApiError } from '@/api/apiClient';
import { registerQuickAction, type QuickActionKind } from '@/services/quickActionsService';

export type QuickActionConfig = {
  readonly kind: QuickActionKind;
  readonly title: string;
  readonly label: string;
  readonly unit: string;
  readonly placeholder: string;
};

export type UseQuickActionsResult = {
  readonly activeAction?: QuickActionConfig;
  readonly value: string;
  readonly isSubmitting: boolean;
  readonly error?: string;
  readonly successMessage?: string;
  readonly openAction: (kind: QuickActionKind) => void;
  readonly closeAction: () => void;
  readonly setValue: (value: string) => void;
  readonly submit: () => Promise<boolean>;
};

export function useQuickActions(onSuccess: () => Promise<void>): UseQuickActionsResult {
  const [activeAction, setActiveAction] = useState<QuickActionConfig>();
  const [value, setValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();

  const openAction = useCallback((kind: QuickActionKind) => {
    setActiveAction(actionConfigs[kind]);
    setValue('');
    setError(undefined);
    setSuccessMessage(undefined);
  }, []);

  const closeAction = useCallback(() => {
    setActiveAction(undefined);
    setValue('');
    setError(undefined);
  }, []);

  const submit = useCallback(async () => {
    if (!activeAction) {
      return false;
    }

    const numericValue = Number(value.replace(',', '.'));
    const validationError = validateValue(activeAction.kind, numericValue);

    if (validationError) {
      setError(validationError);
      return false;
    }

    setIsSubmitting(true);
    setError(undefined);
    setSuccessMessage(undefined);

    try {
      await registerQuickAction({ kind: activeAction.kind, value: numericValue });
      await onSuccess();
      setSuccessMessage(`${activeAction.title} registrado.`);
      setActiveAction(undefined);
      setValue('');
      return true;
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [activeAction, onSuccess, value]);

  return {
    activeAction,
    value,
    isSubmitting,
    error,
    successMessage,
    openAction,
    closeAction,
    setValue,
    submit,
  };
}

function validateValue(kind: QuickActionKind, value: number): string | undefined {
  if (!Number.isFinite(value) || value <= 0) {
    return 'Informe um valor maior que zero.';
  }

  if (kind === 'water' && value > 20) {
    return 'Informe o consumo de água em litros.';
  }

  if (kind === 'sleep' && value > 24) {
    return 'Sono não pode passar de 24 horas.';
  }

  if (kind === 'weight' && value > 500) {
    return 'Informe o peso em kg.';
  }

  return undefined;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.status ? `${error.message} Código ${error.status}.` : error.message;
  }

  return 'Não foi possível registrar a ação.';
}

const actionConfigs: Record<QuickActionKind, QuickActionConfig> = {
  weight: {
    kind: 'weight',
    title: 'Peso',
    label: 'Peso atual',
    unit: 'kg',
    placeholder: '82.4',
  },
  water: {
    kind: 'water',
    title: 'Água',
    label: 'Consumo',
    unit: 'L',
    placeholder: '0.3',
  },
  sleep: {
    kind: 'sleep',
    title: 'Sono',
    label: 'Horas de sono',
    unit: 'h',
    placeholder: '7.5',
  },
} as const;
