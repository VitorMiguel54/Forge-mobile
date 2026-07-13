import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavigation, Card } from '@/components';
import { borders, colors, componentSizes, radius, spacing, typography } from '@/theme';

type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

type AchievementMock = {
  readonly name: string;
  readonly description: string;
  readonly rarity: Rarity;
  readonly unlocked: boolean;
  readonly progress?: {
    readonly current: number;
    readonly target: number;
  };
};

const achievementsSummary = {
  unlocked: 7,
  available: 18,
} as const;

const achievementsMock: readonly AchievementMock[] = [
  {
    name: 'Primeira Forja',
    description: 'Conclua seu primeiro treino registrado.',
    rarity: 'common',
    unlocked: true,
  },
  {
    name: 'Ritmo de Aço',
    description: 'Complete 3 treinos na mesma semana.',
    rarity: 'rare',
    unlocked: true,
  },
  {
    name: 'Volume Crescente',
    description: 'Movimente 20k kg em uma semana.',
    rarity: 'epic',
    unlocked: false,
    progress: { current: 12800, target: 20000 },
  },
  {
    name: 'Lenda da Forja',
    description: 'Mantenha consistência por 12 semanas.',
    rarity: 'legendary',
    unlocked: false,
    progress: { current: 3, target: 12 },
  },
  {
    name: 'Hidratação Sólida',
    description: 'Bata a meta de água por 5 dias.',
    rarity: 'common',
    unlocked: false,
    progress: { current: 2, target: 5 },
  },
  {
    name: 'Recuperação Firme',
    description: 'Registre sono adequado por 7 noites.',
    rarity: 'rare',
    unlocked: false,
    progress: { current: 4, target: 7 },
  },
] as const;

const rarityFilters: readonly Rarity[] = ['common', 'rare', 'epic', 'legendary'];
const webContentMaxWidth = spacing[10] * spacing[5];
const overallProgress = Math.round((achievementsSummary.unlocked / achievementsSummary.available) * 100);

