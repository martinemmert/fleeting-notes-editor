/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx,astro}"],
  theme: {},
  plugins: [
    require("daisyui"),
    require("@kobalte/tailwindcss")
  ]
};
