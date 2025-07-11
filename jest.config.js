export const preset = 'ts-jest';
export const testEnvironment = 'node';
export const transform = {
  '^.+\\.tsx?$': [
    'ts-jest',
    {
      tsconfig: 'tsconfig.json',
      stringifyContentPathRegex: '\\.svg$',
    },
  ],
};
export const moduleNameMapper = {
  '^@/(.*)$': '<rootDir>/src/$1',
};
export const transformIgnorePatterns = ['<rootDir>/node_modules/'];
export const moduleFileExtensions = ['ts', 'tsx', 'js', 'jsx', 'json', 'node'];
export const testMatch = ['**/?(*.)+(spec|test).[tj]s?(x)'];
export const modulePathIgnorePatterns = [];
export const setupFilesAfterEnv = ['<rootDir>/jest.setup.ts'];
export const testPathIgnorePatterns = ['<rootDir>/node_modules/', '<rootDir>/tests/'];
export const testTimeout = 30000;