import { useMemo, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavigation, Button, Card, ForgeSymbol } from '@/components';
import { useGamification } from '@/hooks/useGamification';
import type { AchievementItem } from '@/services/gamificationService';
import { borders, colors, componentSizes, radius, spacing, typography } from '@/theme';

type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
type RarityFilterValue = 'all' | Rarity;

const rarityFilters: readonly RarityFilterValue[] = ['all', 'common', 'rare', 'epic', 'legendary'];
const webContentMaxWidth = spacing[10] * spacing[5];

export default function AchievementsScreen() {
  const { gamification, error, isLoading, refetch } = useGamification();
  const [selectedRarity, setSelectedRarity] = useState<RarityFilterValue>('all');
  const overallProgress = clampProgress(gamification?.summary.progressPercent ?? 0);
  const filteredAchievements = useMemo(() => {
    const achievements = gamification?.achievements ?? [];

    if (selectedRarity === 'all') {
      return achievements;
    }

    return achievements.filter((achievement) => getRarity(achievement) === selectedRarity);
  }, [gamification?.achievements, selectedRarity]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.page}>
          <View style={styles.header}>
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
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>MARCADOR</Text>
                <AchievementSummaryCard
                  available={gamification.summary.available}
                  progress={overallProgress}
                  unlocked={gamification.summary.unlocked}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>RARIDADE</Text>
                <RarityFilter
                  selectedRarity={selectedRarity}
                  onSelectRarity={setSelectedRarity}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>COLEÇÃO</Text>
                {gamification.achievements.length === 0 ? (
                  <Card padding={5} style={styles.stateCard}>
                    <Text style={styles.stateTitle}>Nenhuma conquista disponível</Text>
                    <Text style={styles.stateText}>
                      O catálogo de conquistas ainda não retornou itens para este ambiente.
                    </Text>
                  </Card>
                ) : filteredAchievements.length > 0 ? (
                  <View style={styles.achievementList}>
                    {filteredAchievements.map((achievement) => (
                      <AchievementCard key={achievement.id} achievement={achievement} />
                    ))}
                  </View>
                ) : (
                  <Card padding={5} style={styles.stateCard}>
                    <Text style={styles.stateTitle}>Nenhuma conquista encontrada nesta raridade.</Text>
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

function AchievementSummaryCard({
  available,
  progress,
  unlocked,
}: {
  readonly available: number;
  readonly progress: number;
  readonly unlocked: number;
}) {
  return (
    <Card variant="elevated" padding={5}>
      <View style={styles.summary}>
        <View style={styles.summaryGrid}>
          <SummaryStat
            icon={{ ios: 'trophy', android: 'emoji_events', web: 'emoji_events' }}
            label="Desbloqueadas"
            tone={colors.gamification.level}
            value={unlocked}
          />
          <View style={styles.summaryDivider} />
          <SummaryStat
            icon={{ ios: 'star', android: 'star', web: 'star' }}
            label="Disponíveis"
            tone={colors.brand.primary}
            value={available}
          />
          <View style={styles.summaryDivider} />
          <SummaryStat
            icon={{ ios: 'chart.line.uptrend.xyaxis', android: 'trending_up', web: 'trending_up' }}
            label="Progresso"
            tone={colors.gamification.xp}
            value={`${progress}%`}
          />
        </View>

        <View style={styles.overallProgressRow}>
          <View style={styles.overallTrack}>
            <View style={[styles.overallFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.overallProgressText}>{progress}% concluído</Text>
        </View>
      </View>
    </Card>
  );
}

type ForgeSymbolName = Parameters<typeof ForgeSymbol>[0]['name'];

function SummaryStat({
  icon,
  label,
  tone,
  value,
}: {
  readonly icon: ForgeSymbolName;
  readonly label: string;
  readonly tone: string;
  readonly value: string | number;
}) {
  return (
    <View style={styles.summaryStat}>
      <ForgeSymbol color={tone} fallback="*" name={icon} size={26} weight="semibold" />
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function RarityFilter({
  onSelectRarity,
  selectedRarity,
}: {
  readonly onSelectRarity: (rarity: RarityFilterValue) => void;
  readonly selectedRarity: RarityFilterValue;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterContent}
      style={styles.filterScroll}
    >
      {rarityFilters.map((rarity) => {
        const tone = rarityTone[rarity];
        const isSelected = selectedRarity === rarity;

        return (
          <Pressable
            key={rarity}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelectRarity(rarity)}
            style={({ pressed }) => [
              styles.filterChip,
              { borderColor: tone.color },
              isSelected && { backgroundColor: tone.color },
              pressed && styles.pressed,
            ]}
          >
            <View
              style={[
                styles.filterDot,
                { backgroundColor: isSelected ? colors.text.primary : tone.color },
              ]}
            />
            <Text style={[styles.filterText, { color: isSelected ? colors.text.primary : tone.color }]}>
              {tone.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function AchievementCard({ achievement }: { readonly achievement: AchievementItem }) {
  const rarity = getRarity(achievement);
  const tone = rarityTone[rarity];
  const progress = getAchievementProgress(achievement);

  return (
    <Card padding={4} style={[styles.achievementCardFrame, { borderColor: tone.color }]}>
      <View style={styles.achievementCard}>
        <View style={styles.achievementMain}>
          <View
            style={[
              styles.achievementIcon,
              { borderColor: tone.color },
              !achievement.unlocked && styles.lockedIcon,
            ]}
          >
            <ForgeSymbol
              color={tone.color}
              fallback="*"
              name={{ ios: 'trophy', android: 'emoji_events', web: 'emoji_events' }}
              size={24}
              weight="semibold"
            />
          </View>

          <View style={styles.achievementBody}>
            <View style={styles.achievementTitleRow}>
              <View style={styles.achievementTitleGroup}>
                <Text style={styles.cardTitle}>{achievement.name}</Text>
                <Text style={[styles.rarityLabel, { color: tone.color }]}>{tone.label}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  achievement.unlocked
                    ? { borderColor: tone.color, backgroundColor: withOpacity(tone.color, 0.18) }
                    : styles.lockedBadge,
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    { color: achievement.unlocked ? tone.color : colors.text.secondary },
                  ]}
                >
                  {achievement.unlocked ? 'Desbloqueada' : 'Bloqueada'}
                </Text>
              </View>
            </View>

            <Text style={styles.secondaryText}>{achievement.description}</Text>
          </View>
        </View>

        <View style={styles.progressBlock}>
          <View style={styles.progressCopy}>
            <Text style={styles.progressLabel}>Progresso</Text>
            <Text style={styles.progressValue}>{formatProgressValue(achievement)}</Text>
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
          {achievement.unlocked && achievement.unlockedAt ? (
            <Text style={styles.unlockedDate}>Desbloqueada em {formatDate(achievement.unlockedAt)}</Text>
          ) : null}
        </View>
      </View>
    </Card>
  );
}

const rarityTone = {
  all: {
    label: 'Todos',
    color: colors.brand.primary,
  },
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

function getAchievementProgress(achievement: AchievementItem): number {
  if (achievement.unlocked) {
    return 100;
  }

  return 0;
}

function formatProgressValue(achievement: AchievementItem): string {
  if (achievement.requiredValue <= 0) {
    return achievement.unlocked ? 'Concluída' : 'Critério definido pela API';
  }

  const currentValue = achievement.unlocked ? achievement.requiredValue : 0;

  return `${currentValue}/${achievement.requiredValue}`;
}

function formatDate(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'data não informada';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate);
}

function clampProgress(progress: number): number {
  if (!Number.isFinite(progress)) {
    return 0;
  }

  return Math.max(0, Math.min(progress, 100));
}

function withOpacity(hexColor: string, opacity: number): string {
  const normalized = hexColor.replace('#', '');

  if (normalized.length !== 6) {
    return colors.surface.default;
  }

  const alpha = Math.round(Math.max(0, Math.min(opacity, 1)) * 255)
    .toString(16)
    .padStart(2, '0');

  return `#${normalized}${alpha}`;
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
  title: {
    ...typography.screenTitle,
    color: colors.text.primary,
  },
  description: {
    ...typography.body.secondary,
    color: colors.text.secondary,
  },
  section: {
    gap: spacing[3],
  },
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.gamification.level,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
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
  summary: {
    gap: spacing[4],
  },
  summaryGrid: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing[3],
  },
  summaryDivider: {
    width: borders.width.default,
    alignSelf: 'stretch',
    backgroundColor: colors.border.default,
  },
  summaryStat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
    minWidth: 0,
  },
  summaryValue: {
    ...typography.metric.compact,
    color: colors.text.primary,
    textAlign: 'center',
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  overallProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  overallTrack: {
    flex: 1,
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
  overallProgressText: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'right',
  },
  filterScroll: {
    marginHorizontal: -spacing[4],
  },
  filterContent: {
    gap: spacing[2],
    paddingHorizontal: spacing[4],
  },
  filterChip: {
    minHeight: componentSizes.chip.height,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
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
  pressed: {
    opacity: 0.82,
  },
  achievementList: {
    gap: spacing[4],
  },
  achievementCardFrame: {
    borderWidth: borders.width.default,
  },
  achievementCard: {
    gap: spacing[4],
  },
  achievementMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  achievementIcon: {
    width: componentSizes.avatar.md,
    height: componentSizes.avatar.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.circular,
    borderWidth: borders.width.default,
    backgroundColor: colors.surface.default,
  },
  lockedIcon: {
    opacity: 0.58,
  },
  achievementBody: {
    flex: 1,
    minWidth: 0,
    gap: spacing[2],
  },
  achievementTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
  },
  achievementTitleGroup: {
    flex: 1,
    minWidth: 0,
    gap: spacing[1],
  },
  cardTitle: {
    ...typography.cardTitle,
    color: colors.text.primary,
  },
  rarityLabel: {
    ...typography.caption,
  },
  secondaryText: {
    ...typography.body.secondary,
    color: colors.text.secondary,
  },
  statusBadge: {
    minHeight: componentSizes.badge.minHeight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[3],
    borderRadius: radius.circular,
    borderWidth: borders.width.default,
  },
  lockedBadge: {
    borderColor: colors.border.default,
    backgroundColor: colors.surface.default,
  },
  statusBadgeText: {
    ...typography.caption,
  },
  progressBlock: {
    gap: spacing[2],
  },
  progressCopy: {
    flexDirection: 'row',
    alignItems: 'center',
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
    textAlign: 'right',
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
  unlockedDate: {
    ...typography.caption,
    color: colors.text.secondary,
  },
});
