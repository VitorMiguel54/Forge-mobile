import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/cards/Card';
import { ForgeSymbol } from '@/components/icons/ForgeSymbol';
import { borders, colors, componentSizes, radius, shadows, spacing, typography } from '@/theme';

export type WeeklyProgressDay = {
  readonly completed: boolean;
  readonly isToday?: boolean;
  readonly label: string;
};

export type WeeklyProgressProps = {
  readonly days: readonly WeeklyProgressDay[];
  readonly motivation: string;
};

export function WeeklyProgress({ days, motivation }: WeeklyProgressProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text numberOfLines={1} style={styles.sectionLabel}>
          Progresso da semana
        </Text>
      </View>

      <Card padding={5} style={styles.card}>
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
                  day.isToday && styles.dayDotToday,
                  day.completed && day.isToday && styles.dayDotCompletedToday,
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
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: '100%',
    gap: spacing[4],
  },
  card: {
    width: '100%',
    borderRadius: radius.xl,
    backgroundColor: colors.surface.card,
    boxShadow: shadows.card,
  },
  header: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  sectionLabel: {
    ...typography.sectionTitle,
    color: colors.gamification.level,
    textTransform: 'uppercase',
    flexShrink: 1,
    letterSpacing: 1.2,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing[1],
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
  dayDotToday: {
    borderColor: colors.forge.hotOrange,
    borderWidth: borders.width.strong,
    boxShadow: `0 0 12px ${colors.forge.hotOrange}55`,
  },
  dayDotCompletedToday: {
    borderColor: colors.forge.hotOrange,
  },
  motivationCard: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    marginTop: spacing[8],
    paddingTop: spacing[5],
    borderTopWidth: borders.width.default,
    borderTopColor: colors.border.default,
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
    ...typography.sectionTitle,
    color: colors.forge.hotOrange,
  },
});
