// jest.config.js
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ["**/tests/**/*.test.ts"], 
  moduleDirectories: ["node_modules", "src"],
  // 👇 CRITICAL CHANGE: Tell ts-jest to use the test config
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    },
  },
};