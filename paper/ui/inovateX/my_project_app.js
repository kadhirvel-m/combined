// ═══════════════════════════════════════════════════════
// InnovateX — My Project App (AI Refinement Mentor v4)
// Batched Flow: Stack/Feasibility/Customize/Architecture collect input only,
// then bulk AI at Blueprint step.
// ═══════════════════════════════════════════════════════
const apiBase = (window.API_BASE || window.location.origin).replace(/\/$/, '');
const token = localStorage.getItem('px_token');
const PHASES = ['stack_selection', 'features', 'feasibility', 'customization', 'architecture', 'blueprint', 'chatbot'];
const PHASE_LABELS = ['Stack', 'Features', 'Feasibility', 'Customize', 'Architecture', 'Blueprint', 'Chatbot'];
let project = null, projectId = null, session = null, currentPhase = 'stack_selection';
let chatHistory = [];

// Pending responses collected locally (no AI call yet)
window._pendingResponses = {};

document.addEventListener('DOMContentLoaded', () => { initTheme(); loadProject(); });

function initTheme() {
    const btn = document.querySelector('[data-theme-toggle]'), icon = document.getElementById('themeIcon');
    icon.textContent = document.documentElement.classList.contains('dark') ? 'light_mode' : 'dark_mode';
    btn.addEventListener('click', () => { document.documentElement.classList.toggle('dark'); const d = document.documentElement.classList.contains('dark'); icon.textContent = d ? 'light_mode' : 'dark_mode'; localStorage.setItem('px_theme', d ? 'dark' : 'light') });
}

async function loadProject() {
    const params = new URLSearchParams(location.search);
    projectId = params.get('id');
    if (!projectId) { showError('No project ID provided.'); return }
    try {
        const r = await apiFetch('/api/innovatex/my-project/' + projectId);
        project = r.project;
        renderProjectLeft(project);
        await loadSession();
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
    } catch (e) { showError(e.message) }
}

async function loadSession() {
    try {
        const r = await apiFetch('/api/innovatex/refine/' + projectId + '/state');
        session = r.session;
        if (session) {
            currentPhase = session.current_phase || 'stack_selection';
            if (currentPhase === 'complete') currentPhase = 'chatbot';
            // Restore pending responses from session if phases were collected but not yet bulk-processed
            if (session.chosen_frontend && !session.phase_data?.blueprint) {
                window._pendingResponses.stack_selection = { frontend: session.chosen_frontend, backend: session.chosen_backend };
            }
        }
        updatePhaseNav();
        renderPhaseContent();
    } catch (e) { console.warn('No session yet:', e); renderPhaseContent() }
}

function showError(msg) {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'block';
    document.getElementById('errorMsg').textContent = msg;
}

