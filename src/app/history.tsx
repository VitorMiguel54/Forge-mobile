import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavigation, Card } from '@/components';
import { borders, colors, componentSizes, radius, spacing, typography } from '@/theme';

type HistoryWorkout = {
  readonly name: string;
  readonly date: string;
  readonly duration: string;
  readonly totalVolume: string;
  readonly exercises: readonly string[];
};

const historySummary = {
  workoutsCompleted: 4,
  totalTime: '3h 25m',
  weeklyVolume: '12.8k kg',
} as const;

const historyMock: readonly HistoryWorkout[] = [
  {
    name: 'Superiores A',
    date: 'Hoje',
    duration: '52 min',
    totalVolume: '4.2k kg',
    exercises: ['Supino reto', 'Desenvolvimento', 'Triceps corda'],
  },
  {
    name: 'Inferiores A',
    date: 'Ontem',
    duration: '58 min',
    totalVolume: '5.1k kg',
    exercises: ['Agachamento', 'Leg press', 'Mesa flexora'],
  },
  {
    name: 'Full Body',
    date: 'Sabado',
    duration: '46 min',
    totalVolume: '3.5k kg',
    exercises: ['Remada baixa', 'Levantamento terra', 'Prancha'],
  },
  {
    name: 'Superiores A',
    date: 'Quinta',
    duration: '49 min',
    totalVolume: '4.0k kg',
    exercises: ['Supino inclinado', 'Elevacao lateral', 'Rosca direta'],
  },
] as const;

const webContentMaxWidth = spacing[10] * spacing[5];

export default function HistoryScreen() {
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

          <Card variant="elevated" padding={5}>
            <View style={styles.summaryGrid}>
              <SummaryStat label="Treinos" value={historySummary.workoutsCompleted} />
              <SummaryStat label="Tempo total" value={historySummary.totalTime} />
              <SummaryStat label="Volume semana" value={historySummary.weeklyVolume} />
            </View>
          </Card>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ultimos treinos</Text>
            <View style={styles.timeline}>
              {historyMock.map((workout) => (
                <HistoryWorkoutCard key={`${workout.name}-${workout.date}`} workout={workout} />
              ))}
            </View>
          </View>
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

function HistoryWorkoutCard({ workout }: { readonly workout: HistoryWorkout }) {
  return (
    <Card padding={4}>
      <View style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <View style={styles.historyTitleGroup}>
            <Text style={styles.cardTitle}>{workout.name}</Text>
            <Text style={styles.secondaryText}>{workout.date}</Text>
          </View>
          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeText}>{workout.duration}</Text>
          </View>
        </View>

        <View style={styles.metaGrid}>
          <WorkoutMeta label="Volume" value={workout.totalVolume} />
          <WorkoutMeta label="Exercicios" value={workout.exercises.length} />
        </View>

        <View style={styles.exerciseList}>
          {workout.exercises.map((exercise) => (
            <View key={exercise} style={styles.exerciseItem}>
              <View style={styles.exerciseDot} />
              <Text style={styles.exerciseText}>{exercise}</Text>
            </View>
          ))}
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
