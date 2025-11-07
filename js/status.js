// Simple backend status widget (API + DB)
(function(){
  function mount(){
    try {
      const footer = document.querySelector('.footer');
      if (!footer) return;
      const span = document.createElement('span');
      span.id = 'statusBadge';
      span.style.float = 'right';
      span.style.opacity = '0.8';
      span.style.fontSize = '12px';
      span.textContent = 'API: offline';
      footer.appendChild(span);
      refresh();
      setInterval(refresh, 20000);
    } catch {}
  }

  async function refresh(){
    const el = document.getElementById('statusBadge'); if (!el) return;
    try {
      if (!(window.API && API.hasAPI)) { el.textContent = 'API: not set'; return; }
      const res = await fetch(API.base + '/actuator/health', { cache: 'no-cache' });
      if (!res.ok) { el.textContent = 'API: error'; return; }
      const j = await res.json();
      const db = j?.components?.db?.status || j?.status;
      if (String(j?.status||'').toUpperCase()==='UP') {
        el.textContent = 'API: UP' + (db?` (DB: ${db})`: '');
      } else {
        el.textContent = 'API: ' + (j?.status||'unknown');
      }
    } catch { el.textContent = 'API: offline'; }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else { mount(); }
})();

