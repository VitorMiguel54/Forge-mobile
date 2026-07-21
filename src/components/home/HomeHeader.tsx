import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ForgeSymbol } from '@/components/icons/ForgeSymbol';
import { borders, colors, componentSizes, radius, spacing, typography } from '@/theme';

export type HomeHeaderProps = {
  readonly onBellPress?: () => void;
  readonly onProfilePress?: () => void;
};

export function HomeHeader({ onBellPress, onProfilePress }: HomeHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.brandGroup}>
        <View style={styles.brandMark}>
          <Text style={styles.brandMarkText}>F</Text>
        </View>
        <Text numberOfLines={1} style={styles.brandWord}>
          FORGE
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable accessibilityRole="button" onPress={onBellPress} style={styles.iconButton}>
          <ForgeSymbol
            color={colors.text.primary}
            fallback="!"
            name={{ ios: 'bell', android: 'notifications', web: 'notifications' }}
            size={22}
          />
          <View style={styles.notificationDot} />
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onProfilePress} style={styles.iconButton}>
          <ForgeSymbol
            color={colors.text.primary}
            fallback="P"
            name={{ ios: 'person', android: 'person', web: 'person' }}
            size={23}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[4],
  },
  brandGroup: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  brandMark: {
    width: componentSizes.avatar.md,
    height: componentSizes.avatar.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: borders.width.default,
    borderColor: colors.material.bronze,
    backgroundColor: colors.background.secondary,
  },
  brandMarkText: {
    ...typography.gamification.level,
    color: colors.forge.hotOrange,
  },
  brandWord: {
    ...typography.identity.logo,
    color: colors.text.primary,
    flexShrink: 1,
    letterSpacing: 0,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  iconButton: {
    position: 'relative',
    width: componentSizes.avatar.lg,
    height: componentSizes.avatar.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.circular,
    borderWidth: borders.width.default,
    borderColor: colors.border.default,
    backgroundColor: colors.background.secondary,
  },
  notificationDot: {
    position: 'absolute',
    top: spacing[3],
    right: spacing[3],
    width: spacing[2],
    height: spacing[2],
    borderRadius: radius.circular,
    backgroundColor: colors.forge.hotOrange,
  },
});
