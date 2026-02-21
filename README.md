# CrunchyStats

A full-stack app for viewing and analyzing your Crunchyroll watch history. Built with a Rust backend and Next.js frontend.

## Features

- **Watch History** — View all anime and movies watched via Crunchyroll
- **Analytics** — Viewing patterns, genre insights, binge stats, streak tracking, and watch time breakdowns (last year)
- **Search & Sort** — Real-time search across titles, sortable by date/title/completion
- **Pagination** — Configurable page sizes (10/20/50)
- **Data Export** — Download history as CSV or JSON
- **Dark Mode** — Persistent theme toggle
- **Secure Auth** — httpOnly cookie-based sessions with server-side validation
- **Caching** — Server-side caching on both the Rust API and Next.js layers to minimize Crunchyroll-rs API calls

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Rust, Actix-web, [crunchyroll-rs](https://github.com/crunchy-labs/crunchyroll-rs/tree/master) |
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Validation | Zod |


## Getting Started

### Prerequisites

- [Rust](https://rustup.rs/) (stable)
- [Node.js](https://nodejs.org/) (v18+)
- A [Crunchyroll](https://www.crunchyroll.com/) account

### Backend

```bash
cd crunchyroll-stats-api
cargo run
```

The API server starts at `http://localhost:8080`.

### Frontend

```bash
cd crunchyroll-stats-app
npm install
npm run dev
```

The app starts at `http://localhost:3000`.

### Environment Variables

**Frontend** (`crunchyroll-stats-app/.env.local`):

| Variable | Default | Description |
|----------|---------|-------------|
| `RUST_API_URL` | `http://localhost:8080` | Rust backend URL |

**Backend**:

| Variable | Default | Description |
|----------|---------|-------------|
| `RUST_LOG` | `info` | Log level |
| `HOST` | `0.0.0.0` | Bind address |
| `PORT` | `8080` | Server port |

## How It Works

1. User logs in at `/login` with Crunchyroll credentials
2. Next.js API route validates and stores credentials in an httpOnly cookie
3. Dashboard and analytics pages fetch data via Next.js API routes → Rust backend → Crunchyroll API
4. Rust server authenticates with Crunchyroll using `[crunchyroll-rs](https://github.com/crunchy-labs/crunchyroll-rs/tree/master)`, fetches watch history (with genre resolution) and profile data
5. Both the Rust API (10 min TTL) and Next.js server (5 min TTL) cache responses to avoid repeated Crunchyroll API calls
6. Frontend computes stats and analytics, rendering the dashboard with tables, metrics, and export options
