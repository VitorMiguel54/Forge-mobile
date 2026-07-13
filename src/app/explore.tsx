import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components';
import { colors, spacing, typography } from '@/theme';

const webContentMaxWidth = spacing[10] * spacing[5];

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.eyebrow}>Forge</Text>
            <Text style={styles.title}>Explorar</Text>
            <Text style={styles.description}>
              Rota preservada para experimentos futuros, fora da navegacao principal atual.
            </Text>
          </View>

          <Card padding={5}>
            <Text style={styles.cardText}>As abas principais ja estao disponiveis na Home.</Text>
          </Card>
        </View>
      </ScrollView>
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
    padding: spacing[4],
    paddingTop: spacing[6],
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
  cardText: {
    ...typography.body.default,
    color: colors.text.primary,
  },
});
