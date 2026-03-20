/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        inherit: 'inherit',
      },
      backdropBlur: {
        xs: '4px',
        '2xl': '48px',
        '3xl': '64px',
      },
      blur: {
        xs: '4px',
        '2xl': '48px',
        '3xl': '64px',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        },
        // Glass-specific colors
        glass: {
          white: 'rgba(255, 255, 255, 0.75)',
          'white-subtle': 'rgba(255, 255, 255, 0.6)',
          'white-solid': 'rgba(255, 255, 255, 0.92)',
          dark: 'rgba(9, 9, 11, 0.8)',
          'dark-subtle': 'rgba(9, 9, 11, 0.6)',
          border: 'rgba(255, 255, 255, 0.2)',
          'border-strong': 'rgba(255, 255, 255, 0.35)',
        }
      },
      boxShadow: {
        'glass-sm': '0 2px 8px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.02)',
        'glass-md': '0 4px 12px rgba(0, 0, 0, 0.05), 0 8px 24px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'glass-lg': '0 8px 24px rgba(0, 0, 0, 0.06), 0 16px 48px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        'glass-xl': '0 12px 40px rgba(0, 0, 0, 0.08), 0 24px 64px rgba(0, 0, 0, 0.06), inset 0 2px 0 rgba(255, 255, 255, 0.2)',
      },
      transitionTimingFunction: {
        'glass': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'luxury': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'marquee': {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-33.333%)' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'glass-shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        'glass-pulse': {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '1' }
        },
        'glass-reveal': {
          from: { opacity: '0', backdropFilter: 'blur(0px)', transform: 'translateY(10px)' },
          to: { opacity: '1', backdropFilter: 'blur(12px)', transform: 'translateY(0)' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'marquee': 'marquee 25s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'glass-shimmer': 'glass-shimmer 3s ease-in-out infinite',
        'glass-pulse': 'glass-pulse 3s ease-in-out infinite',
        'glass-reveal': 'glass-reveal 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
};
