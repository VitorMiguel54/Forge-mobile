import { useMemo, useState } from 'react';
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
import { ForgeSymbol } from '@/components/icons/ForgeSymbol';
import { useWorkoutBuilder } from '@/hooks/useWorkoutBuilder';
import type { AvailableExercise, MuscleGroupOption, WorkoutBuilderWorkout } from '@/services/workoutBuilderService';
import { borders, colors, componentSizes, radius, shadows, spacing, typography } from '@/theme';

type BuilderMode = 'idle' | 'existing' | 'new';
type ExerciseFilter = string;

const webContentMaxWidth = spacing[10] * spacing[5];

export default function NewWorkoutScreen() {
  const {
    actionError,
    error,
    exercises,
    isLoading,
    isLoadingWorkout,
    isSaving,
    loadWorkoutExercises,
    muscleGroups,
    refetch,
    saveWorkout,
    successMessage,
    workouts,
  } = useWorkoutBuilder();
  const [mode, setMode] = useState<BuilderMode>('idle');
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>();
  const [workoutName, setWorkoutName] = useState('');
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<readonly string[]>([]);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<readonly string[]>([]);
  const [workoutSearch, setWorkoutSearch] = useState('');
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [exerciseFilter, setExerciseFilter] = useState<ExerciseFilter>('all');
  const [isWorkoutPickerOpen, setIsWorkoutPickerOpen] = useState(false);
  const [draggedExerciseId, setDraggedExerciseId] = useState<string>();
  const [formError, setFormError] = useState<string>();

  const filteredWorkouts = useMemo(
    () => filterWorkouts(workouts, workoutSearch),
    [workoutSearch, workouts],
  );
  const quickFilters = useMemo(
    () => buildQuickFilters(muscleGroups, selectedMuscleGroups),
    [muscleGroups, selectedMuscleGroups],
  );
  const availableExercises = useMemo(
    () =>
      filterExercises({
        exercises,
        filter: exerciseFilter,
        mode,
        search: exerciseSearch,
        selectedMuscleGroups,
      }),
    [exerciseFilter, exerciseSearch, exercises, mode, selectedMuscleGroups],
  );
  const selectedExercises = useMemo(
    () =>
      selectedExerciseIds
        .map((exerciseId) => exercises.find((exercise) => exercise.id === exerciseId))
        .filter((exercise): exercise is AvailableExercise => exercise !== undefined),
    [exercises, selectedExerciseIds],
  );
  const selectedGroupLabels = getSelectedGroupLabels(selectedMuscleGroups, selectedExercises, muscleGroups);

  async function handleSelectWorkout(workout: WorkoutBuilderWorkout) {
    setMode('existing');
    setSelectedWorkoutId(workout.id);
    setWorkoutName(workout.name);
    setSelectedMuscleGroups(getMuscleGroupIdsFromLabels(workout.muscleGroups, muscleGroups));
    setWorkoutSearch(workout.name);
    setIsWorkoutPickerOpen(false);
    setFormError(undefined);

    const links = await loadWorkoutExercises(workout.id);
    const linkedExerciseIds = links.map((link) => link.exerciseId);
    setSelectedExerciseIds(linkedExerciseIds);
    setSelectedMuscleGroups(
      getMuscleGroupIdsFromExercises(linkedExerciseIds, exercises, workout.muscleGroups, muscleGroups),
    );
  }

  function handleChangeWorkout() {
    setMode('idle');
    setSelectedWorkoutId(undefined);
    setWorkoutName('');
    setSelectedMuscleGroups([]);
    setSelectedExerciseIds([]);
    setWorkoutSearch('');
    setExerciseSearch('');
    setExerciseFilter('all');
    setIsWorkoutPickerOpen(false);
    setFormError(undefined);
  }

  function handleCreateNewWorkout() {
    setMode('new');
    setSelectedWorkoutId(undefined);
    setWorkoutName(workoutSearch.trim());
    setSelectedMuscleGroups([]);
    setSelectedExerciseIds([]);
    setWorkoutSearch('');
    setIsWorkoutPickerOpen(false);
    setExerciseFilter('all');
    setFormError(undefined);
  }

  function toggleMuscleGroup(groupId: string) {
    setSelectedMuscleGroups((currentGroups) =>
      currentGroups.includes(groupId)
        ? currentGroups.filter((group) => group !== groupId)
        : [...currentGroups, groupId],
    );
  }

  function toggleExercise(exerciseId: string) {
    setSelectedExerciseIds((currentIds) =>
      currentIds.includes(exerciseId)
        ? currentIds.filter((id) => id !== exerciseId)
        : [...currentIds, exerciseId],
    );
  }

  function moveExercise(exerciseId: string, direction: -1 | 1) {
    setSelectedExerciseIds((currentIds) => {
      const currentIndex = currentIds.indexOf(exerciseId);
      const nextIndex = currentIndex + direction;

      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= currentIds.length) {
        return currentIds;
      }

      const nextIds = [...currentIds];
      [nextIds[currentIndex], nextIds[nextIndex]] = [nextIds[nextIndex], nextIds[currentIndex]];
      return nextIds;
    });
  }

  function moveDraggedExercise(targetExerciseId: string) {
    if (!draggedExerciseId || draggedExerciseId === targetExerciseId) {
      return;
    }

    setSelectedExerciseIds((currentIds) => {
      const draggedIndex = currentIds.indexOf(draggedExerciseId);
      const targetIndex = currentIds.indexOf(targetExerciseId);

      if (draggedIndex < 0 || targetIndex < 0) {
        return currentIds;
      }

      const nextIds = [...currentIds];
      const [draggedId] = nextIds.splice(draggedIndex, 1);
      nextIds.splice(targetIndex, 0, draggedId);
      return nextIds;
    });
    setDraggedExerciseId(undefined);
  }

  async function handleSave() {
    const name = workoutName.trim();

    if (!name) {
      setFormError('Informe o nome do treino.');
      return;
    }

    if (mode === 'new' && selectedMuscleGroups.length === 0) {
      setFormError('Selecione pelo menos um grupo muscular.');
      return;
    }

    if (selectedExerciseIds.length === 0) {
      setFormError('Escolha pelo menos um exercÃ­cio.');
      return;
    }

    setFormError(undefined);
    const savedWorkoutId = await saveWorkout({
      exerciseIds: selectedExerciseIds,
      name,
      workoutId: selectedWorkoutId,
    });

    if (savedWorkoutId) {
      setMode('existing');
      setSelectedWorkoutId(savedWorkoutId);
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
          <View style={styles.header}>
            <Text style={styles.eyebrow}>Gerenciador</Text>
            <View style={styles.titleRow}>
              <Text style={styles.title}>
                {mode === 'existing' ? 'Editar treino' : mode === 'new' ? 'Criar treino' : 'Treinos'}
              </Text>
              {mode !== 'idle' ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={handleChangeWorkout}
                  style={({ pressed }) => [styles.changeWorkoutButton, pressed && styles.pressed]}
                >
                  <Text style={styles.changeWorkoutText}>Trocar treino</Text>
                </Pressable>
              ) : null}
            </View>
            <Text style={styles.description}>
              {mode === 'idle'
                ? 'Escolha se deseja criar um novo treino ou editar uma estrutura existente.'
                : 'Organize o conteÃºdo do treino sem repetir escolhas jÃ¡ feitas.'}
            </Text>
          </View>

          {isLoading ? (
            <Card padding={5} style={styles.stateCard}>
              <ActivityIndicator color={colors.brand.primary} />
              <Text style={styles.stateTitle}>Carregando treinos</Text>
              <Text style={styles.stateText}>Buscando biblioteca e exercÃ­cios disponÃ­veis.</Text>
            </Card>
          ) : null}

          {!isLoading && error ? (
            <Card padding={5} style={styles.stateCard}>
              <Text style={styles.stateTitle}>NÃ£o foi possÃ­vel carregar</Text>
              <Text style={styles.stateText}>{error}</Text>
              <Button title="Tentar novamente" variant="secondary" onPress={() => void refetch()} />
            </Card>
          ) : null}

          {!isLoading && !error ? (
            <>
              {mode === 'idle' ? (
              <Section title="Selecionar ou criar treino">
                <View style={styles.comboBox}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setIsWorkoutPickerOpen((isOpen) => !isOpen)}
                    style={styles.comboTrigger}
                  >
                    <View style={styles.comboCopy}>
                      <Text style={styles.inputLabel}>Selecionar ou criar treino</Text>
                      <Text numberOfLines={1} style={styles.comboValue}>
                        Escolha um treino
                      </Text>
                    </View>
                    <ForgeSymbol
                      color={colors.brand.primary}
                      fallback="v"
                      name={{ ios: 'chevron.down', android: 'keyboard_arrow_down', web: 'keyboard_arrow_down' }}
                      size={24}
                    />
                  </Pressable>

                  {isWorkoutPickerOpen ? (
                    <Card padding={4} style={styles.dropdown}>
                      <TextInput
                        onChangeText={setWorkoutSearch}
                        placeholder="Pesquisar treino..."
                        placeholderTextColor={colors.text.disabled}
                        style={styles.input}
                        value={workoutSearch}
                      />

                      <Pressable
                        accessibilityRole="button"
                        onPress={handleCreateNewWorkout}
                        style={({ pressed }) => [styles.createOption, pressed && styles.pressed]}
                      >
                        <ForgeSymbol
                          color={colors.brand.primary}
                          fallback="+"
                          name={{ ios: 'plus', android: 'add', web: 'add' }}
                          size={24}
                          weight="semibold"
                        />
                        <Text style={styles.createOptionText}>Criar novo treino</Text>
                      </Pressable>

                      <View style={styles.workoutOptions}>
                        {filteredWorkouts.map((workout) => (
                          <WorkoutOption
                            key={workout.id}
                            isSelected={workout.id === selectedWorkoutId}
                            workout={workout}
                            onPress={() => void handleSelectWorkout(workout)}
                          />
                        ))}
                      </View>
                    </Card>
                  ) : null}
                </View>
              </Section>
              ) : null}

              {mode !== 'idle' ? (
                <>
                  <View style={styles.editorBlock}>
                    <Card padding={4} style={styles.editorCard}>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Nome do treino</Text>
                        <TextInput
                          onChangeText={setWorkoutName}
                          placeholder="Ex.: Treino C"
                          placeholderTextColor={colors.text.disabled}
                          style={styles.input}
                          value={workoutName}
                        />
                      </View>

                      <View style={styles.workoutSummary}>
                        <Text style={styles.summaryName}>{workoutName.trim() || 'Treino sem nome'}</Text>
                        <Text style={styles.secondaryText}>
                          {selectedGroupLabels.length > 0
                            ? selectedGroupLabels.join(' â€¢ ')
                            : 'Grupos musculares serÃ£o definidos pelos exercÃ­cios.'}
                        </Text>
                        <Text style={styles.secondaryText}>{selectedExerciseIds.length} exercÃ­cios</Text>
                      </View>
                    </Card>
                  </View>

                  {mode === 'new' ? (
                    <Section title="Grupos musculares">
                      <View style={styles.chipGrid}>
                        {muscleGroups.map((group) => {
                          const isSelected = selectedMuscleGroups.includes(group.id);

                          return (
                            <Pressable
                              key={group.id}
                              accessibilityRole="checkbox"
                              accessibilityState={{ checked: isSelected }}
                              onPress={() => toggleMuscleGroup(group.id)}
                              style={({ pressed }) => [
                                styles.groupChip,
                                isSelected && styles.groupChipSelected,
                                pressed && styles.pressed,
                              ]}
                            >
                              <Text style={[styles.groupChipText, isSelected && styles.groupChipTextSelected]}>
                                {group.displayName}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                      {muscleGroups.length === 0 ? (
                        <Card padding={5} style={styles.stateCard}>
                          <Text style={styles.stateTitle}>Nenhum grupo muscular encontrado</Text>
                          <Text style={styles.stateText}>
                            Execute as migrations e o seed da Forge API para carregar o catálogo oficial.
                          </Text>
                        </Card>
                      ) : null}
                    </Section>
                  ) : null}

                  <Section title="ExercÃ­cios">
                    <View style={styles.toolbar}>
                      <TextInput
                        onChangeText={setExerciseSearch}
                        placeholder="Buscar exercÃ­cio..."
                        placeholderTextColor={colors.text.disabled}
                        style={styles.input}
                        value={exerciseSearch}
                      />

                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.filterRow}>
                          {quickFilters.map((filter) => {
                            const isSelected = exerciseFilter === filter.id;

                            return (
                              <Pressable
                                key={filter.id}
                                accessibilityRole="button"
                                onPress={() => setExerciseFilter(filter.id)}
                                style={({ pressed }) => [
                                  styles.filterChip,
                                  isSelected && styles.filterChipSelected,
                                  pressed && styles.pressed,
                                ]}
                              >
                                <Text style={[styles.filterText, isSelected && styles.filterTextSelected]}>
                                  {filter.label}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </View>
                      </ScrollView>

                      <View style={styles.counterRow}>
                        <Text style={styles.counterText}>{availableExercises.length} exercÃ­cios encontrados</Text>
                        {selectedExerciseIds.length > 0 ? (
                          <Text style={styles.counterText}>{selectedExerciseIds.length} selecionados</Text>
                        ) : (
                          <Text style={styles.counterMuted}>Nenhum exercÃ­cio selecionado</Text>
                        )}
                      </View>
                    </View>

                    {isLoadingWorkout ? (
                      <Card padding={5} style={styles.stateCard}>
                        <ActivityIndicator color={colors.brand.primary} />
                        <Text style={styles.stateText}>Carregando exercÃ­cios do treino.</Text>
                      </Card>
                    ) : null}

                    <View style={styles.exerciseList}>
                      {availableExercises.map((exercise) => (
                        <ExerciseCatalogItem
                          key={exercise.id}
                          exercise={exercise}
                          isSelected={selectedExerciseIds.includes(exercise.id)}
                          onPress={() => toggleExercise(exercise.id)}
                        />
                      ))}
                    </View>

                    {availableExercises.length === 0 ? (
                      <Card padding={5} style={styles.stateCard}>
                        <Text style={styles.stateTitle}>Nenhum exercÃ­cio encontrado</Text>
                        <Text style={styles.stateText}>
                          Ajuste a busca ou os filtros para encontrar exercÃ­cios disponÃ­veis.
                        </Text>
                      </Card>
                    ) : null}
                  </Section>

                  <Section title="Ordem do treino">
                    {selectedExercises.length > 0 ? (
                      <View style={styles.selectedList}>
                        {selectedExercises.map((exercise, index) => (
                          <SelectedExerciseItem
                            key={exercise.id}
                            canMoveDown={index < selectedExercises.length - 1}
                            canMoveUp={index > 0}
                            exercise={exercise}
                            index={index}
                            onDragEnd={() => setDraggedExerciseId(undefined)}
                            onDragEnter={() => moveDraggedExercise(exercise.id)}
                            onDragStart={() => setDraggedExerciseId(exercise.id)}
                            onMoveDown={() => moveExercise(exercise.id, 1)}
                            onMoveUp={() => moveExercise(exercise.id, -1)}
                            onRemove={() => toggleExercise(exercise.id)}
                          />
                        ))}
                      </View>
                    ) : (
                      <Card padding={5} style={styles.stateCard}>
                        <Text style={styles.stateTitle}>Selecione exercÃ­cios</Text>
                        <Text style={styles.stateText}>
                          A sequÃªncia salva aqui serÃ¡ usada na execuÃ§Ã£o do treino.
                        </Text>
                      </Card>
                    )}
                  </Section>

                  <Section title="Resumo">
                    <Card padding={4} style={styles.summaryCard}>
                      <Text style={styles.summaryName}>{workoutName.trim() || 'Treino sem nome'}</Text>
                      <Text style={styles.secondaryText}>
                        {selectedGroupLabels.length > 0 ? selectedGroupLabels.join(' â€¢ ') : 'Sem grupos definidos'}
                      </Text>
                      <Text style={styles.secondaryText}>{selectedExercises.length} exercÃ­cios</Text>

                      <View style={styles.summaryExerciseList}>
                        {selectedExercises.map((exercise, index) => (
                          <Text key={exercise.id} style={styles.summaryExerciseText}>
                            {index + 1}. {exercise.name}
                          </Text>
                        ))}
                      </View>
                    </Card>
                  </Section>

                  {formError || actionError || successMessage ? (
                    <Card
                      padding={4}
                      style={[
                        styles.feedbackCard,
                        formError || actionError ? styles.errorCard : styles.successCard,
                      ]}
                    >
                      <Text style={styles.stateText}>{formError ?? actionError ?? successMessage}</Text>
                    </Card>
                  ) : null}

                  <Button
                    title="Salvar treino"
                    loading={isSaving}
                    disabled={isLoadingWorkout || isSaving}
                    onPress={() => void handleSave()}
                  />
                </>
              ) : null}
            </>
          ) : null}
        </View>
      </ScrollView>
      <BottomNavigation activeHref="/workouts" />
    </SafeAreaView>
  );
}

function Section({ children, title }: { readonly children: React.ReactNode; readonly title: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function WorkoutOption({
  isSelected,
  onPress,
  workout,
}: {
  readonly isSelected: boolean;
  readonly onPress: () => void;
  readonly workout: WorkoutBuilderWorkout;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.workoutOption,
        isSelected && styles.workoutOptionSelected,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.workoutOptionCopy}>
        <Text style={styles.cardTitle}>{workout.name}</Text>
        <Text style={styles.secondaryText}>{formatMuscleGroups(workout.muscleGroups)}</Text>
      </View>
      <Text style={styles.optionMeta}>{workout.exerciseCount} exercÃ­cios</Text>
    </Pressable>
  );
}

function ExerciseCatalogItem({
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
        styles.exerciseCard,
        isSelected && styles.exerciseCardSelected,
        pressed && styles.pressed,
      ]}
    >
      <ExerciseMediaPlaceholder exercise={exercise} />
      <View style={styles.exerciseCopy}>
        <Text numberOfLines={2} style={styles.cardTitle}>
          {exercise.name}
        </Text>
        <Text numberOfLines={1} style={styles.secondaryText}>
          {formatExerciseMuscleGroup(exercise)}
        </Text>
      </View>
      <View style={isSelected ? styles.selectedMark : styles.emptyMark}>
        {isSelected ? (
          <ForgeSymbol
            color={colors.text.primary}
            fallback="âœ“"
            name={{ ios: 'checkmark', android: 'check', web: 'check' }}
            size={16}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

function ExerciseMediaPlaceholder({ exercise }: { readonly exercise: AvailableExercise }) {
  return (
    <View style={styles.mediaPlaceholder}>
      <Text style={styles.mediaInitial}>{exercise.name[0]?.toUpperCase() ?? 'F'}</Text>
    </View>
  );
}

function SelectedExerciseItem({
  canMoveDown,
  canMoveUp,
  exercise,
  index,
  onDragEnd,
  onDragEnter,
  onDragStart,
  onMoveDown,
  onMoveUp,
  onRemove,
}: {
  readonly canMoveDown: boolean;
  readonly canMoveUp: boolean;
  readonly exercise: AvailableExercise;
  readonly index: number;
  readonly onDragEnd: () => void;
  readonly onDragEnter: () => void;
  readonly onDragStart: () => void;
  readonly onMoveDown: () => void;
  readonly onMoveUp: () => void;
  readonly onRemove: () => void;
}) {
  const dragProps = getDragProps(onDragStart, onDragEnter, onDragEnd);

  return (
    <View {...dragProps} style={styles.selectedExerciseCard}>
      <View style={styles.orderBadge}>
        <Text style={styles.orderText}>{index + 1}</Text>
      </View>
      <ExerciseMediaPlaceholder exercise={exercise} />
      <View style={styles.exerciseCopy}>
        <Text numberOfLines={2} style={styles.cardTitle}>
          {exercise.name}
        </Text>
        <Text numberOfLines={1} style={styles.secondaryText}>
          {formatExerciseMuscleGroup(exercise)}
        </Text>
      </View>
      <View style={styles.reorderActions}>
        <Pressable
          accessibilityRole="button"
          disabled={!canMoveUp}
          onPress={onMoveUp}
          style={[styles.iconButton, !canMoveUp && styles.disabledButton]}
        >
          <ForgeSymbol
            color={canMoveUp ? colors.text.primary : colors.text.disabled}
            fallback="â†‘"
            name={{ ios: 'chevron.up', android: 'keyboard_arrow_up', web: 'keyboard_arrow_up' }}
            size={20}
          />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={!canMoveDown}
          onPress={onMoveDown}
          style={[styles.iconButton, !canMoveDown && styles.disabledButton]}
        >
          <ForgeSymbol
            color={canMoveDown ? colors.text.primary : colors.text.disabled}
            fallback="â†“"
            name={{ ios: 'chevron.down', android: 'keyboard_arrow_down', web: 'keyboard_arrow_down' }}
            size={20}
          />
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onRemove} style={styles.iconButton}>
          <ForgeSymbol
            color={colors.semantic.error}
            fallback="x"
            name={{ ios: 'xmark', android: 'close', web: 'close' }}
            size={20}
          />
        </Pressable>
      </View>
    </View>
  );
}

function getDragProps(
  onDragStart: () => void,
  onDragEnter: () => void,
  onDragEnd: () => void,
): Record<string, unknown> {
  if (Platform.OS !== 'web') {
    return {};
  }

  return {
    draggable: true,
    onDragEnd,
    onDragEnter,
    onDragOver: preventDefault,
    onDragStart,
    onDrop: preventDefault,
  };
}

function preventDefault(event: unknown) {
  if (event && typeof event === 'object' && 'preventDefault' in event) {
    const prevent = event.preventDefault;

    if (typeof prevent === 'function') {
      prevent.call(event);
    }
  }
}

function filterWorkouts(
  workouts: readonly WorkoutBuilderWorkout[],
  search: string,
): readonly WorkoutBuilderWorkout[] {
  const normalizedSearch = normalizeText(search);

  if (!normalizedSearch) {
    return workouts;
  }

  return workouts.filter((workout) =>
    [workout.name, ...workout.muscleGroups.map(formatMuscleGroup)]
      .some((value) => normalizeText(value).includes(normalizedSearch)),
  );
}

function buildQuickFilters(
  muscleGroups: readonly MuscleGroupOption[],
  selectedMuscleGroups: readonly string[],
): readonly { readonly id: ExerciseFilter; readonly label: string }[] {
  const sourceGroups = selectedMuscleGroups.length > 0
    ? muscleGroups.filter((group) => selectedMuscleGroups.includes(group.id))
    : muscleGroups;

  return [
    { id: 'all', label: 'Todos' },
    ...sourceGroups.slice(0, 4).map((group) => ({ id: group.id, label: group.displayName })),
    { id: 'favorites', label: 'Favoritos' },
  ];
}

function filterExercises({
  exercises,
  filter,
  mode,
  search,
  selectedMuscleGroups,
}: {
  readonly exercises: readonly AvailableExercise[];
  readonly filter: ExerciseFilter;
  readonly mode: BuilderMode;
  readonly search: string;
  readonly selectedMuscleGroups: readonly string[];
}): readonly AvailableExercise[] {
  const normalizedSearch = normalizeText(search);

  return exercises.filter((exercise) => {
    if (
      mode === 'new'
      && selectedMuscleGroups.length > 0
      && (!exercise.muscleGroupId || !selectedMuscleGroups.includes(exercise.muscleGroupId))
    ) {
      return false;
    }

    if (filter !== 'all') {
      if (filter === 'favorites') {
        return false;
      }

      if (exercise.muscleGroupId !== filter) {
        return false;
      }
    }

    if (!normalizedSearch) {
      return true;
    }

    return normalizeText(`${exercise.name} ${formatExerciseMuscleGroup(exercise)}`).includes(normalizedSearch);
  });
}

function getSelectedGroupLabels(
  selectedMuscleGroups: readonly string[],
  selectedExercises: readonly AvailableExercise[],
  muscleGroups: readonly MuscleGroupOption[],
): readonly string[] {
  if (selectedMuscleGroups.length > 0) {
    return selectedMuscleGroups.map((groupId) => formatMuscleGroupId(groupId, muscleGroups));
  }

  const groups = new Map<string, string>();

  selectedExercises.forEach((exercise) => {
    const key = exercise.muscleGroupId ?? exercise.muscleGroup;
    groups.set(key, formatExerciseMuscleGroup(exercise));
  });

  return [...groups.values()];
}

function formatMuscleGroups(muscleGroups: readonly string[]): string {
  return muscleGroups.length > 0
    ? muscleGroups.map(formatMuscleGroup).join(' â€¢ ')
    : 'Grupos nÃ£o informados';
}

function formatMuscleGroup(muscleGroup: string): string {
  return muscleGroupLabels[muscleGroup] ?? muscleGroup;
}

function formatMuscleGroupId(muscleGroupId: string, muscleGroups: readonly MuscleGroupOption[]): string {
  return muscleGroups.find((muscleGroup) => muscleGroup.id === muscleGroupId)?.displayName ?? muscleGroupId;
}

function formatExerciseMuscleGroup(exercise: AvailableExercise): string {
  return exercise.muscleGroupDisplayName ?? formatMuscleGroup(exercise.muscleGroup);
}

function getMuscleGroupIdsFromLabels(
  labels: readonly string[],
  muscleGroups: readonly MuscleGroupOption[],
): readonly string[] {
  const normalizedLabels = new Set(labels.map(normalizeText));

  return muscleGroups
    .filter((muscleGroup) =>
      normalizedLabels.has(normalizeText(muscleGroup.displayName))
      || normalizedLabels.has(normalizeText(muscleGroup.name)),
    )
    .map((muscleGroup) => muscleGroup.id);
}

function getMuscleGroupIdsFromExercises(
  exerciseIds: readonly string[],
  exercises: readonly AvailableExercise[],
  fallbackLabels: readonly string[],
  muscleGroups: readonly MuscleGroupOption[],
): readonly string[] {
  const ids = new Set<string>();

  exerciseIds.forEach((exerciseId) => {
    const exercise = exercises.find((currentExercise) => currentExercise.id === exerciseId);

    if (exercise?.muscleGroupId) {
      ids.add(exercise.muscleGroupId);
    }
  });

  if (ids.size > 0) {
    return [...ids];
  }

  return getMuscleGroupIdsFromLabels(fallbackLabels, muscleGroups);
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

const muscleGroupLabels: Record<string, string> = {
  Arms: 'BraÃ§os',
  Back: 'Costas',
  Biceps: 'BÃ­ceps',
  Cardio: 'Cardio',
  Chest: 'Peito',
  Core: 'AbdÃ´men',
  FullBody: 'Corpo inteiro',
  Glutes: 'GlÃºteo',
  Legs: 'Pernas',
  Other: 'Outros',
  Shoulders: 'Ombro',
  Triceps: 'TrÃ­ceps',
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
    paddingBottom: componentSizes.bottomNavigation.height + spacing[10],
  },
  page: {
    width: '100%',
    maxWidth: Platform.select({
      web: webContentMaxWidth,
      default: undefined,
    }),
    gap: spacing[8],
  },
  header: {
    gap: spacing[2],
  },
  titleRow: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  eyebrow: {
    ...typography.label,
    color: colors.brand.primary,
    textTransform: 'uppercase',
  },
  title: {
    ...typography.screenTitle,
    color: colors.text.primary,
    flexShrink: 1,
  },
  changeWorkoutButton: {
    minHeight: componentSizes.badge.minHeight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[3],
    borderRadius: radius.circular,
    borderWidth: borders.width.default,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.default,
  },
  changeWorkoutText: {
    ...typography.label,
    color: colors.brand.primary,
  },
  description: {
    ...typography.body.secondary,
    color: colors.text.secondary,
  },
  section: {
    gap: spacing[4],
  },
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.gamification.level,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  comboBox: {
    gap: spacing[3],
  },
  comboTrigger: {
    minHeight: componentSizes.buttonHeight.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
    padding: spacing[4],
    borderRadius: radius.lg,
    borderWidth: borders.width.default,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.card,
  },
  comboCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing[1],
  },
  comboValue: {
    ...typography.cardTitle,
    color: colors.text.primary,
  },
  dropdown: {
    gap: spacing[3],
    backgroundColor: colors.surface.card,
    boxShadow: shadows.card,
  },
  createOption: {
    minHeight: componentSizes.touchTarget.global,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[3],
    borderRadius: radius.lg,
    borderWidth: borders.width.default,
    borderColor: colors.brand.primary,
    backgroundColor: colors.surface.default,
  },
  createOptionText: {
    ...typography.button,
    color: colors.brand.primary,
  },
  workoutOptions: {
    gap: spacing[2],
  },
  workoutOption: {
    minHeight: componentSizes.touchTarget.global,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[3],
    borderRadius: radius.lg,
    borderWidth: borders.width.default,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.default,
  },
  workoutOptionSelected: {
    borderColor: colors.brand.primary,
  },
  workoutOptionCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing[1],
  },
  optionMeta: {
    ...typography.label,
    color: colors.text.secondary,
  },
  editorCard: {
    gap: spacing[4],
  },
  editorBlock: {
    width: '100%',
  },
  inputGroup: {
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
  workoutSummary: {
    gap: spacing[1],
    paddingTop: spacing[3],
    borderTopWidth: borders.width.default,
    borderTopColor: colors.border.default,
  },
  summaryName: {
    ...typography.cardTitle,
    color: colors.text.primary,
  },
  secondaryText: {
    ...typography.body.secondary,
    color: colors.text.secondary,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  groupChip: {
    minHeight: componentSizes.chip.height,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[3],
    borderRadius: radius.circular,
    borderWidth: borders.width.default,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.card,
  },
  groupChipSelected: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.surface.cardElevated,
  },
  groupChipText: {
    ...typography.label,
    color: colors.text.secondary,
  },
  groupChipTextSelected: {
    color: colors.text.primary,
  },
  toolbar: {
    gap: spacing[3],
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  filterChip: {
    minHeight: componentSizes.chip.height,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[3],
    borderRadius: radius.circular,
    borderWidth: borders.width.default,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.card,
  },
  filterChipSelected: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.surface.cardElevated,
  },
  filterText: {
    ...typography.label,
    color: colors.text.secondary,
  },
  filterTextSelected: {
    color: colors.text.primary,
  },
  counterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing[2],
  },
  counterText: {
    ...typography.label,
    color: colors.text.primary,
  },
  counterMuted: {
    ...typography.label,
    color: colors.text.secondary,
  },
  exerciseList: {
    gap: spacing[3],
  },
  exerciseCard: {
    minHeight: componentSizes.touchTarget.global,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[3],
    borderRadius: radius.lg,
    borderWidth: borders.width.default,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.card,
  },
  exerciseCardSelected: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.surface.cardElevated,
  },
  mediaPlaceholder: {
    width: componentSizes.avatar.lg,
    height: componentSizes.avatar.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    borderWidth: borders.width.default,
    borderColor: colors.material.steel,
    backgroundColor: colors.surface.default,
  },
  mediaInitial: {
    ...typography.gamification.level,
    color: colors.brand.primary,
  },
  exerciseCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing[1],
  },
  cardTitle: {
    ...typography.cardTitle,
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
  selectedList: {
    gap: spacing[3],
  },
  selectedExerciseCard: {
    minHeight: componentSizes.touchTarget.global,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[3],
    borderRadius: radius.lg,
    borderWidth: borders.width.default,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.card,
  },
  orderBadge: {
    width: componentSizes.avatar.sm,
    height: componentSizes.avatar.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.circular,
    backgroundColor: colors.surface.default,
  },
  orderText: {
    ...typography.label,
    color: colors.gamification.level,
  },
  reorderActions: {
    flexDirection: 'row',
    gap: spacing[1],
  },
  iconButton: {
    width: componentSizes.avatar.sm,
    height: componentSizes.avatar.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: borders.width.default,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.default,
  },
  disabledButton: {
    opacity: 0.42,
  },
  summaryCard: {
    gap: spacing[3],
  },
  summaryExerciseList: {
    gap: spacing[2],
    paddingTop: spacing[3],
    borderTopWidth: borders.width.default,
    borderTopColor: colors.border.default,
  },
  summaryExerciseText: {
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
  pressed: {
    opacity: 0.84,
  },
});

