import { useRouter, type Href } from 'expo-router';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavigation, Button, Card, ForgeSymbol, SimpleLineChart } from '@/components';
import { useProfile } from '@/hooks/useProfile';
import type { ProfileData, ProfileStat } from '@/services/profileService';
import { borders, colors, componentSizes, radius, spacing, typography } from '@/theme';

const webContentMaxWidth = spacing[10] * spacing[5];
const avatarSize = componentSizes.avatar.xl + spacing[8];

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, error, isLoading, refetch } = useProfile();

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
              <Text style={styles.eyebrow}>PERFIL</Text>
              <Text style={styles.title}>Sua forja</Text>
              <Text style={styles.description}>Acompanhe sua evolução dentro e fora dos treinos.</Text>
            </View>
            <View style={styles.headerActions}>
              <IconCircle icon={{ ios: 'bell', android: 'notifications', web: 'notifications' }} fallback="!" />
              <IconCircle icon={{ ios: 'person', android: 'person', web: 'person' }} fallback="P" />
            </View>
          </View>

          {isLoading ? (
            <Card padding={5} style={styles.stateCard}>
              <ActivityIndicator color={colors.brand.primary} />
              <Text style={styles.stateTitle}>Carregando perfil</Text>
              <Text style={styles.stateText}>Buscando seus dados da Forja.</Text>
            </Card>
          ) : null}

          {!isLoading && error ? (
            <Card padding={5} style={styles.stateCard}>
              <Text style={styles.stateTitle}>Não foi possível carregar</Text>
              <Text style={styles.stateText}>{error}</Text>
              <Button title="Tentar novamente" variant="secondary" onPress={() => void refetch()} />
            </Card>
          ) : null}

          {!isLoading && !error && !profile ? (
            <Card padding={5} style={styles.stateCard}>
              <Text style={styles.stateTitle}>Perfil não encontrado</Text>
              <Text style={styles.stateText}>Nenhum dado de perfil foi retornado pela API.</Text>
            </Card>
          ) : null}

          {!isLoading && !error && profile ? (
            <>
              <DataQualityNotice profile={profile} />
              <ProfileMainCard profile={profile} />
              <EvolutionCard profile={profile} onOpenCharts={() => router.push('/profile/charts' as Href)} />
              <GoalsCard profile={profile} />
              <GeneralStats profile={profile} />

              <View style={styles.actions}>
                <Button
                  disabled
                  icon={
                    <ForgeSymbol
                      color={colors.text.primary}
                      fallback="E"
                      name={{ ios: 'pencil', android: 'edit', web: 'edit' }}
                      size={20}
                    />
                  }
                  title="Editar perfil"
                />
                <Button
                  disabled
                  icon={
                    <ForgeSymbol
                      color={colors.text.disabled}
                      fallback="C"
                      name={{ ios: 'gearshape', android: 'settings', web: 'settings' }}
                      size={20}
                    />
                  }
                  title="Configurações"
                  variant="secondary"
                />
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>
      <BottomNavigation activeHref="/profile" />
    </SafeAreaView>
  );
}

function DataQualityNotice({ profile }: { readonly profile: ProfileData }) {
  const message = getDataQualityMessage(profile);

  if (!message) {
    return null;
  }

  return (
    <Card padding={4} style={styles.warningCard}>
      <Text style={styles.warningText}>{message}</Text>
    </Card>
  );
}

function ProfileMainCard({ profile }: { readonly profile: ProfileData }) {
  const xpTarget = profile.currentXp + Math.max(profile.xpToNextLevel ?? 0, 0);
  const xpPercent = xpTarget > 0 ? clamp((profile.currentXp / xpTarget) * 100) : 0;

  return (
    <Card padding={5} style={styles.profileCard}>
      <View style={styles.profileTopRow}>
        <View style={styles.avatarFrame}>
          <Text style={styles.avatarInitials}>{getInitials(profile.name)}</Text>
        </View>
        <View style={styles.profileIdentity}>
          <Text style={styles.profileName}>{profile.name || 'Usuário'}</Text>
          <Text style={styles.secondaryText}>{profile.email ?? 'Email não informado'}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>Nível {profile.level}</Text>
          </View>
        </View>
      </View>

      <View style={styles.xpBlock}>
        <Text style={styles.xpText}>
          <Text style={styles.xpAccent}>{profile.currentXp}</Text> / {xpTarget} XP
        </Text>
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View style={[styles.xpProgressFill, { width: `${xpPercent}%` }]} />
          </View>
          <Text style={styles.percentText}>{Math.round(xpPercent)}%</Text>
        </View>
      </View>
    </Card>
  );
}

