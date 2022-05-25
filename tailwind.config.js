module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./client/components/**/*.{js,ts,jsx,tsx}", "./client/model/verbs/**/*.ts"],
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("tailwindcss-selection-variant"),
  ],
};
