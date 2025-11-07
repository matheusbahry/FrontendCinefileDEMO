// Lightweight API client for Cinefile backend with graceful fallback
// Configure base URL via window.API_BASE or localStorage key 'cinefile_api_base'

(function (global) {
  const cfgBase = (function(){
    try { return localStorage.getItem('cinefile_api_base') || global.API_BASE || ''; } catch { return global.API_BASE || ''; }
  })();
  const BASE = (cfgBase || '').replace(/\/$/, '');
  const hasAPI = !!BASE;

  function tokenGet(){ try { return localStorage.getItem('cinefile_jwt') || ''; } catch { return ''; } }
  function tokenSet(t){ try { if (t) localStorage.setItem('cinefile_jwt', t); else localStorage.removeItem('cinefile_jwt'); } catch {} }

  async function req(path, opts={}){
    if (!hasAPI) throw new Error('no_api');
    const headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers||{});
    const t = tokenGet(); if (t) headers['Authorization'] = 'Bearer ' + t;
    const res = await fetch(BASE + path, Object.assign({}, opts, { headers }));
    if (!res.ok) {
      let msg = 'error';
      try { const j = await res.json(); msg = j.error || JSON.stringify(j); } catch {}
      throw new Error(msg);
    }
    const ct = res.headers.get('content-type') || '';
    return ct.includes('application/json') ? res.json() : res.text();
  }

  const API = {
    hasAPI,
    base: BASE,
    tokenGet, tokenSet,
    // auth
    async login(username, password){
      const r = await req('/api/auth/login', { method:'POST', body: JSON.stringify({ username, password }) });
      tokenSet(r.token); return r;
    },
    async register(username, password, email){
      const r = await req('/api/auth/register', { method:'POST', body: JSON.stringify({ username, password, email }) });
      tokenSet(r.token); return r;
    },
    me(){ return req('/api/auth/me'); },
    updateProfile(p){ return req('/api/users/me', { method:'PUT', body: JSON.stringify(p) }); },

    // ratings
    rate(mediaType, tmdbId, stars){ return req('/api/ratings', { method:'POST', body: JSON.stringify({ mediaType, tmdbId, stars }) }); },
    myRatings(){ return req('/api/ratings/me'); },
    summary(type, tmdbId){ return req(`/api/ratings/summary/${encodeURIComponent(type)}/${encodeURIComponent(tmdbId)}`); },
    rateSeason(tmdbId, seasonNumber, stars){ return req('/api/ratings/season', { method:'POST', body: JSON.stringify({ tmdbId, seasonNumber, stars }) }); },

    // watchlist
    watchlist(){ return req('/api/watchlist'); },
    wlAdd(mediaType, tmdbId){ return req('/api/watchlist', { method:'POST', body: JSON.stringify({ mediaType, tmdbId }) }); },
    wlRemove(mediaType, tmdbId){ return req('/api/watchlist', { method:'DELETE', body: JSON.stringify({ mediaType, tmdbId }) }); },
    wlToggle(mediaType, tmdbId){ return req('/api/watchlist/toggle', { method:'POST', body: JSON.stringify({ mediaType, tmdbId }) }); },
    wlHas(type, tmdbId){ return req(`/api/watchlist/has/${encodeURIComponent(type)}/${encodeURIComponent(tmdbId)}`); },

    // comments
    getComments(type, tmdbId){ return req(`/api/comments/${encodeURIComponent(type)}/${encodeURIComponent(tmdbId)}`); },
    addComment(mediaType, tmdbId, text){ return req('/api/comments', { method:'POST', body: JSON.stringify({ mediaType, tmdbId, text }) }); },
    delComment(id){ return req(`/api/comments/${encodeURIComponent(id)}`, { method:'DELETE' }); },

    // logs
    myLogs(limit=20){ return req(`/api/logs/me?limit=${encodeURIComponent(String(limit))}`); },

    // TMDB proxy
    tmdbDetails(type, id){ return req(`/api/tmdb/details/${encodeURIComponent(type)}/${encodeURIComponent(id)}`); },
    tmdbSearch(type, q, year){ const y = year!=null ? `&year=${encodeURIComponent(String(year))}` : ''; return req(`/api/tmdb/search/${encodeURIComponent(type)}?q=${encodeURIComponent(q)}${y}`); },
    tmdbCredits(type, id){ return req(`/api/tmdb/credits/${encodeURIComponent(type)}/${encodeURIComponent(id)}`); },

    // admin
    admin: {
      listUsers(){ return req('/api/admin/users'); },
      setRole(id, role){ return req(`/api/admin/users/${encodeURIComponent(String(id))}/role`, { method:'PUT', body: JSON.stringify({ role }) }); },
      deleteUser(id){ return req(`/api/admin/users/${encodeURIComponent(String(id))}`, { method:'DELETE' }); }
    }
    ,
    // watched
    addWatched(mediaType, tmdbId, dateIso){ return req('/api/watched', { method:'POST', body: JSON.stringify({ mediaType, tmdbId, dateIso }) }); },
    myWatched(limit=50){ return req(`/api/watched/me?limit=${encodeURIComponent(String(limit))}`); }
  };

  global.API = API;
})(window);