// ═══════════ LEFT PANEL ═══════════
function renderProjectLeft(p) {
    document.getElementById('projTitle').textContent = p.title;
    document.getElementById('catBadge').innerHTML = `<span class="material-symbols-rounded text-sm">${getCatIcon(p.category)}</span> ${esc(p.category || 'General')}`;
    document.getElementById('projIdText').textContent = 'ID: ' + p.id.substring(0, 8);
    document.getElementById('statusBadge').textContent = p.status === 'refined' ? 'Refined' : 'Claimed';
    document.title = p.title + ' — InnovateX';
    document.getElementById('detProblem').textContent = p.problem;
    document.getElementById('detSolution').textContent = p.solution;

    // Tech Stack display logic
    const sessionStack = session ? [session.chosen_frontend, session.chosen_backend].filter(Boolean) : [];
    const pendingStack = window._pendingResponses.stack_selection ? [window._pendingResponses.stack_selection.frontend, window._pendingResponses.stack_selection.backend].filter(Boolean) : [];
    const dbStack = Array.isArray(p.tech_stack) ? p.tech_stack : [];
    const finalStack = [...new Set([...sessionStack, ...pendingStack, ...dbStack])];
    document.getElementById('detTech').innerHTML = finalStack.map(t => `<span class="tech-tag">${esc(t)}</span>`).join('');

    // Metrics Logic
    const diff = p.difficulty || 3;
    document.getElementById('metDiffBar').style.width = (diff * 20) + '%';
    document.getElementById('metDiffLabel').textContent = ['Easy', 'Moderate', 'Hard', 'Very Hard', 'Expert'][diff - 1] || 'Moderate';

    const innov = p.innovation_score || 3;
    document.getElementById('metStars').innerHTML = Array(5).fill(0).map((_, i) => `<span class="material-symbols-rounded star ${i < innov ? 'lit' : ''}">star</span>`).join('');
    document.getElementById('metInnovLabel').textContent = ['Standard', 'Improved', 'Innovative', 'Disruptive', 'Game Changer'][innov - 1] || 'Innovative';

    document.getElementById('metTimeline').textContent = p.timeline_weeks || '?';
    document.getElementById('metTeam').textContent = p.team_size || 1;
    document.getElementById('metTeamLabel').textContent = (p.team_size || 1) === 1 ? 'member' : 'members';

    // Milestones & Outcomes
    if (p.milestones && p.milestones.length) {
        document.getElementById('milestonesCard').style.display = 'block';
        document.getElementById('detMilestones').innerHTML = p.milestones.map(m => `<div class="flex gap-2 text-sm"><span class="text-green-500 material-symbols-rounded text-sm mt-0.5">check_circle</span><span>${esc(m)}</span></div>`).join('');
    }
    if (p.learning_outcomes && p.learning_outcomes.length) {
        document.getElementById('outcomesCard').style.display = 'block';
        document.getElementById('detOutcomes').innerHTML = p.learning_outcomes.map(o => `<span class="px-2 py-1 rounded-lg bg-neutral-100 dark:bg-white/10 text-xs font-semibold">${esc(o)}</span>`).join('');
    }

    // Added Features logic
    const feats = session?.selected_features || [];
    const container = document.getElementById('addedFeaturesCard');
    const list = document.getElementById('addedFeaturesList');
    if (feats.length) {
        container.style.display = 'block';
        list.innerHTML = feats.map(f => `
            <div class="flex items-start gap-2 text-sm">
                <span class="text-green-500 mt-0.5 flex-shrink-0">✦</span>
                <div><span class="font-semibold">${esc(f.name)}</span><span class="text-neutral-400 dark:text-white/40"> — ${esc(f.description)}</span></div>
            </div>`).join('');
    } else {
        container.style.display = 'none';
    }
}

// ═══════════ PHASE NAVIGATION ═══════════
function updatePhaseNav() {
    const phaseData = session?.phase_data || {};
    const pending = window._pendingResponses;
    document.querySelectorAll('.phase-step').forEach(el => {
        const p = el.dataset.phase;
        el.classList.remove('active', 'done');
        // Mark done if: phase has AI result, OR phase has pending local data, OR features/stack are set
        if (phaseData[p] || pending[p] || (p === 'features' && session?.selected_features?.length) || (p === 'stack_selection' && (session?.chosen_frontend || pending.stack_selection))) el.classList.add('done');
        if (p === currentPhase) el.classList.add('active');
    });
}

