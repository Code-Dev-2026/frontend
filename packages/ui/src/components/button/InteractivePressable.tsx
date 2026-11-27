import { useCallback, useRef, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

export type InteractivePressableProps = Omit<
  PressableProps,
  'style' | 'children'
> & {
  children: ReactNode | ((state: { pressed: boolean }) => ReactNode);
  /** Color de relleno que aparece suavemente al presionar (transparente → relleno). */
  pressFillColor?: string;
  /** Escala táctil al presionar. Por defecto: 0.965. */
  pressedScale?: number;
  /** Radio del relleno animado; debe coincidir con el borde del botón. */
  borderRadius?: number;
  /** Estilo aplicado al contenedor animado exterior (márgenes, ancho, flex). */
  containerStyle?: StyleProp<ViewStyle>;
  /** Estilo aplicado al Pressable interior (fondo, bordes, padding, altura). */
  style?:
    | StyleProp<ViewStyle>
    | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
};

export function InteractivePressable({
  children,
  pressFillColor = 'rgba(255, 255, 255, 0.24)',
  pressedScale = 0.965,
  borderRadius = 12,
  containerStyle,
  style,
  disabled,
  onPressIn,
  onPressOut,
  ...rest
}: InteractivePressableProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const fillOpacity = useRef(new Animated.Value(0)).current;

  const handlePressIn = useCallback(
    (event: GestureResponderEvent) => {
      if (!disabled) {
        Animated.parallel([
          Animated.spring(scale, {
            toValue: pressedScale,
            speed: 40,
            bounciness: 4,
            useNativeDriver: true,
            isInteraction: false,
          }),
          Animated.timing(fillOpacity, {
            toValue: 1,
            duration: 120,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
            isInteraction: false,
          }),
        ]).start();
      }
      onPressIn?.(event);
    },
    [disabled, fillOpacity, onPressIn, pressedScale, scale],
  );

  const handlePressOut = useCallback(
    (event: GestureResponderEvent) => {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          speed: 26,
          bounciness: 6,
          useNativeDriver: true,
          isInteraction: false,
        }),
        Animated.timing(fillOpacity, {
          toValue: 0,
          duration: 210,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
          isInteraction: false,
        }),
      ]).start();
      onPressOut?.(event);
    },
    [fillOpacity, onPressOut, scale],
  );

  return (
    <Animated.View style={[containerStyle, { transform: [{ scale }] }]}>
      <Pressable
        {...rest}
        disabled={disabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={(state) => [
          styles.pressableBase,
          typeof style === 'function' ? style(state) : style,
        ]}
      >
        {(state) => (
          <>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.fillOverlay,
                {
                  backgroundColor: pressFillColor,
                  borderRadius,
                  opacity: fillOpacity,
                },
              ]}
            />
            {typeof children === 'function' ? children(state) : children}
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pressableBase: {
    overflow: 'hidden',
  },
  fillOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
