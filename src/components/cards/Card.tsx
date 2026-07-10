import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { borders, colors, radius, shadows, spacing } from '@/theme';
import type { Spacing } from '@/theme';

export type CardVariant = 'default' | 'elevated' | 'highlighted';
export type CardPadding = keyof Spacing;

export type CardProps = PropsWithChildren<
  ViewProps & {
    readonly variant?: CardVariant;
    readonly padding?: CardPadding;
    readonly style?: StyleProp<ViewStyle>;
  }
>;

export function Card({ children, variant = 'default', padding = 4, style, ...viewProps }: CardProps) {
  return (
    <View
      style={[styles.base, variantStyles[variant], { padding: spacing[padding] }, style]}
      {...viewProps}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    borderWidth: borders.width.default,
  },
  default: {
    backgroundColor: colors.surface.card,
    borderColor: colors.border.default,
    boxShadow: shadows.card,
  },
  elevated: {
    backgroundColor: colors.surface.cardElevated,
    borderColor: colors.border.default,
    boxShadow: shadows.cardFeatured,
  },
  highlighted: {
    backgroundColor: colors.surface.cardElevated,
    borderColor: colors.brand.primary,
    borderWidth: borders.width.strong,
    boxShadow: shadows.cardFeatured,
  },
});

const variantStyles = {
  default: styles.default,
  elevated: styles.elevated,
  highlighted: styles.highlighted,
} as const;
