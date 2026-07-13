import { ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  Button,
  Card,
  MetricCard,
  XPProgress,
} from '@/components';

import {
  colors,
  spacing,
  typography,
} from '@/theme';

export default function DesignPreviewScreen() {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Forge Design Preview</Text>

        <Text style={styles.description}>
          Tela temporária para validação visual do tema e dos componentes.
        </Text>
      </View>

      <Section title="Botões">
        <Button
          title="Botão primário"
          variant="primary"
          onPress={() => {}}
        />

        <Button
          title="Botão secundário"
          variant="secondary"
          onPress={() => {}}
        />

        <Button
          title="Botão outline"
          variant="outline"
          onPress={() => {}}
        />

        <Button
          title="Carregando"
          variant="primary"
          loading
          onPress={() => {}}
        />

        <Button
          title="Desabilitado"
          variant="primary"
          disabled
          onPress={() => {}}
        />
      </Section>

      <Section title="Cards">
        <Card variant="default">
          <Text style={styles.cardTitle}>Card padrão</Text>
          <Text style={styles.cardText}>
            Superfície básica para conteúdos do Forge.
          </Text>
        </Card>

        <Card variant="elevated">
          <Text style={styles.cardTitle}>Card elevado</Text>
          <Text style={styles.cardText}>
            Possui maior destaque e profundidade.
          </Text>
        </Card>

        <Card variant="highlighted">
          <Text style={styles.cardTitle}>Card destacado</Text>
          <Text style={styles.cardText}>
            Utilizado para informações importantes.
          </Text>
        </Card>
      </Section>

      <Section title="Métricas">
        <MetricCard
          title="Água"
          value="2,1"
          unit="L"
          secondaryText="Meta diária: 3 L"
          accent="water"
          progress={{ current: 2.1, target: 3 }}
        />

        <MetricCard
          title="Sono"
          value="7,5"
          unit="h"
          secondaryText="Meta diária: 8 horas"
          accent="sleep"
          progress={{ current: 7.5, target: 8 }}
        />

        <MetricCard
          title="Peso"
          value="63,2"
          unit="kg"
          secondaryText="+2,2 kg desde o início"
          accent="weight"
        />

        <MetricCard
          title="Volume"
          value="8.450"
          unit="kg"
          secondaryText="Último treino"
          accent="volume"
        />
      </Section>

      <Section title="Progresso de XP">
        <XPProgress
          currentLevel={1}
          currentXp={0}
          xpToNextLevel={500}
        />

        <XPProgress
          currentLevel={3}
          currentXp={250}
          xpToNextLevel={500}
        />

        <XPProgress
          currentLevel={8}
          currentXp={480}
          xpToNextLevel={500}
        />

        <XPProgress
          currentLevel={10}
          currentXp={650}
          xpToNextLevel={500}
        />
      </Section>

      <Section title="Tipografia">
        <Text style={styles.mainTitle}>Título principal</Text>
        <Text style={styles.sectionTitle}>Título de seção</Text>
        <Text style={styles.cardTitle}>Título de card</Text>
        <Text style={styles.body}>Texto principal do Forge.</Text>

        <Text style={styles.secondaryText}>
          Texto secundário para informações de apoio.
        </Text>

        <Text style={styles.caption}>LEGENDA E METADADOS</Text>
        <Text style={styles.highlightNumber}>8.450</Text>
        <Text style={styles.compactNumber}>63,2 kg</Text>
      </Section>
    </ScrollView>
  );
}

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

function Section({ title, children }: SectionProps) {
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
    ...typography.title.main,
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
    color: colors.text.primary,
    ...typography.title.section,
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
    ...typography.title.card,
  },

  cardText: {
    color: colors.text.secondary,
    ...typography.body.secondary,
    marginTop: spacing[2],
  },

  mainTitle: {
    color: colors.text.primary,
    ...typography.title.main,
  },

  sectionTitle: {
    color: colors.text.primary,
    ...typography.title.section,
  },

  body: {
    color: colors.text.primary,
    ...typography.body.default,
  },

  secondaryText: {
    color: colors.text.secondary,
    ...typography.body.secondary,
  },

  caption: {
    color: colors.text.secondary,
    ...typography.caption,
  },

  highlightNumber: {
    color: colors.text.primary,
    ...typography.number.highlight,
  },

  compactNumber: {
    color: colors.text.primary,
    ...typography.number.compact,
  },
});
