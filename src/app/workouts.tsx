import { useState } from 'react';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import {
  ActivityIndicator,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionConfirmModal, BottomNavigation, Button, Card, OrderControls } from '@/components';
import { ForgeSymbol } from '@/components/icons/ForgeSymbol';
import { useWorkouts } from '@/hooks/useWorkouts';
import type { MobileWorkout } from '@/services/workoutsService';
import { borders, colors, componentSizes, radius, spacing, typography } from '@/theme';

const webContentMaxWidth = spacing[10] * spacing[5];

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function WorkoutsScreen() {
  const router = useRouter();
  const { saved } = useLocalSearchParams<{ saved?: string }>();
  const {
    actionError,
    cancelWorkout,
    deleteWorkout,
    error,
    isCancellingId,
    isDeletingId,
    isLoading,
    isLoadingExercisesId,
    isReordering,
    isStartingId,
    loadWorkoutExercises,
    refetch,
    reorderWorkouts,
    startWorkout,
    successMessage,
    workoutExercisesByWorkoutId,
    workouts,
  } = useWorkouts();
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string>();
  const [deleteCandidate, setDeleteCandidate] = useState<MobileWorkout>();
  const [cancelCandidate, setCancelCandidate] = useState<MobileWorkout>();
  const activeWorkout = workouts?.activeWorkout;
  const savedWorkouts = workouts?.savedWorkouts ?? [];
  const hasWorkouts = Boolean(activeWorkout || savedWorkouts.length);
  const hasSavedWorkouts = savedWorkouts.length > 0;
  const feedbackMessage = saved === '1' ? 'Treino salvo com sucesso.' : successMessage;

  async function handleStartWorkout(id: string) {
    const startedWorkout = await startWorkout(id);

    if (startedWorkout?.id) {
      router.push(getWorkoutHref(startedWorkout.id));
    }
  }

  function handleEditWorkout(id: string) {
    router.push(`/workouts/new?workoutId=${encodeURIComponent(id)}` as Href);
  }

  function handleToggleWorkout(workout: MobileWorkout) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const nextExpandedId = expandedWorkoutId === workout.id ? undefined : workout.id;
    setExpandedWorkoutId(nextExpandedId);

    if (nextExpandedId && !workoutExercisesByWorkoutId[workout.id]) {
      void loadWorkoutExercises(workout.id);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteCandidate) {
      return;
    }

    const deleted = await deleteWorkout(deleteCandidate.id);
    if (deleted) {
      setExpandedWorkoutId((currentId) => (currentId === deleteCandidate.id ? undefined : currentId));
      setDeleteCandidate(undefined);
    }
  }

  async function handleConfirmCancel() {
    if (!cancelCandidate || isCancellingId === cancelCandidate.id) {
      return;
    }

    const cancelled = await cancelWorkout(cancelCandidate.id);

    if (cancelled) {
      setCancelCandidate(undefined);
    }
  }

  async function handleMoveWorkout(workoutId: string, direction: -1 | 1) {
    if (isReordering) {
      return;
    }

    const nextWorkouts = moveWorkoutByDirection(savedWorkouts, workoutId, direction);
    if (nextWorkouts === savedWorkouts) {
      return;
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    await reorderWorkouts(nextWorkouts);
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
              style={styles.newWorkoutButton}
              onPress={() => router.push('/workouts/new' as Href)}
            />
          </View>

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
                      {activeWorkout.estimatedDurationMinutes > 0 ? (
                        <Text style={styles.featuredDuration}>
                          {formatDuration(activeWorkout.estimatedDurationMinutes)}
                        </Text>
                      ) : null}
                    </View>
                    <View style={styles.featuredCopy}>
                      <Text style={styles.featuredTitle}>{activeWorkout.name}</Text>
                      <Text style={styles.description}>
                        {formatMuscleGroups(activeWorkout.muscleGroups)}
                      </Text>
                    </View>
                    <View style={styles.featuredMetaRow}>
                      <WorkoutStat label="Exercícios" value={activeWorkout.exerciseCount} />
                      {activeWorkout.estimatedDurationMinutes > 0 ? (
                        <WorkoutStat
                          label="Duração"
                          value={formatDuration(activeWorkout.estimatedDurationMinutes)}
                        />
                      ) : null}
                    </View>
                    <View style={styles.featuredActions}>
                      <Button
                        title={isStartingId === activeWorkout.id ? 'Abrindo...' : 'Continuar treino'}
                        disabled={
                          !activeWorkout.id
                          || isStartingId === activeWorkout.id
                          || isCancellingId === activeWorkout.id
                        }
                        style={styles.featuredActionButton}
                        onPress={() => void handleStartWorkout(activeWorkout.id)}
                      />
                      <Button
                        title={isCancellingId === activeWorkout.id ? 'Cancelando...' : 'Cancelar treino'}
                        disabled={
                          !activeWorkout.id
                          || isStartingId === activeWorkout.id
                          || isCancellingId === activeWorkout.id
                        }
                        variant="secondary"
                        style={[styles.featuredActionButton, styles.cancelWorkoutButton]}
                        onPress={() => setCancelCandidate(activeWorkout)}
                      />
                    </View>
                  </View>
                </Card>
              ) : null}

              {actionError ? (
                <Card padding={4} style={[styles.feedbackCard, styles.errorCard]}>
                  <Text style={styles.stateText}>{actionError}</Text>
                </Card>
              ) : null}

              {feedbackMessage ? (
                <Card padding={4} style={[styles.feedbackCard, styles.successCard]}>
                  <Text style={styles.stateText}>{feedbackMessage}</Text>
                </Card>
              ) : null}

              {hasSavedWorkouts ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Treinos salvos</Text>
                  <View style={styles.workoutList}>
                    {savedWorkouts.map((workout, index) => (
                      <WorkoutCard
                        key={workout.id}
                        canMoveDown={index < savedWorkouts.length - 1}
                        canMoveUp={index > 0}
                        exerciseSummaries={workoutExercisesByWorkoutId[workout.id] ?? []}
                        isDeleting={isDeletingId === workout.id}
                        isExpanded={expandedWorkoutId === workout.id}
                        isLoadingExercises={isLoadingExercisesId === workout.id}
                        isReordering={isReordering}
                        isStarting={isStartingId === workout.id}
                        workout={workout}
                        onDelete={() => setDeleteCandidate(workout)}
                        onEdit={() => handleEditWorkout(workout.id)}
                        onMoveDown={() => void handleMoveWorkout(workout.id, 1)}
                        onMoveUp={() => void handleMoveWorkout(workout.id, -1)}
                        onStart={() => void handleStartWorkout(workout.id)}
                        onToggle={() => handleToggleWorkout(workout)}
                      />
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
      <DeleteWorkoutModal
        isDeleting={Boolean(deleteCandidate && isDeletingId === deleteCandidate.id)}
        workout={deleteCandidate}
        onCancel={() => setDeleteCandidate(undefined)}
        onConfirm={() => void handleConfirmDelete()}
      />
      <ActionConfirmModal
        destructive
        cancelLabel="Voltar"
        confirmLabel={cancelCandidate && isCancellingId === cancelCandidate.id ? 'Cancelando...' : 'Cancelar treino'}
        isBusy={Boolean(cancelCandidate && isCancellingId === cancelCandidate.id)}
        message="O progresso registrado neste treino será perdido."
        onCancel={() => setCancelCandidate(undefined)}
        onConfirm={() => void handleConfirmCancel()}
        title="Cancelar treino?"
        visible={Boolean(cancelCandidate)}
      />
      <BottomNavigation activeHref="/workouts" />
    </SafeAreaView>
  );
}

function WorkoutCard({
  canMoveDown,
  canMoveUp,
  exerciseSummaries,
  isDeleting,
  isExpanded,
  isLoadingExercises,
  isReordering,
  isStarting,
  onDelete,
  onEdit,
  onMoveDown,
  onMoveUp,
  onStart,
  onToggle,
  workout,
}: {
  readonly canMoveDown: boolean;
  readonly canMoveUp: boolean;
  readonly exerciseSummaries: readonly {
    readonly id: string;
    readonly name: string;
    readonly muscleGroup: string;
  }[];
  readonly isDeleting: boolean;
  readonly isExpanded: boolean;
  readonly isLoadingExercises: boolean;
  readonly isReordering: boolean;
  readonly isStarting: boolean;
  readonly onDelete: () => void;
  readonly onEdit: () => void;
  readonly onMoveDown: () => void;
  readonly onMoveUp: () => void;
  readonly onStart: () => void;
  readonly onToggle: () => void;
  readonly workout: MobileWorkout;
}) {
  const status = statusStyles[workout.status];
  const canRunAction = !isStarting && !isDeleting && !isReordering;

  return (
    <Card variant={workout.status === 'inProgress' ? 'highlighted' : 'default'} padding={3}>
      <View style={styles.workoutCard}>
        <View style={styles.compactCardRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: isExpanded }}
            disabled={isReordering}
            onPress={onToggle}
            style={({ pressed }) => [styles.compactCardTrigger, pressed && styles.pressed]}
          >
            <View style={styles.workoutTitleGroup}>
              <Text numberOfLines={1} style={styles.compactTitle}>
                {workout.name}
              </Text>
              <Text numberOfLines={1} style={styles.compactSummary}>
                {buildCompactSummary(workout)}
              </Text>
            </View>
            <View style={[styles.statusPill, status.container]}>
              <Text style={[styles.statusText, status.text]}>{status.label}</Text>
            </View>
          </Pressable>
          <OrderControls
            canMoveDown={canMoveDown}
            canMoveUp={canMoveUp}
            disabled={isReordering}
            onMoveDown={onMoveDown}
            onMoveUp={onMoveUp}
          />
          <Pressable
            accessibilityLabel={isExpanded ? 'Recolher treino' : 'Expandir treino'}
            accessibilityRole="button"
            accessibilityState={{ expanded: isExpanded }}
            onPress={onToggle}
            style={({ pressed }) => [styles.expandButton, pressed && styles.pressed]}
          >
            <ForgeSymbol
              color={colors.text.secondary}
              fallback={isExpanded ? '^' : 'v'}
              name={{
                ios: isExpanded ? 'chevron.up' : 'chevron.down',
                android: isExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down',
                web: isExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down',
              }}
              size={22}
            />
          </Pressable>
        </View>

        {isExpanded ? (
          <View style={styles.expandedContent}>
            {isLoadingExercises ? (
              <View style={styles.inlineLoading}>
                <ActivityIndicator color={colors.brand.primary} />
                <Text style={styles.secondaryText}>Carregando exercícios</Text>
              </View>
            ) : (
              <View style={styles.exerciseSummaryList}>
                {exerciseSummaries.length > 0 ? (
                  exerciseSummaries.slice(0, 6).map((exercise, index) => (
                    <View key={exercise.id} style={styles.exerciseSummaryItem}>
                      <View style={styles.exerciseSummaryOrderBadge}>
                        <Text style={styles.exerciseSummaryOrderText}>{index + 1}</Text>
                      </View>
                      <View style={styles.exerciseSummaryCopy}>
                        <Text numberOfLines={1} style={styles.exerciseSummaryName}>{exercise.name}</Text>
                        <Text numberOfLines={1} style={styles.exerciseSummaryGroup}>{exercise.muscleGroup}</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.secondaryText}>Nenhum exercício vinculado a este treino.</Text>
                )}
                {exerciseSummaries.length > 6 ? (
                  <Text style={styles.secondaryText}>+{exerciseSummaries.length - 6} exercícios</Text>
                ) : null}
              </View>
            )}

            <View style={styles.expandedActions}>
              <Button
                title={isStarting ? 'Iniciando...' : 'Iniciar treino'}
                disabled={!workout.id || !canRunAction}
                style={styles.actionButton}
                onPress={onStart}
              />
              <Button
                title="Editar"
                disabled={!canRunAction}
                variant="secondary"
                style={styles.actionButton}
                onPress={onEdit}
              />
              <Button
                title={isDeleting ? 'Excluindo...' : 'Excluir'}
                disabled={!canRunAction}
                variant="secondary"
                style={styles.actionButton}
                onPress={onDelete}
              />
            </View>
          </View>
        ) : null}
      </View>
    </Card>
  );
}

function DeleteWorkoutModal({
  isDeleting,
  onCancel,
  onConfirm,
  workout,
}: {
  readonly isDeleting: boolean;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
  readonly workout?: MobileWorkout;
}) {
  return (
    <Modal transparent animationType="fade" visible={Boolean(workout)} onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <Card padding={5} style={styles.modalCard}>
          <Text style={styles.stateTitle}>Excluir treino salvo?</Text>
          <Text style={styles.stateText}>
            {workout
              ? `O treino "${workout.name}" sairá da lista de salvos e não poderá ser iniciado novamente. Execuções concluídas, séries, cargas, XP e histórico permanecem preservados.`
              : ''}
          </Text>
          <View style={styles.modalActions}>
            <Button
              title="Cancelar"
              disabled={isDeleting}
              variant="secondary"
              style={styles.modalButton}
              onPress={onCancel}
            />
            <Button
              title={isDeleting ? 'Excluindo...' : 'Excluir'}
              disabled={isDeleting}
              style={styles.modalButton}
              onPress={onConfirm}
            />
          </View>
        </Card>
      </View>
    </Modal>
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
    return 'Grupos a definir';
  }

  return muscleGroups.map(formatMuscleGroup).join(', ');
}

function buildCompactSummary(workout: MobileWorkout): string {
  const segments = [formatCompactMuscleGroups(workout.muscleGroups), formatExerciseCount(workout.exerciseCount)];

  if (workout.estimatedDurationMinutes > 0) {
    segments.push(formatDuration(workout.estimatedDurationMinutes));
  }

  return segments.join(' · ');
}

function moveWorkoutByDirection(
  workouts: readonly MobileWorkout[],
  workoutId: string,
  direction: -1 | 1,
): readonly MobileWorkout[] {
  const currentIndex = workouts.findIndex((workout) => workout.id === workoutId);

  if (currentIndex < 0) {
    return workouts;
  }

  const nextIndex = currentIndex + direction;
  if (nextIndex < 0 || nextIndex >= workouts.length) {
    return workouts;
  }

  const nextWorkouts = [...workouts];
  const [workout] = nextWorkouts.splice(currentIndex, 1);
  nextWorkouts.splice(nextIndex, 0, workout);
  return renumberWorkouts(nextWorkouts);
}

function renumberWorkouts(workouts: readonly MobileWorkout[]): readonly MobileWorkout[] {
  return workouts.map((workout, index) => ({
    ...workout,
    displayOrder: index + 1,
  }));
}

function formatCompactMuscleGroups(muscleGroups: readonly string[]): string {
  const formattedGroups = muscleGroups.map(formatMuscleGroup);

  if (formattedGroups.length === 0) {
    return 'Grupos a definir';
  }

  if (formattedGroups.length === 1) {
    return formattedGroups[0];
  }

  if (formattedGroups.length === 2) {
    return `${formattedGroups[0]} e ${formattedGroups[1].toLowerCase()}`;
  }

  return `${formattedGroups[0]}, ${formattedGroups[1].toLowerCase()} +${formattedGroups.length - 2}`;
}

function formatExerciseCount(count: number): string {
  return count === 1 ? '1 exercício' : `${count} exercícios`;
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
  Biceps: 'Bíceps',
  Cardio: 'Cardio',
  Chest: 'Peito',
  Core: 'Abdômen',
  FullBody: 'Corpo inteiro',
  Glutes: 'Glúteos',
  Legs: 'Pernas',
  Other: 'Outros',
  Shoulders: 'Ombros',
  Triceps: 'Tríceps',
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
  cancelled: {
    label: 'Cancelado',
    container: {
      borderColor: colors.text.disabled,
      backgroundColor: colors.surface.default,
    },
    text: {
      color: colors.text.disabled,
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
    ...typography.screenTitle,
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
    ...typography.screenTitle,
    color: colors.text.primary,
  },
  featuredMetaRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  featuredActions: {
    flexDirection: Platform.select({
      web: 'row',
      default: 'column',
    }),
    gap: spacing[3],
  },
  featuredActionButton: {
    flex: 1,
  },
  cancelWorkoutButton: {
    borderColor: colors.semantic.error,
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
  feedbackCard: {
    alignItems: 'center',
  },
  errorCard: {
    borderColor: colors.semantic.error,
  },
  successCard: {
    borderColor: colors.semantic.success,
  },
  workoutList: {
    gap: spacing[3],
  },
  workoutCard: {
    gap: spacing[3],
  },
  compactCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  compactCardTrigger: {
    flex: 1,
    minHeight: componentSizes.touchTarget.global,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
    paddingVertical: 0,
  },
  expandButton: {
    width: componentSizes.touchTarget.global,
    height: componentSizes.touchTarget.global,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutTitleGroup: {
    flex: 1,
    minWidth: 0,
    alignSelf: 'center',
    gap: spacing[1],
  },
  compactTitle: {
    ...typography.cardTitle,
    color: colors.text.primary,
  },
  compactSummary: {
    ...typography.caption,
    color: colors.text.secondary,
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
  expandedContent: {
    gap: spacing[4],
    paddingTop: spacing[3],
    borderTopWidth: borders.width.default,
    borderTopColor: colors.border.default,
  },
  inlineLoading: {
    minHeight: componentSizes.touchTarget.global,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  exerciseSummaryList: {
    gap: spacing[2],
  },
  exerciseSummaryItem: {
    minHeight: componentSizes.touchTarget.global,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  exerciseSummaryOrderBadge: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.circular,
    backgroundColor: colors.surface.default,
  },
  exerciseSummaryOrderText: {
    ...typography.caption,
    lineHeight: 14,
    color: colors.gamification.level,
  },
  exerciseSummaryCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing[1],
  },
  exerciseSummaryName: {
    ...typography.body.default,
    color: colors.text.primary,
  },
  exerciseSummaryGroup: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  expandedActions: {
    flexDirection: Platform.select({
      web: 'row',
      default: 'column',
    }),
    gap: spacing[2],
  },
  actionButton: {
    flex: 1,
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
    ...typography.metric.compact,
    color: colors.text.primary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
    backgroundColor: 'rgba(0, 0, 0, 0.58)',
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    gap: spacing[4],
  },
  modalActions: {
    flexDirection: Platform.select({
      web: 'row',
      default: 'column',
    }),
    gap: spacing[3],
  },
  modalButton: {
    flex: 1,
  },
  pressed: {
    opacity: 0.84,
  },
});
