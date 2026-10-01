// Extracted from ui/matketplace/notes/note_detail.html (inline <script> #1).
        // Guard tailwind assignment in case Tailwind runtime isn't exposed (precompiled CSS only scenario)
        try {
            if (window.tailwind) {
                tailwind.config = {
                    darkMode: 'class',
                    theme: {
                        container: { center: true, padding: '1rem' },
                        extend: {
                            fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
                            colors: {
                                brand: { 900: '#1E1E2F', 700: '#4C2A59', 500: '#9E4B8A' },
                                brandlt: { 50: '#FAF5FB', 100: '#F3E7F2', 200: '#E7D0E4', 300: '#D9B4D3', 400: '#C88DBA', 500: '#9E4B8A', 700: '#4C2A59', 900: '#1E1E2F' }
                            },
                            backgroundImage: {
                                'hero-dark': 'radial-gradient(1000px 600px at 50% -10%, rgba(158,75,138,0.28), transparent 60%), linear-gradient(180deg, #1E1E2F 0%, #201934 35%, #141321 100%)',
                                'hero-light': 'radial-gradient(1000px 600px at 50% -10%, rgba(158,75,138,0.18), transparent 60%), linear-gradient(180deg, #FFFFFF 0%, #FBF8FC 45%, #F7F2F9 100%)'
                            },
                            boxShadow: { card: '0 6px 24px rgba(0,0,0,.12)', glow: '0 8px 30px rgba(158,75,138,0.35)' },
                            keyframes: {
                                shimmer: { '0%': { backgroundPosition: '-1000px 0' }, '100%': { backgroundPosition: '1000px 0' } }
                            },
                            animation: { shimmer: 'shimmer 1.6s infinite linear' }
                        }
                    }
                };
            }
        } catch (e) { console.warn('Tailwind config skip (not available):', e?.message); }
