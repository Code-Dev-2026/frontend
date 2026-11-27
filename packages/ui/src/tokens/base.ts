/**
 * Tokens base del sistema de diseño Camino Seguro (`cs/*`).
 * Extraídos de Figma: páginas `00 Tokens` (`15:75`) y `01 Componentes` (`15:76`).
 */
export const baseTokens = {
  colors: {
    // Marca (cs/navy-900, cs/cyan-500, cs/orange-500, cs/primary-500, cs/link-600)
    navy900: '#1f2937',
    cyan500: '#60a5fa',
    orange500: '#f59e0b',
    primary500: '#3b82f6',
    link600: '#2563eb',

    // Acciones, foco y estados deshabilitados
    actionPrimary: '#2563eb',
    actionPrimaryPressed: '#1f2937',
    actionSoftPressed: '#16a34a',
    actionSoftPressedText: '#ffffff',
    focusRing: '#2563eb',
    disabledBg: '#f3f4f6',
    disabledText: '#9ca3af',

    // Superficies y bordes
    surface: '#ffffff',
    surfaceInput: '#ffffff',
    borderSoft: '#e5e7eb',
    borderStrong: '#d1d5db',

    // Tipografía
    textStrong: '#1f2937',
    textBody: '#4b5563',
    textMuted: '#6b7280',

    // Estados semánticos (superficies blancas y rojo reservado a íconos de alerta)
    infoBg: '#ffffff',
    infoBorder: '#e5e7eb',
    infoText: '#1f2937',
    successBg: '#ffffff',
    successBorder: '#e5e7eb',
    successText: '#16a34a',
    warningBg: '#ffffff',
    warningBorder: '#e5e7eb',
    warningText: '#d97706',
    criticalBg: '#ffffff',
    criticalBorder: '#e5e7eb',
    criticalText: '#1f2937',
    criticalSolid: '#e04f5f',

    // Fondo translúcido para overlays / modales
    backdrop: 'rgba(31, 41, 55, 0.24)',
  },
  typography: {
    display: {
      fontFamily: 'Inter_700Bold',
      fontSize: 28,
      lineHeight: 36,
      letterSpacing: 0,
    },
    screenTitle: {
      fontFamily: 'Inter_700Bold',
      fontSize: 24,
      lineHeight: 32,
      letterSpacing: 0,
    },
    section: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 18,
      lineHeight: 26,
      letterSpacing: 0,
    },
    button: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 16,
      lineHeight: 24,
      letterSpacing: 0,
    },
    body: {
      fontFamily: 'Inter_400Regular',
      fontSize: 16,
      lineHeight: 24,
      letterSpacing: 0,
    },
    fieldLabel: {
      fontFamily: 'Inter_500Medium',
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0,
    },
    bodySmall: {
      fontFamily: 'Inter_400Regular',
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0,
    },
    caption: {
      fontFamily: 'Inter_400Regular',
      fontSize: 13,
      lineHeight: 18,
      letterSpacing: 0,
    },
    counter: {
      fontFamily: 'Inter_700Bold',
      fontSize: 40,
      lineHeight: 48,
      letterSpacing: 0,
    },
  },
  spacing: {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    fieldGap: 20,
    xl: 24,
    pageMargin: 25,
    xxl: 32,
  },
  radii: {
    input: 12,
    control: 12,
    chip: 12,
    card: 16,
    modal: 24,
    sheet: 36,
    pill: 999,
  },
  borderWidth: {
    default: 1,
    focus: 2,
    error: 2,
    iconStroke: 2,
  },
  sizes: {
    touchMin: 48,
    inputStandardHeight: 45,
    inputMonitorHeight: 48,
    iconDefault: 24,
    contentWidth: 340,
    mobileWidth: 390,
    mobileHeight: 780,
  },
  elevation: {
    overlay: {
      shadowColor: '#1f2937',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 24,
      elevation: 8,
    },
  },
} as const;

export type BaseTokens = typeof baseTokens;
export type BaseColorToken = keyof typeof baseTokens.colors;
export type BaseTypographyToken = keyof typeof baseTokens.typography;
