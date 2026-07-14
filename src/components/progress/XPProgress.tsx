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
  const levelProgress = getLevelProgress(currentLevel, currentXp, xpToNextLevel);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.level}>Nível {currentLevel}</Text>
        <Text style={styles.xp}>
          {levelProgress.current} / {levelProgress.target} XP
        </Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${levelProgress.percent}%` }]} />
      </View>

      <Text style={styles.percent}>{Math.round(levelProgress.percent)}%</Text>
    </View>
  );
}

function getLevelProgress(currentLevel: number, currentXp: number, xpToNextLevel: number) {
  const completedLevelXp = Math.max(currentLevel - 1, 0) * 500;
  const current = Math.max(currentXp - completedLevelXp, 0);
  const target = current + Math.max(xpToNextLevel, 0);
  const percent = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  return { current, target, percent };
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
