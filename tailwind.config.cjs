module.exports = {
  content: ['./index.html','./src/**/*.{ts,tsx,js,jsx,md}'],
  theme: {
    extend: {
      colors: {
        crimson:      { DEFAULT: '#8B0000', dark: '#6B0000', mid: '#A52828', light: '#C04040' },
        // `deep` is the only gold that passes WCAG AA as text: 5.3:1 on white,
        // 4.8:1 on ivory. DEFAULT (3.2:1) and bright (2.6:1) are for rules,
        // borders, and gold-on-dark only — never for text on a light surface.
        gold:         { DEFAULT: '#B8860B', bright: '#D4A017', deep: '#8A6508' },
        navy:         { DEFAULT: '#1E2D4E', light: '#2C3F6B' },
        ivory:        '#F8F4E8',
        parchment:    '#F0EAD6',
      },
      fontFamily: {
        heading: ['"EB Garamond"', 'Georgia', 'serif'],
        body:    ['"Crimson Text"', 'Georgia', 'serif'],
      },
      maxWidth: {
        site: '1140px',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')]
}
