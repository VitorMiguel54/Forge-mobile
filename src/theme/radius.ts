export type Radius = {
  readonly sm: 6;
  readonly md: 10;
  readonly lg: 14;
  readonly xl: 20;
  readonly circular: 999;
};

export const radius: Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  circular: 999,
} as const;
