import { colors } from './colors';

export type BorderWidths = {
  readonly hairline: 0.5;
  readonly default: 1;
  readonly active: 1.5;
  readonly strong: 2;
};

export type BorderColors = {
  readonly default: string;
  readonly active: string;
  readonly disabled: string;
  readonly error: string;
  readonly success: string;
};

export type Borders = {
  readonly width: BorderWidths;
  readonly color: BorderColors;
};

export const borders: Borders = {
  width: {
    hairline: 0.5,
    default: 1,
    active: 1.5,
    strong: 2,
  },
  color: {
    default: colors.border.default,
    active: colors.brand.primary,
    disabled: colors.border.disabled,
    error: colors.semantic.error,
    success: colors.semantic.success,
  },
} as const;
