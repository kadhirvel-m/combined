// Extracted from ui/tunex/java_compiler.html (inline <script> #3).
        const API_BASE = 'http://0.0.0.0:10000'; // Adjust as needed

        function compilerApp() {
            return {
                code: "public class Main {\n" +
                    "    public static void main(String[] args) {\n" +
                    "        System.out.println(\"Hello from Tunex Java!\");\n" +
                    "        for (int i = 0; i < 5; i++) {\n" +
                    "            System.out.println(\"Count: \" + i);\n" +
                    "        }\n" +
                    "    }\n" +
                    "}\n",
                output: '',
                error: '',
                isRunning: false,
                executionTime: null,
                editor: null,

                init() {
                    // Create CodeMirror editor with Java mode (auto indentation on Enter)
                    const container = document.getElementById('java-editor');
                    if (!container || typeof CodeMirror === 'undefined') {
                        console.warn('CodeMirror is not available; falling back to internal code state.');
                        return;
                    }

                    const isDark = document.documentElement.classList.contains('dark');
                    this.editor = CodeMirror(container, {
                        value: this.code || '',
                        mode: 'text/x-java',
                        theme: isDark ? 'material-darker' : 'eclipse',
                        lineNumbers: true,
                        indentUnit: 4,
                        tabSize: 4,
                        indentWithTabs: false,
                        smartIndent: true,
                        lineWrapping: true,
                        autoCloseBrackets: true,
                        matchBrackets: true,
                        viewportMargin: Infinity,
                        extraKeys: {
                            'Tab': (cm) => {
                                if (cm.somethingSelected()) {
                                    cm.indentSelection('add');
                                } else {
                                    cm.replaceSelection('    ', 'end');
                                }
                            },
                            'Shift-Tab': (cm) => cm.indentSelection('subtract'),
                            'Backspace': function (cm) {
                                if (cm.somethingSelected()) return CodeMirror.Pass;
                                var cursor = cm.getCursor();
                                var line = cm.getLine(cursor.line);
                                var before = line.slice(0, cursor.ch);
                                if (/^\s+$/.test(before) && before.length % 4 === 0 && before.length > 0) {
                                    cm.replaceRange('', { line: cursor.line, ch: cursor.ch - 4 }, cursor);
                                } else {
                                    return CodeMirror.Pass;
                                }
                            },
                            'Ctrl-Enter': () => this.runCode(),
                        }
                    });

                    this.editor.on('change', () => {
                        this.code = this.editor.getValue();
                    });

                    window.addEventListener('tunex-theme-changed', () => {
                        if (!this.editor) return;
                        const dark = document.documentElement.classList.contains('dark');
                        this.editor.setOption('theme', dark ? 'material-darker' : 'eclipse');
                    });
                },

                async runCode() {
                    this.isRunning = true;
                    this.output = '';
                    this.error = '';
                    this.executionTime = null;

                    if (this.editor) {
                        this.code = this.editor.getValue();
                    }

                    const startTime = performance.now();

                    try {
                        const res = await fetch(`${API_BASE}/api/tunex/compiler/java/run`, {
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

                clearCode() {
                    this.code = '';
                    if (this.editor) {
                        this.editor.setValue('');
                        this.editor.focus();
                    }
                },
            }
        }
