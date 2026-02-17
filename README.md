# CrunchyTracker

A full-stack app for viewing and analyzing your Crunchyroll watch history. Built with a Rust backend and Next.js frontend.

## Features

- **Watch History** — View all anime and movies watched via Crunchyroll
- **Analytics Dashboard** — Total episodes, watch time, completion rates, top anime
- **Search & Sort** — Real-time search across titles, sortable by date/title/completion
- **Pagination** — Configurable page sizes (10/20/50)
- **Data Export** — Download history as CSV or JSON
- **Dark Mode** — Persistent theme toggle
- **Secure Auth** — httpOnly cookie-based sessions with server-side validation

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Rust, Actix-web, crunchyroll-rs |
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| Validation | Zod |

## Project Structure

```
crunchyroll-stats/
├── crunchyroll-stats-api/     # Rust backend
│   ├── src/
│   │   ├── main.rs            # Server setup and routes
│   │   ├── auth.rs            # Crunchyroll authentication
│   │   ├── history.rs         # Watch history fetching
│   │   └── models.rs          # Request/response types
│   ├── Cargo.toml
│   └── Cargo.lock
├── crunchyroll-stats-app/     # Next.js frontend
│   ├── src/
│   │   ├── app/               # Pages and API routes
│   │   ├── components/        # UI components
│   │   ├── lib/               # Utilities and API client
│   │   └── types/             # TypeScript definitions
│   ├── package.json
│   └── tsconfig.json
└── .gitignore
```

## Getting Started

### Prerequisites

- [Rust](https://rustup.rs/) (stable)
- [Node.js](https://nodejs.org/) (v18+)
- A Crunchyroll account

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
3. Dashboard fetches watch history via Next.js API route → Rust backend → Crunchyroll API
4. Rust server authenticates with Crunchyroll using `crunchyroll-rs`, fetches and transforms history
5. Frontend computes stats and renders the dashboard with charts, tables, and export options
