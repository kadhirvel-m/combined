// Extracted from ui/matketplace/notes/note_detail.html (inline <script> #3).
        // Utilities
        const el = (sel, root = document) => root.querySelector(sel);
        const els = (sel, root = document) => [...root.querySelectorAll(sel)];
        const formatCurrency = v => (v || 0) === 0 ? 'Free' : `₹${(v / 100).toFixed(0)}`;
        const escapeHtml = s => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const formatBytes = (bytes) => {
            const value = Number(bytes);
            if (!Number.isFinite(value) || value <= 0) return '';
            const units = ['B', 'KB', 'MB', 'GB', 'TB'];
            let unit = 0;
            let v = value;
            while (v >= 1024 && unit < units.length - 1) { v /= 1024; unit++; }
            const rounded = unit === 0 ? Math.round(v) : (v >= 10 ? v.toFixed(1) : v.toFixed(2));
            return `${rounded} ${units[unit]}`;
        };

        // Unified theme toggle (same as index/about)
        (function () {
            const root = document.documentElement;
            const toggles = () => Array.from(document.querySelectorAll('[data-theme-toggle]'));
            const updateIcons = (mode) => toggles().forEach(btn => { const ic = btn.querySelector('.material-symbols-rounded'); if (ic) ic.textContent = mode === 'dark' ? 'light_mode' : 'dark_mode'; });
            const setTheme = (mode) => { mode === 'dark' ? root.classList.add('dark') : root.classList.remove('dark'); localStorage.setItem('px_theme', mode); updateIcons(mode); };
            setTheme(root.classList.contains('dark') ? 'dark' : 'light');
            document.addEventListener('click', e => { const t = e.target.closest('[data-theme-toggle]'); if (!t) return; setTheme(root.classList.contains('dark') ? 'light' : 'dark'); });
        })();

        // API helpers
        async function resolveApiBase(retries = 10) {
            const base = (window.__API_BASE || window.API_BASE || '').replace(/\/$/, ''); if (base) return base;
            if (retries <= 0) return ''; return new Promise(r => setTimeout(() => r(resolveApiBase(retries - 1)), 100));
        }
        function getToken() { const keys = ['px_token', 'sb-access-token', 'supabase.auth.token']; for (const k of keys) { try { const v = localStorage.getItem(k); if (v) return v; } catch { } } return '' }

        // Page state
        const params = new URLSearchParams(location.search); const noteId = params.get('id');
        let apiBase; let detail = {};

        // Fetch detail
        async function fetchDetail() {
            if (!apiBase) apiBase = await resolveApiBase();
            const token = getToken();
            let resp; try { resp = await fetch(`${apiBase}/api/marketplace/notes/${noteId}`, { cache: 'no-store', headers: token ? { Authorization: 'Bearer ' + token } : {} }); } catch (e) { console.error(e); return; }
            let data = {}; try { data = await resp.json(); } catch { }
            if (!resp.ok) { console.warn(data.detail || 'Failed'); return; }
            detail = data; renderAll();
        }

        // Render
        function renderAll() {
            const n = detail.note || {};
            // Defensive element lookups to avoid null classList errors under SES restrictions
            if (!el('#noteTitle')) { console.warn('Required DOM nodes missing; abort render.'); return; }
            el('#crumbTitle').textContent = n.title || 'Note';
            const titleTextEl = el('#noteTitleText'); if (titleTextEl) titleTextEl.textContent = n.title || '—';
            el('#noteDesc').textContent = n.description || '—';

            // Chips
            el('#metaChips').innerHTML = [n.subject, n.unit, n.exam_type].filter(Boolean)
                .map(x => `<span class="px-2 py-0.5 rounded-full ring-1 ring-black/10 dark:ring-white/15">${escapeHtml(x)}</span>`).join('');

            // Price
            el('#priceChip').textContent = formatCurrency(n.price_cents);
            el('#pricePrimary').textContent = formatCurrency(n.price_cents);
            el('#mobilePrice').textContent = formatCurrency(n.price_cents);

            // Seller
            const s = n.seller || {};
            const isTeacherUpload = Boolean(n.is_teacher_owner || s.is_teacher);
            // Use backend-provided profile_href if present (teacher), else fallback to staff profile.
            const profUrl = s.profile_href ? (s.profile_href.startsWith('http') ? s.profile_href : (`..${s.profile_href.startsWith('/ui') ? '/..' : '/'}${s.profile_href.replace(/^\/ui\//, '')}`)) : (s.is_teacher && s.id ? `../../teacher_profile.html?user=${encodeURIComponent(s.id)}` : `../../staff_profile.html?user=${encodeURIComponent(s.id || '')}`);
            el('#sellerProfile').href = profUrl;
            el('#sellerName').textContent = s.name || 'Unknown Seller';
            el('#sellerMeta').textContent = s.college_name || s.college || '';
            if (s.verified || s.is_teacher) {
                const sb = el('#sellerBadge'); if (sb) sb.classList.remove('hidden');
                const tb = el('#titleTeacherBadge'); if (tb) tb.classList.remove('hidden');
            }
            const avatarMarkup = s.avatar_url
                ? `<img src="${s.avatar_url}" class="w-full h-full object-cover" alt="">`
                : `<div class="w-full h-full grid place-items-center text-xs font-medium text-brand-700 dark:text-fuchsia-200 bg-gradient-to-br from-brand-500/30 to-brand-500/10">${escapeHtml((s.name || 'U').charAt(0).toUpperCase())}</div>`;
            el('#sellerAvatar').innerHTML = avatarMarkup;
            el('#sellerAvatarWrap').innerHTML = avatarMarkup;

            const attachments = Array.isArray(n.attachments) ? n.attachments : [];
            const primaryFile = attachments.find(att => att && (att.original_filename || att.stored_path)) || attachments[0] || null;
            const extractExt = (input) => {
                if (!input) return '';
                const cleaned = input.split('/').pop().split('?')[0];
                const dot = cleaned.lastIndexOf('.');
                return dot >= 0 ? cleaned.slice(dot + 1).toLowerCase() : '';
            };
            const primaryName = primaryFile?.original_filename || n.original_filename || '';
            const primaryStoredName = primaryFile?.stored_path || n.stored_path || '';
            const primaryMime = (primaryFile?.mime_type || n.mime_type || '').toLowerCase();
            const extFromName = extractExt(primaryName) || extractExt(primaryStoredName);
            let displayType = '';
            if (primaryMime) {
                if (primaryMime === 'application/pdf') displayType = 'PDF';
                else if (primaryMime === 'application/msword') displayType = 'DOC';
                else if (primaryMime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') displayType = 'DOCX';
                else if (primaryMime === 'application/vnd.ms-powerpoint') displayType = 'PPT';
                else if (primaryMime === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') displayType = 'PPTX';
                else if (primaryMime.startsWith('image/')) displayType = primaryMime.split('/')[1]?.toUpperCase() || 'IMAGE';
                else displayType = primaryMime.split('/').pop()?.toUpperCase() || '';
            }
            if (!displayType && extFromName) displayType = extFromName.toUpperCase();
            if (!displayType && n.file_type) displayType = String(n.file_type).toUpperCase();
            if (!displayType) displayType = '—';
            const primarySizeBytes = primaryFile?.file_size || n.file_size || n.size || 0;
            const formattedSize = formatBytes(primarySizeBytes);
            const metadataObj = (n.metadata && typeof n.metadata === 'object') ? n.metadata : {};
            const pageCountValue = n.page_count || n.pages || n.estimated_pages || primaryFile?.page_count || metadataObj.page_count || metadataObj.pages || '';
            const pageCountLabel = pageCountValue ? String(pageCountValue) : '';
            const suggestedDownloadName = primaryFile?.original_filename || n.original_filename || (n.title ? `${n.title}${extFromName ? `.${extFromName}` : ''}` : 'note');

            const ratingSummaryEl = el('#ratingSummary');
            const asideRatingEl = el('#asideRating');
            if (isTeacherUpload) {
                if (ratingSummaryEl) {
                    ratingSummaryEl.textContent = '';
                    ratingSummaryEl.classList.add('hidden');
                    ratingSummaryEl.classList.remove('text-amber-500');
                }
                if (asideRatingEl) {
                    asideRatingEl.textContent = '';
                    asideRatingEl.classList.add('hidden');
                    asideRatingEl.classList.remove('text-amber-500');
                }
            } else {
                const ratingTxt = n.rating_count ? `★ ${Number(n.avg_rating).toFixed(1)} (${n.rating_count})` : 'No ratings';
                if (ratingSummaryEl) {
                    ratingSummaryEl.textContent = ratingTxt;
                    ratingSummaryEl.classList.remove('hidden', 'text-neutral-500', 'dark:text-white/60');
                    ratingSummaryEl.classList.add('text-amber-500');
                }
                if (asideRatingEl) {
                    asideRatingEl.textContent = ratingTxt;
                    asideRatingEl.classList.remove('hidden', 'text-neutral-500', 'dark:text-white/60');
                    asideRatingEl.classList.add('text-amber-500');
                }
            }

            // File meta / details
            const mgrid = el('#fileMeta'); mgrid.innerHTML = '';
            const push = (label, val) => mgrid.insertAdjacentHTML('beforeend', `<div class="px-2 py-1 rounded ring-1 ring-black/10 dark:ring-white/15 bg-white/60 dark:bg-white/5"><div class="text-[11px] opacity-60">${label}</div><div class="text-xs">${val || '—'}</div></div>`);
            push('Type', displayType);
            push('Pages', pageCountLabel || '—');
            push('Size', formattedSize || '—');
            push('Updated', n.updated_at ? new Date(n.updated_at).toLocaleDateString() : '—');

            const dlist = el('#detailsList'); dlist.innerHTML = '';
            const row = (k, v) => dlist.insertAdjacentHTML('beforeend', `<dt class="opacity-70">${k}</dt><dd>${escapeHtml(String(v || '—'))}</dd>`);
            // Custom ordered academic/metadata rows (remove Unit & Exam)
            row('Subject', n.subject);
            if (n.degree_name) row('Degree', n.degree_name);
            if (n.department_name) row('Department', n.department_name);
            if (n.batch_range) row('Batch', n.batch_range);
            if (n.semester) row('Semester', n.semester);
            if (n.college_name) row('College', n.college_name);
            if (Array.isArray(n.tags)) row('Tags', n.tags.join(', '));

            // Outline
            if (Array.isArray(n.outline) && n.outline.length) {
                const oc = el('#outlineCard'); if (oc) oc.classList.remove('hidden');
                el('#outlineList').innerHTML = n.outline.map((it, i) => `<li class="flex items-start gap-2"><span class="material-symbols-rounded text-sm mt-0.5">check_circle</span><span>${escapeHtml(typeof it === 'string' ? it : it.title || ('Item ' + (i + 1)))}</span></li>`).join('');
            }

            // Preview thumbs
            const strip = el('#thumbStrip'); strip.innerHTML = '';
            const thumbs = Array.isArray(n.preview_images) ? n.preview_images.slice(0, 12) : [];
            const previewArea = el('#previewArea');
            const showImage = (url) => {
                previewArea.innerHTML = `<img src="${url}" alt="Preview" class="max-h-[60vh] w-auto max-w-full object-contain mx-auto transition-opacity duration-200 opacity-0" onload="this.style.opacity=1">`;
            };
            const showPdf = (url) => {
                previewArea.innerHTML = `<div class='w-full max-w-3xl mx-auto aspect-[3/2] bg-white/40 dark:bg-white/5 rounded-lg ring-1 ring-black/10 dark:ring-white/15 overflow-hidden flex flex-col'>
<iframe src='${url}#view=fitH' class='w-full h-full' title='PDF preview' loading='lazy'></iframe>
<a href='${url}' target='_blank' class='text-[11px] px-2 py-1 bg-black/5 dark:bg-white/10 text-center'>Open full PDF</a>
</div>`;
            };
            function attachFallbackDownload() {
                const fallbackBtn = previewArea.querySelector('[data-role="fallback-download"]');
                if (fallbackBtn) {
                    fallbackBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        doDownload();
                    }, { once: true });
                }
            }
            function renderDownloadFallback(message) {
                previewArea.innerHTML = `
                    <div class="py-14 text-sm text-neutral-600 dark:text-white/70 flex flex-col items-center gap-2 text-center">
                        <span class="text-base font-semibold">Preview unavailable for this file type.</span>
                        <span class="text-xs opacity-70">${message || `Type: ${(n.mime_type || 'n/a')} | File: ${(n.original_filename || n.stored_path || 'n/a')}`}</span>
                        <button type="button" data-role="fallback-download"
                            class="mt-3 inline-flex items-center gap-2 rounded-full bg-brand-500 text-white font-semibold px-4 py-2 text-xs hover:shadow-glow transition">
                            <span class="material-symbols-rounded text-base">download</span>
                            Download to view
                        </button>
                    </div>
                `;
                attachFallbackDownload();
            }
            async function showDocx(url) {
                if (!window.mammoth || typeof window.mammoth.convertToHtml !== 'function') {
                    renderDownloadFallback(`Type: ${(n.mime_type || 'n/a')} | File: ${(n.original_filename || n.stored_path || 'n/a')}`);
                    return;
                }
                previewArea.innerHTML = `<div class="py-12 text-sm text-neutral-500 dark:text-white/60">Rendering document preview...</div>`;
                try {
                    const token = getToken();
                    const res = await fetch(url, { headers: token ? { Authorization: 'Bearer ' + token } : {} });
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    const buffer = await res.arrayBuffer();
                    const result = await window.mammoth.convertToHtml({ arrayBuffer: buffer });
                    const html = result.value || '<p>Preview unavailable.</p>';
                    previewArea.innerHTML = `<div class="docx-preview prose prose-sm max-w-none max-h-[60vh] overflow-y-auto bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 p-4 rounded-xl shadow-sm">${html}<div class="mt-4 flex justify-center"><button type="button" data-role="fallback-download" class="inline-flex items-center gap-2 rounded-full bg-brand-500 text-white font-semibold px-4 py-2 text-xs hover:shadow-glow transition"><span class="material-symbols-rounded text-base">download</span>Download original</button></div></div>`;
                    attachFallbackDownload();
                } catch (err) {
                    console.warn('DOCX preview failed', err);
                    renderDownloadFallback('Unable to render preview. Please download to view.');
                }
            }
            const downloadUrl = apiBase && n.id ? `${apiBase}/api/marketplace/notes/${n.id}/download` : '';
            const purchaseUrl = apiBase && n.id ? `${apiBase}/api/marketplace/notes/${n.id}/purchase` : '';
            const hasAccess = !!detail.has_access || (n.price_cents || 0) === 0;
            const remoteUrl = (n.url && /^https?:\/\//i.test(n.url)) ? n.url : ((n.stored_path && /^https?:\/\//i.test(n.stored_path)) ? n.stored_path : '');
            const derivedDownloadUrl = (hasAccess && remoteUrl) ? remoteUrl : '';
            const inlinePreviewUrl = '';
            
            const tryPrimaryPreview = () => {
                // Prefer remote stored_path when URL-backed note
                if (n.stored_path && /^https?:\/\//i.test(n.stored_path)) {
                    const lower = n.stored_path.split('?')[0].toLowerCase();
                    if (/(\.pdf)$/.test(lower)) { showPdf(n.stored_path); return true; }
                    if (/(\.png|\.jpe?g|\.webp|\.gif)$/.test(lower)) { showImage(n.stored_path); return true; }
                }
                // Skip backend inline preview; use remote URLs only
                // 1. Explicit preview_url
                if (n.preview_url) {
                    const lower = n.preview_url.split('?')[0].toLowerCase();
                    if (/(\.pdf)$/.test(lower)) { showPdf(n.preview_url); return true; }
                    if (/(\.png|\.jpe?g|\.webp|\.gif)$/.test(lower)) { showImage(n.preview_url); return true; }
                }
                // 2. Explicit cover_path
                if (n.cover_path && /^https?:\/\//i.test(n.cover_path)) {
                    showImage(n.cover_path); return true;
                }
                // 3. Thumbs array
                if (thumbs.length) { showImage(thumbs[0]); return true; }
                // 4. Remote stored_path (Supabase/public URL) fallback
                if (n.stored_path && /^https?:\/\//i.test(n.stored_path)) {
                    const lower = n.stored_path.split('?')[0].toLowerCase();
                    if (/(\.pdf)$/.test(lower)) { showPdf(n.stored_path); return true; }
                    if (/(\.png|\.jpe?g|\.webp|\.gif)$/.test(lower)) { showImage(n.stored_path); return true; }
                }
                // 5. Derive from original/stored filename when served locally
                const nameForExt = (n.original_filename || n.stored_path || '').toLowerCase();
                const mime = (n.mime_type || '').toLowerCase();
                if (nameForExt || mime) {
                    const isPdf = nameForExt.endsWith('.pdf') || mime === 'application/pdf';
                    const isImg = /\.(png|jpe?g|webp|gif)$/i.test(nameForExt) || mime.startsWith('image/');
                    const isDocx = nameForExt.endsWith('.docx') || mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                    if (derivedDownloadUrl && (isPdf || isImg)) {
                        if (isPdf) { showPdf(derivedDownloadUrl); return true; }
                        if (isImg) { showImage(derivedDownloadUrl); return true; }
                    }
                    if (isDocx && derivedDownloadUrl) {
                        if (!hasAccess) {
                            return false;
                        }
                        showDocx(derivedDownloadUrl);
                        return true;
                    }
                }
                return false;
            };
            if (!tryPrimaryPreview()) {
                renderDownloadFallback(`Type: ${(n.mime_type || 'n/a')} | File: ${(n.original_filename || n.stored_path || 'n/a')}`);
            }
            thumbs.forEach((u, idx) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'shrink-0 w-20 h-14 rounded-md overflow-hidden ring-1 ring-black/10 dark:ring-white/15 bg-white/50 dark:bg-white/10 hover:ring-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500';
                btn.innerHTML = `<img src="${u}" class="w-full h-full object-cover" alt="Page ${idx + 1}">`;
                btn.addEventListener('click', () => showImage(u));
                strip.appendChild(btn);
            });
            el('#openInNew').onclick = () => {
                if (inlinePreviewUrl) { window.open(inlinePreviewUrl, '_blank', 'noopener'); return; }
                if (n.preview_url) { window.open(n.preview_url, '_blank', 'noopener'); return; }
                if (thumbs[0]) { window.open(thumbs[0], '_blank', 'noopener'); return; }
                if (derivedDownloadUrl) { window.open(derivedDownloadUrl, '_blank', 'noopener'); return; }
                window.open(`./note_detail.html?id=${noteId}`, '_blank');
            };
            el('#copyLink').onclick = async () => {
                const url = location.href; try { if (navigator.share) await navigator.share({ title: n.title || 'Note', url }); else { await navigator.clipboard.writeText(url); } } catch { }
            };

            // CTA wiring
            const cta = el('#primaryCta'); const mobileCta = el('#mobileCta'); const statusEl = el('#purchaseStatus');
            async function doDownload() {
                // If we have a direct remote URL (Supabase/public) and access, open it directly
                if (/^https?:\/\//i.test(derivedDownloadUrl) && hasAccess) {
                    const a = document.createElement('a');
                    a.href = derivedDownloadUrl;
                    a.target = '_blank';
                    a.rel = 'noopener';
                    a.download = suggestedDownloadName || n.original_filename || n.title || 'note';
                    document.body.appendChild(a); a.click(); a.remove();
                    return;
                }
                const token = getToken();
                try {
                    const r = await fetch(downloadUrl, { headers: token ? { Authorization: 'Bearer ' + token } : {} });
                    if (!r.ok) {
                        let msg = 'Download failed';
                        try { const j = await r.json(); msg = j.detail || msg; } catch { }
                        statusEl.textContent = msg; return;
                    }
                    const blob = await r.blob();
                    const a = document.createElement('a');
                    const url = URL.createObjectURL(blob);
                    a.href = url; a.download = suggestedDownloadName || n.original_filename || n.title || 'note';
                    document.body.appendChild(a); a.click(); a.remove();
                    setTimeout(() => URL.revokeObjectURL(url), 4000);
                } catch (e) { statusEl.textContent = 'Network error'; }
            }
            async function doPurchase(btn) {
                const token = getToken(); if (!token) { statusEl.textContent = 'Login required'; return; }
                const old = btn.innerHTML; btn.innerHTML = '<span class="material-symbols-rounded">hourglass_top</span><span>Processing...</span>';
                statusEl.textContent = '';
                let r; try { r = await fetch(purchaseUrl, { method: 'POST', headers: { Authorization: 'Bearer ' + token } }); } catch { btn.innerHTML = old; statusEl.textContent = 'Network error'; return; }
                if (r && r.ok) {
                    btn.innerHTML = old; statusEl.textContent = 'Purchased. Starting download...';
                    // refetch to update access
                    detail.has_access = true; setTimeout(doDownload, 600);
                    el('#ctaText').textContent = 'Download';
                    cta.onclick = (e) => { e.preventDefault(); doDownload(); };
                    mobileCta.onclick = (e) => { e.preventDefault(); doDownload(); };
                } else {
                    btn.innerHTML = old; let msg = 'Purchase failed'; try { const j = await r.json(); msg = j.detail || msg; } catch { } statusEl.textContent = msg;
                }
            }
            if (hasAccess) {
                el('#ctaText').textContent = 'Download'; cta.href = '#'; mobileCta.href = '#';
                cta.onclick = (e) => { e.preventDefault(); doDownload(); };
                mobileCta.onclick = (e) => { e.preventDefault(); doDownload(); };
            } else {
                el('#ctaText').textContent = `Purchase ${formatCurrency(n.price_cents)}`; cta.href = '#'; mobileCta.href = '#';
                const purchaseHandler = (e) => { e.preventDefault(); doPurchase(e.currentTarget); };
                cta.onclick = purchaseHandler; mobileCta.onclick = purchaseHandler;
            }

            // Wishlist
            const key = 'px_wishlist';
            const getWL = () => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } };
            const setWL = (a) => { localStorage.setItem(key, JSON.stringify(a)); };
            const isSaved = () => getWL().some(x => x === n.id);
            const saveBtn = el('#saveBtn'); const refreshSave = () => saveBtn.innerHTML = (isSaved() ? '<span class="material-symbols-rounded">bookmark_added</span>Saved' : '<span class="material-symbols-rounded">bookmark_add</span>Save to wishlist');
            refreshSave();
            saveBtn.onclick = () => { const a = getWL(); if (isSaved()) { setWL(a.filter(x => x !== n.id)); } else { a.push(n.id); setWL(a); } refreshSave(); };

            // Reviews
            const reviewsSection = el('#reviewsSection');
            if (isTeacherUpload) {
                if (reviewsSection) reviewsSection.classList.add('hidden');
            } else {
                if (reviewsSection) reviewsSection.classList.remove('hidden');
                renderReviews(detail.reviews || [], n);
            }

            // Print CTA wiring (route to Find a Print Shop)
            try {
                const printBtn = el('#printBtn');
                const quick = el('#printQuickInfo');
                const bytes = primarySizeBytes;
                const pages = pageCountLabel;
                const sizeLabel = formatBytes(bytes);
                if (quick) {
                    const parts = [];
                    if (pages) parts.push(`${pages} pages`);
                    if (sizeLabel) parts.push(sizeLabel);
                    quick.textContent = parts.join(' • ');
                    if (quick.textContent) quick.classList.remove('hidden');
                }
                if (printBtn) {
                    printBtn.addEventListener('click', () => {
                        const url = `../../print/printers/shops.html?noteId=${encodeURIComponent(n.id)}${pages ? ('&pages=' + pages) : ''}${bytes ? ('&size=' + bytes) : ''}`;
                        location.href = url;
                    });
                }
            } catch (_) { }
        }

        function renderReviews(list, n) {
            const reviewsList = el('#reviewsList'); const bars = el('#ratingBars'); const big = el('#ratingBig');
            reviewsList.innerHTML = ''; bars.innerHTML = ''; big.innerHTML = '';
            const counts = [0, 0, 0, 0, 0];
            list.forEach(r => { const v = Math.max(1, Math.min(5, parseInt(r.rating || 0))); counts[v - 1]++; });
            const total = list.length || 0; const avg = total ? (list.reduce((s, r) => s + (parseFloat(r.rating) || 0), 0) / total) : 0;
            big.innerHTML = `<div class="text-2xl font-extrabold">${avg ? avg.toFixed(1) : '—'}</div><div class="text-xs text-amber-500">${total ? `★ ${avg.toFixed(1)} (${total})` : 'No reviews yet'}</div>`;
            for (let i = 5; i >= 1; i--) {
                const c = counts[i - 1]; const pct = total ? Math.round((c / total) * 100) : 0;
                bars.insertAdjacentHTML('beforeend', `<div class="flex items-center gap-2 text-xs">
          <span class="w-8 text-right">${i}★</span>
          <div class="flex-1 h-2 rounded bg-black/5 dark:bg-white/10 overflow-hidden"><div style="width:${pct}%" class="h-full bg-amber-500"></div></div>
          <span class="w-10 text-right opacity-70">${pct}%</span>
        </div>`);
            }

            if (!total) { reviewsList.innerHTML = '<p class="text-sm text-neutral-600 dark:text-white/70">Be the first to review.</p>'; }
            list.forEach(r => {
                const u = r.reviewer || {}; const av = u.avatar_url
                    ? `<img src="${u.avatar_url}" class="w-8 h-8 rounded-full object-cover ring-1 ring-black/5 dark:ring-white/10">`
                    : `<div class="w-8 h-8 rounded-full bg-brand-500/80 text-[11px] font-medium flex items-center justify-center text-white">${(u.name || 'U')[0] || 'U'}</div>`;
                const item = document.createElement('div'); item.className = 'p-4 rounded-lg border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/5';
                item.innerHTML = `<div class="flex items-start gap-3">${av}<div class="flex-1"><div class="flex items-center gap-2 mb-1"><span class="text-xs font-medium">★ ${r.rating}</span><span class="text-[11px] opacity-60">${r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}</span><span class="text-[11px] text-neutral-600 dark:text-white/70">${escapeHtml(u.name || '')}</span></div><p class="text-xs whitespace-pre-wrap">${escapeHtml(r.comment || '')}</p></div></div>`;
                reviewsList.appendChild(item);
            });

            // Add/Update review
            const addBtn = el('#addReviewBtn'); const form = el('#reviewForm'); const status = el('#reviewStatus'); const starPicker = el('#starPicker');
            addBtn.onclick = () => { form.classList.remove('hidden'); addBtn.classList.add('hidden'); };
            el('#cancelReview').onclick = () => { form.classList.add('hidden'); addBtn.classList.remove('hidden'); };
            // Star picker UI
            let current = 5; const renderStars = (v) => { starPicker.innerHTML = Array.from({ length: 5 }, (_, i) => `<span data-v="${i + 1}" class="material-symbols-rounded">${i + 1 <= v ? 'star' : 'star_border'}</span>`).join(''); el('input[name="rating"]', form).value = v; };
            starPicker.addEventListener('click', e => { const s = e.target.closest('[data-v]'); if (!s) return; current = +s.dataset.v; renderStars(current); });
            renderStars(current);
            form.addEventListener('submit', async e => {
                e.preventDefault(); status.textContent = 'Submitting…';
                const fd = new FormData(form); const token = getToken(); let resp; try { resp = await fetch(`${apiBase}/api/marketplace/notes/${n.id}/review`, { method: 'POST', headers: token ? { Authorization: 'Bearer ' + token } : {}, body: fd }); } catch { status.textContent = 'Network error'; return; }
                let data = {}; try { data = await resp.json(); } catch { }
                if (!resp.ok) { status.textContent = data.detail || 'Error'; return; }
                status.textContent = 'Saved'; setTimeout(() => { status.textContent = ''; form.classList.add('hidden'); addBtn.classList.remove('hidden'); fetchDetail(); }, 500);
            });
        }

        // Boot
        document.addEventListener('DOMContentLoaded', fetchDetail);
