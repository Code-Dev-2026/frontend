import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { StyleSheet, View } from 'react-native';
import {
  BrandLoadingOverlay,
  type BrandLoadingBackdrop,
} from './BrandLoadingOverlay';

export type ScreenLoadingOptions = {
  label?: string;
  backdrop?: BrandLoadingBackdrop;
  size?: number;
};

export type RunWithLoadingOptions = ScreenLoadingOptions & {
  /** Tiempo mínimo visible en ms para que el trazado se aprecie sin parpadeos. */
  minDurationMs?: number;
};

export type TransitionScreenOptions = ScreenLoadingOptions & {
  /** Duración mínima de la transición en ms mientras se monta la nueva pantalla. Por defecto: 520. */
  minDurationMs?: number;
};

export type ScreenLoadingContextValue = {
  isLoading: boolean;
  /** Muestra el overlay hasta invocar la función de cierre devuelta. */
  showLoading: (options?: ScreenLoadingOptions) => () => void;
  /** Envuelve una operación asíncrona mostrando el logo animado centrado mientras carga. */
  runWithLoading: <T>(
    task: () => Promise<T>,
    options?: RunWithLoadingOptions,
  ) => Promise<T>;
  /** Ejecuta un cambio de pantalla mostrando el logo animado durante la transición y el montaje. */
  transitionScreen: (
    applyNavigation: () => void,
    options?: TransitionScreenOptions,
  ) => void;
};

type ActiveEntry = {
  id: number;
  label?: string;
  backdrop: BrandLoadingBackdrop;
  size?: number;
};

const DEFAULT_TRANSITION_MIN_DURATION_MS = 520;

const NOOP_CONTEXT: ScreenLoadingContextValue = {
  isLoading: false,
  showLoading: () => () => undefined,
  runWithLoading: async (task) => task(),
  transitionScreen: (applyNavigation) => {
    applyNavigation();
  },
};

const ScreenLoadingContext =
  createContext<ScreenLoadingContextValue>(NOOP_CONTEXT);

export type ScreenLoadingProviderProps = PropsWithChildren<{
  /** Ancho por defecto del isotipo en overlays y transiciones. Por defecto: 52. */
  defaultSize?: number;
  /** Duración del ciclo de animación en ms para overlays. Por defecto: 1800. */
  cycleDurationMs?: number;
  testID?: string;
}>;

export function ScreenLoadingProvider({
  children,
  defaultSize = 52,
  cycleDurationMs = 1800,
  testID,
}: ScreenLoadingProviderProps) {
  const [entries, setEntries] = useState<readonly ActiveEntry[]>([]);
  const nextIdRef = useRef(1);
  const mountedRef = useRef(true);
  const pendingTimersRef = useRef<Set<ReturnType<typeof setTimeout>>>(
    new Set(),
  );
  const transitionRunRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    const timers = pendingTimersRef.current;
    return () => {
      mountedRef.current = false;
      for (const timer of timers) {
        clearTimeout(timer);
      }
      timers.clear();
    };
  }, []);

  const scheduleTimer = useCallback((fn: () => void, delayMs: number) => {
    const timer = setTimeout(() => {
      pendingTimersRef.current.delete(timer);
      if (mountedRef.current) fn();
    }, delayMs);
    pendingTimersRef.current.add(timer);
    return timer;
  }, []);

  const showLoading = useCallback((options?: ScreenLoadingOptions) => {
    const id = nextIdRef.current;
    nextIdRef.current += 1;

    const entry: ActiveEntry = {
      id,
      label: options?.label,
      backdrop: options?.backdrop ?? 'translucent',
      size: options?.size,
    };

    if (mountedRef.current) {
      setEntries((prev) => [...prev, entry]);
    }

    let closed = false;
    return () => {
      if (closed) return;
      closed = true;
      if (mountedRef.current) {
        setEntries((prev) => prev.filter((item) => item.id !== id));
      }
    };
  }, []);

  const runWithLoading = useCallback(
    async <T,>(
      task: () => Promise<T>,
      options?: RunWithLoadingOptions,
    ): Promise<T> => {
      const startedAt = Date.now();
      const hide = showLoading(options);
      try {
        return await task();
      } finally {
        const minDurationMs = options?.minDurationMs ?? 0;
        const remaining = minDurationMs - (Date.now() - startedAt);
        if (remaining > 0) {
          await new Promise<void>((resolve) => {
            scheduleTimer(resolve, remaining);
          });
        }
        hide();
      }
    },
    [scheduleTimer, showLoading],
  );

  const transitionScreen = useCallback(
    (applyNavigation: () => void, options?: TransitionScreenOptions) => {
      const runId = transitionRunRef.current + 1;
      transitionRunRef.current = runId;

      const minDurationMs =
        options?.minDurationMs ?? DEFAULT_TRANSITION_MIN_DURATION_MS;
      const startedAt = Date.now();
      const hide = showLoading({
        label: options?.label,
        backdrop: options?.backdrop ?? 'solid',
        size: options?.size,
      });

      // Espera un frame para pintar el overlay antes de montar la nueva pantalla,
      // luego cierra de forma determinista sin depender de InteractionManager.
      scheduleTimer(() => {
        if (transitionRunRef.current !== runId) {
          hide();
          return;
        }

        applyNavigation();

        const remaining = Math.max(0, minDurationMs - (Date.now() - startedAt));
        scheduleTimer(() => {
          hide();
        }, remaining);
      }, 32);
    },
    [scheduleTimer, showLoading],
  );

  const topEntry = entries[entries.length - 1];
  const isLoading = entries.length > 0;

  const value = useMemo<ScreenLoadingContextValue>(
    () => ({
      isLoading,
      showLoading,
      runWithLoading,
      transitionScreen,
    }),
    [isLoading, runWithLoading, showLoading, transitionScreen],
  );

  return (
    <ScreenLoadingContext.Provider value={value}>
      <View style={styles.root}>
        {children}
        <BrandLoadingOverlay
          backdrop={topEntry?.backdrop ?? 'translucent'}
          cycleDurationMs={cycleDurationMs}
          label={topEntry?.label}
          size={topEntry?.size ?? defaultSize}
          testID={testID}
          visible={isLoading}
        />
      </View>
    </ScreenLoadingContext.Provider>
  );
}

export function useScreenLoading(): ScreenLoadingContextValue {
  return useContext(ScreenLoadingContext);
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
