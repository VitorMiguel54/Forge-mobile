import { useRef, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';

import { Button, ForgeSymbol } from '@/components';
import { borders, colors, componentSizes, radius, spacing, typography } from '@/theme';

const demoCredentials = {
  username: 'admin',
  password: 'admin',
} as const;

export default function LandingScreen() {
  const router = useRouter();
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);

  const openLoginModal = () => setIsLoginModalVisible(true);
  const closeLoginModal = () => setIsLoginModalVisible(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          <View style={styles.header}>
            <View style={styles.brand}>
              <View style={styles.brandMark}>
                <Text style={styles.brandMarkText}>F</Text>
              </View>
              <Text style={styles.brandName}>FORGE</Text>
            </View>

            <Button
              icon={<ForgeSymbol color={colors.text.primary} fallback="U" name="person" size={18} />}
              onPress={openLoginModal}
              style={styles.headerLoginButton}
              title="Entrar"
            />
          </View>

          <View style={styles.hero}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>
                TRANSFORME{'\n'}DISCIPLINA EM{'\n'}
                <Text style={styles.heroTitleAccent}>EVOLUÇÃO.</Text>
              </Text>
              <Text style={styles.heroText}>
                O Forge é o seu companheiro de jornada. Monitore seus treinos, acompanhe sua evolução e supere seus
                limites todos os dias.
              </Text>

              <View style={styles.ctaRow}>
                <Button
                  disabled
                  icon={<ForgeSymbol color={colors.text.disabled} fallback="T" name="dumbbell" size={18} />}
                  style={styles.startButton}
                  title="Começar agora"
                />
                <View style={styles.accessPrompt}>
                  <Text style={styles.accessPromptText}>Já possui acesso?</Text>
                  <Pressable accessibilityRole="button" onPress={openLoginModal} style={styles.inlineLoginButton}>
                    <Text style={styles.inlineLoginText}>Entrar</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            <View style={styles.previewPanel}>
              <View style={styles.previewGlow} />
            </View>
          </View>
        </View>
      </ScrollView>

      <DemoLoginModal
        isVisible={isLoginModalVisible}
        onClose={closeLoginModal}
        onSuccess={() => {
          closeLoginModal();
          router.replace('/' as Href);
        }}
      />
    </SafeAreaView>
  );
}

