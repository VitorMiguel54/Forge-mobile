import { useRouter, type Href } from 'expo-router';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavigation, Button, Card } from '@/components';
import { useWorkouts } from '@/hooks/useWorkouts';
import type { MobileWorkout } from '@/services/workoutsService';
import { borders, colors, componentSizes, radius, spacing, typography } from '@/theme';

const webContentMaxWidth = spacing[10] * spacing[5];

export default function WorkoutsScreen() {
  const router = useRouter();
  const { workouts, actionError, createWorkout, error, isCreating, isLoading, refetch } = useWorkouts();
  const activeWorkout = workouts?.activeWorkout;
  const hasWorkouts = Boolean(activeWorkout || workouts?.savedWorkouts.length);
  const hasSavedWorkouts = Boolean(workouts?.savedWorkouts.length);

  async function handleCreateWorkout() {
    const createdWorkout = await createWorkout();

    if (createdWorkout?.id) {
      router.push(getWorkoutHref(createdWorkout.id));
    }
  }

  function handleOpenWorkout(id: string) {
    router.push(getWorkoutHref(id));
  }

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
              <Text style={styles.eyebrow}>Biblioteca</Text>
              <Text style={styles.title}>Treinos</Text>
              <Text style={styles.description}>Escolha uma estrutura e continue forjando ritmo.</Text>
            </View>
            <Button
              title="Novo treino"
              loading={isCreating}
              style={styles.newWorkoutButton}
              onPress={() => void handleCreateWorkout()}
            />
          </View>

          {actionError ? (
            <Card padding={4} style={styles.inlineErrorCard}>
              <Text style={styles.stateText}>{actionError}</Text>
            </Card>
          ) : null}

          {isLoading ? (
            <Card padding={5} style={styles.stateCard}>
              <ActivityIndicator color={colors.brand.primary} />
              <Text style={styles.stateTitle}>Carregando treinos</Text>
              <Text style={styles.stateText}>Buscando sua biblioteca da Forja.</Text>
            </Card>
          ) : null}

          {!isLoading && error ? (
            <Card padding={5} style={styles.stateCard}>
              <Text style={styles.stateTitle}>Não foi possível carregar</Text>
              <Text style={styles.stateText}>{error}</Text>
              <Button title="Tentar novamente" variant="secondary" onPress={() => void refetch()} />
            </Card>
          ) : null}

          {!isLoading && !error && workouts ? (
            <>
              {activeWorkout ? (
                <Card variant="highlighted" padding={5}>
                  <View style={styles.featuredWorkout}>
                    <View style={styles.featuredHeader}>
                      <View style={styles.featuredPillGroup}>
                        <View style={styles.statusPillToday}>
                          <Text style={styles.statusPillText}>Treino do dia</Text>
                        </View>
                        <View style={styles.statusPillInProgress}>
                          <Text style={styles.statusPillText}>Em andamento</Text>
                        </View>
                      </View>
                      <Text style={styles.featuredDuration}>
                        {formatDuration(activeWorkout.estimatedDurationMinutes)}
                      </Text>
                    </View>
                    <View style={styles.featuredCopy}>
                      <Text style={styles.featuredTitle}>{activeWorkout.name}</Text>
                      <Text style={styles.description}>
                        {formatMuscleGroups(activeWorkout.muscleGroups)}
                      </Text>
                    </View>
                    <View style={styles.featuredMetaRow}>
                      <WorkoutStat label="Exercícios" value={activeWorkout.exerciseCount} />
                      <WorkoutStat
                        label="Duração"
                        value={formatDuration(activeWorkout.estimatedDurationMinutes)}
                      />
                    </View>
                    <Button
                      title="Iniciar treino"
                      disabled={!activeWorkout.id}
                      style={styles.startWorkoutButton}
                      onPress={() => handleOpenWorkout(activeWorkout.id)}
                    />
                  </View>
                </Card>
              ) : null}

              {hasSavedWorkouts ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Treinos salvos</Text>
                  <View style={styles.workoutList}>
                    {workouts.savedWorkouts.map((workout) => (
                      <WorkoutCard key={workout.id} workout={workout} onStart={handleOpenWorkout} />
                    ))}
                  </View>
                </View>
              ) : null}

              {!hasWorkouts ? (
                <Card padding={5} style={styles.stateCard}>
                  <Text style={styles.stateTitle}>Nenhum treino salvo</Text>
                  <Text style={styles.stateText}>Crie seu primeiro treino para começar a forjar ritmo.</Text>
                </Card>
              ) : null}
            </>
          ) : null}
        </View>
      </ScrollView>
      <BottomNavigation activeHref="/workouts" />
    </SafeAreaView>
  );
}

