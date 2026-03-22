import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{ts,tsx,mdx}',
    './components/**/*.{ts,tsx,mdx}',
    './lib/**/*.{ts,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontWeight: {
        600: '600',
        700: '700',
        800: '800',
      },
      colors: {
        blue: {
          50: '#EEF2FF',
          100: '#C7D3F7',
          200: '#9FB4F0',
          500: '#4B74E8',
          600: '#1B4FCC',
          700: '#1744B8',
          900: '#0F2D7A',
        },
        danger: {
          50: '#FEF3F2',
          100: '#FECDCA',
          500: '#F04438',
          600: '#D92D20',
          700: '#B42318',
        },
        warning: {
          50: '#FFFAEB',
          100: '#FEF0C7',
          500: '#F79009',
          600: '#DC6803',
          700: '#B54708',
        },
        success: {
          50: '#ECFDF3',
          100: '#DCFAE6',
          500: '#17B26A',
          600: '#079455',
          700: '#067647',
        },
        ink: {
          950: '#0A0F1E',
          900: '#111827',
          700: '#374151',
          500: '#6B7280',
          400: '#9CA3AF',
          200: '#E5E7EB',
          100: '#F3F4F6',
          50: '#F9FAFB',
        },
      },
      fontFamily: {
        display: ['var(--font-bricolage)', 'sans-serif'],
        body: ['var(--font-geist)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        blue: '0 8px 24px rgba(27,79,204,0.25)',
      },
      animation: {
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(0.7)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