// ═══════════ PHASE CONTENT ═══════════
function renderPhaseContent() {
    const area = document.getElementById('phaseContent');
    const pd = session?.phase_data || {};
    const pending = window._pendingResponses;

    if (currentPhase === 'chatbot') {
        renderBlueprint(session.refined_project || {});
        return;
    }

    // If phase has AI result already (from bulk or individual), show it
    if (pd[currentPhase]) {
        renderPhaseResult(currentPhase, pd[currentPhase]);
        return;
    }

    // If phase has pending local data (collected but not yet AI-processed), show summary
    if (['stack_selection', 'feasibility', 'customization', 'architecture'].includes(currentPhase) && pending[currentPhase]) {
        renderPendingSummary(currentPhase, pending[currentPhase]);
        return;
    }

    // Question Forms
    if (currentPhase === 'stack_selection') {
        renderStackSelection(area);
    } else if (currentPhase === 'features') {
        renderFeaturesSelection(area);
    } else {
        // Standard input-only phases (feasibility, customization, architecture)
        const forms = {
            feasibility: `
                <div class="mentor-bubble mb-4"><p class="font-bold mb-1">🔍 Quick feasibility check</p><p class="text-xs text-neutral-500">Tell us about your skills and timeline.</p></div>
                <div class="space-y-3">
                    <div><label class="text-sm font-bold mb-1 block">Your skill level?</label>
                    <div class="flex flex-wrap gap-2" id="q_skill">${['Beginner', 'Intermediate', 'Advanced'].map(l => `<button class="option-btn" onclick="toggleOpt(this,'q_skill')">${l}</button>`).join('')}</div></div>
                    <div><label class="text-sm font-bold mb-1 block">Hours/week available?</label>
                    <div class="flex flex-wrap gap-2" id="q_hours">${['5-10 hrs', '10-20 hrs', '20+ hrs'].map(l => `<button class="option-btn" onclick="toggleOpt(this,'q_hours')">${l}</button>`).join('')}</div></div>
                    <div><label class="text-sm font-bold mb-1 block">🗓️ Desired project timeline?</label>
                    <div class="flex flex-wrap gap-2" id="q_timeline">${['1-2 weeks', '3-4 weeks', '1-2 months', '3+ months'].map(l => `<button class="option-btn" onclick="toggleOpt(this,'q_timeline')">${l}</button>`).join('')}</div></div>
                    <button onclick="collectPhaseInput('feasibility')" class="w-full py-2.5 rounded-xl font-bold bg-brand-500 text-white text-sm mt-1 hover:bg-brand-600 transition" id="phaseSubmitBtn">Continue →</button>
                </div>`,
            customization: `
                <div class="mentor-bubble mb-4"><p class="font-bold mb-1">🎯 Focus your project</p><p class="text-xs text-neutral-500">What's your end goal?</p></div>
                <div class="space-y-3">
                    <div><label class="text-sm font-bold mb-1 block">Focus preference?</label>
                    <div class="flex flex-wrap gap-2" id="q_focus">${['Research', 'Product/Startup', 'Balanced'].map(l => `<button class="option-btn" onclick="toggleOpt(this,'q_focus')">${l}</button>`).join('')}</div></div>
                    <div><label class="text-sm font-bold mb-1 block">Main goal?</label>
                    <div class="flex flex-wrap gap-2" id="q_goal">${['High marks', 'Publication', 'Startup', 'Learning'].map(l => `<button class="option-btn" onclick="toggleOpt(this,'q_goal')">${l}</button>`).join('')}</div></div>
                    <button onclick="collectPhaseInput('customization')" class="w-full py-2.5 rounded-xl font-bold bg-brand-500 text-white text-sm mt-1 hover:bg-brand-600 transition" id="phaseSubmitBtn">Continue →</button>
                </div>`,
            architecture: `
                <div class="mentor-bubble mb-4"><p class="font-bold mb-1">🏗️ System architecture</p><p class="text-xs text-neutral-500">Let's plan the structure.</p></div>
                <div class="space-y-3">
                    <div><label class="text-sm font-bold mb-1 block">Your tech experience?</label>
                    <div class="flex flex-wrap gap-2" id="q_techknow">${['Never used', 'Did tutorials', 'Built projects'].map(l => `<button class="option-btn" onclick="toggleOpt(this,'q_techknow')">${l}</button>`).join('')}</div></div>
                    <div><label class="text-sm font-bold mb-1 block">Complexity?</label>
                    <div class="flex flex-wrap gap-2" id="q_complex">${['Simple MVP', 'Moderate', 'Full version'].map(l => `<button class="option-btn" onclick="toggleOpt(this,'q_complex')">${l}</button>`).join('')}</div></div>
                    <button onclick="collectPhaseInput('architecture')" class="w-full py-2.5 rounded-xl font-bold bg-brand-500 text-white text-sm mt-1 hover:bg-brand-600 transition" id="phaseSubmitBtn">Continue →</button>
                </div>`,
            blueprint: `
                <div class="mentor-bubble mb-4"><p class="font-bold mb-1">📋 Generate your blueprint</p><p class="text-xs text-neutral-500">AI will now analyze all your inputs and generate a complete project blueprint.</p></div>
                <div class="space-y-3">
                    <div class="text-xs text-neutral-500 space-y-1 mb-2">
                        <p class="font-bold text-neutral-700 dark:text-white/60">AI will process:</p>
                        ${_buildBulkSummaryList()}
                    </div>
                    <button onclick="submitBulkRefine()" class="w-full py-3 rounded-xl font-bold bg-green-500 text-white text-sm mt-1 hover:bg-green-600 transition flex items-center justify-center gap-2" id="bulkSubmitBtn"><span class="material-symbols-rounded text-lg">auto_awesome</span>Generate Blueprint with AI</button>
                </div>`
        };
        area.innerHTML = forms[currentPhase] || '';
    }
}

