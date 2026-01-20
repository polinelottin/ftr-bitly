/**
 * Design System Tokens
 * 
 * Re-exporta colors.js com type-safety para uso no TypeScript/React.
 * 
 * IMPORTANTE: As cores são definidas em colors.js (single source of truth).
 * Este arquivo apenas adiciona type-safety e helpers TypeScript.
 */

import { colors as colorsBase } from './colors.js';

// Re-exporta mantendo type-safety
// O tipo é inferido automaticamente do colors.js através do arquivo .d.ts
export const colors = colorsBase;

/**
 * Tipo para as cores do design system
 */
export type DesignSystemColor = typeof colors;

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