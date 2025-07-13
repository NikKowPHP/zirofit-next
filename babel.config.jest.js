// babel.config.js
module.exports = {
  presets: [
    // Configure preset-env for the Node.js version running the tests
    ['@babel/preset-env', { targets: { node: 'current' } }],
    // Configure preset-react for JSX transformation
    ['@babel/preset-react', { runtime: 'automatic' }],
    // Add preset for TypeScript
    '@babel/preset-typescript',
  ],
  plugins: [
    // Add the module-resolver plugin for handling path aliases like '@/'
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src',
        },
      },
    ],
  ],
};