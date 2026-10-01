// Extracted from ui/tunex/dashboard.html (inline <script> #1).
        window.tailwind = window.tailwind || {};
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        gatex: {
                            bg: '#13131F',       // Darker, deeper background
                            card: '#1E1E2F',     // Standard card
                            cardHover: '#27293d',
                            primary: '#9E4B8A',  // Brand Pink/Purple
                            secondary: '#4C2A59', // Deep Purple
                            accent: '#FF7F50',   // Fire Orange
                            success: '#00F090',  // Neon Green
                            info: '#3B82F6'
                        }
                    },
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                    },
                    boxShadow: {
                        'glow': '0 0 20px rgba(158, 75, 138, 0.3)',
                        'fire-glow': '0 0 15px rgba(255, 127, 80, 0.4)',
                    }
                }
            }
        }
