// js/profile.js
// Perfil do usuário: exige login, mostra header e últimos avaliados (até 4).
// Cruza com catálogo local e, se faltar, busca no TMDB para reconstruir o card.

document.addEventListener("DOMContentLoaded", () => {
  // ===== 1) Exigir login =====
  const isLogged =
    (window.AUTH && typeof AUTH.isLogged === "function" && AUTH.isLogged()) ||
    localStorage.getItem("cinefile_logged_in") === "true" ||
    localStorage.getItem("cinefile_logged") === "true";

  if (!isLogged) {
    window.location.href = "login.html";
    return;
  }

  // ===== 2) Header do perfil =====
  const rawUser  = localStorage.getItem("cinefile_username") || "usuario";
  const username = rawUser.startsWith("@") ? rawUser : `@${rawUser}`;
  const nameEl   = document.getElementById("profileName");
  if (nameEl) nameEl.textContent = username;

  const avatarEl = document.getElementById("profileAvatar");
  if (avatarEl) {
    const saved = localStorage.getItem("cinefile_avatar");
    avatarEl.src = saved || "assets/avatar.png";
    avatarEl.onerror = () => { avatarEl.src = "assets/picfoto.png"; };
  }

  // ===== 3) Últimos avaliados =====
  const CATALOG  = (window.DATA || window.MOCK_DATA || []).slice();
  const indexById = new Map(CATALOG.map(obj => [String(obj.id), obj]));
  const indexByTmdb = new Map(CATALOG.map(obj => [String(obj.tmdbId), obj]));

  const scroller = document.getElementById("pfScroller");
  const metaEl   = document.getElementById("pfLastMeta");
  if (!scroller) return;

  // Lê avaliações salvas
  let RATINGS = {};
  try { RATINGS = JSON.parse(localStorage.getItem("cinefile_ratings") || "{}"); }
  catch { RATINGS = {}; }

  // Ordena por mais recente, filtra > 0 e pega até 4
  const ordered = Object.entries(RATINGS)
    .map(([id, r]) => ({
      id: String(id),
      rating: Number(r?.rating || 0),
      ts: Number(r?.ts || 0)
    }))
    .filter(x => x.rating > 0)
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 4);

  // Se nada avaliado
  if (!ordered.length) {
    scroller.innerHTML = "";
    if (metaEl) metaEl.textContent = "Nenhum título avaliado ainda";
    return;
  }

  // Helper de estrelas
  const starString = (n) => {
    const s = Math.max(0, Math.min(5, Number(n || 0)));
    return "★".repeat(s) + "☆".repeat(5 - s);
  };

  // Imagem TMDB
  const tmdbImage = (path) => path ? `https://image.tmdb.org/t/p/w342${path}` : "";

  // Mapeia detalhes TMDB para o nosso modelo
  function mapTMDBDetails(d, id) {
    if (!d) return null;
    const isTv = !!d.first_air_date || d.media_type === "tv" || d.type === "series";
    return {
      id: String(id),
      title: d.title || d.name || "(sem título)",
      year: (d.release_date || d.first_air_date || "").slice(0, 4) || "",
      poster: tmdbImage(d.poster_path),
      type: isTv ? "series" : "movie"
    };
  }

  // Busca por ID no TMDB usando tmdb.js se existir, senão fetch direto
  async function fetchFromTMDBById(id) {
    // 0) via backend proxy se houver
    try {
      if (window.API && API.hasAPI) {
        let data = await API.tmdbDetails('movie', id);
        if (typeof data === 'string') data = JSON.parse(data);
        if (data && data.id) return mapTMDBDetails(data, id);
        data = await API.tmdbDetails('tv', id);
        if (typeof data === 'string') data = JSON.parse(data);
        if (data && data.id) return mapTMDBDetails(data, id);
      }
    } catch {}
    // 1) tmdb.js
    try {
      if (window.TMDB) {
        if (typeof TMDB.getDetails === "function") {
          const d = await TMDB.getDetails(id);
          return mapTMDBDetails(d, id);
        }
        if (typeof TMDB.details === "function") {
          const d = await TMDB.details(id);
          return mapTMDBDetails(d, id);
        }
      }
    } catch {}

    // 2) fetch direto
    try {
      const apiKey = window.TMDB?.API_KEY || window.TMDB_KEY || undefined;
      const lang   = "pt-BR";
      if (!apiKey) return null;

      // movie
      let res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=${lang}`);
      if (res.ok) {
        const d = await res.json();
        return {
          id: String(id),
          title: d.title || d.name || "(sem título)",
          year: (d.release_date || "").slice(0, 4) || "",
          poster: tmdbImage(d.poster_path),
          type: "movie"
        };
      }
      // tv
      res = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}&language=${lang}`);
      if (res.ok) {
        const d = await res.json();
        return {
          id: String(id),
          title: d.name || d.title || "(sem título)",
          year: (d.first_air_date || "").slice(0, 4) || "",
          poster: tmdbImage(d.poster_path),
          type: "series"
        };
      }
    } catch {}
    return null;
  }

  (async () => {
    // Tenta backend primeiro
    try {
      if (window.API && API.hasAPI) {
        const list = await API.myRatings();
        const sorted = (Array.isArray(list) ? list : [])
          .slice()
          .sort((a,b)=> new Date(b.updatedAt||b.updateAt||0) - new Date(a.updatedAt||a.updateAt||0))
          .slice(0,4);
        const items = [];
        for (const r of sorted) {
          const tmdbId = String(r.tmdbId);
          const local = indexByTmdb.get(tmdbId);
          if (local) {
            items.push({ ...local, rating: Number(r.stars||r.rating||0) });
          } else {
            const fetched = await fetchFromTMDBById(tmdbId);
            if (fetched) items.push({ ...fetched, rating: Number(r.stars||r.rating||0) });
          }
        }
        scroller.innerHTML = "";
        if (!items.length) {
          if (metaEl) metaEl.textContent = "Nenhum tfdtulo avaliado ainda";
          return;
        }
        if (metaEl) metaEl.textContent = `${items.length} ${items.length === 1 ? "tfdtulo" : "tfdtulos"}`;
        items.forEach(item => {
          let link;
          if (typeof window.createCarouselItem === "function") {
            link = window.createCarouselItem(item);
            link.querySelector(".item__overlay")?.remove();
            link.querySelector(".item__body")?.remove();
          } else {
            link = document.createElement("a");
            link.href = `details.html?id=${encodeURIComponent(String(item.id))}`;
            link.className = "item__link";
            link.innerHTML = `
              <article class="item">
                <img class="item__img" src="${item.poster || ""}" alt="Poster de ${item.title}">
              </article>
            `;
          }
          const wrap = document.createElement("div");
          wrap.style.display = "grid";
          wrap.style.justifyItems = "center";
          wrap.appendChild(link);
          const stars = document.createElement("div");
          stars.className = "watched__stars";
          stars.textContent = starString(item.rating || 0);
          wrap.appendChild(stars);
          scroller.appendChild(wrap);
        });
        scroller.removeAttribute("hidden");
        return; // evita fallback local
      }
    } catch {}
    // Encontra no catálogo local ou busca no TMDB se faltar
    const items = [];
    for (const e of ordered) {
      const local = indexById.get(String(e.id));
      if (local) {
        items.push({ ...local, rating: e.rating, ts: e.ts });
      } else {
        const fetched = await fetchFromTMDBById(e.id);
        if (fetched) items.push({ ...fetched, rating: e.rating, ts: e.ts });
      }
    }

    scroller.innerHTML = "";

    if (!items.length) {
      if (metaEl) metaEl.textContent = "Nenhum título avaliado ainda";
      return;
    }

    if (metaEl) metaEl.textContent = `${items.length} ${items.length === 1 ? "título" : "títulos"}`;

    // Render idêntico ao de “Assistidos”
    items.forEach(item => {
      let link;

      if (typeof window.createCarouselItem === "function") {
        link = window.createCarouselItem(item);
        link.querySelector(".item__overlay")?.remove();
        link.querySelector(".item__body")?.remove();
      } else {
        // Fallback simples
        link = document.createElement("a");
        link.href = `details.html?id=${encodeURIComponent(String(item.id))}`;
        link.className = "item__link";
        link.innerHTML = `
          <article class="item">
            <img class="item__img" src="${item.poster || ""}" alt="Pôster de ${item.title}">
          </article>
        `;
      }

      const wrap = document.createElement("div");
      wrap.style.display = "grid";
      wrap.style.justifyItems = "center";
      wrap.appendChild(link);

      const stars = document.createElement("div");
      stars.className = "watched__stars";
      stars.textContent = starString(item.rating || 0);
      wrap.appendChild(stars);

      scroller.appendChild(wrap);
    });

    // Garante visibilidade
    scroller.removeAttribute("hidden");
  })();

  // ===== Logs recentes (quando API configurada) =====
  (async () => {
    try {
      if (!(window.API && API.hasAPI)) return;
      const logs = await API.myLogs(10);
      if (!Array.isArray(logs) || !logs.length) return;
      const sect = document.createElement('section');
      sect.className = 'row';
      sect.setAttribute('aria-label', 'Últimas atividades');
      sect.innerHTML = `
        <div class="row__head"><h2 class="row__title">Últimas atividades</h2></div>
        <div id="pfLogs" class="row__scroller" tabindex="0" style="display:grid;gap:8px"></div>
      `;
      document.querySelector('main.profile')?.appendChild(sect);
      const box = sect.querySelector('#pfLogs');
      logs.forEach(l => {
        const div = document.createElement('div');
        div.className = 'muted';
        const when = new Date(l.ts || l.timestamp || Date.now());
        let action = String(l.action||'').toLowerCase();
        if (action.includes('rating')) action = 'Avaliou';
        else if (action.includes('watchlist_add')) action = 'Adicionou à Watchlist';
        else if (action.includes('watchlist_remove')) action = 'Removeu da Watchlist';
        else if (action.includes('comment')) action = 'Comentou';
        div.textContent = `${when.toLocaleString()} • ${action} • TMDB ${l.tmdbId}`;
        box.appendChild(div);
      });
    } catch {}
  })();

  // ===== Admin painel (renderizado só para ROLE=ADMIN) =====
  (async () => {
    try {
      if (!(window.API && API.hasAPI)) return;
      const role = document.body.getAttribute('data-role');
      if (role !== 'ADMIN') return;
      const users = await API.admin.listUsers();
      const sect = document.createElement('section');
      sect.className = 'row';
      sect.setAttribute('aria-label', 'Admin');
      sect.innerHTML = `
        <div class="row__head"><h2 class="row__title">Admin • Usuários</h2></div>
        <div id="adminUsers" class="row__scroller" tabindex="0" style="display:grid;gap:8px"></div>
      `;
      document.querySelector('main.profile')?.appendChild(sect);
      const box = sect.querySelector('#adminUsers');
      function render(){
        box.innerHTML='';
        (users || []).forEach(u => {
          const row = document.createElement('div');
          row.style.display = 'grid';
          row.style.gridTemplateColumns = '1fr auto auto';
          row.style.gap = '8px';
          const info = document.createElement('div');
          info.textContent = `@${u.username} • ${u.email || ''}`;
          const sel = document.createElement('select');
          sel.innerHTML = '<option value="USER">USER</option><option value="ADMIN">ADMIN</option>';
          sel.value = String(u.role || 'USER').toUpperCase();
          sel.addEventListener('change', async ()=>{
            try { const res = await API.admin.setRole(u.id, sel.value); u.role = res.role; }
            catch {}
          });
          const del = document.createElement('button');
          del.className = 'btn'; del.textContent = 'Excluir';
          del.addEventListener('click', async ()=>{
            try { await API.admin.deleteUser(u.id); const idx = users.findIndex(x=>x.id===u.id); if (idx>=0) users.splice(idx,1); render(); } catch {}
          });
          row.appendChild(info); row.appendChild(sel); row.appendChild(del);
          box.appendChild(row);
        });
      }
      render();
    } catch {}
  })();
});