function WorkoutCard({
  workout,
  onStart,
}: {
  readonly workout: MobileWorkout;
  readonly onStart: (id: string) => void;
}) {
  const status = statusStyles[workout.status];

  return (
    <Card variant={workout.status === 'inProgress' ? 'highlighted' : 'default'} padding={4}>
      <View style={styles.workoutCard}>
        <View style={styles.workoutCardHeader}>
          <View style={styles.workoutTitleGroup}>
            <Text style={styles.cardTitle}>{workout.name}</Text>
            <Text style={styles.secondaryText}>{formatMuscleGroups(workout.muscleGroups)}</Text>
          </View>
          <View style={[styles.statusPill, status.container]}>
            <Text style={[styles.statusText, status.text]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.workoutMetaGrid}>
          <WorkoutStat label="Exercícios" value={workout.exerciseCount} />
          <WorkoutStat label="Duração" value={formatDuration(workout.estimatedDurationMinutes)} />
        </View>

        <Button
          title="Iniciar treino"
          disabled={!workout.id}
          variant="secondary"
          style={styles.workoutStartButton}
          onPress={() => onStart(workout.id)}
        />
      </View>
    </Card>
  );
}

function WorkoutStat({ label, value }: { readonly label: string; readonly value: string | number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function formatDuration(minutes: number): string {
  return `${minutes} min`;
}

function formatMuscleGroups(muscleGroups: readonly string[]): string {
  if (muscleGroups.length === 0) {
    return 'Grupos musculares não informados';
  }

  return muscleGroups.map(formatMuscleGroup).join(', ');
}

function formatMuscleGroup(muscleGroup: string): string {
  return muscleGroupLabels[muscleGroup] ?? muscleGroup;
}

function getWorkoutHref(id: string): Href {
  return `/workouts/${encodeURIComponent(id)}/execute` as Href;
}

const muscleGroupLabels: Record<string, string> = {
  Arms: 'Braços',
  Back: 'Costas',
  Cardio: 'Cardio',
  Chest: 'Peito',
  Core: 'Core',
  FullBody: 'Corpo inteiro',
  Glutes: 'Glúteos',
  Legs: 'Pernas',
  Other: 'Outros',
  Shoulders: 'Ombros',
} as const;

const statusStyles = {
  available: {
    label: 'Disponível',
    container: {
      borderColor: colors.border.default,
      backgroundColor: colors.surface.default,
    },
    text: {
      color: colors.text.secondary,
    },
  },
  inProgress: {
    label: 'Em andamento',
    container: {
      borderColor: colors.brand.primary,
      backgroundColor: colors.surface.default,
    },
    text: {
      color: colors.brand.primary,
    },
  },
  completed: {
    label: 'Concluído',
    container: {
      borderColor: colors.semantic.success,
      backgroundColor: colors.surface.default,
    },
    text: {
      color: colors.semantic.success,
    },
  },
} as const;

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
    gap: spacing[4],
  },
  headerCopy: {
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
  newWorkoutButton: {
    alignSelf: Platform.select({
      web: 'flex-start',
      default: 'stretch',
    }),
  },
  featuredWorkout: {
    gap: spacing[5],
  },
  featuredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[4],
  },
  featuredPillGroup: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  statusPillToday: {
    minHeight: componentSizes.badge.minHeight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[3],
    borderRadius: radius.circular,
    borderWidth: borders.width.default,
    borderColor: colors.gamification.level,
    backgroundColor: colors.surface.default,
  },
  statusPillInProgress: {
    minHeight: componentSizes.badge.minHeight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[3],
    borderRadius: radius.circular,
    borderWidth: borders.width.default,
    borderColor: colors.brand.primary,
    backgroundColor: colors.surface.default,
  },
  statusPillText: {
    ...typography.caption,
    color: colors.brand.primary,
  },
  featuredDuration: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  featuredCopy: {
    gap: spacing[2],
  },
  featuredTitle: {
    ...typography.title.main,
    color: colors.text.primary,
  },
  featuredMetaRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  startWorkoutButton: {
    alignSelf: Platform.select({
      web: 'flex-start',
      default: 'stretch',
    }),
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
  inlineErrorCard: {
    borderColor: colors.semantic.error,
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
  workoutList: {
    gap: spacing[4],
  },
  workoutCard: {
    gap: spacing[4],
  },
  workoutCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing[4],
  },
  workoutTitleGroup: {
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
  statusPill: {
    minHeight: componentSizes.badge.minHeight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[3],
    borderRadius: radius.circular,
    borderWidth: borders.width.default,
  },
  statusText: {
    ...typography.caption,
  },
  workoutMetaGrid: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  workoutStartButton: {
    alignSelf: Platform.select({
      web: 'flex-start',
      default: 'stretch',
    }),
  },
  stat: {
    flex: 1,
    gap: spacing[1],
    padding: spacing[3],
    borderRadius: radius.lg,
    borderWidth: borders.width.default,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.default,
  },
  statValue: {
    ...typography.number.compact,
    color: colors.text.primary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
});
