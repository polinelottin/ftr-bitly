/**
 * Design System Tokens
 * 
 * Re-exporta colors.js e typography.js com type-safety para uso no TypeScript/React.
 * 
 * IMPORTANTE: As cores são definidas em colors.js e tipografia em typography.js (single source of truth).
 * Este arquivo apenas adiciona type-safety e helpers TypeScript.
 */

import { colors as colorsBase } from './colors.js';
import { typography as typographyBase } from './typography.js';

// Re-exporta mantendo type-safety
// O tipo é inferido automaticamente do colors.js e typography.js através dos arquivos .d.ts
export const colors = colorsBase;
export const typography = typographyBase;

/**
 * Tipo para as cores do design system
 */
export type DesignSystemColor = typeof colors;

/**
 * Tipo para tipografia do design system
 */
export type DesignSystemTypography = typeof typography;

/**
 * Helper para obter cores de forma type-safe
 */
export const getColor = (path: string): string => {
  const keys = path.split(".");
  let value: any = colors;
  
  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      throw new Error(`Color not found: ${path}`);
    }
  }
  
  return value as string;
};