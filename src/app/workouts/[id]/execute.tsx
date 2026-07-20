import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionConfirmModal, BottomNavigation, Button, Card } from '@/components';
import { useWorkoutExecution } from '@/hooks/useWorkoutExecution';
import type {
  WorkoutCompletionSummary,
  WorkoutExecutionExercise,
  WorkoutExecutionSet,
} from '@/services/workoutExecutionService';
import { borders, colors, componentSizes, radius, spacing, typography } from '@/theme';

const webContentMaxWidth = spacing[10] * spacing[5];
const incompleteWorkoutMessage =
  'Todos os exercícios precisam ter pelo menos uma série registrada antes de finalizar o treino.';

type FinishValidationError = {
  readonly title: string;
  readonly message: string;
  readonly exerciseNames: readonly string[];
};

export default function WorkoutExecutionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const workoutId = Array.isArray(params.id) ? params.id[0] : params.id;
  const {
    execution,
    actionError,
    currentExerciseIndex,
    error,
    cancel,
    deleteSet,
    finish,
    goToNextExercise,
    goToPreviousExercise,
    isFinishing,
    isLoading,
    isRegistering,
    refetch,
    registerNewSet,
    registeredSetIds,
    successMessage,
    updateSet,
  } = useWorkoutExecution(workoutId);
  const currentExercise = execution?.exercises[currentExerciseIndex];
  const [draftRepetitions, setDraftRepetitions] = useState('');
  const [draftWeight, setDraftWeight] = useState('');
  const [draftNotes, setDraftNotes] = useState('');
  const [draftError, setDraftError] = useState<string>();
  const [completionSummary, setCompletionSummary] = useState<WorkoutCompletionSummary>();
  const [finishValidationError, setFinishValidationError] = useState<FinishValidationError>();
  const [isFinishConfirmOpen, setIsFinishConfirmOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  async function handleAddSet(exercise: WorkoutExecutionExercise) {
    const repetitions = Number(draftRepetitions.replace(',', '.'));
    const weight = Number(draftWeight.replace(',', '.'));

    if (!Number.isFinite(repetitions) || repetitions <= 0 || !Number.isFinite(weight) || weight < 0) {
      setDraftError('Informe repetições e carga válidas.');
      return;
    }

    setDraftError(undefined);
    await registerNewSet(exercise.id, {
      setNumber: getNextSetNumber(exercise.sets),
      repetitions,
      weight,
      notes: draftNotes,
    });
    setDraftRepetitions('');
    setDraftWeight('');
    setDraftNotes('');
  }

  async function handleFinish() {
    if (!execution || execution.workout.isFinalized || isFinishing) {
      return;
    }

    const incompleteExercises = execution.exercises.filter((exercise) => exercise.sets.length === 0);

    if (incompleteExercises.length > 0) {
      setFinishValidationError({
        title: 'Treino incompleto',
        message: incompleteWorkoutMessage,
        exerciseNames: incompleteExercises.map((exercise) => exercise.name),
      });
      return;
    }

    setFinishValidationError(undefined);
    setIsFinishConfirmOpen(true);
  }

  async function handleConfirmFinish() {
    if (isFinishing) {
      return;
    }

    const summary = await finish();

    if (summary) {
      setIsFinishConfirmOpen(false);
      setCompletionSummary(summary);
      return;
    }

    setIsFinishConfirmOpen(false);
  }

  function handleCancelFinish() {
    if (!isFinishing) {
      setIsFinishConfirmOpen(false);
    }
  }

  function handleCancelWorkout() {
    if (!execution || execution.workout.isFinalized || isFinishing) {
      return;
    }

    setIsCancelConfirmOpen(true);
  }

  async function handleConfirmCancelWorkout() {
    if (isFinishing) {
      return;
    }

    const cancelled = await cancel();

    if (cancelled) {
      setIsCancelConfirmOpen(false);
      router.replace('/workouts' as Href);
      return;
    }

    setIsCancelConfirmOpen(false);
  }

  function handleCloseCancelWorkout() {
    if (!isFinishing) {
      setIsCancelConfirmOpen(false);
    }
  }

  function handleCloseCompletionModal() {
    setCompletionSummary(undefined);
    router.replace('/history' as Href);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.page}>
          {isLoading ? (
            <Card padding={5} style={styles.stateCard}>
              <ActivityIndicator color={colors.brand.primary} />
              <Text style={styles.stateTitle}>Carregando execução</Text>
              <Text style={styles.stateText}>Buscando exercícios e séries reais do treino.</Text>
            </Card>
          ) : null}

          {!isLoading && error ? (
            <Card padding={5} style={styles.stateCard}>
              <Text style={styles.stateTitle}>Não foi possível carregar</Text>
              <Text style={styles.stateText}>{error}</Text>
              <Button title="Tentar novamente" variant="secondary" onPress={() => void refetch()} />
            </Card>
          ) : null}

          {!isLoading && !error && execution ? (
            <>
              <View style={styles.header}>
                <Text style={styles.eyebrow}>Execução</Text>
                <Text style={styles.title}>{execution.workout.name}</Text>
                <Text style={styles.description}>
                  {execution.exercises.length} exercícios carregados da API.
                </Text>
              </View>

              {actionError || draftError || successMessage ? (
                <Card
                  padding={4}
                  style={[
                    styles.feedbackCard,
                    actionError || draftError ? styles.errorCard : styles.successCard,
                  ]}
                >
                  <Text style={styles.stateText}>{actionError ?? draftError ?? successMessage}</Text>
                </Card>
              ) : null}

              {currentExercise ? (
                <>
                  <ExerciseNavigator
                    currentIndex={currentExerciseIndex}
                    exerciseCount={execution.exercises.length}
                    onNext={goToNextExercise}
                    onPrevious={goToPreviousExercise}
                  />

                  <Card variant="highlighted" padding={5}>
                    <View style={styles.exerciseCard}>
                      <View style={styles.exerciseHeader}>
                        <View style={styles.exerciseCopy}>
                          <Text style={styles.eyebrow}>Exercício {currentExerciseIndex + 1}</Text>
                          <Text style={styles.exerciseTitle}>{currentExercise.name}</Text>
                          {currentExercise.muscleGroup ? (
                            <Text style={styles.secondaryText}>
                              {formatMuscleGroup(currentExercise.muscleGroup)}
                            </Text>
                          ) : null}
                        </View>
                        <View style={styles.statusPill}>
                          <Text style={styles.statusText}>{currentExercise.sets.length} séries</Text>
                        </View>
                      </View>

                      {currentExercise.notes ? (
                        <Text style={styles.secondaryText}>{currentExercise.notes}</Text>
                      ) : null}

                      <View style={styles.setList}>
                        {currentExercise.sets.length > 0 ? (
                          currentExercise.sets.map((set) => (
                            <WorkoutSetRow
                              key={set.id}
                              isFinalized={execution.workout.isFinalized}
                              isRegistered={registeredSetIds.has(set.id)}
                              isRegistering={isRegistering}
                              set={set}
                              onDelete={(setId) => void deleteSet(setId)}
                              onUpdate={(setId, input) => void updateSet(setId, input)}
                            />
                          ))
                        ) : (
                          <Card padding={4} style={styles.emptySetsCard}>
                            <Text style={styles.stateTitle}>Nenhuma série registrada</Text>
                            <Text style={styles.stateText}>
                              Registre a primeira série usando os campos abaixo.
                            </Text>
                          </Card>
                        )}
                      </View>

                      <Card padding={4} style={styles.addSetCard}>
                        <View style={styles.addSetForm}>
                          <Text style={styles.sectionTitle}>Registrar nova série</Text>
                          <View style={styles.inputRow}>
                            <LabeledInput
                              label="Repetições"
                              value={draftRepetitions}
                              onChangeText={setDraftRepetitions}
                            />
                            <LabeledInput
                              label="Carga"
                              value={draftWeight}
                              onChangeText={setDraftWeight}
                            />
                          </View>
                          <LabeledInput
                            label="Observações"
                            value={draftNotes}
                            onChangeText={setDraftNotes}
                            keyboardType="default"
                          />
                          <Button
                            title="Registrar série"
                            disabled={execution.workout.isFinalized}
                            loading={isRegistering}
                            onPress={() => void handleAddSet(currentExercise)}
                          />
                        </View>
                      </Card>
                    </View>
                  </Card>

                  <ExerciseNavigator
                    currentIndex={currentExerciseIndex}
                    exerciseCount={execution.exercises.length}
                    onNext={goToNextExercise}
                    onPrevious={goToPreviousExercise}
                  />

                  <View style={styles.workoutActionRow}>
                    <Button
                      title="Cancelar treino"
                      disabled={execution.workout.isFinalized || isFinishing}
                      variant="secondary"
                      style={[styles.workoutActionButton, styles.cancelWorkoutButton]}
                      onPress={handleCancelWorkout}
                    />
                    <Button
                      title="Finalizar treino"
                      disabled={execution.workout.isFinalized || isFinishing}
                      loading={isFinishing && isFinishConfirmOpen}
                      style={styles.workoutActionButton}
                      onPress={() => void handleFinish()}
                    />
                  </View>
                </>
              ) : (
                <Card padding={5} style={styles.stateCard}>
                  <Text style={styles.stateTitle}>Nenhum exercício no treino</Text>
                  <Text style={styles.stateText}>
                    A execução começa quando o treino possui exercícios retornados pela API.
                  </Text>
                </Card>
              )}
            </>
          ) : null}
        </View>
      </ScrollView>
      <WorkoutCompletionModal
        onClose={handleCloseCompletionModal}
        summary={completionSummary}
      />
      <ActionConfirmModal
        confirmLabel={isFinishing ? 'Finalizando...' : 'Finalizar treino'}
        isBusy={isFinishing}
        message="Depois de finalizado, o treino não poderá ser alterado."
        onCancel={handleCancelFinish}
        onConfirm={() => void handleConfirmFinish()}
        title="Finalizar treino?"
        visible={isFinishConfirmOpen}
      />
      <ActionConfirmModal
        destructive
        confirmLabel={isFinishing ? 'Cancelando...' : 'Cancelar treino'}
        cancelLabel="Voltar"
        isBusy={isFinishing}
        message="O progresso registrado neste treino será perdido."
        onCancel={handleCloseCancelWorkout}
        onConfirm={() => void handleConfirmCancelWorkout()}
        title="Cancelar treino?"
        visible={isCancelConfirmOpen}
      />
      <ActionConfirmModal
        items={finishValidationError?.exerciseNames}
        message={finishValidationError?.message ?? ''}
        onCancel={() => setFinishValidationError(undefined)}
        title={finishValidationError?.title ?? 'Treino incompleto'}
        visible={Boolean(finishValidationError)}
      />
      <BottomNavigation activeHref="/workouts" />
    </SafeAreaView>
  );
}

