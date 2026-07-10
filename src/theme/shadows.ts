export type ShadowToken = string;

export type Shadows = {
  readonly none: ShadowToken;
  readonly card: ShadowToken;
  readonly cardFeatured: ShadowToken;
  readonly modal: ShadowToken;
  readonly bottomSheet: ShadowToken;
  readonly fab: ShadowToken;
};

export const shadows: Shadows = {
  none: 'none',
  card: '0 8 20 rgba(0, 0, 0, 0.22)',
  cardFeatured: '0 12 28 rgba(0, 0, 0, 0.30)',
  modal: '0 18 44 rgba(0, 0, 0, 0.42)',
  bottomSheet: '0 -12 32 rgba(0, 0, 0, 0.36)',
  fab: '0 12 30 rgba(0, 0, 0, 0.34)',
} as const;
