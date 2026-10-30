/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          900: '#064e3b',
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [
    // Lightweight in-house replacement for tailwindcss-animate (enter/exit utilities used by modals, drawers, menus)
    function ({ addBase, addUtilities, matchUtilities, theme }) {
      addBase({
        '@keyframes enter': {
          from: {
            opacity: 'var(--tw-enter-opacity, 1)',
            transform:
              'translate3d(var(--tw-enter-translate-x, 0), var(--tw-enter-translate-y, 0), 0) scale3d(var(--tw-enter-scale, 1), var(--tw-enter-scale, 1), var(--tw-enter-scale, 1))',
          },
        },
        '@keyframes exit': {
          to: {
            opacity: 'var(--tw-exit-opacity, 1)',
            transform:
              'translate3d(var(--tw-exit-translate-x, 0), var(--tw-exit-translate-y, 0), 0) scale3d(var(--tw-exit-scale, 1), var(--tw-exit-scale, 1), var(--tw-exit-scale, 1))',
          },
        },
      });
      addUtilities({
        '.animate-in': {
          animationName: 'enter',
          animationDuration: '220ms',
          animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          animationFillMode: 'both',
        },
        '.animate-out': {
          animationName: 'exit',
          animationDuration: '160ms',
          animationTimingFunction: 'ease-in',
          animationFillMode: 'forwards',
        },
      });
      const opacityVals = theme('opacity');
      const pct = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v]));
      matchUtilities({ 'fade-in': (v) => ({ '--tw-enter-opacity': v }) }, { values: pct(opacityVals) });
      matchUtilities({ 'fade-out': (v) => ({ '--tw-exit-opacity': v }) }, { values: pct(opacityVals) });
      const scaleVals = Object.fromEntries(
        Object.entries(theme('scale')).map(([k, v]) => [k, v])
      );
      matchUtilities({ 'zoom-in': (v) => ({ '--tw-enter-scale': v }) }, { values: scaleVals });
      matchUtilities({ 'zoom-out': (v) => ({ '--tw-exit-scale': v }) }, { values: scaleVals });
      const spacing = { ...theme('spacing'), DEFAULT: '100%', '1/2': '50%', full: '100%' };
      const slide = (kind, prefix, axis, sign) =>
        matchUtilities(
          { [`slide-${kind}-${prefix}`]: (v) => ({ [`--tw-${kind === 'in' ? 'enter' : 'exit'}-translate-${axis}`]: sign === '-' ? `calc(${v} * -1)` : v }) },
          { values: spacing }
        );
      slide('in', 'from-left', 'x', '-');
      slide('in', 'from-right', 'x', '+');
      slide('in', 'from-top', 'y', '-');
      slide('in', 'from-bottom', 'y', '+');
      slide('out', 'to-left', 'x', '-');
      slide('out', 'to-right', 'x', '+');
      slide('out', 'to-top', 'y', '-');
      slide('out', 'to-bottom', 'y', '+');
    },
  ],
}
