import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/cards/Card';
import { ForgeSymbol } from '@/components/icons/ForgeSymbol';
import { borders, colors, componentSizes, radius, shadows, spacing, typography } from '@/theme';

export type WeeklyProgressDay = {
  readonly completed: boolean;
  readonly current: boolean;
  readonly label: string;
};

export type WeeklyProgressProps = {
  readonly current: number;
  readonly days: readonly WeeklyProgressDay[];
  readonly motivation: string;
  readonly target: number;
};

export function WeeklyProgress({ current, days, motivation, target }: WeeklyProgressProps) {
  return (
    <Card padding={5} style={styles.card}>
      <View style={styles.header}>
        <Text numberOfLines={1} style={styles.sectionLabel}>
          Progresso da semana
        </Text>
        <Text numberOfLines={1} style={styles.goalText}>
          {current}/{target} treinos
        </Text>
      </View>

      <View style={styles.daysRow}>
        {days.map((day) => (
          <View key={day.label} style={styles.dayItem}>
            <Text numberOfLines={1} style={styles.dayLabel}>
              {day.label}
            </Text>
            <View
              style={[
                styles.dayDot,
                day.completed && styles.dayDotCompleted,
                day.current && styles.dayDotCurrent,
              ]}
            >
              {day.completed ? (
                <ForgeSymbol
                  color={colors.background.primary}
                  fallback="✓"
                  name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                  size={16}
                />
              ) : null}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.motivationCard}>
        <View style={styles.guardianMark}>
          <Text style={styles.guardianMarkText}>F</Text>
        </View>
        <View style={styles.motivationCopy}>
          <Text numberOfLines={1} style={styles.motivationSupport}>
            Disciplina hoje.
          </Text>
          <Text numberOfLines={2} style={styles.motivationText}>
            {motivation}
          </Text>
        </View>
        <ForgeSymbol
          color={colors.text.disabled}
          fallback=">"
          name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
          size={24}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: radius.xl,
    backgroundColor: colors.background.secondary,
    boxShadow: shadows.cardFeatured,
  },
  header: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  sectionLabel: {
    ...typography.identity.section,
    color: colors.text.primary,
    textTransform: 'uppercase',
    flexShrink: 1,
  },
  goalText: {
    ...typography.body.default,
    color: colors.semantic.success,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing[1],
    marginTop: spacing[8],
  },
  dayItem: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    gap: spacing[3],
  },
  dayLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  dayDot: {
    width: componentSizes.avatar.sm,
    height: componentSizes.avatar.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.circular,
    borderWidth: borders.width.default,
    borderColor: colors.border.default,
    backgroundColor: colors.background.primary,
  },
  dayDotCompleted: {
    borderColor: colors.material.bronze,
    backgroundColor: colors.material.bronze,
  },
  dayDotCurrent: {
    borderColor: colors.semantic.success,
    borderWidth: borders.width.strong,
  },
  motivationCard: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    marginTop: spacing[8],
    padding: spacing[4],
    borderRadius: radius.lg,
    borderWidth: borders.width.default,
    borderColor: colors.border.default,
    backgroundColor: colors.background.primary,
  },
  guardianMark: {
    width: componentSizes.avatar.lg,
    height: componentSizes.avatar.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    borderWidth: borders.width.default,
    borderColor: colors.material.bronze,
    backgroundColor: colors.surface.default,
  },
  guardianMarkText: {
    ...typography.gamification.level,
    color: colors.forge.hotOrange,
  },
  motivationCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing[1],
  },
  motivationSupport: {
    ...typography.body.secondary,
    color: colors.text.secondary,
  },
  motivationText: {
    ...typography.identity.section,
    color: colors.forge.hotOrange,
  },
});
