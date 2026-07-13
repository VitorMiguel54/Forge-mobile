import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { borders, colors, componentSizes, radius, spacing, typography } from '@/theme';

export type BottomNavigationItem = {
  readonly label: string;
  readonly href: string;
};

export type BottomNavigationProps = {
  readonly activeHref: string;
  readonly items?: readonly BottomNavigationItem[];
};

const defaultItems: readonly BottomNavigationItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Treinos', href: '/workouts' },
  { label: 'Histórico', href: '/history' },
  { label: 'Conquistas', href: '/achievements' },
  { label: 'Perfil', href: '/profile' },
];

export function BottomNavigation({ activeHref, items = defaultItems }: BottomNavigationProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {items.map((item) => {
          const isActive = item.href === activeHref;

          return (
            <Link key={item.label} href={item.href as Href} asChild>
              <Pressable
                accessibilityRole="link"
                accessibilityState={{ selected: isActive }}
                style={({ pressed }) => [
                  styles.item,
                  isActive && styles.activeItem,
                  pressed && styles.pressedItem,
                ]}
              >
                <View style={[styles.indicator, isActive && styles.activeIndicator]} />
                <Text style={[styles.label, isActive && styles.activeLabel]}>{item.label}</Text>
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
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
  },
  container: {
    width: '100%',
    maxWidth: spacing[10] * spacing[5],
    minHeight: componentSizes.bottomNavigation.height,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[1],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[2],
    borderRadius: radius.xl,
    borderWidth: borders.width.default,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.cardElevated,
  },
  item: {
    flex: 1,
    minHeight: componentSizes.touchTarget.ios,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
    borderRadius: radius.lg,
  },
  activeItem: {
    backgroundColor: colors.surface.default,
  },
  pressedItem: {
    opacity: 0.84,
  },
  indicator: {
    width: spacing[5],
    height: borders.width.strong,
    borderRadius: radius.circular,
    backgroundColor: colors.border.default,
  },
  activeIndicator: {
    backgroundColor: colors.brand.primary,
  },
  label: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  activeLabel: {
    color: colors.text.primary,
  },
});
