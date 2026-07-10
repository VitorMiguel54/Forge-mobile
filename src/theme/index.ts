import { borders } from './borders';
import { colors } from './colors';
import { componentSizes } from './componentSizes';
import { iconSizes, iconStrokes } from './iconSizes';
import { radius } from './radius';
import { shadows } from './shadows';
import { spacing } from './spacing';
import { typography } from './typography';

export { borders } from './borders';
export type { BorderColors, Borders, BorderWidths } from './borders';
export { colors } from './colors';
export type { ColorToken, ThemeColors } from './colors';
export { componentSizes } from './componentSizes';
export type { ButtonHeights, ComponentSizes, TouchTargets } from './componentSizes';
export { iconSizes, iconStrokes } from './iconSizes';
export type { IconSizes, IconStrokes } from './iconSizes';
export { radius } from './radius';
export type { Radius } from './radius';
export { shadows } from './shadows';
export type { Shadows, ShadowToken } from './shadows';
export { spacing } from './spacing';
export type { Spacing } from './spacing';
export { typography } from './typography';
export type { FontFamilyToken, FontWeightToken, Typography, TypographyStyle } from './typography';

export const theme = {
  colors,
  typography,
  spacing,
  radius,
  borders,
  shadows,
  iconSizes,
  iconStrokes,
  componentSizes,
} as const;

export type ForgeTheme = typeof theme;
