import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavigation, Button, Card, XPProgress } from '@/components';
import { useProfile } from '@/hooks/useProfile';
import type { ProfileStat } from '@/services/profileService';
import { borders, colors, componentSizes, radius, spacing, typography } from '@/theme';

const webContentMaxWidth = spacing[10] * spacing[5];
const avatarSize = componentSizes.avatar.xl + spacing[12];

export default function ProfileScreen() {
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
            <Text style={styles.eyebrow}>Perfil</Text>
            <Text style={styles.title}>Sua forja</Text>
            <Text style={styles.description}>Dados pessoais e progresso principal em um só lugar.</Text>
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
              <Card variant="highlighted" padding={5}>
                <View style={styles.profileHero}>
                  <View style={styles.avatarFrame}>
                    <Text style={styles.avatarInitials}>{getInitials(profile.name)}</Text>
                  </View>

                  <View style={styles.profileIdentity}>
                    <Text style={styles.profileName}>{profile.name}</Text>
                    <Text style={styles.secondaryText}>{profile.email ?? 'Email não informado'}</Text>
                    <View style={styles.levelBadge}>
                      <Text style={styles.levelBadgeText}>Nível {profile.level}</Text>
                    </View>
                  </View>

                  <XPProgress
                    currentLevel={profile.level}
                    currentXp={profile.currentXp}
                    xpToNextLevel={profile.xpToNextLevel ?? profile.currentXp}
                  />
                </View>
              </Card>

              <View style={styles.statsGrid}>
                <ProfileStatCard label="Peso atual" value={formatWeight(profile.currentWeight)} />
                <ProfileStatCard label="Peso inicial" value={formatWeight(profile.initialWeight)} />
                <ProfileStatCard label="Criado em" value={formatDate(profile.createdAt)} />
                <ProfileStatCard label="Meta semanal" value={formatWeeklyGoal(profile.weeklyWorkoutGoal)} />
                <ProfileStatCard label="Meta de água" value={formatLiters(profile.dailyWaterGoalInLiters)} />
                <ProfileStatCard label="Meta de sono" value={formatHours(profile.dailySleepGoalInHours)} />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Estatísticas gerais</Text>
                {profile.stats.length > 0 ? (
                  <View style={styles.statsGrid}>
                    {profile.stats.map((stat) => (
                      <ProfileStatCard key={stat.label} label={stat.label} value={stat.value} />
                    ))}
                  </View>
                ) : (
                  <Card padding={5} style={styles.stateCard}>
                    <Text style={styles.stateTitle}>Nenhuma estatística disponível</Text>
                    <Text style={styles.stateText}>
                      As estatísticas aparecem quando a API retornar dados de treino para este perfil.
                    </Text>
                  </Card>
                )}
              </View>

              <Card padding={5}>
                <View style={styles.actions}>
                  <Button title="Editar perfil" disabled />
                  <Button title="Configurações" variant="secondary" disabled />
                </View>
              </Card>
            </>
          ) : null}
        </View>
      </ScrollView>
      <BottomNavigation activeHref="/profile" />
    </SafeAreaView>
  );
}

function ProfileStatCard({ label, value }: ProfileStat) {
  return (
    <Card padding={4} style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

function formatWeight(weight?: number): string {
  if (weight === undefined) {
    return 'Não informado';
  }

  return `${new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 1,
    minimumFractionDigits: Number.isInteger(weight) ? 0 : 1,
  }).format(weight)} kg`;
}

function formatDate(date?: string): string {
  if (!date) {
    return 'Não informada';
  }

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

function getInitials(name: string): string {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return initials || '??';
}

function formatWeeklyGoal(goal?: number): string {
  return goal === undefined ? 'Não informada' : `${goal} treinos`;
}

function formatLiters(value?: number): string {
  return value === undefined ? 'Não informada' : `${formatDecimal(value)} L`;
}

function formatHours(value?: number): string {
  return value === undefined ? 'Não informada' : `${formatDecimal(value)} h`;
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
  profileHero: {
    gap: spacing[5],
  },
  avatarFrame: {
    width: avatarSize,
    height: avatarSize,
    alignSelf: 'center',
    borderRadius: radius.circular,
    borderWidth: borders.width.default,
    borderColor: colors.material.bronze,
    backgroundColor: colors.background.secondary,
    overflow: 'hidden',
  },
  avatarInitials: {
    ...typography.title.main,
    color: colors.text.primary,
  },
  profileIdentity: {
    alignItems: 'center',
    gap: spacing[2],
  },
  profileName: {
    ...typography.title.main,
    color: colors.text.primary,
    textAlign: 'center',
  },
  secondaryText: {
    ...typography.body.secondary,
    color: colors.text.secondary,
    textAlign: 'center',
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
  section: {
    gap: spacing[3],
  },
  sectionTitle: {
    ...typography.title.section,
    color: colors.text.primary,
  },
  statsGrid: {
    flexDirection: Platform.select({
      web: 'row',
      default: 'column',
    }),
    flexWrap: 'wrap',
    gap: spacing[4],
  },
  statCard: {
    flexBasis: Platform.select({
      web: '30%',
      default: 'auto',
    }),
    flexGrow: 1,
    gap: spacing[1],
  },
  statValue: {
    ...typography.number.compact,
    color: colors.text.primary,
  },
  statLabel: {
    ...typography.caption,
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
  actions: {
    gap: spacing[3],
  },
});
