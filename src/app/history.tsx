import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';

import { BottomNavigation, Button, Card } from '@/components';
import { ForgeSymbol } from '@/components/icons/ForgeSymbol';
import { useHistory } from '@/hooks/useHistory';
import type { MobileHistoryWorkout } from '@/services/historyService';
import { borders, colors, componentSizes, radius, spacing, typography } from '@/theme';

const webContentMaxWidth = spacing[10] * spacing[5];

export default function HistoryScreen() {
  const router = useRouter();
  const { history, error, isLoading, refetch } = useHistory();
  const hasHistory = Boolean(history?.workouts.length);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.page}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>Histórico</Text>
              <Text style={styles.description}>
                Seus treinos recentes organizados para reconhecer progresso sem perder foco.
              </Text>
            </View>
          </View>

          {isLoading ? (
            <Card padding={5} style={styles.stateCard}>
              <ActivityIndicator color={colors.brand.primary} />
              <Text style={styles.stateTitle}>Carregando histórico</Text>
              <Text style={styles.stateText}>Buscando seus treinos concluídos.</Text>
            </Card>
          ) : null}

          {!isLoading && error ? (
            <Card padding={5} style={styles.stateCard}>
              <Text style={styles.stateTitle}>Não foi possível carregar</Text>
              <Text style={styles.stateText}>{error}</Text>
              <Button title="Tentar novamente" variant="secondary" onPress={() => void refetch()} />
            </Card>
          ) : null}

          {!isLoading && !error && history ? (
            <>
              <Card variant="elevated" padding={5} style={styles.weekSummaryCard}>
                <Text style={styles.summaryTitle}>Resumo da semana</Text>
                <View style={styles.summaryGrid}>
                  <SummaryStat
                    icon={{ ios: 'dumbbell', android: 'fitness_center', web: 'fitness_center' }}
                    label={history.summary.workouts === 1 ? 'Treino' : 'Treinos'}
                    value={history.summary.workouts}
                  />
                  <View style={styles.summaryDivider} />
                  <SummaryStat
                    icon={{ ios: 'clock', android: 'schedule', web: 'schedule' }}
                    label="Tempo total"
                    value={formatDuration(history.summary.totalDurationMinutes)}
                  />
                  <View style={styles.summaryDivider} />
                  <SummaryStat
                    icon={{ ios: 'scalemass', android: 'fitness_center', web: 'fitness_center' }}
                    label="Volume total"
                    value={formatVolume(history.summary.weeklyVolume)}
                  />
                </View>
              </Card>

              {hasHistory ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Últimos treinos</Text>
                  <View style={styles.timeline}>
                    {history.workouts.map((workout, index) => (
                      <TimelineWorkoutItem
                        key={workout.id}
                        isLast={index === history.workouts.length - 1}
                        workout={workout}
                        onOpen={() => router.push(getWorkoutHref(workout.id))}
                      />
                    ))}
                  </View>
                </View>
              ) : (
                <Card padding={5} style={styles.stateCard}>
                  <Text style={styles.stateTitle}>Nenhum treino no histórico</Text>
                  <Text style={styles.stateText}>
                    Treinos concluídos aparecem aqui para acompanhar sua evolução.
                  </Text>
                </Card>
              )}
            </>
          ) : null}
        </View>
      </ScrollView>
      <BottomNavigation activeHref="/history" />
    </SafeAreaView>
  );
}

type ForgeSymbolName = Parameters<typeof ForgeSymbol>[0]['name'];

function SummaryStat({
  icon,
  label,
  value,
}: {
  readonly icon: ForgeSymbolName;
  readonly label: string;
  readonly value: string | number;
}) {
  return (
    <View style={styles.summaryStat}>
      <ForgeSymbol color={colors.brand.primary} fallback="+" name={icon} size={28} weight="semibold" />
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function TimelineWorkoutItem({
  isLast,
  onOpen,
  workout,
}: {
  readonly isLast: boolean;
  readonly onOpen: () => void;
  readonly workout: MobileHistoryWorkout;
}) {
  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineRail}>
        <View style={styles.timelineDotOuter}>
          <View style={styles.timelineDot} />
        </View>
        {!isLast ? <View style={styles.timelineLine} /> : null}
      </View>
      <HistoryWorkoutCard workout={workout} onOpen={onOpen} />
    </View>
  );
}

function HistoryWorkoutCard({
  onOpen,
  workout,
}: {
  readonly onOpen: () => void;
  readonly workout: MobileHistoryWorkout;
}) {
  return (
    <Card padding={4} style={styles.historyCardFrame}>
      <View style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <View style={styles.workoutIcon}>
            <ForgeSymbol
              color={colors.brand.primary}
              fallback="+"
              name={{ ios: 'dumbbell', android: 'fitness_center', web: 'fitness_center' }}
              size={24}
              weight="semibold"
            />
          </View>
          <View style={styles.historyTitleGroup}>
            <Text style={styles.cardTitle}>{workout.name}</Text>
            <Text style={styles.secondaryText}>{formatMuscleGroups(workout)}</Text>
            <View style={styles.workoutMetaLine}>
              <ForgeSymbol
                color={colors.text.secondary}
                fallback="D"
                name={{ ios: 'calendar', android: 'calendar_today', web: 'calendar_today' }}
                size={16}
              />
              <Text style={styles.secondaryText}>{formatDate(workout.date)}</Text>
              <Text style={styles.secondaryText}>•</Text>
              <ForgeSymbol
                color={colors.text.secondary}
                fallback="T"
                name={{ ios: 'clock', android: 'schedule', web: 'schedule' }}
                size={16}
              />
              <Text style={styles.secondaryText}>{formatDuration(workout.durationMinutes)}</Text>
            </View>
          </View>
          <Pressable
            accessibilityLabel={`Abrir detalhes de ${workout.name}`}
            accessibilityRole="button"
            onPress={onOpen}
            style={({ pressed }) => [styles.detailsButton, pressed && styles.pressed]}
          >
            <ForgeSymbol
              color={colors.text.primary}
              fallback=">"
              name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
              size={26}
              weight="semibold"
            />
          </Pressable>
        </View>

        <View style={styles.metaGrid}>
          <WorkoutMeta label="Volume" value={formatVolume(workout.volume)} />
          <View style={styles.metaDivider} />
          <WorkoutMeta label="Exercícios" value={workout.exerciseCount} />
        </View>

        <View style={styles.statusRow}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Finalizado</Text>
        </View>
      </View>
    </Card>
  );
}

