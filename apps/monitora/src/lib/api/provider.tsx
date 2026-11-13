import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { configureMobileApiClient } from './index';
import { startApiMocks } from './mock-setup';

export type ApiMode = 'mock' | 'real';

const ApiModeContext = createContext<ApiMode>('real');

export function ApiProvider({ children }: PropsWithChildren) {
  const mode: ApiMode =
    process.env.EXPO_PUBLIC_API_MODE === 'mock' ? 'mock' : 'real';
  const [ready, setReady] = useState(false);

  useEffect(() => {
    configureMobileApiClient();
    const stopApiMocks = mode === 'mock' ? startApiMocks() : undefined;
    setReady(true);
    return () => stopApiMocks?.();
  }, [mode]);

  if (!ready) return null;

  return (
    <ApiModeContext.Provider value={mode}>{children}</ApiModeContext.Provider>
  );
}

export function useApiMode(): ApiMode {
  return useContext(ApiModeContext);
}
