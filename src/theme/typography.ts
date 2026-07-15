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
    readonly identity: {
      readonly semibold: FontFamilyToken;
      readonly bold: FontFamilyToken;
      readonly extrabold: FontFamilyToken;
    };
    readonly interface: {
      readonly regular: FontFamilyToken;
      readonly medium: FontFamilyToken;
      readonly semibold: FontFamilyToken;
      readonly bold: FontFamilyToken;
      readonly extrabold: FontFamilyToken;
    };
    readonly fallback: FontFamilyToken;
  };
  readonly fontWeight: {
    readonly regular: FontWeightToken;
    readonly medium: FontWeightToken;
    readonly semibold: FontWeightToken;
    readonly bold: FontWeightToken;
    readonly extrabold: FontWeightToken;
  };
  readonly display: TypographyStyle;
  readonly screenTitle: TypographyStyle;
  readonly sectionTitle: TypographyStyle;
  readonly cardTitle: TypographyStyle;
  readonly title: {
    readonly main: TypographyStyle;
    readonly section: TypographyStyle;
    readonly card: TypographyStyle;
  };
  readonly identity: {
    readonly logo: TypographyStyle;
    readonly section: TypographyStyle;
    readonly guardian: TypographyStyle;
  };
  readonly body: {
    readonly default: TypographyStyle;
    readonly secondary: TypographyStyle;
  };
  readonly label: TypographyStyle;
  readonly caption: TypographyStyle;
  readonly button: TypographyStyle;
  readonly navigation: TypographyStyle;
  readonly metric: {
    readonly highlight: TypographyStyle;
    readonly compact: TypographyStyle;
  };
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
  identity: {
    semibold: 'Cinzel_600SemiBold',
    bold: 'Cinzel_700Bold',
    extrabold: 'Cinzel_800ExtraBold',
  },
  interface: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
    extrabold: 'Inter_800ExtraBold',
  },
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
  display: {
    fontFamily: fontFamily.identity.bold,
    fontWeight: 700,
    fontSize: 28,
    lineHeight: 34,
  },
  screenTitle: {
    fontFamily: fontFamily.interface.bold,
    fontWeight: 700,
    fontSize: 28,
    lineHeight: 34,
  },
  sectionTitle: {
    fontFamily: fontFamily.identity.semibold,
    fontWeight: 600,
    fontSize: 16,
    lineHeight: 22,
  },
  cardTitle: {
    fontFamily: fontFamily.interface.semibold,
    fontWeight: 600,
    fontSize: 16,
    lineHeight: 22,
  },
  title: {
    main: {
      fontFamily: fontFamily.interface.bold,
      fontWeight: 700,
      fontSize: 28,
      lineHeight: 34,
    },
    section: {
      fontFamily: fontFamily.interface.bold,
      fontWeight: 700,
      fontSize: 20,
      lineHeight: 26,
    },
    card: {
      fontFamily: fontFamily.interface.semibold,
      fontWeight: 600,
      fontSize: 16,
      lineHeight: 22,
    },
  },
  identity: {
    logo: {
      fontFamily: fontFamily.identity.bold,
      fontWeight: 700,
      fontSize: 20,
      lineHeight: 26,
    },
    section: {
      fontFamily: fontFamily.identity.semibold,
      fontWeight: 600,
      fontSize: 16,
      lineHeight: 22,
    },
    guardian: {
      fontFamily: fontFamily.identity.bold,
      fontWeight: 700,
      fontSize: 28,
      lineHeight: 34,
    },
  },
  body: {
    default: {
      fontFamily: fontFamily.interface.regular,
      fontWeight: 400,
      fontSize: 15,
      lineHeight: 22,
    },
    secondary: {
      fontFamily: fontFamily.interface.regular,
      fontWeight: 400,
      fontSize: 13,
      lineHeight: 19,
    },
  },
  label: {
    fontFamily: fontFamily.interface.medium,
    fontWeight: 500,
    fontSize: 12,
    lineHeight: 16,
  },
  caption: {
    fontFamily: fontFamily.interface.medium,
    fontWeight: 500,
    fontSize: 12,
    lineHeight: 16,
  },
  button: {
    fontFamily: fontFamily.interface.bold,
    fontWeight: 700,
    fontSize: 15,
    lineHeight: 20,
  },
  navigation: {
    fontFamily: fontFamily.interface.medium,
    fontWeight: 500,
    fontSize: 12,
    lineHeight: 16,
  },
  metric: {
    highlight: {
      fontFamily: fontFamily.interface.extrabold,
      fontWeight: 800,
      fontSize: 32,
      lineHeight: 38,
    },
    compact: {
      fontFamily: fontFamily.interface.bold,
      fontWeight: 700,
      fontSize: 22,
      lineHeight: 28,
    },
  },
  number: {
    highlight: {
      fontFamily: fontFamily.interface.extrabold,
      fontWeight: 800,
      fontSize: 32,
      lineHeight: 38,
    },
    compact: {
      fontFamily: fontFamily.interface.bold,
      fontWeight: 700,
      fontSize: 22,
      lineHeight: 28,
    },
  },
  gamification: {
    level: {
      fontFamily: fontFamily.identity.extrabold,
      fontWeight: 800,
      fontSize: 18,
      lineHeight: 24,
    },
    xp: {
      fontFamily: fontFamily.interface.bold,
      fontWeight: 700,
      fontSize: 14,
      lineHeight: 20,
    },
  },
} as const;