function WorkoutCompletionModal({
  onClose,
  summary,
}: {
  readonly onClose: () => void;
  readonly summary?: WorkoutCompletionSummary;
}) {
  const leveledUp = summary ? summary.newLevel > summary.previousLevel : false;

  return (
    <Modal animationType="fade" transparent visible={Boolean(summary)} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Card padding={5} style={styles.completionModalCard}>
          {summary ? (
            <View style={styles.completionContent}>
              <View style={styles.completionHeader}>
                <Text style={styles.eyebrow}>Treino concluído</Text>
                <Text style={styles.completionTitle}>Resumo da evolução</Text>
                <Text style={styles.secondaryText}>
                  Dados atualizados pela Forge API após a finalização.
                </Text>
              </View>

              <View style={styles.completionStatsGrid}>
                <CompletionStat label="XP ganho" value={`+${summary.xpGained}`} />
                <CompletionStat label="XP total" value={summary.totalXp} />
              </View>

              <View style={styles.levelSummary}>
                <Text style={styles.levelTitle}>Nível</Text>
                <Text style={styles.secondaryText}>
                  {leveledUp
                    ? `${summary.previousLevel} → ${summary.newLevel}`
                    : `Permaneceu no nível ${summary.newLevel}`}
                </Text>
              </View>

              {summary.unlockedAchievements.length > 0 ? (
                <View style={styles.completionSection}>
                  <Text style={styles.achievementSectionTitle}>Conquistas desbloqueadas</Text>
                  <View style={styles.unlockedAchievementList}>
                    {summary.unlockedAchievements.map((achievement) => (
                      <View key={achievement.id} style={styles.unlockedAchievementItem}>
                        <Text style={styles.achievementTitle}>{achievement.name}</Text>
                        <Text style={styles.secondaryText}>{achievement.description}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              <Button title="Ver histórico" onPress={onClose} />
            </View>
          ) : null}
        </Card>
      </View>
    </Modal>
  );
}

function CompletionStat({ label, value }: { readonly label: string; readonly value: string | number }) {
  return (
    <View style={styles.completionStat}>
      <Text style={styles.completionStatValue}>{value}</Text>
      <Text style={styles.completionStatLabel}>{label}</Text>
    </View>
  );
}

function ExerciseNavigator({
  currentIndex,
  exerciseCount,
  onNext,
  onPrevious,
}: {
  readonly currentIndex: number;
  readonly exerciseCount: number;
  readonly onNext: () => void;
  readonly onPrevious: () => void;
}) {
  return (
    <View style={styles.navigator}>
      <Button
        title="Anterior"
        variant="secondary"
        disabled={currentIndex === 0}
        onPress={onPrevious}
        style={styles.navigatorButton}
      />
      <Text style={styles.navigatorText}>
        {currentIndex + 1} de {exerciseCount}
      </Text>
      <Button
        title="Próximo"
        variant="secondary"
        disabled={currentIndex >= exerciseCount - 1}
        onPress={onNext}
        style={styles.navigatorButton}
      />
    </View>
  );
}

function WorkoutSetRow({
  isFinalized,
  isRegistered,
  isRegistering,
  onDelete,
  onUpdate,
  set,
}: {
  readonly isFinalized: boolean;
  readonly isRegistered: boolean;
  readonly isRegistering: boolean;
  readonly onDelete: (setId: string) => void;
  readonly onUpdate: (
    setId: string,
    input: {
      readonly setNumber: number;
      readonly repetitions: number;
      readonly weight: number;
      readonly notes?: string;
    },
  ) => void;
  readonly set: WorkoutExecutionSet;
}) {
  const [setNumber, setSetNumber] = useState(String(set.setNumber));
  const [repetitions, setRepetitions] = useState(String(set.repetitions));
  const [weight, setWeight] = useState(String(set.weight));
  const [notes, setNotes] = useState(set.notes ?? '');
  const [rowError, setRowError] = useState<string>();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  function handleDelete() {
    setIsDeleteConfirmOpen(true);
  }

  function handleConfirmDelete() {
    setIsDeleteConfirmOpen(false);
    onDelete(set.id);
  }

  function handleUpdate() {
    const nextSetNumber = Number(setNumber.replace(',', '.'));
    const nextRepetitions = Number(repetitions.replace(',', '.'));
    const nextWeight = Number(weight.replace(',', '.'));

    if (
      !Number.isFinite(nextSetNumber) ||
      nextSetNumber <= 0 ||
      !Number.isFinite(nextRepetitions) ||
      nextRepetitions <= 0 ||
      !Number.isFinite(nextWeight) ||
      nextWeight < 0
    ) {
      setRowError('Informe série, repetições e carga válidas.');
      return;
    }

    setRowError(undefined);
    onUpdate(set.id, {
      setNumber: nextSetNumber,
      repetitions: nextRepetitions,
      weight: nextWeight,
      notes,
    });
  }

  return (
    <Card padding={4} style={styles.setCard}>
      <View style={styles.setHeader}>
        <View>
          <Text style={styles.cardTitle}>Série {set.setNumber}</Text>
          <Text style={styles.secondaryText}>
            {set.repetitions} reps · {formatWeight(set.weight)}
          </Text>
        </View>
        <View style={isRegistered ? styles.registeredPill : styles.pendingPill}>
          <Text style={styles.statusText}>{isRegistered ? 'Registrada' : 'Pendente'}</Text>
        </View>
      </View>

      {set.notes ? <Text style={styles.secondaryText}>{set.notes}</Text> : null}

      <View style={styles.editSetGrid}>
        <LabeledInput label="Série" value={setNumber} onChangeText={setSetNumber} />
        <LabeledInput label="Repetições" value={repetitions} onChangeText={setRepetitions} />
        <LabeledInput label="Carga" value={weight} onChangeText={setWeight} />
      </View>
      <LabeledInput label="Observações" value={notes} onChangeText={setNotes} keyboardType="default" />

      {rowError ? <Text style={styles.errorText}>{rowError}</Text> : null}

      <View style={styles.setActions}>
        <Button
          title={isRegistered ? 'Salvar novamente' : 'Salvar série'}
          variant="secondary"
          disabled={isFinalized}
          loading={isRegistering}
          onPress={handleUpdate}
          style={styles.setActionButton}
        />
        <Button
          title="Excluir"
          variant="outline"
          disabled={isFinalized}
          onPress={handleDelete}
          style={styles.setActionButton}
        />
      </View>
      <ActionConfirmModal
        confirmLabel="Excluir"
        message="A série será removida do treino."
        onCancel={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Excluir série?"
        visible={isDeleteConfirmOpen}
      />
    </Card>
  );
}

function LabeledInput({
  keyboardType = 'decimal-pad',
  label,
  onChangeText,
  value,
}: {
  readonly keyboardType?: 'decimal-pad' | 'default';
  readonly label: string;
  readonly onChangeText: (value: string) => void;
  readonly value: string;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholderTextColor={colors.text.disabled}
        style={styles.input}
        value={value}
      />
    </View>
  );
}

function getNextSetNumber(sets: readonly WorkoutExecutionSet[]): number {
  return sets.reduce((maxSetNumber, set) => Math.max(maxSetNumber, set.setNumber), 0) + 1;
}

function formatWeight(weight: number): string {
  return `${new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 1,
    minimumFractionDigits: Number.isInteger(weight) ? 0 : 1,
  }).format(weight)} kg`;
}

function formatMuscleGroup(muscleGroup: string): string {
  return muscleGroupLabels[muscleGroup] ?? muscleGroup;
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
    ...typography.screenTitle,
    color: colors.text.primary,
  },
  description: {
    ...typography.body.secondary,
    color: colors.text.secondary,
  },
  feedbackCard: {
    borderColor: colors.border.default,
  },
  errorCard: {
    borderColor: colors.semantic.error,
  },
  successCard: {
    borderColor: colors.semantic.success,
  },
  navigator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  navigatorButton: {
    flex: 1,
  },
  navigatorText: {
    ...typography.caption,
    color: colors.text.secondary,
    minWidth: spacing[10],
    textAlign: 'center',
  },
  exerciseCard: {
    gap: spacing[5],
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing[4],
  },
  exerciseCopy: {
    flex: 1,
    gap: spacing[2],
  },
  exerciseTitle: {
    ...typography.screenTitle,
    color: colors.text.primary,
  },
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.gamification.level,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  cardTitle: {
    ...typography.cardTitle,
    color: colors.text.primary,
  },
  levelTitle: {
    ...typography.gamification.level,
    color: colors.gamification.level,
  },
  achievementSectionTitle: {
    ...typography.sectionTitle,
    color: colors.gamification.level,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  achievementTitle: {
    ...typography.sectionTitle,
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
    borderColor: colors.brand.primary,
    backgroundColor: colors.surface.default,
  },
  pendingPill: {
    minHeight: componentSizes.badge.minHeight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[3],
    borderRadius: radius.circular,
    borderWidth: borders.width.default,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.default,
  },
  registeredPill: {
    minHeight: componentSizes.badge.minHeight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[3],
    borderRadius: radius.circular,
    borderWidth: borders.width.default,
    borderColor: colors.semantic.success,
    backgroundColor: colors.surface.default,
  },
  statusText: {
    ...typography.caption,
    color: colors.text.primary,
  },
  setList: {
    gap: spacing[3],
  },
  setCard: {
    gap: spacing[3],
  },
  setHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  editSetGrid: {
    flexDirection: Platform.select({
      web: 'row',
      default: 'column',
    }),
    gap: spacing[3],
  },
  setActions: {
    flexDirection: Platform.select({
      web: 'row',
      default: 'column',
    }),
    gap: spacing[3],
  },
  setActionButton: {
    flex: 1,
  },
  errorText: {
    ...typography.body.secondary,
    color: colors.semantic.error,
  },
  emptySetsCard: {
    alignItems: 'center',
    gap: spacing[2],
  },
  addSetCard: {
    borderColor: colors.material.steel,
  },
  addSetForm: {
    gap: spacing[4],
  },
  inputRow: {
    flexDirection: Platform.select({
      web: 'row',
      default: 'column',
    }),
    gap: spacing[3],
  },
  inputGroup: {
    flex: 1,
    gap: spacing[2],
  },
  inputLabel: {
    ...typography.label,
    color: colors.text.secondary,
  },
  input: {
    minHeight: componentSizes.buttonHeight.lg,
    borderRadius: radius.lg,
    borderWidth: borders.width.default,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.default,
    color: colors.text.primary,
    paddingHorizontal: spacing[3],
    ...typography.body.default,
  },
  workoutActionRow: {
    flexDirection: Platform.select({
      web: 'row',
      default: 'column',
    }),
    gap: spacing[3],
  },
  workoutActionButton: {
    flex: 1,
  },
  cancelWorkoutButton: {
    borderColor: colors.semantic.error,
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
    backgroundColor: 'rgba(0, 0, 0, 0.64)',
  },
  completionModalCard: {
    width: '100%',
    maxWidth: spacing[10] * spacing[4],
  },
  completionContent: {
    gap: spacing[5],
  },
  completionHeader: {
    gap: spacing[2],
  },
  completionTitle: {
    ...typography.identity.guardian,
    color: colors.text.primary,
  },
  completionStatsGrid: {
    flexDirection: Platform.select({
      web: 'row',
      default: 'column',
    }),
    gap: spacing[3],
  },
  completionStat: {
    flex: 1,
    gap: spacing[1],
    padding: spacing[3],
    borderRadius: radius.lg,
    borderWidth: borders.width.default,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.default,
  },
  completionStatValue: {
    ...typography.metric.compact,
    color: colors.text.primary,
  },
  completionStatLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  levelSummary: {
    gap: spacing[1],
    padding: spacing[4],
    borderRadius: radius.lg,
    borderWidth: borders.width.default,
    borderColor: colors.gamification.level,
    backgroundColor: colors.surface.default,
  },
  completionSection: {
    gap: spacing[3],
  },
  unlockedAchievementList: {
    gap: spacing[3],
  },
  unlockedAchievementItem: {
    gap: spacing[1],
    padding: spacing[3],
    borderRadius: radius.lg,
    borderWidth: borders.width.default,
    borderColor: colors.gamification.achievement,
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
