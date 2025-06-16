module.exports = {
  transform: {
    '^.+\\.(js|jsx|ts|tsx|mjs)$': ['babel-jest', { configFile: './babel.test.babelrc' }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(node-fetch)/)'
  ],
  setupFilesAfterEnv: ['./jest.setup.mjs']
};