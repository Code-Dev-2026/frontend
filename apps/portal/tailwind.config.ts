import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0f172a',
          accent: '#1d4ed8'
        }
      }
    }
  },
  plugins: []
};

export default config;
