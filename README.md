# CrunchyStats

A full-stack analytics dashboard for Crunchyroll watch history. Rust backend, Next.js frontend, containerized with Docker.

**Live:** [crunchyroll-stats.edngoche.com](https://crunchyroll-stats.edngoche.com)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Rust, Actix-web, [crunchyroll-rs](https://github.com/crunchy-labs/crunchyroll-rs) |
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Charts | Recharts |
| Validation | Zod, react-hook-form |
| Infrastructure | Docker, Nginx, Cloudflare |

## Features

- Watch history viewer with real-time search, sorting, and pagination
- Analytics dashboard: genre insights, binge stats, streak tracking, watch time breakdowns
- Data export (CSV, JSON)
- Dark/light mode
- httpOnly cookie sessions with server-side validation
- Multi-layer caching (Rust API 60 min, Next.js server 60 min)
- Dockerized with multi-stage builds for both services

## Architecture

```
Browser -> Cloudflare (SSL) -> Nginx -> Next.js (port 3000) -> Rust API (port 8080) -> Crunchyroll API
```

- Next.js handles auth, serves the frontend, and proxies data requests to the Rust backend
- Rust backend authenticates with Crunchyroll, fetches and caches watch history
- Containers communicate over an internal Docker network exposing only the frontend to the network

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose v2
- A [Crunchyroll](https://www.crunchyroll.com/) account

### Run with Docker (recommended)

```bash
git clone https://github.com/<your-username>/crunchyroll-stats.git
cd crunchyroll-stats

# Create env files
cp .env.api.example .env.api
cp .env.app.example .env.app
# Edit .env.app and set SESSION_SECRET (run: openssl rand -hex 32)

docker compose up -d --build
```

Open [http://localhost:3000](http://localhost:3000).

### Run without Docker

**Backend:**

```bash
cd crunchyroll-stats-api
cargo run
```

Starts at `http://localhost:8080`.

**Frontend:**

```bash
cd crunchyroll-stats-app
npm install
npm run dev
```

Starts at `http://localhost:3000`.

### Environment Variables

**Rust API** (`.env.api`):

| Variable | Default | Description |
|----------|---------|-------------|
| `RUST_LOG` | `info` | Log level |
| `HOST` | `0.0.0.0` | Bind address |
| `PORT` | `8080` | Server port |

**Next.js App** (`.env.app`):

| Variable | Default | Description |
|----------|---------|-------------|
| `RUST_API_URL` | `http://localhost:8080` | Rust backend URL |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Public app URL |
| `SESSION_SECRET` | - | 64-char hex string for cookie signing |
| `NODE_ENV` | `development` | Environment |

## Project Structure

```
crunchyroll-stats/
├── crunchyroll-stats-api/       # Rust backend (Actix-web)
│   ├── src/
│   │   ├── main.rs              # Routes and server setup
│   │   ├── auth.rs              # Crunchyroll authentication
│   │   ├── history.rs           # Watch history fetching + genre resolution
│   │   ├── cache.rs             # In-memory cache (60 min TTL)
│   │   └── models/              # Data models
│   ├── Cargo.toml
│   └── Dockerfile
├── crunchyroll-stats-app/       # Next.js frontend
│   ├── src/
│   │   ├── app/                 # App router (pages + API routes)
│   │   ├── components/          # UI components, panels, analytics
│   │   ├── lib/                 # Utils, analytics, caching, API client
│   │   └── types/               # TypeScript interfaces
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── .env.api / .env.app
```
