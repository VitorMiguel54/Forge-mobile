import { Image } from 'expo-image';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavigation, Button, Card, MetricCard, XPProgress } from '@/components';
import { borders, colors, componentSizes, radius, spacing, typography } from '@/theme';

const homeMock = {
  userName: 'Rafael',
  dayLabel: 'Hoje',
  guardianName: 'Guardiao da Forja',
  guardianStatus: 'Pronto para o proximo treino',
  weeklyGoal: '3 de 5 treinos na semana',
  nextWorkout: {
    title: 'Treino de forca',
    detail: 'Peito, ombro e triceps',
    estimate: '45 min',
  },
  quickActions: [
    { title: 'Agua', detail: 'Registrar 300 ml' },
    { title: 'Peso', detail: 'Atualizar medida' },
    { title: 'Sono', detail: 'Registrar noite' },
  ],
  weeklyProgress: [
    { label: 'Treinos', current: 3, target: 5 },
    { label: 'Agua', current: 5, target: 7 },
    { label: 'Sono', current: 4, target: 7 },
  ],
  achievement: {
    title: 'Consistencia de Aco',
    detail: '3 treinos concluidos nesta semana',
    status: 'Em progresso',
  },
  recentActivity: [
    { title: 'Supino reto', detail: '4 series registradas' },
    { title: 'Agua', detail: '1.8 L consumidos hoje' },
    { title: 'Sono', detail: '7.2 h na ultima noite' },
  ],
  xp: {
    level: 7,
    current: 320,
    next: 500,
  },
  metrics: {
    volume: {
      value: '12.8k',
      unit: 'kg',
      secondaryText: 'Volume da semana',
    },
    water: {
      value: 1.8,
      unit: 'L',
      secondaryText: 'Meta diaria: 2.5 L',
      progress: { current: 1.8, target: 2.5 },
    },
    sleep: {
      value: 7.2,
      unit: 'h',
      secondaryText: 'Ultima noite',
      progress: { current: 7.2, target: 8 },
    },
    weight: {
      value: 82.4,
      unit: 'kg',
      secondaryText: '-1.6 kg desde o inicio',
    },
  },
} as const;

const webContentMaxWidth = spacing[10] * spacing[5];
const guardianImageSize = componentSizes.avatar.xl + componentSizes.avatar.lg + spacing[12] + spacing[8];
const compactProgressTrackWidth = spacing[12] + spacing[10];

