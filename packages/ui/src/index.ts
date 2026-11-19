export const MIN_TOUCH_TARGET = 48;

export const designTokens = {
  alert: '#b42318',
  success: '#027a48',
  warning: '#f2c94c',
  highContrast: '#0f172a',
} as const;

export const buttonSize = {
  minHeight: MIN_TOUCH_TARGET,
  minWidth: MIN_TOUCH_TARGET,
} as const;

export { LoginScreen } from './components/login/LoginScreen';
export type {
  LoginCredentials,
  LoginScreenProps,
} from './components/login/LoginScreen';
export { loginTokens } from './tokens/login';
