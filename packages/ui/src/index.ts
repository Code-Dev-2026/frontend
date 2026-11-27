import { baseTokens } from './tokens/base';

export const MIN_TOUCH_TARGET = baseTokens.sizes.touchMin;

export const designTokens = {
  // Claves legadas preservadas por retrocompatibilidad, mapeadas a tokens reales de Figma
  alert: baseTokens.colors.criticalSolid,
  success: baseTokens.colors.successText,
  warning: baseTokens.colors.orange500,
  highContrast: baseTokens.colors.textStrong,
  // Escala completa del sistema de diseño (`cs/*`)
  colors: baseTokens.colors,
  typography: baseTokens.typography,
  spacing: baseTokens.spacing,
  radii: baseTokens.radii,
  borderWidth: baseTokens.borderWidth,
  sizes: baseTokens.sizes,
  elevation: baseTokens.elevation,
} as const;

export const buttonSize = {
  minHeight: MIN_TOUCH_TARGET,
  minWidth: MIN_TOUCH_TARGET,
} as const;

export { baseTokens } from './tokens/base';
export type {
  BaseColorToken,
  BaseTokens,
  BaseTypographyToken,
} from './tokens/base';

// Componentes base reutilizables (FE-07)
export { Badge } from './components/badge/Badge';
export type { BadgeProps, BadgeVariant } from './components/badge/Badge';

export { Banner } from './components/banner/Banner';
export type { BannerProps, BannerVariant } from './components/banner/Banner';

export { BrandLoader } from './components/brand-loader/BrandLoader';
export type { BrandLoaderProps } from './components/brand-loader/BrandLoader';

export { BrandLoadingOverlay } from './components/brand-loader/BrandLoadingOverlay';
export type {
  BrandLoadingBackdrop,
  BrandLoadingOverlayProps,
} from './components/brand-loader/BrandLoadingOverlay';

export {
  ScreenLoadingProvider,
  useScreenLoading,
} from './components/brand-loader/ScreenLoadingProvider';
export type {
  RunWithLoadingOptions,
  ScreenLoadingContextValue,
  ScreenLoadingOptions,
  ScreenLoadingProviderProps,
  TransitionScreenOptions,
} from './components/brand-loader/ScreenLoadingProvider';

export { Button } from './components/button/Button';
export type { ButtonProps, ButtonVariant } from './components/button/Button';

export { InteractivePressable } from './components/button/InteractivePressable';
export type { InteractivePressableProps } from './components/button/InteractivePressable';

export { AnimatedNavIcon } from './components/navigation/AnimatedNavIcon';
export type {
  AnimatedNavIconProps,
  NavIconName,
} from './components/navigation/AnimatedNavIcon';

export { BottomNavBar } from './components/navigation/BottomNavBar';
export type {
  BottomNavBarProps,
  BottomNavItem,
} from './components/navigation/BottomNavBar';

export { SwipeBackView } from './components/navigation/SwipeBackView';
export type { SwipeBackViewProps } from './components/navigation/SwipeBackView';

export { Card } from './components/card/Card';
export type { CardProps, CardState } from './components/card/Card';

export { Dialog, Modal } from './components/dialog/Modal';
export type {
  DialogProps,
  ModalAction,
  ModalProps,
  ModalTone,
} from './components/dialog/Modal';

export { EmptyState } from './components/empty-state/EmptyState';
export type {
  EmptyStateProps,
  EmptyStateStatus,
} from './components/empty-state/EmptyState';

export { ICON_NAMES, Icon } from './components/icon/Icon';
export type { IconName, IconProps } from './components/icon/Icon';

export { Input } from './components/input/Input';
export type { InputPlatform, InputProps } from './components/input/Input';

export { UiCatalogScreen } from './components/catalog/UiCatalogScreen';
export type { UiCatalogScreenProps } from './components/catalog/UiCatalogScreen';

// Pantallas existentes y sus tokens por pantalla
export { SplashScreen } from './components/splash/SplashScreen';
export type { SplashScreenProps } from './components/splash/SplashScreen';

export { LoginScreen } from './components/login/LoginScreen';
export type {
  LoginCredentials,
  LoginScreenProps,
} from './components/login/LoginScreen';
export { loginTokens } from './tokens/login';

export { ForgotPasswordScreen } from './components/forgot-password/ForgotPasswordScreen';
export type { ForgotPasswordScreenProps } from './components/forgot-password/ForgotPasswordScreen';
export { forgotPasswordTokens } from './tokens/forgot-password';

export { MfaVerificationScreen } from './components/mfa/MfaVerificationScreen';
export type { MfaVerificationScreenProps } from './components/mfa/MfaVerificationScreen';

export { RoleBlockedScreen } from './components/role-blocked/RoleBlockedScreen';
export type { RoleBlockedScreenProps } from './components/role-blocked/RoleBlockedScreen';

export { AcudienteHomeScreen } from './components/acudiente-home/AcudienteHomeScreen';
export type {
  AcudienteChildStatusVariant,
  AcudienteChildSummary,
  AcudienteHomeScreenProps,
  AcudienteNavTab,
} from './components/acudiente-home/AcudienteHomeScreen';
export { acudienteHomeTokens } from './tokens/acudiente-home';

export { AcudienteMapScreen } from './components/acudiente-map/AcudienteMapScreen';
export type { AcudienteMapScreenProps } from './components/acudiente-map/AcudienteMapScreen';
export { acudienteMapTokens } from './tokens/acudiente-map';
