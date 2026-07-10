export type FontFamilyToken = string;
export type FontWeightToken = 400 | 500 | 600 | 700 | 800;

export type TypographyStyle = {
  readonly fontFamily: FontFamilyToken;
  readonly fontWeight: FontWeightToken;
  readonly fontSize: number;
  readonly lineHeight: number;
};

export type Typography = {
  readonly fontFamily: {
    readonly primary: FontFamilyToken;
    readonly display: FontFamilyToken;
    readonly fallback: FontFamilyToken;
  };
  readonly fontWeight: {
    readonly regular: FontWeightToken;
    readonly medium: FontWeightToken;
    readonly semibold: FontWeightToken;
    readonly bold: FontWeightToken;
    readonly extrabold: FontWeightToken;
  };
  readonly title: {
    readonly main: TypographyStyle;
    readonly section: TypographyStyle;
    readonly card: TypographyStyle;
  };
  readonly body: {
    readonly default: TypographyStyle;
    readonly secondary: TypographyStyle;
  };
  readonly caption: TypographyStyle;
  readonly button: TypographyStyle;
  readonly number: {
    readonly highlight: TypographyStyle;
    readonly compact: TypographyStyle;
  };
  readonly gamification: {
    readonly level: TypographyStyle;
    readonly xp: TypographyStyle;
  };
};

const fontFamily = {
  primary: 'Inter',
  display: 'Sora',
  fallback: 'system-ui',
} as const;

export const typography: Typography = {
  fontFamily,
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  title: {
    main: {
      fontFamily: fontFamily.display,
      fontWeight: 700,
      fontSize: 28,
      lineHeight: 34,
    },
    section: {
      fontFamily: fontFamily.primary,
      fontWeight: 700,
      fontSize: 20,
      lineHeight: 26,
    },
    card: {
      fontFamily: fontFamily.primary,
      fontWeight: 600,
      fontSize: 16,
      lineHeight: 22,
    },
  },
  body: {
    default: {
      fontFamily: fontFamily.primary,
      fontWeight: 400,
      fontSize: 15,
      lineHeight: 22,
    },
    secondary: {
      fontFamily: fontFamily.primary,
      fontWeight: 400,
      fontSize: 13,
      lineHeight: 19,
    },
  },
  caption: {
    fontFamily: fontFamily.primary,
    fontWeight: 500,
    fontSize: 12,
    lineHeight: 16,
  },
  button: {
    fontFamily: fontFamily.primary,
    fontWeight: 700,
    fontSize: 15,
    lineHeight: 20,
  },
  number: {
    highlight: {
      fontFamily: fontFamily.display,
      fontWeight: 800,
      fontSize: 32,
      lineHeight: 38,
    },
    compact: {
      fontFamily: fontFamily.display,
      fontWeight: 700,
      fontSize: 22,
      lineHeight: 28,
    },
  },
  gamification: {
    level: {
      fontFamily: fontFamily.display,
      fontWeight: 800,
      fontSize: 18,
      lineHeight: 24,
    },
    xp: {
      fontFamily: fontFamily.display,
      fontWeight: 700,
      fontSize: 14,
      lineHeight: 20,
    },
  },
} as const;
