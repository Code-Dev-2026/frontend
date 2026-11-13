import { useEffect, useState } from 'react';
import { Button, SafeAreaView, ScrollView, Text, View } from 'react-native';
import type { ProvisionalRealtimeEvent } from '@camino/contracts/realtime-events';
import { ApiErrorMessage } from '../../components/ApiErrorMessage';
import { attendanceControllerRegisterBoarding } from '../../lib/api';
import { useApiMode } from '../../lib/api/provider';
import { startRealtimeSimulator } from '../../lib/api/realtime-simulator';

export function ApiExampleScreen() {
  const mode = useApiMode();
  const [error, setError] = useState<unknown>();
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<ProvisionalRealtimeEvent[]>([]);

  useEffect(
    () =>
      startRealtimeSimulator((event) => {
        setEvents((current) => [...current.slice(-3), event]);
      }),
    [],
  );

  async function simulateCapacityError(): Promise<void> {
    setLoading(true);
    setError(undefined);
    try {
      await attendanceControllerRegisterBoarding();
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
        <Text accessibilityRole="header">Ejemplo de integración API</Text>
        <Text>Modo: {mode === 'mock' ? 'mocks' : 'API real'}</Text>
        <Button
          title={loading ? 'Enviando…' : 'Probar error de capacidad'}
          onPress={() => void simulateCapacityError()}
          disabled={mode !== 'mock' || loading}
        />
        {mode !== 'mock' && (
          <Text>Activa EXPO_PUBLIC_API_MODE=mock para probar este error.</Text>
        )}
        <ApiErrorMessage error={error} />
        <View>
          <Text accessibilityRole="header">Eventos PROVISIONALES</Text>
          {events.map((event, index) => (
            <Text key={`${event.name}-${index}`}>
              {event.name}: {JSON.stringify(event.payload)}
            </Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
