import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/cards/Card';
import { ForgeSymbol } from '@/components/icons/ForgeSymbol';
import { borders, colors, componentSizes, radius, shadows, spacing, typography } from '@/theme';

export type TodayWorkoutCardProps = {
  readonly detail: string;
  readonly estimate: string;
  readonly title: string;
  readonly volumeText: string;
};

export function TodayWorkoutCard({ detail, estimate, title, volumeText }: TodayWorkoutCardProps) {
  const isEmptyWorkout = title.toLowerCase().includes('nenhum treino');
  const displayTitle = isEmptyWorkout ? 'Nenhum treino em andamento' : title;
  const displayDetail = isEmptyWorkout ? 'Crie ou inicie um treino para continuar.' : detail;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text numberOfLines={1} style={styles.sectionLabel}>
          Treino de hoje
        </Text>
        <View style={styles.headerAction}>
          <Text numberOfLines={1} style={styles.headerActionText}>
            Ver todos
          </Text>
          <ForgeSymbol
            color={colors.forge.hotOrange}
            fallback=">"
            name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
            size={18}
          />
        </View>
      </View>

      <Card padding={4} style={styles.card}>
        <View style={styles.content}>
          <View style={styles.iconFrame}>
            <ForgeSymbol
              color={colors.brand.primary}
              fallback="T"
              name={{ ios: 'dumbbell', android: 'fitness_center', web: 'fitness_center' }}
              size={36}
              weight="semibold"
            />
          </View>

          <View style={styles.copy}>
            <Text numberOfLines={2} style={styles.title}>
              {displayTitle}
            </Text>
            <Text style={styles.detail}>
              {displayDetail}
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <ForgeSymbol
                  color={colors.forge.hotOrange}
                  fallback="L"
                  name={{ ios: 'list.bullet', android: 'list', web: 'list' }}
                  size={17}
                />
                <Text numberOfLines={1} style={styles.metaText}>
                  {isEmptyWorkout ? 'Sem treino ativo' : detail}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <ForgeSymbol
                  color={colors.forge.hotOrange}
                  fallback="H"
                  name={{ ios: 'clock', android: 'schedule', web: 'schedule' }}
                  size={17}
                />
                <Text numberOfLines={1} style={styles.metaText}>
                  {estimate}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <ForgeSymbol
                  color={colors.forge.hotOrange}
                  fallback="V"
                  name={{ ios: 'flame', android: 'local_fire_department', web: 'local_fire_department' }}
                  size={17}
                />
                <Text numberOfLines={1} style={styles.metaText}>
                  {volumeText}
                </Text>
              </View>
            </View>
          </View>
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
  headerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  headerActionText: {
    ...typography.caption,
    color: colors.forge.hotOrange,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[4],
    minWidth: 0,
  },
  iconFrame: {
    width: componentSizes.avatar.xl,
    height: componentSizes.avatar.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    borderWidth: borders.width.default,
    borderColor: colors.brand.primary,
    backgroundColor: colors.surface.default,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: spacing[2],
  },
  title: {
    ...typography.cardTitle,
    color: colors.text.primary,
    flexShrink: 1,
  },
  detail: {
    ...typography.body.secondary,
    color: colors.text.secondary,
    flexShrink: 1,
  },
  metaRow: {
    minWidth: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
    marginTop: spacing[2],
  },
  metaItem: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  metaText: {
    ...typography.caption,
    color: colors.text.primary,
  },
});
