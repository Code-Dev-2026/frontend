import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { baseTokens } from '../../tokens/base';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const LOGO_VIEWBOX_WIDTH = 500;
const LOGO_VIEWBOX_HEIGHT = 558;
const LOGO_ASPECT_RATIO = LOGO_VIEWBOX_HEIGHT / LOGO_VIEWBOX_WIDTH;

// Colores oficiales del isotipo (tomados de `src/svg/logotipo-sin-texto.svg`).
const LOGO_BRAND_COLORS = {
  navy: '#023866',
  cyan: '#0ABAE2',
  orange: '#FCA11F',
  white: '#FFFFFF',
} as const;

// Trazados exactos de `packages/ui/src/svg/logotipo-sin-texto.svg`.
const LOGO_PATHS = {
  pinOuter:
    'M203.177 282.464C175.802 246.722 146.139 207.87 169.631 162.412C189.156 124.633 235.99 109.937 273.286 129.249C291.408 138.667 305.047 154.899 311.203 174.374C317.736 194.953 315.529 214.108 304.344 234.898C291.9 258.031 265.14 295.892 245.518 313.028C239.902 317.933 204.164 310.394 192.747 310.707C164.531 311.482 146.936 315.862 132.95 342.991C112.397 371.164 125.57 419.391 148.369 442.019C149.693 443.332 153.329 446.99 153.695 448.59C143.546 440.936 134.761 430.69 125.735 421.837C93.0921 389.821 92.8336 334.047 127.008 303.065C148.853 283.259 175.178 281.157 203.177 282.464Z',
  pinInner:
    'M235.601 149.958C247.598 149.534 258.635 152.942 267.989 160.601C278.041 168.764 284.372 180.641 285.544 193.537C287.849 219.035 255.562 258.551 239.233 277.865C238.636 278.539 238.667 278.351 237.685 278.719C234.412 276.188 228.281 268.401 225.418 264.415C213.151 246.759 192.414 222.406 190.223 200.583C187.499 173.461 210.264 152.202 235.601 149.958Z',
  pinDot:
    'M233.949 177.544C245.104 175.33 255.952 182.542 258.227 193.686C260.502 204.829 253.35 215.717 242.221 218.054C231.004 220.409 220.013 213.188 217.72 201.958C215.427 190.728 222.707 179.776 233.949 177.544Z',
  shieldTop:
    'M225.041 60.5811C228.887 60.2297 232.746 60.0372 236.608 60.0035C246.427 59.8639 256.235 60.7241 265.88 62.5715C287.009 66.8131 314.48 76.96 335.989 82.6633C353.004 88.7537 372.732 91.7906 389.263 98.8635C419.891 111.968 415.251 146.977 415.343 172.018L386.302 178.992C386.219 165.616 387.348 148.627 385.355 135.641C383.633 124.426 362.407 120.619 352.46 117.762C340.937 114.451 329.432 111.081 317.945 107.654C296.864 101.4 273.55 93.097 251.949 89.7444C225.417 85.626 198.74 95.315 173.592 102.808L100.026 124.929C96.8467 126.657 94.2645 128.758 92.3525 131.894C91.0408 134.056 90.2274 136.483 89.9717 139C89.0058 148.037 89.5585 178.744 89.6912 188.716C90.0288 214.109 88.6923 244.798 90.8503 269.753C92.1573 283.712 94.5587 297.546 98.0326 311.128C88.5486 329.727 86.8958 337.781 84.2215 357.991C57.5169 298.068 60.0373 247.024 60.6938 183.177C60.8726 165.781 59.7389 147.182 61.9465 129.848C63.4122 118.334 75.6717 104.203 86.2303 99.4486C99.3623 94.2431 113.9 90.5963 127.451 86.5521L173.511 72.79C191.869 67.2992 205.789 62.3109 225.041 60.5811Z',
  checkArrow:
    'M425.379 187.725C433.472 187.586 440.377 193.345 439.622 202.011C437.876 221.877 433.297 241.626 430.528 261.403C429.926 265.705 428.829 273.452 427.318 277.261C423.457 286.993 408.984 288.749 403.088 280.045C397.453 271.727 402.128 256.495 403.671 247.006L300.714 355.086L267.399 390.455C261.238 397.005 255.187 403.962 248.585 410.066C245.426 412.986 241.744 415.133 237.287 414.861C227.443 414.262 202.982 384.058 194.931 375.328C189.744 369.953 180.171 361.528 180.561 353.744C181.195 342.025 194.343 335.416 203.521 343.49C215.344 353.892 227.124 367.616 237.92 379.198C269.46 344.905 303.957 309.62 336.275 275.961L365.736 245.096C370.327 240.275 378.293 232.335 382.171 227.38C366.33 230.275 349.502 240.251 344.137 217.893C345.476 211.749 346.936 206.756 353.608 204.787C370.032 199.939 386.998 196.666 403.633 192.527C410.723 190.763 418.183 188.964 425.379 187.725Z',
  shieldBottom:
    'M387.675 288.484C394.848 297.021 398.188 299.978 409.439 302.983C392.542 392.863 326.473 460.541 245.238 497.048C227.505 505.018 168.432 461.258 153.696 448.59C153.329 446.99 149.693 443.332 148.369 442.019C125.571 419.391 112.397 371.164 132.95 342.991C128.801 359.143 126.946 373.368 136.597 388.25C157.298 420.169 203.62 453.062 238.147 468.632C297.107 441.653 348.181 393.603 371.176 332.122C373.189 326.706 374.947 321.199 376.446 315.619C379.49 303.906 379.061 297.701 387.675 288.484Z',
} as const;

