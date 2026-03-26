# CrunchyStats

A full-stack analytics dashboard for Crunchyroll watch history. Rust backend, Next.js frontend, containerized with Docker.

**Live site:** [CrunchyStats](https://crunchystats.edngoche.com)

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
- **Analytics Dashboard** — computed from your watch data with the following insights:
  - **Watch Time** — total hours across multiple time ranges (today, last week, last month, last year)
  - **Library Totals** — unique titles, series, movies, and episodes watched
  - **Genre Breakdown** — top 3 genres ranked by hours watched, with title counts per genre
  - **Longest Streak** — consecutive days with at least one watch session
  - **Peak Day** — the single day you watched the most, with total hours
  - **Most Binged Series** — series watched 3+ episodes of in one day, ranked by episode count and hours
  - **Completion Rate** — percentage of started series with all available episodes watched
  - **Average Session** — mean watch time per day across your active days
  - **Charts** — monthly trend, hours by day of week, hours by hour of day, top series by episode count, new vs. rewatched split, genre share over time
  - **Activity Calendar** — heatmap of daily watch hours over the past year
- **Data Export** — download history as CSV or JSON
- **Theming** — dark and light mode toggle, persisted to localStorage
- **Session Security** — httpOnly cookie-based sessions with CSRF protection, server-side expiration, and rate limiting
- **Security Headers** — CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- **Multi-Layer Caching** — 60-minute TTL on both Rust API and Next.js server layers to minimize redundant API calls
- **Containerized** — Dockerized with multi-stage builds for both services; a single `docker compose up` to run
- **CI** — GitHub Actions for build checks (Rust + Next.js) and weekly dependency security audits

## Architecture

```
Browser ──▸ Cloudflare (SSL) -> Nginx -> Next.js (port 3000) ──▸ Rust API (port 8080) ──▸ Crunchyroll API
```

- **Next.js** handles authentication, serves the frontend, and proxies data requests to the Rust backend via internal Docker networking
- **Rust API** authenticates with Crunchyroll, fetches watch history (capped to the last 365 days), resolves genre metadata per series/movie, caches results in memory, and enforces per-IP rate limiting
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
