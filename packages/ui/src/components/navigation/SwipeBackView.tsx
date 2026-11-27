import { useEffect, useMemo, useRef, type PropsWithChildren } from 'react';
import {
  BackHandler,
  PanResponder,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

export type SwipeBackViewProps = PropsWithChildren<{
  /** Activa el gesto de deslizar hacia atrás y el botón/gesto atrás del sistema Android. */
  enabled?: boolean;
  /** Acción que vuelve a la pantalla anterior. */
  onBack?: () => void;
  /** Distancia horizontal mínima en px para disparar el regreso. Por defecto: 72. */
  swipeThreshold?: number;
  style?: StyleProp<ViewStyle>;
}>;

export function SwipeBackView({
  children,
  enabled = true,
  onBack,
  swipeThreshold = 72,
  style,
}: SwipeBackViewProps) {
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;

  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  useEffect(() => {
    if (!enabled || !onBack) return undefined;

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (!enabledRef.current || !onBackRef.current) return false;
        onBackRef.current();
        return true;
      },
    );

    return () => {
      subscription.remove();
    };
  }, [enabled, onBack]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_event, gestureState) => {
          if (!enabledRef.current || !onBackRef.current) return false;
          const isHorizontalRightSwipe =
            gestureState.dx > 24 &&
            Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.8;
          return isHorizontalRightSwipe;
        },
        onPanResponderRelease: (_event, gestureState) => {
          if (!enabledRef.current || !onBackRef.current) return;
          if (gestureState.dx >= swipeThreshold || gestureState.vx >= 0.65) {
            onBackRef.current();
          }
        },
      }),
    [swipeThreshold],
  );

  return (
    <View
      style={[styles.container, style]}
      {...(enabled && onBack ? panResponder.panHandlers : undefined)}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
