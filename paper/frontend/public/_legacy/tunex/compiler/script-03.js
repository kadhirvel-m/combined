// Extracted from ui/tunex/compiler.html (inline <script> #3).
        const API_BASE = 'http://0.0.0.0:10000'; // Adjust as needed

        function compilerApp() {
            return {
                code: "print('Hello from Tunex!')\n\nfor i in range(5):\n    print(f'Count: {i}')",
                output: '',
                error: '',
                isRunning: false,
                executionTime: null,

                async runCode() {
                    this.isRunning = true;
                    this.output = '';
                    this.error = '';
                    this.executionTime = null;

                    const startTime = performance.now();

                    try {
                        const res = await fetch(`${API_BASE}/api/tunex/compiler/run`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ code: this.code })
                        });

                        const data = await res.json();

                        this.output = data.output || '';
                        this.error = data.error || '';

                        if (data.status === 'error' && !this.error) {
                            this.error = "Unknown error occurred.";
                        }

                    } catch (e) {
                        console.error(e);
                        this.error = "Failed to connect to the server. Is the backend running?";
                    } finally {
                        this.isRunning = false;
                        this.executionTime = ((performance.now() - startTime) / 1000).toFixed(3);
                    }
                },

                insertTab(e) {
                    const start = e.target.selectionStart;
                    const end = e.target.selectionEnd;

                    // set textarea value to: text before caret + tab + text after caret
                    this.code = this.code.substring(0, start) +
                        "    " + this.code.substring(end);

                    // put caret at right position again
                    this.$nextTick(() => {
                        e.target.selectionStart = e.target.selectionEnd = start + 4;
                    });
                },

                handleBackspace(e) {
                    const el = e.target;
                    const start = el.selectionStart;
                    const end = el.selectionEnd;

                    if (start !== end) return; // Selection exists, let default handle it

                    const text = el.value;
                    const before = text.substring(0, start);
                    const lineStart = before.lastIndexOf('\n') + 1;
                    const linePrefix = before.substring(lineStart);

                    // Check if we are at an indentation boundary (multiple of 4 spaces)
                    // and the line prefix consists only of whitespace
                    if (/^\s+$/.test(linePrefix) && linePrefix.length % 4 === 0 && linePrefix.length > 0) {
                        e.preventDefault();
                        // Remove 4 spaces
                        this.code = text.substring(0, start - 4) + text.substring(end);

                        // Restore cursor position
                        this.$nextTick(() => {
                            el.selectionStart = el.selectionEnd = start - 4;
                        });
                    }
                }
            }
        }
