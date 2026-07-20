import { StyleSheet, Text, View } from 'react-native';

import { colors, componentSizes, radius, spacing, typography } from '@/theme';

export type HomeHeroXp = {
  readonly current: number;
  readonly level: number;
  readonly next: number;
  readonly percent: number;
  readonly target: number;
};

export type HomeHeroProps = {
  readonly dayLabel: string;
  readonly guardianName: string;
  readonly guardianStatus: string;
  readonly xp: HomeHeroXp;
};

export function HomeHero({ dayLabel, guardianName, guardianStatus, xp }: HomeHeroProps) {
  return (
    <View style={styles.container}>
      <View style={styles.copy}>
        <Text numberOfLines={1} style={styles.date}>
          {dayLabel}
        </Text>

        <View style={styles.statusRow}>
          <View style={styles.statusDot} />
          <Text numberOfLines={1} style={styles.statusText}>
            Guardião ativo
          </Text>
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.greeting}>Boa tarde,</Text>
          <Text style={styles.guardianTitle}>{guardianName}.</Text>
        </View>

        <Text numberOfLines={2} style={styles.subtitle}>
          {guardianStatus}
        </Text>

        <View style={styles.progressBlock}>
          <Text numberOfLines={1} style={styles.levelText}>
            Nível {xp.level}
          </Text>
          <View style={styles.xpRow}>
            <Text numberOfLines={1} style={styles.currentXp}>
              {xp.current}
            </Text>
            <Text numberOfLines={1} style={styles.targetXp}>
              / {xp.target} XP
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${xp.percent}%` }]} />
          </View>
          <Text numberOfLines={1} style={styles.progressHint}>
            Faltam <Text style={styles.progressHintAccent}>{xp.next} XP</Text> para o próximo nível
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    paddingTop: spacing[2],
    paddingBottom: 0,
  },
  copy: {
    width: '100%',
    minWidth: 0,
    gap: spacing[2],
  },
  date: {
    ...typography.caption,
    color: colors.forge.hotOrange,
    textTransform: 'uppercase',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    minWidth: 0,
  },
  statusDot: {
    width: spacing[3],
    height: spacing[3],
    borderRadius: radius.circular,
    backgroundColor: colors.semantic.success,
  },
  statusText: {
    ...typography.caption,
    color: colors.semantic.success,
    textTransform: 'uppercase',
    flexShrink: 1,
  },
  titleBlock: {
    gap: 0,
  },
  greeting: {
    ...typography.screenTitle,
    color: colors.text.primary,
  },
  guardianTitle: {
    ...typography.identity.guardian,
    color: colors.forge.hotOrange,
  },
  subtitle: {
    ...typography.body.default,
    color: colors.text.secondary,
    maxWidth: 230,
  },
  progressBlock: {
    width: '100%',
    maxWidth: 236,
    gap: spacing[1],
    marginTop: spacing[4],
  },
  levelText: {
    ...typography.gamification.level,
    color: colors.gamification.level,
    textTransform: 'uppercase',
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing[2],
    minWidth: 0,
  },
  currentXp: {
    ...typography.metric.highlight,
    color: colors.gamification.xp,
  },
  targetXp: {
    ...typography.metric.compact,
    color: colors.text.secondary,
    flexShrink: 1,
  },
  progressTrack: {
    width: '100%',
    height: componentSizes.progressBar.height,
    overflow: 'hidden',
    borderRadius: radius.circular,
    backgroundColor: colors.border.default,
  },
  progressFill: {
    height: componentSizes.progressBar.height,
    borderRadius: radius.circular,
    backgroundColor: colors.gamification.xp,
  },
  progressHint: {
    ...typography.body.secondary,
    color: colors.text.secondary,
  },
  progressHintAccent: {
    color: colors.gamification.xp,
    fontWeight: typography.fontWeight.bold,
  },
});