function DemoLoginModal({
  isVisible,
  onClose,
  onSuccess,
}: {
  readonly isVisible: boolean;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmitLocked = useRef(false);

  const closeModal = () => {
    if (isSubmitting) {
      return;
    }

    setError('');
    onClose();
  };

  const submitLogin = () => {
    if (isSubmitting || isSubmitLocked.current) {
      return;
    }

    isSubmitLocked.current = true;
    setIsSubmitting(true);
    setError('');

    const isValid =
      username.trim() === demoCredentials.username && password === demoCredentials.password;

    if (!isValid) {
      setError('Usuário ou senha inválidos.');
      isSubmitLocked.current = false;
      setIsSubmitting(false);
      return;
    }

    setUsername('');
    setPassword('');
    isSubmitLocked.current = false;
    setIsSubmitting(false);
    onSuccess();
  };

  return (
    <Modal animationType="fade" onRequestClose={closeModal} transparent visible={isVisible}>
      <Pressable accessibilityLabel="Fechar login" onPress={closeModal} style={styles.modalOverlay}>
        <Pressable onPress={(event) => event.stopPropagation()} style={styles.loginCard}>
          <Pressable accessibilityLabel="Fechar modal" accessibilityRole="button" onPress={closeModal} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>X</Text>
          </Pressable>

          <View style={styles.loginCopy}>
            <Text style={styles.loginTitle}>Entrar no Forge</Text>
            <Text style={styles.loginText}>Use as credenciais de demonstração para acessar o projeto.</Text>
          </View>

          <View style={styles.credentialsBox}>
            <Text style={styles.credentialsText}>
              Usuário: <Text style={styles.credentialsValue}>admin</Text>
            </Text>
            <Text style={styles.credentialsText}>
              Senha: <Text style={styles.credentialsValue}>admin</Text>
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Usuário</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSubmitting}
              onChangeText={setUsername}
              onSubmitEditing={submitLogin}
              placeholder="Digite o usuário"
              placeholderTextColor={colors.text.disabled}
              returnKeyType="next"
              style={styles.input}
              value={username}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Senha</Text>
            <TextInput
              editable={!isSubmitting}
              onChangeText={setPassword}
              onSubmitEditing={submitLogin}
              placeholder="Digite a senha"
              placeholderTextColor={colors.text.disabled}
              returnKeyType="done"
              secureTextEntry
              style={styles.input}
              value={password}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.modalActions}>
            <Button disabled={isSubmitting} onPress={closeModal} title="Cancelar" variant="secondary" />
            <Button loading={isSubmitting} onPress={submitLogin} title="Entrar" />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: Platform.select({
      web: spacing[8],
      default: spacing[4],
    }),
    paddingVertical: spacing[8],
  },
  page: {
    width: '100%',
    maxWidth: 1180,
    gap: spacing[10],
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing[4],
  },
  brand: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing[3],
  },
  brandMark: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    borderWidth: borders.width.strong,
    borderColor: colors.forge.hotOrange,
  },
  brandMarkText: {
    ...typography.identity.logo,
    color: colors.forge.hotOrange,
    fontSize: 24,
    lineHeight: 28,
  },
  brandName: {
    ...typography.identity.logo,
    color: colors.text.primary,
    fontSize: 30,
    lineHeight: 36,
  },
  headerLoginButton: {
    borderColor: colors.forge.hotOrange,
  },
  hero: {
    flexDirection: Platform.select({
      web: 'row',
      default: 'column',
    }),
    alignItems: 'center',
    gap: spacing[12],
  },
  heroCopy: {
    flex: 1,
    width: '100%',
    gap: spacing[5],
  },
  heroTitle: {
    ...typography.display,
    color: colors.text.primary,
    fontSize: Platform.select({
      web: 54,
      default: 34,
    }),
    lineHeight: Platform.select({
      web: 62,
      default: 42,
    }),
  },
  heroTitleAccent: {
    color: colors.forge.hotOrange,
  },
  heroText: {
    ...typography.body.default,
    maxWidth: 430,
    color: colors.text.secondary,
    fontSize: 18,
    lineHeight: 30,
  },
  ctaRow: {
    alignItems: Platform.select({
      web: 'center',
      default: 'stretch',
    }),
    flexDirection: Platform.select({
      web: 'row',
      default: 'column',
    }),
    gap: spacing[5],
  },
  startButton: {
    opacity: 0.58,
  },
  accessPrompt: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing[2],
    justifyContent: Platform.select({
      web: 'flex-start',
      default: 'center',
    }),
  },
  accessPromptText: {
    ...typography.body.default,
    color: colors.text.primary,
  },
  inlineLoginButton: {
    minHeight: componentSizes.touchTarget.global,
    justifyContent: 'center',
  },
  inlineLoginText: {
    ...typography.button,
    color: colors.forge.hotOrange,
    textDecorationLine: 'underline',
  },
  previewPanel: {
    flex: 1,
    width: '100%',
    minHeight: Platform.select({
      web: 420,
      default: 240,
    }),
    borderRadius: radius.xl,
    borderWidth: borders.width.default,
    borderColor: colors.forge.hotOrange,
    borderStyle: 'dashed',
    backgroundColor: '#090706',
    overflow: 'hidden',
  },
  previewGlow: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(242, 122, 26, 0.16)',
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
  },
  loginCard: {
    width: '100%',
    maxWidth: 420,
    gap: spacing[4],
    padding: spacing[5],
    borderRadius: radius.lg,
    borderWidth: borders.width.default,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.cardElevated,
    boxShadow: '0 22px 48px rgba(0, 0, 0, 0.42)',
    elevation: 24,
  },
  closeButton: {
    position: 'absolute',
    top: spacing[3],
    right: spacing[3],
    width: componentSizes.touchTarget.global,
    height: componentSizes.touchTarget.global,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.circular,
  },
  closeButtonText: {
    ...typography.button,
    color: colors.text.secondary,
  },
  loginCopy: {
    gap: spacing[2],
    paddingRight: spacing[10],
  },
  loginTitle: {
    ...typography.cardTitle,
    color: colors.text.primary,
    fontSize: 20,
    lineHeight: 26,
  },
  loginText: {
    ...typography.body.secondary,
    color: colors.text.secondary,
  },
  credentialsBox: {
    gap: spacing[1],
    padding: spacing[3],
    borderRadius: radius.md,
    borderWidth: borders.width.default,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.default,
  },
  credentialsText: {
    ...typography.body.secondary,
    color: colors.text.secondary,
  },
  credentialsValue: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.interface.bold,
    fontWeight: typography.fontWeight.bold,
  },
  inputGroup: {
    gap: spacing[2],
  },
  inputLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  input: {
    minHeight: componentSizes.buttonHeight.lg,
    borderRadius: radius.lg,
    borderWidth: borders.width.default,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.default,
    color: colors.text.primary,
    paddingHorizontal: spacing[3],
    ...typography.body.default,
  },
  errorText: {
    ...typography.body.secondary,
    color: colors.semantic.error,
  },
  modalActions: {
    flexDirection: Platform.select({
      web: 'row',
      default: 'column',
    }),
    gap: spacing[3],
  },
});
