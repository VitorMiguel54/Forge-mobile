import { Image } from 'expo-image';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavigation, Button, Card, XPProgress } from '@/components';
import { borders, colors, componentSizes, radius, spacing, typography } from '@/theme';

const profileMock = {
  name: 'Rafael Soares',
  title: 'Forjando consistencia',
  level: 7,
  currentXp: 320,
  xpToNextLevel: 500,
  currentWeight: '82.4 kg',
  initialWeight: '84.0 kg',
  workoutStreak: '5 dias',
  totalWorkouts: 42,
  totalAchievements: 7,
} as const;

const webContentMaxWidth = spacing[10] * spacing[5];
const avatarSize = componentSizes.avatar.xl + spacing[12];

export default function ProfileScreen() {
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
            <Text style={styles.description}>Dados pessoais e progresso principal em um so lugar.</Text>
          </View>

          <Card variant="highlighted" padding={5}>
            <View style={styles.profileHero}>
              <View style={styles.avatarFrame}>
                <Image
                  source={require('@/assets/images/guardian-placeholder.png')}
                  style={styles.avatarImage}
                  contentFit="cover"
                  accessibilityLabel="Avatar temporario do usuario"
                />
              </View>

              <View style={styles.profileIdentity}>
                <Text style={styles.profileName}>{profileMock.name}</Text>
                <Text style={styles.secondaryText}>{profileMock.title}</Text>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelBadgeText}>Nivel {profileMock.level}</Text>
                </View>
              </View>

              <XPProgress
                currentLevel={profileMock.level}
                currentXp={profileMock.currentXp}
                xpToNextLevel={profileMock.xpToNextLevel}
              />
            </View>
          </Card>

          <View style={styles.statsGrid}>
            <ProfileStat label="Peso atual" value={profileMock.currentWeight} />
            <ProfileStat label="Peso inicial" value={profileMock.initialWeight} />
            <ProfileStat label="Sequencia" value={profileMock.workoutStreak} />
            <ProfileStat label="Treinos" value={profileMock.totalWorkouts} />
            <ProfileStat label="Conquistas" value={profileMock.totalAchievements} />
          </View>

          <Card padding={5}>
            <View style={styles.actions}>
              <Button title="Editar perfil" />
              <Button title="Configuracoes" variant="secondary" />
            </View>
          </Card>
        </View>
      </ScrollView>
      <BottomNavigation activeHref="/profile" />
    </SafeAreaView>
  );
}

function ProfileStat({ label, value }: { readonly label: string; readonly value: string | number }) {
  return (
    <Card padding={4} style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
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
  avatarImage: {
    width: '100%',
    height: '100%',
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
  actions: {
    gap: spacing[3],
  },
});
