// Extracted from ui/medical_notes.html (inline <script> #2).
    // Use the same palette + mode behavior as other PaperX pages when CDN dev build is present
    if (window.tailwind) {
      window.tailwind.config = {
        darkMode: 'class',
        theme: {
          extend: {
            fontFamily: {
              sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
            },
            colors: {
              brand: { 900: '#1E1E2F', 700: '#4C2A59', 500: '#9E4B8A' },
              brandlt: { 50: '#FAF5FB', 100: '#F3E7F2', 200: '#E7D0E4', 300: '#D9B4D3', 400: '#C88DBA', 500: '#9E4B8A', 700: '#4C2A59', 900: '#1E1E2F' },
              surface: { DEFAULT: 'var(--surface)', dim: 'var(--surface-dim)', contrast: 'var(--surface-contrast)' }
            },
            boxShadow: {
              glow: '0 8px 30px rgba(158,75,138,0.35)',
              neon: '0 0 25px rgba(158,75,138,.35), 0 0 60px rgba(158,75,138,.25)',
              'e1': '0 1px 2px rgba(0,0,0,0.06)',
              'e2': '0 2px 6px rgba(0,0,0,0.08)',
              'e3': '0 6px 12px rgba(0,0,0,0.10)',
              'e4': '0 10px 16px rgba(0,0,0,0.12)'
            },
            keyframes: {
              in: { '0%': { opacity: 0, transform: 'translateY(6px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
              pulsebar: { '0%': { width: '8%' }, '50%': { width: '55%' }, '100%': { width: '92%' } },
              shimmer: { '0%': { backgroundPosition: '-468px 0' }, '100%': { backgroundPosition: '468px 0' } }
            },
            animation: { in: 'in .25s ease-out', pulsebar: 'pulsebar 1.8s ease-in-out infinite', shimmer: 'shimmer 1.25s linear infinite' }
          }
        }
      };
    }
