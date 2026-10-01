// Extracted from ui/inovateX/my_project.html (inline <script> #2).
(() => { const s = localStorage.getItem('px_theme'); const d = window.matchMedia('(prefers-color-scheme:dark)').matches; if (s ? s === 'dark' : d) document.documentElement.classList.add('dark') })()
