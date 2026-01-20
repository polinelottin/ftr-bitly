/**
 * Type definitions for typography.js
 * 
 * Declarações de tipo para o arquivo typography.js
 * Permite type-safety ao importar typography.js em arquivos TypeScript
 */

export const typography: {
  fontFamily: {
    sans: string[];
  };
  fontSize: {
    xl: [string, { lineHeight: string }];
    lg: [string, { lineHeight: string }];
    md: [string, { lineHeight: string }];
    sm: [string, { lineHeight: string }];
    xs: [string, { lineHeight: string }];
  };
  fontWeight: {
    regular: string;
    semibold: string;
    bold: string;
  };
};
