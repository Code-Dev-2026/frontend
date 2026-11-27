import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { baseTokens } from '../../tokens/base';
import { BrandLoader } from './BrandLoader';

export type BrandLoadingBackdrop = 'solid' | 'translucent';

export type BrandLoadingOverlayProps = {
  /** Controla si el overlay de carga está activo. */
  visible: boolean;
  /** Etiqueta breve opcional debajo del isotipo (ej. "Cargando…"). */
  label?: string;
  /** Ancho del isotipo centrado en px. Por defecto: 52. */
  size?: number;
  /** Duración de un ciclo de trazado en ms. Por defecto: 1800 para transiciones ágiles. */
  cycleDurationMs?: number;
  /** Fondo del overlay: `translucent` (velo blanco limpio) o `solid` (blanco puro). */
  backdrop?: BrandLoadingBackdrop;
  /** Retraso opcional en ms antes de mostrar el overlay para evitar parpadeos en cargas muy rápidas. */
  delayMs?: number;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const FADE_IN_DURATION_MS = 160;
const FADE_OUT_DURATION_MS = 180;

export function BrandLoadingOverlay({
  visible,
  label,
  size = 52,
  cycleDurationMs = 1800,
  backdrop = 'translucent',
  delayMs = 0,
  accessibilityLabel,
  style,
  testID,
}: BrandLoadingOverlayProps) {
  const [shouldRender, setShouldRender] = useState(visible && delayMs <= 0);
  const renderedRef = useRef(shouldRender);
  renderedRef.current = shouldRender;
  const visibleRef = useRef(visible);
  visibleRef.current = visible;
  const opacity = useRef(
    new Animated.Value(visible && delayMs <= 0 ? 1 : 0),
  ).current;

  useEffect(() => {
    let delayTimer: ReturnType<typeof setTimeout> | undefined;
    let activeAnimation: Animated.CompositeAnimation | undefined;

    if (visible) {
      const fadeIn = () => {
        renderedRef.current = true;
        setShouldRender(true);
        activeAnimation = Animated.timing(opacity, {
          toValue: 1,
          duration: FADE_IN_DURATION_MS,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
          isInteraction: false,
        });
        activeAnimation.start();
      };

      if (delayMs > 0 && !renderedRef.current) {
        delayTimer = setTimeout(fadeIn, delayMs);
      } else {
        fadeIn();
      }
    } else if (renderedRef.current) {
      activeAnimation = Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_OUT_DURATION_MS,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
        isInteraction: false,
      });
      activeAnimation.start(() => {
        if (!visibleRef.current) {
          renderedRef.current = false;
          setShouldRender(false);
        }
      });
    }

    return () => {
      if (delayTimer) clearTimeout(delayTimer);
      activeAnimation?.stop();
    };
  }, [delayMs, opacity, visible]);

  if (!shouldRender) return null;

  return (
    <Animated.View
      accessibilityViewIsModal={visible}
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        styles.overlay,
        backdrop === 'solid'
          ? styles.backdropSolid
          : styles.backdropTranslucent,
        { opacity },
        style,
      ]}
      testID={testID}
    >
      <View style={styles.center}>
        <BrandLoader
          accessibilityLabel={
            accessibilityLabel ?? label ?? 'Cargando pantalla'
          }
          cycleDurationMs={cycleDurationMs}
          label={label}
          size={size}
          testID={testID ? `${testID}-loader` : undefined}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  backdropSolid: {
    backgroundColor: baseTokens.colors.surface,
  },
  backdropTranslucent: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: baseTokens.spacing.xl,
  },
});
