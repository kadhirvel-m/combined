// Extracted from ui/profile_edit.html (inline <script> #2).
        const apiBase = (window.API_BASE || 'http://0.0.0.0:10000').replace(/\/$/, '');
        function getToken() { try { return localStorage.getItem('px_token'); } catch { return null; } }
        function authHeaders() { const t = getToken(); return t ? { 'Authorization': `Bearer ${t}` } : {}; }
        function initials(name) { if (!name) return 'U'; const p = String(name).trim().split(/\s+/).slice(0, 2); return p.map(x => x[0]?.toUpperCase()).join('') || 'U'; }

        const experienceList = document.getElementById('experienceList');
        const educationList = document.getElementById('educationList');
        const certificationList = document.getElementById('certificationList');
        const portfolioList = document.getElementById('portfolioList');
        const publicationList = document.getElementById('publicationList');

        const experienceTemplate = document.getElementById('experienceTemplate');
        const experienceMediaTemplate = document.getElementById('experienceMediaTemplate');
        const educationTemplate = document.getElementById('educationTemplate');
        const certificationTemplate = document.getElementById('certificationTemplate');
        const portfolioTemplate = document.getElementById('portfolioTemplate');
        const publicationTemplate = document.getElementById('publicationTemplate');

        const EDUCATION_CUSTOM_VALUE = '__custom__';
        let collegesCache = [];
        let collegesLoadPromise = null;
        const collegeDetailCache = new Map();

        function setAvatar(initialsText, imageUrl) {
            const initialsEl = document.getElementById('avatarInitials');
            const imgEl = document.getElementById('avatarImg');
            if (initialsEl) initialsEl.textContent = initialsText || 'U';
            if (!imgEl) return;
            if (imageUrl) {
                imgEl.src = imageUrl;
                imgEl.classList.remove('hidden');
                if (initialsEl) initialsEl.classList.add('hidden');
            } else {
                imgEl.removeAttribute('src');
                imgEl.classList.add('hidden');
                if (initialsEl) initialsEl.classList.remove('hidden');
            }
        }

        async function uploadProfileAsset(kind, file) {
            const fd = new FormData();
            fd.append('kind', kind);
            fd.append('file', file);
            const res = await fetch(`${apiBase}/api/profile/upload`, {
                method: 'POST',
                headers: authHeaders(),
                body: fd,
            });
            const out = await res.json().catch(() => ({}));
            return { ok: res.ok, out };
        }

        async function loadCollegesList() {
            if (collegesCache.length) return collegesCache;
            if (!collegesLoadPromise) {
                collegesLoadPromise = fetch(`${apiBase}/api/colleges`, { headers: authHeaders() })
                    .then(res => (res.ok ? res.json() : []))
                    .catch(err => {
                        console.error('Failed to load colleges', err);
                        return [];
                    })
                    .then(items => {
                        collegesCache = Array.isArray(items)
                            ? items
                                .filter(col => col && col.id && col.name)
                                .map(col => ({ id: String(col.id), name: col.name }))
                            : [];
                        return collegesCache;
                    });
            }
            return collegesLoadPromise;
        }

        function getCollegeById(id) {
            if (!id) return null;
            return collegesCache.find(col => String(col.id) === String(id)) || null;
        }

        function findCollegeByName(name) {
            if (!name) return null;
            const target = String(name).trim().toLowerCase();
            if (!target) return null;
            return collegesCache.find(col => String(col?.name || '').trim().toLowerCase() === target) || null;
        }

        async function loadCollegeDetails(collegeId) {
            if (!collegeId) return null;
            const key = String(collegeId);
            if (collegeDetailCache.has(key)) {
                return collegeDetailCache.get(key);
            }
            try {
                const res = await fetch(`${apiBase}/api/colleges/${key}`, { headers: authHeaders() });
                if (!res.ok) throw new Error(`status ${res.status}`);
                const data = await res.json();
                collegeDetailCache.set(key, data);
                return data;
            } catch (err) {
                console.error('Failed to load college details', err);
                collegeDetailCache.set(key, null);
                return null;
            }
        }

        function findDegreeByName(degrees, name) {
            if (!Array.isArray(degrees) || !name) return null;
            const target = String(name).trim().toLowerCase();
            if (!target) return null;
            return degrees.find(deg => String(deg?.name || '').trim().toLowerCase() === target) || null;
        }

        function findDepartmentByName(departments, name) {
            if (!Array.isArray(departments) || !name) return null;
            const target = String(name).trim().toUpperCase();
            if (!target) return null;
            return departments.find(dep => String(dep?.name || '').trim().toUpperCase() === target) || null;
        }

        function formatBatchRange(batch) {
            if (!batch) return '';
            const from = Number(batch.from ?? batch.from_year);
            const to = Number(batch.to ?? batch.to_year);
            if (Number.isFinite(from) && Number.isFinite(to)) {
                return `${from}-${to}`;
            }
            return '';
        }

        function fillSelectOptions(select, options, { placeholder = 'Select...', includeCustom = false } = {}) {
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

        function toggleCustomInput(input, show) {
            if (!input) return;
            if (show) {
                input.classList.remove('hidden');
            } else {
                input.classList.add('hidden');
            }
        }


        const addExperienceBtn = document.getElementById('addExperienceBtn');
        const addEducationBtn = document.getElementById('addEducationBtn');
        const addCertificationBtn = document.getElementById('addCertificationBtn');
        const addPortfolioBtn = document.getElementById('addPortfolioBtn');
        const addPublicationBtn = document.getElementById('addPublicationBtn');


        const parseList = (value) => (value || '').split(',').map(s => s.trim()).filter(Boolean);

        const createFromTemplate = (template) => template ? template.content.firstElementChild.cloneNode(true) : null;

        const toggleDisabled = (input, disabled) => {
            if (!input) return;
            if (disabled) {
                input.value = '';
                input.disabled = true;
                input.classList.add('opacity-60');
            } else {
                input.disabled = false;
                input.classList.remove('opacity-60');
            }
        };

        const addExperienceMedia = (container, data = {}) => {
            if (!experienceMediaTemplate || !container) return;
            const node = createFromTemplate(experienceMediaTemplate);
            if (!node) return;
            node.querySelector('input[name="media_title"]').value = data.title || '';
            node.querySelector('input[name="media_url"]').value = data.url || '';
            node.querySelector('select[name="media_kind"]').value = data.kind || 'link';
            node.querySelector('.removeMedia')?.addEventListener('click', () => node.remove());
            container.appendChild(node);
        };

        const addExperienceRow = (data = {}) => {
            if (!experienceTemplate || !experienceList) return;
            const node = createFromTemplate(experienceTemplate);
            if (!node) return;
            node.querySelector('input[name="exp_id"]').value = data.id || '';
            node.querySelector('input[name="exp_title"]').value = data.title || '';
            node.querySelector('select[name="exp_employment_type"]').value = data.employment_type || '';
            node.querySelector('input[name="exp_company"]').value = data.company || '';
            node.querySelector('input[name="exp_company_logo"]').value = data.company_logo_url || '';
            node.querySelector('input[name="exp_location"]').value = data.location || '';
            node.querySelector('select[name="exp_location_type"]').value = data.location_type || '';
            node.querySelector('input[name="exp_start_date"]').value = data.start_date || '';
            node.querySelector('input[name="exp_end_date"]').value = data.end_date || '';
            node.querySelector('textarea[name="exp_description"]').value = data.description || '';
            const current = node.querySelector('input[name="exp_current"]');
            current.checked = Boolean(data.is_current);
            const endInput = node.querySelector('input[name="exp_end_date"]');
            const toggle = () => toggleDisabled(endInput, current.checked);
            current.addEventListener('change', toggle);
            toggle();
            const mediaWrap = node.querySelector('[data-media-list]');
            (Array.isArray(data.media) ? data.media : []).forEach(item => addExperienceMedia(mediaWrap, item));
            node.querySelector('.addExperienceMedia')?.addEventListener('click', () => addExperienceMedia(mediaWrap));
            node.querySelector('.removeEntry')?.addEventListener('click', () => { node.remove(); refreshAssociations(); });
            experienceList.appendChild(node);
        };


        const initializeEducationRow = async (row, data = {}) => {
            const hiddenSchool = row.querySelector('input[name="edu_school"]');
            const hiddenDegree = row.querySelector('input[name="edu_degree"]');
            const hiddenDepartment = row.querySelector('input[name="edu_department"]');
            const hiddenBatch = row.querySelector('input[name="edu_batch_range"]');
            const hiddenCollegeId = row.querySelector('input[name="edu_college_id"]');
            const hiddenDegreeId = row.querySelector('input[name="edu_degree_id"]');
            const hiddenDepartmentId = row.querySelector('input[name="edu_department_id"]');
            const hiddenBatchId = row.querySelector('input[name="edu_batch_id"]');
            const sectionSelect = row.querySelector('select[name="edu_section"]');

            const collegeSelect = row.querySelector('[data-role="edu-college"]');
            const collegeCustomInput = row.querySelector('[data-role="edu-college-custom"]');
            const degreeSelect = row.querySelector('[data-role="edu-degree"]');
            const degreeCustomInput = row.querySelector('[data-role="edu-degree-custom"]');
            const departmentSelect = row.querySelector('[data-role="edu-department"]');
            const departmentCustomInput = row.querySelector('[data-role="edu-department-custom"]');
            const batchSelect = row.querySelector('[data-role="edu-batch"]');
            const batchCustomInput = row.querySelector('[data-role="edu-batch-custom"]');

            if (!collegeSelect || !degreeSelect || !departmentSelect || !batchSelect) {
                return;
            }

            const state = { degrees: [] };
            let initialValues = {
                collegeName: data.school || '',
                degreeName: data.degree || '',
                departmentName: data.department || '',
                batchRange: data.batch_range || '',
            };

            if (hiddenSchool) hiddenSchool.value = initialValues.collegeName;
            if (hiddenDegree) hiddenDegree.value = initialValues.degreeName;
            if (hiddenDepartment) hiddenDepartment.value = initialValues.departmentName;
            if (hiddenBatch) hiddenBatch.value = initialValues.batchRange;

            const colleges = await loadCollegesList().catch(() => []);
            const collegeOptions = (colleges || []).map(col => ({ value: col.id, label: col.name }));
            fillSelectOptions(collegeSelect, collegeOptions, { placeholder: 'Select college', includeCustom: false });

            if (initialValues.collegeName) {
                const match = findCollegeByName(initialValues.collegeName);
                if (match) {
                    collegeSelect.value = match.id;
                } else {
                    // collegeSelect.value = EDUCATION_CUSTOM_VALUE;
                    // if (collegeCustomInput) {
                    //     collegeCustomInput.value = initialValues.collegeName;
                    //     toggleCustomInput(collegeCustomInput, true);
                    // }
                    collegeSelect.value = '';
                }
            } else if (!collegeOptions.length) {
                // collegeSelect.value = EDUCATION_CUSTOM_VALUE;
                // if (collegeCustomInput) toggleCustomInput(collegeCustomInput, true);
                collegeSelect.value = '';
            }

            let collegeRequestId = 0;

            async function handleCollegeChange(isInitial = false) {
                const selected = collegeSelect.value;
                const isCustom = selected === EDUCATION_CUSTOM_VALUE;

                if (isCustom) {
                    // if (collegeCustomInput) toggleCustomInput(collegeCustomInput, true);
                    // if (hiddenSchool) hiddenSchool.value = (collegeCustomInput?.value || '').trim();
                    // if (hiddenCollegeId) hiddenCollegeId.value = '';

                    // degreeSelect.disabled = false;
                    // state.degrees = [];
                    // fillSelectOptions(degreeSelect, [], { placeholder: 'Select degree', includeCustom: false });
                    // degreeSelect.value = EDUCATION_CUSTOM_VALUE;
                    // if (isInitial && initialValues?.degreeName && degreeCustomInput) {
                    //     degreeCustomInput.value = initialValues.degreeName;
                    // }
                    // if (degreeCustomInput) toggleCustomInput(degreeCustomInput, true);
                    // if (hiddenDegree) hiddenDegree.value = (degreeCustomInput?.value || '').trim();

                    // departmentSelect.disabled = false;
                    // fillSelectOptions(departmentSelect, [], { placeholder: 'Select department', includeCustom: false });
                    // departmentSelect.value = EDUCATION_CUSTOM_VALUE;
                    // if (isInitial && initialValues?.departmentName && departmentCustomInput) {
                    //     departmentCustomInput.value = initialValues.departmentName;
                    // }
                    // if (departmentCustomInput) toggleCustomInput(departmentCustomInput, true);
                    // if (hiddenDepartment) hiddenDepartment.value = (departmentCustomInput?.value || '').trim();

                    // batchSelect.disabled = false;
                    // fillSelectOptions(batchSelect, [], { placeholder: 'Select batch', includeCustom: false });
                    // if (isInitial && initialValues?.batchRange) {
                    //     batchSelect.value = initialValues.batchRange;
                    //     if (hiddenBatch) hiddenBatch.value = initialValues.batchRange;
                    //     if (batchCustomInput) {
                    //         toggleCustomInput(batchCustomInput, false);
                    //         batchCustomInput.value = '';
                    //     }
                    // } else {
                    //     batchSelect.value = EDUCATION_CUSTOM_VALUE;
                    //     if (batchCustomInput) toggleCustomInput(batchCustomInput, true);
                    //     if (hiddenBatch) hiddenBatch.value = (batchCustomInput?.value || '').trim();
                    // }
                    // refreshAssociations();
                    return;
                }

                if (collegeCustomInput) {
                    toggleCustomInput(collegeCustomInput, false);
                    collegeCustomInput.value = '';
                }

                if (!selected) {
                    if (hiddenSchool) hiddenSchool.value = '';
                    if (hiddenCollegeId) hiddenCollegeId.value = '';

                    degreeSelect.disabled = true;
                    fillSelectOptions(degreeSelect, [], { placeholder: 'Select degree', includeCustom: false });
                    degreeSelect.value = '';
                    if (degreeCustomInput) {
                        toggleCustomInput(degreeCustomInput, false);
                        degreeCustomInput.value = '';
                    }
                    if (hiddenDegree) hiddenDegree.value = '';

                    departmentSelect.disabled = true;
                    fillSelectOptions(departmentSelect, [], { placeholder: 'Select department', includeCustom: false });
                    departmentSelect.value = '';
                    if (departmentCustomInput) {
                        toggleCustomInput(departmentCustomInput, false);
                        departmentCustomInput.value = '';
                    }
                    if (hiddenDepartment) hiddenDepartment.value = '';

                    batchSelect.disabled = true;
                    fillSelectOptions(batchSelect, [], { placeholder: 'Select batch', includeCustom: false });
                    batchSelect.value = '';
                    if (batchCustomInput) {
                        toggleCustomInput(batchCustomInput, false);
                        batchCustomInput.value = '';
                    }
                    if (hiddenBatch) hiddenBatch.value = '';
                    refreshAssociations();
                    return;
                }

                const college = getCollegeById(selected);
                if (hiddenSchool) hiddenSchool.value = college?.name || '';
                if (hiddenCollegeId) hiddenCollegeId.value = selected;
                degreeSelect.disabled = false;

                const requestId = ++collegeRequestId;
                const details = await loadCollegeDetails(selected);
                if (collegeSelect.value !== selected || requestId !== collegeRequestId) {
                    return;
                }

                state.degrees = Array.isArray(details?.degrees) ? details.degrees : [];
                const degreeOptions = state.degrees.map(deg => ({ value: String(deg.id), label: deg.name }));
                fillSelectOptions(degreeSelect, degreeOptions, { placeholder: 'Select degree', includeCustom: false });

                let desiredDegree = '';
                if (isInitial && initialValues?.degreeName) {
                    const match = findDegreeByName(state.degrees, initialValues.degreeName);
                    if (match) {
                        desiredDegree = String(match.id);
                    } else {
                        // desiredDegree = EDUCATION_CUSTOM_VALUE;
                        // if (degreeCustomInput) degreeCustomInput.value = initialValues.degreeName;
                        desiredDegree = '';
                    }
                } else if (!degreeOptions.length) {
                    // desiredDegree = EDUCATION_CUSTOM_VALUE;
                    desiredDegree = '';
                }

                degreeSelect.value = desiredDegree;
                await handleDegreeChange(isInitial);
                refreshAssociations();
            }

            function handleCollegeCustomInput() {
                if (collegeSelect.value === EDUCATION_CUSTOM_VALUE) {
                    if (hiddenSchool) hiddenSchool.value = (collegeCustomInput?.value || '').trim();
                    refreshAssociations();
                }
            }

            async function handleDegreeChange(isInitial = false) {
                const selected = degreeSelect.value;
                const isCustom = selected === EDUCATION_CUSTOM_VALUE;

                if (isCustom) {
                    if (degreeCustomInput) toggleCustomInput(degreeCustomInput, true);
                    if (isInitial && initialValues?.degreeName && degreeCustomInput) {
                        degreeCustomInput.value = initialValues.degreeName;
                    }
                    if (hiddenDegree) hiddenDegree.value = (degreeCustomInput?.value || '').trim();
                    if (hiddenDegreeId) hiddenDegreeId.value = '';

                    departmentSelect.disabled = false;
                    fillSelectOptions(departmentSelect, [], { placeholder: 'Select department', includeCustom: false });
                    departmentSelect.value = EDUCATION_CUSTOM_VALUE;
                    await handleDepartmentChange(isInitial);
                    return;
                }

                if (degreeCustomInput) {
                    toggleCustomInput(degreeCustomInput, false);
                    degreeCustomInput.value = '';
                }

                if (!selected) {
                    if (hiddenDegree) hiddenDegree.value = '';
                    if (hiddenDegreeId) hiddenDegreeId.value = '';

                    departmentSelect.disabled = true;
                    fillSelectOptions(departmentSelect, [], { placeholder: 'Select department', includeCustom: false });
                    departmentSelect.value = '';
                    if (departmentCustomInput) {
                        toggleCustomInput(departmentCustomInput, false);
                        departmentCustomInput.value = '';
                    }
                    if (hiddenDepartment) hiddenDepartment.value = '';

                    batchSelect.disabled = true;
                    fillSelectOptions(batchSelect, [], { placeholder: 'Select batch', includeCustom: false });
                    batchSelect.value = '';
                    if (batchCustomInput) {
                        toggleCustomInput(batchCustomInput, false);
                        batchCustomInput.value = '';
                    }
                    if (hiddenBatch) hiddenBatch.value = '';
                    return;
                }

                const degree = state.degrees.find(d => String(d.id) === selected) || null;
                if (hiddenDegree) hiddenDegree.value = degree?.name || '';
                if (hiddenDegreeId) hiddenDegreeId.value = selected;

                const departments = Array.isArray(degree?.departments) ? degree.departments : [];
                const departmentOptions = departments.map(dep => ({ value: String(dep.id), label: dep.name }));
                departmentSelect.disabled = false;
                fillSelectOptions(departmentSelect, departmentOptions, { placeholder: 'Select department', includeCustom: false });

                let desiredDepartment = '';
                if (isInitial && initialValues?.departmentName) {
                    const match = findDepartmentByName(departments, initialValues.departmentName);
                    if (match) {
                        desiredDepartment = String(match.id);
                    } else {
                        // desiredDepartment = EDUCATION_CUSTOM_VALUE;
                        // if (departmentCustomInput) departmentCustomInput.value = initialValues.departmentName;
                        desiredDepartment = '';
                    }
                } else if (!departmentOptions.length) {
                    // desiredDepartment = EDUCATION_CUSTOM_VALUE;
                    desiredDepartment = '';
                }

                departmentSelect.value = desiredDepartment;
                await handleDepartmentChange(isInitial);
            }

            function handleDegreeCustomInput() {
                if (degreeSelect.value === EDUCATION_CUSTOM_VALUE) {
                    if (hiddenDegree) hiddenDegree.value = (degreeCustomInput?.value || '').trim();
                }
            }

            async function handleDepartmentChange(isInitial = false) {
                const selected = departmentSelect.value;
                const isCustom = selected === EDUCATION_CUSTOM_VALUE;

                if (isCustom) {
                    if (departmentCustomInput) toggleCustomInput(departmentCustomInput, true);
                    if (isInitial && initialValues?.departmentName && departmentCustomInput) {
                        departmentCustomInput.value = initialValues.departmentName;
                    }
                    if (hiddenDepartment) hiddenDepartment.value = (departmentCustomInput?.value || '').trim();
                    if (hiddenDepartmentId) hiddenDepartmentId.value = '';

                    batchSelect.disabled = false;
                    fillSelectOptions(batchSelect, [], { placeholder: 'Select batch', includeCustom: false });
                    if (isInitial && initialValues?.batchRange) {
                        batchSelect.value = initialValues.batchRange;
                        if (hiddenBatch) hiddenBatch.value = initialValues.batchRange;
                        if (batchCustomInput) {
                            toggleCustomInput(batchCustomInput, false);
                            batchCustomInput.value = '';
                        }
                    } else {
                        batchSelect.value = EDUCATION_CUSTOM_VALUE;
                        if (batchCustomInput) toggleCustomInput(batchCustomInput, true);
                        if (hiddenBatch) hiddenBatch.value = (batchCustomInput?.value || '').trim();
                    }
                    return;
                }

                if (departmentCustomInput) {
                    toggleCustomInput(departmentCustomInput, false);
                    departmentCustomInput.value = '';
                }

                if (!selected) {
                    if (hiddenDepartment) hiddenDepartment.value = '';
                    if (hiddenDepartmentId) hiddenDepartmentId.value = '';

                    batchSelect.disabled = true;
                    fillSelectOptions(batchSelect, [], { placeholder: 'Select batch', includeCustom: false });
                    batchSelect.value = '';
                    if (batchCustomInput) {
                        toggleCustomInput(batchCustomInput, false);
                        batchCustomInput.value = '';
                    }
                    if (hiddenBatch) hiddenBatch.value = '';
                    return;
                }

                const degree = state.degrees.find(d => String(d.id) === (degreeSelect.value || '')) || null;
                const departments = Array.isArray(degree?.departments) ? degree.departments : [];
                const department = departments.find(dep => String(dep.id) === selected) || null;
                if (hiddenDepartment) hiddenDepartment.value = department?.name || '';
                if (hiddenDepartmentId) hiddenDepartmentId.value = selected;

                const batches = Array.isArray(department?.batches) ? department.batches : [];
                const batchOptions = batches
                    .map(batch => {
                        const label = formatBatchRange(batch);
                        return label ? { value: label, label } : null;
                    })
                    .filter(Boolean);

                batchSelect.disabled = false;
                fillSelectOptions(batchSelect, batchOptions, { placeholder: 'Select batch', includeCustom: false });

                let desiredBatch = '';
                if (isInitial && initialValues?.batchRange) {
                    if (batchOptions.some(opt => opt.value === initialValues.batchRange)) {
                        desiredBatch = initialValues.batchRange;
                    } else {
                        // desiredBatch = EDUCATION_CUSTOM_VALUE;
                        // if (batchCustomInput) batchCustomInput.value = initialValues.batchRange;
                        desiredBatch = '';
                    }
                }

                batchSelect.value = desiredBatch;
                handleBatchChange(isInitial);
            }

            function handleDepartmentCustomInput() {
                if (departmentSelect.value === EDUCATION_CUSTOM_VALUE) {
                    if (hiddenDepartment) hiddenDepartment.value = (departmentCustomInput?.value || '').trim();
                }
            }

            function handleBatchChange(isInitial = false) {
                const selected = batchSelect.value;
                const isCustom = selected === EDUCATION_CUSTOM_VALUE;
                if (batchCustomInput) toggleCustomInput(batchCustomInput, isCustom);

                if (isCustom) {
                    if (isInitial && initialValues?.batchRange && batchCustomInput) {
                        batchCustomInput.value = initialValues.batchRange;
                    }
                    if (hiddenBatch) hiddenBatch.value = (batchCustomInput?.value || '').trim();
                } else {
                    if (hiddenBatch) hiddenBatch.value = selected || '';
                    if (!selected && batchCustomInput) batchCustomInput.value = '';
                }
            }

            function handleBatchCustomInput() {
                if (batchSelect.value === EDUCATION_CUSTOM_VALUE) {
                    if (hiddenBatch) hiddenBatch.value = (batchCustomInput?.value || '').trim();
                }
            }

            collegeSelect.addEventListener('change', () => { handleCollegeChange(false); });
            collegeCustomInput?.addEventListener('input', handleCollegeCustomInput);
            degreeSelect.addEventListener('change', () => { handleDegreeChange(false); });
            degreeCustomInput?.addEventListener('input', handleDegreeCustomInput);
            departmentSelect.addEventListener('change', () => { handleDepartmentChange(false); });
            departmentCustomInput?.addEventListener('input', handleDepartmentCustomInput);
            batchSelect.addEventListener('change', () => { handleBatchChange(false); });
            batchCustomInput?.addEventListener('input', handleBatchCustomInput);
            if (sectionSelect && data.section) {
                sectionSelect.value = String(data.section).trim().toUpperCase();
            }

            await handleCollegeChange(true);
            initialValues = null;
        };

        const addEducationRow = (data = {}) => {
            if (!educationTemplate || !educationList) return;
            const node = createFromTemplate(educationTemplate);
            if (!node) return;
            node.querySelector('input[name="edu_id"]').value = data.id || '';
            node.querySelector('input[name="edu_school"]').value = data.school || '';
            node.querySelector('input[name="edu_degree"]').value = data.degree || '';
            node.querySelector('input[name="edu_department"]').value = data.department || '';
            node.querySelector('input[name="edu_batch_range"]').value = data.batch_range || '';
            if (data.college_id) node.querySelector('input[name="edu_college_id"]').value = data.college_id;
            if (data.degree_id) node.querySelector('input[name="edu_degree_id"]').value = data.degree_id;
            if (data.department_id) node.querySelector('input[name="edu_department_id"]').value = data.department_id;
            if (data.batch_id) node.querySelector('input[name="edu_batch_id"]').value = data.batch_id;
            const sectionSelect = node.querySelector('select[name="edu_section"]');
            if (sectionSelect) sectionSelect.value = (data.section || '').toUpperCase();
            node.querySelector('input[name="edu_current_semester"]').value = (data.current_semester ?? '') || '';
            node.querySelector('input[name="edu_regno"]').value = data.regno || '';
            node.querySelector('input[name="edu_grade"]').value = data.grade || '';
            node.querySelector('input[name="edu_activities"]').value = data.activities || '';
            node.querySelector('textarea[name="edu_description"]').value = data.description || '';
            node.querySelector('.removeEntry')?.addEventListener('click', () => { node.remove(); refreshAssociations(); });
            educationList.appendChild(node);
            initializeEducationRow(node, data).catch(err => console.error('Failed to initialize education row', err));
        };

        const addCertificationRow = (data = {}) => {
            if (!certificationTemplate || !certificationList) return;
            const node = createFromTemplate(certificationTemplate);
            if (!node) return;
            node.querySelector('input[name="cert_id"]').value = data.id || '';
            node.querySelector('input[name="cert_name"]').value = data.name || '';
            node.querySelector('input[name="cert_org"]').value = data.issuing_org || '';
            node.querySelector('input[name="cert_issue"]').value = data.issue_date || '';
            node.querySelector('input[name="cert_expiry"]').value = data.expiration_date || '';
            const noExpiry = node.querySelector('input[name="cert_no_expiry"]');
            noExpiry.checked = Boolean(data.does_not_expire);
            const expiryInput = node.querySelector('input[name="cert_expiry"]');
            const toggle = () => toggleDisabled(expiryInput, noExpiry.checked);
            noExpiry.addEventListener('change', toggle);
            toggle();
            node.querySelector('input[name="cert_credential_id"]').value = data.credential_id || '';
            node.querySelector('input[name="cert_credential_url"]').value = data.credential_url || '';
            node.querySelector('textarea[name="cert_description"]').value = data.description || '';
            node.querySelector('.removeEntry')?.addEventListener('click', () => node.remove());
            certificationList.appendChild(node);
        };

        const getExperienceOptions = () => Array.from(experienceList?.querySelectorAll('[data-entry="experience"]') || [])
            .map(row => ({
                id: row.querySelector('input[name="exp_id"]').value,
                label: row.querySelector('input[name="exp_title"]').value || 'Experience'
            }))
            .filter(item => item.id);

        const getEducationOptions = () => Array.from(educationList?.querySelectorAll('[data-entry="education"]') || [])
            .map(row => ({
                id: row.querySelector('input[name="edu_id"]').value,
                label: row.querySelector('input[name="edu_school"]').value || 'Education'
            }))
            .filter(item => item.id);

        const fillAssociateOptions = (select, options, selected) => {
            if (!select) return;
            const current = selected ?? select.value ?? '';
            select.innerHTML = '';
            const blank = document.createElement('option');
            blank.value = '';
            blank.textContent = '';
            select.appendChild(blank);
            let hasMatch = false;
            options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt.id;
                option.textContent = opt.label;
                if (opt.id === current) { option.selected = true; hasMatch = true; }
                select.appendChild(option);
            });
            if (!hasMatch) select.value = '';
        };

        const refreshAssociations = () => {
            const expOptions = getExperienceOptions();
            const eduOptions = getEducationOptions();
            Array.from(portfolioList?.querySelectorAll('[data-entry="portfolio"]') || []).forEach(row => {
                const expSelect = row.querySelector('select[name="proj_experience"]');
                const eduSelect = row.querySelector('select[name="proj_education"]');
                if (expSelect) fillAssociateOptions(expSelect, expOptions, expSelect.dataset.selected || expSelect.value);
                if (eduSelect) fillAssociateOptions(eduSelect, eduOptions, eduSelect.dataset.selected || eduSelect.value);
            });
        };

        const addPortfolioRow = (data = {}) => {
            if (!portfolioTemplate || !portfolioList) return;
            const node = createFromTemplate(portfolioTemplate);
            if (!node) return;
            node.querySelector('input[name="proj_id"]').value = data.id || '';
            node.querySelector('input[name="proj_name"]').value = data.name || '';
            const expSelect = node.querySelector('select[name="proj_experience"]');
            const eduSelect = node.querySelector('select[name="proj_education"]');
            if (expSelect) expSelect.dataset.selected = data.associated_experience_id || '';
            if (eduSelect) eduSelect.dataset.selected = data.associated_education_id || '';
            node.querySelector('input[name="proj_start"]').value = data.start_date || '';
            node.querySelector('input[name="proj_end"]').value = data.end_date || '';
            node.querySelector('input[name="proj_url"]').value = data.url || '';
            node.querySelector('textarea[name="proj_description"]').value = data.description || '';
            node.querySelector('input[name="proj_stack"]').value = Array.isArray(data.tech_stack) ? data.tech_stack.join(', ') : '';
            const teamNames = Array.isArray(data.team) ? data.team.map(member => typeof member === 'string' ? member : (member?.name || '')).filter(Boolean) : [];
            node.querySelector('input[name="proj_team"]').value = teamNames.join(', ');
            node.querySelector('.removeEntry')?.addEventListener('click', () => { node.remove(); });
            portfolioList.appendChild(node);
            refreshAssociations();
        };

        const addPublicationRow = (data = {}) => {
            if (!publicationTemplate || !publicationList) return;
            const node = createFromTemplate(publicationTemplate);
            if (!node) return;
            node.querySelector('input[name="pub_id"]').value = data.id || '';
            node.querySelector('input[name="pub_title"]').value = data.title || '';
            node.querySelector('input[name="pub_publisher"]').value = data.publisher || '';
            node.querySelector('input[name="pub_date"]').value = data.publication_date || '';
            const authors = Array.isArray(data.authors) ? data.authors.join(', ') : '';
            node.querySelector('input[name="pub_authors"]').value = authors;
            node.querySelector('input[name="pub_url"]').value = data.url || '';
            node.querySelector('textarea[name="pub_abstract"]').value = data.abstract || '';
            node.querySelector('.removeEntry')?.addEventListener('click', () => node.remove());
            publicationList.appendChild(node);
        };

        const collectExperienceData = () => Array.from(experienceList?.querySelectorAll('[data-entry="experience"]') || []).map(row => {
            const id = row.querySelector('input[name="exp_id"]').value || null;
            const title = row.querySelector('input[name="exp_title"]').value.trim();
            const start = row.querySelector('input[name="exp_start_date"]').value;
            if (!title || !start) return null;
            const media = Array.from(row.querySelectorAll('[data-media-item]')).map(item => {
                const url = item.querySelector('input[name="media_url"]').value.trim();
                if (!url) return null;
                return {
                    title: item.querySelector('input[name="media_title"]').value.trim() || null,
                    url,
                    kind: item.querySelector('select[name="media_kind"]').value || 'link',
                };
            }).filter(Boolean);
            const endInput = row.querySelector('input[name="exp_end_date"]');
            return {
                id,
                title,
                employment_type: row.querySelector('select[name="exp_employment_type"]').value || null,
                company: row.querySelector('input[name="exp_company"]').value.trim() || null,
                company_logo_url: row.querySelector('input[name="exp_company_logo"]').value.trim() || null,
                location: row.querySelector('input[name="exp_location"]').value.trim() || null,
                location_type: row.querySelector('select[name="exp_location_type"]').value || null,
                start_date: start || null,
                end_date: endInput && endInput.disabled ? null : (endInput?.value || null),
                is_current: row.querySelector('input[name="exp_current"]').checked,
                description: row.querySelector('textarea[name="exp_description"]').value.trim() || null,
                media,
            };
        }).filter(Boolean);

        const collectEducationData = () => Array.from(educationList?.querySelectorAll('[data-entry="education"]') || []).map(row => {
            const school = row.querySelector('input[name="edu_school"]').value.trim();
            if (!school) return null;
            const currentSemesterRaw = row.querySelector('input[name="edu_current_semester"]').value.trim();
            const current_semester = currentSemesterRaw ? parseInt(currentSemesterRaw, 10) : null;
            const college_id = row.querySelector('input[name="edu_college_id"]').value.trim() || null;
            const degree_id = row.querySelector('input[name="edu_degree_id"]').value.trim() || null;
            const department_id = row.querySelector('input[name="edu_department_id"]').value.trim() || null;
            const batch_id = row.querySelector('input[name="edu_batch_id"]').value.trim() || null;
            return {
                id: row.querySelector('input[name="edu_id"]').value || null,
                school,
                degree: row.querySelector('input[name="edu_degree"]').value.trim() || null,
                department: row.querySelector('input[name="edu_department"]').value.trim() || null,
                batch_range: row.querySelector('input[name="edu_batch_range"]').value || null,
                regno: row.querySelector('input[name="edu_regno"]').value.trim() || null,
                current_semester: (Number.isFinite(current_semester) && current_semester > 0) ? current_semester : null,
                grade: row.querySelector('input[name="edu_grade"]').value.trim() || null,
                activities: row.querySelector('input[name="edu_activities"]').value.trim() || null,
                description: row.querySelector('textarea[name="edu_description"]').value.trim() || null,
                college_id,
                degree_id,
                department_id,
                batch_id,
                section: (row.querySelector('select[name="edu_section"]').value || '').trim() || null,
            };
        }).filter(Boolean);

        const collectCertificationData = () => Array.from(certificationList?.querySelectorAll('[data-entry="certification"]') || []).map(row => {
            const name = row.querySelector('input[name="cert_name"]').value.trim();
            if (!name) return null;
            const noExpiry = row.querySelector('input[name="cert_no_expiry"]').checked;
            const expiryInput = row.querySelector('input[name="cert_expiry"]');
            return {
                id: row.querySelector('input[name="cert_id"]').value || null,
                name,
                issuing_org: row.querySelector('input[name="cert_org"]').value.trim() || null,
                issue_date: row.querySelector('input[name="cert_issue"]').value || null,
                expiration_date: noExpiry ? null : (expiryInput?.value || null),
                does_not_expire: noExpiry,
                credential_id: row.querySelector('input[name="cert_credential_id"]').value.trim() || null,
                credential_url: row.querySelector('input[name="cert_credential_url"]').value.trim() || null,
                description: row.querySelector('textarea[name="cert_description"]').value.trim() || null,
            };
        }).filter(Boolean);

        const collectPortfolioData = () => Array.from(portfolioList?.querySelectorAll('[data-entry="portfolio"]') || []).map(row => {
            const name = row.querySelector('input[name="proj_name"]').value.trim();
            if (!name) return null;
            const stack = parseList(row.querySelector('input[name="proj_stack"]').value);
            const team = parseList(row.querySelector('input[name="proj_team"]').value).map(member => ({ name: member }));
            return {
                id: row.querySelector('input[name="proj_id"]').value || null,
                name,
                associated_experience_id: row.querySelector('select[name="proj_experience"]').value || null,
                associated_education_id: row.querySelector('select[name="proj_education"]').value || null,
                start_date: row.querySelector('input[name="proj_start"]').value || null,
                end_date: row.querySelector('input[name="proj_end"]').value || null,
                url: row.querySelector('input[name="proj_url"]').value.trim() || null,
                description: row.querySelector('textarea[name="proj_description"]').value.trim() || null,
                tech_stack: stack,
                team,
            };
        }).filter(Boolean);

        const collectPublicationData = () => Array.from(publicationList?.querySelectorAll('[data-entry="publication"]') || []).map(row => {
            const title = row.querySelector('input[name="pub_title"]').value.trim();
            if (!title) return null;
            return {
                id: row.querySelector('input[name="pub_id"]').value || null,
                title,
                publisher: row.querySelector('input[name="pub_publisher"]').value.trim() || null,
                publication_date: row.querySelector('input[name="pub_date"]').value || null,
                authors: parseList(row.querySelector('input[name="pub_authors"]').value),
                url: row.querySelector('input[name="pub_url"]').value.trim() || null,
                abstract: row.querySelector('textarea[name="pub_abstract"]').value.trim() || null,
            };
        }).filter(Boolean);

        addExperienceBtn?.addEventListener('click', () => { addExperienceRow(); });
        addEducationBtn?.addEventListener('click', () => { addEducationRow(); });
        addCertificationBtn?.addEventListener('click', () => { addCertificationRow(); });
        addPortfolioBtn?.addEventListener('click', () => { addPortfolioRow(); });
        addPublicationBtn?.addEventListener('click', () => { addPublicationRow(); });

        async function fetchProfileData() {
            let res = await fetch(`${apiBase}/api/profile/me`, { headers: authHeaders() });
            if (res.status === 401) { window.location.href = 'login.html'; return null; }
            if (res.ok) { return await res.json(); }
            // Fallback to /api/me shape
            res = await fetch(`${apiBase}/api/me`, { headers: authHeaders() });
            if (res.status === 401) { window.location.href = 'login.html'; return null; }
            const d = await res.json().catch(() => null);
            return d && d.profile ? d.profile : d;
        }

        async function loadProfile() {
            try {
                const data = await fetchProfileData();
                if (!data) return;
                document.getElementById('name').textContent = data.name || '—';
                document.getElementById('email').textContent = data.email || '—';
                setAvatar(initials(data.name), data.profile_image_url || null);
                document.getElementById('f_name').value = data.name || '';
                document.getElementById('f_email_ro').value = data.email || '';
                document.getElementById('f_headline').value = data.headline || '';
                document.getElementById('f_location').value = data.location || '';
                document.getElementById('f_dob').value = data.dob || '';
                document.getElementById('f_phone').value = data.phone || '';
                document.getElementById('f_bio').value = data.bio || '';
                document.getElementById('f_linkedin').value = data.linkedin || '';
                document.getElementById('f_github').value = data.github || '';
                document.getElementById('f_portfolio').value = data.portfolio_url || '';
                document.getElementById('f_website').value = data.website || '';
                document.getElementById('f_twitter').value = data.twitter || '';
                document.getElementById('f_instagram').value = data.instagram || '';
                document.getElementById('f_medium').value = data.medium || '';
                document.getElementById('f_leetcode').value = data.leetcode || '';
                document.getElementById('f_technologies').value = data.technologies || '';
                document.getElementById('f_skills').value = data.skills || '';
                document.getElementById('f_certifications').value = data.certifications || '';
                document.getElementById('f_languages').value = data.languages || '';
                document.getElementById('f_interests').value = data.interests || '';
                document.getElementById('f_achievements').value = data.achievements || '';
                document.getElementById('f_experience').value = data.experience || '';
                document.getElementById('f_publications').value = data.publications || '';
                document.getElementById('f_project_info').value = data.project_info || '';
                document.getElementById('f_specs').value = Array.isArray(data.specializations) ? data.specializations.join(', ') : (data.specializations || '');

                if (experienceList) {
                    experienceList.innerHTML = '';
                    const experiences = Array.isArray(data.experiences) ? data.experiences : [];
                    experiences.forEach(exp => addExperienceRow(exp));
                }

                if (educationList) {
                    educationList.innerHTML = '';
                    const educationEntries = Array.isArray(data.education_entries) ? data.education_entries : [];
                    educationEntries.forEach(entry => addEducationRow(entry));
                }

                if (certificationList) {
                    certificationList.innerHTML = '';
                    const certEntries = Array.isArray(data.certification_entries) ? data.certification_entries : [];
                    certEntries.forEach(entry => addCertificationRow(entry));
                }

                if (portfolioList) {
                    portfolioList.innerHTML = '';
                    const portfolioEntries = Array.isArray(data.portfolio_projects) ? data.portfolio_projects : [];
                    portfolioEntries.forEach(entry => addPortfolioRow(entry));
                }

                if (publicationList) {
                    publicationList.innerHTML = '';
                    const publicationEntries = Array.isArray(data.publication_entries) ? data.publication_entries : [];
                    publicationEntries.forEach(entry => addPublicationRow(entry));
                }

                refreshAssociations();

                if (data.profile_image_url) {
                    const a = document.getElementById('currentImage'); a.href = data.profile_image_url; a.classList.remove('hidden');
                }
                if (data.resume_url) { const a = document.getElementById('currentResume'); a.href = data.resume_url; a.classList.remove('hidden'); }
            } finally {
                // Hide loader
                document.body.classList.add('loaded');
                const loader = document.getElementById('pageLoader');
                if (loader) {
                    setTimeout(() => { loader.style.display = 'none'; }, 450);
                }
            }
        }

        document.getElementById('imageInput').addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (file) {
                const url = URL.createObjectURL(file);
                // Mirror preview into the avatar immediately.
                setAvatar(document.getElementById('avatarInitials')?.textContent || 'U', url);
            }
        });

        // Image is saved via the top "Save Changes" button (details form submit).
        document.getElementById('imageForm').addEventListener('submit', (e) => {
            e.preventDefault();
            document.getElementById('detailsForm')?.requestSubmit();
        });

        document.getElementById('resumeForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            document.getElementById('detailsForm')?.requestSubmit();
        });

        document.getElementById('saveChangesBtn')?.addEventListener('click', () => {
            document.getElementById('detailsForm')?.requestSubmit();
        });

        document.getElementById('detailsForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            // Show loader manually
            const loader = document.getElementById('pageLoader');
            if (loader) {
                loader.classList.remove('loaded');
                loader.style.display = 'flex';
                loader.style.opacity = '1';
                loader.style.visibility = 'visible';
            }

            try {
                const st = document.getElementById('status');
                st.classList.remove('hidden');

                // Upload profile image if user selected a new one.
                const imageFile = document.getElementById('imageInput')?.files?.[0] || null;
                if (imageFile) {
                    st.textContent = '⏳ Uploading profile image…';
                    const up = await uploadProfileAsset('image', imageFile);
                    if (!up.ok) {
                        st.textContent = `❌ ${up?.out?.detail || 'Image upload failed'}`;
                        return;
                    }
                }

                // Upload resume if user selected a new one.
                const resumeFile = document.getElementById('resumeInput')?.files?.[0] || null;
                if (resumeFile) {
                    st.textContent = '⏳ Uploading resume…';
                    const up = await uploadProfileAsset('resume', resumeFile);
                    if (!up.ok) {
                        st.textContent = `❌ ${up?.out?.detail || 'Resume upload failed'}`;
                        return;
                    }
                }

                const specs = document.getElementById('f_specs').value.split(',').map(s => s.trim()).filter(Boolean);
                const experiences = collectExperienceData();
                const educationEntries = collectEducationData();
                const certificationEntries = collectCertificationData();
                const portfolioEntries = collectPortfolioData();
                const publicationEntries = collectPublicationData();
                const payload = {
                    name: document.getElementById('f_name').value || null,
                    phone: document.getElementById('f_phone').value.replace(/\D/g, '') || null,
                    headline: document.getElementById('f_headline').value || null,
                    location: document.getElementById('f_location').value || null,
                    dob: document.getElementById('f_dob').value || null,
                    bio: document.getElementById('f_bio').value || null,
                    linkedin: document.getElementById('f_linkedin').value || null,
                    github: document.getElementById('f_github').value || null,
                    leetcode: document.getElementById('f_leetcode').value || null,
                    portfolio_url: document.getElementById('f_portfolio').value || null,
                    website: document.getElementById('f_website').value || null,
                    twitter: document.getElementById('f_twitter').value || null,
                    instagram: document.getElementById('f_instagram').value || null,
                    medium: document.getElementById('f_medium').value || null,
                    specializations: specs,
                    technologies: document.getElementById('f_technologies').value || null,
                    skills: document.getElementById('f_skills').value || null,
                    certifications: document.getElementById('f_certifications').value || null,
                    languages: document.getElementById('f_languages').value || null,
                    interests: document.getElementById('f_interests').value || null,
                    achievements: document.getElementById('f_achievements').value || null,
                    experience: document.getElementById('f_experience').value || null,
                    publications: document.getElementById('f_publications').value || null,
                    project_info: document.getElementById('f_project_info').value || null,
                    experiences: experiences,
                    education_entries: educationEntries,
                    certification_entries: certificationEntries,
                    portfolio_projects: portfolioEntries,
                    publication_entries: publicationEntries,
                };
                const res = await fetch(`${apiBase}/api/profile/me`, { method: 'PUT', headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                const out = await res.json().catch(() => ({}));
                st.textContent = res.ok ? '✔ Profile updated' : `❌ ${out?.detail || 'Update failed'}`;
                if (res.ok) {
                    window.location.href = 'academicas.html';
                }
            } catch (err) {
                console.error(err);
            } finally {
                // Ensure loader is hidden if loadProfile wasn't called or failed to hide it
                // We add a small delay or just wait for loadProfile's animation? 
                // loadProfile handles it. If this runs after loadProfile returns, we can just ensure it's hidden.
                document.body.classList.add('loaded');
                if (loader && loader.style.display !== 'none') {
                    setTimeout(() => { loader.style.display = 'none'; }, 450);
                }
            }
        });

        loadProfile();
        document.getElementById('signOutBtn')?.addEventListener('click', () => {
            try { localStorage.removeItem('px_token'); } catch { }
            window.location.href = 'login.html';
        });
