import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/cards/Card';
import { ForgeSymbol, type ForgeSymbolName } from '@/components/icons/ForgeSymbol';
import { borders, colors, componentSizes, radius, shadows, spacing, typography } from '@/theme';

export type HomeQuickAction = {
  readonly id: string;
  readonly icon: ForgeSymbolName;
  readonly iconFallback: string;
  readonly isDisabled?: boolean;
  readonly title: string;
};

export type QuickActionsProps = {
  readonly actions: readonly HomeQuickAction[];
  readonly onActionPress: (action: HomeQuickAction) => void;
};

export function QuickActions({ actions, onActionPress }: QuickActionsProps) {
  return (
    <Card padding={5} style={styles.card}>
      <Text numberOfLines={1} style={styles.sectionLabel}>
        Ações rápidas
      </Text>

      <View style={styles.grid}>
        {actions.map((action) => (
          <Pressable
            key={action.id}
            accessibilityRole="button"
            disabled={action.isDisabled}
            onPress={() => onActionPress(action)}
            style={({ pressed }) => [
              styles.pressable,
              action.isDisabled && styles.disabled,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.actionCard}>
              <ForgeSymbol
                color={colors.brand.primary}
                fallback={action.iconFallback}
                name={action.icon}
                size={34}
                weight="semibold"
              />
              <Text numberOfLines={2} style={styles.actionTitle}>
                {action.title}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: radius.xl,
    backgroundColor: colors.background.secondary,
    boxShadow: shadows.card,
  },
  sectionLabel: {
    ...typography.identity.section,
    color: colors.text.primary,
    textTransform: 'uppercase',
  },
  grid: {
    width: '100%',
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[5],
  },
  pressable: {
    flex: 1,
    minWidth: 0,
  },
  disabled: {
    opacity: 0.76,
  },
  pressed: {
    opacity: 0.84,
  },
  actionCard: {
    width: '100%',
    minHeight: componentSizes.avatar.xl + spacing[10],
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[4],
    paddingHorizontal: spacing[1],
    paddingVertical: spacing[3],
    borderRadius: radius.lg,
    borderWidth: borders.width.default,
    borderColor: colors.border.default,
    backgroundColor: colors.background.primary,
  },
  actionTitle: {
    ...typography.caption,
    color: colors.text.primary,
    textAlign: 'center',
  },
});
