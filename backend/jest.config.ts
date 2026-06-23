// jest.config.ts
import type { Config } from "jest";

const config: Config = {
  // Usa ts-jest para entender TypeScript
  preset: "ts-jest",

  // Ambiente Node (não browser)
  testEnvironment: "node",

  // Onde ficam os testes
  testMatch: ["**/__tests__/**/*.spec.ts", "**/__tests__/**/*.test.ts"],

  // Mostra cada teste individualmente no terminal
  verbose: true,

  // Zera os mocks automaticamente entre cada teste
  clearMocks: true,

  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.test.json",
      },
    ],
  },

  // Relatório de cobertura de código
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/prisma/**", // ignora config do prisma
    "!src/server.ts", // ignora entry point
  ],
};

export default config;
