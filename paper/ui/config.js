// Global API base config for UI pages
// Priority:
// 1) LocalStorage key 'API_BASE'
// 2) If running on localhost/127.0.0.1, use FastAPI default http://127.0.0.1:8000
// 3) Fallback to current origin
(function(){
  try {
    var preset = (typeof window.API_BASE === 'string' && window.API_BASE.trim()) || null;
    var saved = !preset && localStorage.getItem('API_BASE');
    var resolved = preset || (saved && /^https?:\/\//i.test(saved) ? saved : null);
    if (!resolved) {
      var origin = (typeof location !== 'undefined' && location.origin) ? location.origin : '';
      resolved = /localhost|127\.0\.0\.1/.test(origin) ? 'http://127.0.0.1:8000' : (origin || 'http://127.0.0.1:8000');
    }
      resolved = resolved.replace(/\/$/, '');
    window.API_BASE = resolved;
    window.__API_BASE = resolved;
  } catch (_) {
    var fallback = 'http://127.0.0.1:8000';
    window.API_BASE = fallback;
    window.__API_BASE = fallback;
  }
})();

// Global Theme manager: keep theme consistent across pages
(function(){
  try {
    var KEY_PRIMARY = 'cx-theme';
    var ALT_KEYS = ['theme', 'px-theme'];
    var root = document.documentElement;

    function readStored(){
      try {
        var v = localStorage.getItem(KEY_PRIMARY);
        if (v) return v;
        for (var i=0;i<ALT_KEYS.length;i++){
          v = localStorage.getItem(ALT_KEYS[i]);
          if (v) return v;
        }
      } catch(_){}
      return null;
    }

    function writeStored(val){
      try { localStorage.setItem(KEY_PRIMARY, val); } catch(_){}
      for (var i=0;i<ALT_KEYS.length;i++){
        try { localStorage.setItem(ALT_KEYS[i], val); } catch(_){}
      }
    }

    function apply(val){
      var wantDark = (val === 'dark');
      root.classList.toggle('dark', wantDark);
      try { root.setAttribute('data-theme', wantDark ? 'dark' : 'light'); } catch(_){ }
      writeStored(wantDark ? 'dark' : 'light');
      try { root.style.colorScheme = wantDark ? 'dark' : 'light'; } catch(_){}
      return wantDark ? 'dark' : 'light';
    }

    function init(){
      var stored = readStored();
      if (!stored){
        var prefersDark = false;
        try { prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; } catch(_){}
        stored = prefersDark ? 'dark' : 'light';
      }
      apply(stored);
    }

    function get(){ return (readStored() || (root.classList.contains('dark') ? 'dark' : 'light')); }
    function set(val){ return apply(val === 'dark' ? 'dark' : 'light'); }
    function toggle(){ return apply(get() === 'dark' ? 'light' : 'dark'); }

    // Expose and initialize
    window.Theme = { get:get, set:set, toggle:toggle, init:init };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
    else init();

    // Back-compat for pages using onclick="toggleTheme()"
    if (typeof window.toggleTheme !== 'function') window.toggleTheme = toggle;

    // Sync on system preference changes
    try {
      if (window.matchMedia){
        var mq = window.matchMedia('(prefers-color-scheme: dark)');
        mq.addEventListener && mq.addEventListener('change', function(e){
          var stored = readStored();
          if (!stored) apply(e.matches ? 'dark' : 'light');
        });
      }
    } catch(_){}
  } catch(_){}
})();

(function(){
  window.__TUNE_AI_ENABLED = false;
  window.__CHAT_API_BASE = (window.__API_BASE || 'http://127.0.0.1:8000') + '/api/tune-ai';
})();

(function(){
  function setupNavDropdown(btnId, menuId){
    var btn = document.getElementById(btnId);
    var menu = document.getElementById(menuId);
    if (!btn || !menu) return;
    var hide = function(){ menu.classList.add('hidden'); };
    btn.addEventListener('click', function(event){
      event.preventDefault();
      event.stopPropagation();
      menu.classList.toggle('hidden');
    });
    document.addEventListener('click', function(event){
      if (menu.classList.contains('hidden')) return;
      if (!menu.contains(event.target) && !btn.contains(event.target)) hide();
    });
    window.addEventListener('blur', hide);
  }
  function setupMobileMenuReset(){
    var menuBtn = document.getElementById('menuBtn');
    if (!menuBtn) return;
    menuBtn.addEventListener('click', function(){
      var mobileMenu = document.getElementById('navProjectsMenuMobile');
      if (mobileMenu) mobileMenu.classList.add('hidden');
    });
  }
  var init = function(){
    setupNavDropdown('navProjectsBtn', 'navProjectsMenu');
    setupNavDropdown('navProjectsBtnMobile', 'navProjectsMenuMobile');
    setupMobileMenuReset();
  };
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();

// TuNe AI Chat Widget (global)
(function(){
  if (!('document' in window)) return;
  var enabled = typeof window.__TUNE_AI_ENABLED === 'undefined' ? true : !!window.__TUNE_AI_ENABLED;
  if (!enabled) return;

  function ready(fn){
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  }

  ready(function initTuNeAI(){
    if (document.getElementById('tune-ai-panel')) return; // already injected

    var API = (window.__CHAT_API_BASE || ((window.__API_BASE || 'http://127.0.0.1:8000').replace(/\/$/, '') + '/api/tune-ai')).replace(/\/$/, '');
    var keyOpen = 'tune-ai-open:' + (location && location.pathname || '/');
    var keyMsgs = 'tune-ai-msgs:' + (location && location.pathname || '/');

    // Inject Material Symbols if not present
    if (!document.querySelector('link[data-mat-symbols]')) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,600,1,0';
      link.setAttribute('data-mat-symbols', '1');
      document.head.appendChild(link);
    }

    // Inject minimal styles (Material-inspired)
    var style = document.createElement('style');
    style.setAttribute('data-tune-ai','1');
    style.textContent = `
      #tune-ai-fab{position:fixed;right:20px;bottom:20px;z-index:70;width:56px;height:56px;border-radius:9999px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#3f6fff,#628fff);color:#fff;border:none;box-shadow:0 12px 30px rgba(63,111,255,.35);cursor:pointer;transition:transform .15s ease,box-shadow .2s ease;}
      #tune-ai-fab:hover{transform:translateY(-2px);box-shadow:0 16px 36px rgba(63,111,255,.45)}
      #tune-ai-fab:active{transform:translateY(0)}
      #tune-ai-fab .ta-icon{font-size:22px;line-height:1;}

      #tune-ai-panel{position:fixed;right:20px;bottom:86px;z-index:70;width:min(92vw,380px);max-height:min(78vh,740px);background:rgba(255,255,255,.95);backdrop-filter:saturate(1.2) blur(8px);-webkit-backdrop-filter:saturate(1.2) blur(8px);border:1px solid rgba(0,0,0,.08);border-radius:16px;box-shadow:0 18px 50px rgba(0,0,0,.18);display:flex;flex-direction:column;opacity:0;pointer-events:none;transform:translateY(12px) scale(.98);transition:opacity .18s ease, transform .18s ease;}
      .dark #tune-ai-panel{background:rgba(20,24,33,.85);border-color:rgba(255,255,255,.12);box-shadow:0 18px 50px rgba(0,0,0,.45)}
      #tune-ai-panel.ta-open{opacity:1;pointer-events:auto;transform:translateY(0) scale(1)}

      #taHead{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-bottom:1px solid rgba(0,0,0,.06);}
      .dark #taHead{border-bottom-color:rgba(255,255,255,.12)}
      #taTitle{display:flex;align-items:center;gap:8px;font-weight:700}
      #taBadge{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:8px;background:linear-gradient(135deg,#3f6fff,#628fff);color:#fff;font-size:13px;box-shadow:0 6px 16px rgba(63,111,255,.35)}
      #taClose{appearance:none;background:transparent;border:none;color:inherit;opacity:.7;cursor:pointer;border-radius:8px;padding:6px}
      #taClose:hover{opacity:1;background:rgba(0,0,0,.06)}
      .dark #taClose:hover{background:rgba(255,255,255,.06)}

      #taMsgs{flex:1;overflow:auto;padding:12px 12px 6px 12px;scroll-behavior:smooth}
      .ta-bubble{max-width:85%;margin:4px 0;padding:8px 10px;border-radius:12px;font-size:13px;line-height:1.35;border:1px solid rgba(0,0,0,.06);word-wrap:anywhere;white-space:pre-wrap}
      .ta-mine{margin-left:auto;background:linear-gradient(135deg,#3f6fff,#628fff);color:#fff;border-color:transparent;box-shadow:0 6px 18px rgba(63,111,255,.25)}
      .ta-theirs{background:rgba(255,255,255,.7);}
      .dark .ta-theirs{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
      /* Readable Markdown inside bubbles */
      .ta-bubble p{margin:0 0 6px 0;white-space:normal}
      .ta-bubble ul,.ta-bubble ol{margin:6px 0 6px 18px;padding-left:18px;white-space:normal}
      .ta-bubble li{margin:4px 0}
      .ta-bubble strong{font-weight:700}
      .ta-bubble em{font-style:italic}
      .ta-bubble code{background:rgba(0,0,0,.06);border-radius:4px;padding:1px 4px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,monospace;font-size:12px}
      .dark .ta-bubble code{background:rgba(255,255,255,.08)}

      #taForm{display:flex;gap:8px;align-items:flex-end;padding:10px;border-top:1px solid rgba(0,0,0,.06)}
      .dark #taForm{border-top-color:rgba(255,255,255,.12)}
      #taInput{flex:1;min-height:38px;max-height:120px;resize:none;border-radius:12px;border:1px solid rgba(0,0,0,.12);padding:8px 10px;font-size:13px;background:rgba(255,255,255,.9)}
      .dark #taInput{background:rgba(0,0,0,.25);border-color:rgba(255,255,255,.18);color:#fff}
      #taSend{appearance:none;border:none;border-radius:12px;background:#3f6fff;color:#fff;padding:10px 12px;font-weight:600;box-shadow:0 6px 16px rgba(63,111,255,.35);cursor:pointer}
      #taSend:disabled{opacity:.6;cursor:not-allowed}

      .ta-typing{display:inline-flex;gap:4px;align-items:center}
      .ta-dot{width:6px;height:6px;border-radius:50%;background:rgba(0,0,0,.45);display:inline-block;animation:ta-bounce 1.2s infinite ease-in-out}
      .dark .ta-dot{background:rgba(255,255,255,.7)}
      .ta-dot:nth-child(2){animation-delay:.15s}
      .ta-dot:nth-child(3){animation-delay:.3s}
      @keyframes ta-bounce{0%,80%,100%{transform:translateY(0);opacity:.75}40%{transform:translateY(-4px);opacity:1}}
    `;
    // Append improved FAB styling, ripple, and tooltip
    style.textContent += `
      /* Enhanced FAB */
      #tune-ai-fab{width:64px;height:64px;border-radius:9999px;overflow:hidden;border:0;background:radial-gradient(120% 120% at 80% 10%,#7aa2ff 0%,#4c6fff 35%,#2f54eb 70%,#1e2db4 100%);box-shadow:0 18px 50px rgba(47,84,235,.35),0 8px 18px rgba(47,84,235,.25);backdrop-filter:saturate(1.1) blur(4px);}
      #tune-ai-fab:hover{transform:translateY(-3px);box-shadow:0 22px 60px rgba(47,84,235,.45),0 10px 22px rgba(47,84,235,.3)}
      #tune-ai-fab:active{transform:translateY(-1px) scale(.98)}
      #tune-ai-fab:focus-visible{outline:3px solid rgba(99,125,255,.65);outline-offset:3px}
      #tune-ai-fab .material-symbols-rounded{font-variation-settings:'FILL' 1,'wght' 600,'GRAD' 0,'opsz' 28;font-size:28px;line-height:1}
      #tune-ai-fab .ta-badge{position:absolute;top:6px;left:6px;padding:3px 6px;border-radius:9999px;background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.35);font:600 10px/1 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;box-shadow:0 4px 10px rgba(0,0,0,.15)}
      .dark #tune-ai-fab{box-shadow:0 18px 50px rgba(0,0,0,.55)}
      /* Gemini-like icon */
      #tune-ai-fab .ta-gemini{display:inline-flex;align-items:center;justify-content:center}
      #tune-ai-fab .ta-gemini svg{width:28px;height:28px;display:block}
      #tune-ai-fab .ta-close{display:none;align-items:center;justify-content:center}
      #tune-ai-fab.ta-open .ta-gemini{display:none}
      #tune-ai-fab.ta-open .ta-close{display:inline-flex}
      /* Ripple */
      #tune-ai-fab .ta-ripple{position:absolute;border-radius:9999px;background:rgba(255,255,255,.45);transform:translate(-50%,-50%) scale(0);animation:ta-ripple .6s ease-out;pointer-events:none}
      @keyframes ta-ripple{to{transform:translate(-50%,-50%) scale(4.5);opacity:0}}
      /* Tooltip */
      #taTip{position:fixed;right:20px;bottom:90px;z-index:71;padding:8px 10px;border-radius:10px;background:rgba(0,0,0,.75);color:#fff;font-size:12px;box-shadow:0 10px 24px rgba(0,0,0,.25);opacity:0;transform:translateY(6px);pointer-events:none;transition:opacity .15s ease,transform .15s ease}
      #taTip.ta-show{opacity:1;transform:translateY(0)}
      .dark #taTip{background:rgba(255,255,255,.12);color:#fff;border:1px solid rgba(255,255,255,.2)}
      /* Subtle motion/glow for Gemini bloom */
      #tune-ai-fab .ta-gemini svg{transition:transform .35s ease;filter:drop-shadow(0 2px 6px rgba(90,110,255,.45))}
      .dark #tune-ai-fab .ta-gemini svg{filter:drop-shadow(0 2px 8px rgba(0,0,0,.55))}
      #tune-ai-fab:hover .ta-gemini svg{transform:rotate(8deg)}
    `;
    document.head.appendChild(style);

    // Build panel
    var panel = document.createElement('section');
    panel.id = 'tune-ai-panel';
    panel.setAttribute('role','dialog');
    panel.setAttribute('aria-label','TuNe AI Chat');
    panel.innerHTML = [
      '<header id="taHead">',
        '<div id="taTitle"><span id="taBadge">AI</span><span>TuNe AI</span></div>',
        '<button id="taClose" aria-label="Close">✕</button>',
      '</header>',
      '<div id="taMsgs" aria-live="polite"></div>',
      '<form id="taForm" class="ta-footer" autocomplete="off">',
        '<textarea id="taInput" placeholder="Ask about projects, requests, or your profile…" rows="1"></textarea>',
        '<button id="taSend" type="submit" aria-label="Send">Send</button>',
      '</form>'
    ].join('');

    // Build FAB
    var fab = document.createElement('button');
    fab.id = 'tune-ai-fab';
    fab.type = 'button';
    fab.setAttribute('aria-label','Open TuNe AI');
    var geminiSVG = ''+
      '<svg viewBox="0 0 48 48" class="ta-gemini-icon" aria-hidden="true" focusable="false">'+
        '<defs>'+
          '<radialGradient id="gg-blue" cx="30%" cy="30%" r="70%">'+
            '<stop offset="0%" stop-color="#A8C7FA"/>'+
            '<stop offset="60%" stop-color="#6EA8FE"/>'+
            '<stop offset="100%" stop-color="#3D5AFE"/>'+
          '</radialGradient>'+
          '<radialGradient id="gg-cyan" cx="70%" cy="30%" r="70%">'+
            '<stop offset="0%" stop-color="#9CF6F6"/>'+
            '<stop offset="60%" stop-color="#56E1E1"/>'+
            '<stop offset="100%" stop-color="#00B8D4"/>'+
          '</radialGradient>'+
          '<radialGradient id="gg-purple" cx="30%" cy="70%" r="70%">'+
            '<stop offset="0%" stop-color="#E1C8FF"/>'+
            '<stop offset="60%" stop-color="#B388FF"/>'+
            '<stop offset="100%" stop-color="#7C4DFF"/>'+
          '</radialGradient>'+
          '<radialGradient id="gg-indigo" cx="70%" cy="70%" r="70%">'+
            '<stop offset="0%" stop-color="#C7D2FF"/>'+
            '<stop offset="60%" stop-color="#8AA9FF"/>'+
            '<stop offset="100%" stop-color="#536DFE"/>'+
          '</radialGradient>'+
        '</defs>'+
        '<g class="gg-bloom" opacity="0.97">'+
          '<circle cx="24" cy="14" r="10" fill="url(#gg-blue)"/>'+
          '<circle cx="24" cy="34" r="10" fill="url(#gg-purple)" opacity="0.96"/>'+
          '<circle cx="14" cy="24" r="10" fill="url(#gg-indigo)" opacity="0.96"/>'+
          '<circle cx="34" cy="24" r="10" fill="url(#gg-cyan)" opacity="0.96"/>'+
        '</g>'+
      '</svg>';
    fab.innerHTML = '<span class="ta-gemini">'+ geminiSVG +'</span><span class="ta-close material-symbols-rounded">close_small</span><span class="ta-badge">AI</span>';

    // Tooltip
    var tip = document.createElement('div');
    tip.id = 'taTip';
    tip.textContent = 'TuNe AI';

    document.body.appendChild(panel);
    document.body.appendChild(fab);
    document.body.appendChild(tip);

    // Open state persistence
    function syncFabIcon(){
      if (panel.classList.contains('ta-open')) fab.classList.add('ta-open');
      else fab.classList.remove('ta-open');
    }
    function setOpen(v){
      if (v){ panel.classList.add('ta-open'); panel.setAttribute('aria-hidden','false'); }
      else { panel.classList.remove('ta-open'); panel.setAttribute('aria-hidden','true'); }
      try { localStorage.setItem(keyOpen, v ? '1' : '0'); } catch(_){ }
      tip.classList.remove('ta-show');
      syncFabIcon();
    }
    var startOpen = false;
    try { startOpen = localStorage.getItem(keyOpen) === '1'; } catch(_){}
    setOpen(startOpen);

    // Ripple on click
    function ripple(e){
      var r = document.createElement('span');
      r.className = 'ta-ripple';
      var rect = fab.getBoundingClientRect();
      var x = (e && e.clientX ? e.clientX : rect.left + rect.width/2) - rect.left;
      var y = (e && e.clientY ? e.clientY : rect.top + rect.height/2) - rect.top;
      r.style.left = x + 'px';
      r.style.top = y + 'px';
      var size = Math.max(rect.width, rect.height) * 2.2;
      r.style.width = r.style.height = size + 'px';
      fab.appendChild(r);
      setTimeout(function(){ try{ fab.removeChild(r); } catch(_){} }, 650);
    }

    function showTip(){ if (!panel.classList.contains('ta-open')) tip.classList.add('ta-show'); }
    function hideTip(){ tip.classList.remove('ta-show'); }

    fab.addEventListener('mouseenter', showTip);
    fab.addEventListener('focus', showTip);
    fab.addEventListener('mouseleave', hideTip);
    fab.addEventListener('blur', hideTip);

    fab.addEventListener('click', function(e){ ripple(e); setOpen(!panel.classList.contains('ta-open')); });
    panel.querySelector('#taClose').addEventListener('click', function(){ setOpen(false); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') setOpen(false); });

    // Conversation state
    var convo = [];
    try { var saved = sessionStorage.getItem(keyMsgs); if (saved) convo = JSON.parse(saved) || []; } catch(_){}
    function saveConvo(){ try { sessionStorage.setItem(keyMsgs, JSON.stringify(convo.slice(-24))); } catch(_){} }

    var msgsEl = panel.querySelector('#taMsgs');

    // Markdown rendering (safe, minimal)
    function escHTML(s){
      return (s||'').replace(/[&<>"']/g,function(c){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]);});
    }
    function sanitizeUrl(u){
      try{ var url = String(u||'').trim(); if(!/^https?:\/\//i.test(url)) return '#'; return url; }catch(_){ return '#'; }
    }
    function mdInline(txt){
      var h = escHTML(txt);
      // links
      h = h.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,function(_,t,u){return '<a href="'+sanitizeUrl(u)+'" target="_blank" rel="noopener noreferrer">'+escHTML(t)+'</a>';});
      // bold
      h = h.replace(/\*\*([^*]+)\*\*/g,'<strong>$1<\/strong>');
      // italics (single *)
      h = h.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g,function(m,p1,p2){return p1+'<em>'+p2+'<\/em>';});
      // inline code
      h = h.replace(/`([^`]+)`/g,'<code>$1<\/code>');
      return h;
    }
    function renderMarkdown(md){
      var text = (md||'').toString().replace(/\r\n/g,'\n');
      var lines = text.split(/\n/);
      var out = [];
      var i=0;
      while(i<lines.length){
        // skip extra blank lines
        if(/^\s*$/.test(lines[i])){ i++; continue; }
        // ordered list
        if(/^\s*\d+\.\s+/.test(lines[i])){
          var items=[]; while(i<lines.length && /^\s*\d+\.\s+/.test(lines[i])){ items.push(lines[i].replace(/^\s*\d+\.\s+/,'').trim()); i++; }
          out.push('<ol>'+items.map(function(it){return '<li>'+mdInline(it)+'</li>';}).join('')+'</ol>');
          continue;
        }
        // unordered list
        if(/^\s*[-*]\s+/.test(lines[i])){
          var uitems=[]; while(i<lines.length && /^\s*[-*]\s+/.test(lines[i])){ uitems.push(lines[i].replace(/^\s*[-*]\s+/,'').trim()); i++; }
          out.push('<ul>'+uitems.map(function(it){return '<li>'+mdInline(it)+'</li>';}).join('')+'</ul>');
          continue;
        }
        // paragraph: consume until blank line
        var para=[]; while(i<lines.length && !/^\s*$/.test(lines[i])){ para.push(lines[i]); i++; }
        var ptxt = para.join(' ').trim();
        if(ptxt){ out.push('<p>'+mdInline(ptxt)+'</p>'); }
      }
      return out.join('');
    }

    function bubbleHTML(role, content){
      var cls = role === 'user' ? 'ta-bubble ta-mine' : 'ta-bubble ta-theirs';
      var html = renderMarkdown(content);
      return '<div class="'+cls+'">'+ html +'</div>';
    }

    function render(){
      var html = '';
      for (var i=0;i<convo.length;i++) html += bubbleHTML(convo[i].role, convo[i].content);
      msgsEl.innerHTML = html;
      msgsEl.scrollTop = msgsEl.scrollHeight;
    }

    if (!convo.length){
      convo.push({ role: 'assistant', content: 'Hi! I’m TuNe AI. Ask me about projects, requests, or your profile.' });
      saveConvo();
    }
    render();

    function showTyping(){
      var t = document.createElement('div');
      t.className = 'ta-bubble ta-theirs';
      t.innerHTML = '<span class="ta-typing"><span class="ta-dot"></span><span class="ta-dot"></span><span class="ta-dot"></span></span>';
      msgsEl.appendChild(t);
      msgsEl.scrollTop = msgsEl.scrollHeight;
      return t;
    }

    var form = panel.querySelector('#taForm');
    var input = panel.querySelector('#taInput');
    var sendBtn = panel.querySelector('#taSend');

    function autosize(){
      input.style.height = 'auto';
      var next = Math.min(120, Math.max(38, input.scrollHeight));
      input.style.height = next + 'px';
    }
    input.addEventListener('input', autosize);
    input.addEventListener('keydown', function(e){
      if (e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); form.requestSubmit(); }
    });

    var sending = false;
    form.addEventListener('submit', function(e){
      e.preventDefault();
      if (sending) return;
      var text = (input.value || '').trim();
      if (!text) return;
      sending = true; sendBtn.disabled = true; input.disabled = true;

      convo.push({ role: 'user', content: text });
      input.value = ''; autosize(); saveConvo(); render();

      var typingNode = showTyping();

      var payload = { messages: convo.map(function(m){ return { role:m.role, content:m.content }; }), context: { page: (location && location.pathname) || '', url: (location && location.href) || '' } };
      fetch(API + '/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function(r){ return r.json().then(function(j){ return { ok:r.ok, body:j }; }); })
        .then(function(res){
          typingNode.remove();
          if (!res.ok){ throw (res.body && (res.body.detail || res.body.message) || 'Error'); }
          var msg = (res.body && res.body.message) || { role:'assistant', content:'Sorry, I could not respond.' };
          convo.push({ role: 'assistant', content: (msg && msg.content) || 'Okay.' });
          saveConvo(); render();
        })
        .catch(function(){
          try { typingNode.remove(); } catch(_){ }
          convo.push({ role: 'assistant', content: 'Sorry, something went wrong. Please try again.' });
          saveConvo(); render();
        })
        .finally(function(){ sending = false; sendBtn.disabled = false; input.disabled = false; input.focus(); });
    });
  });
})();
