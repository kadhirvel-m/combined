// Extracted from ui/garlic_academics.html (inline <script> #1).
        window.tailwind = window.tailwind || {};
        window.tailwind.config = {
            darkMode: 'class',
            theme: {
                container: { center: true, padding: '1rem' },
                extend: {
                    fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
                    colors: {
                        brand: { 900: '#1E1E2F', 700: '#4C2A59', 500: '#9E4B8A' },
                        brandlt: { 50: '#FAF5FB', 100: '#F3E7F2', 200: '#E7D0E4', 300: '#D9B4D3', 400: '#C88DBA', 500: '#9E4B8A', 700: '#4C2A59', 900: '#1E1E2F' }
                    },
                    boxShadow: {
                        glow: '0 8px 30px rgba(158,75,138,0.28)',
                        soft: '0 6px 22px rgba(30,30,47,0.14)',
                        card: '0 24px 64px -20px rgba(30,30,47,0.45)',
                        ringed: '0 0 0 1px rgba(158,75,138,0.35), 0 6px 22px rgba(158,75,138,0.35)'
                    },
                    backgroundImage: {
                        'hero-dark': 'radial-gradient(900px 520px at 50% -15%, rgba(158,75,138,0.35), transparent 65%), linear-gradient(180deg,#1E1E2F 0%,#201934 55%,#141321 100%)',
                        'hero-light': 'radial-gradient(1000px 560px at 50% -18%, rgba(158,75,138,0.18), transparent 62%), linear-gradient(180deg,#FFFFFF 0%,#FBF8FC 55%,#F7F2F9 100%)',
                        'mesh-dark': 'radial-gradient(40% 50% at 20% 0%, rgba(158,75,138,0.18), transparent 60%), radial-gradient(40% 60% at 100% 0%, rgba(76,42,89,0.35), transparent 60%)'
                    },
                    keyframes: {
                        fadeUp: { '0%': { opacity: 0, transform: 'translateY(10px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
                        pulseDot: { '0%,100%': { transform: 'scale(1)', opacity: .75 }, '50%': { transform: 'scale(1.16)', opacity: 1 } },
                        scan: { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(220%)' } },
                    },
                    animation: {
                        fadeUp: 'fadeUp .55s cubic-bezier(.4,.1,.2,1)',
                        pulseDot: 'pulseDot 1.9s ease-in-out infinite',
                        scan: 'scan 3.8s linear infinite'
                    }
                }
            }
        };
