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
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';

import { Button, ForgeSymbol } from '@/components';
import { borders, colors, componentSizes, radius, spacing, typography } from '@/theme';

const demoCredentials = {
  username: 'admin',
  password: 'admin',
} as const;

const narrowMobileBreakpoint = 360;

const offerItems = [
  {
    icon: { ios: 'dumbbell', android: 'fitness_center', web: 'fitness_center' },
    iconFallback: 'T',
    title: 'Monte seus treinos',
    description: 'Crie treinos personalizados com exercícios, séries, repetições e intensidade.',
  },
  {
    icon: { ios: 'chart.bar', android: 'monitoring', web: 'monitoring' },
    iconFallback: 'G',
    title: 'Acompanhe sua evolução',
    description: 'Monitore peso, volume, treinos, água, sono e veja gráficos detalhados do seu progresso.',
  },
  {
    icon: { ios: 'trophy', android: 'emoji_events', web: 'emoji_events' },
    iconFallback: 'C',
    title: 'Sistema de conquistas',
    description: 'Desbloqueie conquistas conforme você evolui e mantenha a motivação alta.',
  },
  {
    icon: { ios: 'shield', android: 'shield', web: 'shield' },
    iconFallback: 'XP',
    title: 'Gamificação de verdade',
    description: 'Ganhe XP, suba de nível e transforme disciplina em resultados reais.',
  },
] as const;

