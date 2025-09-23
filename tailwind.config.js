/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors:{
        primary: "#030014",
      },
      fontFamily: {
        sans: ["HindSiliguri_400Regular", "system-ui"],
        body: ["HindSiliguri_400Regular"], // Create a body font family
      },
    },
  },
  plugins: [],
}
