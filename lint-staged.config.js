const { execSync } = require('child_process');
const path = require('path');

module.exports = {
  '*.{js,jsx,ts,tsx,json,md,html,css,scss}': (files) => {
    const relativePaths = files.map((f) => path.relative(process.cwd(), f));
    return [
      `nx format:write --files=${relativePaths.join(',')}`,
      `nx affected:lint --files=${relativePaths.join(',')} --fix`,
      // Исключено тестирование.
      // `nx affected:test --files=${relativePaths.join(',')}`
    ];
  },
};
