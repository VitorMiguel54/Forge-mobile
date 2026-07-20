import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/buttons/Button';
import { Card } from '@/components/cards/Card';
import { borders, colors, componentSizes, radius, spacing, typography } from '@/theme';

type ActionConfirmModalProps = {
  readonly cancelLabel?: string;
  readonly confirmLabel?: string;
  readonly destructive?: boolean;
  readonly isBusy?: boolean;
  readonly items?: readonly string[];
  readonly message: string;
  readonly onCancel?: () => void;
  readonly onConfirm?: () => void;
  readonly title: string;
  readonly visible: boolean;
};

export function ActionConfirmModal({
  cancelLabel = 'Cancelar',
  confirmLabel,
  destructive = false,
  isBusy = false,
  items = [],
  message,
  onCancel,
  onConfirm,
  title,
  visible,
}: ActionConfirmModalProps) {
  const canClose = !isBusy;

  function handleClose() {
    if (canClose) {
      onCancel?.();
    }
  }

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={styles.cardPressable}>
          <Card padding={5} style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              {onCancel ? (
                <Pressable
                  accessibilityLabel="Fechar"
                  accessibilityRole="button"
                  disabled={!canClose}
                  onPress={handleClose}
                  style={({ pressed }) => [styles.closeButton, pressed && canClose && styles.pressed]}
                >
                  <Text style={styles.closeText}>X</Text>
                </Pressable>
              ) : null}
            </View>

            <Text style={styles.message}>{message}</Text>

            {items.length > 0 ? (
              <View style={styles.itemSection}>
                <Text style={styles.message}>Registre ao menos uma série em:</Text>
                <ScrollView style={styles.itemList} contentContainerStyle={styles.itemListContent}>
                  {items.map((item) => (
                    <Text key={item} style={styles.itemText}>
                      - {item}
                    </Text>
                  ))}
                </ScrollView>
              </View>
            ) : null}

            {confirmLabel && onConfirm ? (
              <View style={styles.actions}>
                {onCancel ? (
                  <Button
                    title={cancelLabel}
                    variant="secondary"
                    disabled={isBusy}
                    onPress={handleClose}
                    style={styles.actionButton}
                  />
                ) : null}
                <Button
                  title={confirmLabel}
                  disabled={isBusy}
                  onPress={onConfirm}
                  style={[styles.actionButton, destructive && styles.destructiveButton]}
                  textStyle={destructive && styles.destructiveButtonText}
                />
              </View>
            ) : null}
          </Card>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
    backgroundColor: 'rgba(0, 0, 0, 0.64)',
  },
  cardPressable: {
    width: '100%',
    maxWidth: spacing[10] * spacing[3],
  },
  card: {
    gap: spacing[4],
    borderColor: colors.border.default,
    backgroundColor: colors.surface.card,
  },
  header: {
    minHeight: componentSizes.buttonHeight.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  title: {
    ...typography.cardTitle,
    flex: 1,
    color: colors.text.primary,
    textAlign: 'center',
  },
  closeButton: {
    width: componentSizes.buttonHeight.sm,
    height: componentSizes.buttonHeight.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.circular,
    borderWidth: borders.width.default,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.default,
  },
  closeText: {
    ...typography.button,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  message: {
    ...typography.body.secondary,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  itemSection: {
    gap: spacing[2],
  },
  itemList: {
    maxHeight: spacing[10] * 2,
  },
  itemListContent: {
    gap: spacing[1],
  },
  itemText: {
    ...typography.body.secondary,
    color: colors.text.secondary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  actionButton: {
    flex: 1,
  },
  destructiveButton: {
    borderColor: colors.semantic.error,
    backgroundColor: colors.semantic.error,
  },
  destructiveButtonText: {
    color: colors.text.primary,
  },
  pressed: {
    opacity: 0.88,
  },
});
