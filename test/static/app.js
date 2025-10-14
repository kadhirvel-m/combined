// static/app.js
const uploadForm = document.getElementById('uploadForm');
const fileState = document.getElementById('fileState');
const nUpEl = document.getElementById('nUp');
const pageSizeEl = document.getElementById('pageSize');
const orientationEl = document.getElementById('orientation');
const marginEl = document.getElementById('margin');
const gapEl = document.getElementById('gap');
const sheetIndexEl = document.getElementById('sheetIndex');
const refreshBtn = document.getElementById('refreshBtn');
const exportBtn = document.getElementById('exportBtn');
const exportState = document.getElementById('exportState');
const previewImg = document.getElementById('previewImg');
const zoomOut = document.getElementById('zoomOut');
const zoomIn = document.getElementById('zoomIn');
const zoomVal = document.getElementById('zoomVal');

let FILE_ID = null;
let ZOOM = 1.0;

function setZoom(val) {
  ZOOM = Math.min(3, Math.max(0.3, val));
  previewImg.style.transform = `scale(${ZOOM})`;
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
    gap: parseFloat(gapEl.value),
    sheet_index: parseInt(sheetIndexEl.value, 10)
  };
}

async function refreshPreview() {
  if (!FILE_ID) return;
  refreshBtn.disabled = true;
  try {
    const j = await postJSON('/preview', currentSettings());
    previewImg.src = j.url + `#${Date.now()}`; // bust cache
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

[nUpEl, pageSizeEl, orientationEl, marginEl, gapEl, sheetIndexEl].forEach(el => {
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
    exportState.innerHTML = `Ready: <a href="${j.url}">Download N‑up PDF</a>`;
  } catch (e) {
    exportState.textContent = 'Export error: ' + e.message;
  } finally {
    exportBtn.disabled = false;
  }
});