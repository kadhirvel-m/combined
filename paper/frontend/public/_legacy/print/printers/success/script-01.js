// Extracted from ui/print/printers/success.html (inline <script> #1).
    const p = new URLSearchParams(location.search); const jobId = p.get('jobId') || ''; const otp = p.get('otp') || '';
    document.getElementById('otp').textContent = otp || '------';
    document.getElementById('job').textContent = 'Job ID: ' + jobId;
    const qr = new QRious({ element: document.getElementById('qr'), value: JSON.stringify({ jobId, otp }), size: 180 });
    document.getElementById('viewJob').href = `../orders/detail.html?jobId=${encodeURIComponent(jobId)}`;
    document.getElementById('share').addEventListener('click', async (e) => {
      e.preventDefault(); const text = `PaperX Print Job\nJob: ${jobId}\nOTP: ${otp}`;
      try { await navigator.clipboard.writeText(text); e.currentTarget.textContent = 'Copied'; setTimeout(() => e.currentTarget.textContent = 'Share', 1200); } catch { }
    });
