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
const previewGrid = document.getElementById('previewGrid');
const zoomOut = document.getElementById('zoomOut');
const zoomIn = document.getElementById('zoomIn');
const zoomVal = document.getElementById('zoomVal');

let FILE_ID = null;
let ZOOM = 1.0;

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

// Auto-set orientation based on n_up selection to reflect backend rules
nUpEl.addEventListener('change', () => {
  const n = parseInt(nUpEl.value, 10);
  if (n === 2) orientationEl.value = 'landscape';
  if (n === 4 || n === 9) orientationEl.value = 'portrait';
});
