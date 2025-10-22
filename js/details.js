// js/details.js
// Detalhes com estrelas interativas (maiores) gravando no Ratings.
// Se deslogado, salva intenção de avaliação e envia ao login; após login, aplica a nota.

document.addEventListener("DOMContentLoaded", () => {
  // pega id da URL
  const params  = new URLSearchParams(location.search);                    // parser de query
  const mediaId = params.get("id");                                       // ?id=...
  const card    = document.getElementById("detailsCard");                 // container

  // dataset local (ajuste se usa DATA/MOCK_DATA)
  const DATASET = window.DATA || window.MOCK_DATA || [];                  // catálogo
  const item    = DATASET.find(x => String(x.id) === String(mediaId));    // busca item

  // guarda/cai fora se faltar algo
  if (!card || !mediaId || !item) {
    if (card) card.innerHTML = "<p style='padding:12px'>Título não encontrado.</p>";
    return;
  }

  // rótulos básicos
  const typeLabel = item.type === "series" ? "Série" : "Filme";           // tipo
  const poster    = item.poster || "";                                    // poster

  // monta a UI (inclui um contêiner id="ratingStars" onde as estrelas vão ser criadas)
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

  // elemento onde as estrelas serão renderizadas
  const ratingEl = document.getElementById("ratingStars");                // contêiner
  ratingEl.style.fontSize = "28px";                                       // tamanho maior
  ratingEl.style.lineHeight = "1";                                        // compacto
  ratingEl.style.letterSpacing = "4px";                                   // espaçamento

  // desenha 5 estrelas conforme a nota ativa
  function renderStars(active) {
    ratingEl.innerHTML = "";                                              // limpa
    for (let i = 1; i <= 5; i++) {
      const b = document.createElement("button");                         // cada estrela é um botão
      b.type = "button";
      b.className = "rating__star";
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", String(i <= (active || 0)));
      b.title = `${i} estrelas`;
      b.textContent = i <= (active || 0) ? "★" : "☆";                     // estrela preenchida/vazia

      // preview no hover
      b.addEventListener("mouseenter", () => renderStars(i));             // mostra até i
      b.addEventListener("mouseleave", () => {                            // volta ao valor atual
        const cur = (window.Ratings && Ratings.get(mediaId)) || null;
        renderStars(cur?.rating || 0);
      });

      // clique para avaliar
      b.addEventListener("click", () => {
        // se não logado, salva intenção e manda ao login
        if (window.AUTH?.isLogged && !window.AUTH.isLogged()) {
          const pending = { id: String(mediaId), rating: i, back: location.pathname + location.search };
          localStorage.setItem("cinefile_pending_rating", JSON.stringify(pending));
          const back = encodeURIComponent(pending.back);
          location.href = `login.html?redirect=${back}`;
          return;
        }
        // logado: grava
        if (window.Ratings && typeof Ratings.set === "function") {
          Ratings.set(mediaId, i);
        }
        renderStars(i);                                                   // feedback imediato
        // (opcional) redirecionar depois:
        // setTimeout(() => location.href = "watched.html", 200);
      });

      ratingEl.appendChild(b);                                            // anexa estrela
    }
  }

  // estado inicial das estrelas (usa nota salva, se houver)
  const current = (window.Ratings && Ratings.get(mediaId)) || null;       // lê avaliação
  renderStars(current?.rating || 0);                                      // renderiza

  // ---- WATCHLIST (usa LISTS.js) ----
  const btnWatchlist = document.getElementById("btnWatchlist");           // botão

  function wlUpdate() {                                                   // atualiza texto/estado
    const on = window.LISTS?.has?.(mediaId);
    btnWatchlist.classList.toggle("is-on", !!on);
    btnWatchlist.setAttribute("aria-pressed", on ? "true" : "false");
    btnWatchlist.textContent = on ? "✓ Na Watchlist" : "+ Watchlist";
  }
  function wlToggle() { window.LISTS?.toggle?.(mediaId); }                // alterna storage

  btnWatchlist.addEventListener("click", (e) => {                         // clique
    if (window.AUTH?.isLogged && !window.AUTH.isLogged()) {
      e.preventDefault();
      const back = encodeURIComponent(location.pathname + location.search);
      location.href = `login.html?redirect=${back}`;
      return;
    }
    wlToggle();
    wlUpdate();
  });

  wlUpdate();                                                             // estado inicial
});
