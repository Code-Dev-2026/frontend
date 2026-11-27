import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import type { MonitoraConnectivityStatus } from '../features/profile/monitora-session';

const CONNECTIVITY_PROBE_URL = 'https://clients3.google.com/generate_204';
const PROBE_TIMEOUT_MS = 2500;
const POLL_INTERVAL_MS = 10000;

async function probeInternetReachability(): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);

  try {
    const response = await fetch(CONNECTIVITY_PROBE_URL, {
      method: 'HEAD',
      cache: 'no-store',
      signal: controller.signal,
    });
    return response.ok || response.status === 204;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export type ConnectivityState = {
  status: MonitoraConnectivityStatus;
  isChecking: boolean;
  checkConnectivity: () => Promise<MonitoraConnectivityStatus>;
};

export function useConnectivityStatus(): ConnectivityState {
  const [status, setStatus] = useState<MonitoraConnectivityStatus>('online');
  const [isChecking, setIsChecking] = useState(false);
  const statusRef = useRef<MonitoraConnectivityStatus>('online');
  const mountedRef = useRef(true);
  const inFlightRef = useRef(false);

  const checkConnectivity =
    useCallback(async (): Promise<MonitoraConnectivityStatus> => {
      if (inFlightRef.current) {
        return statusRef.current;
      }
      inFlightRef.current = true;
      if (mountedRef.current) setIsChecking(true);

      try {
        const reachable = await probeInternetReachability();
        const nextStatus: MonitoraConnectivityStatus = reachable
          ? 'online'
          : 'offline';
        statusRef.current = nextStatus;
        if (mountedRef.current) {
          setStatus(nextStatus);
        }
        return nextStatus;
      } finally {
        inFlightRef.current = false;
        if (mountedRef.current) setIsChecking(false);
      }
    }, []);

  useEffect(() => {
    mountedRef.current = true;
    void checkConnectivity();

    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        void checkConnectivity();
      }
    };

    const appStateSubscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    const interval = setInterval(() => {
      if (AppState.currentState === 'active') {
        void checkConnectivity();
      }
    }, POLL_INTERVAL_MS);

    return () => {
      mountedRef.current = false;
      appStateSubscription.remove();
      clearInterval(interval);
    };
  }, [checkConnectivity]);

  return {
    status,
    isChecking,
    checkConnectivity,
  };
}
