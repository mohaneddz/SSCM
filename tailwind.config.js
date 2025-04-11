/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'blue-700': 'var(--light-blue-3)',
        bad: 'var(--color-bad)',
        neutral: 'var(--color-neutral)',
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
      },
    },
  },
  plugins: [],
  safelist: [
    'from-primary',
    'from-blue-700',
    'from-bad',
    'from-neutral',
    'via-primary/10',
    'via-blue-700/10',
    'via-bad/10',
    'via-neutral/10',
    'to-primary/5',
    'to-blue-700/5',
    'to-bad/5',
    'to-neutral/5',
  ]
} 