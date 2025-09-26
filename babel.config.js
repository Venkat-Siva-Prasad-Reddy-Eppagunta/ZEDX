module.exports = {
  presets: [
    [
      'babel-preset-expo',
      {
        reanimated: false, 
      },
    ],
  ],
  plugins: [
    'react-native-worklets/plugin',
    'babel-plugin-react-compiler',
  ],
};