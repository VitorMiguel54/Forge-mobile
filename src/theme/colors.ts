export type ColorToken = string;

export type ThemeColors = {
  readonly background: {
    readonly primary: ColorToken;
    readonly secondary: ColorToken;
  };
  readonly surface: {
    readonly default: ColorToken;
    readonly card: ColorToken;
    readonly cardElevated: ColorToken;
  };
  readonly border: {
    readonly default: ColorToken;
    readonly disabled: ColorToken;
  };
  readonly text: {
    readonly primary: ColorToken;
    readonly secondary: ColorToken;
    readonly disabled: ColorToken;
  };
  readonly brand: {
    readonly primary: ColorToken;
    readonly secondary: ColorToken;
  };
  readonly forge: {
    readonly hotOrange: ColorToken;
  };
  readonly gamification: {
    readonly xp: ColorToken;
    readonly level: ColorToken;
    readonly achievement: ColorToken;
  };
  readonly semantic: {
    readonly success: ColorToken;
    readonly warning: ColorToken;
    readonly error: ColorToken;
  };
  readonly metric: {
    readonly water: ColorToken;
    readonly sleep: ColorToken;
    readonly weight: ColorToken;
    readonly volume: ColorToken;
  };
  readonly material: {
    readonly bronze: ColorToken;
    readonly steel: ColorToken;
  };
  readonly skeleton: {
    readonly base: ColorToken;
    readonly highlight: ColorToken;
  };
};

export const colors: ThemeColors = {
  background: {
    primary: '#080A0D',
    secondary: '#0E1217',
  },
  surface: {
    default: '#141A21',
    card: '#181F28',
    cardElevated: '#202936',
  },
  border: {
    default: '#2B3542',
    disabled: '#343B45',
  },
  text: {
    primary: '#F4F7FA',
    secondary: '#A7B0BC',
    disabled: '#5D6672',
  },
  brand: {
    primary: '#D66A1F',
    secondary: '#7E8794',
  },
  forge: {
    hotOrange: '#F27A1A',
  },
  gamification: {
    xp: '#3B82F6',
    level: '#D6A84F',
    achievement: '#C99A3D',
  },
  semantic: {
    success: '#2EAD6B',
    warning: '#D99A2B',
    error: '#E05252',
  },
  metric: {
    water: '#38A8C7',
    sleep: '#7C6FE8',
    weight: '#9BA3AD',
    volume: '#C67A3A',
  },
  material: {
    bronze: '#9C6A3C',
    steel: '#8F9BA8',
  },
  skeleton: {
    base: '#1D2631',
    highlight: '#273241',
  },
} as const;
