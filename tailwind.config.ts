import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Mundo Deportivo palette
        md: '#E30613',           // red icónico MD
        'md-dark': '#B30510',
        'md-black': '#0A0A0A',
        'md-grey': '#1A1A1A',
        'md-grey-light': '#2A2A2A',
        'md-border': '#333333',
        accent: '#FFC700',       // amarillo acento
        surface: '#F5F5F5',      // fondo claro
        paper: '#FFFFFF',
        ink: '#0A0A0A',
        ink2: '#3A3A3A',
        ink3: '#767676',
        muted: '#A0A0A0',
        border: '#E0E0E0',
        win: '#0F9B46',
        draw: '#6B7280',
        loss: '#E30613',
      },
      fontFamily: {
        display: ['var(--font-oswald)', 'Impact', 'sans-serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      fontSize: {
        'mega': ['5rem', { lineHeight: '0.9', letterSpacing: '-0.03em' }],
        'display': ['3.5rem', { lineHeight: '0.95', letterSpacing: '-0.02em' }],
        'headline': ['2rem', { lineHeight: '1.05', letterSpacing: '-0.01em' }],
        'title': ['1.375rem', { lineHeight: '1.15' }],
      },
    },
  },
  plugins: [],
}

export default config
