/**
 * Tokens base del sistema de diseño Camino Seguro (`cs/*`).
 * Extraídos de Figma: páginas `00 Tokens` (`15:75`) y `01 Componentes` (`15:76`).
 */
export const baseTokens = {
  colors: {
    // Marca (cs/navy-900, cs/cyan-500, cs/orange-500, cs/primary-500, cs/link-600)
    navy900: '#023866',
    cyan500: '#0abae2',
    orange500: '#fca11f',
    primary500: '#1877f2',
    link600: '#1464cf',

    // Acciones, foco y estados deshabilitados
    actionPrimary: '#1464cf',
    actionPrimaryPressed: '#023866',
    actionSoftPressed: '#047857',
    actionSoftPressedText: '#ffffff',
    focusRing: '#1464cf',
    disabledBg: '#e2e8f0',
    disabledText: '#334155',

    // Superficies y bordes
    surface: '#ffffff',
    surfaceInput: '#f8fafc',
    borderSoft: '#e2e8f0',
    borderStrong: '#cbd5e1',

    // Tipografía
    textStrong: '#0f172a',
    textBody: '#334155',
    textMuted: '#64748b',

    // Estados semánticos
    infoBg: '#e6f8fd',
    infoBorder: '#0abae2',
    infoText: '#023866',
    successBg: '#ecfdf5',
    successBorder: '#6ee7b7',
    successText: '#047857',
    warningBg: '#fff7ed',
    warningBorder: '#fca11f',
    warningText: '#9a3412',
    criticalBg: '#fef2f2',
    criticalBorder: '#fca5a5',
    criticalText: '#b91c1c',
    criticalSolid: '#dc2626',

    // Fondo translúcido para overlays / modales (navy-900 con opacidad)
    backdrop: 'rgba(2, 56, 102, 0.48)',
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
      shadowColor: '#023866',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
      elevation: 8,
    },
  },
} as const;

export type BaseTokens = typeof baseTokens;
export type BaseColorToken = keyof typeof baseTokens.colors;
export type BaseTypographyToken = keyof typeof baseTokens.typography;
