// static/app.js
const uploadForm = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const chooseFileBtn = document.getElementById('chooseFileBtn');
const fileNameLabel = document.getElementById('fileNameLabel');
const fileState = document.getElementById('fileState');
const nUpEl = document.getElementById('nUp');
const pageSizeEl = document.getElementById('pageSize');
const orientationEl = document.getElementById('orientation');
const marginEl = document.getElementById('margin');
const gapEl = document.getElementById('gap');
const refreshBtn = document.getElementById('refreshBtn');
const exportBtn = document.getElementById('exportBtn');
const exportState = document.getElementById('exportState');
const printerSelect = document.getElementById('printerSelect');
const refreshPrintersBtn = document.getElementById('refreshPrinters');
const copiesEl = document.getElementById('copies');
const duplexModeEl = document.getElementById('duplexMode');
const colorModeEl = document.getElementById('colorMode');
const printBtn = document.getElementById('printBtn');
const printState = document.getElementById('printState');
// QZ Tray client-print elements
const qzConnectBtn = document.getElementById('qzConnect');
const qzStatus = document.getElementById('qzStatus');
const clientPrinterSelect = document.getElementById('clientPrinterSelect');
const clientRefreshPrintersBtn = document.getElementById('clientRefreshPrinters');
const clientPrintBtn = document.getElementById('clientPrintBtn');
const clientPrintState = document.getElementById('clientPrintState');
const previewGrid = document.getElementById('previewGrid');
const zoomOut = document.getElementById('zoomOut');
const zoomIn = document.getElementById('zoomIn');
const zoomVal = document.getElementById('zoomVal');

let FILE_ID = null;
let ZOOM = 1.0;
let PRINTERS = [];
let QZ_CONNECTED = false;

function setZoom(val) {
  ZOOM = Math.min(3, Math.max(0.3, val));
  if (previewGrid) {
    previewGrid.style.transform = `scale(${ZOOM})`;
  }
  zoomVal.textContent = `${Math.round(ZOOM * 100)}%`;
}

zoomOut.addEventListener('click', () => setZoom(ZOOM - 0.1));
zoomIn.addEventListener('click', () => setZoom(ZOOM + 0.1));

async function postJSON(url, payload) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function currentSettings() {
  return {
    file_id: FILE_ID,
    n_up: parseInt(nUpEl.value, 10),
    page_size: pageSizeEl.value,
    orientation: orientationEl.value,
    margin: parseFloat(marginEl.value),
    gap: parseFloat(gapEl.value)
  };
}

// --- QZ Tray (client printers) ---
function qzAvailable() {
  return typeof window.qz !== 'undefined' && window.qz?.websocket;
}

async function ensureQZConnected() {
  if (!qzAvailable()) {
    qzStatus && (qzStatus.textContent = 'QZ Tray not detected. Install QZ Tray.');
    return false;
  }
  if (QZ_CONNECTED && qz.websocket.isActive()) return true;
  // In development, users may enable "Allow unsigned requests" from QZ Tray settings.
  try {
    await qz.websocket.connect();
    QZ_CONNECTED = true;
    qzStatus && (qzStatus.textContent = 'Connected');
    return true;
  } catch (e) {
    qzStatus && (qzStatus.textContent = 'Connection failed. Open QZ Tray.');
    return false;
  }
}

