// Extracted from ui/orders/detail.html (inline <script> #1).
    const p = new URLSearchParams(location.search); const jobId = p.get('jobId')||'';
    function $(s){return document.querySelector(s)}
    async function load(){
      const r = await fetch((window.API_BASE||'') + '/api/orders/' + encodeURIComponent(jobId)).catch(()=>null);
      const j = r&&r.ok ? await r.json() : { job:{}, events:[] };
      const job = j.job||{};
      $('#summary').textContent = `${job.status||''} • ${job.created_at?job.created_at.replace('T',' ').slice(0,16):''}`;
      const ev = $('#events'); ev.innerHTML = (j.events||[]).map(e => `<div>• <b>${e.status}</b> — <span class="opacity-70">${(e.created_at||'').replace('T',' ').slice(0,16)} ${e.note?('— '+e.note):''}</span></div>`).join('');
      const safeOtp = (job && typeof job.otp === 'string' ? job.otp : '').trim();
      $('#otp').textContent = safeOtp || 'Use generated OTP';
      new QRious({ element: document.getElementById('qr'), value: JSON.stringify({ jobId, otp: safeOtp }), size: 140 });
    }
    document.addEventListener('DOMContentLoaded', load);
