Backend (Spring Boot + PostgreSQL + JWT)

Run locally
- Prereqs: Java 17, Maven, PostgreSQL.
- Configure env vars or edit `src/main/resources/application.yml`:
  - DB_URL (default `jdbc:postgresql://localhost:5432/cinefile`)
  - DB_USER (default `postgres`)
  - DB_PASS (default `postgres`)
  - JWT_SECRET (default "change-this-in-prod")
  - CORS_ALLOWED_ORIGINS (default `http://localhost:3000,http://localhost:5500`)

Commands
- `mvn spring-boot:run` in `backend/` directory.

API summary
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- User: `PUT /api/users/me` (update username, avatarUrl)
- Ratings: `POST /api/ratings`, `GET /api/ratings/me`, `GET /api/ratings/summary/{type}/{tmdbId}`, `POST /api/ratings/season`
- Watchlist: `GET/POST/DELETE /api/watchlist`, `POST /api/watchlist/toggle`, `GET /api/watchlist/has/{type}/{tmdbId}`

Frontend integration
- Option A (local dev): set `window.API_BASE = 'http://localhost:8080'` in `js/config.js`.
- Option B: set localStorage key `cinefile_api_base` to your backend URL.

Deployment
- Render/Heroku: provide env vars above and expose port. CORS must include your frontend origin (Vercel URL).