async function loadClientPrinters() {
  if (!clientPrinterSelect) return;
  clientPrintState && (clientPrintState.textContent = '');
  clientPrinterSelect.innerHTML = '';
  const loadingOpt = document.createElement('option');
  loadingOpt.textContent = 'Loading client printers…';
  loadingOpt.disabled = true; loadingOpt.selected = true;
  clientPrinterSelect.appendChild(loadingOpt);
  const ok = await ensureQZConnected();
  if (!ok) {
    clientPrinterSelect.innerHTML = '';
    const opt = document.createElement('option');
    opt.textContent = 'QZ Tray not connected';
    opt.disabled = true; opt.selected = true;
    clientPrinterSelect.appendChild(opt);
    clientPrintBtn && (clientPrintBtn.disabled = true);
    return;
  }
  try {
    const list = await qz.printers.find(); // findAll() in older docs; find() returns array of names
    clientPrinterSelect.innerHTML = '';
    if (!list || !list.length) {
      const opt = document.createElement('option');
      opt.textContent = 'No client printers';
      opt.disabled = true; opt.selected = true;
      clientPrinterSelect.appendChild(opt);
      clientPrintBtn && (clientPrintBtn.disabled = true);
      return;
    }
    list.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      clientPrinterSelect.appendChild(opt);
    });
    clientPrintBtn && (clientPrintBtn.disabled = !FILE_ID);
  } catch (e) {
    clientPrinterSelect.innerHTML = '';
    const opt = document.createElement('option');
    opt.textContent = 'Failed to list printers';
    opt.disabled = true; opt.selected = true;
    clientPrinterSelect.appendChild(opt);
    clientPrintBtn && (clientPrintBtn.disabled = true);
    clientPrintState && (clientPrintState.textContent = 'Error: ' + e.message);
  }
}

async function clientPrint() {
  if (!FILE_ID) { alert('Upload a PDF first'); return; }
  const ok = await ensureQZConnected();
  if (!ok) return;
  if (!clientPrinterSelect || !clientPrinterSelect.value) {
    alert('Select a client printer');
    return;
  }
  clientPrintBtn.disabled = true;
  clientPrintState.textContent = 'Composing and sending…';
  try {
    // Compose n-up PDF on server, then print that PDF locally via QZ
    const j = await postJSON('/export', currentSettings());
    const pdfUrl = (new URL(j.url, window.location.origin)).href;
    const cfg = qz.configs.create(clientPrinterSelect.value, {
      copies: parseInt(copiesEl.value || '1', 10)
    });
    await qz.printFile(cfg, [{ type: 'pdf', data: pdfUrl }]);
    clientPrintState.textContent = 'Sent to client printer';
  } catch (e) {
    clientPrintState.textContent = 'Client print error: ' + e.message;
  } finally {
    clientPrintBtn.disabled = false;
  }
}

async function loadPrinters() {
  if (!printerSelect) return;
  printState && (printState.textContent = '');
  // Show loading placeholder
  printerSelect.innerHTML = '';
  const loadingOpt = document.createElement('option');
  loadingOpt.textContent = 'Loading printers…';
  loadingOpt.disabled = true; loadingOpt.selected = true;
  printerSelect.appendChild(loadingOpt);
  try {
    const res = await fetch('/printers');
    const j = await res.json().catch(() => ({}));
    if (!res.ok || j.ok === false) {
      const reason = (j && j.reason) ? j.reason : '';
      printerSelect.innerHTML = '';
      const opt = document.createElement('option');
      opt.textContent = 'Printing unavailable';
      opt.disabled = true; opt.selected = true;
      printerSelect.appendChild(opt);
      printBtn && (printBtn.disabled = true);
      printState && (printState.textContent = reason || 'Printing is not available');
      return;
    }
    PRINTERS = j.printers || [];
    printerSelect.innerHTML = '';
    if (!PRINTERS.length) {
      const opt = document.createElement('option');
      opt.textContent = 'No printers found';
      opt.disabled = true; opt.selected = true;
      printerSelect.appendChild(opt);
      printBtn && (printBtn.disabled = true);
      return;
    }
    PRINTERS.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.name;
      opt.textContent = p.is_default ? `${p.name} (default)` : p.name;
      if (p.is_default) opt.selected = true;
      printerSelect.appendChild(opt);
    });
    // Enable print if we also have a file uploaded
    if (FILE_ID) { printBtn && (printBtn.disabled = false); }
  } catch (e) {
    console.warn('Printer list error:', e);
    printerSelect.innerHTML = '';
    const opt = document.createElement('option');
    opt.textContent = 'Failed to load printers';
    opt.disabled = true; opt.selected = true;
    printerSelect.appendChild(opt);
    printBtn && (printBtn.disabled = true);
    printState && (printState.textContent = 'Failed to load printers');
  }
}