function EvolutionCard({
  onOpenCharts,
  profile,
}: {
  readonly onOpenCharts: () => void;
  readonly profile: ProfileData;
}) {
  const weights = profile.records.weights;
  const initialWeight = profile.initialWeight ?? weights[0]?.weight;
  const currentWeight = profile.currentWeight ?? weights[weights.length - 1]?.weight;
  const difference =
    currentWeight !== undefined && initialWeight !== undefined ? currentWeight - initialWeight : undefined;

  return (
    <View style={styles.section}>
      <Card padding={5} style={styles.evolutionCard}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.sectionTitle}>EVOLUÇÃO</Text>
          <View style={styles.evolutionDelta}>
            <Text style={[styles.deltaValue, getDeltaStyle(difference)]}>{formatSignedWeight(difference)}</Text>
            <Text style={styles.secondaryText}>desde o início</Text>
          </View>
        </View>

        <View style={styles.evolutionValues}>
          <View>
            <Text style={styles.secondaryText}>Peso atual</Text>
            <Text style={styles.featureValue}>{formatWeight(currentWeight)}</Text>
          </View>
          <View>
            <Text style={styles.smallValue}>{formatWeight(initialWeight)}</Text>
            <Text style={styles.secondaryText}>Peso inicial</Text>
          </View>
        </View>

        <SimpleLineChart
          color={colors.gamification.xp}
          emptyText="Registre mais pesos para visualizar a evolução."
          height={132}
          points={weights.map((record) => ({
            date: record.date,
            id: record.id,
            value: record.weight,
          }))}
          unit="kg"
        />

        <Pressable accessibilityRole="button" onPress={onOpenCharts} style={styles.linkButton}>
          <Text style={styles.linkButtonText}>Ver gráficos</Text>
          <ForgeSymbol
            color={colors.brand.primary}
            fallback=">"
            name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
            size={22}
            weight="semibold"
          />
        </Pressable>
      </Card>
    </View>
  );
}

function GoalsCard({ profile }: { readonly profile: ProfileData }) {
  const todayWater = getTodayWater(profile);
  const latestSleep = profile.summary.latestSleepHours ?? profile.records.sleepRecords.at(-1)?.hoursSlept ?? 0;
  const weeklyWorkouts = profile.summary.weeklyCompletedWorkouts ?? 0;

  return (
    <View style={styles.section}>
      <Card padding={4} style={styles.goalsCard}>
        <Text style={styles.sectionTitle}>MINHAS METAS</Text>
        <GoalRow
          color={colors.brand.primary}
          description="por semana"
          icon={{ ios: 'dumbbell', android: 'fitness_center', web: 'fitness_center' }}
          label="treinos"
          progress={getPercent(weeklyWorkouts, profile.weeklyWorkoutGoal)}
          value={profile.weeklyWorkoutGoal === undefined ? '—' : `${profile.weeklyWorkoutGoal} treinos`}
        />
        <GoalRow
          color={colors.metric.water}
          description="de água por dia"
          icon={{ ios: 'drop', android: 'water_drop', web: 'water_drop' }}
          label="água"
          progress={getPercent(todayWater, profile.dailyWaterGoalInLiters)}
          value={profile.dailyWaterGoalInLiters === undefined ? '—' : `${formatDecimal(profile.dailyWaterGoalInLiters)} L`}
        />
        <GoalRow
          color={colors.metric.sleep}
          description="de sono por dia"
          icon={{ ios: 'moon', android: 'dark_mode', web: 'dark_mode' }}
          label="sono"
          progress={getPercent(latestSleep, profile.dailySleepGoalInHours)}
          value={profile.dailySleepGoalInHours === undefined ? '—' : `${formatDecimal(profile.dailySleepGoalInHours)} h`}
        />
      </Card>
    </View>
  );
}

