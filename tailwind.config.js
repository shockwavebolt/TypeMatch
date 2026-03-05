/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}"],
  theme: {
    extend: {
      colors: {
        button: "var(--bg-button)",
      },
    },
  },
  plugins: [],
};
