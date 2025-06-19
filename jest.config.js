module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
 transform: {
    // Use babel-jest to transpile tests with the custom babel config
    // This single entry handles JS, JSX, TS, and TSX files.
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { configFile: './babel.config.jest.js' }],
  },

  transformIgnorePatterns: [
    'node_modules/(?!(node-fetch|data-uri-to-buffer|fetch-blob)/)'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};