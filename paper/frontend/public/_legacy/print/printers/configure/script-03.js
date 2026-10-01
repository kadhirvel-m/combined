// Extracted from ui/print/printers/configure.html (inline <script> #3).
    // Late loader: pull selected note details and show inline preview
    document.addEventListener('DOMContentLoaded', async () => {
      try {
        if (typeof state === 'undefined' || !state.noteId) return;
        const API = (window.API_BASE || '').replace(/\/$/, '');
        const r = await fetch(`${API}/api/marketplace/notes/${encodeURIComponent(state.noteId)}`).catch(() => null);
        if (!r || !r.ok) return;
        const j = await r.json().catch(() => ({}));
        const n = (j && (j.note || j)) || {};
        if (n.title) { const t = document.getElementById('selDocTitle'); if (t) t.textContent = n.title; const w = document.getElementById('selDocWrap'); w && w.classList.remove('hidden'); }
        const openUrl = `${API}/api/marketplace/notes/${encodeURIComponent(state.noteId)}/download`;
        const a = document.getElementById('selDocOpen'); if (a) a.href = openUrl;
        if (!state.pages && (n.page_count || n.estimated_pages)) { state.pages = parseInt(n.page_count || n.estimated_pages) || ''; (typeof updateSummary === 'function') && updateSummary(); }
        const pv = `${API}/api/marketplace/notes/${encodeURIComponent(state.noteId)}/preview`;
        previewBaseSrc = pv;
        const wrap = document.getElementById('preview'); if (wrap) {
          wrap.innerHTML = `<div id='previewBox' class='relative w-full max-w-3xl mx-auto aspect-[3/2] bg-white/40 dark:bg-white/5 rounded-lg ring-1 ring-black/10 dark:ring-white/15 overflow-hidden flex flex-col'>
  <span id='previewRangeBadge' class='pointer-events-none absolute z-10 top-2 right-2 text-[11px] px-2 py-1 rounded-full bg-black/60 text-white hidden'></span>
  <iframe src='${pv}#view=fitH' class='w-full h-full' title='PDF preview' loading='lazy'></iframe>
  <a href='${pv}' target='_blank' class='text-[11px] px-2 py-1 bg-black/5 dark:bg-white/10 text-center'>Open full preview</a>
</div>`;
          try {
            const f = new FormData($('#cfg'));
            applyPreviewPageFilter({ mode: (f.get('range_mode') || 'all'), rangeText: (f.get('page_range') || ''), singlePage: (f.get('single_page') || '') });
            applyPreviewOrientation(f.get('orientation') || 'vertical');
          } catch { }
        }
      } catch { }
    });