export default function LandingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const isNarrowMobile = width < narrowMobileBreakpoint;

  const openLoginModal = () => setIsLoginModalVisible(true);
  const closeLoginModal = () => setIsLoginModalVisible(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
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
            <Text style={[styles.heroTitle, isNarrowMobile && styles.heroTitleNarrow]}>FORGE</Text>
            <Text style={[styles.heroSubtitle, isNarrowMobile && styles.heroSubtitleNarrow]}>
              Sua evolução começa <Text style={styles.heroAccent}>aqui.</Text>
            </Text>
            <Text style={styles.heroText}>
              O Forge é o seu companheiro de jornada.{'\n'}
              Monitore seus treinos, acompanhe seu progresso{'\n'}e supere seus limites todos os dias.
            </Text>
          </View>

          <View style={styles.accessBlock}>
            <Button
              disabled
              icon={<ForgeSymbol color="#1A0D03" fallback="T" name="dumbbell" size={18} />}
              style={styles.startButton}
              textStyle={styles.startButtonText}
              title="Começar agora"
            />
            <View style={styles.accessPrompt}>
              <Text style={styles.accessPromptText}>Já possui acesso?</Text>
              <Pressable accessibilityRole="button" onPress={openLoginModal} style={styles.inlineLoginButton}>
                <Text style={styles.inlineLoginText}>Entrar</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.offerSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionRule} />
              <Text style={styles.offerSectionTitle}>
                O QUE O <Text style={styles.offerSectionAccent}>FORGE</Text> OFERECE
              </Text>
              <View style={styles.sectionRule} />
            </View>

            <View style={styles.offerList}>
              {offerItems.map((item, index) => (
                <View key={item.title} style={[styles.offerItem, index === offerItems.length - 1 && styles.offerItemLast]}>
                  <View style={styles.offerIconCircle}>
                    <ForgeSymbol
                      color={colors.forge.hotOrange}
                      fallback={item.iconFallback}
                      name={item.icon}
                      size={34}
                      weight="semibold"
                    />
                  </View>
                  <View style={styles.offerCopy}>
                    <Text style={styles.offerTitle}>{item.title}</Text>
                    <Text style={styles.offerDescription}>{item.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <DemoLoginModal
        isVisible={isLoginModalVisible}
        onClose={closeLoginModal}
        onSuccess={() => {
          closeLoginModal();
          router.replace('/home' as Href);
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

    const isValid = username.trim() === demoCredentials.username && password === demoCredentials.password;

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
          <Pressable
            accessibilityLabel="Fechar modal"
            accessibilityRole="button"
            onPress={closeModal}
            style={styles.closeButton}
          >
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
    paddingHorizontal: spacing[4],
    paddingTop: spacing[5],
    paddingBottom: spacing[12],
  },
  page: {
    width: '100%',
    maxWidth: 760,
    gap: spacing[8],
  },
  header: {
    width: '100%',
    minWidth: 0,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  brand: {
    minWidth: 0,
    flexShrink: 1,
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing[2],
  },
  brandMark: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    borderWidth: borders.width.active,
    borderColor: colors.forge.hotOrange,
  },
  brandMarkText: {
    ...typography.identity.logo,
    color: colors.forge.hotOrange,
    fontSize: 20,
    lineHeight: 24,
  },
  brandName: {
    ...typography.identity.logo,
    flexShrink: 1,
    color: colors.text.primary,
    fontSize: 22,
    lineHeight: 28,
  },
  headerLoginButton: {
    flexShrink: 0,
    minHeight: componentSizes.touchTarget.global,
    paddingHorizontal: spacing[3],
    borderColor: colors.forge.hotOrange,
    backgroundColor: colors.forge.hotOrange,
  },
  hero: {
    width: '100%',
    minWidth: 0,
    gap: spacing[4],
    paddingTop: spacing[6],
  },
  heroTitle: {
    ...typography.display,
    width: '100%',
    flexShrink: 1,
    color: colors.text.primary,
    fontSize: 64,
    lineHeight: 72,
  },
  heroTitleNarrow: {
    fontSize: 52,
    lineHeight: 60,
  },
  heroSubtitle: {
    ...typography.display,
    width: '100%',
    flexShrink: 1,
    color: colors.text.primary,
    fontSize: 40,
    lineHeight: 48,
  },
  heroSubtitleNarrow: {
    fontSize: 34,
    lineHeight: 42,
  },
  heroAccent: {
    color: colors.forge.hotOrange,
  },
  heroText: {
    ...typography.body.default,
    width: '100%',
    color: colors.text.secondary,
    fontSize: 18,
    lineHeight: 31,
  },
  accessBlock: {
    width: '100%',
    gap: spacing[4],
  },
  startButton: {
    width: '100%',
    minHeight: 64,
    borderColor: colors.forge.hotOrange,
    backgroundColor: 'rgba(242, 122, 26, 0.74)',
    opacity: 0.78,
  },
  startButtonText: {
    color: '#1A0D03',
  },
  accessPrompt: {
    minWidth: 0,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[2],
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
  offerSection: {
    width: '100%',
    gap: spacing[5],
    paddingTop: spacing[4],
  },
  sectionHeader: {
    width: '100%',
    minWidth: 0,
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing[3],
  },
  sectionRule: {
    flex: 1,
    height: borders.width.default,
    backgroundColor: colors.border.default,
  },
  offerSectionTitle: {
    ...typography.sectionTitle,
    flexShrink: 0,
    color: colors.text.primary,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
  },
  offerSectionAccent: {
    color: colors.forge.hotOrange,
  },
  offerList: {
    width: '100%',
  },
  offerItem: {
    width: '100%',
    minWidth: 0,
    flexDirection: 'row',
    gap: spacing[4],
    paddingVertical: spacing[4],
    borderBottomWidth: borders.width.default,
    borderBottomColor: colors.border.default,
  },
  offerItemLast: {
    borderBottomWidth: 0,
  },
  offerIconCircle: {
    flexShrink: 0,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.circular,
    borderWidth: borders.width.default,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.default,
  },
  offerCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing[1],
  },
  offerTitle: {
    ...typography.cardTitle,
    color: colors.text.primary,
    fontSize: 20,
    lineHeight: 26,
  },
  offerDescription: {
    ...typography.body.default,
    color: colors.text.secondary,
    fontSize: 16,
    lineHeight: 24,
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
