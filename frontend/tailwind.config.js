/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50:  "#f0f4ff",
          100: "#dce8ff",
          200: "#b8cefd",
          300: "#88aaff",
          400: "#5b7fff",
          500: "#3b5bdb",
          600: "#2c4ac9",
          700: "#2239a8",
          800: "#1e2f88",
          900: "#152068",
        },
        surface: {
          900: "#0d0f16",
          800: "#12151f",
          700: "#181c27",
          600: "#1e2333",
          500: "#252a3a",
          400: "#2e3449",
        },
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
        "fade-in": "fadeIn 0.3s ease",
        "slide-up": "slideUp 0.3s ease",
        pulse2: "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-700px 0" },
          "100%": { backgroundPosition: "700px 0" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
