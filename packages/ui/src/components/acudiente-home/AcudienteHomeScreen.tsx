import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import IconArrowLeft from '../../svg/icon-arrow-left.svg';
import IconBell from '../../svg/icon-bell.svg';
import IconBusFront from '../../svg/icon-bus-front.svg';
import IconHouse from '../../svg/icon-house.svg';
import IconMapPin from '../../svg/icon-map-pin.svg';
import IconUserRound from '../../svg/icon-user-round.svg';
import LogotipoSinTexto from '../../svg/logotipo-sin-texto.svg';
import { acudienteHomeTokens } from '../../tokens/acudiente-home';

export type AcudienteNavTab = 'inicio' | 'mapa' | 'avisos' | 'perfil';

export type AcudienteChildStatusVariant = 'on-board' | 'at-home';

export type AcudienteChildSummary = {
  id: string;
  name: string;
  routeSummary: string;
  scheduleSummary: string;
  statusVariant: AcudienteChildStatusVariant;
  statusLabel: string;
  lastUpdateLabel: string;
  actionLabel: string;
};

export type AcudienteHomeScreenProps = {
  avatarInitials: string;
  childrenCards: readonly AcudienteChildSummary[];
  activeTab?: AcudienteNavTab;
  onBack?: () => void;
  onPressAvatar?: () => void;
  onPressChildAction?: (childId: string) => void;
  onRequestOccasionalPassenger?: () => void;
  onReportAbsence?: () => void;
  onSelectTab?: (tab: AcudienteNavTab) => void;
};

const NAV_ITEMS: ReadonlyArray<{
  id: AcudienteNavTab;
  label: string;
}> = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'mapa', label: 'Mapa' },
  { id: 'avisos', label: 'Avisos' },
  { id: 'perfil', label: 'Perfil' },
];

function renderNavIcon(tab: AcudienteNavTab) {
  const size = acudienteHomeTokens.spacing.iconSize;
  const color = acudienteHomeTokens.colors.navy;

  switch (tab) {
    case 'inicio':
      return <IconHouse width={size} height={size} color={color} />;
    case 'mapa':
      return <IconMapPin width={size} height={size} color={color} />;
    case 'avisos':
      return <IconBell width={size} height={size} color={color} />;
    case 'perfil':
      return <IconUserRound width={size} height={size} color={color} />;
  }
}

