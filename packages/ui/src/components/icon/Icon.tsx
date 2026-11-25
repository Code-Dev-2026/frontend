import type { ComponentType } from 'react';
import type { SvgProps } from 'react-native-svg';
import IconArrowLeft from '../../svg/icon-arrow-left.svg';
import IconBell from '../../svg/icon-bell.svg';
import IconBusFront from '../../svg/icon-bus-front.svg';
import IconChevronLeft from '../../svg/icon-chevron-left.svg';
import IconChevronRight from '../../svg/icon-chevron-right.svg';
import IconCircleCheck from '../../svg/icon-circle-check.svg';
import IconDownload from '../../svg/icon-download.svg';
import IconEye from '../../svg/icon-eye.svg';
import IconHouse from '../../svg/icon-house.svg';
import IconInfo from '../../svg/icon-info.svg';
import IconLoaderCircle from '../../svg/icon-loader-circle.svg';
import IconLockKeyhole from '../../svg/icon-lock-keyhole.svg';
import IconMapPin from '../../svg/icon-map-pin.svg';
import IconMenu from '../../svg/icon-menu.svg';
import IconRefreshCw from '../../svg/icon-refresh-cw.svg';
import IconRoute from '../../svg/icon-route.svg';
import IconSchool from '../../svg/icon-school.svg';
import IconSearch from '../../svg/icon-search.svg';
import IconShieldCheck from '../../svg/icon-shield-check.svg';
import IconTriangleAlert from '../../svg/icon-triangle-alert.svg';
import IconUserRound from '../../svg/icon-user-round.svg';
import IconUsers from '../../svg/icon-users.svg';
import IconWifiOff from '../../svg/icon-wifi-off.svg';
import IconWifi from '../../svg/icon-wifi.svg';
import IconX from '../../svg/icon-x.svg';
import { baseTokens } from '../../tokens/base';

const ICON_REGISTRY = {
  'arrow-left': IconArrowLeft,
  bell: IconBell,
  'bus-front': IconBusFront,
  'chevron-left': IconChevronLeft,
  'chevron-right': IconChevronRight,
  'circle-check': IconCircleCheck,
  download: IconDownload,
  eye: IconEye,
  house: IconHouse,
  info: IconInfo,
  'loader-circle': IconLoaderCircle,
  'lock-keyhole': IconLockKeyhole,
  'map-pin': IconMapPin,
  menu: IconMenu,
  'refresh-cw': IconRefreshCw,
  route: IconRoute,
  school: IconSchool,
  search: IconSearch,
  'shield-check': IconShieldCheck,
  'triangle-alert': IconTriangleAlert,
  'user-round': IconUserRound,
  users: IconUsers,
  wifi: IconWifi,
  'wifi-off': IconWifiOff,
  x: IconX,
} as const satisfies Record<string, ComponentType<SvgProps>>;

export type IconName = keyof typeof ICON_REGISTRY;

export const ICON_NAMES = Object.keys(ICON_REGISTRY) as readonly IconName[];

export type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  accessibilityLabel?: string;
  testID?: string;
};

export function Icon({
  name,
  size = baseTokens.sizes.iconDefault,
  color = baseTokens.colors.navy900,
  accessibilityLabel,
  testID,
}: IconProps) {
  const SvgIcon = ICON_REGISTRY[name];

  return (
    <SvgIcon
      width={size}
      height={size}
      color={color}
      accessibilityLabel={accessibilityLabel}
      accessible={Boolean(accessibilityLabel)}
      testID={testID}
    />
  );
}
