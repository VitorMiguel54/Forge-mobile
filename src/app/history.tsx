import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavigation, Button, Card } from '@/components';
import { useHistory } from '@/hooks/useHistory';
import type { MobileHistoryWorkout } from '@/services/historyService';
import { borders, colors, componentSizes, radius, spacing, typography } from '@/theme';

const webContentMaxWidth = spacing[10] * spacing[5];

export default function HistoryScreen() {
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
            <Text style={styles.eyebrow}>Linha do tempo</Text>
            <Text style={styles.title}>Histórico</Text>
            <Text style={styles.description}>
              Seus treinos recentes organizados para reconhecer progresso sem perder foco.
            </Text>
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
              <Card variant="elevated" padding={5}>
                <View style={styles.summaryGrid}>
                  <SummaryStat label="Treinos" value={history.summary.workouts} />
                  <SummaryStat
                    label="Tempo total"
                    value={formatDuration(history.summary.totalDurationMinutes)}
                  />
                  <SummaryStat
                    label="Volume semana"
                    value={formatVolume(history.summary.weeklyVolume)}
                  />
                </View>
              </Card>

              {hasHistory ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Últimos treinos</Text>
                  <View style={styles.timeline}>
                    {history.workouts.map((workout) => (
                      <HistoryWorkoutCard key={workout.id} workout={workout} />
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

function SummaryStat({ label, value }: { readonly label: string; readonly value: string | number }) {
  return (
    <View style={styles.summaryStat}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function HistoryWorkoutCard({ workout }: { readonly workout: MobileHistoryWorkout }) {
  return (
    <Card padding={4}>
      <View style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <View style={styles.historyTitleGroup}>
            <Text style={styles.cardTitle}>{workout.name}</Text>
            <Text style={styles.secondaryText}>{formatDate(workout.date)}</Text>
          </View>
          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeText}>{formatDuration(workout.durationMinutes)}</Text>
          </View>
        </View>

        <View style={styles.metaGrid}>
          <WorkoutMeta label="Volume" value={formatVolume(workout.volume)} />
          <WorkoutMeta label="Exercícios" value={workout.exerciseCount} />
        </View>

        <View style={styles.exerciseList}>
          <View style={styles.exerciseItem}>
            <View style={styles.exerciseDot} />
            <Text style={styles.exerciseText}>{formatExerciseCount(workout.exerciseCount)}</Text>
          </View>
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
  eyebrow: {
    ...typography.caption,
    color: colors.brand.primary,
    textTransform: 'uppercase',
  },
  title: {
    ...typography.title.main,
    color: colors.text.primary,
  },
  description: {
    ...typography.body.secondary,
    color: colors.text.secondary,
  },
  summaryGrid: {
    gap: spacing[3],
  },
  summaryStat: {
    gap: spacing[1],
    padding: spacing[3],
    borderRadius: radius.lg,
    borderWidth: borders.width.default,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.default,
  },
  summaryValue: {
    ...typography.number.compact,
    color: colors.text.primary,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  section: {
    gap: spacing[3],
  },
  sectionTitle: {
    ...typography.title.section,
    color: colors.text.primary,
  },
  stateCard: {
    alignItems: 'center',
    gap: spacing[3],
  },
  stateTitle: {
    ...typography.title.section,
    color: colors.text.primary,
    textAlign: 'center',
  },
  stateText: {
    ...typography.body.secondary,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  timeline: {
    gap: spacing[4],
  },
  historyCard: {
    gap: spacing[4],
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing[4],
  },
  historyTitleGroup: {
    flex: 1,
    gap: spacing[2],
  },
  cardTitle: {
    ...typography.title.card,
    color: colors.text.primary,
  },
  secondaryText: {
    ...typography.body.secondary,
    color: colors.text.secondary,
  },
  dateBadge: {
    minHeight: componentSizes.badge.minHeight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[3],
    borderRadius: radius.circular,
    borderWidth: borders.width.default,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.default,
  },
  dateBadgeText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  metaItem: {
    flex: 1,
    gap: spacing[1],
    padding: spacing[3],
    borderRadius: radius.lg,
    borderWidth: borders.width.default,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.default,
  },
  metaValue: {
    ...typography.number.compact,
    color: colors.text.primary,
  },
  metaLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  exerciseList: {
    gap: spacing[2],
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  exerciseDot: {
    width: spacing[2],
    height: spacing[2],
    borderRadius: radius.circular,
    backgroundColor: colors.brand.primary,
  },
  exerciseText: {
    ...typography.body.secondary,
    color: colors.text.secondary,
  },
});
