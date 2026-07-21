import { useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavigation, Button, Card, ForgeSymbol } from '@/components';
import { useWorkoutDetails } from '@/hooks/useWorkoutDetails';
import type { WorkoutAnalysis, WorkoutAnalysisExercise, WorkoutAnalysisSet } from '@/services/workoutsService';
import { borders, colors, componentSizes, radius, spacing, typography } from '@/theme';

const webContentMaxWidth = spacing[10] * spacing[5];

export default function WorkoutDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const workoutId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { workout, error, isLoading } = useWorkoutDetails(workoutId);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.page}>
          <View style={styles.topBar}>
            <Pressable
              accessibilityLabel="Voltar"
              accessibilityRole="button"
              onPress={() => router.back()}
              style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
            >
              <ForgeSymbol
                color={colors.text.primary}
                fallback="<"
                name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
                size={28}
                weight="semibold"
              />
            </Pressable>
            <Text style={styles.topBarTitle}>Detalhes do treino</Text>
            <View style={styles.iconButton} />
          </View>

          {isLoading ? (
            <Card padding={5} style={styles.stateCard}>
              <ActivityIndicator color={colors.brand.primary} />
              <Text style={styles.stateTitle}>Carregando analise</Text>
              <Text style={styles.stateText}>Buscando os dados reais da execucao.</Text>
            </Card>
          ) : null}

          {!isLoading && error ? (
            <Card padding={5} style={styles.stateCard}>
              <Text style={styles.stateTitle}>Nao foi possivel abrir</Text>
              <Text style={styles.stateText}>{error}</Text>
              <Button title="Voltar ao historico" variant="secondary" onPress={() => router.replace('/history')} />
            </Card>
          ) : null}

          {!isLoading && !error && workout ? <WorkoutAnalysisContent workout={workout} /> : null}
        </View>
      </ScrollView>
      <BottomNavigation activeHref="/history" />
    </SafeAreaView>
  );
}

function WorkoutAnalysisContent({ workout }: { readonly workout: WorkoutAnalysis }) {
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | undefined>(undefined);
  const hasExercises = workout.exercises.length > 0;

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Exercicios realizados</Text>
        <Text style={styles.title}>{workout.name}</Text>
        <Text style={styles.description}>
          {formatDate(workout.workoutDate)} • {formatDuration(workout.durationMinutes)}
        </Text>
      </View>

      <Card variant="highlighted" padding={5}>
        <View style={styles.summaryGrid}>
          <SummaryMetric label="Exercicios" value={workout.totalExercises} />
          <View style={styles.summaryDivider} />
          <SummaryMetric label="Series" value={workout.totalSets} />
          <View style={styles.summaryDivider} />
          <SummaryMetric label="Volume" value={formatVolume(workout.totalVolume)} />
        </View>
      </Card>

      {hasExercises ? (
        <View style={styles.exerciseList}>
          {workout.exercises.map((exercise) => (
            <ExerciseAccordion
              key={exercise.workoutExerciseId}
              exercise={exercise}
              isExpanded={expandedExerciseId === exercise.workoutExerciseId}
              onPress={() =>
                setExpandedExerciseId((currentId) =>
                  currentId === exercise.workoutExerciseId ? undefined : exercise.workoutExerciseId,
                )
              }
            />
          ))}
        </View>
      ) : (
        <Card padding={5} style={styles.stateCard}>
          <Text style={styles.stateTitle}>Treino sem exercicios</Text>
          <Text style={styles.stateText}>Nao existem exercicios registrados neste treino.</Text>
        </Card>
      )}
    </>
  );
}

