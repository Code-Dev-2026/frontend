import { StyleSheet, View } from 'react-native';
import { Icon, InteractivePressable, baseTokens } from '@camino/ui';
import LogotipoSinTexto from '@camino/ui/svg/logotipo-sin-texto.svg';

export type MonitoraAppBarProps = {
  onBack?: () => void;
  onPressNotifications?: () => void;
  testID?: string;
};

export function MonitoraAppBar({
  onBack,
  onPressNotifications,
  testID,
}: MonitoraAppBarProps) {
  return (
    <View style={styles.bar} testID={testID}>
      <View style={styles.row}>
        {onBack ? (
          <InteractivePressable
            accessibilityLabel="Volver"
            accessibilityRole="button"
            borderRadius={baseTokens.radii.control}
            onPress={onBack}
            pressFillColor="rgba(2, 56, 102, 0.1)"
            style={styles.actionButton}
            testID={testID ? `${testID}-back` : undefined}
          >
            <Icon
              color={baseTokens.colors.textStrong}
              name="chevron-left"
              size={baseTokens.sizes.iconDefault}
            />
          </InteractivePressable>
        ) : (
          <View style={styles.spacer} />
        )}

        <View pointerEvents="none" style={styles.logoCenter}>
          <LogotipoSinTexto
            accessibilityLabel="Camino Seguro"
            height={28}
            width={24}
          />
        </View>

        {onPressNotifications ? (
          <InteractivePressable
            accessibilityLabel="Avisos de jornada"
            accessibilityRole="button"
            borderRadius={baseTokens.radii.control}
            onPress={onPressNotifications}
            pressFillColor="rgba(2, 56, 102, 0.1)"
            style={styles.actionButton}
            testID={testID ? `${testID}-notifications` : undefined}
          >
            <Icon
              color={baseTokens.colors.textStrong}
              name="bell"
              size={baseTokens.sizes.iconDefault}
            />
          </InteractivePressable>
        ) : (
          <View style={styles.spacer} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: baseTokens.colors.surface,
    borderBottomColor: baseTokens.colors.borderSoft,
    borderBottomWidth: baseTokens.borderWidth.default,
    height: 52,
    justifyContent: 'center',
    width: '100%',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 48,
    justifyContent: 'space-between',
    paddingHorizontal: baseTokens.spacing.md,
    position: 'relative',
    width: '100%',
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: baseTokens.radii.control,
    height: baseTokens.sizes.touchMin,
    justifyContent: 'center',
    width: baseTokens.sizes.touchMin,
  },
  spacer: {
    height: baseTokens.sizes.touchMin,
    width: baseTokens.sizes.touchMin,
  },
  logoCenter: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
