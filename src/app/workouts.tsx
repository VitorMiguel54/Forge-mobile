import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavigation, Button, Card } from '@/components';
import { borders, colors, componentSizes, radius, spacing, typography } from '@/theme';

type WorkoutStatus = 'available' | 'inProgress' | 'completed';

type WorkoutMock = {
  readonly name: string;
  readonly muscleGroups: string;
  readonly exerciseCount: number;
  readonly estimatedDuration: string;
  readonly status: WorkoutStatus;
};

const workoutsMock: readonly WorkoutMock[] = [
  {
    name: 'Superiores A',
    muscleGroups: 'Peito, ombro e triceps',
    exerciseCount: 6,
    estimatedDuration: '50 min',
    status: 'inProgress',
  },
  {
    name: 'Inferiores A',
    muscleGroups: 'Quadriceps, posterior e gluteos',
    exerciseCount: 7,
    estimatedDuration: '55 min',
    status: 'available',
  },
  {
    name: 'Full Body',
    muscleGroups: 'Corpo inteiro',
    exerciseCount: 8,
    estimatedDuration: '60 min',
    status: 'completed',
  },
] as const;

const webContentMaxWidth = spacing[10] * spacing[5];
const inProgressWorkout = workoutsMock.find((workout) => workout.status === 'inProgress');

export default function WorkoutsScreen() {
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
            <Button title="Novo treino" style={styles.newWorkoutButton} />
          </View>

          {inProgressWorkout ? (
            <Card variant="highlighted" padding={5}>
              <View style={styles.featuredWorkout}>
                <View style={styles.featuredHeader}>
                  <View style={styles.statusPillInProgress}>
                    <Text style={styles.statusPillText}>Em andamento</Text>
                  </View>
                  <Text style={styles.featuredDuration}>{inProgressWorkout.estimatedDuration}</Text>
                </View>
                <View style={styles.featuredCopy}>
                  <Text style={styles.featuredTitle}>{inProgressWorkout.name}</Text>
                  <Text style={styles.description}>{inProgressWorkout.muscleGroups}</Text>
                </View>
                <View style={styles.featuredMetaRow}>
                  <WorkoutStat label="Exercicios" value={inProgressWorkout.exerciseCount} />
                  <WorkoutStat label="Duracao" value={inProgressWorkout.estimatedDuration} />
                </View>
              </View>
            </Card>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Treinos salvos</Text>
            <View style={styles.workoutList}>
              {workoutsMock.map((workout) => (
                <WorkoutCard key={workout.name} workout={workout} />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
      <BottomNavigation activeHref="/workouts" />
    </SafeAreaView>
  );
}

function WorkoutCard({ workout }: { readonly workout: WorkoutMock }) {
  const status = statusStyles[workout.status];

  return (
    <Card variant={workout.status === 'inProgress' ? 'highlighted' : 'default'} padding={4}>
      <View style={styles.workoutCard}>
        <View style={styles.workoutCardHeader}>
          <View style={styles.workoutTitleGroup}>
            <Text style={styles.cardTitle}>{workout.name}</Text>
            <Text style={styles.secondaryText}>{workout.muscleGroups}</Text>
          </View>
          <View style={[styles.statusPill, status.container]}>
            <Text style={[styles.statusText, status.text]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.workoutMetaGrid}>
          <WorkoutStat label="Exercicios" value={workout.exerciseCount} />
          <WorkoutStat label="Duracao" value={workout.estimatedDuration} />
        </View>
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

const statusStyles = {
  available: {
    label: 'Disponivel',
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
    label: 'Concluido',
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
  section: {
    gap: spacing[3],
  },
  sectionTitle: {
    ...typography.title.section,
    color: colors.text.primary,
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
