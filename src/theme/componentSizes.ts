export type ButtonHeights = {
  readonly sm: 36;
  readonly md: 44;
  readonly lg: 52;
  readonly xl: 56;
};

export type TouchTargets = {
  readonly android: 48;
  readonly ios: 44;
  readonly global: 48;
};

export type ComponentSizes = {
  readonly buttonHeight: ButtonHeights;
  readonly touchTarget: TouchTargets;
  readonly fab: {
    readonly size: 56;
  };
  readonly progressBar: {
    readonly height: 8;
  };
  readonly badge: {
    readonly minHeight: 24;
  };
  readonly chip: {
    readonly height: 32;
  };
  readonly avatar: {
    readonly sm: 32;
    readonly md: 40;
    readonly lg: 56;
    readonly xl: 72;
  };
  readonly bottomNavigation: {
    readonly height: 64;
  };
};

export const componentSizes: ComponentSizes = {
  buttonHeight: {
    sm: 36,
    md: 44,
    lg: 52,
    xl: 56,
  },
  touchTarget: {
    android: 48,
    ios: 44,
    global: 48,
  },
  fab: {
    size: 56,
  },
  progressBar: {
    height: 8,
  },
  badge: {
    minHeight: 24,
  },
  chip: {
    height: 32,
  },
  avatar: {
    sm: 32,
    md: 40,
    lg: 56,
    xl: 72,
  },
  bottomNavigation: {
    height: 64,
  },
} as const;
