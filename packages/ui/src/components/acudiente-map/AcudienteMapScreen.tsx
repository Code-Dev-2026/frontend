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
import Svg, { Path, Polygon, Rect } from 'react-native-svg';
import IconBell from '../../svg/icon-bell.svg';
import IconBusFront from '../../svg/icon-bus-front.svg';
import IconHouse from '../../svg/icon-house.svg';
import IconMapPin from '../../svg/icon-map-pin.svg';
import IconUserRound from '../../svg/icon-user-round.svg';
import { acudienteMapTokens } from '../../tokens/acudiente-map';
import type { AcudienteNavTab } from '../acudiente-home/AcudienteHomeScreen';

export type AcudienteMapScreenProps = {
  headerTitle?: string;
  etaSubtitle: string;
  etaValue: string;
  custodyStatusLabel: string;
  busSummary: string;
  stopSummary: string;
  lastUpdatedLabel: string;
  primaryActionLabel?: string;
  coverageActionLabel?: string;
  activeTab?: AcudienteNavTab;
  onPressAlerts?: () => void;
  onPressCoverageNotice?: () => void;
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
  const size = acudienteMapTokens.spacing.iconSize;
  const color = acudienteMapTokens.colors.navy;

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

export function AcudienteMapScreen({
  headerTitle = 'Mapa en vivo',
  etaSubtitle,
  etaValue,
  custodyStatusLabel,
  busSummary,
  stopSummary,
  lastUpdatedLabel,
  primaryActionLabel = 'Ver avisos',
  coverageActionLabel = 'Próxima zona sin cobertura',
  activeTab = 'mapa',
  onPressAlerts,
  onPressCoverageNotice,
  onSelectTab,
}: AcudienteMapScreenProps) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{headerTitle}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.etaBlock}>
          <Text style={styles.caption}>{etaSubtitle}</Text>
          <Text style={styles.etaCounter}>{etaValue}</Text>
        </View>

        <View
          accessibilityLabel="Mapa de ubicación del bus y parada asignada"
          style={styles.mapContainer}
        >
          <Svg
            height="100%"
            preserveAspectRatio="none"
            style={StyleSheet.absoluteFill}
            viewBox="0 0 340 200"
            width="100%"
          >
            <Polygon
              fill={acudienteMapTokens.colors.mapWater}
              points="300,0 340,0 340,200 318,200 296,144 316,74"
            />
            <Rect
              fill={acudienteMapTokens.colors.mapRoad}
              height="14"
              width="340"
              x="0"
              y="33"
            />
            <Rect
              fill={acudienteMapTokens.colors.mapRoad}
              height="14"
              width="340"
              x="0"
              y="97"
            />
            <Rect
              fill={acudienteMapTokens.colors.mapRoad}
              height="14"
              width="340"
              x="0"
              y="161"
            />
            <Rect
              fill={acudienteMapTokens.colors.mapRoad}
              height="200"
              width="14"
              x="41"
              y="0"
            />
            <Rect
              fill={acudienteMapTokens.colors.mapRoad}
              height="200"
              width="14"
              x="153"
              y="0"
            />
            <Rect
              fill={acudienteMapTokens.colors.mapRoad}
              height="200"
              width="14"
              x="273"
              y="0"
            />
            <Path
              d="M40 168 H160 V64 H280"
              fill="none"
              stroke={acudienteMapTokens.colors.routeLine}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="4"
            />
          </Svg>

          <View style={styles.busMarkerOuter}>
            <View style={styles.busMarkerInner}>
              <IconBusFront
                width={acudienteMapTokens.spacing.iconSize}
                height={acudienteMapTokens.spacing.iconSize}
                color={acudienteMapTokens.colors.background}
              />
            </View>
          </View>

          <View style={styles.stopMarker}>
            <IconMapPin
              width={acudienteMapTokens.spacing.iconSize}
              height={acudienteMapTokens.spacing.iconSize}
              color={acudienteMapTokens.colors.navy}
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.statusChip}>
            <IconBusFront
              width={acudienteMapTokens.spacing.iconSize}
              height={acudienteMapTokens.spacing.iconSize}
              color={acudienteMapTokens.colors.navy}
            />
            <Text style={styles.statusChipText}>{custodyStatusLabel}</Text>
          </View>

          <View>
            <Text style={styles.detailText}>{busSummary}</Text>
            <Text style={styles.detailText}>{stopSummary}</Text>
          </View>

          <Text style={styles.caption}>{lastUpdatedLabel}</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !onPressAlerts }}
          disabled={!onPressAlerts}
          onPress={onPressAlerts}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.primaryButtonPressed,
          ]}
        >
          <Text style={styles.primaryButtonText}>{primaryActionLabel}</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !onPressCoverageNotice }}
          disabled={!onPressCoverageNotice}
          onPress={onPressCoverageNotice}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.secondaryButtonPressed,
          ]}
        >
          <Text style={styles.secondaryButtonText}>{coverageActionLabel}</Text>
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
        acudienteMapTokens.spacing.screenTop,
      )
    : acudienteMapTokens.spacing.screenTop;

