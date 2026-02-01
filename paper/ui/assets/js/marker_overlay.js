(function () {
  // Marker overlay for web pages (browser-only).
  // Allows drawing on top of the current page while presenting/screen-sharing.
  // No external deps.

  if (window.__pxMarkerOverlayLoaded) return;
  window.__pxMarkerOverlayLoaded = true;

  // If the meeting page already has its own marker overlay, don't duplicate.
  if (document.getElementById('markerCanvas') || document.getElementById('markerFab')) return;

  const Z = 999999;

  const style = document.createElement('style');
  style.textContent = `
    .px-marker-fab{
      position: fixed;
      right: 18px;
      bottom: 18px;
      z-index: ${Z};
      width: 48px;
      height: 48px;
      border-radius: 14px;
      border: 1px solid rgba(255,255,255,0.18);
      background: rgba(30, 30, 47, 0.88);
      color: rgba(255,255,255,0.92);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 12px 30px rgba(0,0,0,0.25);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      user-select: none;
    }
    .px-marker-fab:hover{ filter: brightness(1.06); }

    .px-marker-toolkit{
      position: fixed;
      right: 18px;
      bottom: 76px;
      z-index: ${Z};
      display: none;
      gap: 10px;
      align-items: center;
      padding: 10px;
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.16);
      background: rgba(30, 30, 47, 0.72);
      color: rgba(255,255,255,0.92);
      box-shadow: 0 12px 30px rgba(0,0,0,0.25);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      user-select: none;
    }

    .px-marker-btn{
      width: 42px;
      height: 42px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.14);
      background: rgba(255,255,255,0.06);
      color: inherit;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .px-marker-btn:hover{ background: rgba(255,255,255,0.10); }
    .px-marker-btn.px-active{ background: rgba(158,75,138,0.35); border-color: rgba(158,75,138,0.6); }

    #pxMarkerCanvas{
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      z-index: ${Z - 1};
      display: none;
      pointer-events: none;
    }

    .px-marker-range{ width: 110px; }
    .px-marker-color{ width: 40px; height: 40px; padding: 0; border: none; background: transparent; }

    @media (max-width: 520px){
      .px-marker-toolkit{ right: 10px; bottom: 70px; }
      .px-marker-fab{ right: 10px; bottom: 12px; }
    }
  `;
  document.head.appendChild(style);

  const canvas = document.createElement('canvas');
  canvas.id = 'pxMarkerCanvas';
  document.body.appendChild(canvas);

  const CURSORS = {
    pen: (() => {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
          <g fill="none" fill-rule="evenodd">
            <path d="M6 26l3.6-1 15-15a2 2 0 0 0 0-2.8l-1.8-1.8a2 2 0 0 0-2.8 0l-15 15L4 24z" fill="#111827" opacity=".22"/>
            <path d="M6 26l3.1-.9L24 10.2a1.2 1.2 0 0 0 0-1.7l-1.5-1.5a1.2 1.2 0 0 0-1.7 0L6 21.9 5.1 25z" fill="#f43f5e"/>
            <path d="M5.3 25.7l.9-3.2 3.7 3.7z" fill="#fbbf24"/>
            <path d="M19.3 6.7l6 6" stroke="#fff" stroke-width="1.4" opacity=".85"/>
          </g>
        </svg>
      `.trim();
      return `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}") 2 28, crosshair`;
    })(),
    eraser: (() => {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
          <path d="M11 25h12" stroke="#111827" stroke-width="2" opacity=".35"/>
          <path d="M7 20l8-8 8 8-5 5H12z" fill="#60a5fa"/>
          <path d="M15 12l4-4a2 2 0 0 1 2.8 0l2.2 2.2a2 2 0 0 1 0 2.8l-3.8 3.8z" fill="#111827" opacity=".2"/>
          <path d="M12 25h6l-6-6-5 5a2 2 0 0 0 1.4 1z" fill="#f1f5f9"/>
        </svg>
      `.trim();
      return `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}") 6 26, crosshair`;
    })(),
  };

  const fab = document.createElement('button');
  fab.type = 'button';
  fab.className = 'px-marker-fab';
  fab.title = 'Marker (M)';
  fab.innerHTML = '<span class="icon">edit</span>';
  document.body.appendChild(fab);

  const toolkit = document.createElement('div');
  toolkit.className = 'px-marker-toolkit';
  toolkit.innerHTML = `
    <button type="button" class="px-marker-btn px-active" data-tool="pen" title="Pen (P)"><span class="icon">draw</span></button>
    <button type="button" class="px-marker-btn" data-tool="eraser" title="Eraser (E)"><span class="icon">ink_eraser</span></button>
    <input class="px-marker-color" id="pxMarkerColor" type="color" value="#ff0000" title="Color" />
    <input class="px-marker-range" id="pxMarkerSize" type="range" min="2" max="18" value="6" title="Size" />
    <button type="button" class="px-marker-btn" id="pxMarkerClear" title="Clear (C)"><span class="icon">delete_sweep</span></button>
    <button type="button" class="px-marker-btn" id="pxMarkerClose" title="Close (Esc)"><span class="icon">close</span></button>
  `;
  document.body.appendChild(toolkit);

  const ctx = canvas.getContext('2d');
  let enabled = false;
  let drawing = false;
  let tool = 'pen';
  let prev = null;

  const colorEl = toolkit.querySelector('#pxMarkerColor');
  const sizeEl = toolkit.querySelector('#pxMarkerSize');
  const clearBtn = toolkit.querySelector('#pxMarkerClear');
  const closeBtn = toolkit.querySelector('#pxMarkerClose');

  function ensureSize() {
    const dpr = window.devicePixelRatio || 1;
    const w = Math.floor(window.innerWidth * dpr);
    const h = Math.floor(window.innerHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }

  function setEnabled(next) {
    enabled = !!next;
    ensureSize();
    canvas.style.display = enabled ? 'block' : 'none';
    canvas.style.pointerEvents = enabled ? 'auto' : 'none';
    canvas.style.cursor = enabled ? (tool === 'eraser' ? CURSORS.eraser : CURSORS.pen) : '';
    toolkit.style.display = enabled ? 'flex' : 'none';
  }

  function setTool(nextTool) {
    tool = nextTool;
    toolkit.querySelectorAll('[data-tool]').forEach(btn => {
      btn.classList.toggle('px-active', btn.getAttribute('data-tool') === tool);
    });
    if (enabled) {
      canvas.style.cursor = tool === 'eraser' ? CURSORS.eraser : CURSORS.pen;
    }
  }

  function clear() {
    ensureSize();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function normPoint(e) {
    return {
      x: Math.max(0, Math.min(1, e.clientX / window.innerWidth)),
      y: Math.max(0, Math.min(1, e.clientY / window.innerHeight)),
    };
  }

  function drawSegment(a, b) {
    ensureSize();
    ctx.save();
    const size = Number(sizeEl.value || 6);
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = colorEl.value || '#ff0000';
    }
    ctx.lineWidth = size;
    ctx.beginPath();
    ctx.moveTo(a.x * window.innerWidth, a.y * window.innerHeight);
    ctx.lineTo(b.x * window.innerWidth, b.y * window.innerHeight);
    ctx.stroke();
    ctx.restore();
  }

  fab.addEventListener('click', () => setEnabled(!enabled));
  closeBtn.addEventListener('click', () => setEnabled(false));
  clearBtn.addEventListener('click', clear);

  toolkit.querySelectorAll('[data-tool]').forEach(btn => {
    btn.addEventListener('click', () => setTool(btn.getAttribute('data-tool')));
  });

  canvas.addEventListener('pointerdown', (e) => {
    if (!enabled) return;
    drawing = true;
    prev = normPoint(e);
    e.preventDefault();
  });

  window.addEventListener('pointermove', (e) => {
    if (!enabled || !drawing) return;
    const cur = normPoint(e);
    drawSegment(prev, cur);
    prev = cur;
    e.preventDefault();
  });

  function stop() {
    drawing = false;
    prev = null;
  }
  window.addEventListener('pointerup', stop);
  window.addEventListener('pointercancel', stop);

  window.addEventListener('resize', ensureSize);

  // Keyboard shortcuts
  window.addEventListener('keydown', (e) => {
    // Avoid hijacking typing
    const t = (e.target && (e.target.tagName || '')).toLowerCase();
    if (t === 'input' || t === 'textarea' || e.target?.isContentEditable) return;

    if (e.key === 'Escape' && enabled) {
      setEnabled(false);
      return;
    }

    if (e.key.toLowerCase() === 'm') {
      setEnabled(!enabled);
      return;
    }

    if (!enabled) return;

    const k = e.key.toLowerCase();
    if (k === 'p') setTool('pen');
    if (k === 'e') setTool('eraser');
    if (k === 'c') clear();
  });

  // Expose a tiny API for pages that want to control it.
  window.pxMarkerOverlay = {
    enable: () => setEnabled(true),
    disable: () => setEnabled(false),
    toggle: () => setEnabled(!enabled),
    clear,
  };
})();
