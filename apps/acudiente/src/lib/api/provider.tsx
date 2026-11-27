import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { BrandLoader } from '@camino/ui';
import { configureMobileApiClient } from './index';

export type ApiMode = 'mock' | 'real';

const ApiModeContext = createContext<ApiMode>('real');

function ensureBroadcastChannelShim() {
  if (typeof globalThis.BroadcastChannel !== 'undefined') return;
  // PROVISIONAL: MSW v2 evalúa BroadcastChannel al cargar msw/lib/core/ws.js;
  // Hermes no lo expone en React Native.
  class NoopBroadcastChannel {
    readonly name: string;
    onmessage: ((event: MessageEvent) => void) | null = null;
    onmessageerror: ((event: MessageEvent) => void) | null = null;
    constructor(name: string) {
      this.name = name;
    }
    postMessage() {}
    close() {}
    addEventListener() {}
    removeEventListener() {}
    dispatchEvent() {
      return false;
    }
  }
  (
    globalThis as unknown as { BroadcastChannel: typeof NoopBroadcastChannel }
  ).BroadcastChannel = NoopBroadcastChannel;
}

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
      ensureBroadcastChannelShim();
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

  if (!ready) {
    return (
      <BrandLoader
        cycleDurationMs={1800}
        fullScreen
        label="Preparando conexión…"
        size={52}
      />
    );
  }

  return (
    <ApiModeContext.Provider value={mode}>{children}</ApiModeContext.Provider>
  );
}

export function useApiMode(): ApiMode {
  return useContext(ApiModeContext);
}
