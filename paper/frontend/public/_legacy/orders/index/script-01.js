// Extracted from ui/orders/index.html (inline <script> #1).
    function $(s){return document.querySelector(s)}
    function card(j){
      const a = document.createElement('a'); a.href = `./detail.html?jobId=${encodeURIComponent(j.id)}`; a.className='group block rounded-2xl glass ring-1 ring-black/5 dark:ring-white/10 p-4 hover:shadow-glow';
      a.innerHTML = `<div class="flex items-start gap-3">
        <div class="shrink-0 w-10 h-10 rounded-full bg-brand-500/15 grid place-items-center"><span class="material-symbols-rounded">print</span></div>
        <div class="flex-1 min-w-0"><div class="font-semibold truncate">${j.shop_id || 'Shop'}</div>
        <div class="text-[12px] opacity-70">${j.status}</div></div>
        <div class="text-[11px] opacity-70">${(j.created_at||'').slice(0,16).replace('T',' ')}</div>
      </div>`; return a;
    }
    async function load(status){
      const url = new URL((window.API_BASE||'') + '/api/orders'); if (status) url.searchParams.set('status', status);
      const r = await fetch(url).catch(()=>null); const j = r&&r.ok? await r.json():{jobs:[]}; const list = j.jobs||[];
      const wrap = $('#list'); wrap.innerHTML=''; list.forEach(x => wrap.appendChild(card(x))); $('#empty').classList.toggle('hidden', list.length>0);
    }
    document.querySelectorAll('.tab').forEach(b => b.addEventListener('click', (e)=>{
      document.querySelectorAll('.tab').forEach(x => x.classList.remove('bg-brand-500/90','text-white'));
      e.currentTarget.classList.add('bg-brand-500/90','text-white'); load(e.currentTarget.dataset.s);
    }));
    document.addEventListener('DOMContentLoaded', ()=> load(''));
