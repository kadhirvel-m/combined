// Extracted from ui/ppt/viewer.html (inline <script> #3).
        const apiBase = (window.API_BASE || window.location.origin).replace(/\/$/, '');
        const token = localStorage.getItem('px_token');

        let pptData = null; // { title, description, slides }
        let generatedSlides = []; // { slide_number, title, image_data }
        let activeSlideIndex = 0;
        let allGenerated = false;

        // ═══ THEME ═══
        const themeBtn = document.querySelector('[data-theme-toggle]');
        const themeIcon = document.getElementById('themeIcon');
        themeIcon.textContent = document.documentElement.classList.contains('dark') ? 'light_mode' : 'dark_mode';
        themeBtn.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            const d = document.documentElement.classList.contains('dark');
            themeIcon.textContent = d ? 'light_mode' : 'dark_mode';
            localStorage.setItem('px_theme', d ? 'dark' : 'light');
        });

        // ═══ INIT ═══
        (async function init() {
            const raw = sessionStorage.getItem('ppt_data');
            if (!raw) {
                window.location.href = 'index.html';
                return;
            }

            pptData = JSON.parse(raw);
            document.getElementById('viewerTitle').textContent = pptData.title;
            document.getElementById('viewerSubtitle').textContent = `${pptData.slides.length} slides • Generating...`;

            // Init sidebar with skeletons
            const sidebar = document.getElementById('slideSidebar');
            sidebar.innerHTML = pptData.slides.map((s, i) => `
                <div id="thumb-${i}" class="slide-card skeleton-shimmer cursor-pointer" onclick="selectSlide(${i})">
                    <span class="slide-num">${s.slide_number}</span>
                    <div class="w-full h-full flex items-center justify-center gen-pulse">
                        <div class="text-center px-2">
                            <div class="spinner mx-auto mb-2 w-4 h-4 border-2"></div>
                            <p class="text-[9px] font-semibold text-neutral-400 dark:text-white/25 truncate">${esc(s.title)}</p>
                        </div>
                    </div>
                </div>
            `).join('');

            // Show generation progress
            const genProg = document.getElementById('genProgress');
            genProg.classList.remove('hidden');
            genProg.classList.add('flex');

            generatedSlides = new Array(pptData.slides.length).fill(null);

            // Generate all slides in parallel
            let completed = 0;
            const total = pptData.slides.length;

            const promises = pptData.slides.map((slide, i) => {
                return apiPost('/api/ppt/generate-slide', {
                    ppt_title: pptData.title,
                    slide: slide,
                    total_slides: total,
                    ppt_description: pptData.description
                }).then(res => {
                    completed++;
                    updateGenProgress(completed, total);

                    if (res.image_data) {
                        generatedSlides[i] = {
                            slide_number: slide.slide_number,
                            title: slide.title,
                            image_data: res.image_data
                        };
                        updateThumbnail(i, res.image_data, slide);
                        // If this is the currently viewed slide, update preview
                        if (i === activeSlideIndex) {
                            showPreview(i);
                        }
                        // Auto-show first slide as soon as it's ready
                        if (i === 0 && activeSlideIndex === 0) {
                            showPreview(0);
                            selectSlide(0);
                        }
                    } else {
                        markThumbError(i);
                    }
                }).catch(err => {
                    completed++;
                    updateGenProgress(completed, total);
                    console.error(`Slide ${i + 1} error:`, err);
                    markThumbError(i);
                });
            });

            await Promise.all(promises);

            // All done
            allGenerated = true;
            genProg.classList.add('hidden');
            document.getElementById('viewerSubtitle').textContent = `${pptData.slides.length} slides • Ready`;
            document.getElementById('dlBtnWrap').style.display = 'block';

            // Enable nav buttons
            updateNavButtons();

            // Select first if not already
            if (generatedSlides[0]) {
                selectSlide(0);
            }

            showToast(`All ${total} slides generated!`);
        })();

        // ═══ GENERATION PROGRESS ═══
        function updateGenProgress(done, total) {
            const pct = (done / total) * 100;
            document.getElementById('genProgressBar').style.width = pct + '%';
            document.getElementById('genProgressCount').textContent = `${done}/${total}`;
            document.getElementById('genProgressText').textContent = done === total ? 'Complete!' : `Generating...`;
        }

        // ═══ UPDATE THUMBNAIL ═══
        function updateThumbnail(i, imageData, slide) {
            const thumb = document.getElementById(`thumb-${i}`);
            if (!thumb) return;
            thumb.classList.remove('skeleton-shimmer');
            thumb.innerHTML = `
                <span class="slide-num">${slide.slide_number}</span>
                <img src="data:image/png;base64,${imageData}" alt="Slide ${slide.slide_number}">
            `;
            thumb.style.animation = 'slide-in 0.4s ease-out';
        }

        function markThumbError(i) {
            const thumb = document.getElementById(`thumb-${i}`);
            if (!thumb) return;
            thumb.classList.remove('skeleton-shimmer');
            thumb.innerHTML = `
                <span class="slide-num">${i + 1}</span>
                <div class="w-full h-full flex items-center justify-center bg-red-500/5">
                    <div class="text-center">
                        <span class="material-symbols-rounded text-red-400 text-xl">error</span>
                        <p class="text-[9px] text-red-400 font-bold mt-1">Failed</p>
                    </div>
                </div>
            `;
        }

        // ═══ SLIDE NAVIGATION ═══
        function selectSlide(i) {
            activeSlideIndex = i;

            // Update active states
            document.querySelectorAll('.slide-card').forEach((c, idx) => {
                c.classList.toggle('active', idx === i);
            });

            // Scroll thumb into view
            const thumb = document.getElementById(`thumb-${i}`);
            if (thumb) thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

            showPreview(i);
            updateNavButtons();
        }

        function showPreview(i) {
            const area = document.getElementById('previewArea');
            const slide = generatedSlides[i];
            const slideInfo = pptData.slides[i];

            if (slide && slide.image_data) {
                area.innerHTML = `
                    <div class="aspect-[16/9] rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/[0.04] dark:ring-white/[0.06] slide-in">
                        <img src="data:image/png;base64,${slide.image_data}" alt="Slide ${slide.slide_number}: ${esc(slide.title)}"
                            class="w-full h-full object-cover">
                    </div>
                `;
            } else {
                area.innerHTML = `
                    <div class="aspect-[16/9] rounded-2xl glass flex items-center justify-center shadow-lg">
                        <div class="text-center gen-pulse">
                            <div class="spinner mx-auto mb-4"></div>
                            <p class="text-sm font-bold text-neutral-400 dark:text-white/30">Generating "${esc(slideInfo ? slideInfo.title : '')}"...</p>
                        </div>
                    </div>
                `;
            }

            // Update counter & title
            document.getElementById('slideCounter').textContent = `${i + 1} / ${pptData.slides.length}`;
            document.getElementById('currentSlideTitle').textContent = slideInfo ? slideInfo.title : '';
        }

        function prevSlide() {
            if (activeSlideIndex > 0) selectSlide(activeSlideIndex - 1);
        }
        function nextSlide() {
            if (activeSlideIndex < pptData.slides.length - 1) selectSlide(activeSlideIndex + 1);
        }

        function updateNavButtons() {
            document.getElementById('prevBtn').disabled = activeSlideIndex <= 0;
            document.getElementById('nextBtn').disabled = activeSlideIndex >= pptData.slides.length - 1;
        }

        // Keyboard navigation
        document.addEventListener('keydown', e => {
            if (e.key === 'ArrowLeft') prevSlide();
            else if (e.key === 'ArrowRight') nextSlide();
            else if (e.key === 'Escape') closeDlMenu();
        });

        // ═══ FULLSCREEN ═══
        function toggleFullscreen() {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                document.documentElement.requestFullscreen();
            }
        }

        // ═══ DOWNLOAD MENU ═══
        function toggleDlMenu() {
            document.getElementById('dlMenu').classList.toggle('open');
        }
        function closeDlMenu() {
            document.getElementById('dlMenu').classList.remove('open');
        }
        document.addEventListener('click', e => {
            if (!e.target.closest('#dlBtnWrap')) closeDlMenu();
        });

        // ═══ EXPORT: ZIP ═══
        async function exportZip() {
            closeDlMenu();
            showToast('Creating ZIP...');
            const zip = new JSZip();
            const validSlides = generatedSlides.filter(Boolean);

            validSlides.forEach(s => {
                const binary = atob(s.image_data);
                const array = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
                zip.file(`slide_${s.slide_number}_${sanitize(s.title)}.png`, array);
            });

            const blob = await zip.generateAsync({ type: 'blob' });
            downloadBlob(blob, `${sanitize(pptData.title)}_slides.zip`);
            showToast('ZIP downloaded!');
        }

        // ═══ EXPORT: PDF ═══
        async function exportPdf() {
            closeDlMenu();
            showToast('Creating PDF...');

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1280, 720] });
            const validSlides = generatedSlides.filter(Boolean);

            for (let i = 0; i < validSlides.length; i++) {
                if (i > 0) doc.addPage([1280, 720], 'landscape');
                const imgData = 'data:image/png;base64,' + validSlides[i].image_data;
                doc.addImage(imgData, 'PNG', 0, 0, 1280, 720);
            }

            doc.save(`${sanitize(pptData.title)}_presentation.pdf`);
            showToast('PDF downloaded!');
        }

        // ═══ EXPORT: PPTX ═══
        async function exportPptx() {
            closeDlMenu();
            showToast('Creating PPTX...');

            const pptx = new PptxGenJS();
            pptx.defineLayout({ name: 'CUSTOM', width: 13.33, height: 7.5 });
            pptx.layout = 'CUSTOM';

            const validSlides = generatedSlides.filter(Boolean);

            validSlides.forEach(s => {
                const slide = pptx.addSlide();
                slide.addImage({
                    data: 'data:image/png;base64,' + s.image_data,
                    x: 0, y: 0,
                    w: '100%', h: '100%',
                });
            });

            await pptx.writeFile({ fileName: `${sanitize(pptData.title)}_presentation.pptx` });
            showToast('PPTX downloaded!');
        }

        // ═══ DOWNLOAD SINGLE ═══
        function downloadSingleSlide() {
            closeDlMenu();
            const slide = generatedSlides[activeSlideIndex];
            if (!slide) return showToast('Slide not ready yet');

            const a = document.createElement('a');
            a.href = 'data:image/png;base64,' + slide.image_data;
            a.download = `slide_${slide.slide_number}_${sanitize(slide.title)}.png`;
            a.click();
            showToast('Slide downloaded!');
        }

        // ═══ TOAST ═══
        function showToast(msg) {
            const t = document.getElementById('toast');
            document.getElementById('toastText').textContent = msg;
            t.classList.add('show');
            setTimeout(() => t.classList.remove('show'), 3000);
        }

        // ═══ UTILS ═══
        async function apiPost(url, body) {
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = 'Bearer ' + token;
            const r = await fetch(apiBase + url, { method: 'POST', headers, body: JSON.stringify(body) });
            if (!r.ok) {
                const err = await r.json().catch(() => ({ detail: r.statusText }));
                throw new Error(err.detail || 'Request failed');
            }
            return r.json();
        }

        function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
        function sanitize(s) { return String(s || 'untitled').replace(/[^a-zA-Z0-9 _-]/g, '').substring(0, 40).trim().replace(/\s+/g, '_'); }

        function downloadBlob(blob, name) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = name;
            a.click();
            URL.revokeObjectURL(url);
        }
