import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { baseTokens } from '../../tokens/base';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export type NavIconName = 'house' | 'map-pin' | 'bell' | 'user-round' | 'users';

export type AnimatedNavIconProps = {
  name: NavIconName;
  /** Cuando es `true`, el ícono pasa de contorno transparente a relleno sólido. */
  active: boolean;
  /** Activa el relleno anticipado mientras se mantiene presionado el tab. */
  pressed?: boolean;
  size?: number;
  activeColor?: string;
  inactiveColor?: string;
  /** Color de los recortes internos del ícono relleno (puerta en Inicio, centro en Mapa). */
  cutoutColor?: string;
};

const ICON_PATHS = {
  houseOuter:
    'M3 10C2.99993 9.70907 3.06333 9.42162 3.18579 9.15772C3.30824 8.89381 3.4868 8.6598 3.709 8.472L10.709 2.473C11.07 2.16791 11.5274 2.00052 12 2.00052C12.4726 2.00052 12.93 2.16791 13.291 2.473L20.291 8.472C20.5132 8.6598 20.6918 8.89381 20.8142 9.15772C20.9367 9.42162 21.0001 9.70907 21 10V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V10Z',
  houseDoorStroke:
    'M15 21V13C15 12.7348 14.8946 12.4804 14.7071 12.2929C14.5196 12.1054 14.2652 12 14 12H10C9.73478 12 9.48043 12.1054 9.29289 12.2929C9.10536 12.4804 9 12.7348 9 13V21',
  houseDoorFill:
    'M15 21V13C15 12.7348 14.8946 12.4804 14.7071 12.2929C14.5196 12.1054 14.2652 12 14 12H10C9.73478 12 9.48043 12.1054 9.29289 12.2929C9.10536 12.4804 9 12.7348 9 13V21Z',
  mapPinOuter:
    'M20 10C20 14.993 14.461 20.193 12.601 21.799C12.4277 21.9293 12.2168 21.9998 12 21.9998C11.7832 21.9998 11.5723 21.9293 11.399 21.799C9.539 20.193 4 14.993 4 10C4 7.87827 4.84285 5.84344 6.34315 4.34315C7.84344 2.84285 9.87827 2 12 2C14.1217 2 16.1566 2.84285 17.6569 4.34315C19.1571 5.84344 20 7.87827 20 10Z',
  mapPinInner:
    'M15 10C15 11.6569 13.6569 13 12 13C10.3431 13 9 11.6569 9 10C9 8.34315 10.3431 7 12 7C13.6569 7 15 8.34315 15 10Z',
  bellBody:
    'M3.262 15.326C3.13136 15.4692 3.04515 15.6472 3.01386 15.8385C2.98256 16.0298 3.00752 16.226 3.08571 16.4034C3.16389 16.5807 3.29194 16.7316 3.45426 16.8375C3.61658 16.9434 3.80618 16.9999 4 17H20C20.1938 17.0001 20.3834 16.9438 20.5459 16.8381C20.7083 16.7324 20.8365 16.5817 20.9149 16.4045C20.9933 16.2273 21.0185 16.0311 20.9874 15.8398C20.9564 15.6485 20.8704 15.4703 20.74 15.327C19.41 13.956 18 12.499 18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 12.499 4.589 13.956 3.262 15.326Z',
  bellClapper:
    'M10.268 21C10.4435 21.304 10.696 21.5565 11 21.732C11.3041 21.9075 11.6489 21.9999 12 21.9999C12.3511 21.9999 12.6959 21.9075 13 21.732C13.304 21.5565 13.5565 21.304 13.732 21',
  userHead:
    'M17 8C17 10.7614 14.7614 13 12 13C9.23858 13 7 10.7614 7 8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8Z',
  userBodyStroke:
    'M20 21C20 18.8783 19.1571 16.8434 17.6569 15.3431C16.1566 13.8429 14.1217 13 12 13C9.87827 13 7.84344 13.8429 6.34315 15.3431C4.84285 16.8434 4 18.8783 4 21',
  userBodyFill:
    'M20 21C20 18.8783 19.1571 16.8434 17.6569 15.3431C16.1566 13.8429 14.1217 13 12 13C9.87827 13 7.84344 13.8429 6.34315 15.3431C4.84285 16.8434 4 18.8783 4 21Z',
  usersPrimaryHead:
    'M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z',
  usersPrimaryTorsoFill:
    'M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H6C4.93913 15 3.92172 15.4214 3.17157 16.1716C2.42143 16.9217 2 17.9391 2 19V21Z',
  usersStroke:
    'M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H6C4.93913 15 3.92172 15.4214 3.17157 16.1716C2.42143 16.9217 2 17.9391 2 19V21M16 3.128C16.8578 3.35037 17.6174 3.85126 18.1597 4.55206C18.702 5.25286 18.9962 6.11389 18.9962 7C18.9962 7.88611 18.702 8.74714 18.1597 9.44794C17.6174 10.1487 16.8578 10.6496 16 10.872M22 21V19C21.9993 18.1137 21.7044 17.2528 21.1614 16.5523C20.6184 15.8519 19.8581 15.3516 19 15.13',
} as const;

