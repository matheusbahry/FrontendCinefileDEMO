// js/details.js
// Página de Detalhes: estrelas interativas (sem recriar DOM no hover), gravação robusta de avaliação,
// fluxo de login com pendência e suporte à Watchlist com guardas de dependência.

document.addEventListener("DOMContentLoaded", () => {
  // ===== helpers =====
  const isLogged = () => {
    try { if (window.AUTH?.isLogged) return !!window.AUTH.isLogged(); } catch {}
    try {
      return (
        localStorage.getItem("cinefile_logged") === "true" ||
        localStorage.getItem("cinefile_logged_in") === "true" ||
        !!localStorage.getItem("cinefile_username")
      );
    } catch {}
    return false;
  };

  // Ratings seguro: usa Ratings.set/get quando disponível; senão grava direto no localStorage
  const RatingsSafe = {
    get(id) {
      if (window.Ratings?.get) return window.Ratings.get(id);
      try {
        const map = JSON.parse(localStorage.getItem("cinefile_ratings") || "{}");
        return map[String(id)] || null;
      } catch { return null; }
    },
    set(id, rating) {
      if (window.Ratings?.set) return window.Ratings.set(id, rating);
      try {
        const KEY = "cinefile_ratings";
        const map = JSON.parse(localStorage.getItem(KEY) || "{}");
        map[String(id)] = {
          rating: Math.max(1, Math.min(5, Number(rating || 0))),
          ts: Date.now()
        };
        localStorage.setItem(KEY, JSON.stringify(map));
        return map[String(id)];
      } catch { return null; }
    }
  };

  // Watchlist seguro
  const ListsSafe = {
    has:   (id) => !!(window.LISTS?.has ? window.LISTS.has(String(id)) : false),
    toggle:(id) => { try { window.LISTS?.toggle?.(String(id)); } catch {} }
  };

  // ===== parâmetros e elementos =====
  const params  = new URLSearchParams(location.search);
  const mediaId = params.get("id");
  const card    = document.getElementById("detailsCard");

  const DATASET = window.DATA || window.MOCK_DATA || [];
  const item    = DATASET.find(x => String(x.id) === String(mediaId));

  if (!card || !mediaId || !item) {
    if (card) card.innerHTML = "<p style='padding:12px'>Título não encontrado.</p>";
    return;
  }

  const typeLabel = item.type === "series" ? "Série" : "Filme";
  const poster    = item.poster || "";

  // ===== markup =====
  card.innerHTML = `
    <img class="details__poster" src="${poster}" alt="Pôster de ${item.title}">
    <div>
      <h1 class="details__title">${item.title}</h1>
      <div class="details__meta">${item.year} • ${typeLabel}</div>

      <div class="rating" id="ratingStars" aria-label="Avalie de 1 a 5 estrelas" role="radiogroup"></div>
      <div id="avgRatingBox" class="muted" style="margin-top:6px"></div>

      <div class="details__actions">
        <button class="btn auth-action" id="btnWatchlist" aria-pressed="false">+ Watchlist</button>
      </div>

      <a href="javascript:history.back()" class="btn details__back">Voltar</a>
    </div>
  `;

  // Extra (TMDB: sinopse, elenco)
  (async () => {
    try {
      if (!(window.API && API.hasAPI && item && item.tmdbId)) return;
      const apiType = item.type === 'series' ? 'tv' : 'movie';
      let details = await API.tmdbDetails(apiType, Number(item.tmdbId));
      if (typeof details === 'string') details = JSON.parse(details);
      const extra = document.createElement('div');
      extra.className = 'details__extra';
      const overview = details?.overview || '';
      const runtime = details?.runtime || details?.episode_run_time?.[0] || '';
      const meta = [];
      if (runtime) meta.push(`${runtime} min`);
      if (details?.number_of_seasons) meta.push(`${details.number_of_seasons} temporadas`);
      extra.innerHTML = `
        <div class="muted" style="margin-top:8px">${meta.join(' • ')}</div>
        ${overview ? `<p style="margin-top:8px">${overview}</p>`: ''}
        <div id="castBox" class="muted" style="margin-top:8px"></div>
      `;
      card.appendChild(extra);
      try {
        let credits = await API.tmdbCredits(apiType, Number(item.tmdbId));
        if (typeof credits === 'string') credits = JSON.parse(credits);
        const cast = (credits?.cast || []).slice(0,6).map(c => c.name).join(', ');
        const crew = credits?.crew || [];
        const directors = crew.filter(x => x.job==='Director').map(x=>x.name).slice(0,2).join(', ');
        const castEl = extra.querySelector('#castBox');
        let html = '';
        if (directors) html += `<div><strong>Direção:</strong> ${directors}</div>`;
        if (cast) html += `<div><strong>Elenco:</strong> ${cast}</div>`;
        castEl.innerHTML = html;
      } catch {}
    } catch {}
  })();

  // Média de avaliações (backend)
  try {
    if (window.API && API.hasAPI && item && item.tmdbId) {
      const box = document.getElementById('avgRatingBox');
      const typeKey = item.type === 'series' ? 'series' : 'movie';
      API.summary(typeKey, Number(item.tmdbId)).then(s => {
        if (!s) return;
        const avg = Number(s.avg||0);
        const cnt = Number(s.count||0);
        const stars = '★'.repeat(Math.round(avg)) + '☆'.repeat(5 - Math.round(avg));
        if (box) box.textContent = `Média: ${avg.toFixed(1)} (${cnt}) ${stars}`;
      }).catch(()=>{});
    }
  } catch {}

  // Marcar como assistido (log) + data opcional
  (function(){
    try {
      if (!(window.API && API.hasAPI && item && item.tmdbId)) return;
      const date = document.createElement('input');
      date.type = 'date';
      date.className = 'form-control';
      date.style.maxWidth = '180px';
      date.style.display = 'inline-block';
      date.style.marginLeft = '8px';
      const btn = document.createElement('button');
      btn.className = 'btn auth-action'; btn.style.marginLeft='8px';
      btn.textContent = 'Marcar como assistido';
      const act = document.querySelector('.details__actions');
      act?.appendChild(date);
      act?.appendChild(btn);
      btn.addEventListener('click', async (e)=>{
        e.preventDefault();
        const mt = item.type === 'series' ? 'SERIES' : 'MOVIE';
        let iso;
        try { const v = date.value; if (v) iso = new Date(v+ 'T00:00:00').toISOString(); } catch {}
        try { await API.addWatched(mt, Number(item.tmdbId), iso); btn.textContent='Assistido ✔'; btn.disabled=true; } catch {}
      });
    } catch {}
  })();

  // Avaliar temporada (séries)
  ;(async function(){
    try {
      if (!(window.API && API.hasAPI && item && item.tmdbId && item.type==='series')) return;
      let details = await API.tmdbDetails('tv', Number(item.tmdbId));
      if (typeof details === 'string') details = JSON.parse(details);
      const seasons = Array.isArray(details?.seasons) ? details.seasons : [];
      if (!seasons.length) return;
      const wrap = document.createElement('div');
      wrap.style.marginTop = '10px';
      wrap.innerHTML = `
        <label style="display:block;margin-bottom:4px">Avaliar temporada</label>
        <div style="display:flex;gap:8px;align-items:center">
          <select id="selSeason" class="form-select" style="width:auto"></select>
          <div id="seasonStars" aria-label="Avalie temporada" role="radiogroup"></div>
        </div>`;
      card.appendChild(wrap);
      const sel = wrap.querySelector('#selSeason');
      seasons.forEach(s => { const o=document.createElement('option'); o.value=String(s.season_number); o.textContent=s.name||`Temporada ${s.season_number}`; sel.appendChild(o); });
      const box = wrap.querySelector('#seasonStars');
      const buttons=[]; const paint=n=>{buttons.forEach((b,i)=>b.textContent=(i<n)?'★':'☆');};
      for(let i=1;i<=5;i++){ const b=document.createElement('button'); b.type='button'; b.className='btn'; b.textContent='☆'; b.addEventListener('click', async()=>{ try{ await API.rateSeason(Number(item.tmdbId), Number(sel.value||1), i); paint(i);}catch{} }); box.appendChild(b); buttons.push(b);} paint(0);
    } catch {}
  })();

  // Comentários (somente quando API está configurada; não altera layout base)
  try {
    if (window.API && API.hasAPI) {
      const sect = document.createElement('section');
      sect.style.marginTop = '12px';
      sect.innerHTML = `
        <h2 style="margin:0 0 6px 0;font-size:18px">Comentários</h2>
        <div id="commentsList" style="display:grid;gap:8px"></div>
        <form id="commentForm" class="auth-action" style="display:grid;gap:8px;margin-top:8px">
          <textarea id="commentText" rows="3" maxlength="1000" placeholder="Escreva um comentário..." required style="resize:vertical;padding:8px"></textarea>
          <div style="display:flex;justify-content:flex-end"><button type="submit" class="btn">Enviar</button></div>
        </form>
        <div id="commentsState" class="muted" style="padding-top:6px"></div>
      `;
      card.appendChild(sect);

      const listEl = sect.querySelector('#commentsList');
      const formEl = sect.querySelector('#commentForm');
      const textEl = sect.querySelector('#commentText');
      const stateEl= sect.querySelector('#commentsState');
      const apiType = item.type === 'series' ? 'series' : 'movie';

      function renderComments(arr){
        listEl.innerHTML = '';
        if (!arr || !arr.length){ stateEl.textContent = 'Sem comentários.'; return; }
        stateEl.textContent = '';
        arr.forEach(c => {
          const row = document.createElement('div');
          row.style.display = 'grid';
          row.style.gridTemplateColumns = '1fr auto';
          row.style.gap = '8px';
          const body = document.createElement('div');
          const name = document.createElement('div');
          name.style.fontWeight = '600';
          name.textContent = c.username ? '@' + c.username : 'usuário';
          const text = document.createElement('div');
          text.textContent = c.text || '';
          body.appendChild(name); body.appendChild(text);
          row.appendChild(body);
          const isAdmin = (document.body.getAttribute('data-role')||'').toUpperCase()==='ADMIN';
          if (c.own || isAdmin){
            const del = document.createElement('button');
            del.className = 'btn'; del.textContent = 'Excluir';
            del.addEventListener('click', async (e)=>{ e.preventDefault(); try { await API.delComment(c.id); await load(); } catch {} });
            row.appendChild(del);
          }
          listEl.appendChild(row);
        });
      }

      async function load(){
        try { const arr = await API.getComments(apiType, Number(item.tmdbId)); renderComments(arr); }
        catch { stateEl.textContent = 'Falha ao carregar comentários.'; }
      }

      formEl.addEventListener('submit', async (e)=>{
        e.preventDefault();
        const txt = (textEl.value || '').trim(); if (!txt) return;
        try { const mt = item.type === 'series' ? 'SERIES' : 'MOVIE'; await API.addComment(mt, Number(item.tmdbId), txt); textEl.value=''; await load(); }
        catch { stateEl.textContent = 'Não foi possível enviar seu comentário.'; }
      });

      load();
    }
  } catch {}

  // ===== RATING UI (sem recriar DOM no hover) =====
  const ratingEl = document.getElementById("ratingStars");
  ratingEl.style.fontSize = "28px";
  ratingEl.style.lineHeight = "1";
  ratingEl.style.letterSpacing = "4px";

  let currentRating = (RatingsSafe.get(mediaId)?.rating) || 0;

  // cria uma vez os 5 botões
  const stars = Array.from({ length: 5 }, (_, idx) => {
    const i = idx + 1;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "rating__star";
    b.setAttribute("role", "radio");
    b.setAttribute("aria-label", `${i} estrela${i > 1 ? "s" : ""}`);
    b.title = `${i} estrela${i > 1 ? "s" : ""}`;

    // hover: atualiza visual, NÃO recria DOM
    b.addEventListener("mouseenter", () => paint(i));
    b.addEventListener("mouseleave", () => paint(currentRating));

    // ação de avaliar: click + pointerdown para maior confiabilidade
    const doRate = () => {
      if (!isLogged()) {
        const pending = { id: String(mediaId), rating: i, back: location.pathname + location.search };
        try { localStorage.setItem("cinefile_pending_rating", JSON.stringify(pending)); } catch {}
        const back = encodeURIComponent(pending.back);
        location.href = `login.html?redirect=${back}`;
        return;
      }
      RatingsSafe.set(mediaId, i);
      // Also sync to backend when available (uses TMDB id + type)
      try {
        if (window.API && API.hasAPI && item && item.tmdbId) {
          const mt = item.type === 'series' ? 'SERIES' : 'MOVIE';
          API.rate(mt, Number(item.tmdbId), i).catch(()=>{});
        }
      } catch {}
      currentRating = i;
      paint(currentRating); // feedback imediato
    };
    b.addEventListener("click", doRate);
    b.addEventListener("pointerdown", (ev) => { ev.preventDefault(); doRate(); });

    ratingEl.appendChild(b);
    return b;
  });

  // função que pinta sem recriar elementos
  function paint(active) {
    for (let i = 0; i < stars.length; i++) {
      const on = i < (active || 0);
      stars[i].setAttribute("aria-checked", on ? "true" : "false");
      stars[i].textContent = on ? "★" : "☆";
    }
  }
  // render inicial
  paint(currentRating);

  // ===== WATCHLIST =====
  const btnWatchlist = document.getElementById("btnWatchlist");
  function wlUpdate() {
    const on = ListsSafe.has(mediaId);
    btnWatchlist.classList.toggle("is-on", !!on);
    btnWatchlist.setAttribute("aria-pressed", on ? "true" : "false");
    btnWatchlist.textContent = on ? "✓ Na Watchlist" : "+ Watchlist";
  }
  btnWatchlist.addEventListener("click", (e) => {
    if (!isLogged()) {
      e.preventDefault();
      const back = encodeURIComponent(location.pathname + location.search);
      location.href = `login.html?redirect=${back}`;
      return;
    }
    ListsSafe.toggle(mediaId);
    try {
      if (window.API && API.hasAPI && item && item.tmdbId) {
        const t = item.type === 'series' ? 'SERIES' : 'MOVIE';
        API.wlToggle(t, Number(item.tmdbId)).catch(()=>{});
      }
    } catch {}
    wlUpdate();
  });
  wlUpdate();
});
