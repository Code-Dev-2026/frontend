import { useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { baseTokens } from '../../tokens/base';
import { BrandLoader } from '../brand-loader/BrandLoader';

export type SplashScreenProps = {
  /** Duración antes de invocar `onFinish` en ms. Por defecto: 1800. */
  durationMs?: number;
  /** Subtítulo opcional de la aplicación (ej. "App Acudiente" o "App Monitora"). */
  appLabel?: string;
  onFinish?: () => void;
  testID?: string;
};

export function SplashScreen({
  durationMs = 1800,
  appLabel,
  onFinish,
  testID,
}: SplashScreenProps) {
  useEffect(() => {
    if (!onFinish) return undefined;
    const timer = setTimeout(() => {
      onFinish();
    }, durationMs);
    return () => clearTimeout(timer);
  }, [durationMs, onFinish]);

  return (
    <SafeAreaView style={styles.screen} testID={testID}>
      <View style={styles.center}>
        <BrandLoader accessibilityLabel="Iniciando Camino Seguro" size={84} />
        <Text style={styles.brandTitle}>Camino Seguro</Text>
        {appLabel ? <Text style={styles.appLabel}>{appLabel}</Text> : null}
      </View>

      <Text style={styles.footer}>Tu tranquilidad empieza aquí</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: baseTokens.colors.surface,
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: baseTokens.spacing.pageMargin,
    paddingVertical: baseTokens.spacing.xxl,
  },
  center: {
    alignItems: 'center',
    flex: 1,
    gap: baseTokens.spacing.md,
    justifyContent: 'center',
  },
  brandTitle: {
    ...baseTokens.typography.screenTitle,
    color: baseTokens.colors.textStrong,
    textAlign: 'center',
  },
  appLabel: {
    ...baseTokens.typography.bodySmall,
    color: baseTokens.colors.textMuted,
    textAlign: 'center',
  },
  footer: {
    ...baseTokens.typography.caption,
    color: baseTokens.colors.textMuted,
    textAlign: 'center',
  },
});