async function refreshPreview() {
  if (!FILE_ID) return;
  refreshBtn.disabled = true;
  try {
    const j = await postJSON('/preview', currentSettings());
    // Render all returned preview URLs
    if (!previewGrid) return;
    previewGrid.innerHTML = '';
    const urls = j.urls || (j.url ? [j.url] : []);
    urls.forEach((u) => {
      const img = document.createElement('img');
      img.alt = 'Preview sheet';
      img.src = u + `#${Date.now()}`; // bust cache
      img.loading = 'lazy';
      previewGrid.appendChild(img);
    });
  } catch (e) {
    alert('Preview error: ' + e.message);
  } finally {
    refreshBtn.disabled = false;
  }
}

uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(uploadForm);
  fileState.textContent = 'Uploading…';
  try {
    const res = await fetch('/upload', { method: 'POST', body: fd });
    if (!res.ok) throw new Error(await res.text());
    const j = await res.json();
    FILE_ID = j.file_id;
    fileState.textContent = `Uploaded: ${FILE_ID}`;
    refreshBtn.disabled = false;
    exportBtn.disabled = false;
    await loadPrinters();
    printBtn && (printBtn.disabled = !printerSelect || !printerSelect.value);
    setZoom(1.0);
    await refreshPreview();
  } catch (e) {
    fileState.textContent = 'Upload failed: ' + e.message;
  }
});

// Custom file picker logic: prevent long names from expanding layout
if (chooseFileBtn && fileInput && fileNameLabel) {
  chooseFileBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    const f = fileInput.files && fileInput.files[0];
    const name = f ? f.name : 'No file selected';
    fileNameLabel.textContent = name;
    fileNameLabel.title = name;
  });
}

[nUpEl, pageSizeEl, orientationEl, marginEl, gapEl].forEach(el => {
  el.addEventListener('change', refreshPreview);
});

refreshBtn.addEventListener('click', (e) => {
  e.preventDefault();
  refreshPreview();
});

exportBtn.addEventListener('click', async () => {
  if (!FILE_ID) return;
  exportBtn.disabled = true;
  exportState.textContent = 'Composing…';
  try {
    const j = await postJSON('/export', currentSettings());
    exportState.innerHTML = `Ready: <a href="${j.url}">Download N-up PDF</a>`;
  } catch (e) {
    exportState.textContent = 'Export error: ' + e.message;
  } finally {
    exportBtn.disabled = false;
  }
});

async function doPrint() {
  if (!FILE_ID) return;
  if (!printerSelect || !printerSelect.value) {
    alert('Select a printer first');
    return;
  }
  printBtn.disabled = true;
  printState.textContent = 'Sending to printer…';
  try {
    const payload = {
      ...currentSettings(),
      printer_name: printerSelect.value,
      copies: parseInt(copiesEl.value || '1', 10),
      duplex_mode: duplexModeEl.value,
      color_mode: colorModeEl.value
    };
    const j = await postJSON('/print', payload);
    if (j.ok) {
      const extra = j.url ? ` — <a href="${j.url}">Open job PDF</a>` : '';
      printState.innerHTML = `Printed: ${j.status}${extra}`;
    } else {
      printState.textContent = `Print failed: ${j.status || 'unknown error'}`;
    }
  } catch (e) {
    printState.textContent = 'Print error: ' + e.message;
  } finally {
    printBtn.disabled = false;
  }
}

refreshPrintersBtn && refreshPrintersBtn.addEventListener('click', async () => {
  await loadPrinters();
});

printBtn && printBtn.addEventListener('click', async () => {
  await doPrint();
});

// Load printers immediately (handles late script load too)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => loadPrinters());
} else {
  loadPrinters();
}

// Auto-set orientation based on n_up selection to reflect backend rules
nUpEl.addEventListener('change', () => {
  const n = parseInt(nUpEl.value, 10);
  if (n === 2) orientationEl.value = 'landscape';
  if (n === 4 || n === 9) orientationEl.value = 'portrait';
});

// QZ Tray handlers
qzConnectBtn && qzConnectBtn.addEventListener('click', async () => {
  await ensureQZConnected();
  await loadClientPrinters();
});

clientRefreshPrintersBtn && clientRefreshPrintersBtn.addEventListener('click', async () => {
  await loadClientPrinters();
});

clientPrintBtn && clientPrintBtn.addEventListener('click', async () => {
  await clientPrint();
});
