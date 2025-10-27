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

      <div class="details__actions">
        <button class="btn auth-action" id="btnWatchlist" aria-pressed="false">+ Watchlist</button>
      </div>

      <a href="javascript:history.back()" class="btn details__back">Voltar</a>
    </div>
  `;

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
    wlUpdate();
  });
  wlUpdate();
});

