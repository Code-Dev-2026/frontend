import { Text } from 'react-native';
import { API_ERROR_MESSAGES, ApiError } from '@camino/contracts/http';

interface ApiErrorMessageProps {
  error: unknown;
}

export function ApiErrorMessage({ error }: ApiErrorMessageProps) {
  if (!error) return null;

  const message =
    error instanceof ApiError
      ? API_ERROR_MESSAGES[error.code]
      : API_ERROR_MESSAGES.UNKNOWN;

  return <Text accessibilityRole="alert">{message}</Text>;
}
