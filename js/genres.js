document.addEventListener('DOMContentLoaded', ()=>{
  const box = document.getElementById('genresBox');
  const scM = document.getElementById('scMovies');
  const scT = document.getElementById('scTv');
  const secM = document.getElementById('resultsMovies');
  const secT = document.getElementById('resultsTv');

  async function loadGenres(){
    if (!(window.API && API.hasAPI)){
      box.innerHTML = '<div class="muted">Configure a API para explorar categorias.</div>';
      return;
    }
    try {
      let gm = await API.tmdbGenres('movie');
      let gt = await API.tmdbGenres('tv');
      if (typeof gm === 'string') gm = JSON.parse(gm);
      if (typeof gt === 'string') gt = JSON.parse(gt);
      const genres = new Map();
      (gm.genres||[]).forEach(g => genres.set(g.id, { id:g.id, name:g.name }));
      (gt.genres||[]).forEach(g => { if(!genres.has(g.id)) genres.set(g.id, { id:g.id, name:g.name }); });
      box.innerHTML = '';
      genres.forEach(g => {
        const b = document.createElement('button');
        b.className = 'btn';
        b.textContent = g.name;
        b.addEventListener('click', ()=> selectGenre(g.id, g.name));
        box.appendChild(b);
      });
    } catch {
      box.innerHTML = '<div class="muted">Falha ao carregar gêneros.</div>';
    }
  }

  async function selectGenre(id, name){
    try {
      secM.hidden=true; secT.hidden=true; scM.innerHTML=''; scT.innerHTML='';
      let dm = await API.tmdbDiscover('movie', { with_genres: String(id) });
      let dt = await API.tmdbDiscover('tv', { with_genres: String(id) });
      if (typeof dm==='string') dm = JSON.parse(dm);
      if (typeof dt==='string') dt = JSON.parse(dt);
      const mapRes = (list,type)=> (list?.results||[]).slice(0,30).map(r=>({
        id:String(r.id), tmdbId:Number(r.id), type: type==='tv'?'series':'movie',
        title: r.title||r.name||'(sem título)', year:(r.release_date||r.first_air_date||'').slice(0,4)||'', poster:''
      }));
      const movies = mapRes(dm,'movie');
      const tv = mapRes(dt,'tv');
      movies.forEach(x=> scM.appendChild(createCarouselItem(x)));
      tv.forEach(x=> scT.appendChild(createCarouselItem(x)));
      secM.hidden = movies.length===0; secT.hidden = tv.length===0;
    } catch {}
  }

  loadGenres();
});