export default function HomeScreen() {
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
              <Text style={styles.eyebrow}>{homeMock.dayLabel}</Text>
              <Text style={styles.title}>Boa tarde, {homeMock.userName}</Text>
              <Text style={styles.description}>{homeMock.weeklyGoal}</Text>
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>Nvl {homeMock.xp.level}</Text>
            </View>
          </View>

          <Card variant="highlighted" padding={5} style={styles.guardianCardShell}>
            <View style={styles.guardianHeat} />
            <View style={styles.guardianImageFrame}>
              <Image
                source={require('@/assets/images/guardian-placeholder.png')}
                style={styles.guardianImage}
                contentFit="cover"
                accessibilityLabel="Placeholder do Guardiao"
              />
            </View>

            <View style={styles.guardianContent}>
              <View style={styles.guardianTextBlock}>
                <Text style={styles.eyebrow}>Guardiao ativo</Text>
                <Text style={styles.guardianTitle}>{homeMock.guardianName}</Text>
                <Text style={styles.guardianStatus}>{homeMock.guardianStatus}</Text>
              </View>

              <View style={styles.guardianMetaRow}>
                <View style={styles.guardianMetaItem}>
                  <Text style={styles.guardianMetaValue}>{homeMock.xp.current}</Text>
                  <Text style={styles.guardianMetaLabel}>XP atual</Text>
                </View>
                <View style={styles.guardianMetaDivider} />
                <View style={styles.guardianMetaItem}>
                  <Text style={styles.guardianMetaValue}>{homeMock.xp.next}</Text>
                  <Text style={styles.guardianMetaLabel}>Proximo nivel</Text>
                </View>
              </View>

              <XPProgress
                currentLevel={homeMock.xp.level}
                currentXp={homeMock.xp.current}
                xpToNextLevel={homeMock.xp.next}
                style={styles.xpProgress}
              />

              <Button title="Iniciar treino" style={styles.guardianButton} />
            </View>
          </Card>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Acoes rapidas</Text>
            <View style={styles.quickActionsGrid}>
              {homeMock.quickActions.map((action) => (
                <Card key={action.title} padding={4} style={styles.quickActionCard}>
                  <Text style={styles.cardTitle}>{action.title}</Text>
                  <Text style={styles.secondaryText}>{action.detail}</Text>
                </Card>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Visao do dia</Text>
            <View style={styles.metricsGrid}>
              <MetricCard
                title="Volume"
                value={homeMock.metrics.volume.value}
                unit={homeMock.metrics.volume.unit}
                secondaryText={homeMock.metrics.volume.secondaryText}
                accent="volume"
                variant="elevated"
                style={styles.metricCard}
              />
              <MetricCard
                title="Agua"
                value={homeMock.metrics.water.value}
                unit={homeMock.metrics.water.unit}
                secondaryText={homeMock.metrics.water.secondaryText}
                accent="water"
                progress={homeMock.metrics.water.progress}
                style={styles.metricCard}
              />
              <MetricCard
                title="Sono"
                value={homeMock.metrics.sleep.value}
                unit={homeMock.metrics.sleep.unit}
                secondaryText={homeMock.metrics.sleep.secondaryText}
                accent="sleep"
                progress={homeMock.metrics.sleep.progress}
                style={styles.metricCard}
              />
              <MetricCard
                title="Peso"
                value={homeMock.metrics.weight.value}
                unit={homeMock.metrics.weight.unit}
                secondaryText={homeMock.metrics.weight.secondaryText}
                accent="weight"
                style={styles.metricCard}
              />
            </View>
          </View>

          <Card padding={5}>
            <View style={styles.cardStack}>
              <Text style={styles.sectionTitle}>Resumo semanal</Text>
              {homeMock.weeklyProgress.map((item) => (
                <View key={item.label} style={styles.progressRow}>
                  <View style={styles.progressLabelGroup}>
                    <Text style={styles.cardTitle}>{item.label}</Text>
                    <Text style={styles.secondaryText}>
                      {item.current} de {item.target}
                    </Text>
                  </View>
                  <View style={styles.compactProgressTrack}>
                    <View
                      style={[
                        styles.compactProgressFill,
                        { width: `${Math.min((item.current / item.target) * 100, 100)}%` },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </Card>

          <Card padding={5}>
            <View style={styles.nextWorkout}>
              <View style={styles.nextWorkoutCopy}>
                <Text style={styles.sectionTitle}>{homeMock.nextWorkout.title}</Text>
                <Text style={styles.secondaryText}>{homeMock.nextWorkout.detail}</Text>
              </View>
              <View style={styles.workoutBadge}>
                <Text style={styles.workoutBadgeText}>{homeMock.nextWorkout.estimate}</Text>
              </View>
            </View>
          </Card>

          <Card variant="elevated" padding={5}>
            <View style={styles.achievementCard}>
              <View style={styles.achievementMark}>
                <Text style={styles.achievementMarkText}>XP</Text>
              </View>
              <View style={styles.achievementCopy}>
                <Text style={styles.sectionTitle}>{homeMock.achievement.title}</Text>
                <Text style={styles.secondaryText}>{homeMock.achievement.detail}</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>{homeMock.achievement.status}</Text>
              </View>
            </View>
          </Card>

          <Card padding={5}>
            <View style={styles.cardStack}>
              <Text style={styles.sectionTitle}>Atividade recente</Text>
              {homeMock.recentActivity.map((activity) => (
                <View key={activity.title} style={styles.activityRow}>
                  <View style={styles.activityIndicator} />
                  <View style={styles.activityCopy}>
                    <Text style={styles.cardTitle}>{activity.title}</Text>
                    <Text style={styles.secondaryText}>{activity.detail}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        </View>
      </ScrollView>
      <BottomNavigation activeHref="/" />
    </SafeAreaView>
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing[4],
  },
  headerCopy: {
    flex: 1,
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
  levelBadge: {
    minHeight: componentSizes.badge.minHeight,
    paddingHorizontal: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.circular,
    borderWidth: borders.width.default,
    borderColor: colors.gamification.level,
    backgroundColor: colors.surface.default,
  },
  levelBadgeText: {
    ...typography.caption,
    color: colors.gamification.level,
  },
  guardianCardShell: {
    minHeight: guardianImageSize - spacing[8],
    overflow: 'hidden',
  },
  guardianHeat: {
    position: 'absolute',
    top: spacing[5],
    right: spacing[4],
    width: guardianImageSize,
    height: guardianImageSize,
    borderRadius: radius.circular,
    backgroundColor: colors.surface.default,
    borderWidth: borders.width.default,
    borderColor: colors.material.bronze,
    opacity: 0.54,
  },
  guardianImageFrame: {
    position: 'absolute',
    right: -spacing[10],
    bottom: -spacing[8],
    width: guardianImageSize,
    height: guardianImageSize,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.circular,
    borderWidth: borders.width.default,
    borderColor: colors.material.bronze,
    backgroundColor: colors.background.secondary,
    overflow: 'hidden',
    opacity: 0.86,
  },
  guardianImage: {
    width: '100%',
    height: '100%',
  },
  guardianContent: {
    width: '72%',
    minHeight: guardianImageSize - spacing[8],
    justifyContent: 'space-between',
    gap: spacing[5],
  },
  guardianTextBlock: {
    gap: spacing[2],
  },
  guardianTitle: {
    ...typography.title.main,
    color: colors.text.primary,
  },
  guardianStatus: {
    ...typography.body.default,
    color: colors.text.secondary,
  },
  guardianMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing[4],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: radius.lg,
    borderWidth: borders.width.default,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.default,
  },
  guardianMetaItem: {
    gap: spacing[1],
  },
  guardianMetaValue: {
    ...typography.number.compact,
    color: colors.text.primary,
  },
  guardianMetaLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  guardianMetaDivider: {
    width: borders.width.default,
    alignSelf: 'stretch',
    backgroundColor: colors.border.default,
  },
  sectionTitle: {
    ...typography.title.section,
    color: colors.text.primary,
  },
  secondaryText: {
    ...typography.body.secondary,
    color: colors.text.secondary,
  },
  xpProgress: {
    maxWidth: spacing[12] * spacing[4],
  },
  guardianButton: {
    alignSelf: 'stretch',
  },
  section: {
    gap: spacing[3],
  },
  quickActionsGrid: {
    flexDirection: Platform.select({
      web: 'row',
      default: 'column',
    }),
    gap: spacing[3],
  },
  quickActionCard: {
    flex: 1,
    gap: spacing[2],
  },
  cardStack: {
    gap: spacing[4],
  },
  cardTitle: {
    ...typography.title.card,
    color: colors.text.primary,
  },
  metricsGrid: {
    flexDirection: Platform.select({
      web: 'row',
      default: 'column',
    }),
    flexWrap: 'wrap',
    gap: spacing[4],
  },
  metricCard: {
    flexBasis: Platform.select({
      web: '47%',
      default: 'auto',
    }),
    flexGrow: 1,
  },
  nextWorkout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  nextWorkoutCopy: {
    flex: 1,
    gap: spacing[2],
  },
  workoutBadge: {
    minHeight: componentSizes.chip.height,
    paddingHorizontal: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.circular,
    backgroundColor: colors.surface.default,
    borderWidth: borders.width.default,
    borderColor: colors.border.default,
  },
  workoutBadgeText: {
    ...typography.caption,
    color: colors.text.primary,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  progressLabelGroup: {
    flex: 1,
    gap: spacing[1],
  },
  compactProgressTrack: {
    width: compactProgressTrackWidth,
    height: componentSizes.progressBar.height,
    borderRadius: radius.circular,
    backgroundColor: colors.border.default,
    overflow: 'hidden',
  },
  compactProgressFill: {
    height: componentSizes.progressBar.height,
    borderRadius: radius.circular,
    backgroundColor: colors.brand.primary,
  },
  achievementCard: {
    gap: spacing[4],
  },
  achievementMark: {
    width: componentSizes.avatar.md,
    height: componentSizes.avatar.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.circular,
    backgroundColor: colors.gamification.achievement,
  },
  achievementMarkText: {
    ...typography.caption,
    color: colors.text.primary,
  },
  achievementCopy: {
    gap: spacing[2],
  },
  statusBadge: {
    alignSelf: 'flex-start',
    minHeight: componentSizes.badge.minHeight,
    paddingHorizontal: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.circular,
    borderWidth: borders.width.default,
    borderColor: colors.gamification.achievement,
  },
  statusBadgeText: {
    ...typography.caption,
    color: colors.gamification.achievement,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  activityIndicator: {
    width: spacing[2],
    height: spacing[2],
    borderRadius: radius.circular,
    backgroundColor: colors.brand.primary,
  },
  activityCopy: {
    flex: 1,
    gap: spacing[1],
  },
});