export function AcudienteHomeScreen({
  avatarInitials,
  childrenCards,
  activeTab = 'inicio',
  onBack,
  onPressAvatar,
  onPressChildAction,
  onRequestOccasionalPassenger,
  onReportAbsence,
  onSelectTab,
}: AcudienteHomeScreenProps) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Volver"
          accessibilityRole="button"
          accessibilityState={{ disabled: !onBack }}
          disabled={!onBack}
          onPress={onBack}
          style={styles.headerLeftAction}
        >
          <View style={styles.backButtonCircle}>
            <IconArrowLeft
              width={acudienteHomeTokens.spacing.backIconSize}
              height={acudienteHomeTokens.spacing.backIconSize}
              color={acudienteHomeTokens.colors.backIcon}
            />
          </View>
        </Pressable>

        <View style={styles.headerLogo}>
          <LogotipoSinTexto
            width={acudienteHomeTokens.spacing.logoWidth}
            height={acudienteHomeTokens.spacing.logoHeight}
            accessibilityLabel="Camino Seguro"
          />
        </View>

        <Pressable
          accessibilityLabel="Perfil de acudiente"
          accessibilityRole="button"
          accessibilityState={{ disabled: !onPressAvatar }}
          disabled={!onPressAvatar}
          onPress={onPressAvatar}
          style={styles.headerRightAction}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarInitials}</Text>
          </View>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {childrenCards.map((child) => {
          const isOnBoard = child.statusVariant === 'on-board';

          return (
            <View key={child.id} style={styles.card}>
              <View style={styles.cardSummary}>
                <IconUserRound
                  width={acudienteHomeTokens.spacing.iconSize}
                  height={acudienteHomeTokens.spacing.iconSize}
                  color={acudienteHomeTokens.colors.textMuted}
                />
                <View style={styles.cardIdentity}>
                  <Text style={styles.childName}>{child.name}</Text>
                  <View>
                    <Text style={styles.caption}>{child.routeSummary}</Text>
                    <Text style={styles.caption}>{child.scheduleSummary}</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.caption}>Último estado confirmado</Text>

              <View
                style={[
                  styles.statusChip,
                  isOnBoard
                    ? styles.statusChipOnBoard
                    : styles.statusChipAtHome,
                ]}
              >
                {isOnBoard ? (
                  <IconBusFront
                    width={acudienteHomeTokens.spacing.iconSize}
                    height={acudienteHomeTokens.spacing.iconSize}
                    color={acudienteHomeTokens.colors.navy}
                  />
                ) : (
                  <IconHouse
                    width={acudienteHomeTokens.spacing.iconSize}
                    height={acudienteHomeTokens.spacing.iconSize}
                    color={acudienteHomeTokens.colors.textBody}
                  />
                )}
                <Text
                  style={[
                    styles.statusChipText,
                    isOnBoard
                      ? styles.statusChipTextOnBoard
                      : styles.statusChipTextAtHome,
                  ]}
                >
                  {child.statusLabel}
                </Text>
              </View>

              <Text style={styles.caption}>{child.lastUpdateLabel}</Text>

              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: !onPressChildAction }}
                disabled={!onPressChildAction}
                onPress={() => onPressChildAction?.(child.id)}
                style={styles.cardActionButton}
              >
                <Text style={styles.cardActionText}>{child.actionLabel}</Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.bottomActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !onRequestOccasionalPassenger }}
          disabled={!onRequestOccasionalPassenger}
          onPress={onRequestOccasionalPassenger}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.primaryButtonPressed,
          ]}
        >
          <Text style={styles.primaryButtonText}>
            Solicitar pasajero ocasional
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !onReportAbsence }}
          disabled={!onReportAbsence}
          onPress={onReportAbsence}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.secondaryButtonPressed,
          ]}
        >
          <Text style={styles.secondaryButtonText}>Reportar inasistencia</Text>
        </Pressable>
      </View>

      <View style={styles.bottomNav}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;

          return (
            <Pressable
              key={item.id}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              onPress={() => onSelectTab?.(item.id)}
              style={[styles.navItem, isActive && styles.navItemActive]}
            >
              {renderNavIcon(item.id)}
              <Text
                style={[
                  styles.navItemLabel,
                  isActive && styles.navItemLabelActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const androidTopOffset =
  Platform.OS === 'android'
    ? Math.max(
        StatusBar.currentHeight ?? 0,
        acudienteHomeTokens.spacing.screenTop,
      )
    : acudienteHomeTokens.spacing.screenTop;

const styles = StyleSheet.create({
  screen: {
    backgroundColor: acudienteHomeTokens.colors.background,
    flex: 1,
    paddingTop: androidTopOffset,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    height: acudienteHomeTokens.spacing.headerHeight,
    justifyContent: 'space-between',
    paddingHorizontal: acudienteHomeTokens.spacing.horizontal,
    width: '100%',
  },
  headerLeftAction: {
    alignItems: 'flex-start',
    height: acudienteHomeTokens.spacing.touchTarget,
    justifyContent: 'center',
    minWidth: acudienteHomeTokens.spacing.touchTarget,
  },
  backButtonCircle: {
    alignItems: 'center',
    borderRadius: 9999,
    height: acudienteHomeTokens.spacing.avatarSize,
    justifyContent: 'center',
    width: acudienteHomeTokens.spacing.avatarSize,
  },
  headerLogo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRightAction: {
    alignItems: 'flex-end',
    height: acudienteHomeTokens.spacing.touchTarget,
    justifyContent: 'center',
    minWidth: acudienteHomeTokens.spacing.touchTarget,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: acudienteHomeTokens.colors.avatarBackground,
    borderRadius: 9999,
    height: acudienteHomeTokens.spacing.avatarSize,
    justifyContent: 'center',
    width: acudienteHomeTokens.spacing.avatarSize,
  },
  avatarText: {
    ...acudienteHomeTokens.typography.avatar,
    color: acudienteHomeTokens.colors.avatarText,
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    gap: acudienteHomeTokens.spacing.cardGap,
    paddingBottom: acudienteHomeTokens.spacing.contentBottom,
    paddingHorizontal: acudienteHomeTokens.spacing.horizontal,
    paddingTop: acudienteHomeTokens.spacing.contentTop,
  },
  card: {
    backgroundColor: acudienteHomeTokens.colors.cardBackground,
    borderColor: acudienteHomeTokens.colors.cardBorder,
    borderRadius: acudienteHomeTokens.spacing.cardRadius,
    borderWidth: 1,
    gap: acudienteHomeTokens.spacing.cardInnerGap,
    padding: acudienteHomeTokens.spacing.cardPadding,
    width: '100%',
  },
  cardSummary: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: acudienteHomeTokens.spacing.cardInnerGap,
    width: '100%',
  },
  cardIdentity: {
    flex: 1,
    gap: acudienteHomeTokens.spacing.identityGap,
  },
  childName: {
    ...acudienteHomeTokens.typography.childName,
    color: acudienteHomeTokens.colors.textStrong,
  },
  caption: {
    ...acudienteHomeTokens.typography.caption,
    color: acudienteHomeTokens.colors.textMuted,
  },
  statusChip: {
    alignItems: 'center',
    borderRadius: acudienteHomeTokens.spacing.chipRadius,
    borderWidth: 1,
    flexDirection: 'row',
    gap: acudienteHomeTokens.spacing.chipGap,
    padding: acudienteHomeTokens.spacing.chipPadding,
    width: '100%',
  },
  statusChipOnBoard: {
    backgroundColor: acudienteHomeTokens.colors.infoBackground,
    borderColor: acudienteHomeTokens.colors.cardBorder,
  },
  statusChipAtHome: {
    backgroundColor: acudienteHomeTokens.colors.neutralChipBackground,
    borderColor: acudienteHomeTokens.colors.cardBorder,
  },
  statusChipText: {
    ...acudienteHomeTokens.typography.statusChip,
    flex: 1,
  },
  statusChipTextOnBoard: {
    color: acudienteHomeTokens.colors.navy,
  },
  statusChipTextAtHome: {
    color: acudienteHomeTokens.colors.textBody,
  },
  cardActionButton: {
    alignItems: 'center',
    backgroundColor: acudienteHomeTokens.colors.cardBackground,
    borderRadius: acudienteHomeTokens.spacing.buttonRadius,
    height: acudienteHomeTokens.spacing.touchTarget,
    justifyContent: 'center',
    padding: acudienteHomeTokens.spacing.buttonPadding,
    width: '100%',
  },
  cardActionText: {
    ...acudienteHomeTokens.typography.cardAction,
    color: acudienteHomeTokens.colors.link,
  },
  bottomActions: {
    backgroundColor: acudienteHomeTokens.colors.background,
    gap: acudienteHomeTokens.spacing.actionsGap,
    paddingBottom: acudienteHomeTokens.spacing.actionsPaddingBottom,
    paddingHorizontal: acudienteHomeTokens.spacing.horizontal,
    paddingTop: acudienteHomeTokens.spacing.actionsPaddingTop,
    width: '100%',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: acudienteHomeTokens.colors.primary,
    borderRadius: acudienteHomeTokens.spacing.buttonRadius,
    height: acudienteHomeTokens.spacing.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: acudienteHomeTokens.spacing.buttonPadding,
    width: '100%',
  },
  primaryButtonPressed: {
    backgroundColor: acudienteHomeTokens.colors.primaryPressed,
  },
  primaryButtonText: {
    ...acudienteHomeTokens.typography.button,
    color: acudienteHomeTokens.colors.background,
    textAlign: 'center',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: acudienteHomeTokens.colors.successBackground,
    borderColor: acudienteHomeTokens.colors.successBorder,
    borderRadius: acudienteHomeTokens.spacing.buttonRadius,
    borderWidth: 1,
    height: acudienteHomeTokens.spacing.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: acudienteHomeTokens.spacing.buttonPadding,
    width: '100%',
  },
  secondaryButtonPressed: {
    backgroundColor: acudienteHomeTokens.colors.successBackgroundPressed,
  },
  secondaryButtonText: {
    ...acudienteHomeTokens.typography.button,
    color: acudienteHomeTokens.colors.successText,
    textAlign: 'center',
  },
  bottomNav: {
    alignItems: 'center',
    backgroundColor: acudienteHomeTokens.colors.background,
    borderTopColor: acudienteHomeTokens.colors.navBorder,
    borderTopWidth: 1,
    flexDirection: 'row',
    height: acudienteHomeTokens.spacing.navHeight,
    padding: acudienteHomeTokens.spacing.navPadding,
    width: '100%',
  },
  navItem: {
    alignItems: 'center',
    borderRadius: acudienteHomeTokens.spacing.navItemRadius,
    flex: 1,
    gap: acudienteHomeTokens.spacing.navItemGap,
    height: acudienteHomeTokens.spacing.navItemHeight,
    justifyContent: 'center',
    padding: acudienteHomeTokens.spacing.navItemPadding,
  },
  navItemActive: {
    backgroundColor: acudienteHomeTokens.colors.infoBackground,
  },
  navItemLabel: {
    ...acudienteHomeTokens.typography.caption,
    color: acudienteHomeTokens.colors.textMuted,
    textAlign: 'center',
  },
  navItemLabelActive: {
    color: acudienteHomeTokens.colors.navy,
  },
});