const PATH_LENGTHS = {
  shieldTop: 1750,
  shieldBottom: 1150,
  pinOuter: 1300,
  pinDot: 180,
  checkArrow: 1200,
} as const;

export type BrandLoaderProps = {
  /** Ancho del isotipo en px (altura proporcional). Por defecto: 56. */
  size?: number;
  /** Etiqueta breve opcional debajo del isotipo (ej. "Cargando…"). */
  label?: string;
  /** Centra el cargador ocupando todo el contenedor sobre fondo blanco. */
  fullScreen?: boolean;
  /** Duración de un ciclo completo de trazado en ms. Por defecto: 2400. */
  cycleDurationMs?: number;
  /** Desactiva la animación si es `false` (útil en capturas o tests). */
  animated?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function BrandLoader({
  size = 56,
  label,
  fullScreen = false,
  cycleDurationMs = 3400,
  animated = true,
  accessibilityLabel = label ?? 'Cargando Camino Seguro',
  style,
  testID,
}: BrandLoaderProps) {
  const [reduceMotion, setReduceMotion] = useState(false);

  const shieldDraw = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const shieldFill = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const pinDraw = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const pinFill = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const checkDraw = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const checkFill = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const logoOpacity = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setReduceMotion(enabled);
      })
      .catch(() => {
        // Fallback silencioso si la plataforma no expone el estado de movimiento.
      });

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => {
        setReduceMotion(enabled);
      },
    );

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!animated) {
      shieldDraw.setValue(1);
      shieldFill.setValue(1);
      pinDraw.setValue(1);
      pinFill.setValue(1);
      checkDraw.setValue(1);
      checkFill.setValue(1);
      logoOpacity.setValue(1);
      logoScale.setValue(1);
      return undefined;
    }

    if (reduceMotion) {
      shieldDraw.setValue(1);
      shieldFill.setValue(1);
      pinDraw.setValue(1);
      pinFill.setValue(1);
      checkDraw.setValue(1);
      checkFill.setValue(1);
      logoScale.setValue(1);

      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(logoOpacity, {
            toValue: 0.45,
            duration: Math.round(cycleDurationMs * 0.4),
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
            isInteraction: false,
          }),
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: Math.round(cycleDurationMs * 0.4),
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
            isInteraction: false,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }

    const scale = cycleDurationMs / 2400;
    const ms = (value: number) => Math.max(80, Math.round(value * scale));

    const resetAll = () => {
      shieldDraw.setValue(0);
      shieldFill.setValue(0);
      pinDraw.setValue(0);
      pinFill.setValue(0);
      checkDraw.setValue(0);
      checkFill.setValue(0);
      logoScale.setValue(0.96);
      logoOpacity.setValue(1);
    };

    resetAll();

    const loop = Animated.loop(
      Animated.sequence([
        // Fase 1: trazado y relleno progresivo del escudo exterior
        Animated.parallel([
          Animated.timing(logoScale, {
            toValue: 1,
            duration: ms(420),
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
            isInteraction: false,
          }),
          Animated.timing(shieldDraw, {
            toValue: 1,
            duration: ms(680),
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: false,
            isInteraction: false,
          }),
          Animated.sequence([
            Animated.delay(ms(340)),
            Animated.timing(shieldFill, {
              toValue: 1,
              duration: ms(340),
              easing: Easing.out(Easing.quad),
              useNativeDriver: false,
              isInteraction: false,
            }),
          ]),
          // Fase 2: pin de ubicación y punto naranja
          Animated.sequence([
            Animated.delay(ms(420)),
            Animated.parallel([
              Animated.timing(pinDraw, {
                toValue: 1,
                duration: ms(480),
                easing: Easing.inOut(Easing.cubic),
                useNativeDriver: false,
                isInteraction: false,
              }),
              Animated.sequence([
                Animated.delay(ms(220)),
                Animated.timing(pinFill, {
                  toValue: 1,
                  duration: ms(280),
                  easing: Easing.out(Easing.quad),
                  useNativeDriver: false,
                  isInteraction: false,
                }),
              ]),
            ]),
          ]),
          // Fase 3: flecha / chulito cian ascendente
          Animated.sequence([
            Animated.delay(ms(760)),
            Animated.parallel([
              Animated.timing(checkDraw, {
                toValue: 1,
                duration: ms(520),
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
                isInteraction: false,
              }),
              Animated.sequence([
                Animated.delay(ms(220)),
                Animated.timing(checkFill, {
                  toValue: 1,
                  duration: ms(300),
                  easing: Easing.out(Easing.quad),
                  useNativeDriver: false,
                  isInteraction: false,
                }),
              ]),
            ]),
          ]),
        ]),
        // Fase 4: pausa limpia con el isotipo completo y sutil respiro
        Animated.sequence([
          Animated.timing(logoScale, {
            toValue: 1.04,
            duration: ms(260),
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
            isInteraction: false,
          }),
          Animated.timing(logoScale, {
            toValue: 1,
            duration: ms(260),
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
            isInteraction: false,
          }),
        ]),
        Animated.delay(ms(220)),
        // Fase 5: desvanecimiento suave antes de reiniciar el trazado
        Animated.timing(logoOpacity, {
          toValue: 0,
          duration: ms(240),
          easing: Easing.in(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.parallel([
          Animated.timing(shieldDraw, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
            isInteraction: false,
          }),
          Animated.timing(shieldFill, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
            isInteraction: false,
          }),
          Animated.timing(pinDraw, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
            isInteraction: false,
          }),
          Animated.timing(pinFill, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
            isInteraction: false,
          }),
          Animated.timing(checkDraw, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
            isInteraction: false,
          }),
          Animated.timing(checkFill, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
            isInteraction: false,
          }),
          Animated.timing(logoScale, {
            toValue: 0.96,
            duration: 0,
            useNativeDriver: false,
            isInteraction: false,
          }),
        ]),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: ms(120),
          useNativeDriver: false,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [
    animated,
    cycleDurationMs,
    reduceMotion,
    shieldDraw,
    shieldFill,
    pinDraw,
    pinFill,
    checkDraw,
    checkFill,
    logoOpacity,
    logoScale,
  ]);

  const width = size;
  const height = Math.round(size * LOGO_ASPECT_RATIO);

  const shieldTopOffset = shieldDraw.interpolate({
    inputRange: [0, 1],
    outputRange: [PATH_LENGTHS.shieldTop, 0],
  });
  const shieldBottomOffset = shieldDraw.interpolate({
    inputRange: [0, 1],
    outputRange: [PATH_LENGTHS.shieldBottom, 0],
  });
  const pinOuterOffset = pinDraw.interpolate({
    inputRange: [0, 1],
    outputRange: [PATH_LENGTHS.pinOuter, 0],
  });
  const pinDotOffset = pinDraw.interpolate({
    inputRange: [0, 1],
    outputRange: [PATH_LENGTHS.pinDot, 0],
  });
  const checkArrowOffset = checkDraw.interpolate({
    inputRange: [0, 1],
    outputRange: [PATH_LENGTHS.checkArrow, 0],
  });

  const strokeWidth = 10;

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityLiveRegion="polite"
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
      style={[styles.container, fullScreen && styles.fullScreen, style]}
      testID={testID}
    >
      <Animated.View
        style={{
          opacity: logoOpacity,
          transform: [{ scale: logoScale }],
        }}
      >
        <Svg
          fill="none"
          height={height}
          viewBox={`0 0 ${LOGO_VIEWBOX_WIDTH} ${LOGO_VIEWBOX_HEIGHT}`}
          width={width}
        >
          <AnimatedPath
            d={LOGO_PATHS.pinOuter}
            fill={LOGO_BRAND_COLORS.navy}
            fillOpacity={pinFill}
            stroke={LOGO_BRAND_COLORS.navy}
            strokeDasharray={PATH_LENGTHS.pinOuter}
            strokeDashoffset={pinOuterOffset}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
          />
          <AnimatedPath
            d={LOGO_PATHS.pinInner}
            fill={LOGO_BRAND_COLORS.white}
            fillOpacity={pinFill}
          />
          <AnimatedPath
            d={LOGO_PATHS.pinDot}
            fill={LOGO_BRAND_COLORS.orange}
            fillOpacity={pinFill}
            stroke={LOGO_BRAND_COLORS.orange}
            strokeDasharray={PATH_LENGTHS.pinDot}
            strokeDashoffset={pinDotOffset}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
          />
          <AnimatedPath
            d={LOGO_PATHS.shieldTop}
            fill={LOGO_BRAND_COLORS.navy}
            fillOpacity={shieldFill}
            stroke={LOGO_BRAND_COLORS.navy}
            strokeDasharray={PATH_LENGTHS.shieldTop}
            strokeDashoffset={shieldTopOffset}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
          />
          <AnimatedPath
            d={LOGO_PATHS.checkArrow}
            fill={LOGO_BRAND_COLORS.cyan}
            fillOpacity={checkFill}
            stroke={LOGO_BRAND_COLORS.cyan}
            strokeDasharray={PATH_LENGTHS.checkArrow}
            strokeDashoffset={checkArrowOffset}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
          />
          <AnimatedPath
            d={LOGO_PATHS.shieldBottom}
            fill={LOGO_BRAND_COLORS.cyan}
            fillOpacity={shieldFill}
            stroke={LOGO_BRAND_COLORS.cyan}
            strokeDasharray={PATH_LENGTHS.shieldBottom}
            strokeDashoffset={shieldBottomOffset}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
          />
        </Svg>
      </Animated.View>

      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: baseTokens.spacing.md,
    justifyContent: 'center',
  },
  fullScreen: {
    backgroundColor: baseTokens.colors.surface,
    flex: 1,
    width: '100%',
  },
  label: {
    ...baseTokens.typography.bodySmall,
    color: baseTokens.colors.textMuted,
    textAlign: 'center',
  },
});
