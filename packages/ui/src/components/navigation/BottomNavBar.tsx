import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { baseTokens } from '../../tokens/base';
import { AnimatedNavIcon, type NavIconName } from './AnimatedNavIcon';

export type BottomNavItem<T extends string = string> = {
  id: T;
  label: string;
  icon: NavIconName;
};

export type BottomNavBarProps<T extends string = string> = {
  items: ReadonlyArray<BottomNavItem<T>>;
  activeId: T;
  onSelect?: (id: T) => void;
  testID?: string;
};

type BottomNavTabButtonProps<T extends string> = {
  item: BottomNavItem<T>;
  isActive: boolean;
  onPress: () => void;
  testID?: string;
};

function BottomNavTabButton<T extends string>({
  item,
  isActive,
  onPress,
  testID,
}: BottomNavTabButtonProps<T>) {
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      android_ripple={null}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={styles.navItem}
      testID={testID}
    >
      <AnimatedNavIcon
        active={isActive}
        activeColor={baseTokens.colors.navy900}
        cutoutColor={baseTokens.colors.surface}
        inactiveColor={baseTokens.colors.textMuted}
        name={item.icon}
        pressed={pressed}
        size={22}
      />
      <Text
        numberOfLines={1}
        style={[styles.navItemLabel, isActive && styles.navItemLabelActive]}
      >
        {item.label}
      </Text>
    </Pressable>
  );
}

export function BottomNavBar<T extends string = string>({
  items,
  activeId,
  onSelect,
  testID,
}: BottomNavBarProps<T>) {
  return (
    <View style={styles.bottomNav} testID={testID}>
      {items.map((item) => (
        <BottomNavTabButton
          key={item.id}
          isActive={activeId === item.id}
          item={item}
          onPress={() => onSelect?.(item.id)}
          testID={testID ? `${testID}-${item.id}` : undefined}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    alignItems: 'center',
    backgroundColor: baseTokens.colors.surface,
    borderTopColor: baseTokens.colors.borderSoft,
    borderTopWidth: baseTokens.borderWidth.default,
    flexDirection: 'row',
    height: 66,
    paddingHorizontal: baseTokens.spacing.sm,
    paddingVertical: 7,
    width: '100%',
  },
  navItem: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    flex: 1,
    gap: 3,
    height: 52,
    justifyContent: 'center',
    minHeight: baseTokens.sizes.touchMin,
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  navItemLabel: {
    ...baseTokens.typography.caption,
    color: baseTokens.colors.textMuted,
    textAlign: 'center',
  },
  navItemLabelActive: {
    color: baseTokens.colors.navy900,
    fontFamily: 'Inter_600SemiBold',
  },
});
