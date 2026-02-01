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
    #pxMarkerRoot{
      position: fixed !important;
      inset: 0 !important;
      z-index: ${Z};
      pointer-events: none;
    }

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
      pointer-events: auto;
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
      pointer-events: auto;
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
      pointer-events: auto;
    }
    .px-marker-btn:hover{ background: rgba(255,255,255,0.10); }
    .px-marker-btn.px-active{ background: rgba(158,75,138,0.35); border-color: rgba(158,75,138,0.6); }

    .px-marker-fab svg,
    .px-marker-btn svg{
      width: 22px;
      height: 22px;
      fill: currentColor;
    }

    #pxMarkerCanvas{
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      z-index: ${Z - 1};
      display: none;
      pointer-events: none;
      touch-action: none;
    }

    .px-marker-range{ width: 110px; }
    .px-marker-palette{ display: flex; gap: 6px; align-items: center; flex-wrap: wrap; max-width: 210px; }
    .px-marker-swatch{
      width: 22px;
      height: 22px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.28);
      cursor: pointer;
      box-shadow: 0 2px 10px rgba(0,0,0,0.18);
      pointer-events: auto;
    }
    .px-marker-swatch[data-active="true"]{ outline: 2px solid rgba(255,255,255,0.92); outline-offset: 1px; }
    .px-marker-swatch[data-edge="true"]{ border-color: rgba(255,255,255,0.55); }

    @media (max-width: 520px){
      .px-marker-toolkit{ right: 10px; bottom: 70px; }
      .px-marker-fab{ right: 10px; bottom: 12px; }
    }
  `;
  document.head.appendChild(style);

  const ICONS = {
    pencil: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm2.92 2.83H5v-.92l9.06-9.06.92.92L5.92 20.08zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/></svg>`,
    pen: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm14.71-9.04a1.003 1.003 0 0 0 0-1.42l-2.5-2.5a1.003 1.003 0 0 0-1.42 0l-1.29 1.29 3.75 3.75 1.46-1.12z"/></svg>`,
    eraser: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.24 3.56a2 2 0 0 0-2.83 0L3.56 13.41a2 2 0 0 0 0 2.83l4.2 4.2c.38.38.88.56 1.41.56H21v-2H12.17l8.54-8.54a2 2 0 0 0 0-2.83l-4.47-4.07zM9.17 19l-4.2-4.2 7.07-7.07 4.2 4.2L9.17 19z"/></svg>`,
    trash: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zm3.46-8.12L11 12.42l1.54-1.54L14.08 12.4l-1.54 1.54 1.54 1.54-1.54 1.54-1.54-1.54-1.54 1.54-1.54-1.54 1.54-1.54-1.54-1.54 1.54-1.54zM15.5 4l-1-1h-5l-1 1H5v2h14V4h-3.5z"/></svg>`,
    close: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.3 19.71 2.89 18.29 9.17 12 2.89 5.71 4.3 4.29l6.29 6.3 6.3-6.3z"/></svg>`,
  };

  const canvas = document.createElement('canvas');
  canvas.id = 'pxMarkerCanvas';
  // Harden against pages that override canvas positioning.
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.margin = '0';
  canvas.style.padding = '0';

  // Canvas is page-anchored so drawings stay at their document position.
  // Toolbar is mounted separately as fixed UI under <html>.
  // Insert canvas early in the body so it's not affected by layout stacking quirks.
  if (document.body.firstChild) {
    document.body.insertBefore(canvas, document.body.firstChild);
  } else {
    document.body.appendChild(canvas);
  }

  const root = document.createElement('div');
  root.id = 'pxMarkerRoot';
  document.documentElement.appendChild(root);

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
  fab.innerHTML = ICONS.pencil;
  root.appendChild(fab);

  const toolkit = document.createElement('div');
  toolkit.className = 'px-marker-toolkit';
  toolkit.innerHTML = `
    <button type="button" class="px-marker-btn px-active" data-tool="pen" title="Pen (P)">${ICONS.pen}</button>
    <button type="button" class="px-marker-btn" data-tool="eraser" title="Eraser (E)">${ICONS.eraser}</button>
    <div class="px-marker-palette" id="pxMarkerPalette" title="Color">
      <button type="button" class="px-marker-swatch" data-color="#ef4444" aria-label="Red" style="background:#ef4444"></button>
      <button type="button" class="px-marker-swatch" data-color="#f59e0b" aria-label="Orange" style="background:#f59e0b"></button>
      <button type="button" class="px-marker-swatch" data-color="#eab308" aria-label="Yellow" style="background:#eab308" data-edge="true"></button>
      <button type="button" class="px-marker-swatch" data-color="#22c55e" aria-label="Green" style="background:#22c55e"></button>
      <button type="button" class="px-marker-swatch" data-color="#3b82f6" aria-label="Blue" style="background:#3b82f6"></button>
      <button type="button" class="px-marker-swatch" data-color="#a855f7" aria-label="Purple" style="background:#a855f7"></button>
      <button type="button" class="px-marker-swatch" data-color="#111827" aria-label="Black" style="background:#111827" data-edge="true"></button>
    </div>
    <input class="px-marker-range" id="pxMarkerSize" type="range" min="2" max="18" value="6" title="Size" />
    <button type="button" class="px-marker-btn" id="pxMarkerClear" title="Clear (C)">${ICONS.trash}</button>
    <button type="button" class="px-marker-btn" id="pxMarkerClose" title="Close (Esc)">${ICONS.close}</button>
  `;
  root.appendChild(toolkit);

  const ctx = canvas.getContext('2d');
  let enabled = false;
  let drawing = false;
  let tool = 'pen';
  let prev = null;
  let currentColor = '#ef4444';

  const paletteEl = toolkit.querySelector('#pxMarkerPalette');
  const sizeEl = toolkit.querySelector('#pxMarkerSize');
  const clearBtn = toolkit.querySelector('#pxMarkerClear');
  const closeBtn = toolkit.querySelector('#pxMarkerClose');

  function setColor(next) {
    currentColor = next || '#ef4444';
    paletteEl?.querySelectorAll('.px-marker-swatch').forEach(btn => {
      btn.setAttribute('data-active', btn.getAttribute('data-color') === currentColor ? 'true' : 'false');
    });
  }

  // Initialize palette selection
  setColor(currentColor);

  function docSize() {
    const se = document.scrollingElement || document.documentElement;
    const w = Math.max(
      se.scrollWidth,
      se.clientWidth,
      document.documentElement.scrollWidth,
      document.documentElement.clientWidth,
      document.body?.scrollWidth || 0,
      document.body?.clientWidth || 0,
    );
    const h = Math.max(
      se.scrollHeight,
      se.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.clientHeight,
      document.body?.scrollHeight || 0,
      document.body?.clientHeight || 0,
    );
    return { w, h };
  }

  function ensureSize() {
    const dpr = window.devicePixelRatio || 1;
    const { w, h } = docSize();
    const nextW = Math.max(1, Math.floor(w * dpr));
    const nextH = Math.max(1, Math.floor(h * dpr));
    if (canvas.width !== nextW || canvas.height !== nextH) {
      // Preserve existing drawing when the document grows.
      const snapshot = document.createElement('canvas');
      snapshot.width = canvas.width || 1;
      snapshot.height = canvas.height || 1;
      const sctx = snapshot.getContext('2d');
      if (sctx) sctx.drawImage(canvas, 0, 0);

      canvas.width = nextW;
      canvas.height = nextH;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (snapshot.width > 1 && snapshot.height > 1) {
        // Draw previous buffer at 1:1 CSS pixels.
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(snapshot, 0, 0);
        ctx.restore();
      }
    } else {
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
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

  function point(e) {
    const px = typeof e.pageX === 'number' ? e.pageX : (e.clientX + window.scrollX);
    const py = typeof e.pageY === 'number' ? e.pageY : (e.clientY + window.scrollY);
    return { x: px, y: py };
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
      ctx.strokeStyle = currentColor || '#ef4444';
    }
    ctx.lineWidth = size;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.restore();
  }

  fab.addEventListener('click', () => setEnabled(!enabled));
  closeBtn.addEventListener('click', () => setEnabled(false));
  clearBtn.addEventListener('click', clear);

  toolkit.querySelectorAll('[data-tool]').forEach(btn => {
    btn.addEventListener('click', () => setTool(btn.getAttribute('data-tool')));
  });

  paletteEl?.querySelectorAll('.px-marker-swatch').forEach(btn => {
    btn.addEventListener('click', () => setColor(btn.getAttribute('data-color')));
  });

  canvas.addEventListener('pointerdown', (e) => {
    if (!enabled) return;
    drawing = true;
    prev = point(e);
    try { canvas.setPointerCapture(e.pointerId); } catch {}
    e.preventDefault();
  });

  window.addEventListener('pointermove', (e) => {
    if (!enabled || !drawing) return;
    const cur = point(e);
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

  // If content height changes (accordion, lazy-load), keep canvas covering it.
  const mo = new MutationObserver(() => {
    if (!enabled) return;
    ensureSize();
  });
  mo.observe(document.body, { childList: true, subtree: true, attributes: true });

  window.addEventListener('scroll', () => {
    // No redraw needed; just ensure it still covers document.
    if (enabled) ensureSize();
  }, { passive: true });

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