function WorkoutMeta({ label, value }: { readonly label: string; readonly value: string | number }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaValue}>{value}</Text>
      <Text style={styles.metaLabel}>{label}</Text>
    </View>
  );
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

function formatVolume(volume: number): string {
  if (volume >= 1000) {
    return `${Number((volume / 1000).toFixed(1))}k kg`;
  }

  return `${volume} kg`;
}

function formatDate(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Data não informada';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(parsedDate);
}

function formatExerciseCount(exerciseCount: number): string {
  return exerciseCount === 1 ? '1 exercício registrado' : `${exerciseCount} exercícios registrados`;
}

function formatMuscleGroups(workout: MobileHistoryWorkout): string {
  const muscleGroups = Array.from(new Set(workout.muscleGroups.filter(Boolean)));

  return muscleGroups.length > 0 ? muscleGroups.join(' • ') : formatExerciseCount(workout.exerciseCount);
}

function getWorkoutHref(id: string): Href {
  return `/workouts/${encodeURIComponent(id)}` as Href;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[6],
    paddingBottom: componentSizes.bottomNavigation.height + spacing[8],
  },
  page: {
    width: '100%',
    maxWidth: Platform.select({
      web: webContentMaxWidth,
      default: undefined,
    }),
    gap: spacing[6],
  },
  header: {
    gap: spacing[2],
  },
  headerCopy: {
    gap: spacing[2],
  },
  pressed: {
    opacity: 0.82,
  },
  eyebrow: {
    ...typography.caption,
    color: colors.brand.primary,
    textTransform: 'uppercase',
  },
  title: {
    ...typography.screenTitle,
    color: colors.text.primary,
  },
  description: {
    ...typography.body.secondary,
    color: colors.text.secondary,
  },
  weekSummaryCard: {
    gap: spacing[5],
    borderColor: colors.brand.primary,
  },
  summaryTitle: {
    ...typography.sectionTitle,
    color: colors.brand.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  summaryGrid: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing[3],
  },
  summaryDivider: {
    width: borders.width.default,
    alignSelf: 'stretch',
    backgroundColor: colors.border.default,
  },
  summaryStat: {
    flex: 1,
    alignItems: 'center',
    gap: spacing[1],
  },
  summaryValue: {
    ...typography.metric.compact,
    color: colors.text.primary,
    textAlign: 'center',
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  section: {
    gap: spacing[3],
  },
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.gamification.level,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  stateCard: {
    alignItems: 'center',
    gap: spacing[3],
  },
  stateTitle: {
    ...typography.cardTitle,
    color: colors.text.primary,
    textAlign: 'center',
  },
  stateText: {
    ...typography.body.secondary,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  timeline: {
    gap: 0,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing[3],
  },
  timelineRail: {
    width: componentSizes.touchTarget.global,
    alignItems: 'center',
  },
  timelineDotOuter: {
    width: spacing[8],
    height: spacing[8],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.circular,
    borderWidth: borders.width.default,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.default,
  },
  timelineDot: {
    width: spacing[5],
    height: spacing[5],
    borderRadius: radius.circular,
    backgroundColor: colors.brand.primary,
  },
  timelineLine: {
    flex: 1,
    width: borders.width.default,
    backgroundColor: colors.border.default,
  },
  historyCardFrame: {
    flex: 1,
    marginBottom: spacing[4],
  },
  historyCard: {
    gap: spacing[4],
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  workoutIcon: {
    width: componentSizes.fab.size,
    height: componentSizes.fab.size,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.circular,
    borderWidth: borders.width.default,
    borderColor: colors.brand.primary,
    backgroundColor: colors.surface.default,
  },
  historyTitleGroup: {
    flex: 1,
    minWidth: 0,
    gap: spacing[1],
  },
  cardTitle: {
    ...typography.cardTitle,
    color: colors.text.primary,
  },
  secondaryText: {
    ...typography.body.secondary,
    color: colors.text.secondary,
  },
  workoutMetaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing[1],
  },
  detailsButton: {
    width: componentSizes.touchTarget.global,
    height: componentSizes.touchTarget.global,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaGrid: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: radius.lg,
    borderWidth: borders.width.default,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.default,
  },
  metaItem: {
    flex: 1,
    gap: spacing[1],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  metaDivider: {
    width: borders.width.default,
    alignSelf: 'stretch',
    backgroundColor: colors.border.default,
  },
  metaValue: {
    ...typography.metric.compact,
    color: colors.text.primary,
  },
  metaLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  statusDot: {
    width: spacing[2],
    height: spacing[2],
    borderRadius: radius.circular,
    backgroundColor: colors.semantic.success,
  },
  statusText: {
    ...typography.body.secondary,
    color: colors.text.secondary,
  },
});
