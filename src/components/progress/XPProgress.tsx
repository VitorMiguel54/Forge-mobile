import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, componentSizes, radius, spacing, typography } from '@/theme';

export type XPProgressProps = {
  readonly currentLevel: number;
  readonly currentXp: number;
  readonly xpToNextLevel: number;
  readonly style?: StyleProp<ViewStyle>;
};

export function XPProgress({
  currentLevel,
  currentXp,
  xpToNextLevel,
  style,
}: XPProgressProps) {
  const percent = getXpPercent(currentXp, xpToNextLevel);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.level}>Nivel {currentLevel}</Text>
        <Text style={styles.xp}>
          {currentXp} / {xpToNextLevel} XP
        </Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%` }]} />
      </View>

      <Text style={styles.percent}>{Math.round(percent)}%</Text>
    </View>
  );
}

function getXpPercent(currentXp: number, xpToNextLevel: number): number {
  if (xpToNextLevel <= 0 || currentXp <= 0) {
    return 0;
  }

  return Math.min((currentXp / xpToNextLevel) * 100, 100);
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[2],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing[3],
  },
  level: {
    ...typography.gamification.level,
    color: colors.gamification.level,
  },
  xp: {
    ...typography.gamification.xp,
    color: colors.gamification.xp,
  },
  track: {
    height: componentSizes.progressBar.height,
    borderRadius: radius.circular,
    backgroundColor: colors.border.default,
    overflow: 'hidden',
  },
  fill: {
    height: componentSizes.progressBar.height,
    borderRadius: radius.circular,
    backgroundColor: colors.gamification.xp,
  },
  percent: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'right',
  },
});
