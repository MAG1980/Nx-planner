//@ts-check

 
const {composePlugins, withNx} = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  // Use this to set Nx-specific options
  // See: https://nx.dev/recipes/next/next-config-setup
  nx: {
    svgr: false,
  },
  webpack: (config, {isServer}) => {
    // Добавляем алиасы
    config.resolve.alias = {
      ...config.resolve.alias,
      // '@web/*': ['apps/web/src*'],
      // '@shared-types': ['../../libs/shared-types/src/index.ts']
    };
    return config;
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
