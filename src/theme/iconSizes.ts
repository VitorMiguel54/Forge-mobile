export type IconSizes = {
  readonly xs: 14;
  readonly sm: 18;
  readonly md: 22;
  readonly lg: 28;
  readonly xl: 40;
};

export type IconStrokes = {
  readonly subtle: 1.75;
  readonly default: 2;
  readonly emphasis: 2.25;
};

export const iconSizes: IconSizes = {
  xs: 14,
  sm: 18,
  md: 22,
  lg: 28,
  xl: 40,
} as const;

export const iconStrokes: IconStrokes = {
  subtle: 1.75,
  default: 2,
  emphasis: 2.25,
} as const;
