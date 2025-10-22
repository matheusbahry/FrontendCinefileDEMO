// Lê cinefile_ratings, cruza com catálogo e renderiza carrossel de "Assistidos".
// Inclui filmes e séries, ordenados por mais recentes.

document.addEventListener("DOMContentLoaded", () => {
  const row = document.getElementById("watchedRow");
  const scroller = document.getElementById("watchedScroller");
  const meta = document.getElementById("watchedMeta");
  const dots = document.getElementById("watchedDots");
  const isLogged = window.AUTH?.isLogged
  ? window.AUTH.isLogged()
  : (
      localStorage.getItem("cinefile_logged") === "true" ||
      localStorage.getItem("cinefile_logged_in") === "true" ||
      !!localStorage.getItem("cinefile_username")
    );
if (!isLogged) {
  const back = encodeURIComponent("watched.html");
  window.location.href = `login.html?redirect=${back}`;
  return;
} 
//
  if (!scroller) return;

  const DATASET = window.DATA || window.MOCK_DATA || [];

  // 1) pega as avaliações ordenadas
  const rated = Ratings.listSortedDesc().filter(x => x.rating > 0);

  // 2) cruza com catálogo
  const items = rated
    .map(r => {
      const it = DATASET.find(x => String(x.id) === String(r.id));
      return it ? { ...it, rating: r.rating, ts: r.ts } : null;
    })
    .filter(Boolean);

  meta.textContent = `${items.length} ${items.length === 1 ? "título" : "títulos"}`;

  // 3) render
  scroller.innerHTML = "";
  dots.innerHTML = "";

  if (!items.length) {
    const p = document.createElement("p");
    p.className = "muted";
    p.style.padding = "8px 20px";
    p.textContent = "Ainda não há títulos avaliados.";
    row.prepend(p);
    return;
  }

  // helper: estrelas
  const starStr = (n) => "★".repeat(n) + "☆".repeat(5 - n);

  // Render igual da sua página (pôster + estrelas embaixo)
  items.forEach(item => {
    // card clicável padrão (reaproveita seu gerador, se disponível)
    let link;
    if (typeof createCarouselItem === "function") {
      link = createCarouselItem(item);
      link.querySelector(".item__overlay")?.remove();
      link.querySelector(".item__body")?.remove();
    } else {
      // fallback simples
      link = document.createElement("a");
      link.href = `details.html?id=${encodeURIComponent(item.id)}`;
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
    stars.textContent = starStr(item.rating);
    wrap.appendChild(stars);

    scroller.appendChild(wrap);
  });

  // Dots de paginação (opcional: 1 dot por "página" de 6 cards)
  const pageSize = 6;
  const totalPages = Math.ceil(items.length / pageSize);
  for (let i = 0; i < totalPages; i++) {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "row__dot";
    dot.setAttribute("aria-label", `Página ${i + 1}`);
    dot.addEventListener("click", () => {
      const targetX = i * (scroller.clientWidth);
      scroller.scrollTo({ left: targetX, behavior: "smooth" });
    });
    dots.appendChild(dot);
  }
});
