// Extracted from ui/tunex/java_notebook.html (inline <script> #2).
        const API_BASE = 'http://0.0.0.0:10000';

        const DEFAULT_JAVA = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Tunex Java Notebook!");

        for (int i = 0; i < 5; i++) {
            System.out.println("Count: " + i);
        }
    }
}
`;

        class NotebookApp {
            constructor() {
                this.cells = [];
                this.executionCounter = 1;
                this.activeCellIndex = 0;
                this.cellsContainer = document.getElementById('cells-container');

                this.init();
            }

            init() {
                this.createCell();

                document.getElementById('addCellBtn').addEventListener('click', () => this.createCell());
                document.getElementById('runAllBtn').addEventListener('click', () => this.runAllCells());
                document.getElementById('clearBtn').addEventListener('click', () => this.clearAllOutputs());
                document.getElementById('themeBtn').addEventListener('click', () => Theme.toggle());
            }

            updateTheme(isDark) {
                this.cells.forEach(cell => {
                    cell.editor.setOption('theme', isDark ? 'material-darker' : 'eclipse');
                });
            }

            createCell(insertAfterIndex = -1) {
                const cellId = Date.now() + Math.random();
                const cell = {
                    id: cellId,
                    editor: null,
                    output: '',
                    error: '',
                    isRunning: false,
                    executionCount: null
                };

                const cellEl = document.createElement('div');
                cellEl.id = `cell-${cellId}`;
                cellEl.className = 'notebook-cell rounded-xl overflow-hidden';
                cellEl.innerHTML = `
                    <div class="flex items-center justify-between px-4 py-2" style="background: var(--bg-tertiary); border-bottom: 1px solid var(--border-color)">
                        <div class="flex items-center gap-3">
                            <span class="exec-counter">[*]</span>
                            <span class="pill px-2 py-0.5 rounded-full text-[10px] font-medium uppercase">Java</span>
                        </div>
                        <div class="flex items-center gap-1">
                            <button class="run-btn w-7 h-7 rounded-lg flex items-center justify-center" data-action="run">
                                <i class="ri-play-fill text-sm"></i>
                            </button>
                            <button class="btn-icon w-7 h-7 rounded-lg flex items-center justify-center" data-action="add">
                                <i class="ri-add-line text-sm"></i>
                            </button>
                            <button class="btn-icon w-7 h-7 rounded-lg flex items-center justify-center hover:!text-red-500" data-action="delete">
                                <i class="ri-delete-bin-6-line text-sm"></i>
                            </button>
                        </div>
                    </div>
                    <div class="cm-container"></div>
                    <div class="output-area hidden">
                        <div class="px-4 py-3 font-mono text-sm">
                            <pre class="output-text whitespace-pre-wrap" style="color: var(--text-primary)"></pre>
                            <pre class="error-text whitespace-pre-wrap text-red-500"></pre>
                        </div>
                    </div>
                `;

                if (insertAfterIndex >= 0 && insertAfterIndex < this.cells.length) {
                    const afterEl = document.getElementById(`cell-${this.cells[insertAfterIndex].id}`);
                    afterEl.after(cellEl);
                    this.cells.splice(insertAfterIndex + 1, 0, cell);
                    this.activeCellIndex = insertAfterIndex + 1;
                } else {
                    this.cellsContainer.appendChild(cellEl);
                    this.cells.push(cell);
                    this.activeCellIndex = this.cells.length - 1;
                }

                const cmContainer = cellEl.querySelector('.cm-container');
                const isDark = Theme.isDark();

                cell.editor = CodeMirror(cmContainer, {
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
                        'Ctrl-Enter': () => this.runCell(this.cells.indexOf(cell)),
                        'Shift-Enter': () => {
                            this.runCell(this.cells.indexOf(cell));
                            this.createCell(this.cells.indexOf(cell));
                        },
                        'Tab': (cm) => {
                            if (cm.somethingSelected()) {
                                cm.indentSelection('add');
                            } else {
                                cm.replaceSelection('    ', 'end');
                            }
                        },
                        'Shift-Tab': (cm) => cm.indentSelection('subtract'),
                        'Ctrl-/': (cm) => cm.toggleComment(),
                        'Ctrl-Space': 'autocomplete',
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
                        }
                    }
                });

                // Put a starter program in brand-new cells
                cell.editor.setValue(DEFAULT_JAVA);

                cellEl.addEventListener('click', () => {
                    this.activeCellIndex = this.cells.indexOf(cell);
                    this.updateActiveCellStyles();
                });

                cellEl.querySelector('[data-action="run"]').addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.runCell(this.cells.indexOf(cell));
                });
                cellEl.querySelector('[data-action="add"]').addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.createCell(this.cells.indexOf(cell));
                });
                cellEl.querySelector('[data-action="delete"]').addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteCell(this.cells.indexOf(cell));
                });

                this.updateActiveCellStyles();
                setTimeout(() => cell.editor.focus(), 50);

                return cell;
            }

            deleteCell(index) {
                if (this.cells.length <= 1) return;

                const cell = this.cells[index];
                const cellEl = document.getElementById(`cell-${cell.id}`);

                cellEl.remove();
                this.cells.splice(index, 1);

                if (this.activeCellIndex >= this.cells.length) {
                    this.activeCellIndex = this.cells.length - 1;
                }
                this.updateActiveCellStyles();
            }

            updateActiveCellStyles() {
                this.cells.forEach((cell, idx) => {
                    const el = document.getElementById(`cell-${cell.id}`);
                    if (el) {
                        el.classList.toggle('active', idx === this.activeCellIndex);
                    }
                });
            }

            updateCellUI(cell) {
                const cellEl = document.getElementById(`cell-${cell.id}`);
                if (!cellEl) return;

                const execCounter = cellEl.querySelector('.exec-counter');
                const runBtn = cellEl.querySelector('[data-action="run"]');
                const outputArea = cellEl.querySelector('.output-area');
                const outputText = cellEl.querySelector('.output-text');
                const errorText = cellEl.querySelector('.error-text');

                execCounter.textContent = `[${cell.executionCount || '*'}]`;

                if (cell.isRunning) {
                    runBtn.innerHTML = '<i class="ri-loader-4-line animate-spin text-sm"></i>';
                    cellEl.classList.add('running');
                } else {
                    runBtn.innerHTML = '<i class="ri-play-fill text-sm"></i>';
                    cellEl.classList.remove('running');
                }

                if (cell.output || cell.error) {
                    outputArea.classList.remove('hidden');
                    outputText.textContent = cell.output;
                    errorText.textContent = cell.error;
                } else {
                    outputArea.classList.add('hidden');
                }
            }

            async runCell(index) {
                const cell = this.cells[index];
                const code = cell.editor.getValue();

                cell.isRunning = true;
                cell.output = '';
                cell.error = '';
                this.updateCellUI(cell);

                try {
                    const res = await fetch(`${API_BASE}/api/tunex/compiler/java/run`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code })
                    });
                    const data = await res.json();
                    cell.output = data.output || '';
                    cell.error = data.error || '';
                    cell.executionCount = this.executionCounter++;
                } catch (e) {
                    cell.error = 'Connection failed. Is the server running?';
                } finally {
                    cell.isRunning = false;
                    this.updateCellUI(cell);
                }
            }

            async runAllCells() {
                for (let i = 0; i < this.cells.length; i++) {
                    await this.runCell(i);
                }
            }

            clearAllOutputs() {
                this.cells.forEach(cell => {
                    cell.output = '';
                    cell.error = '';
                    cell.executionCount = null;
                    this.updateCellUI(cell);
                });
                this.executionCounter = 1;
            }
        }

        window.notebookInstance = new NotebookApp();
