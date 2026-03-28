/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "matrix-green":  "#00ff41",
        "cyber-red":     "#ff003c",
        "deep-black":    "#050505",
        "neon-yellow":   "#ffff00",
        "neon-purple":   "#cc00ff",
        "neon-orange":   "#ff8800",
        "terminal-bg":   "#080808",
        "terminal-dark": "#0a0f0a",
        "terminal-mid":  "#0d1a0d",
      },
      fontFamily: {
        mono:    ["'Share Tech Mono'", "Courier New", "monospace"],
        display: ["'Orbitron'", "sans-serif"],
      },
      keyframes: {
        glitch: {
          "0%":   { clipPath: "polygon(0 2%,  100% 2%,  100% 5%,  0 5%)",  transform: "translate(-2px,0)" },
          "20%":  { clipPath: "polygon(0 15%, 100% 15%, 100% 18%, 0 18%)", transform: "translate(2px,0)"  },
          "40%":  { clipPath: "polygon(0 40%, 100% 40%, 100% 44%, 0 44%)", transform: "translate(-1px,0)" },
          "60%":  { clipPath: "polygon(0 60%, 100% 60%, 100% 65%, 0 65%)", transform: "translate(1px,0)"  },
          "80%":  { clipPath: "polygon(0 80%, 100% 80%, 100% 84%, 0 84%)", transform: "translate(-2px,0)" },
          "100%": { clipPath: "polygon(0 90%, 100% 90%, 100% 95%, 0 95%)", transform: "translate(2px,0)"  },
        },
        scanline: {
          "0%":   { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "41%":      { opacity: "1" },
          "42%":      { opacity: "0.8" },
          "43%":      { opacity: "1" },
          "45%":      { opacity: "0.3" },
          "46%":      { opacity: "1" },
        },
        "neon-pulse": {
          "0%, 100%": { boxShadow: "0 0 5px #00ff41, 0 0 10px #00ff41, 0 0 20px #00ff41" },
          "50%":      { boxShadow: "0 0 2px #00ff41, 0 0 5px  #00ff41, 0 0 10px #00ff41" },
        },
        "text-shimmer": {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition:  "200% center" },
        },
      },
      animation: {
        glitch:        "glitch 0.2s infinite linear alternate-reverse",
        scanline:      "scanline 6s linear infinite",
        flicker:       "flicker 8s infinite",
        "neon-pulse":  "neon-pulse 2s ease-in-out infinite",
        "text-shimmer":"text-shimmer 3s linear infinite",
      },
      boxShadow: {
        "neon-green":  "0 0 5px #00ff41, 0 0 10px #00ff4166, 0 0 20px #00ff4133",
        "neon-red":    "0 0 5px #ff003c, 0 0 10px #ff003c66, 0 0 20px #ff003c33",
        "neon-purple": "0 0 5px #cc00ff, 0 0 10px #cc00ff66, 0 0 20px #cc00ff33",
        "inner-terminal": "inset 0 0 30px rgba(0,255,65,0.05)",
      },
      backgroundImage: {
        "scanlines":     "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)",
        "grid-cyber":    "linear-gradient(rgba(0,255,65,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.03) 1px, transparent 1px)",
        "matrix-rain":   "linear-gradient(180deg, #00ff41 0%, transparent 100%)",
        "danger-gradient":"linear-gradient(90deg, #00ff41 0%, #ffff00 40%, #ff8800 70%, #ff003c 100%)",
      },
      backgroundSize: {
        "grid-cyber": "24px 24px",
      },
    },
  },
  plugins: [],
};
