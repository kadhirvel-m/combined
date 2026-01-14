const fs = require('fs');
const postcss = require('postcss');
const tailwindcss = require('tailwindcss');

(async () => {
  const inputCss = [
    '@tailwind base;',
    '@tailwind components;',
    '@tailwind utilities;'
  ].join('\n');

  try {
    const result = await postcss([tailwindcss('./tailwind.config.js')])
      .process(inputCss, { from: undefined });

    fs.mkdirSync('./assets/css', { recursive: true });
    fs.writeFileSync('./assets/css/tailwind.css', result.css, 'utf8');
    console.log('Tailwind CSS generated: assets/css/tailwind.css');
  } catch (e) {
    console.error('Tailwind build failed', e);
    process.exit(1);
  }
})();
