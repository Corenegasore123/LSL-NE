/**
 * Tailwind / NativeWind theme. Maps utility classes (bg-background, text-ink,
 * font-serif, etc.) to CSS variables defined in global.css and custom fonts.
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.tsx',
    './index.ts',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--color-background) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-elevated': 'rgb(var(--color-surface-elevated) / <alpha-value>)',
        card: 'rgb(var(--color-card) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        'accent-secondary': 'rgb(var(--color-accent-secondary) / <alpha-value>)',
        'accent-foreground': 'rgb(var(--color-accent-foreground) / <alpha-value>)',
        ink: 'rgb(var(--color-text) / <alpha-value>)',
        'ink-secondary': 'rgb(var(--color-text-secondary) / <alpha-value>)',
        'ink-muted': 'rgb(var(--color-text-muted) / <alpha-value>)',
        success: 'rgb(var(--color-success) / <alpha-value>)',
        error: 'rgb(var(--color-error) / <alpha-value>)',
        overlay: 'rgb(var(--color-overlay) / <alpha-value>)',
        white: 'rgb(var(--color-white) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['PlusJakartaSans_400Regular'],
        medium: ['PlusJakartaSans_500Medium'],
        semibold: ['PlusJakartaSans_600SemiBold'],
        bold: ['PlusJakartaSans_700Bold'],
        serif: ['PlayfairDisplay_700Bold'],
      },
      fontSize: {
        display: ['40px', { lineHeight: '48px', letterSpacing: '-0.5px' }],
        hero: ['34px', { lineHeight: '42px', letterSpacing: '-0.3px' }],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        soft: '0 8px 24px rgba(0, 0, 0, 0.08)',
        card: '0 4px 20px rgba(0, 0, 0, 0.07)',
        fab: '0 6px 20px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
};