// ═══════════ BUILD SUMMARY LIST FOR BLUEPRINT PAGE ═══════════
function _buildBulkSummaryList() {
    const pending = window._pendingResponses;
    const pd = session?.phase_data || {};
    let items = [];

    // Stack
    const stack = pending.stack_selection || (session?.chosen_frontend ? { frontend: session.chosen_frontend, backend: session.chosen_backend } : null);
    if (stack) items.push(`<p>✅ <strong>Stack:</strong> ${esc(stack.frontend)} + ${esc(stack.backend)}</p>`);

    // Features  
    if (session?.selected_features?.length) items.push(`<p>✅ <strong>Features:</strong> ${session.selected_features.length} selected</p>`);

    // Feasibility
    const feas = pending.feasibility;
    if (feas) items.push(`<p>✅ <strong>Feasibility:</strong> ${esc(feas.skill)}, ${esc(feas.hours)}, ${esc(feas.timeline)}</p>`);

    // Customization
    const cust = pending.customization;
    if (cust) items.push(`<p>✅ <strong>Customize:</strong> ${esc(cust.focus)}, Goal: ${esc(cust.goal)}</p>`);

    // Architecture
    const arch = pending.architecture;
    if (arch) items.push(`<p>✅ <strong>Architecture:</strong> ${esc(arch.tech)} experience, ${esc(arch.complexity)}</p>`);

    return items.length ? items.join('') : '<p class="text-neutral-400">No inputs collected yet.</p>';
}

// ═══════════ RENDER PENDING SUMMARY (local data, no AI result yet) ═══════════
function renderPendingSummary(phase, data) {
    const area = document.getElementById('phaseContent');
    let summary = '';

    if (phase === 'stack_selection') {
        summary = `<p class="text-sm"><strong>Frontend:</strong> ${esc(data.frontend)}<br><strong>Backend:</strong> ${esc(data.backend)}</p>`;
    } else if (phase === 'feasibility') {
        summary = `<p class="text-sm"><strong>Skill:</strong> ${esc(data.skill)}<br><strong>Hours/week:</strong> ${esc(data.hours)}<br><strong>Timeline:</strong> ${esc(data.timeline)}</p>`;
    } else if (phase === 'customization') {
        summary = `<p class="text-sm"><strong>Focus:</strong> ${esc(data.focus)}<br><strong>Goal:</strong> ${esc(data.goal)}</p>`;
    } else if (phase === 'architecture') {
        summary = `<p class="text-sm"><strong>Experience:</strong> ${esc(data.tech)}<br><strong>Complexity:</strong> ${esc(data.complexity)}</p>`;
    }

    const ci = PHASES.indexOf(phase);
    const nextPhase = PHASES[ci + 1];

    area.innerHTML = `
        <div class="compact-result mb-4">
            <div class="flex items-center gap-2 mb-3">
                <span class="font-bold capitalize text-brand-500">${PHASE_LABELS[ci]} — Input Collected</span>
                <span class="ml-auto material-symbols-rounded text-green-500">check_circle</span>
            </div>
            ${summary}
            <p class="text-[10px] text-neutral-400 mt-2 italic">AI will process this when you generate the blueprint.</p>
        </div>
        <button onclick="goToPhase('${nextPhase}')" class="w-full py-3 rounded-xl font-bold bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 transition flex items-center justify-center gap-2 text-sm">Continue to ${PHASE_LABELS[ci + 1]} <span class="material-symbols-rounded text-sm">arrow_forward</span></button>`;
}

// ═══════════ STACK SELECTION (no AI call) ═══════════
function renderStackSelection(area) {
    const isAI = (project.category || '').toLowerCase().includes('ai') || (project.tech_stack || []).some(t => t.toLowerCase().includes('python') || t.toLowerCase().includes('tensorflow'));
    const backendopts = ['Python', 'Node.js', 'Java'];
    if (!isAI) backendopts.push('C++', 'C#');

    area.innerHTML = `
        <div class="mentor-bubble mb-6"><p class="font-bold mb-1">🛠️ Choose your stack</p><p class="text-xs text-neutral-500">Pick the core technologies you want to use.</p></div>
        <div class="space-y-5">
            <div><label class="text-sm font-bold mb-2 block flex items-center gap-2"><span class="material-symbols-rounded text-brand-500">web</span>Frontend</label>
            <div class="grid grid-cols-2 gap-2" id="q_front">
                <button class="option-btn text-center py-3" onclick="toggleOpt(this,'q_front')">HTML + Tailwind</button>
                <button class="option-btn text-center py-3" onclick="toggleOpt(this,'q_front')">React.js</button>
            </div></div>
            <div><label class="text-sm font-bold mb-2 block flex items-center gap-2"><span class="material-symbols-rounded text-brand-500">dns</span>Backend</label>
            <div class="grid grid-cols-3 gap-2" id="q_back">${backendopts.map(o => `<button class="option-btn text-center py-3" onclick="toggleOpt(this,'q_back')">${o}</button>`).join('')}</div></div>
            <button onclick="submitStack()" class="w-full py-3 rounded-xl font-bold bg-brand-500 text-white text-sm mt-2 hover:bg-brand-600 transition" id="stackSubmitBtn">Confirm Stack →</button>
        </div>`;
}

