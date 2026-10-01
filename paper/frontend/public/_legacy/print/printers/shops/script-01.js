// Extracted from ui/print/printers/shops.html (inline <script> #1).
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui'] },
          colors: {
            brand: {
              50: '#F6F5FA', 100: '#EEEAF4', 200: '#D9CCE6', 300: '#C1A3D2',
              400: '#A574BD', 500: '#9E4B8A', 600: '#6E3868', 700: '#4C2A59',
              800: '#2C2240', 900: '#1E1E2F'
            }
          },
          boxShadow: {
            'elev-1': '0 1px 2px rgba(0,0,0,.06), 0 1px 1px rgba(0,0,0,.04)',
            'elev-2': '0 8px 24px rgba(0,0,0,.12)',
            'neon': '0 0 0 1px rgba(158,75,138,.25), 0 8px 32px rgba(158,75,138,.25)'
          }
        }
      }
    }
