/**
 * Design System Typography - Single Source of Truth
 * 
 * TODAS as definições de tipografia do design system devem ser definidas APENAS aqui.
 * Este arquivo é a única fonte de verdade para todas as configurações de tipografia.
 * 
 * Outros arquivos devem importar este arquivo:
 * - tailwind.config.js importa diretamente (para uso via classes Tailwind)
 * - tokens.ts re-exporta com type-safety (para uso programático em TypeScript/React)
 */

export const typography = {
  fontFamily: {
    sans: ['Open Sans', 'sans-serif'],
  },
  fontSize: {
    xl: ['24px', { lineHeight: '32px' }],
    lg: ['18px', { lineHeight: '24px' }],
    md: ['14px', { lineHeight: '18px' }],
    sm: ['12px', { lineHeight: '16px' }],
    xs: ['10px', { lineHeight: '14px' }],
  },
  fontWeight: {
    regular: '400',
    semibold: '600',
    bold: '700',
  },
};
