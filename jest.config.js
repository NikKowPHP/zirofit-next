module.exports = {
  testEnvironment: 'jsdom', // Changed from 'node'
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { configFile: './babel.config.jest.js' }], // Changed from ts-jest
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/mocks/styleMock.js',
    // This will handle the dynamic [locale] segment in paths
    '^@/app/\\[locale\\]/(.*)$': '<rootDir>/src/app/[locale]/$1',
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(isows|@supabase/ssr|@supabase/supabase-js|@supabase/realtime-js)/)"
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
  modulePathIgnorePatterns: [],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/tests/'],
  testTimeout: 30000,
};