/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./{about,collab,collage,matketplace,projects,teachers,tales}/**/*.html",
  ],
  safelist: [
    // Safelist dynamic color utilities if any are constructed in JS
    { pattern: /bg-(brand|brandAlt|brandlt)-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /text-(brand|brandAlt|brandlt)-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /shadow-(glow|neon|brand-lg|soft|card)/ }
  ],
  darkMode: 'class',
  theme: {
    container: { center: true, padding: '1rem' },
    extend: {
      fontFamily: {
        sans: ['Inter','ui-sans-serif','system-ui','sans-serif'],
        display: ['Inter','ui-sans-serif','system-ui','sans-serif']
      },
      // Promote purple palette (old brandlt) to primary brand so existing bg-brand-* etc become purple again
      colors: {
        brand: { 50: '#FAF5FB', 100: '#F3E7F2', 200: '#E7D0E4', 300: '#D9B4D3', 400: '#C88DBA', 500: '#9E4B8A', 600: '#7d3c6d', 700: '#4C2A59', 800: '#362042', 900: '#1E1E2F' },
        brandAlt: { 50:'#eef4ff',100:'#d9e6ff',200:'#b3ccff',300:'#88adff',400:'#628fff',500:'#3f6fff',600:'#2f56e6',700:'#2846bb',800:'#223a95',900:'#1c2f78' },
        // Keep legacy reference name for any pages that still use brandlt-* explicitly
        brandlt: { 50: '#FAF5FB', 100: '#F3E7F2', 200: '#E7D0E4', 300: '#D9B4D3', 400: '#C88DBA', 500: '#9E4B8A', 700: '#4C2A59', 900: '#1E1E2F' },
        ink: { 50: '#f7f7f9', 900: '#0c0f14' },
        plum: '#4C2A59',
        orchid: '#9E4B8A',
        night: { 900: '#0a0c10', 800: '#0f131a', 700: '#141a22', 600: '#1a2230' }
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(59,130,246,.2), 0 8px 40px rgba(59,130,246,.15)',
        neon: '0 0 25px rgba(43,140,255,.35)',
        'brand-lg': '0 10px 30px rgba(63,111,255,.25)',
        'soft': '0 4px 20px rgba(0,0,0,.12)',
        'card': '0 6px 24px rgba(30,30,47,0.35)'
      },
      backgroundImage: {
        'hero-dark': 'radial-gradient(1000px 600px at 50% -10%, rgba(158,75,138,0.28), transparent 60%), linear-gradient(180deg,#1E1E2F 0%,#201934 35%,#141321 100%)',
        'hero-light': 'radial-gradient(1000px 600px at 50% -10%, rgba(158,75,138,0.20), transparent 60%), linear-gradient(180deg,#FFFFFF,#FBF8FC 45%,#F7F2F9 100%)'
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/line-clamp'),
  ],
};
