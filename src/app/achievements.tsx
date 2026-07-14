import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavigation, Button, Card } from '@/components';
import { useGamification } from '@/hooks/useGamification';
import type { AchievementItem } from '@/services/gamificationService';
import { borders, colors, componentSizes, radius, spacing, typography } from '@/theme';

type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

const rarityFilters: readonly Rarity[] = ['common', 'rare', 'epic', 'legendary'];
const webContentMaxWidth = spacing[10] * spacing[5];

export default function AchievementsScreen() {
  const { gamification, error, isLoading, refetch } = useGamification();
  const overallProgress = gamification?.summary.progressPercent ?? 0;

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

          {isLoading ? (
            <Card padding={5} style={styles.stateCard}>
              <ActivityIndicator color={colors.brand.primary} />
              <Text style={styles.stateTitle}>Carregando conquistas</Text>
              <Text style={styles.stateText}>Buscando XP e marcos desbloqueados.</Text>
            </Card>
          ) : null}

          {!isLoading && error ? (
            <Card padding={5} style={styles.stateCard}>
              <Text style={styles.stateTitle}>Não foi possível carregar</Text>
              <Text style={styles.stateText}>{error}</Text>
              <Button title="Tentar novamente" variant="secondary" onPress={() => void refetch()} />
            </Card>
          ) : null}

          {!isLoading && !error && gamification ? (
            <>
              <Card variant="elevated" padding={5}>
                <View style={styles.summary}>
                  <View style={styles.summaryGrid}>
                    <SummaryStat label="Desbloqueadas" value={gamification.summary.unlocked} />
                    <SummaryStat label="Disponíveis" value={gamification.summary.available} />
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
                {gamification.achievements.length > 0 ? (
                  <View style={styles.achievementGrid}>
                    {gamification.achievements.map((achievement) => (
                      <AchievementCard key={achievement.id} achievement={achievement} />
                    ))}
                  </View>
                ) : (
                  <Card padding={5} style={styles.stateCard}>
                    <Text style={styles.stateTitle}>Nenhuma conquista disponível</Text>
                    <Text style={styles.stateText}>
                      O catálogo de conquistas ainda não retornou itens para este ambiente.
                    </Text>
                  </Card>
                )}
              </View>
            </>
          ) : null}
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

function AchievementCard({ achievement }: { readonly achievement: AchievementItem }) {
  const tone = rarityTone[getRarity(achievement)];
  const progress = achievement.unlocked ? 100 : 0;

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

        <View style={styles.progressBlock}>
          <View style={styles.progressCopy}>
            <Text style={styles.progressLabel}>{achievement.unlocked ? 'Desbloqueada em' : 'Requisito'}</Text>
            <Text style={styles.progressValue}>
              {achievement.unlocked && achievement.unlockedAt
                ? formatDate(achievement.unlockedAt)
                : formatRequirement(achievement)}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: tone.color,
                  width: `${progress}%`,
                },
              ]}
            />
          </View>
        </View>

        {achievement.xpReward > 0 ? (
          <View style={styles.progressCopy}>
            <Text style={styles.progressLabel}>Recompensa</Text>
            <Text style={styles.progressValue}>{achievement.xpReward} XP</Text>
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

function getRarity(achievement: AchievementItem): Rarity {
  if (achievement.category === 'Secret' || achievement.isSecret) {
    return 'legendary';
  }

  if (achievement.category === 'Progression') {
    return 'epic';
  }

  if (achievement.category === 'Consistency') {
    return 'rare';
  }

  return 'common';
}

function formatRequirement(achievement: AchievementItem): string {
  if (achievement.requiredValue <= 0) {
    return 'Critério definido pela API';
  }

  return `${achievement.requiredValue} ${getCategoryUnit(achievement.category)}`;
}

function getCategoryUnit(category: string): string {
  const units: Record<string, string> = {
    Consistency: 'treinos na semana',
    Hydration: 'metas de água',
    Progression: 'kg movimentados',
    Sleep: 'metas de sono',
    Workout: 'treinos',
  };

  return units[category] ?? 'pontos';
}

function formatDate(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Data não informada';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate);
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
    ...typography.identity.section,
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
    ...typography.identity.section,
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
