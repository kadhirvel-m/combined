// Extracted from ui/inovateX/my_project.html (inline <script> #4).
        function toggleChatModal() {
            const m = document.getElementById('chatModal');
            if (m.classList.contains('open')) {
                m.classList.remove('open');
            } else {
                m.classList.add('open');
                loadChatHistory();
            }
        }
