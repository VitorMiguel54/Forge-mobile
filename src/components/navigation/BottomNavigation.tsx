import { Link, type Href } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { ForgeSymbol, type ForgeSymbolName } from '@/components/icons/ForgeSymbol';
import { borders, colors, componentSizes, radius, spacing, typography } from '@/theme';

export type BottomNavigationItem = {
  readonly href: Href;
  readonly icon: ForgeSymbolName;
  readonly iconFallback: string;
  readonly label: string;
};

export type BottomNavigationProps = {
  readonly activeHref: Href;
  readonly items?: readonly BottomNavigationItem[];
};

const defaultItems: readonly BottomNavigationItem[] = [
  { label: 'Home', href: '/', icon: { ios: 'house', android: 'home', web: 'home' }, iconFallback: 'H' },
  {
    label: 'Treinos',
    href: '/workouts',
    icon: { ios: 'dumbbell', android: 'fitness_center', web: 'fitness_center' },
    iconFallback: 'T',
  },
  {
    label: 'Histórico',
    href: '/history',
    icon: { ios: 'chart.bar', android: 'monitoring', web: 'monitoring' },
    iconFallback: 'G',
  },
  {
    label: 'Conquistas',
    href: '/achievements',
    icon: { ios: 'trophy', android: 'emoji_events', web: 'emoji_events' },
    iconFallback: 'C',
  },
  {
    label: 'Perfil',
    href: '/profile',
    icon: { ios: 'person', android: 'person', web: 'person' },
    iconFallback: 'P',
  },
];

export function BottomNavigation({ activeHref, items = defaultItems }: BottomNavigationProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {items.map((item) => {
          const isActive = item.href === activeHref;

          return (
            <Link key={item.label} href={item.href} asChild>
              <Pressable
                accessibilityRole="link"
                accessibilityState={{ selected: isActive }}
                style={({ pressed }) => [styles.item, pressed && styles.pressedItem]}
              >
                <View style={styles.iconSlot}>
                  <ForgeSymbol
                    color={isActive ? colors.brand.primary : colors.text.secondary}
                    fallback={item.iconFallback}
                    name={item.icon}
                    size={25}
                    weight="semibold"
                  />
                </View>
                <Text numberOfLines={1} style={[styles.label, isActive && styles.activeLabel]}>
                  {item.label}
                </Text>
              </Pressable>
            </Link>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: Platform.select({
      web: 'fixed',
      default: 'absolute',
    }),
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingBottom: spacing[2],
    borderTopWidth: borders.width.default,
    borderTopColor: colors.border.default,
    backgroundColor: colors.background.primary,
    zIndex: 10,
    elevation: 10,
  },
  container: {
    width: '100%',
    maxWidth: spacing[10] * spacing[10] + spacing[8],
    minHeight: componentSizes.bottomNavigation.height,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[1],
    paddingVertical: spacing[2],
    backgroundColor: colors.background.primary,
  },
  item: {
    flex: 1,
    minWidth: 0,
    minHeight: componentSizes.touchTarget.ios,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
    borderRadius: radius.lg,
  },
  pressedItem: {
    opacity: 0.84,
  },
  iconSlot: {
    width: spacing[8],
    height: spacing[8],
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: colors.text.secondary,
    textAlign: 'center',
    ...typography.navigation,
  },
  activeLabel: {
    color: colors.brand.primary,
  },
});
