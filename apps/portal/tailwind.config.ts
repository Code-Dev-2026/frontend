import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0f172a',
          accent: '#1d4ed8',
        },
        cs: {
          navy: '#023866',
          cyan: '#0abae2',
          orange: '#fca11f',
          primary: '#1464cf',
          primaryHover: '#023866',
          textStrong: '#0f172a',
          textBody: '#334155',
          textMuted: '#64748b',
          borderStrong: '#cbd5e1',
          borderSoft: '#e2e8f0',
          surfaceInput: '#f8fafc',
          surface: '#ffffff',
          criticalBg: '#fef2f2',
          criticalBorder: '#fca5a5',
          criticalText: '#b91c1c',
          successBg: '#ecfdf5',
          successBorder: '#6ee7b7',
          successText: '#047857',
          infoBg: '#e6f8fd',
          disabledBg: '#e2e8f0',
        },
      },
      borderRadius: {
        'cs-input': '12px',
        'cs-button': '12px',
        'cs-card': '16px',
      },
    },
  },
  plugins: [],
};

export default config;
