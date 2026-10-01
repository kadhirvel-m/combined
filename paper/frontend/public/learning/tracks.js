(function(){
  const STORAGE = {
    config: 'px-learning-config',
    language: 'px-learning-language',
    plan: 'px-learning-plan',
    progress: 'px-learning-progress',
    filters: 'px-learning-filters',
    lastTopic: 'px-learning-last-topic'
  };

  function safeParse(value, fallback){
    if (!value) return fallback;
    try { return JSON.parse(value); } catch (_) { return fallback; }
  }

  function resolveAuthToken(){
    try {
      return localStorage.getItem('px_token') || localStorage.getItem('teacherToken') || '';
    } catch (_) {
      return '';
    }
  }

  function requireAuth(options){
    const token = resolveAuthToken();
    if (!token) {
      const redirect = (options && options.redirectTo) || '../login.html';
      if (typeof window !== 'undefined') {
        window.location.href = redirect;
      }
    }
    return token;
  }

  async function apiFetch(path, options){
    const url = (window.API_BASE || '').replace(/\/$/, '') + path;
    const init = Object.assign({
      headers: {},
      credentials: 'include'
    }, options || {});
    const headers = Object.assign({ 'Content-Type': 'application/json' }, init.headers || {});
    const token = resolveAuthToken();
    if (token && !headers.Authorization && !headers.authorization){
      headers.Authorization = 'Bearer ' + token;
    }
    init.headers = headers;
    const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;
    if (init.body && typeof init.body !== 'string' && !isFormData){
      init.body = JSON.stringify(init.body);
    }
    const res = await fetch(url, init);
    if (!res.ok){
      let detail = res.statusText;
      try {
        const data = await res.json();
        detail = data.detail || data.error || JSON.stringify(data);
      } catch (_) {}
      throw new Error(detail || ('Request failed with status ' + res.status));
    }
    return res.json();
  }

  async function fetchLearningConfig(force){
    if (!force){
      const cached = safeParse(sessionStorage.getItem(STORAGE.config), null);
      if (cached) return cached;
    }
    const data = await apiFetch('/api/learning-tracks/config');
    sessionStorage.setItem(STORAGE.config, JSON.stringify(data));
    return data;
  }

  function setLanguage(lang){
    if (typeof lang === 'string' && lang.trim()){
      sessionStorage.setItem(STORAGE.language, lang.trim());
    }
  }

  function getLanguage(){
    return sessionStorage.getItem(STORAGE.language) || '';
  }

  function storeFilters(filters){
    sessionStorage.setItem(STORAGE.filters, JSON.stringify(filters || {}));
  }

  function getFilters(){
    return safeParse(sessionStorage.getItem(STORAGE.filters), {});
  }

  function storePlan(plan){
    sessionStorage.setItem(STORAGE.plan, JSON.stringify(plan));
  }

  function getPlan(){
    return safeParse(sessionStorage.getItem(STORAGE.plan), null);
  }

  function ensurePlan(){
    const plan = getPlan();
    if (!plan){
      window.location.href = 'onboarding.html';
      throw new Error('Learning plan missing');
    }
    return plan;
  }

  function getProgress(){
    return safeParse(localStorage.getItem(STORAGE.progress), {});
  }

  function updateProgress(topicId, status){
    if (!topicId) return;
    const next = Object.assign({}, getProgress());
    next[topicId] = Object.assign({ status: 'not_started', score: null }, next[topicId], { status: status });
    localStorage.setItem(STORAGE.progress, JSON.stringify(next));
    sessionStorage.setItem(STORAGE.progress, JSON.stringify(next));
    persistProgress(topicId, next[topicId].status, next[topicId].score);
    return next;
  }

  function setTopicScore(topicId, score){
    const next = Object.assign({}, getProgress());
    if (!next[topicId]) next[topicId] = { status: 'not_started', score: null };
    next[topicId].score = typeof score === 'number' ? score : null;
    localStorage.setItem(STORAGE.progress, JSON.stringify(next));
    sessionStorage.setItem(STORAGE.progress, JSON.stringify(next));
    persistProgress(topicId, next[topicId].status, next[topicId].score);
    return next;
  }

  function computeProgressMetrics(plan, progress){
    const modules = plan?.modules || [];
    let totalTopics = 0;
    let completedTopics = 0;
    let inProgressTopics = 0;
    modules.forEach(mod => {
      (mod.topics || []).forEach(topic => {
        totalTopics += 1;
        const state = progress[topic.topic_id]?.status || 'not_started';
        if (state === 'completed') completedTopics += 1;
        if (state === 'in_progress') inProgressTopics += 1;
      });
    });
    const completionRate = totalTopics ? Math.round((completedTopics / totalTopics) * 100) : 0;
    return {
      totalTopics,
      completedTopics,
      inProgressTopics,
      completionRate,
    };
  }

  function persistProgress(topicId, status, score){
    const plan = getPlan();
    if (!plan || !topicId) return;
    const token = resolveAuthToken();
    if (!token) return;
    const payload = {
      plan_id: plan.plan_id,
      topic_id: topicId,
      status: status,
      score: typeof score === 'number' && !Number.isNaN(score) ? score : null,
    };
    apiFetch('/api/learning-tracks/progress', {
      method: 'POST',
      body: payload
    }).catch(() => {});
  }

  async function loadLatestPlan(){
    const token = resolveAuthToken();
    if (!token) return null;
    try {
      const snapshot = await apiFetch('/api/learning-tracks/plan/latest');
      if (!snapshot) return null;
      if (snapshot.filters){
        storeFilters(snapshot.filters);
        if (snapshot.filters.language) setLanguage(snapshot.filters.language);
      }
      if (snapshot.plan){
        storePlan(snapshot.plan);
        if (!snapshot.filters && snapshot.plan.language) setLanguage(snapshot.plan.language);
      }
      return snapshot;
    } catch (_) {
      return null;
    }
  }

  async function requestLearningPath(payload){
    const plan = await apiFetch('/api/learning-tracks/path', {
      method: 'POST',
      body: payload
    });
    storePlan(plan);
    storeFilters(payload);
    return plan;
  }

  async function requestPractice(payload){
    return apiFetch('/api/learning-tracks/topic/practice', {
      method: 'POST',
      body: payload
    });
  }

  async function requestMock(payload){
    return apiFetch('/api/learning-tracks/mock', {
      method: 'POST',
      body: payload
    });
  }

  async function requestAnalytics(payload){
    return apiFetch('/api/learning-tracks/analytics', {
      method: 'POST',
      body: payload
    });
  }

  async function requestFacultyBrief(payload){
    return apiFetch('/api/learning-tracks/faculty-brief', {
      method: 'POST',
      body: payload
    });
  }

  async function executeCode(payload){
    return apiFetch('/api/learning-tracks/code/execute', {
      method: 'POST',
      body: payload
    });
  }

  async function explainCode(payload){
    return apiFetch('/api/learning-tracks/code/explain', {
      method: 'POST',
      body: payload
    });
  }

  function setLastTopic(topicId){
    if (topicId){
      sessionStorage.setItem(STORAGE.lastTopic, String(topicId));
    }
  }

  function getLastTopic(){
    return sessionStorage.getItem(STORAGE.lastTopic);
  }

  window.PaperXLearning = {
    fetchLearningConfig,
    apiFetch,
    setLanguage,
    getLanguage,
    storePlan,
    getPlan,
    ensurePlan,
    getProgress,
    updateProgress,
    setTopicScore,
    computeProgressMetrics,
    requestLearningPath,
    requestPractice,
    requestMock,
    requestAnalytics,
    requestFacultyBrief,
    executeCode,
    explainCode,
    setLastTopic,
    getLastTopic,
    storeFilters,
    getFilters,
    requireAuth,
    resolveAuthToken,
    loadLatestPlan,
  };
})();
