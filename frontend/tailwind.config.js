/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary: Deep Navy Blue — màu chủ đạo đen xanh dương
        primary: {
          50:  '#e8f0fe',
          100: '#c5d8fc',
          200: '#9dbef9',
          300: '#6fa3f5',
          400: '#4a8df0',
          500: '#2563eb',
          600: '#1a4fd6',
          700: '#1240b8',
          800: '#0d3299',
          900: '#0a2470',
          950: '#060f3d',
        },
        // Navy: Đen xanh đậm — dùng cho sidebar, header, dark surfaces
        navy: {
          50:  '#eef2f8',
          100: '#d5dff0',
          200: '#aabfe0',
          300: '#7a9bcc',
          400: '#4f7ab8',
          500: '#2d5fa0',
          600: '#1e4a87',
          700: '#153870',
          800: '#0e2855',
          900: '#091a3a',
          950: '#040d1e',
        },
        // Accent: Cyan/Teal — điểm nhấn sáng
        accent: {
          50:  '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
        // Success green
        success: {
          50:  '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
        },
        "background-light": "#f1f5f9",
        "background-dark":  "#060f1e",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
        sans:    ["Inter", "sans-serif"],
      },
      borderRadius: {
        "DEFAULT": "0.375rem",
        "lg":  "0.75rem",
        "xl":  "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
        "full": "9999px",
      },
      animation: {
        "fade-in":    "fade-in 0.4s ease-out",
        "slide-up":   "slide-up 0.4s ease-out",
        "bounce-slow":"bounce-slow 3s ease-in-out infinite",
      },
      keyframes: {
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%":   { transform: "translateY(16px)", opacity: "0" },
          "100%": { transform: "translateY(0)",    opacity: "1" },
        },
        "bounce-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-8px)" },
        },
      },
      boxShadow: {
        'card':       '0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 24px -4px rgba(0,0,0,0.12), 0 2px 8px -2px rgba(0,0,0,0.08)',
        'nav':        '0 1px 0 0 rgba(0,0,0,0.06)',
        'modal':      '0 24px 64px -12px rgba(0,0,0,0.25)',
      },
    },
  },
  plugins: [],
}
