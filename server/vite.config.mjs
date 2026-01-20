import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    // Configura os testes para rodar sequencialmente (um por vez)
    // Isso evita conflitos de concorrência no banco de dados durante os testes
    // e garante que a limpeza de dados funcione corretamente
    // Com maxConcurrency: 1, os testes rodam um de cada vez
    maxConcurrency: 1,
  },
})
