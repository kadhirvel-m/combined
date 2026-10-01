/**
 * PaperX Analytics Tracker
 * Handles session management, heartbeats, and event tracking.
 */
class PaperXAnalytics {
    constructor() {
        // Use global API base from config.js if available, otherwise relative for prod
        const base = (window.API_BASE || '').replace(/\/+$/, '');
        this.apiBase = base ? `${base}/analytics` : '/analytics';
        this.sessionId = localStorage.getItem('paperx_session_id');
        this.userId = null; // Will be set if auth is available
        this.heartbeatInterval = null;
    }

    normalizeToken(value) {
        const raw = String(value || '').trim();
        if (!raw) return '';
        const lower = raw.toLowerCase();
        if (raw === '__COOKIE_AUTH__' || raw === '__cookie__' || lower === 'cookie' || lower === 'null' || lower === 'undefined' || lower === 'none') {
            return '';
        }
        return raw;
    }

    getAuthToken() {
        const keys = ['teacherToken', 'px_token', 'userToken', 'sb-access-token', 'supabase.auth.token'];
        for (const k of keys) {
            try {
                const v = this.normalizeToken(localStorage.getItem(k));
                if (v) return v;
            } catch (_) {}
        }
        try {
            const fb = this.normalizeToken(sessionStorage.getItem('paperx_bearer_fallback'));
            if (fb) return fb;
        } catch (_) {}
        return '';
    }

    authHeaders(extra = {}) {
        const token = this.getAuthToken();
        if (token) return Object.assign({}, extra, { Authorization: `Bearer ${token}` });
        return Object.assign({}, extra);
    }

    parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const payload = JSON.parse(jsonPayload);
            return payload.sub || payload.user_id || payload.id;
        } catch (e) { return null; }
    }

    async init() {
        // Try to get user ID from JWT token
        try {
              const token = this.getAuthToken();
            if (token) {
                 this.userId = this.parseJwt(token);
            }
        } catch (e) {
            console.warn('[Analytics] Failed to decode token', e);
        }

        // Start session
        await this.startSession();

        // Start heartbeat (every 60s)
        this.startHeartbeat();

        // Track page view
        this.track('page_view', { 
            path: window.location.pathname,
            title: document.title
        });

        // Init scroll tracking
        this.trackScrollDepth();

        console.log('[Analytics] Initialized', this.sessionId);
    }

    async startSession() {
        try {
            const payload = {};
            if (this.userId) payload.user_id = this.userId;
            
            const res = await fetch(`${this.apiBase}/session/start`, {
                method: 'POST',
                headers: this.authHeaders({ 'Content-Type': 'application/json' }),
                credentials: 'include',
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.session_id) {
                this.sessionId = data.session_id;
                try {
                    localStorage.setItem('paperx_session_id', this.sessionId);
                } catch (storageErr) {
                    console.warn('[Analytics] Session persistence unavailable', storageErr);
                }
            }
        } catch (e) {
            console.error('[Analytics] Failed to start session', e);
            // If session start fails, clear local session to avoid polluting old ones
            this.sessionId = null;
            try { localStorage.removeItem('paperx_session_id'); } catch (_) {}
        }
    }

    startHeartbeat() {
        if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = setInterval(() => {
            if (!this.sessionId) return;
            fetch(`${this.apiBase}/session/heartbeat`, {
                method: 'POST',
                headers: this.authHeaders({ 'Content-Type': 'application/json' }),
                credentials: 'include',
                body: JSON.stringify({ session_id: this.sessionId })
            }).catch(() => {});
        }, 60000); // 1 min
    }

    async track(eventType, eventData = {}) {
        if (!this.sessionId) return;
        try {
            const payload = {
                session_id: this.sessionId,
                event_type: eventType,
                event_data: eventData
            };
            if (this.userId) payload.user_id = this.userId;

            await fetch(`${this.apiBase}/event`, {
                method: 'POST',
                headers: this.authHeaders({ 'Content-Type': 'application/json' }),
                credentials: 'include',
                body: JSON.stringify(payload)
            });
        } catch (e) {
            console.warn('[Analytics] Track failed', e);
        }
    }

    async feedback(topicId, isHelpful, comment = null) {
        if (!this.userId) return; // Require auth for feedback?
        try {
             await fetch(`${this.apiBase}/feedback/topic`, {
                method: 'POST',
                     headers: this.authHeaders({ 'Content-Type': 'application/json' }),
                     credentials: 'include',
                body: JSON.stringify({
                    user_id: this.userId,
                    topic_id: topicId,
                    is_helpful: isHelpful,
                    comment: comment
                })
            });
        } catch (e) {
            console.error('[Analytics] Feedback failed', e);
        }
    }

    trackScrollDepth() {
        let maxDepth = 0;
        const depths = [25, 50, 75, 90, 100];
        const sent = new Set();
        
        window.addEventListener('scroll', () => {
            if (!this.sessionId) return;
            const h = document.documentElement;
            const b = document.body;
            const st = 'scrollTop', sh = 'scrollHeight';
            const pct = Math.round((h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight) * 100);
            
            if (pct > maxDepth) maxDepth = pct;
            
            depths.forEach(d => {
                if (maxDepth >= d && !sent.has(d)) {
                    sent.add(d);
                    this.track('scroll_depth', { depth: d, page: window.location.pathname });
                }
            });
        }, { passive: true });
    }
}

// Global Instance
window.Analytics = new PaperXAnalytics();

// Auto-init on load
document.addEventListener('DOMContentLoaded', () => {
    window.Analytics.init();
});