// Save stack locally and advance (NO AI call)
async function submitStack() {
    const f = getSelected('q_front'), b = getSelected('q_back');
    if (!f || !b) return alert('Please select both frontend and backend.');

    // Save locally
    window._pendingResponses.stack_selection = { frontend: f, backend: b };

    // Also save to session in DB (just the stack columns, no AI)
    const btn = document.getElementById('stackSubmitBtn');
    btn.disabled = true; btn.textContent = 'Saving...';
    try {
        await apiPost('/api/innovatex/refine', { project_id: projectId, phase: 'stack_selection', user_responses: { frontend: f, backend: b } });
        await loadSession();
    } catch (e) {
        // If backend fails, still advance locally
        console.warn('Stack save failed:', e);
        currentPhase = 'features';
        updatePhaseNav();
        renderPhaseContent();
        renderProjectLeft(project);
    }
}

// ═══════════ FEATURES SELECTION (still uses AI) ═══════════
async function renderFeaturesSelection(area) {
    area.innerHTML = '<div class="text-center py-12"><div class="spin mb-4 mx-auto"></div><p class="font-bold text-sm">AI is exploring features...</p></div>';
    try {
        const r = await apiPost('/api/innovatex/explore-features', { project_id: projectId });
        const feats = r.features || [];
        window._exploreFeatures = feats;
        window._selectedFeatureIdxs = new Set();

        area.innerHTML = `
            <div class="mentor-bubble mb-4"><p class="font-bold mb-1">✨ Explore Features</p><p class="text-xs text-neutral-500">Select features you want to add.</p></div>
            <div class="grid grid-cols-1 gap-2 mb-4 max-h-[400px] overflow-y-auto pr-1">
                ${feats.map((f, i) => `
                    <div class="feature-chip glass rounded-xl p-3 cursor-pointer border-2 border-transparent transition hover:border-brand-500/30" onclick="toggleFeatureLine(this, ${i})">
                        <div class="flex justify-between items-start mb-1">
                            <span class="font-bold text-xs">${esc(f.name)}</span>
                            <span class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-brand-50 dark:bg-white/10 text-neutral-500">${f.effort}</span>
                        </div>
                        <p class="text-[11px] text-neutral-500 dark:text-white/50 leading-tight">${esc(f.description)}</p>
                    </div>`).join('')}
            </div>
            <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-neutral-400"><span id="selFeatCount">0</span> selected</span>
                <button onclick="submitFeatures()" class="px-6 py-2.5 rounded-xl font-bold bg-brand-500 text-white text-sm hover:bg-brand-600 transition disabled:opacity-50" id="featSubmitBtn" disabled>Add Selected</button>
            </div>`;
    } catch (e) { area.innerHTML = `<p class="text-red-500 text-center">Error: ${e.message}</p>`; }
}

function toggleFeatureLine(el, i) {
    const s = window._selectedFeatureIdxs;
    if (s.has(i)) { s.delete(i); el.classList.remove('feature-selected'); }
    else { s.add(i); el.classList.add('feature-selected'); }
    document.getElementById('selFeatCount').textContent = s.size;
    document.getElementById('featSubmitBtn').disabled = s.size === 0;
}

async function submitFeatures() {
    const selected = Array.from(window._selectedFeatureIdxs).map(i => window._exploreFeatures[i]);
    const btn = document.getElementById('featSubmitBtn');
    btn.disabled = true; btn.textContent = 'Adding...';
    try {
        await apiPost('/api/innovatex/refine', { project_id: projectId, phase: 'features', user_responses: { selected_features: selected } });
        await apiPost('/api/innovatex/add-features', { project_id: projectId, features: selected });
        loadProject(); // Reload to show added features and advance phase
    } catch (e) { alert(e.message); btn.disabled = false; }
}

