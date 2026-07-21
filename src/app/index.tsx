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
import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';

import {
  BottomNavigation,
  Button,
  Card,
  HomeHeader,
  HomeHero,
  QuickActions,
  TodayWorkoutCard,
  WeeklyProgress,
  type HomeQuickAction,
  type WeeklyProgressDay,
} from '@/components';
import { useDashboard } from '@/hooks/useDashboard';
import { useQuickActions, type QuickActionConfig } from '@/hooks/useQuickActions';
import type { QuickActionKind } from '@/services/quickActionsService';
import { borders, colors, componentSizes, radius, spacing, typography } from '@/theme';

const webContentMaxWidth = spacing[10] * spacing[10] + spacing[8];

export default function HomeScreen() {
  const router = useRouter();
  const [isBetaPopoverVisible, setIsBetaPopoverVisible] = useState(false);
  const { dashboard, error, isLoading, refetch } = useDashboard();
  const quickActions = useQuickActions(refetch);
  const weeklyWorkoutProgress = dashboard ? getWeeklyWorkoutProgress(dashboard.weeklyProgress) : undefined;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
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

          {!isLoading && !error && dashboard && weeklyWorkoutProgress ? (
            <>
              {quickActions.successMessage ? (
                <Card padding={4} style={styles.successCard}>
                  <Text style={styles.stateText}>{quickActions.successMessage}</Text>
                </Card>
              ) : null}

              <View style={styles.heroStack}>
                <HomeHeader
                  onBellPress={() => setIsBetaPopoverVisible((isVisible) => !isVisible)}
                  onProfilePress={() => router.push('/profile' as Href)}
                />

                <HomeHero
                  dayLabel={dashboard.dayLabel}
                  guardianName={dashboard.guardianName}
                  guardianStatus={dashboard.guardianStatus}
                  xp={getLevelXpSummary(dashboard.xp)}
                />
              </View>

              <TodayWorkoutCard
                detail={dashboard.nextWorkout.detail}
                estimate={dashboard.nextWorkout.estimate}
                onViewAllPress={() => router.push('/workouts' as Href)}
                title={dashboard.nextWorkout.title}
                volumeText={`${dashboard.metrics.volume.value} ${dashboard.metrics.volume.unit ?? ''}`.trim()}
              />

              <QuickActions
                actions={getHomeQuickActions(dashboard.quickActions)}
                onActionPress={(action) => {
                  if (action.id === 'new-workout') {
                    router.push('/workouts/new' as Href);
                    return;
                  }

                  if (isQuickActionKind(action.id)) {
                    quickActions.openAction(action.id);
                  }
                }}
              />

              <WeeklyProgress
                days={getWeekDayProgress(weeklyWorkoutProgress)}
                motivation={dashboard.achievement.detail}
              />
            </>
          ) : null}
        </View>
      </ScrollView>

      {isBetaPopoverVisible ? (
        <>
          <Pressable
            accessibilityLabel="Fechar aviso beta"
            accessibilityRole="button"
            onPress={() => setIsBetaPopoverVisible(false)}
            style={styles.popoverDismissLayer}
          />
          <BetaPopover onClose={() => setIsBetaPopoverVisible(false)} />
        </>
      ) : null}

      <QuickActionModal
        action={quickActions.activeAction}
        error={quickActions.error}
        isSubmitting={quickActions.isSubmitting}
        onChangeValue={quickActions.setValue}
        onClose={quickActions.closeAction}
        onSubmit={() => void quickActions.submit()}
        value={quickActions.value}
      />
      <BottomNavigation activeHref="/" />
    </SafeAreaView>
  );
}

function BetaPopover({ onClose }: { readonly onClose: () => void }) {
  return (
    <View style={styles.betaPopover}>
      <View style={styles.betaArrow} />
      <View style={styles.betaHeader}>
        <Text style={styles.betaTitle}>🚧 Plataforma em Beta</Text>
        <Pressable accessibilityRole="button" onPress={onClose} style={styles.betaCloseButton}>
          <Text style={styles.betaCloseText}>X</Text>
        </Pressable>
      </View>
      <Text style={styles.betaText}>
        O Forge ainda está em desenvolvimento. Algumas funcionalidades podem sofrer alterações durante os testes.
      </Text>
    </View>
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
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={Boolean(action)}>
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
                  placeholder={getQuickActionPlaceholder(action)}
                  placeholderTextColor={colors.text.disabled}
                  style={styles.input}
                  value={value}
                />
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <View style={styles.modalActions}>
                <Button disabled={isSubmitting} onPress={onClose} title="Cancelar" variant="secondary" />
                <Button loading={isSubmitting} onPress={onSubmit} title="Registrar" />
              </View>
            </View>
          ) : null}
        </Card>
      </View>
    </Modal>
  );
}

function getQuickActionPlaceholder(action: QuickActionConfig): string {
  if (action.kind === 'weight') {
    return 'Digite seu peso em kg';
  }

  if (action.kind === 'water') {
    return 'Quantidade em litros';
  }

  if (action.kind === 'sleep') {
    return 'Horas dormidas';
  }

  return action.placeholder;
}

