import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ForgeSymbol } from '@/components/icons/ForgeSymbol';
import { borders, colors, componentSizes, radius, spacing } from '@/theme';

export type OrderControlsProps = {
  readonly canMoveDown: boolean;
  readonly canMoveUp: boolean;
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly onMoveDown: () => void;
  readonly onMoveUp: () => void;
  readonly style?: StyleProp<ViewStyle>;
};

export function OrderControls({
  canMoveDown,
  canMoveUp,
  disabled = false,
  loading = false,
  onMoveDown,
  onMoveUp,
  style,
}: OrderControlsProps) {
  const isDisabled = disabled || loading;

  return (
    <View style={[styles.container, style]}>
      <OrderButton
        accessibilityLabel="Mover para cima"
        disabled={isDisabled || !canMoveUp}
        direction="up"
        loading={loading}
        onPress={onMoveUp}
      />
      <OrderButton
        accessibilityLabel="Mover para baixo"
        disabled={isDisabled || !canMoveDown}
        direction="down"
        loading={loading}
        onPress={onMoveDown}
      />
    </View>
  );
}

function OrderButton({
  accessibilityLabel,
  direction,
  disabled,
  loading,
  onPress,
}: {
  readonly accessibilityLabel: string;
  readonly direction: 'down' | 'up';
  readonly disabled: boolean;
  readonly loading: boolean;
  readonly onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.text.disabled} size="small" />
      ) : (
        <ForgeSymbol
          color={disabled ? colors.text.disabled : colors.brand.primary}
          fallback={direction === 'up' ? '^' : 'v'}
          name={{
            ios: direction === 'up' ? 'chevron.up' : 'chevron.down',
            android: direction === 'up' ? 'keyboard_arrow_up' : 'keyboard_arrow_down',
            web: direction === 'up' ? 'keyboard_arrow_up' : 'keyboard_arrow_down',
          }}
          size={20}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  button: {
    width: componentSizes.touchTarget.global,
    height: componentSizes.touchTarget.global,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: borders.width.default,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.default,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonPressed: {
    opacity: 0.72,
  },
});
