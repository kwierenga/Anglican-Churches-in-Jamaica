module.exports = {
  content: ['./index.html','./src/**/*.{ts,tsx,js,jsx,md}'],
  theme: {
    extend: {
      colors: {
        crimson:      { DEFAULT: '#8B0000', dark: '#6B0000', mid: '#A52828', light: '#C04040' },
        gold:         { DEFAULT: '#B8860B', bright: '#D4A017' },
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
