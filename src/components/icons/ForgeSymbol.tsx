import { SymbolView, type SymbolViewProps, type SymbolWeight } from 'expo-symbols';
import { StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { colors, typography } from '@/theme';

export type ForgeSymbolName = SymbolViewProps['name'];

export type ForgeSymbolProps = {
  readonly name: ForgeSymbolName;
  readonly color?: string;
  readonly fallback?: string;
  readonly size?: number;
  readonly style?: StyleProp<ViewStyle>;
  readonly weight?: SymbolWeight;
};

export function ForgeSymbol({
  color = colors.text.secondary,
  fallback = '',
  name,
  size = 24,
  style,
  weight = 'medium',
}: ForgeSymbolProps) {
  return (
    <SymbolView
      fallback={<Text style={[styles.fallback, { color, fontSize: size * 0.64 }]}>{fallback}</Text>}
      name={name}
      size={size}
      style={style}
      tintColor={color}
      weight={weight}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    ...typography.caption,
    textAlign: 'center',
  },
});
