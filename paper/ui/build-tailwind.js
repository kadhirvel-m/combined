const { compile } = require('tailwindcss');
const fs = require('fs');
(async () => {
  try {
    const result = await compile([
      '@import "tailwindcss/base";',
      '@import "tailwindcss/components";',
      '@import "tailwindcss/utilities";'
    ].join('\n'));
    fs.mkdirSync('./assets/css', { recursive: true });
    fs.writeFileSync('./assets/css/tailwind.css', result.css, 'utf8');
    console.log('Tailwind CSS generated: assets/css/tailwind.css');
  } catch (e) {
    console.error('Tailwind build failed', e);
    process.exit(1);
  }
})();
