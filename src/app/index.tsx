import { Image } from 'expo-image';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavigation, Button, Card, MetricCard, XPProgress } from '@/components';
import { useDashboard } from '@/hooks/useDashboard';
import { useQuickActions, type QuickActionConfig } from '@/hooks/useQuickActions';
import type { QuickActionKind } from '@/services/quickActionsService';
import { borders, colors, componentSizes, radius, spacing, typography } from '@/theme';

const webContentMaxWidth = spacing[10] * spacing[5];
const guardianImageSize = componentSizes.avatar.xl + componentSizes.avatar.lg + spacing[12] + spacing[4];
const compactProgressTrackWidth = spacing[12] + spacing[10];

export default function HomeScreen() {
  const { dashboard, error, isLoading, refetch } = useDashboard();
  const quickActions = useQuickActions(refetch);

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
              <Text style={styles.stateTitle}>Carregando home</Text>
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

          {!isLoading && !error && dashboard ? (
            <>
              {quickActions.successMessage ? (
                <Card padding={4} style={styles.successCard}>
                  <Text style={styles.stateText}>{quickActions.successMessage}</Text>
                </Card>
              ) : null}

              <View style={styles.header}>
                <View style={styles.headerCopy}>
                  <Text style={styles.eyebrow}>{dashboard.dayLabel}</Text>
                  <Text style={styles.title}>Boa tarde, {dashboard.userName}</Text>
                  <Text style={styles.description}>{dashboard.weeklyGoal}</Text>
                </View>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelBadgeText}>Nvl {dashboard.xp.level}</Text>
                </View>
              </View>

              <Card variant="highlighted" padding={5} style={styles.guardianCardShell}>
                <View style={styles.guardianAccentBar} />
                <View style={styles.guardianHeat} />
                <View style={styles.guardianImageFrame}>
                  <Image
                    source={require('@/assets/images/guardian-placeholder.png')}
                    style={styles.guardianImage}
                    contentFit="cover"
                    accessibilityLabel="Placeholder do Guardião"
                  />
                </View>

                <View style={styles.guardianContent}>
                  <View style={styles.guardianTextBlock}>
                    <View style={styles.guardianEyebrowRow}>
                      <View style={styles.guardianStatusDot} />
                      <Text style={styles.eyebrow}>Guardião ativo</Text>
                    </View>
                    <Text style={styles.guardianTitle}>{dashboard.guardianName}</Text>
                    <Text style={styles.guardianStatus}>{dashboard.guardianStatus}</Text>
                  </View>

                  <View style={styles.guardianMetaRow}>
                    <View style={styles.guardianMetaItem}>
                      <Text style={styles.guardianMetaValue}>{dashboard.xp.current}</Text>
                      <Text style={styles.guardianMetaLabel}>XP atual</Text>
                    </View>
                    <View style={styles.guardianMetaDivider} />
                    <View style={styles.guardianMetaItem}>
                      <Text style={styles.guardianMetaValue}>{dashboard.xp.next}</Text>
                      <Text style={styles.guardianMetaLabel}>Próximo nível</Text>
                    </View>
                  </View>

                  <XPProgress
                    currentLevel={dashboard.xp.level}
                    currentXp={dashboard.xp.current}
                    xpToNextLevel={dashboard.xp.next}
                    style={styles.xpProgress}
                  />

                  <Button title="Iniciar treino" style={styles.guardianButton} />
                </View>
              </Card>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ações rápidas</Text>
                <View style={styles.quickActionsGrid}>
                  {dashboard.quickActions.map((action, index) => (
                    <Pressable
                      key={action.title}
                      disabled={!getQuickActionKind(action.title)}
                      onPress={() => {
                        const kind = getQuickActionKind(action.title);

                        if (kind) {
                          quickActions.openAction(kind);
                        }
                      }}
                      style={styles.quickActionPressable}
                    >
                    <Card padding={4} style={styles.quickActionCard}>
                      <View style={styles.quickActionTopRow}>
                        <View style={styles.quickActionMark}>
                          <Text style={styles.quickActionMarkText}>{index + 1}</Text>
                        </View>
                        <Text style={styles.quickActionHint}>Rápido</Text>
                      </View>
                      <View style={styles.quickActionCopy}>
                        <Text style={styles.cardTitle}>{action.title}</Text>
                        <Text style={styles.secondaryText}>{action.detail}</Text>
                      </View>
                    </Card>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Visão do dia</Text>
                <View style={styles.metricsGrid}>
                  <MetricCard
                    title="Volume"
                    value={dashboard.metrics.volume.value}
                    unit={dashboard.metrics.volume.unit}
                    secondaryText={dashboard.metrics.volume.secondaryText}
                    accent="volume"
                    variant="elevated"
                    style={styles.metricCard}
                  />
                  <MetricCard
                    title="Água"
                    value={dashboard.metrics.water.value}
                    unit={dashboard.metrics.water.unit}
                    secondaryText={dashboard.metrics.water.secondaryText}
                    accent="water"
                    progress={dashboard.metrics.water.progress}
                    style={styles.metricCard}
                  />
                  <MetricCard
                    title="Sono"
                    value={dashboard.metrics.sleep.value}
                    unit={dashboard.metrics.sleep.unit}
                    secondaryText={dashboard.metrics.sleep.secondaryText}
                    accent="sleep"
                    progress={dashboard.metrics.sleep.progress}
                    style={styles.metricCard}
                  />
                  <MetricCard
                    title="Peso"
                    value={dashboard.metrics.weight.value}
                    unit={dashboard.metrics.weight.unit}
                    secondaryText={dashboard.metrics.weight.secondaryText}
                    accent="weight"
                    style={styles.metricCard}
                  />
                </View>
              </View>

              <Card padding={5} style={styles.weeklySummaryCard}>
                <View style={styles.cardStack}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Resumo semanal</Text>
                    <Text style={styles.sectionMeta}>Meta</Text>
                  </View>
                  {dashboard.weeklyProgress.map((item) => (
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

              <Card padding={5} style={styles.nextWorkoutCard}>
                <View style={styles.nextWorkout}>
                  <View style={styles.nextWorkoutCopy}>
                    <Text style={styles.sectionTitle}>{dashboard.nextWorkout.title}</Text>
                    <Text style={styles.secondaryText}>{dashboard.nextWorkout.detail}</Text>
                  </View>
                  <View style={styles.workoutBadge}>
                    <Text style={styles.workoutBadgeText}>{dashboard.nextWorkout.estimate}</Text>
                  </View>
                </View>
              </Card>

              <Card variant="elevated" padding={5}>
                <View style={styles.achievementCard}>
                  <View style={styles.achievementMark}>
                    <Text style={styles.achievementMarkText}>XP</Text>
                  </View>
                  <View style={styles.achievementCopy}>
                    <Text style={styles.sectionTitle}>{dashboard.achievement.title}</Text>
                    <Text style={styles.secondaryText}>{dashboard.achievement.detail}</Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>{dashboard.achievement.status}</Text>
                  </View>
                </View>
              </Card>

              <Card padding={5}>
                <View style={styles.cardStack}>
                  <Text style={styles.sectionTitle}>Atividade recente</Text>
                  {dashboard.recentActivity.map((activity) => (
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
            </>
          ) : null}
        </View>
      </ScrollView>
      <QuickActionModal
        action={quickActions.activeAction}
        error={quickActions.error}
        isSubmitting={quickActions.isSubmitting}
        value={quickActions.value}
        onChangeValue={quickActions.setValue}
        onClose={quickActions.closeAction}
        onSubmit={() => void quickActions.submit()}
      />
      <BottomNavigation activeHref="/" />
    </SafeAreaView>
  );
}

function QuickActionModal({
  action,
  error,
  isSubmitting,
  onChangeValue,
  onClose,
  onSubmit,
  value,
}: {
  readonly action?: QuickActionConfig;
  readonly error?: string;
  readonly isSubmitting: boolean;
  readonly onChangeValue: (value: string) => void;
  readonly onClose: () => void;
  readonly onSubmit: () => void;
  readonly value: string;
}) {
  return (
    <Modal animationType="fade" transparent visible={Boolean(action)} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Card padding={5} style={styles.modalCard}>
          {action ? (
            <View style={styles.modalContent}>
              <View style={styles.headerCopy}>
                <Text style={styles.eyebrow}>{action.title}</Text>
                <Text style={styles.sectionTitle}>{action.label}</Text>
                <Text style={styles.secondaryText}>Informe o valor em {action.unit}.</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Valor</Text>
                <TextInput
                  keyboardType="decimal-pad"
                  onChangeText={onChangeValue}
                  placeholder={action.placeholder}
                  placeholderTextColor={colors.text.disabled}
                  style={styles.input}
                  value={value}
                />
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <View style={styles.modalActions}>
                <Button title="Cancelar" variant="secondary" disabled={isSubmitting} onPress={onClose} />
                <Button title="Registrar" loading={isSubmitting} onPress={onSubmit} />
              </View>
            </View>
          ) : null}
        </Card>
      </View>
    </Modal>
  );
}

function getQuickActionKind(title: string): QuickActionKind | undefined {
  const normalizedTitle = title.toLowerCase();

  if (normalizedTitle.includes('peso')) {
    return 'weight';
  }

  if (normalizedTitle.includes('gua')) {
    return 'water';
  }

  if (normalizedTitle.includes('sono')) {
    return 'sleep';
  }

  return undefined;
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
    paddingTop: spacing[8],
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing[5],
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
    paddingHorizontal: spacing[4],
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
    minHeight: Platform.select({
      web: guardianImageSize - spacing[8],
      default: guardianImageSize - spacing[6],
    }),
    overflow: 'hidden',
  },
  guardianAccentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: spacing[1],
    backgroundColor: colors.forge.hotOrange,
  },
  guardianHeat: {
    position: 'absolute',
    top: spacing[4],
    right: -spacing[10],
    width: guardianImageSize,
    height: guardianImageSize,
    borderRadius: radius.circular,
    backgroundColor: colors.background.secondary,
    borderWidth: borders.width.default,
    borderColor: colors.material.bronze,
    opacity: 0.72,
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
    opacity: 0.94,
  },
  guardianImage: {
    width: '100%',
    height: '100%',
  },
  guardianContent: {
    width: Platform.select({
      web: '72%',
      default: '78%',
    }),
    minHeight: Platform.select({
      web: guardianImageSize - spacing[8],
      default: guardianImageSize - spacing[6],
    }),
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
  guardianEyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  guardianStatusDot: {
    width: spacing[2],
    height: spacing[2],
    borderRadius: radius.circular,
    backgroundColor: colors.semantic.success,
  },
  guardianMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing[5],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[5],
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
  stateCard: {
    alignItems: 'center',
    gap: spacing[3],
  },
  stateTitle: {
    ...typography.title.section,
    color: colors.text.primary,
    textAlign: 'center',
  },
  secondaryText: {
    ...typography.body.secondary,
    color: colors.text.secondary,
  },
  stateText: {
    ...typography.body.secondary,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  xpProgress: {
    maxWidth: spacing[12] * spacing[4],
  },
  guardianButton: {
    alignSelf: 'stretch',
  },
  section: {
    gap: spacing[4],
  },
  quickActionsGrid: {
    flexDirection: Platform.select({
      web: 'row',
      default: 'column',
    }),
    gap: spacing[3],
  },
  quickActionPressable: {
    flex: 1,
  },
  quickActionCard: {
    flex: 1,
    minHeight: componentSizes.buttonHeight.xl + spacing[10],
    justifyContent: 'space-between',
    gap: spacing[5],
    borderColor: colors.border.default,
  },
  quickActionTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  quickActionMark: {
    width: componentSizes.avatar.sm,
    height: componentSizes.avatar.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.circular,
    borderWidth: borders.width.default,
    borderColor: colors.brand.primary,
    backgroundColor: colors.surface.default,
  },
  quickActionMarkText: {
    ...typography.caption,
    color: colors.brand.primary,
  },
  quickActionHint: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  quickActionCopy: {
    gap: spacing[2],
  },
  cardStack: {
    gap: spacing[5],
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
    gap: spacing[3],
  },
  metricCard: {
    flexBasis: Platform.select({
      web: '48%',
      default: 'auto',
    }),
    flexGrow: 1,
    minHeight: componentSizes.avatar.xl + spacing[10],
  },
  weeklySummaryCard: {
    gap: spacing[4],
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[4],
  },
  sectionMeta: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  nextWorkout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[5],
  },
  nextWorkoutCard: {
    borderColor: colors.material.steel,
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
  successCard: {
    borderColor: colors.semantic.success,
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
    backgroundColor: 'rgba(0, 0, 0, 0.64)',
  },
  modalCard: {
    width: '100%',
    maxWidth: spacing[10] * spacing[4],
  },
  modalContent: {
    gap: spacing[5],
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
  errorText: {
    ...typography.body.secondary,
    color: colors.semantic.error,
  },
  modalActions: {
    flexDirection: Platform.select({
      web: 'row',
      default: 'column',
    }),
    gap: spacing[3],
  },
});