// ═══════════ COLLECT PHASE INPUT (no AI call) ═══════════
function collectPhaseInput(phase) {
    let responses = {};
    if (phase === 'feasibility') {
        const skill = getSelected('q_skill');
        const hours = getSelected('q_hours');
        const timeline = getSelected('q_timeline');
        if (!skill || !hours || !timeline) return alert('Please answer all questions.');
        responses = { skill, hours, timeline };
    } else if (phase === 'customization') {
        const focus = getSelected('q_focus');
        const goal = getSelected('q_goal');
        if (!focus || !goal) return alert('Please answer all questions.');
        responses = { focus, goal };
    } else if (phase === 'architecture') {
        const tech = getSelected('q_techknow');
        const complexity = getSelected('q_complex');
        if (!tech || !complexity) return alert('Please answer all questions.');
        responses = { tech, complexity };
    }

    // Save locally
    window._pendingResponses[phase] = responses;

    // Advance to next phase
    const ci = PHASES.indexOf(phase);
    currentPhase = PHASES[ci + 1];
    updatePhaseNav();
    renderPhaseContent();
}

// ═══════════ BULK REFINE (single AI call for all collected inputs + blueprint) ═══════════
async function submitBulkRefine() {
    const btn = document.getElementById('bulkSubmitBtn');
    if (!btn) return;
    btn.disabled = true;
    btn.innerHTML = '<div class="spin inline-block w-5 h-5 border-2 mr-2"></div> AI is analyzing your entire project…';

    const pending = window._pendingResponses;
    const stack = pending.stack_selection || (session?.chosen_frontend ? { frontend: session.chosen_frontend, backend: session.chosen_backend } : {});

    const bulkPayload = {
        project_id: projectId,
        stack: stack,
        feasibility: pending.feasibility || {},
        customization: pending.customization || {},
        architecture: pending.architecture || {},
    };

    try {
        const r = await apiPost('/api/innovatex/refine-bulk', bulkPayload);
        // Reload session to get all the saved phase data + blueprint
        await loadSession();
        // Clear pending responses
        window._pendingResponses = {};
    } catch (e) {
        alert('AI processing failed: ' + e.message);
        btn.disabled = false;
        btn.innerHTML = '<span class="material-symbols-rounded text-lg">auto_awesome</span>Retry Blueprint Generation';
    }
}

// ═══════════ CHATBOT UI ═══════════
async function renderChatbotUI() {
    const area = document.getElementById('phaseContent');
    area.innerHTML = `
        <div class="flex flex-col h-[600px] -m-6 sm:-m-0">
            <div class="bg-brand-500/5 p-4 border-b border-black/5 dark:border-white/5">
                <p class="font-bold text-sm flex items-center gap-2"><span class="material-symbols-rounded text-brand-500">smart_toy</span>Mentor Chat</p>
                <p class="text-xs text-neutral-500">I have your blueprint. Ask me anything to help you build.</p>
            </div>
            <div id="chatMessages" class="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"></div>
            <div class="p-3 border-t border-black/5 dark:border-white/5 bg-white dark:bg-[#1E1E2F]">
                <form onsubmit="sendChat(event)" class="flex gap-2">
                    <input type="text" id="chatInput" class="form-input flex-1" placeholder="Type a message..." autocomplete="off">
                    <button type="submit" class="p-2.5 rounded-xl bg-brand-500 text-white hover:bg-brand-600 transition flex items-center justify-center aspect-square"><span class="material-symbols-rounded">send</span></button>
                </form>
            </div>
        </div>`;
    await loadChatHistory();
}

async function loadChatHistory() {
    const container = document.getElementById('chatMessages');
    try {
        const r = await apiFetch('/api/innovatex/mentor-chat/' + projectId);
        chatHistory = r.history || [];
        container.innerHTML = chatHistory.length ? chatHistory.map(m => renderChatBubble(m)).join('') : '<p class="text-center text-xs text-neutral-400 py-10">No messages yet. Start chatting!</p>';
        container.scrollTop = container.scrollHeight;
    } catch (e) { console.error(e) }
}

