import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { borders, colors, componentSizes, radius, spacing, typography } from '@/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline';

export type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  readonly title: string;
  readonly variant?: ButtonVariant;
  readonly icon?: ReactNode;
  readonly loading?: boolean;
  readonly style?: StyleProp<ViewStyle>;
  readonly textStyle?: StyleProp<TextStyle>;
};

export function Button({
  title,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle,
  ...pressableProps
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const variantStyles = getVariantStyles(variant, isDisabled);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles.container,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
      {...pressableProps}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.text.color} />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, variantStyles.text, textStyle]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

function getVariantStyles(variant: ButtonVariant, disabled: boolean) {
  if (disabled) {
    return {
      container: styles.disabledContainer,
      text: styles.disabledText,
    };
  }

  if (variant === 'secondary') {
    return {
      container: styles.secondaryContainer,
      text: styles.secondaryText,
    };
  }

  if (variant === 'outline') {
    return {
      container: styles.outlineContainer,
      text: styles.outlineText,
    };
  }

  return {
    container: styles.primaryContainer,
    text: styles.primaryText,
  };
}

const styles = StyleSheet.create({
  base: {
    minHeight: componentSizes.buttonHeight.lg,
    minWidth: componentSizes.touchTarget.global,
    paddingHorizontal: spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing[2],
    borderRadius: radius.lg,
    borderWidth: borders.width.default,
  },
  pressed: {
    opacity: 0.88,
  },
  text: {
    ...typography.button,
    textAlign: 'center',
  },
  primaryContainer: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  primaryText: {
    color: colors.text.primary,
  },
  secondaryContainer: {
    backgroundColor: colors.surface.default,
    borderColor: colors.border.default,
  },
  secondaryText: {
    color: colors.text.primary,
  },
  outlineContainer: {
    borderColor: colors.border.default,
  },
  outlineText: {
    color: colors.text.primary,
  },
  disabledContainer: {
    backgroundColor: colors.border.disabled,
    borderColor: colors.border.disabled,
  },
  disabledText: {
    color: colors.text.disabled,
  },
});
