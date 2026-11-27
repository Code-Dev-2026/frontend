import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LogotipoSinTexto from '../../svg/logotipo-sin-texto.svg';
import { baseTokens } from '../../tokens/base';
import { Button } from '../button/Button';
import { Card } from '../card/Card';
import { Icon } from '../icon/Icon';

export type RoleBlockedScreenProps = {
  /** Mensaje oficial `role_not_allowed` desde `@camino/contracts/http`. */
  message: string;
  /** Rol detectado en la cuenta (desde `@camino/domain`). */
  detectedRole?: string;
  /** Rol esperado por esta aplicación móvil. */
  expectedRole?: string;
  onBackToLogin: () => void;
  testID?: string;
};

export function RoleBlockedScreen({
  message,
  detectedRole,
  expectedRole,
  onBackToLogin,
  testID,
}: RoleBlockedScreenProps) {
  return (
    <SafeAreaView style={styles.screen} testID={testID}>
      <View style={styles.topBar}>
        <LogotipoSinTexto
          accessibilityLabel="Camino Seguro"
          height={28}
          width={24}
        />
      </View>

      <View style={styles.content}>
        <Card style={styles.card}>
          <View style={styles.iconRow}>
            <Icon
              color={baseTokens.colors.criticalSolid}
              name="triangle-alert"
              size={28}
            />
          </View>

          <Text style={styles.title}>Acceso no permitido</Text>
          <Text accessibilityRole="alert" style={styles.message}>
            {message}
          </Text>

          {detectedRole || expectedRole ? (
            <View style={styles.metaBox}>
              {detectedRole ? (
                <Text style={styles.metaText}>
                  Rol de la cuenta:{' '}
                  <Text style={styles.metaStrong}>{detectedRole}</Text>
                </Text>
              ) : null}
              {expectedRole ? (
                <Text style={styles.metaText}>
                  Aplicación habilitada para:{' '}
                  <Text style={styles.metaStrong}>{expectedRole}</Text>
                </Text>
              ) : null}
            </View>
          ) : null}
        </Card>

        <Button
          label="Volver al inicio de sesión"
          onPress={onBackToLogin}
          testID={testID ? `${testID}-back` : undefined}
          variant="primary"
        />
      </View>
    </SafeAreaView>
  );
}

const androidTopOffset =
  Platform.OS === 'android'
    ? Math.max(StatusBar.currentHeight ?? 0, baseTokens.spacing.sm)
    : 0;

const styles = StyleSheet.create({
  screen: {
    backgroundColor: baseTokens.colors.surface,
    flex: 1,
    paddingTop: androidTopOffset,
  },
  topBar: {
    alignItems: 'center',
    borderBottomColor: baseTokens.colors.borderSoft,
    borderBottomWidth: baseTokens.borderWidth.default,
    height: 52,
    justifyContent: 'center',
    width: '100%',
  },
  content: {
    flex: 1,
    gap: baseTokens.spacing.xl,
    justifyContent: 'center',
    paddingHorizontal: baseTokens.spacing.pageMargin,
    paddingVertical: baseTokens.spacing.xxl,
  },
  card: {
    alignItems: 'center',
    padding: baseTokens.spacing.xl,
  },
  iconRow: {
    alignItems: 'center',
    borderColor: baseTokens.colors.borderSoft,
    borderRadius: baseTokens.radii.pill,
    borderWidth: baseTokens.borderWidth.default,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  title: {
    ...baseTokens.typography.screenTitle,
    color: baseTokens.colors.textStrong,
    textAlign: 'center',
  },
  message: {
    ...baseTokens.typography.body,
    color: baseTokens.colors.textBody,
    textAlign: 'center',
  },
  metaBox: {
    borderColor: baseTokens.colors.borderSoft,
    borderRadius: baseTokens.radii.input,
    borderWidth: baseTokens.borderWidth.default,
    gap: baseTokens.spacing.xs,
    padding: baseTokens.spacing.md,
    width: '100%',
  },
  metaText: {
    ...baseTokens.typography.caption,
    color: baseTokens.colors.textMuted,
    textAlign: 'center',
  },
  metaStrong: {
    ...baseTokens.typography.fieldLabel,
    color: baseTokens.colors.textStrong,
  },
});