async function sendChat(e) {
    e.preventDefault();
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg) return;

    const container = document.getElementById('chatMessages');
    // Optimistic append
    const optimMsg = { role: 'user', content: msg, created_at: new Date().toISOString() };
    chatHistory.push(optimMsg);
    container.innerHTML += renderChatBubble(optimMsg);
    container.scrollTop = container.scrollHeight;
    input.value = '';

    try {
        // Show typing indicator
        const typeId = 'typing-' + Date.now();
        container.innerHTML += `<div id="${typeId}" class="flex gap-3"><div class="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center"><span class="material-symbols-rounded text-xs text-brand-500">smart_toy</span></div><div class="text-xs text-neutral-400 py-2">Typing...</div></div>`;
        container.scrollTop = container.scrollHeight;

        const r = await apiPost('/api/innovatex/mentor-chat', { project_id: projectId, message: msg });

        document.getElementById(typeId).remove();
        const aiMsg = { role: 'assistant', content: r.message, created_at: new Date().toISOString() };
        chatHistory.push(aiMsg);
        container.innerHTML += renderChatBubble(aiMsg);
        container.scrollTop = container.scrollHeight;
    } catch (err) { alert('Failed to send: ' + err.message); }
}

function renderChatBubble(msg) {
    const isUser = msg.role === 'user';
    return `
        <div class="flex gap-3 ${isUser ? 'flex-row-reverse' : ''}">
            <div class="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${isUser ? 'bg-neutral-100 dark:bg-white/10' : 'bg-brand-500/10'}">
                <span class="material-symbols-rounded text-sm ${isUser ? 'text-neutral-500' : 'text-brand-500'}">${isUser ? 'person' : 'smart_toy'}</span>
            </div>
            <div class="max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${isUser ? 'bg-neutral-100 dark:bg-white/5 rounded-tr-sm' : 'bg-brand-500/5 border border-brand-500/10 rounded-tl-sm'}">
                ${esc(msg.content).replace(/\n/g, '<br>')}
            </div>
        </div>`;
}

// ═══════════ UTILS ═══════════
function renderPhaseResult(phase, data) {
    const area = document.getElementById('phaseContent');
    const ai = data.ai_response || {};
    let content = '';

    // Phase-specific content rendering
    if (phase === 'stack_selection') {
        content = `<p class="text-sm"><strong>Frontend:</strong> ${session.chosen_frontend}<br><strong>Backend:</strong> ${session.chosen_backend}</p>
                   ${ai.confirmation ? `<p class="text-xs text-neutral-500 mt-2">"${esc(ai.confirmation)}"</p>` : ''}`;
    }
    else if (phase === 'features') {
        const feats = session.selected_features || [];
        content = `<p class="text-sm">Added ${feats.length} features.</p>
                   ${ai.synergy ? `<p class="text-xs text-neutral-500 mt-2">"${esc(ai.synergy)}"</p>` : ''}`;
    }
    else if (phase === 'feasibility') {
        content = `<p class="text-sm font-bold mb-1">Assessment:</p><p class="text-sm mb-2">${esc(ai.assessment || 'Feasible')}</p>
                   ${ai.recommendations ? `<div class="detail-toggle"><button onclick="this.parentElement.classList.toggle('open')" class="text-xs text-brand-500 font-bold flex items-center gap-1">View Recommendations <span class="material-symbols-rounded text-sm toggle-icon">expand_more</span></button><div class="detail-content pt-2 space-y-1">${ai.recommendations.map(r => `<p class="text-xs text-neutral-500">• ${esc(r)}</p>`).join('')}</div></div>` : ''}`;
    }
    else if (phase === 'customization') {
        content = `<p class="text-sm font-bold mb-1">Goal:</p><p class="text-sm mb-2">${esc(data.user_responses?.goal || 'Standard')}</p>
                   ${ai.focus_description ? `<p class="text-xs text-neutral-500">"${esc(ai.focus_description)}"</p>` : ''}`;
    }
    else if (phase === 'architecture') {
        content = `<p class="text-sm font-bold mb-1">Architecture Overview:</p><p class="text-sm mb-2">${esc(ai.architecture_explanation || 'Standard architecture')}</p>
                   ${ai.components ? `<div class="detail-toggle"><button onclick="this.parentElement.classList.toggle('open')" class="text-xs text-brand-500 font-bold flex items-center gap-1">View Components <span class="material-symbols-rounded text-sm toggle-icon">expand_more</span></button><div class="detail-content pt-2 space-y-2">${ai.components.map(c => `<div class="text-xs"><span class="font-bold">${esc(c.name)}</span>: ${esc(c.purpose)} <span class="text-neutral-400">(${esc(c.tech)})</span></div>`).join('')}</div></div>` : ''}`;
    }
    else if (phase === 'blueprint') {
        // Special render for Blueprint
        area.innerHTML = renderBlueprint(ai);
        return;
    }

    let html = `
        <div class="compact-result mb-4">
            <div class="flex items-center gap-2 mb-3">
                <span class="font-bold capitalize text-brand-500">${PHASE_LABELS[PHASES.indexOf(phase)]} Complete</span>
                <span class="ml-auto material-symbols-rounded text-green-500">check_circle</span>
            </div>
            ${content}
        </div>`;

    // Next button
    const ci = PHASES.indexOf(phase);
    if (ci < PHASES.length - 2) { // Stop before chatbot (last phase)
        const np = PHASES[ci + 1];
        html += `<button onclick="goToPhase('${np}')" class="w-full py-3 rounded-xl font-bold bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 transition flex items-center justify-center gap-2 text-sm">Continue to ${PHASE_LABELS[ci + 1]} <span class="material-symbols-rounded text-sm">arrow_forward</span></button>`;
    } else if (phase === 'blueprint') {
        // Chatbot prompt
        html += `<div class="mt-4 p-4 bg-brand-50 rounded-xl dark:bg-brand-900/20 text-center">
            <p class="text-sm font-bold mb-2">Ready to build?</p>
            <button onclick="openChatFab()" class="px-5 py-2 rounded-lg bg-brand-500 text-white text-sm font-bold shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition">Message Mentor</button>
        </div>`;
    }
    area.innerHTML = html;
}

