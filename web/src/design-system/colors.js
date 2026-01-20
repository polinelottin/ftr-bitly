/**
 * Design System Colors - Single Source of Truth
 * 
 * TODAS as cores do design system devem ser definidas APENAS aqui.
 * Este arquivo é a única fonte de verdade para todas as cores.
 * 
 * Outros arquivos devem importar este arquivo:
 * - tailwind.config.js importa diretamente (para uso via classes Tailwind)
 * - tokens.ts re-exporta com type-safety (para uso programático em TypeScript/React)
 */

export const colors = {
  blue: {
    base: "#2C46B1",
    dark: "#2C4091",
  },
  gray: {
    100: "#F9F9FB",
    200: "#E4E6EC",
    300: "#CDCFD5",
    400: "#74798B",
    500: "#4D505C",
    600: "#1F2025",
  },
  white: "#FFFFFF",
  danger: "#B12C4D",
};
