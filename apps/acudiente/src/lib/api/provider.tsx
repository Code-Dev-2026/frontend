import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { configureMobileApiClient } from './index';

export type ApiMode = 'mock' | 'real';

const ApiModeContext = createContext<ApiMode>('real');

export function ApiProvider({ children }: PropsWithChildren) {
  const mode: ApiMode =
    process.env.EXPO_PUBLIC_API_MODE === 'mock' ? 'mock' : 'real';
  const [ready, setReady] = useState(false);

  useEffect(() => {
    configureMobileApiClient();
    let cancelled = false;
    let stopApiMocks: (() => void) | undefined;

    if (mode === 'mock') {
      // Carga diferida: msw/native requiere APIs de navegador que Hermes no
      // trae (BroadcastChannel) y no debe evaluarse en modo real.
      void import('./mock-setup').then(({ startApiMocks }) => {
        if (cancelled) return;
        stopApiMocks = startApiMocks();
        setReady(true);
      });
    } else {
      setReady(true);
    }

    return () => {
      cancelled = true;
      stopApiMocks?.();
    };
  }, [mode]);

  if (!ready) return null;

  return (
    <ApiModeContext.Provider value={mode}>{children}</ApiModeContext.Provider>
  );
}

export function useApiMode(): ApiMode {
  return useContext(ApiModeContext);
}