function renderBlueprint(ai) {
    return `
        <div class="glass p-6 rounded-2xl border border-brand-500/20 relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 to-purple-400"></div>
            <h2 class="text-xl font-black mb-1">${esc(ai.final_title || 'Project Blueprint')}</h2>
            <p class="text-xs text-neutral-400 font-mono mb-4">FINAL BLUEPRINT</p>
            
            <div class="space-y-4">
                <div>
                    <h3 class="text-xs font-bold uppercase text-brand-500 mb-1">Problem & Solution</h3>
                    <p class="text-sm text-neutral-600 dark:text-white/70 mb-1">${esc(ai.final_problem)}</p>
                    <p class="text-sm font-semibold">${esc(ai.final_solution)}</p>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-neutral-50 dark:bg-white/5 p-3 rounded-xl">
                        <h3 class="text-[10px] font-bold uppercase text-neutral-400 mb-1">Timeline</h3>
                        <p class="font-bold">${ai.final_timeline_weeks || '?'} Weeks</p>
                    </div>
                    <div class="bg-neutral-50 dark:bg-white/5 p-3 rounded-xl">
                        <h3 class="text-[10px] font-bold uppercase text-neutral-400 mb-1">Difficulty</h3>
                        <p class="font-bold">${ai.final_difficulty || 3}/5</p>
                    </div>
                </div>

                <div>
                    <h3 class="text-xs font-bold uppercase text-brand-500 mb-2">Milestones</h3>
                    <div class="space-y-1.5">
                        ${(ai.final_milestones || []).map((m, i) => `
                            <div class="flex gap-2 text-sm">
                                <span class="font-mono text-xs text-neutral-400 w-4">${i + 1}.</span>
                                <span>${esc(m)}</span>
                            </div>`).join('')}
                    </div>
                </div>

                <div>
                    <h3 class="text-xs font-bold uppercase text-brand-500 mb-2">Tech Stack</h3>
                    <div class="flex flex-wrap gap-1.5">
                        ${(ai.final_tech_stack || []).map(t => `<span class="tech-tag">${esc(t)}</span>`).join('')}
                    </div>
                </div>
            </div>

            <div class="mt-6 pt-4 border-t border-black/5 dark:border-white/5 text-center">
                 <button onclick="openChatFab()" class="w-full py-3 rounded-xl bg-brand-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition">
                    <span class="material-symbols-rounded">chat</span> Ask Mentor Needed Help
                </button>
            </div>
        </div>
    `;
}

function openChatFab() {
    document.getElementById('chatFab').click();
}

function goToPhase(p) { currentPhase = p; updatePhaseNav(); renderPhaseContent(); }
function toggleOpt(btn, grp) { document.querySelectorAll(`#${grp} .option-btn`).forEach(b => b.classList.remove('sel')); btn.classList.add('sel'); }
function getSelected(grp) { const s = document.querySelector(`#${grp} .option-btn.sel`); return s ? s.textContent.trim() : null; }
async function apiFetch(u) { const r = await fetch(apiBase + u, { headers: { 'Authorization': 'Bearer ' + token } }); return r.json(); }
async function apiPost(u, b) { const r = await fetch(apiBase + u, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }, body: JSON.stringify(b) }); return r.json(); }
function getCatIcon(c) { return 'lightbulb'; }
function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
