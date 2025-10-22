// aguarda o DOM carregar
document.addEventListener("DOMContentLoaded", () => {
  
  // 1) Exigir login
// declara variável isLogged
  const isLogged =
    (window.AUTH && AUTH.isLogged && AUTH.isLogged()) ||
// acessa localStorage
    localStorage.getItem("cinefile_logged_in") === "true" ||
// acessa localStorage
    localStorage.getItem("cinefile_logged") === "true";

// condição
  if (!isLogged) {
// redireciona navegação
    window.location.href = "login.html";
// retorna
    return;
  }

  // 2) Header do perfil
// declara variável rawUser
  const rawUser = localStorage.getItem("cinefile_username") || "usuario";
// declara variável username
  const username = rawUser.startsWith("@") ? rawUser : `@${rawUser}`;
// declara variável nameEl
  const nameEl   = document.getElementById("profileName");
// condição
  if (nameEl) nameEl.textContent = username;

// declara variável avatarEl
  const avatarEl = document.getElementById("profileAvatar");
// condição
  if (avatarEl) {
// declara variável saved
    const saved = localStorage.getItem("cinefile_avatar");
// atribui valor
    avatarEl.src = saved || "assets/avatar.png";
// atribui valor
    avatarEl.onerror = () => { avatarEl.src = "assets/picfoto.png"; };
  }

  // 3) Últimos avaliados
// declara variável DATASET
  const DATASET  = window.DATA || window.MOCK_DATA || [];
// declara variável scroller
  const scroller = document.getElementById("pfScroller");
// declara variável metaEl
  const metaEl   = document.getElementById("pfLastMeta");
// condição
  if (!scroller) return;

  // Lê avaliações salvas por ratings.js
// declara variável RATINGS
  let RATINGS = {};
// acessa localStorage
  try { RATINGS = JSON.parse(localStorage.getItem("cinefile_ratings") || "{}"); }
// captura erro
  catch { RATINGS = {}; }

  // Ordena por mais recente
// declara variável ordered
  const ordered = Object.entries(RATINGS)
// itera coleção
    .map(([id, r]) => ({
      id,
      rating: Number((r && r.rating) || 0),
      ts: Number((r && r.ts) || 0)
    }))
// itera coleção
    .filter(x => x.rating > 0)
// atribui valor
    .sort((a, b) => b.ts - a.ts);

  // Pega até 4
// declara variável last4
  const last4 = ordered.slice(0, 4).map(e => {
// declara variável item
    const item = DATASET.find(x => String(x.id) === String(e.id));
// retorna
    return item ? { ...item, rating: e.rating } : null;
// itera coleção
  }).filter(Boolean);

  // Função para estrelas
// declara variável starString
  const starString = (n) => {
// declara variável s
    const s = Math.max(0, Math.min(5, Number(n || 0)));
// retorna
    return "★".repeat(s) + "☆".repeat(5 - s);
  };

  // Limpa trilho
// define HTML interno
  scroller.innerHTML = "";

// condição
  if (!last4.length) {
    // Sem itens: mostra meta e não cria placeholders
// condição
    if (metaEl) metaEl.textContent = "Nenhum título avaliado ainda";
// retorna
    return;
  }

// condição
  if (metaEl) metaEl.textContent = `${last4.length} ${last4.length === 1 ? "título" : "títulos"}`;

  // Render idêntico ao de “Assistidos” (pôster puro + estrelas embaixo)
// itera coleção
  last4.forEach(item => {
    // Card padrão reutilizando o mesmo gerador
// declara variável link
    const link = createCarouselItem(item);

    // Remove overlay e corpo para deixar só pôster
// seleciona elemento do DOM
    link.querySelector(".item__overlay")?.remove();
// seleciona elemento do DOM
    link.querySelector(".item__body")?.remove();

    // Envoltório para alinhar estrelas abaixo
// declara variável wrap
    const wrap = document.createElement("div");
// atribui valor
    wrap.style.display = "grid";
// atribui valor
    wrap.style.justifyItems = "center";

// adiciona nó ao DOM
    wrap.appendChild(link);

// declara variável stars
    const stars = document.createElement("div");
// atribui valor
    stars.className = "watched__stars"; // usa o mesmo estilo dos Assistidos
// atribui valor
    stars.textContent = starString(item.rating || 0);
// adiciona nó ao DOM
    wrap.appendChild(stars);

// adiciona nó ao DOM
    scroller.appendChild(wrap);
  });
});
