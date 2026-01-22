/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./.storybook/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design token abstractions
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
        },
        neutral: {
          50: 'var(--color-neutral-50)',
          100: 'var(--color-neutral-100)',
          200: 'var(--color-neutral-200)',
          300: 'var(--color-neutral-300)',
          400: 'var(--color-neutral-400)',
          500: 'var(--color-neutral-500)',
          600: 'var(--color-neutral-600)',
          700: 'var(--color-neutral-700)',
          800: 'var(--color-neutral-800)',
          900: 'var(--color-neutral-900)',
        },
        success: {
          50: 'var(--color-success-50)',
          500: 'var(--color-success-500)',
          700: 'var(--color-success-700)',
        },
        error: {
          50: 'var(--color-error-50)',
          500: 'var(--color-error-500)',
          700: 'var(--color-error-700)',
        },
        warning: {
          50: 'var(--color-warning-50)',
          500: 'var(--color-warning-500)',
          700: 'var(--color-warning-700)',
        },
      },
      spacing: {
        'xs': 'var(--spacing-xs)',
        'sm': 'var(--spacing-sm)',
        'md': 'var(--spacing-md)',
        'lg': 'var(--spacing-lg)',
        'xl': 'var(--spacing-xl)',
        '2xl': 'var(--spacing-2xl)',
      },
      borderRadius: {
        'xs': 'var(--radius-xs)',
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
      },
      fontSize: {
        'xs': ['var(--font-size-xs)', { lineHeight: 'var(--line-height-xs)' }],
        'sm': ['var(--font-size-sm)', { lineHeight: 'var(--line-height-sm)' }],
        'base': ['var(--font-size-base)', { lineHeight: 'var(--line-height-base)' }],
        'lg': ['var(--font-size-lg)', { lineHeight: 'var(--line-height-lg)' }],
        'xl': ['var(--font-size-xl)', { lineHeight: 'var(--line-height-xl)' }],
      },
    },
  },
  plugins: [],
}