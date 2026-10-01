// Extracted from ui/youtube_videos.html (inline <script> #2).
        tailwind.config = {
            darkMode: ["class", '[data-theme="dark"]'],
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
                    },
                    colors: {
                        brand: {
                            50: '#f0f7ff', 100: '#e0efff', 200: '#b9dbff', 300: '#8ac4ff', 400: '#59a9ff', 500: '#2b8cff', 600: '#116fe6', 700: '#0a57b4', 800: '#0b4890', 900: '#0d3a73'
                        },
                        night: {
                            900: '#0a0c10', 800: '#0f131a', 700: '#141a22', 600: '#1a2230'
                        },
                        surface: {
                            DEFAULT: 'var(--surface)',
                            dim: 'var(--surface-dim)',
                            contrast: 'var(--surface-contrast)'
                        }
                    },
                    boxShadow: {
                        glow: '0 0 0 1px rgba(59,130,246,.2), 0 8px 40px rgba(59,130,246,.15)',
                        neon: '0 0 25px rgba(43,140,255,.35), 0 0 60px rgba(43,140,255,.25)',
                        'e1': '0 1px 2px rgba(0,0,0,0.06)',
                        'e2': '0 2px 6px rgba(0,0,0,0.08)',
                        'e3': '0 6px 12px rgba(0,0,0,0.10)',
                        'e4': '0 10px 16px rgba(0,0,0,0.12)',
                    },
                    keyframes: {
                        in: {
                            '0%': { opacity: 0, transform: 'translateY(6px)' },
                            '100%': { opacity: 1, transform: 'translateY(0)' }
                        },
                        shimmer: {
                            '0%': { backgroundPosition: '-468px 0' },
                            '100%': { backgroundPosition: '468px 0' }
                        }
                    },
                    animation: {
                        in: 'in .25s ease-out',
                        shimmer: 'shimmer 1.25s linear infinite'
                    }
                }
            }
        }
