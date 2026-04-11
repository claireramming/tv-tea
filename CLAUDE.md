# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

**TV Tea** is a full-stack TV show tracking app. Users add shows/seasons to a watchlist, track episodes watched, and see where to stream them. Data about shows and episodes comes from TMDB; user watchlist/stats data is stored in the Django backend.

## Commands

### Frontend (`tv-tracker/`)
```bash
npm run dev        # Dev server on port 3090
npm run build      # Production build
npm run lint       # ESLint
npm run lint:fix   # ESLint with auto-fix
npm run format     # Prettier
```

### Backend (project root)
```bash
python manage.py runserver    # Dev server
python manage.py migrate      # Apply migrations
python manage.py makemigrations  # Create migrations after model changes
```

Dependencies managed with **Poetry** (`pyproject.toml`).

## Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript, Vite, TailwindCSS 4 + DaisyUI 5, React Router 7
- **Backend**: Django 5 + Django REST Framework, PostgreSQL
- **Auth**: Auth0 (JWT/RS256)
- **External data**: TMDB API (`moviedb-promise` on frontend)

### Request Flow
1. User authenticates via Auth0; frontend stores JWT
2. Frontend fetches show/episode metadata directly from TMDB
3. Frontend calls Django backend for user-specific data (watchlist, stats, profile) — JWT sent as `Authorization: Bearer` header
4. Backend validates JWT against Auth0's JWKS endpoint, extracts `sub` claim as user ID

### Key Frontend Files
- `src/utils.ts` — `SimpleFetch` class wraps all backend API calls with auth headers
- `src/types/index.ts` — shared TypeScript types (`WatchListEntry`, `ProfileInfo`, etc.)
- `src/contexts/` — `UserContext` holds authenticated user state
- `src/App.tsx` — routing setup
- `src/main.tsx` — Auth0Provider configuration

### Key Backend Files
- `backend/models.py` — `UserProfile`, `UserWatchList`, `UserWatchStats`
- `backend/views.py` — DRF ViewSets
- `backend/serializers.py` — DRF serializers
- `backend/authorization.py` — JWT decode and Auth0 integration
- `backend/urls.py` — routes: `/profile/`, `/watchlist/`, `/watchstats/`

### Database Models
- **UserProfile**: Auth0 user ID (PK), name, country, preferred streaming providers
- **UserWatchList**: One row per (user, show_id, season). Tracks episodes watched, status, timestamps, delay days
- **UserWatchStats**: One row per (user, date). Daily aggregate of episodes/minutes watched

### Auth Details
- Backend validates JWT using Auth0's JWKS (RS256)
- User IDs are stored as `auth0.{user_id}` in the database
- All API endpoints require a valid Auth0 JWT

## Deployment
- **Frontend**: Vercel
- **Backend + DB**: Koyeb (Procfile: migrate then gunicorn)
- Environment variables loaded from `.env` via `python-dotenv`
