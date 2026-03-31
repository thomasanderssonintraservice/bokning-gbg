/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#e6f0f8",
          100: "#cce1f1",
          200: "#99c3e3",
          300: "#66a5d5",
          400: "#3387c7",
          500: "#005B99",
          600: "#004f87",
          700: "#003d68",
          800: "#002b4a",
          900: "#001a2d",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