function getQuickActionKind(title: string): QuickActionKind | undefined {
  const normalizedTitle = title.toLowerCase();

  if (normalizedTitle.includes('peso')) {
    return 'weight';
  }

  if (normalizedTitle.includes('água') || normalizedTitle.includes('agua')) {
    return 'water';
  }

  if (normalizedTitle.includes('sono')) {
    return 'sleep';
  }

  return undefined;
}

function isQuickActionKind(id: string): id is QuickActionKind {
  return id === 'weight' || id === 'water' || id === 'sleep';
}

function getProgressFillPercent(current: number, target: number): number {
  if (target <= 0) {
    return 0;
  }

  return Math.min((current / target) * 100, 100);
}

function getHomeQuickActions(actions: readonly { readonly title: string; readonly detail: string }[]): readonly HomeQuickAction[] {
  const weightAction = actions.find((action) => getQuickActionKind(action.title) === 'weight');
  const waterAction = actions.find((action) => getQuickActionKind(action.title) === 'water');
  const sleepAction = actions.find((action) => getQuickActionKind(action.title) === 'sleep');

  return [
    {
      id: 'new-workout',
      icon: { ios: 'dumbbell', android: 'fitness_center', web: 'fitness_center' },
      iconFallback: 'T',
      title: 'Novo treino',
    },
    {
      id: 'weight',
      icon: { ios: 'scalemass', android: 'scale', web: 'scale' },
      iconFallback: 'kg',
      title: weightAction?.title ?? 'Registrar peso',
    },
    {
      id: 'water',
      icon: { ios: 'drop', android: 'water_drop', web: 'water_drop' },
      iconFallback: 'L',
      title: waterAction?.title ?? 'Água',
    },
    {
      id: 'sleep',
      icon: { ios: 'moon', android: 'moon_stars', web: 'moon_stars' },
      iconFallback: 'Zz',
      title: sleepAction?.title ?? 'Sono',
    },
  ];
}

function getWeeklyWorkoutProgress(
  weeklyProgress: readonly { readonly label: string; readonly current: number; readonly target: number }[],
) {
  return weeklyProgress.find((item) => item.label.toLowerCase().includes('treino')) ?? {
    current: 0,
    target: 0,
  };
}

function getWeekDayProgress(progress: { readonly current: number; readonly target: number }): readonly WeeklyProgressDay[] {
  const days = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
  const completedCount = Math.min(Math.max(Math.floor(progress.current), 0), days.length);
  const todayIndex = getTodayWeekIndex();

  return days.map((label, index) => ({
    label,
    completed: index < completedCount,
    isToday: index === todayIndex,
  }));
}

function getTodayWeekIndex(): number {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1;
}

function getLevelXpSummary(xp: { readonly level: number; readonly current: number; readonly next: number }) {
  const completedLevelXp = Math.max(xp.level - 1, 0) * 500;
  const current = Math.max(xp.current - completedLevelXp, 0);
  const target = current + Math.max(xp.next, 0);
  const percent = getProgressFillPercent(current, target);

  return { current, level: xp.level, next: xp.next, percent, target };
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
    paddingHorizontal: Platform.select({
      web: spacing[5],
      default: spacing[4],
    }),
    paddingTop: Platform.select({
      web: spacing[8],
      default: spacing[5],
    }),
    paddingBottom: componentSizes.bottomNavigation.height + spacing[12],
  },
  page: {
    width: '100%',
    maxWidth: Platform.select({
      web: webContentMaxWidth,
      default: undefined,
    }),
    gap: spacing[8],
  },
  heroStack: {
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
  sectionTitle: {
    ...typography.cardTitle,
    color: colors.text.primary,
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
  secondaryText: {
    ...typography.body.secondary,
    color: colors.text.secondary,
  },
  stateText: {
    ...typography.body.secondary,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  successCard: {
    borderColor: colors.semantic.success,
  },
  popoverDismissLayer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'transparent',
    zIndex: 20,
  },
  betaPopover: {
    position: 'absolute',
    top: Platform.select({
      web: spacing[8] + componentSizes.avatar.lg,
      default: spacing[5] + componentSizes.avatar.lg,
    }),
    right: spacing[4],
    width: 292,
    maxWidth: '86%',
    gap: spacing[3],
    padding: spacing[4],
    borderRadius: radius.lg,
    borderWidth: borders.width.default,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.cardElevated,
    boxShadow: '0 14px 28px rgba(0, 0, 0, 0.32)',
    zIndex: 21,
    elevation: 21,
  },
  betaArrow: {
    position: 'absolute',
    top: -7,
    right: spacing[10],
    width: spacing[4],
    height: spacing[4],
    transform: [{ rotate: '45deg' }],
    borderLeftWidth: borders.width.default,
    borderTopWidth: borders.width.default,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.cardElevated,
  },
  betaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  betaTitle: {
    ...typography.cardTitle,
    flex: 1,
    color: colors.text.primary,
  },
  betaCloseButton: {
    width: componentSizes.touchTarget.ios,
    height: componentSizes.touchTarget.ios,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.circular,
  },
  betaCloseText: {
    ...typography.button,
    color: colors.text.secondary,
  },
  betaText: {
    ...typography.body.secondary,
    color: colors.text.secondary,
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
