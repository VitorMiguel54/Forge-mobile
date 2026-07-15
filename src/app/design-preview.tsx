import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Card, MetricCard, XPProgress } from '@/components';
import { colors, spacing, typography } from '@/theme';

export default function DesignPreviewScreen() {
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      style={styles.screen}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Forge Design Preview</Text>
        <Text style={styles.description}>
          Tela temporária para validação visual do tema, componentes e tipografia oficial.
        </Text>
      </View>

      <Section title="Botões">
        <Button title="Botão primário" variant="primary" onPress={() => {}} />
        <Button title="Botão secundário" variant="secondary" onPress={() => {}} />
        <Button title="Botão outline" variant="outline" onPress={() => {}} />
        <Button title="Carregando" variant="primary" loading onPress={() => {}} />
        <Button title="Desabilitado" variant="primary" disabled onPress={() => {}} />
      </Section>

      <Section title="Cards">
        <Card variant="default">
          <Text style={styles.cardTitle}>Card padrão</Text>
          <Text style={styles.cardText}>Superfície básica para conteúdos do Forge.</Text>
        </Card>

        <Card variant="elevated">
          <Text style={styles.cardTitle}>Card elevado</Text>
          <Text style={styles.cardText}>Possui maior destaque e profundidade.</Text>
        </Card>

        <Card variant="highlighted">
          <Text style={styles.cardTitle}>Card destacado</Text>
          <Text style={styles.cardText}>Utilizado para informações importantes.</Text>
        </Card>
      </Section>

      <Section title="Métricas">
        <MetricCard
          accent="water"
          progress={{ current: 2.1, target: 3 }}
          secondaryText="Meta diária: 3 L"
          title="Água"
          unit="L"
          value="2,1"
        />

        <MetricCard
          accent="sleep"
          progress={{ current: 7.5, target: 8 }}
          secondaryText="Meta diária: 8 horas"
          title="Sono"
          unit="h"
          value="7,5"
        />

        <MetricCard
          accent="weight"
          secondaryText="+2,2 kg desde o início"
          title="Peso"
          unit="kg"
          value="63,2"
        />

        <MetricCard
          accent="volume"
          secondaryText="Último treino"
          title="Volume"
          unit="kg"
          value="8.450"
        />
      </Section>

      <Section title="Progresso de XP">
        <XPProgress currentLevel={1} currentXp={0} xpToNextLevel={500} />
        <XPProgress currentLevel={3} currentXp={250} xpToNextLevel={500} />
        <XPProgress currentLevel={8} currentXp={480} xpToNextLevel={500} />
        <XPProgress currentLevel={10} currentXp={650} xpToNextLevel={500} />
      </Section>

      <Section title="Tipografia">
        <View style={styles.typeGroup}>
          <Text style={styles.typeLabel}>Cinzel: identidade, títulos especiais e gamificação</Text>
          <Text style={styles.identityLogo}>FORGE</Text>
          <Text style={styles.identitySection}>TREINO DE HOJE</Text>
          <Text style={styles.identityGuardian}>Guardião da Forja</Text>
          <Text style={styles.gamificationLevel}>NÍVEL 12</Text>
        </View>

        <View style={styles.typeGroup}>
          <Text style={styles.typeLabel}>Inter: interface, corpo, números, botões e navegação</Text>
          <Text style={styles.screenTitle}>Título principal em Inter</Text>
          <Text style={styles.cardTitle}>Título de card em Inter</Text>
          <Text style={styles.body}>Texto principal do Forge em Inter.</Text>
          <Text style={styles.secondaryText}>Texto secundário para informações de apoio.</Text>
          <Text style={styles.label}>LABEL E METADADOS</Text>
          <Text style={styles.highlightNumber}>8.450</Text>
          <Text style={styles.compactNumber}>63,2 kg</Text>
          <Text style={styles.navigation}>Home  Treinos  Histórico  Conquistas  Perfil</Text>
        </View>
      </Section>
    </ScrollView>
  );
}

type SectionProps = {
  readonly children: React.ReactNode;
  readonly title: string;
};

function Section({ children, title }: SectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>{title}</Text>
        <View style={styles.divider} />
      </View>

      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[8],
    paddingBottom: spacing[12],
  },
  header: {
    gap: spacing[2],
    marginBottom: spacing[8],
  },
  title: {
    color: colors.text.primary,
    ...typography.screenTitle,
  },
  description: {
    color: colors.text.secondary,
    ...typography.body.secondary,
  },
  section: {
    marginBottom: spacing[8],
  },
  sectionHeader: {
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  sectionLabel: {
    color: colors.gamification.level,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    ...typography.sectionTitle,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.default,
  },
  sectionContent: {
    gap: spacing[4],
  },
  cardTitle: {
    color: colors.text.primary,
    ...typography.cardTitle,
  },
  cardText: {
    color: colors.text.secondary,
    marginTop: spacing[2],
    ...typography.body.secondary,
  },
  typeGroup: {
    gap: spacing[2],
  },
  typeLabel: {
    color: colors.text.secondary,
    ...typography.label,
  },
  identityLogo: {
    color: colors.text.primary,
    ...typography.identity.logo,
  },
  identitySection: {
    color: colors.gamification.level,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    ...typography.sectionTitle,
  },
  identityGuardian: {
    color: colors.forge.hotOrange,
    ...typography.identity.guardian,
  },
  gamificationLevel: {
    color: colors.gamification.level,
    ...typography.gamification.level,
  },
  screenTitle: {
    color: colors.text.primary,
    ...typography.screenTitle,
  },
  body: {
    color: colors.text.primary,
    ...typography.body.default,
  },
  secondaryText: {
    color: colors.text.secondary,
    ...typography.body.secondary,
  },
  label: {
    color: colors.text.secondary,
    ...typography.label,
  },
  highlightNumber: {
    color: colors.text.primary,
    ...typography.metric.highlight,
  },
  compactNumber: {
    color: colors.text.primary,
    ...typography.metric.compact,
  },
  navigation: {
    color: colors.text.secondary,
    ...typography.navigation,
  },
});
