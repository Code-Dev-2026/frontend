import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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
  const pillOpacity = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(pillOpacity, {
      toValue: isActive || pressed ? 1 : 0,
      duration: isActive || pressed ? 180 : 160,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
      isInteraction: false,
    }).start();
  }, [isActive, pillOpacity, pressed]);

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={styles.navItem}
      testID={testID}
    >
      <Animated.View
        pointerEvents="none"
        style={[styles.activePill, { opacity: pillOpacity }]}
      />
      <AnimatedNavIcon
        active={isActive}
        activeColor={baseTokens.colors.navy900}
        cutoutColor={
          isActive || pressed
            ? baseTokens.colors.infoBg
            : baseTokens.colors.surface
        }
        inactiveColor={baseTokens.colors.textMuted}
        name={item.icon}
        pressed={pressed}
        size={22}
      />
      <Text
        numberOfLines={1}
        style={[
          styles.navItemLabel,
          (isActive || pressed) && styles.navItemLabelActive,
        ]}
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
    borderRadius: 10,
    flex: 1,
    gap: 3,
    height: 52,
    justifyContent: 'center',
    minHeight: baseTokens.sizes.touchMin,
    overflow: 'hidden',
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  activePill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: baseTokens.colors.infoBg,
    borderRadius: 10,
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