export default function AchievementsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.eyebrow}>Marcos</Text>
            <Text style={styles.title}>Conquistas</Text>
            <Text style={styles.description}>
              Progresso visual discreto para reconhecer consistência e evolução.
            </Text>
          </View>

          <Card variant="elevated" padding={5}>
            <View style={styles.summary}>
              <View style={styles.summaryGrid}>
                <SummaryStat label="Desbloqueadas" value={achievementsSummary.unlocked} />
                <SummaryStat label="Disponíveis" value={achievementsSummary.available} />
                <SummaryStat label="Progresso" value={`${overallProgress}%`} />
              </View>
              <View style={styles.overallTrack}>
                <View style={[styles.overallFill, { width: `${overallProgress}%` }]} />
              </View>
            </View>
          </Card>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Raridade</Text>
            <View style={styles.filterRow}>
              {rarityFilters.map((rarity) => (
                <RarityFilter key={rarity} rarity={rarity} />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Coleção</Text>
            <View style={styles.achievementGrid}>
              {achievementsMock.map((achievement) => (
                <AchievementCard key={achievement.name} achievement={achievement} />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
      <BottomNavigation activeHref="/achievements" />
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

function RarityFilter({ rarity }: { readonly rarity: Rarity }) {
  const tone = rarityTone[rarity];

  return (
    <View style={[styles.filterChip, { borderColor: tone.color }]}>
      <View style={[styles.filterDot, { backgroundColor: tone.color }]} />
      <Text style={[styles.filterText, { color: tone.color }]}>{tone.label}</Text>
    </View>
  );
}

function AchievementCard({ achievement }: { readonly achievement: AchievementMock }) {
  const tone = rarityTone[achievement.rarity];
  const progress = achievement.progress
    ? Math.min((achievement.progress.current / achievement.progress.target) * 100, 100)
    : undefined;

  return (
    <Card padding={4} style={!achievement.unlocked && styles.lockedCard}>
      <View style={styles.achievementCard}>
        <View style={styles.achievementHeader}>
          <View style={[styles.rarityMark, { borderColor: tone.color }]}>
            <View style={[styles.rarityCore, { backgroundColor: tone.color }]} />
          </View>
          <View style={styles.achievementTitleGroup}>
            <Text style={styles.cardTitle}>{achievement.name}</Text>
            <Text style={[styles.rarityLabel, { color: tone.color }]}>{tone.label}</Text>
          </View>
          <View style={achievement.unlocked ? styles.unlockedBadge : styles.lockedBadge}>
            <Text style={achievement.unlocked ? styles.unlockedBadgeText : styles.lockedBadgeText}>
              {achievement.unlocked ? 'Desbloqueada' : 'Bloqueada'}
            </Text>
          </View>
        </View>

        <Text style={styles.secondaryText}>{achievement.description}</Text>

        {achievement.progress ? (
          <View style={styles.progressBlock}>
            <View style={styles.progressCopy}>
              <Text style={styles.progressLabel}>Progresso</Text>
              <Text style={styles.progressValue}>
                {achievement.progress.current} / {achievement.progress.target}
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: tone.color,
                    width: `${progress ?? 0}%`,
                  },
                ]}
              />
            </View>
          </View>
        ) : null}
      </View>
    </Card>
  );
}

const rarityTone = {
  common: {
    label: 'Comum',
    color: colors.semantic.success,
  },
  rare: {
    label: 'Raro',
    color: colors.gamification.xp,
  },
  epic: {
    label: 'Épico',
    color: colors.metric.sleep,
  },
  legendary: {
    label: 'Lendário',
    color: colors.gamification.level,
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
  summary: {
    gap: spacing[4],
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
  overallTrack: {
    height: componentSizes.progressBar.height,
    borderRadius: radius.circular,
    backgroundColor: colors.border.default,
    overflow: 'hidden',
  },
  overallFill: {
    height: componentSizes.progressBar.height,
    borderRadius: radius.circular,
    backgroundColor: colors.brand.primary,
  },
  section: {
    gap: spacing[3],
  },
  sectionTitle: {
    ...typography.title.section,
    color: colors.text.primary,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  filterChip: {
    minHeight: componentSizes.chip.height,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: radius.circular,
    borderWidth: borders.width.default,
    backgroundColor: colors.surface.default,
  },
  filterDot: {
    width: spacing[2],
    height: spacing[2],
    borderRadius: radius.circular,
  },
  filterText: {
    ...typography.caption,
  },
  achievementGrid: {
    gap: spacing[4],
  },
  lockedCard: {
    opacity: 0.72,
  },
  achievementCard: {
    gap: spacing[4],
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  rarityMark: {
    width: componentSizes.avatar.md,
    height: componentSizes.avatar.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.circular,
    borderWidth: borders.width.default,
    backgroundColor: colors.surface.default,
  },
  rarityCore: {
    width: spacing[4],
    height: spacing[4],
    borderRadius: radius.circular,
  },
  achievementTitleGroup: {
    flex: 1,
    gap: spacing[1],
  },
  cardTitle: {
    ...typography.title.card,
    color: colors.text.primary,
  },
  rarityLabel: {
    ...typography.caption,
  },
  secondaryText: {
    ...typography.body.secondary,
    color: colors.text.secondary,
  },
  unlockedBadge: {
    minHeight: componentSizes.badge.minHeight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[3],
    borderRadius: radius.circular,
    borderWidth: borders.width.default,
    borderColor: colors.semantic.success,
  },
  lockedBadge: {
    minHeight: componentSizes.badge.minHeight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[3],
    borderRadius: radius.circular,
    borderWidth: borders.width.default,
    borderColor: colors.border.default,
  },
  unlockedBadgeText: {
    ...typography.caption,
    color: colors.semantic.success,
  },
  lockedBadgeText: {
    ...typography.caption,
    color: colors.text.disabled,
  },
  progressBlock: {
    gap: spacing[2],
  },
  progressCopy: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  progressLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  progressValue: {
    ...typography.caption,
    color: colors.text.primary,
  },
  progressTrack: {
    height: componentSizes.progressBar.height,
    borderRadius: radius.circular,
    backgroundColor: colors.border.default,
    overflow: 'hidden',
  },
  progressFill: {
    height: componentSizes.progressBar.height,
    borderRadius: radius.circular,
  },
});
