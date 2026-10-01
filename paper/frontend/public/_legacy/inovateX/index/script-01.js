// Extracted from ui/inovateX/index.html (inline <script> #1).
        tailwind.config = {
            darkMode: 'class',
            theme: {
                container: { center: true, padding: '1rem' },
                extend: {
                    fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
                    colors: {
                        brand: { 900: '#1E1E2F', 700: '#4C2A59', 500: '#9E4B8A' },
                        brandlt: { 50: '#FAF5FB', 100: '#F3E7F2', 200: '#E7D0E4', 300: '#D9B4D3', 400: '#C88DBA', 500: '#9E4B8A', 700: '#4C2A59', 900: '#1E1E2F' },
                        ink: '#1E1E2F', plum: '#4C2A59', orchid: '#9E4B8A',
                    },
                    boxShadow: {
                        glow: '0 8px 30px rgba(158,75,138,0.35)',
                        soft: '0 10px 30px rgba(0,0,0,0.25)',
                    },
                    backgroundImage: {
                        'hero-dark': 'radial-gradient(1000px 600px at 50% -10%, rgba(158,75,138,0.28), transparent 60%), linear-gradient(180deg, #1E1E2F 0%, #201934 35%, #141321 100%)',
                        'hero-light': 'radial-gradient(1000px 600px at 50% -10%, rgba(158,75,138,0.18), transparent 60%), linear-gradient(180deg, #FFFFFF 0%, #FBF8FC 45%, #F7F2F9 100%)'
                    }
                }
            }
        }
