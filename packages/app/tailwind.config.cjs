/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        proxima: "proxima-nova, sans-serif",
        freight: "freight-text-pro, serif",
        "freight-sans": "freight-sans-condensed-pro, serif",
        edita: "edita, serif",
        source: "source-serif-4-display, serif"
      }
    }
  },
  plugins: []
};
