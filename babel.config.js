module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  overrides: [
    {
      plugins: [
        [
          '@babel/plugin-transform-private-methods',
          {
            loose: true,
          },
        ],
      ],
    },
  ],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@assets': './src/assets',
          '@components': './src/components',
          '@screens': './src/screens',
          '@navigation': './src/navigation',
          '@styles': './src/styles',
          '@theme': './src/theme',
          '@utils': './src/utils',
          '@containers': './src/containers',
          '@constants': './src/constants',
          '@apis/*': './src/apis',
          '@hooks/*': './src/hooks',
          '@mocks/*': './src/mocks',
          '@redux/*': './src/redux',
          '@hoc/*': './src/hoc',
        },
      },
    ],
    'react-native-reanimated/plugin', // This has to be listed last
  ],
};
