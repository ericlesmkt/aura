// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        aura: {
          gold: "#ffd000",      // A cor primária (Ação/Dinheiro)
          black: "#050505",     // Fundo principal (OLED Black)
          surface: "#121212",   // Cartões e Modais
          border: "rgba(255, 255, 255, 0.1)", // Bordas sutis
        },
      },
      fontFamily: {
        // Se quiser adicionar uma fonte futurista depois, é aqui
        sans: ['var(--font-inter)', 'sans-serif'], 
      },
      boxShadow: {
        'glow-gold': '0 0 20px -5px rgba(255, 208, 0, 0.3)',
      }
    },
  },
  plugins: [],
};
export default config;