import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavigation, Button, Card } from '@/components';
import { useWorkoutDetails } from '@/hooks/useWorkoutDetails';
import type { WorkoutDetails } from '@/services/workoutsService';
import { borders, colors, componentSizes, radius, spacing, typography } from '@/theme';

const webContentMaxWidth = spacing[10] * spacing[5];

export default function WorkoutDetailsScreen() {
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
          {isLoading ? (
            <Card padding={5} style={styles.stateCard}>
              <ActivityIndicator color={colors.brand.primary} />
              <Text style={styles.stateTitle}>Carregando treino</Text>
              <Text style={styles.stateText}>Abrindo a sessão selecionada.</Text>
            </Card>
          ) : null}

          {!isLoading && error ? (
            <Card padding={5} style={styles.stateCard}>
              <Text style={styles.stateTitle}>Não foi possível abrir</Text>
              <Text style={styles.stateText}>{error}</Text>
            </Card>
          ) : null}

          {!isLoading && !error && workout ? <WorkoutDetailsContent workout={workout} /> : null}
        </View>
      </ScrollView>
      <BottomNavigation activeHref="/workouts" />
    </SafeAreaView>
  );
}

function WorkoutDetailsContent({ workout }: { readonly workout: WorkoutDetails }) {
  return (
    <>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Sessão ativa</Text>
        <Text style={styles.title}>{workout.name}</Text>
        <Text style={styles.description}>{formatWorkoutDate(workout.workoutDate)}</Text>
      </View>

      <Card variant="highlighted" padding={5}>
        <View style={styles.sessionCard}>
          <View style={styles.statusPill}>
            <Text style={styles.statusPillText}>Pronto para iniciar</Text>
          </View>

          <View style={styles.metaGrid}>
            <WorkoutMeta label="Volume" value={formatVolume(workout.totalVolume)} />
            <WorkoutMeta label="Local" value={workout.location ?? 'Não informado'} />
          </View>

          {workout.notes ? <Text style={styles.secondaryText}>{workout.notes}</Text> : null}

          <Button title="Iniciar agora" />
        </View>
      </Card>
    </>
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

function formatWorkoutDate(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Data não informada';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(parsedDate);
}

function formatVolume(volume: number): string {
  if (volume >= 1000) {
    return `${Number((volume / 1000).toFixed(1))}k kg`;
  }

  return `${volume} kg`;
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
  sessionCard: {
    gap: spacing[5],
  },
  statusPill: {
    alignSelf: 'flex-start',
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
  secondaryText: {
    ...typography.body.secondary,
    color: colors.text.secondary,
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