export function AnimatedNavIcon({
  name,
  active,
  pressed = false,
  size = 22,
  activeColor = baseTokens.colors.navy900,
  inactiveColor = baseTokens.colors.textMuted,
  cutoutColor = baseTokens.colors.surface,
}: AnimatedNavIconProps) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const isFilled = active || pressed;

  const fillProgress = useRef(new Animated.Value(isFilled ? 1 : 0)).current;
  const iconScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setReduceMotion(enabled);
      })
      .catch(() => {
        // Fallback silencioso.
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      fillProgress.setValue(isFilled ? 1 : 0);
      iconScale.setValue(1);
      return;
    }

    Animated.timing(fillProgress, {
      toValue: isFilled ? 1 : 0,
      duration: isFilled ? 190 : 160,
      easing: isFilled ? Easing.out(Easing.cubic) : Easing.inOut(Easing.quad),
      useNativeDriver: false,
      isInteraction: false,
    }).start();

    if (pressed) {
      Animated.spring(iconScale, {
        toValue: 0.88,
        speed: 44,
        bounciness: 4,
        useNativeDriver: true,
        isInteraction: false,
      }).start();
    } else if (active) {
      Animated.sequence([
        Animated.spring(iconScale, {
          toValue: 1.08,
          speed: 38,
          bounciness: 8,
          useNativeDriver: true,
          isInteraction: false,
        }),
        Animated.spring(iconScale, {
          toValue: 1,
          speed: 28,
          bounciness: 6,
          useNativeDriver: true,
          isInteraction: false,
        }),
      ]).start();
    } else {
      Animated.spring(iconScale, {
        toValue: 1,
        speed: 30,
        bounciness: 4,
        useNativeDriver: true,
        isInteraction: false,
      }).start();
    }
  }, [active, fillProgress, iconScale, isFilled, pressed, reduceMotion]);

  const strokeColor = isFilled ? activeColor : inactiveColor;
  const outlineOnlyOpacity = fillProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  return (
    <Animated.View style={{ transform: [{ scale: iconScale }] }}>
      <Svg fill="none" height={size} viewBox="0 0 24 24" width={size}>
        {name === 'house' ? (
          <>
            <AnimatedPath
              d={ICON_PATHS.houseOuter}
              fill={activeColor}
              fillOpacity={fillProgress}
              stroke={strokeColor}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
            <AnimatedPath
              d={ICON_PATHS.houseDoorFill}
              fill={cutoutColor}
              fillOpacity={fillProgress}
            />
            <AnimatedPath
              d={ICON_PATHS.houseDoorStroke}
              fill="none"
              stroke={strokeColor}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity={outlineOnlyOpacity}
              strokeWidth={2}
            />
          </>
        ) : name === 'map-pin' ? (
          <>
            <AnimatedPath
              d={ICON_PATHS.mapPinOuter}
              fill={activeColor}
              fillOpacity={fillProgress}
              stroke={strokeColor}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
            <AnimatedPath
              d={ICON_PATHS.mapPinInner}
              fill={cutoutColor}
              fillOpacity={fillProgress}
              stroke={strokeColor}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity={outlineOnlyOpacity}
              strokeWidth={2}
            />
          </>
        ) : name === 'bell' ? (
          <>
            <AnimatedPath
              d={ICON_PATHS.bellBody}
              fill={activeColor}
              fillOpacity={fillProgress}
              stroke={strokeColor}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
            <Path
              d={ICON_PATHS.bellClapper}
              fill="none"
              stroke={strokeColor}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </>
        ) : name === 'user-round' ? (
          <>
            <AnimatedPath
              d={ICON_PATHS.userHead}
              fill={activeColor}
              fillOpacity={fillProgress}
              stroke={strokeColor}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
            <AnimatedPath
              d={ICON_PATHS.userBodyFill}
              fill={activeColor}
              fillOpacity={fillProgress}
            />
            <Path
              d={ICON_PATHS.userBodyStroke}
              fill="none"
              stroke={strokeColor}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </>
        ) : (
          <>
            <AnimatedPath
              d={ICON_PATHS.usersPrimaryHead}
              fill={activeColor}
              fillOpacity={fillProgress}
              stroke={strokeColor}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
            <AnimatedPath
              d={ICON_PATHS.usersPrimaryTorsoFill}
              fill={activeColor}
              fillOpacity={fillProgress}
            />
            <Path
              d={ICON_PATHS.usersStroke}
              fill="none"
              stroke={strokeColor}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </>
        )}
      </Svg>
    </Animated.View>
  );
}
