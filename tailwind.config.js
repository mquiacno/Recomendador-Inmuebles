/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f7f4ee",
        ink: "#2b322e",
        brand: {
          50: "#eef4f2",
          100: "#d8e8e3",
          200: "#b8d4cc",
          300: "#8fb9ae",
          500: "#4f8a7d",
          600: "#387266",
          700: "#2b584f",
        },
        mint: {
          50: "#f3f7ef",
          100: "#e3edd8",
          200: "#c9ddb6",
          300: "#a9c78f",
          500: "#77995f",
          600: "#5f804b",
          700: "#4a663b",
        },
        slate: {
          50: "#f7f4ee",
          100: "#efeae1",
          200: "#e2dbcf",
          300: "#cfc6b8",
          400: "#8a8479",
          500: "#6b665e",
          600: "#56534c",
          700: "#3f3d37",
          800: "#2e2d29",
          900: "#211f1c",
        },
        amber: {
          100: "#f6e7d1",
          800: "#7d5a35",
        },
        rose: {
          50: "#fbefef",
          100: "#f5dede",
          700: "#9b5151",
        },
      },
      boxShadow: {
        soft: "0 1px 2px rgba(43, 50, 46, 0.04), 0 14px 32px rgba(43, 50, 46, 0.06)",
        lg: "0 12px 30px rgba(43, 50, 46, 0.10)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        display: ["Iowan Old Style", "Palatino Linotype", "Book Antiqua", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
