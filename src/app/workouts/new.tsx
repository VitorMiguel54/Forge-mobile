import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavigation, Button, Card } from '@/components';
import { useWorkoutBuilder } from '@/hooks/useWorkoutBuilder';
import type { AvailableExercise } from '@/services/workoutBuilderService';
import { borders, colors, componentSizes, radius, spacing, typography } from '@/theme';

const webContentMaxWidth = spacing[10] * spacing[5];

export default function NewWorkoutScreen() {
  const router = useRouter();
  const { actionError, createWorkout, error, exercises, isCreating, isLoading, refetch } =
    useWorkoutBuilder();
  const [name, setName] = useState('');
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<readonly string[]>([]);
  const [formError, setFormError] = useState<string>();

  async function handleCreate() {
    if (!name.trim()) {
      setFormError('Informe o nome do treino.');
      return;
    }

    if (selectedExerciseIds.length === 0) {
      setFormError('Escolha pelo menos um exercício.');
      return;
    }

    setFormError(undefined);
    const workoutId = await createWorkout({ name, exerciseIds: selectedExerciseIds });

    if (workoutId) {
      router.replace(`/workouts/${encodeURIComponent(workoutId)}/execute` as Href);
    }
  }

  function toggleExercise(exerciseId: string) {
    setSelectedExerciseIds((currentIds) =>
      currentIds.includes(exerciseId)
        ? currentIds.filter((id) => id !== exerciseId)
        : [...currentIds, exerciseId],
    );
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
            <Text style={styles.eyebrow}>Novo treino</Text>
            <Text style={styles.title}>Montar treino</Text>
            <Text style={styles.description}>Escolha exercícios reais disponíveis para este usuário.</Text>
          </View>

          <Card padding={5}>
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nome</Text>
                <TextInput
                  onChangeText={setName}
                  placeholder="Ex.: Treino A"
                  placeholderTextColor={colors.text.disabled}
                  style={styles.input}
                  value={name}
                />
              </View>
            </View>
          </Card>

          {isLoading ? (
            <Card padding={5} style={styles.stateCard}>
              <ActivityIndicator color={colors.brand.primary} />
              <Text style={styles.stateTitle}>Carregando exercícios</Text>
              <Text style={styles.stateText}>Buscando exercícios globais e customizados.</Text>
            </Card>
          ) : null}

          {!isLoading && error ? (
            <Card padding={5} style={styles.stateCard}>
              <Text style={styles.stateTitle}>Não foi possível carregar</Text>
              <Text style={styles.stateText}>{error}</Text>
              <Button title="Tentar novamente" variant="secondary" onPress={() => void refetch()} />
            </Card>
          ) : null}

          {!isLoading && !error ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Exercícios</Text>
                <Text style={styles.secondaryText}>{selectedExerciseIds.length} selecionados</Text>
              </View>

              {exercises.length > 0 ? (
                <View style={styles.exerciseList}>
                  {exercises.map((exercise) => (
                    <ExerciseOption
                      key={exercise.id}
                      exercise={exercise}
                      isSelected={selectedExerciseIds.includes(exercise.id)}
                      onPress={() => toggleExercise(exercise.id)}
                    />
                  ))}
                </View>
              ) : (
                <Card padding={5} style={styles.stateCard}>
                  <Text style={styles.stateTitle}>Nenhum exercício disponível</Text>
                  <Text style={styles.stateText}>
                    Cadastre exercícios globais ou customizados na API antes de montar um treino.
                  </Text>
                </Card>
              )}
            </View>
          ) : null}

          {formError || actionError ? (
            <Card padding={4} style={styles.errorCard}>
              <Text style={styles.stateText}>{formError ?? actionError}</Text>
            </Card>
          ) : null}

          <Button
            title="Criar e iniciar"
            disabled={isLoading || exercises.length === 0}
            loading={isCreating}
            onPress={() => void handleCreate()}
          />
        </View>
      </ScrollView>
      <BottomNavigation activeHref="/workouts" />
    </SafeAreaView>
  );
}

function ExerciseOption({
  exercise,
  isSelected,
  onPress,
}: {
  readonly exercise: AvailableExercise;
  readonly isSelected: boolean;
  readonly onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.exerciseOption,
        isSelected && styles.selectedExerciseOption,
        pressed && styles.pressedOption,
      ]}
    >
      <View style={styles.exerciseCopy}>
        <Text style={styles.cardTitle}>{exercise.name}</Text>
        <Text style={styles.secondaryText}>
          {formatMuscleGroup(exercise.muscleGroup)} · {exercise.isCustom ? 'Customizado' : 'Global'}
        </Text>
        {exercise.description ? <Text style={styles.secondaryText}>{exercise.description}</Text> : null}
      </View>
      <View style={isSelected ? styles.selectedMark : styles.emptyMark}>
        <Text style={styles.markText}>{isSelected ? 'OK' : ''}</Text>
      </View>
    </Pressable>
  );
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
  form: {
    gap: spacing[4],
  },
  inputGroup: {
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
  section: {
    gap: spacing[3],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  sectionTitle: {
    ...typography.title.section,
    color: colors.text.primary,
  },
  secondaryText: {
    ...typography.body.secondary,
    color: colors.text.secondary,
  },
  exerciseList: {
    gap: spacing[3],
  },
  exerciseOption: {
    minHeight: componentSizes.touchTarget.ios,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[4],
    borderRadius: radius.lg,
    borderWidth: borders.width.default,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.card,
  },
  selectedExerciseOption: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.surface.cardElevated,
  },
  pressedOption: {
    opacity: 0.86,
  },
  exerciseCopy: {
    flex: 1,
    gap: spacing[1],
  },
  cardTitle: {
    ...typography.title.card,
    color: colors.text.primary,
  },
  emptyMark: {
    width: componentSizes.avatar.sm,
    height: componentSizes.avatar.sm,
    borderRadius: radius.circular,
    borderWidth: borders.width.default,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.default,
  },
  selectedMark: {
    width: componentSizes.avatar.sm,
    height: componentSizes.avatar.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.circular,
    backgroundColor: colors.brand.primary,
  },
  markText: {
    ...typography.caption,
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
  errorCard: {
    borderColor: colors.semantic.error,
  },
});
