import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, componentSizes, radius, spacing, typography } from '@/theme';

import { Card, type CardProps } from './Card';

export type MetricAccent = 'water' | 'sleep' | 'weight' | 'volume';

export type MetricProgress = {
  readonly current: number;
  readonly target: number;
};

export type MetricCardProps = {
  readonly title: string;
  readonly value: string | number;
  readonly unit?: string;
  readonly secondaryText?: string;
  readonly icon?: ReactNode;
  readonly accent?: MetricAccent;
  readonly progress?: MetricProgress;
  readonly variant?: CardProps['variant'];
  readonly style?: StyleProp<ViewStyle>;
};

export function MetricCard({
  title,
  value,
  unit,
  secondaryText,
  icon,
  accent = 'volume',
  progress,
  variant = 'default',
  style,
}: MetricCardProps) {
  const accentColor = metricAccentColors[accent];
  const progressPercent = progress ? getProgressPercent(progress.current, progress.target) : undefined;

  return (
    <Card variant={variant} style={style}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {icon ? <View style={styles.icon}>{icon}</View> : null}
      </View>

      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>

      {secondaryText ? <Text style={styles.secondaryText}>{secondaryText}</Text> : null}

      {progressPercent !== undefined ? (
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: accentColor,
                width: `${progressPercent}%`,
              },
            ]}
          />
        </View>
      ) : null}
    </Card>
  );
}

function getProgressPercent(current: number, target: number): number {
  if (target <= 0 || current <= 0) {
    return 0;
  }

  return Math.min((current / target) * 100, 100);
}

const metricAccentColors = {
  water: colors.metric.water,
  sleep: colors.metric.sleep,
  weight: colors.metric.weight,
  volume: colors.metric.volume,
} as const;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  title: {
    ...typography.title.card,
    color: colors.text.primary,
    flex: 1,
  },
  icon: {
    minHeight: componentSizes.touchTarget.ios,
    minWidth: componentSizes.touchTarget.ios,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing[2],
    marginTop: spacing[3],
  },
  value: {
    ...typography.number.highlight,
    color: colors.text.primary,
  },
  unit: {
    ...typography.body.secondary,
    color: colors.text.secondary,
  },
  secondaryText: {
    ...typography.body.secondary,
    color: colors.text.secondary,
    marginTop: spacing[2],
  },
  progressTrack: {
    height: componentSizes.progressBar.height,
    borderRadius: radius.circular,
    backgroundColor: colors.border.default,
    overflow: 'hidden',
    marginTop: spacing[4],
  },
  progressFill: {
    height: componentSizes.progressBar.height,
    borderRadius: radius.circular,
  },
});
