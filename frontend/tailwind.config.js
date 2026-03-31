/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cafeto: {
          dark: '#2A1810',
          base: '#4A2A1A',
          red: '#D34032',
          orange: '#F58220',
          light: '#F8F1EB'
        }
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out forwards',
        'slide-out': 'slideOut 0.3s ease-in forwards',
        'float-subtle': 'floatSubtle 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'soft-appear': 'softAppear 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'toast-in': 'toastIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'toast-out': 'toastOut 0.3s ease-in forwards',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        floatSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        softAppear: {
          '0%': { transform: 'scale(0.98) translateY(10px)', opacity: '0' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
        toastIn: {
          '0%': { transform: 'translate(-50%, -100%) scale(0.9)', opacity: '0' },
          '100%': { transform: 'translate(-50%, 0) scale(1)', opacity: '1' },
        },
        toastOut: {
          '0%': { transform: 'translate(-50%, 0) scale(1)', opacity: '1' },
          '100%': { transform: 'translate(-50%, -20px) scale(0.95)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
