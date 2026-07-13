import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, MetricCard, XPProgress } from '@/components';
import { colors, spacing, typography } from '@/theme';

const palette = [
  { name: 'Brand', value: colors.brand.primary },
  { name: 'XP', value: colors.gamification.xp },
  { name: 'Water', value: colors.metric.water },
  { name: 'Sleep', value: colors.metric.sleep },
  { name: 'Weight', value: colors.metric.weight },
  { name: 'Volume', value: colors.metric.volume },
] as const;

export default function DesignPreviewScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Forge Design System</Text>
          <Text style={styles.title}>Preview visual</Text>
          <Text style={styles.description}>
            Tela temporaria para validar tokens, componentes base e densidade visual antes da Home.
          </Text>
        </View>

        <Card variant="highlighted">
          <View style={styles.cardStack}>
            <Text style={styles.sectionTitle}>Progresso</Text>
            <XPProgress currentLevel={7} currentXp={320} xpToNextLevel={500} />
          </View>
        </Card>

        <View style={styles.metricsGrid}>
          <MetricCard
            title="Agua"
            value={1.8}
            unit="L"
            secondaryText="Meta diaria: 2.5 L"
            accent="water"
            progress={{ current: 1.8, target: 2.5 }}
          />
          <MetricCard
            title="Sono"
            value={7.2}
            unit="h"
            secondaryText="Boa recuperacao"
            accent="sleep"
            progress={{ current: 7.2, target: 8 }}
          />
          <MetricCard
            title="Peso"
            value={82.4}
            unit="kg"
            secondaryText="-1.6 kg desde o inicio"
            accent="weight"
          />
          <MetricCard
            title="Volume"
            value="12.8k"
            unit="kg"
            secondaryText="Ultimo treino concluido"
            accent="volume"
            variant="elevated"
          />
        </View>

        <Card>
          <View style={styles.cardStack}>
            <Text style={styles.sectionTitle}>Acoes</Text>
            <View style={styles.buttonStack}>
              <Button title="Iniciar treino" />
              <Button title="Registrar agua" variant="secondary" />
              <Button title="Ver detalhes" variant="outline" />
              <Button title="Carregando" loading />
            </View>
          </View>
        </Card>

        <Card>
          <View style={styles.cardStack}>
            <Text style={styles.sectionTitle}>Cores</Text>
            <View style={styles.paletteGrid}>
              {palette.map((item) => (
                <View key={item.name} style={styles.swatchItem}>
                  <View style={[styles.swatch, { backgroundColor: item.value }]} />
                  <Text style={styles.swatchLabel}>{item.name}</Text>
                </View>
              ))}
            </View>
          </View>
        </Card>
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
  content: {
    gap: spacing[5],
    padding: spacing[4],
    paddingBottom: spacing[10],
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
    ...typography.body.default,
    color: colors.text.secondary,
  },
  sectionTitle: {
    ...typography.title.section,
    color: colors.text.primary,
  },
  cardStack: {
    gap: spacing[4],
  },
  metricsGrid: {
    gap: spacing[4],
  },
  buttonStack: {
    gap: spacing[3],
  },
  paletteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  swatchItem: {
    width: '30%',
    minWidth: 88,
    gap: spacing[2],
  },
  swatch: {
    height: 44,
    borderRadius: 8,
  },
  swatchLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
});