const styles = StyleSheet.create({
  screen: {
    backgroundColor: acudienteMapTokens.colors.background,
    flex: 1,
    paddingTop: androidTopOffset,
  },
  header: {
    backgroundColor: acudienteMapTokens.colors.background,
    borderBottomColor: acudienteMapTokens.colors.borderSoft,
    borderBottomWidth: 1,
    height: acudienteMapTokens.spacing.headerHeight,
    justifyContent: 'center',
    paddingHorizontal: acudienteMapTokens.spacing.headerPaddingHorizontal,
    width: '100%',
  },
  headerTitle: {
    ...acudienteMapTokens.typography.headerTitle,
    color: acudienteMapTokens.colors.textStrong,
  },
  scroll: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    gap: acudienteMapTokens.spacing.sectionGap,
    paddingHorizontal: acudienteMapTokens.spacing.horizontal,
    paddingVertical: acudienteMapTokens.spacing.contentVertical,
  },
  etaBlock: {
    gap: acudienteMapTokens.spacing.etaGap,
    width: '100%',
  },
  etaCounter: {
    ...acudienteMapTokens.typography.etaCounter,
    color: acudienteMapTokens.colors.navy,
  },
  caption: {
    ...acudienteMapTokens.typography.caption,
    color: acudienteMapTokens.colors.textMuted,
  },
  mapContainer: {
    backgroundColor: acudienteMapTokens.colors.mapBackground,
    borderRadius: acudienteMapTokens.spacing.mapRadius,
    height: acudienteMapTokens.spacing.mapHeight,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  busMarkerOuter: {
    alignItems: 'center',
    backgroundColor: acudienteMapTokens.colors.infoBackground,
    borderColor: acudienteMapTokens.colors.cyan,
    borderRadius: 999,
    borderWidth: acudienteMapTokens.spacing.markerBorderWidth,
    height: acudienteMapTokens.spacing.markerOuterSize,
    justifyContent: 'center',
    left: '47%',
    marginLeft: -(acudienteMapTokens.spacing.markerOuterSize / 2),
    marginTop: -(acudienteMapTokens.spacing.markerOuterSize / 2),
    position: 'absolute',
    top: '52%',
    width: acudienteMapTokens.spacing.markerOuterSize,
  },
  busMarkerInner: {
    alignItems: 'center',
    backgroundColor: acudienteMapTokens.colors.navy,
    borderRadius: 999,
    height: acudienteMapTokens.spacing.markerInnerSize,
    justifyContent: 'center',
    width: acudienteMapTokens.spacing.markerInnerSize,
  },
  stopMarker: {
    alignItems: 'center',
    backgroundColor: acudienteMapTokens.colors.orange,
    borderColor: acudienteMapTokens.colors.navy,
    borderRadius: 999,
    borderWidth: acudienteMapTokens.spacing.markerBorderWidth,
    height: acudienteMapTokens.spacing.markerInnerSize,
    justifyContent: 'center',
    left: '82%',
    marginLeft: -(acudienteMapTokens.spacing.markerInnerSize / 2),
    marginTop: -(acudienteMapTokens.spacing.markerInnerSize / 2),
    position: 'absolute',
    top: '32%',
    width: acudienteMapTokens.spacing.markerInnerSize,
  },
  card: {
    backgroundColor: acudienteMapTokens.colors.background,
    borderColor: acudienteMapTokens.colors.borderSoft,
    borderRadius: acudienteMapTokens.spacing.cardRadius,
    borderWidth: 1,
    gap: acudienteMapTokens.spacing.cardGap,
    padding: acudienteMapTokens.spacing.cardPadding,
    width: '100%',
  },
  statusChip: {
    alignItems: 'center',
    backgroundColor: acudienteMapTokens.colors.infoBackground,
    borderColor: acudienteMapTokens.colors.infoBackground,
    borderRadius: acudienteMapTokens.spacing.chipRadius,
    borderWidth: 1,
    flexDirection: 'row',
    gap: acudienteMapTokens.spacing.chipGap,
    padding: acudienteMapTokens.spacing.chipPadding,
    width: '100%',
  },
  statusChipText: {
    ...acudienteMapTokens.typography.bodySmall,
    color: acudienteMapTokens.colors.navy,
    flex: 1,
  },
  detailText: {
    ...acudienteMapTokens.typography.bodySmall,
    color: acudienteMapTokens.colors.textBody,
  },
  bottomActions: {
    backgroundColor: acudienteMapTokens.colors.background,
    gap: acudienteMapTokens.spacing.actionsGap,
    paddingBottom: acudienteMapTokens.spacing.actionsPaddingBottom,
    paddingHorizontal: acudienteMapTokens.spacing.horizontal,
    paddingTop: acudienteMapTokens.spacing.actionsPaddingTop,
    width: '100%',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: acudienteMapTokens.colors.primary,
    borderRadius: acudienteMapTokens.spacing.buttonRadius,
    height: acudienteMapTokens.spacing.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: acudienteMapTokens.spacing.buttonPadding,
    width: '100%',
  },
  primaryButtonPressed: {
    backgroundColor: acudienteMapTokens.colors.primaryPressed,
  },
  primaryButtonText: {
    ...acudienteMapTokens.typography.button,
    color: acudienteMapTokens.colors.background,
    textAlign: 'center',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: acudienteMapTokens.colors.successBackground,
    borderColor: acudienteMapTokens.colors.successBorder,
    borderRadius: acudienteMapTokens.spacing.buttonRadius,
    borderWidth: 1,
    height: acudienteMapTokens.spacing.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: acudienteMapTokens.spacing.buttonPadding,
    width: '100%',
  },
  secondaryButtonPressed: {
    backgroundColor: acudienteMapTokens.colors.successBackgroundPressed,
  },
  secondaryButtonText: {
    ...acudienteMapTokens.typography.button,
    color: acudienteMapTokens.colors.successText,
    textAlign: 'center',
  },
  bottomNav: {
    alignItems: 'center',
    backgroundColor: acudienteMapTokens.colors.background,
    borderTopColor: acudienteMapTokens.colors.borderSoft,
    borderTopWidth: 1,
    flexDirection: 'row',
    height: acudienteMapTokens.spacing.navHeight,
    padding: acudienteMapTokens.spacing.navPadding,
    width: '100%',
  },
  navItem: {
    alignItems: 'center',
    borderRadius: acudienteMapTokens.spacing.navItemRadius,
    flex: 1,
    gap: acudienteMapTokens.spacing.navItemGap,
    height: acudienteMapTokens.spacing.navItemHeight,
    justifyContent: 'center',
    padding: acudienteMapTokens.spacing.navItemPadding,
  },
  navItemActive: {
    backgroundColor: acudienteMapTokens.colors.infoBackground,
  },
  navItemLabel: {
    ...acudienteMapTokens.typography.caption,
    color: acudienteMapTokens.colors.textMuted,
    textAlign: 'center',
  },
  navItemLabelActive: {
    color: acudienteMapTokens.colors.navy,
  },
});
