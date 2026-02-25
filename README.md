# CrunchyStats

A full-stack analytics dashboard for Crunchyroll watch history. Rust backend, Next.js frontend, containerized with Docker

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Rust, Actix-web, [crunchyroll-rs](https://github.com/crunchy-labs/crunchyroll-rs) |
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Charts | Recharts |
| Validation | Zod, react-hook-form |
| Infrastructure | Docker, multi-stage builds, Nginx, Cloudflare |

## Features

- **Watch History** — browse your last year of activity with real-time search, sorting, and pagination
- **Analytics Dashboard** — genre distribution, binge detection, streak tracking, watch-time breakdowns by day/week/month
- **Data Export** — download history as CSV or JSON
- **Theming** — dark and light mode with system preference detection
- **Session Security** — httpOnly cookie-based sessions with server-side validation
- **Multi-Layer Caching** — 60-minute TTL on both Rust API and Next.js server layers to minimize redundant API calls
- **Containerized** — Dockerized with multi-stage builds for both services; a single `docker compose up` to run

## Architecture

```
Browser ──▸ Next.js (port 3000) ──▸ Rust API (port 8080) ──▸ Crunchyroll API
```

- **Next.js** handles authentication, serves the frontend, and proxies data requests to the Rust backend via internal Docker networking
- **Rust API** authenticates with Crunchyroll, fetches watch history (capped to the last 365 days), resolves genre metadata per series/movie, and caches results in memory
- **Containers** communicate over an isolated Docker network; only the frontend is exposed externally

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose v2+
- A [Crunchyroll](https://www.crunchyroll.com/) account

### Run with Docker

```bash
git clone https://github.com/bacadlo/crunchyroll-stats.git
cd crunchyroll-stats

# Create env files from examples
cp .env.api.example .env.api
cp .env.app.example .env.app

# Generate a session secret and add it to .env.app
openssl rand -hex 32

docker compose up -d --build
```

Open [http://localhost:3000](http://localhost:3000).

### Run Locally (without Docker)

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
| `RUST_LOG` | `info` | Log verbosity (`debug`, `info`, `warn`, `error`) |
| `HOST` | `0.0.0.0` | Bind address |
| `PORT` | `8080` | Server port |

**Next.js App** (`.env.app`):

| Variable | Default | Description |
|----------|---------|-------------|
| `RUST_API_URL` | `http://localhost:8080` | Internal URL to the Rust backend |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Public-facing app URL |
| `SESSION_SECRET` | — | 64-char hex string for cookie signing |
| `NODE_ENV` | `development` | `development` or `production` |

## Project Structure

```
crunchyroll-stats/
├── crunchyroll-stats-api/          # Rust backend
│   ├── src/
│   │   ├── main.rs                 # HTTP routes, server bootstrap
│   │   ├── auth.rs                 # Crunchyroll credential auth
│   │   ├── history.rs              # Watch history pagination + genre resolution
│   │   ├── cache.rs                # In-memory TTL cache
│   │   └── models/                 # Request/response data models
│   ├── Cargo.toml
│   └── Dockerfile
├── crunchyroll-stats-app/          # Next.js frontend
│   ├── src/
│   │   ├── app/                    # App Router pages + API routes
│   │   ├── components/
│   │   │   ├── analytics/          # Chart and insight components
│   │   │   ├── panels/             # Dashboard, history panels
│   │   │   ├── ui/                 # Reusable UI primitives
│   │   │   └── *.tsx               # Auth shell, navbar, filters, export
│   │   ├── lib/                    # Analytics engine, API client, caching
│   │   └── types/                  # TypeScript interfaces
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── .env.api / .env.app             # Environment config (not committed)
```
