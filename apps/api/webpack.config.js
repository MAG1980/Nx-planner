const {NxAppWebpackPlugin} = require('@nx/webpack/app-plugin');
const {join} = require('path');
const {composePlugins, withNx} = require("@nx/webpack");

module.exports = composePlugins(withNx(), (config) => {
  // Основная конфигурация
  config.output = {
    ...config.output,
    path: join(__dirname, '../../dist/apps/api'),
  };

  // Добавляем плагины
  config.plugins = [
    ...(config.plugins || []),
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    }),
  ];

  // Настройка алиасов
  config.resolve = {
    ...config.resolve,
    alias: {
      ...(config.resolve?.alias || {}),
      // '@api/*': resolve(__dirname, 'src'),
      // '@shared-types': resolve(__dirname, '../../libs/shared-types/src/index.ts'),
    },
  };

  return config;
});


module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/api'),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    }),
  ],
};