function SummaryMetric({ label, value }: { readonly label: string; readonly value: string | number }) {
  return (
    <View style={styles.summaryMetric}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function ExerciseAccordion({
  exercise,
  isExpanded,
  onPress,
}: {
  readonly exercise: WorkoutAnalysisExercise;
  readonly isExpanded: boolean;
  readonly onPress: () => void;
}) {
  const progression = useMemo(() => getProgressionState(exercise), [exercise]);

  return (
    <Card padding={4} style={styles.exerciseCard}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        onPress={onPress}
        style={({ pressed }) => [styles.exerciseHeader, pressed && styles.pressed]}
      >
        <View style={styles.exerciseOrder}>
          <Text style={styles.exerciseOrderText}>{exercise.order}</Text>
        </View>

        <View style={styles.exerciseTitleGroup}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <Text style={styles.exerciseMuscle}>{exercise.muscleGroup}</Text>
          {exercise.equipment ? <Text style={styles.exerciseMeta}>{exercise.equipment}</Text> : null}
        </View>

        <View style={styles.exerciseNumbers}>
          <Text style={styles.exerciseNumber}>
            {exercise.totalSets} <Text style={styles.exerciseNumberLabel}>series</Text>
          </Text>
          <Text style={styles.exerciseNumber}>
            {exercise.totalRepetitions} <Text style={styles.exerciseNumberLabel}>reps</Text>
          </Text>
        </View>

        <ForgeSymbol
          color={colors.text.primary}
          fallback={isExpanded ? '^' : 'v'}
          name={{
            ios: isExpanded ? 'chevron.up' : 'chevron.down',
            android: isExpanded ? 'expand_less' : 'expand_more',
            web: isExpanded ? 'expand_less' : 'expand_more',
          }}
          size={28}
          weight="semibold"
        />
      </Pressable>

      {isExpanded ? (
        <View style={styles.expandedContent}>
          <View style={styles.metricPanel}>
            <SummaryMetric label="Melhor carga" value={formatWeight(exercise.bestWeight)} />
            <View style={styles.summaryDivider} />
            <SummaryMetric label="Volume" value={formatVolume(exercise.totalVolume)} />
          </View>

          {exercise.sets.length > 0 ? (
            <View style={styles.table}>
              <Text style={styles.blockTitle}>Series</Text>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeadCell}>Serie</Text>
                <Text style={styles.tableHeadCell}>Repeticoes</Text>
                <Text style={styles.tableHeadCell}>Carga</Text>
                <Text style={styles.tableHeadCell}>Volume</Text>
              </View>
              {exercise.sets.map((set) => (
                <SetRow key={set.id} set={set} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyBlock}>
              <Text style={styles.stateText}>Exercicio sem series registradas.</Text>
            </View>
          )}

          <View style={styles.progressionBlock}>
            <Text style={styles.blockTitle}>Progressao</Text>
            {progression.hasPrevious ? (
              <View style={styles.progressionRow}>
                <View style={styles.progressionSide}>
                  <Text style={styles.progressionWeight}>{formatWeight(progression.previousWeight)}</Text>
                  <Text style={styles.summaryLabel}>Anterior</Text>
                </View>
                <View style={styles.progressionCenter}>
                  <Text
                    style={[
                      styles.progressionDelta,
                      progression.difference < 0 && styles.progressionDeltaNegative,
                    ]}
                  >
                    {formatSignedWeight(progression.difference)}
                  </Text>
                  {progression.percentage !== undefined ? (
                    <Text
                      style={[
                        styles.progressionPercent,
                        progression.difference < 0 && styles.progressionDeltaNegative,
                      ]}
                    >
                      {formatSignedPercentage(progression.percentage)}
                    </Text>
                  ) : null}
                </View>
                <View style={styles.progressionSide}>
                  <Text style={styles.progressionWeight}>{formatWeight(exercise.bestWeight)}</Text>
                  <Text style={styles.summaryLabel}>Atual</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.stateText}>Sem treino anterior para comparacao.</Text>
            )}
          </View>
        </View>
      ) : null}
    </Card>
  );
}

function SetRow({ set }: { readonly set: WorkoutAnalysisSet }) {
  return (
    <View style={styles.setRow}>
      <Text style={styles.tableCell}>{set.setNumber}</Text>
      <Text style={styles.tableCell}>{set.repetitions}</Text>
      <Text style={styles.tableCell}>{formatWeight(set.weight)}</Text>
      <Text style={styles.tableCell}>{formatVolume(set.volume)}</Text>
      {set.notes ? <Text style={styles.setNotes}>Obs: {set.notes}</Text> : null}
    </View>
  );
}

function getProgressionState(exercise: WorkoutAnalysisExercise) {
  const previousWeight = exercise.previousBestWeight;

  if (previousWeight === undefined || previousWeight === 0) {
    return {
      hasPrevious: false as const,
      previousWeight: 0,
      difference: 0,
      percentage: undefined,
    };
  }

  return {
    hasPrevious: true as const,
    previousWeight,
    difference: exercise.weightDifference ?? exercise.bestWeight - previousWeight,
    percentage: exercise.weightDifferencePercentage,
  };
}

function formatDate(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Data nao informada';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate);
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

  return `${formatDecimal(volume)} kg`;
}

function formatWeight(weight: number): string {
  return `${formatDecimal(weight)} kg`;
}

function formatSignedWeight(weight: number): string {
  const prefix = weight > 0 ? '+' : '';
  return `${prefix}${formatDecimal(weight)} kg`;
}

function formatSignedPercentage(percentage: number): string {
  const prefix = percentage > 0 ? '+' : '';
  return `${prefix}${formatDecimal(percentage)}%`;
}

function formatDecimal(value: number): string {
  return Number.isInteger(value) ? String(value) : Number(value.toFixed(1)).toString();
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
    paddingTop: spacing[3],
    paddingBottom: componentSizes.bottomNavigation.height + spacing[8],
  },
  page: {
    width: '100%',
    maxWidth: Platform.select({
      web: webContentMaxWidth,
      default: undefined,
    }),
    gap: spacing[5],
  },
  topBar: {
    minHeight: componentSizes.touchTarget.global,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
  },
  iconButton: {
    width: componentSizes.touchTarget.global,
    height: componentSizes.touchTarget.global,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    ...typography.cardTitle,
    color: colors.text.primary,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.82,
  },
  header: {
    gap: spacing[2],
  },
  eyebrow: {
    ...typography.sectionTitle,
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
  summaryGrid: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing[3],
  },
  summaryMetric: {
    flex: 1,
    alignItems: 'center',
    gap: spacing[1],
  },
  summaryDivider: {
    width: borders.width.default,
    alignSelf: 'stretch',
    backgroundColor: colors.border.default,
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
  exerciseList: {
    gap: spacing[4],
  },
  exerciseCard: {
    overflow: 'hidden',
  },
  exerciseHeader: {
    minHeight: spacing[10],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  exerciseOrder: {
    width: spacing[8],
    height: spacing[8],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.circular,
    borderWidth: borders.width.default,
    borderColor: colors.brand.primary,
    backgroundColor: colors.surface.default,
  },
  exerciseOrderText: {
    ...typography.metric.compact,
    color: colors.brand.primary,
  },
  exerciseTitleGroup: {
    flex: 1,
    minWidth: 0,
    gap: spacing[1],
  },
  exerciseName: {
    ...typography.cardTitle,
    color: colors.text.primary,
  },
  exerciseMuscle: {
    ...typography.body.secondary,
    color: colors.text.secondary,
  },
  exerciseMeta: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  exerciseNumbers: {
    alignItems: 'flex-start',
    gap: spacing[1],
  },
  exerciseNumber: {
    ...typography.cardTitle,
    color: colors.text.primary,
  },
  exerciseNumberLabel: {
    ...typography.body.secondary,
    color: colors.text.secondary,
  },
  expandedContent: {
    marginTop: spacing[4],
    paddingTop: spacing[4],
    gap: spacing[5],
    borderTopWidth: borders.width.default,
    borderTopColor: colors.border.default,
  },
  metricPanel: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingVertical: spacing[3],
    borderRadius: radius.lg,
    borderWidth: borders.width.default,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.default,
  },
  blockTitle: {
    ...typography.cardTitle,
    color: colors.text.primary,
  },
  table: {
    gap: spacing[2],
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: spacing[2],
    borderBottomWidth: borders.width.default,
    borderBottomColor: colors.border.default,
  },
  tableHeadCell: {
    flex: 1,
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  setRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing[2],
    paddingVertical: spacing[3],
    borderBottomWidth: borders.width.default,
    borderBottomColor: colors.border.default,
  },
  tableCell: {
    flex: 1,
    ...typography.body.default,
    color: colors.text.primary,
    textAlign: 'center',
  },
  setNotes: {
    width: '100%',
    ...typography.caption,
    color: colors.text.secondary,
  },
  progressionBlock: {
    gap: spacing[3],
  },
  progressionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  progressionSide: {
    flex: 1,
    gap: spacing[1],
  },
  progressionCenter: {
    flex: 1,
    alignItems: 'center',
    gap: spacing[1],
  },
  progressionWeight: {
    ...typography.metric.compact,
    color: colors.text.primary,
  },
  progressionDelta: {
    ...typography.cardTitle,
    color: colors.semantic.success,
  },
  progressionDeltaNegative: {
    color: colors.semantic.error,
  },
  progressionPercent: {
    ...typography.body.secondary,
    color: colors.semantic.success,
  },
  emptyBlock: {
    padding: spacing[4],
    borderRadius: radius.lg,
    borderWidth: borders.width.default,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.default,
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
});