function GoalRow({
  color,
  description,
  icon,
  progress,
  value,
}: {
  readonly color: string;
  readonly description: string;
  readonly icon: Parameters<typeof ForgeSymbol>[0]['name'];
  readonly label: string;
  readonly progress: number;
  readonly value: string;
}) {
  return (
    <View style={styles.goalRow}>
      <View style={[styles.goalIcon, { backgroundColor: `${color}1F` }]}>
        <ForgeSymbol color={color} fallback="*" name={icon} size={24} weight="semibold" />
      </View>
      <View style={styles.goalTextBlock}>
        <Text style={styles.goalValue}>{value}</Text>
        <Text style={styles.secondaryText}>{description}</Text>
      </View>
      <View style={[styles.goalProgress, { borderColor: color }]}>
        <Text style={[styles.goalProgressText, { color }]}>{Math.round(progress)}%</Text>
      </View>
    </View>
  );
}

function GeneralStats({ profile }: { readonly profile: ProfileData }) {
  const stats: readonly ProfileStat[] = [
    { label: 'Treinos', value: profile.summary.totalWorkouts ?? '—' },
    { label: 'Tempo total', value: formatDuration(profile.summary.totalDurationMinutes) },
    { label: 'Volume total', value: formatVolume(profile.summary.totalVolume) },
    { label: 'Água hoje', value: formatLiters(profile.summary.todayWaterConsumption ?? getTodayWater(profile)) },
    { label: 'Treinos na semana', value: profile.summary.weeklyCompletedWorkouts ?? '—' },
    { label: 'Sono recente', value: formatHours(profile.summary.latestSleepHours) },
    { label: 'Sequência atual', value: '—' },
    { label: 'Recorde pessoal', value: '—' },
  ];

  return (
    <View style={styles.section}>
      <Card padding={4} style={styles.generalStatsCard}>
        <Text style={styles.sectionTitle}>ESTATÍSTICAS GERAIS</Text>
        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <ProfileStatCard key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </View>
      </Card>
    </View>
  );
}

function ProfileStatCard({ label, value }: ProfileStat) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function IconCircle({
  fallback,
  icon,
}: {
  readonly fallback: string;
  readonly icon: Parameters<typeof ForgeSymbol>[0]['name'];
}) {
  return (
    <View style={styles.iconCircle}>
      <ForgeSymbol color={colors.text.primary} fallback={fallback} name={icon} size={24} />
    </View>
  );
}

function getDataQualityMessage(profile: ProfileData): string | undefined {
  if (profile.dataQuality.status === 'complete') {
    return undefined;
  }

  if (profile.dataQuality.isHistoryTruncated) {
    return 'Os gráficos usam os 50 treinos concluídos mais recentes. Para períodos antigos, os valores podem estar incompletos.';
  }

  return 'Alguns dados auxiliares não foram carregados. Os blocos disponíveis continuam sendo exibidos.';
}

function getTodayWater(profile: ProfileData): number {
  const todayKey = new Date().toDateString();

  return profile.records.waterIntakes
    .filter((record) => new Date(record.date).toDateString() === todayKey)
    .reduce((sum, record) => sum + record.liters, 0);
}

function getInitials(name: string): string {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return initials || 'F';
}

function getPercent(current = 0, target?: number): number {
  if (!target || target <= 0) {
    return 0;
  }

  return clamp((current / target) * 100);
}

function clamp(value: number): number {
  return Math.min(Math.max(value, 0), 100);
}

function getDeltaStyle(value?: number) {
  if (value === undefined || value === 0) {
    return styles.neutralDelta;
  }

  return value > 0 ? styles.positiveDelta : styles.negativeDelta;
}

function formatSignedWeight(weight?: number): string {
  if (weight === undefined) {
    return '—';
  }

  const prefix = weight > 0 ? '+' : '';
  return `${prefix}${formatDecimal(weight)} kg`;
}

function formatWeight(weight?: number): string {
  return weight === undefined ? '—' : `${formatDecimal(weight)} kg`;
}

