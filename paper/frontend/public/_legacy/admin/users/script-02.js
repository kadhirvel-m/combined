// Extracted from ui/admin/users.html (inline <script> #2).
        function getToken() {
            return (
                localStorage.getItem('px_token') ||
                localStorage.getItem('access_token') ||
                localStorage.getItem('token') ||
                localStorage.getItem('teacherToken') ||
                ''
            );
        }

        function setStatus(kind, text) {
            const dot = document.getElementById('statusDot');
            const label = document.getElementById('statusText');
            label.textContent = text;
            dot.className = 'relative inline-flex rounded-full h-2 w-2 ' + (kind === 'ok' ? 'bg-green-500' : kind === 'busy' ? 'bg-brand-300' : kind === 'err' ? 'bg-red-400' : 'bg-gray-500');
        }

        function showError(msg) {
            const panel = document.getElementById('errorPanel');
            const txt = document.getElementById('errorText');
            txt.textContent = msg;
            panel.classList.remove('hidden');
        }

        function hideError() {
            document.getElementById('errorPanel').classList.add('hidden');
        }

        async function resolveApiBase() {
            // config.js sets window.API_BASE for local dev; prefer it.
            if (typeof window.API_BASE === 'string' && window.API_BASE.trim()) {
                return window.API_BASE.replace(/\/$/, '');
            }

            // Fallbacks: prefer FastAPI default, never prefer the current (Live Server) origin.
            const candidates = ['http://0.0.0.0:10000', 'http://0.0.0.0:10000'];

            async function probe(base) {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 1000);
                try {
                    const r = await fetch(base + '/health', { signal: controller.signal });
                    return r.ok;
                } catch (_) {
                    return false;
                } finally {
                    clearTimeout(timeout);
                }
            }

            for (const base of candidates) {
                if (await probe(base)) return base;
            }

            return candidates[0];
        }

        function safeLower(v) {
            return (v == null ? '' : String(v)).toLowerCase();
        }

        function firstNonEmpty(...values) {
            for (const v of values) {
                if (v == null) continue;
                if (typeof v === 'number' && Number.isFinite(v)) return v;
                const s = String(v).trim();
                if (s) return s;
            }
            return '';
        }

        function normalizeInt(value, { min = null, max = null } = {}) {
            if (value == null || value === '') return null;
            const n = Number(value);
            if (!Number.isFinite(n)) return null;
            const out = Math.trunc(n);
            if (min != null && out < min) return null;
            if (max != null && out > max) return null;
            return out;
        }

        function initialsFrom(u) {
            const base = (u?.name || u?.email || '').trim();
            if (!base) return 'ME';
            const parts = base.split(/\s+/).filter(Boolean);
            const chars = parts.length ? parts : [base];
            return chars.map(p => (p[0] || '')).join('').slice(0, 2).toUpperCase() || 'ME';
        }

        function toBatchRange(u) {
            const firstEdu = Array.isArray(u?.education_entries) && u.education_entries.length ? u.education_entries[0] : null;
            const from = firstNonEmpty(u?.batch_from, u?.batch?.from, firstEdu?.batch?.from, firstEdu?.batch_from);
            const to = firstNonEmpty(u?.batch_to, u?.batch?.to, firstEdu?.batch?.to, firstEdu?.batch_to);
            const directRange = firstNonEmpty(u?.batch_range, u?.batchRange, u?.batch, firstEdu?.batch_range);
            if (directRange) return String(directRange);
            if (from && to) return `${from}-${to}`;
            return '—';
        }

        function resolveCurrentStreak(u) {
            const raw = firstNonEmpty(
                u?.current_streak,
                u?.streak_current,
                u?.streak_count_no,
                u?.streak_count,
                u?.streak_no,
                u?.streak,
                u?.streakCount
            );
            const n = normalizeInt(raw, { min: 0 });
            return n == null ? 0 : n;
        }

        function resolveUsageDaysCount(u) {
            const raw = firstNonEmpty(
                u?.usage_days_count,
                u?.usageDaysCount,
                u?.total_usage_days,
                u?.active_days_count
            );
            const n = normalizeInt(raw, { min: 0 });
            return n == null ? 0 : n;
        }

        function normalizeUserRecord(u) {
            const firstEdu = Array.isArray(u?.education_entries) && u.education_entries.length ? u.education_entries[0] : null;

            const college = firstNonEmpty(
                u?.college?.name,
                u?.college,
                u?.college_name,
                u?.clg_name,
                u?.college_id,
                firstEdu?.school,
                firstEdu?.college,
                firstEdu?.college_name
            );

            const department = firstNonEmpty(
                u?.department?.name,
                u?.department,
                u?.department_name,
                u?.dept,
                u?.dept_name,
                u?.department_id,
                firstEdu?.department,
                firstEdu?.department_name
            );

            const semester = normalizeInt(firstNonEmpty(
                u?.semester,
                u?.current_semester,
                u?.sem,
                u?.secm,
                u?.semester_no,
                firstEdu?.current_semester,
                firstEdu?.semester,
                firstEdu?.sem,
                firstEdu?.secm
            ), { min: 1, max: 12 });

            const regno = firstNonEmpty(
                u?.regno,
                u?.reg_no,
                u?.reg_number,
                u?.roll_no,
                u?.roll_number,
                u?.registration_no,
                u?.register_no,
                firstEdu?.regno,
                firstEdu?.reg_no,
                firstEdu?.reg_number
            );

            const section = firstNonEmpty(
                u?.section,
                u?.sec,
                u?.section_name,
                firstEdu?.section,
                firstEdu?.sec
            );

            const lastSeen = firstNonEmpty(
                u?.last_seen_at,
                u?.lastSeenAt,
                u?.last_login_at,
                u?.last_login
            );

            const currentStreak = resolveCurrentStreak(u);
            const usageDaysCount = resolveUsageDaysCount(u);

            return {
                ...u,
                college: college || '',
                department: department || '',
                semester,
                regno: regno || '',
                section: section || '',
                current_streak: currentStreak,
                streak_current: currentStreak,
                usage_days_count: usageDaysCount,
                batch_range: toBatchRange(u) !== '—' ? toBatchRange(u) : (u?.batch_range || ''),
                last_seen_at: lastSeen || null,
            };
        }

        function formatLastSeen(iso) {
            if (!iso) return '—';
            try {
                const d = new Date(iso);
                if (Number.isNaN(d.getTime())) return String(iso);
                return d.toLocaleString();
            } catch (_) {
                return String(iso);
            }
        }

        function withinDays(iso, days) {
            if (!days) return true;
            if (!iso) return false;
            const d = new Date(iso);
            const ms = d.getTime();
            if (Number.isNaN(ms)) return false;
            const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
            return ms >= cutoff;
        }

        function buildOptionList(selectEl, values) {
            const existing = new Set(Array.from(selectEl.options).map(o => o.value));
            const sorted = Array.from(values).filter(Boolean).sort((a, b) => String(a).localeCompare(String(b)));
            for (const v of sorted) {
                if (!existing.has(v)) {
                    const opt = document.createElement('option');
                    opt.value = v;
                    opt.textContent = v;
                    selectEl.appendChild(opt);
                }
            }
        }

        function renderUsers(users) {
            const tbody = document.getElementById('usersTbody');
            tbody.innerHTML = '';

            for (const u of users) {
                const tr = document.createElement('tr');
                tr.className = 'cursor-pointer';

                const hasImg = !!(u && u.profile_image_url);
                const img = hasImg ? u.profile_image_url : '';
                const init = initialsFrom(u);
                const name = u.name || '—';
                const email = u.email || '—';
                const regno = u.regno || '—';
                const college = u.college || '—';
                const dept = u.department || '—';
                const section = u.section || '—';
                const sem = (u.semester == null || u.semester === '') ? '—' : String(u.semester);
                const batch = toBatchRange(u);
                const role = u.role || 'student';
                const usageDays = resolveUsageDaysCount(u);
                const usageDaysLabel = `${usageDays} day${usageDays === 1 ? '' : 's'}`;
                const lastSeen = formatLastSeen(u.last_seen_at);

                                const avatarHtml = hasImg
                                        ? `<div class="relative h-11 w-11">
                                                 <img src="${img}" alt="" class="h-11 w-11 rounded-xl object-cover avatar-ring bg-neutral-200 dark:bg-white/10" onerror="this.style.display='none'; const s=this.parentElement && this.parentElement.querySelector('[data-initials]'); if(s){s.style.display='flex'}" />
                                                 <span data-initials style="display:none" class="absolute inset-0 items-center justify-center rounded-xl bg-neutral-200 dark:bg-white/10 text-xs font-semibold tracking-wide text-neutral-700 dark:text-white/70">${init}</span>
                                             </div>`
                                        : `<div class="relative h-11 w-11 rounded-xl avatar-ring bg-neutral-200 dark:bg-white/10 flex items-center justify-center text-xs font-semibold tracking-wide text-neutral-700 dark:text-white/70">${init}</div>`;

                                tr.innerHTML = `
          <td class="px-4 py-3 align-top">
            <div class="flex items-start gap-3">
                            ${avatarHtml}
              <div>
                                <div class="font-semibold leading-tight">${name}</div>
                                <div class="text-xs text-neutral-500 dark:text-white/45">${email}</div>
              </div>
            </div>
          </td>
          <td class="px-4 py-3 align-top">
                        <div class="text-sm font-medium">${college}</div>
                        <div class="text-xs text-neutral-500 dark:text-white/45">Reg: ${regno} · Dept: ${dept} · Sec: ${section} · Sem: ${sem} · Batch: ${batch}</div>
          </td>
          <td class="px-4 py-3 align-top">
                        <span class="inline-flex items-center rounded-full bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 px-3 py-1 text-xs font-semibold">${role}</span>
          </td>
          <td class="px-4 py-3 align-top">
                        <div class="flex flex-col items-start gap-1">
                            <span class="inline-flex items-center rounded-full bg-brand-500/10 dark:bg-brand-500/20 ring-1 ring-brand-500/20 px-3 py-1 text-xs font-semibold text-brand-700 dark:text-brand-300">${usageDaysLabel}</span>
                            <span class="text-[11px] text-neutral-500 dark:text-white/45">Distinct active days</span>
                        </div>
          </td>
                    <td class="px-4 py-3 align-top text-neutral-600 dark:text-white/60 text-xs">${lastSeen}</td>
        `;

                tr.addEventListener('click', () => {
                    try { openUserEduModal(u); } catch (_) { }
                });

                tbody.appendChild(tr);
            }

            document.getElementById('resultCount').textContent = String(users.length);
        }

        function getFilterState() {
            const role = document.getElementById('roleFilter').value;
            const collegeId = document.getElementById('collegeFilter').value;
            const dept = document.getElementById('deptFilter').value;
            const batch = document.getElementById('batchFilter').value;
            const sem = document.getElementById('semFilter').value;
            const streakMinRaw = document.getElementById('streakMin').value;
            const streakOverallMinRaw = document.getElementById('streakOverallMin').value;
            const lastLoginDaysRaw = document.getElementById('lastLoginFilter').value;
            const section = document.getElementById('sectionFilter').value;

            return {
                q: (document.getElementById('searchInput').value || '').trim(),
                role: (role || '').trim(),
                college_id: (collegeId || '').trim(),
                department: (dept || '').trim(),
                section: (section || '').trim(),
                batch_range: (batch || '').trim(),
                semester: (sem || '').trim(),
                min_streak: (streakMinRaw || '').trim(),
                min_streak_overall: (streakOverallMinRaw || '').trim(),
                last_login_days: (lastLoginDaysRaw || '').trim(),
                sort_by: usageSortMode ? 'usage_days_desc' : '',
            };
        }

        let apiBase = '';
        let allUsers = [];
        let fetchTimer = null;
        const pageSize = 50;
        const filteredPageSize = 2000;
        let currentOffset = 0;
        let hasMorePages = false;
        let filteredFetchAllMode = false;
        let usageSortMode = false;
        let collegesFilterLoaded = false;

        // ---------- Education modal logic ----------
        const EDUCATION_CUSTOM_VALUE = '__custom__';
        let __selectedUser = null;
        let __adminEduCollegesCache = [];
        let __adminEduCollegesLoadPromise = null;
        const __adminEduCollegeDetailCache = new Map();
        const __eduModalState = { collegeId: '', collegeDetails: null };

        function __eduEls() {
            return {
                modal: document.getElementById('userEduModal'),
                subtitle: document.getElementById('userEduSubtitle'),
                status: document.getElementById('userEduStatus'),
                collegeSelect: document.getElementById('eduCollegeSelect'),
                collegeCustom: document.getElementById('eduCollegeCustom'),
                degreeSelect: document.getElementById('eduDegreeSelect'),
                degreeCustom: document.getElementById('eduDegreeCustom'),
                deptSelect: document.getElementById('eduDeptSelect'),
                deptCustom: document.getElementById('eduDeptCustom'),
                batchSelect: document.getElementById('eduBatchSelect'),
                batchCustom: document.getElementById('eduBatchCustom'),
                sectionSelect: document.getElementById('eduSectionSelect'),
                semester: document.getElementById('eduSemester'),
                regno: document.getElementById('eduRegno'),
                saveBtn: document.getElementById('userEduSaveBtn'),
            };
        }

        function __adminEduFillSelectOptions(select, options, { placeholder = 'Select...', includeCustom = false } = {}) {
            if (!select) return;
            select.innerHTML = '';
            const placeholderOption = document.createElement('option');
            placeholderOption.value = '';
            placeholderOption.textContent = placeholder;
            select.appendChild(placeholderOption);
            (options || []).forEach(opt => {
                if (!opt) return;
                const option = document.createElement('option');
                option.value = opt.value;
                option.textContent = opt.label;
                select.appendChild(option);
            });
            if (includeCustom) {
                const customOption = document.createElement('option');
                customOption.value = EDUCATION_CUSTOM_VALUE;
                customOption.textContent = 'Other / Not listed';
                select.appendChild(customOption);
            }
        }

        function __adminEduToggleCustomInput(input, show) {
            if (!input) return;
            input.classList.toggle('hidden', !show);
        }

        function __adminEduGetSelectedLabel(select) {
            try {
                const opt = select?.options?.[select.selectedIndex];
                return (opt && opt.textContent) ? opt.textContent : '';
            } catch (_) {
                return '';
            }
        }

        function __adminEduFormatBatchRange(batch) {
            if (!batch) return '';
            const from = Number(batch.from ?? batch.from_year);
            const to = Number(batch.to ?? batch.to_year);
            if (Number.isFinite(from) && Number.isFinite(to)) return `${from}-${to}`;
            return '';
        }

        function __adminEduFindByName(items, name, { key = 'name', normalize = s => String(s || '').trim().toLowerCase() } = {}) {
            if (!Array.isArray(items) || !name) return null;
            const target = normalize(name);
            if (!target) return null;
            return items.find(it => normalize(it?.[key]) === target) || null;
        }

        async function __adminEduLoadCollegesList() {
            if (__adminEduCollegesCache.length) return __adminEduCollegesCache;
            if (!__adminEduCollegesLoadPromise) {
                __adminEduCollegesLoadPromise = fetch(`${apiBase}/api/colleges`)
                    .then(res => (res.ok ? res.json() : []))
                    .catch(() => [])
                    .then(items => {
                        __adminEduCollegesCache = Array.isArray(items)
                            ? items
                                .filter(col => col && col.id && col.name)
                                .map(col => ({ id: String(col.id), name: col.name }))
                            : [];
                        return __adminEduCollegesCache;
                    });
            }
            return __adminEduCollegesLoadPromise;
        }

        async function __adminEduLoadCollegeDetails(collegeId) {
            if (!collegeId) return null;
            const key = String(collegeId);
            if (__adminEduCollegeDetailCache.has(key)) return __adminEduCollegeDetailCache.get(key);
            try {
                const res = await fetch(`${apiBase}/api/colleges/${key}`);
                if (!res.ok) throw new Error(`status ${res.status}`);
                const data = await res.json();
                __adminEduCollegeDetailCache.set(key, data);
                return data;
            } catch (_) {
                __adminEduCollegeDetailCache.set(key, null);
                return null;
            }
        }

        function __adminEduGetDepartmentsForDegree(details, degreeId) {
            if (!details) return [];
            const degrees = Array.isArray(details.degrees) ? details.degrees : [];
            const matchDeg = degrees.find(d => String(d?.id || '') === String(degreeId));
            if (matchDeg && Array.isArray(matchDeg.departments)) return matchDeg.departments;
            const deps = Array.isArray(details.departments) ? details.departments : [];
            if (!degreeId) return deps;
            return deps.filter(dep => String(dep?.degree_id || '') === String(degreeId));
        }

        function __adminEduGetBatchesForDepartment(details, departmentId) {
            if (!details) return [];
            const batches = Array.isArray(details.batches) ? details.batches : [];
            if (!departmentId) return batches;
            const anyHasDept = batches.some(b => b && (b.department_id || b.departmentId));
            if (!anyHasDept) return batches;
            return batches.filter(b => String(b?.department_id || b?.departmentId || '') === String(departmentId));
        }

        function __adminEduEnsureSections() {
            const { sectionSelect } = __eduEls();
            if (!sectionSelect) return;
            if (sectionSelect.options && sectionSelect.options.length > 1) return;
            'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(ch => {
                const opt = document.createElement('option');
                opt.value = ch;
                opt.textContent = ch;
                sectionSelect.appendChild(opt);
            });
        }

        async function __adminEduHandleCollegeChange(isInitial = false) {
            const els = __eduEls();
            if (!els.collegeSelect) return;
            const selected = els.collegeSelect.value;
            const isCustom = selected === EDUCATION_CUSTOM_VALUE;
            __eduModalState.collegeId = isCustom ? '' : selected;
            __eduModalState.collegeDetails = null;

            __adminEduToggleCustomInput(els.collegeCustom, isCustom);
            if (isCustom) {
                els.degreeSelect.disabled = false;
                els.deptSelect.disabled = false;
                els.batchSelect.disabled = false;
                __adminEduFillSelectOptions(els.degreeSelect, [], { placeholder: 'Select degree', includeCustom: true });
                __adminEduFillSelectOptions(els.deptSelect, [], { placeholder: 'Select department', includeCustom: true });
                __adminEduFillSelectOptions(els.batchSelect, [], { placeholder: 'Select batch', includeCustom: true });

                els.degreeSelect.value = EDUCATION_CUSTOM_VALUE;
                els.deptSelect.value = EDUCATION_CUSTOM_VALUE;
                els.batchSelect.value = EDUCATION_CUSTOM_VALUE;
                __adminEduToggleCustomInput(els.degreeCustom, true);
                __adminEduToggleCustomInput(els.deptCustom, true);
                __adminEduToggleCustomInput(els.batchCustom, true);
                if (isInitial && __selectedUser) {
                    if (__selectedUser.degree && els.degreeCustom) els.degreeCustom.value = __selectedUser.degree;
                    if (__selectedUser.department && els.deptCustom) els.deptCustom.value = __selectedUser.department;
                    if (__selectedUser.batch_range && els.batchCustom) els.batchCustom.value = __selectedUser.batch_range;
                }
                return;
            }

            __adminEduToggleCustomInput(els.degreeCustom, false);
            __adminEduToggleCustomInput(els.deptCustom, false);
            __adminEduToggleCustomInput(els.batchCustom, false);

            els.degreeSelect.disabled = true;
            els.deptSelect.disabled = true;
            els.batchSelect.disabled = true;
            __adminEduFillSelectOptions(els.degreeSelect, [], { placeholder: 'Loading…', includeCustom: true });
            __adminEduFillSelectOptions(els.deptSelect, [], { placeholder: 'Select department', includeCustom: true });
            __adminEduFillSelectOptions(els.batchSelect, [], { placeholder: 'Select batch', includeCustom: true });

            const details = await __adminEduLoadCollegeDetails(selected);
            __eduModalState.collegeDetails = details;
            const degrees = Array.isArray(details?.degrees) ? details.degrees : [];
            const degreeOptions = degrees
                .filter(d => d && d.id && d.name)
                .map(d => ({ value: String(d.id), label: d.name }));
            els.degreeSelect.disabled = false;
            __adminEduFillSelectOptions(els.degreeSelect, degreeOptions, { placeholder: 'Select degree', includeCustom: true });

            if (isInitial && __selectedUser?.degree) {
                const match = __adminEduFindByName(degrees, __selectedUser.degree, { normalize: s => String(s || '').trim().toLowerCase() });
                if (match) {
                    els.degreeSelect.value = String(match.id);
                } else {
                    els.degreeSelect.value = EDUCATION_CUSTOM_VALUE;
                    __adminEduToggleCustomInput(els.degreeCustom, true);
                    if (els.degreeCustom) els.degreeCustom.value = __selectedUser.degree;
                }
            }

            await __adminEduHandleDegreeChange(isInitial);
        }

        async function __adminEduHandleDegreeChange(isInitial = false) {
            const els = __eduEls();
            const details = __eduModalState.collegeDetails;
            if (!els.degreeSelect || !els.deptSelect) return;

            const selected = els.degreeSelect.value;
            const isCustom = selected === EDUCATION_CUSTOM_VALUE;
            __adminEduToggleCustomInput(els.degreeCustom, isCustom);
            if (isCustom) {
                els.deptSelect.disabled = false;
                __adminEduFillSelectOptions(els.deptSelect, [], { placeholder: 'Select department', includeCustom: true });
                els.deptSelect.value = EDUCATION_CUSTOM_VALUE;
                __adminEduToggleCustomInput(els.deptCustom, true);
                if (isInitial && __selectedUser?.department && els.deptCustom) els.deptCustom.value = __selectedUser.department;
                await __adminEduHandleDepartmentChange(isInitial);
                return;
            }

            __adminEduToggleCustomInput(els.deptCustom, false);
            const departments = __adminEduGetDepartmentsForDegree(details, selected);
            const deptOptions = (departments || [])
                .filter(d => d && d.id && d.name)
                .map(d => ({ value: String(d.id), label: d.name }));

            els.deptSelect.disabled = false;
            __adminEduFillSelectOptions(els.deptSelect, deptOptions, { placeholder: 'Select department', includeCustom: true });

            if (isInitial && __selectedUser?.department) {
                const match = __adminEduFindByName(departments, __selectedUser.department, { normalize: s => String(s || '').trim().toUpperCase() });
                if (match) {
                    els.deptSelect.value = String(match.id);
                } else {
                    els.deptSelect.value = EDUCATION_CUSTOM_VALUE;
                    __adminEduToggleCustomInput(els.deptCustom, true);
                    if (els.deptCustom) els.deptCustom.value = __selectedUser.department;
                }
            }

            await __adminEduHandleDepartmentChange(isInitial);
        }

        async function __adminEduHandleDepartmentChange(isInitial = false) {
            const els = __eduEls();
            const details = __eduModalState.collegeDetails;
            if (!els.batchSelect) return;

            const depSelected = els.deptSelect?.value || '';
            const depIsCustom = depSelected === EDUCATION_CUSTOM_VALUE;
            __adminEduToggleCustomInput(els.deptCustom, depIsCustom);

            const batches = __adminEduGetBatchesForDepartment(details, depIsCustom ? '' : depSelected);
            const batchOptions = (batches || [])
                .map(b => ({ value: __adminEduFormatBatchRange(b), label: __adminEduFormatBatchRange(b) }))
                .filter(opt => opt.value);

            els.batchSelect.disabled = false;
            __adminEduFillSelectOptions(els.batchSelect, batchOptions, { placeholder: 'Select batch', includeCustom: true });

            if (isInitial && __selectedUser) {
                const desired = (__selectedUser.batch_range || ((__selectedUser.batch_from && __selectedUser.batch_to) ? `${__selectedUser.batch_from}-${__selectedUser.batch_to}` : ''));
                if (desired && batchOptions.some(o => o.value === desired)) {
                    els.batchSelect.value = desired;
                    __adminEduToggleCustomInput(els.batchCustom, false);
                } else if (desired) {
                    els.batchSelect.value = EDUCATION_CUSTOM_VALUE;
                    __adminEduToggleCustomInput(els.batchCustom, true);
                    if (els.batchCustom) els.batchCustom.value = desired;
                }
            }

            __adminEduToggleCustomInput(els.batchCustom, els.batchSelect.value === EDUCATION_CUSTOM_VALUE);
        }

        function __adminEduHandleBatchChange() {
            const els = __eduEls();
            __adminEduToggleCustomInput(els.batchCustom, els.batchSelect?.value === EDUCATION_CUSTOM_VALUE);
        }

        function __eduShowStatus(msg, ok) {
            const { status } = __eduEls();
            if (!status) return;
            status.classList.remove('hidden');
            status.textContent = msg;
            status.classList.toggle('border-red-300', !ok);
            status.classList.toggle('text-red-700', !ok);
            status.classList.toggle('dark:border-red-500/30', !ok);
            status.classList.toggle('dark:text-red-200', !ok);
            status.classList.toggle('border-emerald-300', ok);
            status.classList.toggle('text-emerald-700', ok);
            status.classList.toggle('dark:border-emerald-500/30', ok);
            status.classList.toggle('dark:text-emerald-200', ok);
        }

        function __eduHideStatus() {
            const { status } = __eduEls();
            if (!status) return;
            status.classList.add('hidden');
        }

        function openUserEduModal(u) {
            const els = __eduEls();
            if (!els.modal) return;
            __selectedUser = u;
            __eduHideStatus();
            const name = u?.name || '—';
            const email = u?.email || '—';
            const uid = u?.user_id || u?.auth_user_id || '';
            if (els.subtitle) els.subtitle.textContent = `${name} · ${email}${uid ? ' · ' + uid : ''}`;

            __adminEduEnsureSections();
            if (els.sectionSelect) els.sectionSelect.value = u?.section || '';
            els.semester.value = (u?.semester == null ? '' : String(u.semester));
            els.regno.value = u?.regno || '';

            // Populate cascading selects (async)
            (async () => {
                try {
                    const colleges = await __adminEduLoadCollegesList().catch(() => []);
                    const collegeOptions = (colleges || []).map(col => ({ value: col.id, label: col.name }));
                    __adminEduFillSelectOptions(els.collegeSelect, collegeOptions, { placeholder: 'Select college', includeCustom: true });

                    if (u?.college) {
                        const match = __adminEduFindByName(colleges, u.college, { normalize: s => String(s || '').trim().toLowerCase() });
                        if (match) {
                            els.collegeSelect.value = String(match.id);
                            __adminEduToggleCustomInput(els.collegeCustom, false);
                        } else {
                            els.collegeSelect.value = EDUCATION_CUSTOM_VALUE;
                            __adminEduToggleCustomInput(els.collegeCustom, true);
                            if (els.collegeCustom) els.collegeCustom.value = u.college;
                        }
                    }

                    await __adminEduHandleCollegeChange(true);
                } catch (_) {
                    // Best effort; keep modal usable
                }
            })();

            els.modal.classList.remove('hidden');
            document.body.classList.add('overflow-hidden');
        }

        function closeUserEduModal() {
            const { modal } = __eduEls();
            if (!modal) return;
            modal.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
            __selectedUser = null;
            __eduHideStatus();
        }

        async function saveUserEduModal() {
            const els = __eduEls();
            const u = __selectedUser;
            if (!u) return;
            const authUserId = u.user_id || u.auth_user_id;
            if (!authUserId) {
                __eduShowStatus('Missing user id; cannot update.', false);
                return;
            }
            const token = getToken();
            if (!token) {
                __eduShowStatus('Missing token. Please login again.', false);
                return;
            }

            const collegeId = (els.collegeSelect?.value || '').trim();
            const collegeIsCustom = collegeId === EDUCATION_CUSTOM_VALUE;
            const collegeName = collegeIsCustom
                ? (els.collegeCustom?.value || '').trim()
                : (collegeId ? (__adminEduGetSelectedLabel(els.collegeSelect) || '').trim() : '');

            const degreeId = (els.degreeSelect?.value || '').trim();
            const degreeIsCustom = degreeId === EDUCATION_CUSTOM_VALUE;
            const degreeName = degreeIsCustom
                ? (els.degreeCustom?.value || '').trim()
                : (degreeId ? (__adminEduGetSelectedLabel(els.degreeSelect) || '').trim() : '');

            const deptId = (els.deptSelect?.value || '').trim();
            const deptIsCustom = deptId === EDUCATION_CUSTOM_VALUE;
            const deptName = deptIsCustom
                ? (els.deptCustom?.value || '').trim()
                : (deptId ? (__adminEduGetSelectedLabel(els.deptSelect) || '').trim() : '');

            const batchVal = (els.batchSelect?.value || '').trim();
            const batchIsCustom = batchVal === EDUCATION_CUSTOM_VALUE;
            const batchRange = batchIsCustom ? (els.batchCustom?.value || '').trim() : (batchVal || '');

            const section = (els.sectionSelect?.value || '').trim();
            const regno = (els.regno.value || '').trim();
            const semRaw = (els.semester.value || '').trim();

            const semester = semRaw ? parseInt(semRaw, 10) : null;
            let batch_from = null;
            let batch_to = null;
            if (batchRange && String(batchRange).includes('-')) {
                const parts = String(batchRange).split('-', 2);
                const bf = parseInt(parts[0], 10);
                const bt = parseInt(parts[1], 10);
                if (Number.isFinite(bf) && Number.isFinite(bt)) {
                    batch_from = bf;
                    batch_to = bt;
                }
            }

            if (semRaw && (!Number.isFinite(semester) || semester < 1 || semester > 12)) {
                __eduShowStatus('Semester must be between 1 and 12.', false);
                return;
            }
            if (batchRange && !(Number.isFinite(batch_from) && Number.isFinite(batch_to))) {
                __eduShowStatus('Batch must look like 2022-2026.', false);
                return;
            }

            const payload = {
                college_id: (!collegeIsCustom && collegeId && collegeId !== '') ? collegeId : null,
                college_name: collegeName || null,
                degree_id: (!degreeIsCustom && degreeId && degreeId !== '') ? degreeId : null,
                degree_name: degreeName || null,
                department_id: (!deptIsCustom && deptId && deptId !== '') ? deptId : null,
                department_name: deptName || null,
                section: section || null,
                semester: Number.isFinite(semester) ? semester : null,
                regno: regno || null,
                batch_range: batchRange || null,
                batch_from: Number.isFinite(batch_from) ? batch_from : null,
                batch_to: Number.isFinite(batch_to) ? batch_to : null,
            };

            els.saveBtn.disabled = true;
            els.saveBtn.classList.add('opacity-70');
            __eduShowStatus('Saving…', true);
            try {
                const res = await fetch(`${apiBase}/api/admin/users/${encodeURIComponent(authUserId)}/academic`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                    body: JSON.stringify(payload)
                });
                const out = await res.json().catch(() => ({}));
                if (!res.ok) {
                    __eduShowStatus(out?.detail || ('Failed to save (HTTP ' + res.status + ')'), false);
                    return;
                }

                // Update the cached row locally for immediate UI feedback
                u.college = collegeName || u.college;
                u.degree = degreeName || u.degree;
                u.department = deptName || u.department;
                u.section = section || u.section;
                u.semester = Number.isFinite(semester) ? semester : u.semester;
                u.regno = regno;
                u.batch_from = Number.isFinite(batch_from) ? batch_from : u.batch_from;
                u.batch_to = Number.isFinite(batch_to) ? batch_to : u.batch_to;
                u.batch_range = (Number.isFinite(batch_from) && Number.isFinite(batch_to)) ? `${batch_from}-${batch_to}` : (u.batch_range || '—');

                __eduShowStatus('Saved!', true);
                rerender();
                setTimeout(() => closeUserEduModal(), 350);
            } catch (e) {
                __eduShowStatus('Failed to save. Please try again.', false);
            } finally {
                els.saveBtn.disabled = false;
                els.saveBtn.classList.remove('opacity-70');
            }
        }

        async function adminSelfCheck() {
            const token = getToken();
            if (!token) {
                showError('Missing token. Please login first.');
                return false;
            }
            try {
                const r = await fetch(apiBase + '/api/admin/self-check', {
                    headers: { 'Authorization': 'Bearer ' + token }
                });
                if (!r.ok) {
                    const t = await r.text();
                    showError('Not authorized to view this page. ' + (t || ''));
                    return false;
                }
                return true;
            } catch (e) {
                showError('Failed to contact server for admin check.');
                return false;
            }
        }

        function hasActiveFilters(st) {
            return !!(
                st.q ||
                st.role ||
                st.college_id ||
                st.department ||
                st.section ||
                st.batch_range ||
                st.semester ||
                st.min_streak ||
                st.min_streak_overall ||
                st.last_login_days ||
                st.sort_by
            );
        }

        async function fetchUsersPage(st, offset, limit) {
            const token = getToken();
            const url = new URL(apiBase + '/api/admin/users');
            url.searchParams.set('limit', String(limit));
            url.searchParams.set('offset', String(offset));
            if (st.q) url.searchParams.set('q', st.q);
            if (st.role) url.searchParams.set('role', st.role);
            if (st.college_id) url.searchParams.set('college_id', st.college_id);
            if (st.department) url.searchParams.set('department', st.department);
            if (st.section) url.searchParams.set('section', st.section);
            if (st.batch_range) url.searchParams.set('batch_range', st.batch_range);
            if (st.semester) url.searchParams.set('semester', st.semester);
            if (st.min_streak) url.searchParams.set('min_streak', st.min_streak);
            if (st.min_streak_overall) url.searchParams.set('min_streak_overall', st.min_streak_overall);
            if (st.last_login_days) url.searchParams.set('last_login_days', st.last_login_days);
            if (st.sort_by) url.searchParams.set('sort_by', st.sort_by);

            const res = await fetch(url.toString(), {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!res.ok) {
                const t = await res.text();
                throw new Error(t || ('HTTP ' + res.status));
            }
            const data = await res.json();
            const users = (data && data.users) ? data.users : [];
            return {
                users,
                hasMore: !!(data && data.has_more),
                count: Number((data && data.count) || 0)
            };
        }

        async function fetchUsers() {
            hideError();
            setStatus('busy', 'Loading');

            const st = getFilterState();
            filteredFetchAllMode = hasActiveFilters(st);

            if (!filteredFetchAllMode) {
                const page = await fetchUsersPage(st, currentOffset, pageSize);
                hasMorePages = page.hasMore;
                return page.users.map(normalizeUserRecord);
            }

            const all = [];
            const seen = new Set();

            const addRows = (rows, baseOffset = 0) => {
                (rows || []).forEach((raw, index) => {
                    const key = String(
                        raw?.profile_id ||
                        raw?.user_id ||
                        raw?.email ||
                        `row-${baseOffset + index}`
                    );
                    if (seen.has(key)) return;
                    seen.add(key);
                    all.push(raw);
                });
            };

            const firstPage = await fetchUsersPage(st, 0, filteredPageSize);
            addRows(firstPage.users, 0);

            const totalCount = Number.isFinite(firstPage.count) ? firstPage.count : all.length;
            if (firstPage.hasMore) {
                let fetchOffset = filteredPageSize;
                let safety = 0;
                while (fetchOffset < totalCount) {
                    const page = await fetchUsersPage(st, fetchOffset, filteredPageSize);
                    addRows(page.users, fetchOffset);
                    if (!page.hasMore) break;
                    fetchOffset += filteredPageSize;
                    safety += 1;
                    if (safety > 50) break;
                }
            }

            hasMorePages = false;
            currentOffset = 0;
            return all.map(normalizeUserRecord);
        }

        function rebuildFacetOptions(users) {
            const depts = new Set();
            const batches = new Set();
            const sections = new Set();
            for (const u of users || []) {
                if (u.department) depts.add(u.department);
                const br = toBatchRange(u);
                if (br && br !== '—') batches.add(br);
                if (u.section) sections.add(u.section);
            }
            buildOptionList(document.getElementById('deptFilter'), depts);
            buildOptionList(document.getElementById('batchFilter'), batches);
            buildOptionList(document.getElementById('sectionFilter'), sections);
        }

        async function loadCollegeFilterOptions() {
            if (collegesFilterLoaded) return;
            const select = document.getElementById('collegeFilter');
            try {
                const res = await fetch(`${apiBase}/api/colleges`);
                if (!res.ok) return;
                const colleges = await res.json();
                if (!Array.isArray(colleges)) return;

                const existing = new Set(Array.from(select.options).map(o => o.value));
                const rows = colleges
                    .filter(c => c && c.id && c.name)
                    .map(c => ({ id: String(c.id), name: String(c.name) }))
                    .sort((a, b) => a.name.localeCompare(b.name));

                for (const c of rows) {
                    if (existing.has(c.id)) continue;
                    const opt = document.createElement('option');
                    opt.value = c.id;
                    opt.textContent = c.name;
                    select.appendChild(opt);
                }
                collegesFilterLoaded = true;
            } catch (_) {
                // keep page usable if college list fails
            }
        }

        function rerender() {
            renderUsers(allUsers);
            const pageInfo = document.getElementById('pageInfo');
            const nextBtn = document.getElementById('nextPageBtn');
            if (filteredFetchAllMode) {
                pageInfo.textContent = `Showing all ${allUsers.length}`;
                nextBtn.disabled = true;
                nextBtn.classList.add('hidden');
            } else {
                const shownStart = allUsers.length ? (currentOffset + 1) : 0;
                const shownEnd = currentOffset + allUsers.length;
                pageInfo.textContent = allUsers.length ? `Showing ${shownStart}-${shownEnd}` : 'Showing 0';
                nextBtn.disabled = !hasMorePages;
                nextBtn.classList.remove('hidden');
            }
            setStatus('ok', 'Ready');
        }

        async function loadCurrentPage() {
            allUsers = await fetchUsers();
            rebuildFacetOptions(allUsers);
            rerender();
        }

        function scheduleRefetch() {
            if (fetchTimer) clearTimeout(fetchTimer);
            fetchTimer = setTimeout(async () => {
                try {
                    currentOffset = 0;
                    await loadCurrentPage();
                } catch (e) {
                    setStatus('err', 'Error');
                    showError('Failed to load users: ' + (e && e.message ? e.message : String(e)));
                }
            }, 300);
        }

        async function init() {
            apiBase = await resolveApiBase();
            const ok = await adminSelfCheck();
            if (!ok) return;

            try {
                await loadCollegeFilterOptions();
                await loadCurrentPage();
            } catch (e) {
                setStatus('err', 'Error');
                showError('Failed to load users: ' + (e && e.message ? e.message : String(e)));
                return;
            }

            document.getElementById('searchInput').addEventListener('input', scheduleRefetch);
            document.getElementById('refreshBtn').addEventListener('click', () => scheduleRefetch());
            document.getElementById('usersBtn').addEventListener('click', () => {
                usageSortMode = true;
                currentOffset = 0;
                scheduleRefetch();
            });
            document.getElementById('nextPageBtn').addEventListener('click', async () => {
                if (!hasMorePages) return;
                currentOffset += pageSize;
                try {
                    await loadCurrentPage();
                } catch (e) {
                    setStatus('err', 'Error');
                    showError('Failed to load users: ' + (e && e.message ? e.message : String(e)));
                }
            });

            const filters = ['roleFilter', 'collegeFilter', 'deptFilter', 'sectionFilter', 'batchFilter', 'semFilter', 'streakMin', 'streakOverallMin', 'lastLoginFilter'];
            for (const id of filters) {
                document.getElementById(id).addEventListener('change', scheduleRefetch);
                if (id === 'streakMin' || id === 'streakOverallMin') document.getElementById(id).addEventListener('input', scheduleRefetch);
            }

            document.getElementById('clearBtn').addEventListener('click', () => {
                document.getElementById('searchInput').value = '';
                document.getElementById('roleFilter').value = '';
                document.getElementById('collegeFilter').value = '';
                document.getElementById('deptFilter').value = '';
                document.getElementById('sectionFilter').value = '';
                document.getElementById('batchFilter').value = '';
                document.getElementById('semFilter').value = '';
                document.getElementById('streakMin').value = '';
                document.getElementById('streakOverallMin').value = '';
                document.getElementById('lastLoginFilter').value = '';
                usageSortMode = false;
                scheduleRefetch();
            });

            // Modal bindings
            document.querySelectorAll('[data-edu-close]').forEach(el => el.addEventListener('click', closeUserEduModal));
            document.getElementById('userEduSaveBtn').addEventListener('click', saveUserEduModal);
            document.getElementById('eduCollegeSelect')?.addEventListener('change', () => __adminEduHandleCollegeChange(false));
            document.getElementById('eduDegreeSelect')?.addEventListener('change', () => __adminEduHandleDegreeChange(false));
            document.getElementById('eduDeptSelect')?.addEventListener('change', () => __adminEduHandleDepartmentChange(false));
            document.getElementById('eduBatchSelect')?.addEventListener('change', __adminEduHandleBatchChange);
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') closeUserEduModal();
            });

            // Theme toggle
            const themeBtn = document.getElementById('themeToggle');
            if (themeBtn) {
                const sync = () => {
                    const dark = document.documentElement.classList.contains('dark');
                    themeBtn.textContent = dark ? 'light_mode' : 'dark_mode';
                };
                sync();
                themeBtn.addEventListener('click', () => {
                    const root = document.documentElement;
                    const dark = root.classList.toggle('dark');
                    try { localStorage.setItem('px_theme', dark ? 'dark' : 'light'); } catch (_) { }
                    sync();
                });
            }
        }

        init();
