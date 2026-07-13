import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavigation, Button, Card } from '@/components';
import { useWorkoutExecution } from '@/hooks/useWorkoutExecution';
import type { WorkoutExecutionExercise, WorkoutExecutionSet } from '@/services/workoutExecutionService';
import { borders, colors, componentSizes, radius, spacing, typography } from '@/theme';

const webContentMaxWidth = spacing[10] * spacing[5];

export default function WorkoutExecutionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const workoutId = Array.isArray(params.id) ? params.id[0] : params.id;
  const {
    execution,
    actionError,
    currentExerciseIndex,
    error,
    finish,
    goToNextExercise,
    goToPreviousExercise,
    isFinishing,
    isLoading,
    isRegistering,
    refetch,
    registerExistingSet,
    registerNewSet,
    registeredSetIds,
    successMessage,
  } = useWorkoutExecution(workoutId);
  const currentExercise = execution?.exercises[currentExerciseIndex];
  const [draftRepetitions, setDraftRepetitions] = useState('');
  const [draftWeight, setDraftWeight] = useState('');
  const [draftNotes, setDraftNotes] = useState('');
  const [draftError, setDraftError] = useState<string>();

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
    const finished = await finish();

    if (finished) {
      router.replace('/history' as Href);
    }
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
                              isRegistered={registeredSetIds.has(set.id)}
                              isRegistering={isRegistering}
                              set={set}
                              onRegister={() => void registerExistingSet(set)}
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
                            loading={isRegistering}
                            onPress={() => void handleAddSet(currentExercise)}
                          />
                        </View>
                      </Card>
                    </View>
                  </Card>

                  <Button
                    title="Finalizar treino"
                    loading={isFinishing}
                    style={styles.finishButton}
                    onPress={() => void handleFinish()}
                  />
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
      <BottomNavigation activeHref="/workouts" />
    </SafeAreaView>
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
  isRegistered,
  isRegistering,
  onRegister,
  set,
}: {
  readonly isRegistered: boolean;
  readonly isRegistering: boolean;
  readonly onRegister: () => void;
  readonly set: WorkoutExecutionSet;
}) {
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

      <Button
        title={isRegistered ? 'Registrar novamente' : 'Registrar execução'}
        variant="secondary"
        loading={isRegistering}
        onPress={onRegister}
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
    ...typography.title.main,
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
    ...typography.title.main,
    color: colors.text.primary,
  },
  sectionTitle: {
    ...typography.title.section,
    color: colors.text.primary,
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
    ...typography.caption,
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
  finishButton: {
    alignSelf: Platform.select({
      web: 'flex-start',
      default: 'stretch',
    }),
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
});
