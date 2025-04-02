// babel.config.cjs
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          chrome: '73', // Android 9 WebView 기반 (Chrome 73)
        },
        useBuiltIns: 'usage', // 필요한 폴리필만 포함
        corejs: 3,
      },
    ],
    '@babel/preset-typescript',
  ],
};
