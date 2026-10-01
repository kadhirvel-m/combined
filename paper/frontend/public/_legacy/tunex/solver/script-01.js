// Extracted from ui/tunex/solver.html (inline <script> #1).
        document.addEventListener('alpine:init', () => {
            Alpine.data('solverApp', () => ({
                problemId: null,
                problem: {},
                loading: true,
                running: false,
                editor: null,
                results: null,
                selectedTest: 0,

                init() {
                    const params = new URLSearchParams(window.location.search);
                    this.problemId = params.get('id');

                    if (!this.problemId) {
                        alert("No problem ID specified!");
                        return;
                    }

                    this.loadProblem();
                },

                async loadProblem() {
                    try {
                        const res = await fetch(`${window.API_BASE}/api/tunex/problems/${this.problemId}`);
                        if (!res.ok) throw new Error("Failed to load");
                        this.problem = await res.json();

                        this.initEditor(this.problem.boilerplate_code);
                        this.loading = false;
                    } catch (e) {
                        console.error(e);
                        alert("Error loading problem. Make sure the database is migrated.");
                    }
                },

                initEditor(code) {
                    this.$nextTick(() => {
                        const el = document.getElementById('code-editor');
                        if (!el) return;
                        el.innerHTML = '';
                        this.editor = CodeMirror(el, {
                            value: code,
                            mode: 'python',
                            theme: 'material-darker',
                            lineNumbers: true,
                            autoCloseBrackets: true,
                            matchBrackets: true,
                            indentUnit: 4,
                            tabSize: 4,
                            extraKeys: {
                                "Backspace": function (cm) {
                                    if (cm.somethingSelected()) return CodeMirror.Pass;
                                    var cursor = cm.getCursor();
                                    var line = cm.getLine(cursor.line);
                                    var before = line.slice(0, cursor.ch);
                                    if (/^\s+$/.test(before) && before.length % 4 === 0 && before.length > 0) {
                                        cm.replaceRange("", {
                                            line: cursor.line,
                                            ch: cursor.ch - 4
                                        }, cursor);
                                    } else {
                                        return CodeMirror.Pass;
                                    }
                                }
                            }
                        });
                    });
                },

                async runCode() {
                    if (this.running) return;
                    this.running = true;
                    this.results = null;
                    this.selectedTest = 0;

                    const code = this.editor.getValue();

                    try {
                        const res = await fetch(`${window.API_BASE}/api/tunex/problems/${this.problemId}/run`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ code })
                        });
                        this.results = await res.json();
                    } catch (e) {
                        this.results = { status: 'runtime_error', compile_error: "Network Error" };
                    } finally {
                        this.running = false;
                    }
                },

                renderMarkdown(text) {
                    return marked.parse(text || '');
                },

                formatConstraint(text) {
                    // Format constraint text with code styling for special characters
                    return text
                        .replace(/(\d+)\^(\d+)/g, '$1<sup>$2</sup>')  // Handle exponents like 10^6
                        .replace(/\<=/g, '≤')
                        .replace(/\>=/g, '≥');
                },

                goBack() {
                    window.history.back();
                }
            }));
        });
