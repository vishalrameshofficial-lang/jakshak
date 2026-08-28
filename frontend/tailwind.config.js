/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        safe: {
          DEFAULT: "#10b981",
          light: "#ecfdf5",
          border: "#a7f3d0"
        },
        watch: {
          DEFAULT: "#f59e0b",
          light: "#fffbeb",
          border: "#fde68a"
        },
        warning: {
          DEFAULT: "#f97316",
          light: "#fff7ed",
          border: "#ffedd5"
        },
        critical: {
          DEFAULT: "#ef4444",
          light: "#fef2f2",
          border: "#fecaca"
        },
        water: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          500: "#0284c7",
          600: "#0369a1",
          900: "#0c4a6e"
        }
      }
    }
  },
  plugins: []
};