function formatDuration(minutes?: number): string {
  if (minutes === undefined) {
    return '—';
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

function formatVolume(volume?: number): string {
  if (volume === undefined) {
    return '—';
  }

  if (volume >= 1000) {
    return `${formatDecimal(volume / 1000)}k kg`;
  }

  return `${formatDecimal(volume)} kg`;
}

function formatLiters(value?: number): string {
  return value === undefined ? '—' : `${formatDecimal(value)} L`;
}

function formatHours(value?: number): string {
  return value === undefined ? '—' : `${formatDecimal(value)} h`;
}

function formatDecimal(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 1,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
  }).format(value);
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
    paddingTop: spacing[4],
    paddingBottom: componentSizes.bottomNavigation.height + spacing[8],
  },
  page: {
    width: '100%',
    maxWidth: Platform.select({
      web: webContentMaxWidth,
      default: undefined,
    }),
    gap: spacing[4],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing[4],
  },
  headerCopy: {
    flex: 1,
    gap: spacing[2],
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  iconCircle: {
    width: componentSizes.touchTarget.global,
    height: componentSizes.touchTarget.global,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.circular,
    borderWidth: borders.width.default,
    borderColor: colors.border.default,
    backgroundColor: colors.background.secondary,
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
  profileCard: {
    gap: spacing[5],
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[5],
  },
  avatarFrame: {
    width: avatarSize,
    height: avatarSize,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.circular,
    borderWidth: borders.width.strong,
    borderColor: colors.brand.primary,
    backgroundColor: colors.background.primary,
  },
  avatarInitials: {
    ...typography.display,
    color: colors.brand.primary,
  },
  profileIdentity: {
    flex: 1,
    alignItems: 'flex-start',
    gap: spacing[1],
  },
  profileName: {
    ...typography.screenTitle,
    color: colors.text.primary,
  },
  secondaryText: {
    ...typography.body.secondary,
    color: colors.text.secondary,
  },
  levelBadge: {
    minHeight: componentSizes.badge.minHeight,
    paddingHorizontal: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.circular,
    borderWidth: borders.width.default,
    borderColor: colors.brand.primary,
    backgroundColor: colors.background.secondary,
  },
  levelBadgeText: {
    ...typography.gamification.level,
    color: colors.gamification.level,
  },
  xpBlock: {
    gap: spacing[3],
  },
  xpText: {
    ...typography.metric.compact,
    color: colors.text.secondary,
  },
  xpAccent: {
    color: colors.gamification.xp,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  progressTrack: {
    flex: 1,
    height: componentSizes.progressBar.height,
    overflow: 'hidden',
    borderRadius: radius.circular,
    backgroundColor: colors.skeleton.base,
  },
  xpProgressFill: {
    height: '100%',
    borderRadius: radius.circular,
    backgroundColor: colors.gamification.xp,
  },
  percentText: {
    ...typography.body.secondary,
    minWidth: spacing[8],
    color: colors.text.primary,
    textAlign: 'right',
  },
  section: {
    gap: spacing[3],
  },
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.brand.primary,
    textTransform: 'uppercase',
  },
  evolutionCard: {
    gap: spacing[4],
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing[4],
  },
  evolutionDelta: {
    alignItems: 'flex-end',
  },
  deltaValue: {
    ...typography.metric.compact,
  },
  positiveDelta: {
    color: colors.semantic.success,
  },
  negativeDelta: {
    color: colors.semantic.error,
  },
  neutralDelta: {
    color: colors.text.secondary,
  },
  evolutionValues: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing[4],
  },
  featureValue: {
    ...typography.metric.highlight,
    color: colors.text.primary,
  },
  smallValue: {
    ...typography.cardTitle,
    color: colors.text.primary,
  },
  linkButton: {
    minHeight: componentSizes.touchTarget.ios,
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  linkButtonText: {
    ...typography.button,
    color: colors.brand.primary,
  },
  goalsCard: {
    gap: spacing[2],
  },
  goalRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: radius.md,
    borderWidth: borders.width.default,
    borderColor: colors.border.default,
    backgroundColor: colors.background.secondary,
  },
  goalIcon: {
    width: componentSizes.avatar.lg,
    height: componentSizes.avatar.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  goalTextBlock: {
    flex: 1,
  },
  goalValue: {
    ...typography.cardTitle,
    color: colors.text.primary,
  },
  goalProgress: {
    width: componentSizes.avatar.lg,
    height: componentSizes.avatar.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.circular,
    borderWidth: borders.width.strong,
  },
  goalProgressText: {
    ...typography.caption,
    fontWeight: 800,
  },
  generalStatsCard: {
    gap: spacing[4],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  statCard: {
    minWidth: '46%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
    minHeight: 82,
    padding: spacing[3],
    borderRadius: radius.md,
    borderWidth: borders.width.default,
    borderColor: colors.border.default,
    backgroundColor: colors.background.secondary,
  },
  statValue: {
    ...typography.cardTitle,
    color: colors.text.primary,
    textAlign: 'center',
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
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
  warningCard: {
    borderColor: colors.semantic.warning,
    backgroundColor: colors.background.secondary,
  },
  warningText: {
    ...typography.body.secondary,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  actions: {
    gap: spacing[3],
  },
});
