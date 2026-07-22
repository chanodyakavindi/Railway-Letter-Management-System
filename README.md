# Railway Letter Management System (RLMS)

Full MERN stack application for Sri Lanka Railways correspondence management.

## Stack

- **Frontend:** React + Vite (`client/`) — the single frontend for the app
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Auth:** JWT + bcryptjs
- **Uploads:** Multer (PDF only, 10MB max)

## Prerequisites

1. [Node.js](https://nodejs.org/) 18+
2. [MongoDB](https://www.mongodb.com/) local or [MongoDB Atlas](https://www.mongodb.com/atlas)

## Setup

```bash
# 1. Clone / open project
cd railway-letter-system

# 2. Install all dependencies
npm run install-all

# 3. Configure environment
cp server/.env.example server/.env
# Edit server/.env — set MONGODB_URI and JWT_SECRET

# 4. Seed database with demo users and sample letters
npm run seed

# 5. Start backend and frontend (two terminals)
npm run server    # Terminal 1 — API on http://localhost:5001
npm run client    # Terminal 2 — React app on http://localhost:5173
```

Open **http://localhost:5173** for the app. The Vite dev server proxies API
calls to the backend on port 5001.

Or run both together with one command: `npm run dev`

## Demo Login Credentials

| Role | Username | Password |
|------|----------|----------|
| System Admin | `admin` | `Password@123` |
| Head of Department | `hod` | `Password@123` |
| Department Officer | `priyangani`, `gayanthi`, `chathura`, etc. | `Password@123` |
| Additional Secretary | `sec-admin`, `sec-dev`, `sec-eng`, etc. | `Password@123` |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run install-all` | Install root, server, and client deps |
| `npm start` | Run the API only on :5001 |
| `npm run dev` | Run API + Vite dev server together |
| `npm run server` | Run the API only with nodemon auto-reload |
| `npm run client` | Run the React dev server on :5173 |
| `npm run build` | Build the React client into `client/dist` |
| `npm run seed` | Reset & seed MongoDB |

### Editing the frontend

The React app in `client/` is the only frontend. Run `npm run server` and
`npm run client` in separate terminals (or use `npm run dev` for both). Edit
files under `client/src/` — changes hot-reload on **http://localhost:5173** and
API calls are proxied to **http://localhost:5001**.

## Project Structure

```
railway-letter-system/
├── client/          # React + Vite frontend (the single frontend)
├── server/          # Express API + MongoDB
├── package.json     # Root scripts
└── README.md
```

## Features

- JWT authentication with role-based access (admin, head, officer, secretary)
- Letter registration (full form + quick/PDF upload)
- Draft / Complete workflow with auto-generated IDs (`RLY-2026-0001`)
- PDF upload to `server/uploads/`
- Reminders with overdue detection
- Secretary inbox (category-filtered) with replies
- Dashboard stats, daily summary, notifications
- User tracking, audit history, CSV/PDF export
- Admin user management
- **AI letter scanning** — upload a photo/PDF of a handwritten letter (Sinhala or English) and the form fields auto-fill via OpenAI GPT-4o vision (Quick Add and the main Add Letter form)

## AI Letter Scanning Setup

Auto-fill works on the **Quick Add (AI Letter Scanning)** page and the main
**Add Letter** form. When an officer uploads an image or PDF, the backend sends it
to OpenAI GPT-4o, which reads the handwriting (Sinhala/English) and returns the
letter number, date, sender, subject, and file number.

To enable it:

1. Get an API key at <https://platform.openai.com/api-keys>.
2. Add it to `server/.env`:

   ```
   OPENAI_API_KEY=sk-...your key...
   OPENAI_MODEL=gpt-4o
   ```

3. Restart the server (`npm start`).

Until a key is set, the upload still works but shows a message that AI extraction
is not configured; fields can be filled manually.

## API Base URL

Development: `http://localhost:5001/api`

Health check: `GET /api/health`

## Frontend

The React app in `client/` is the only frontend. It talks to the backend via
REST (see `client/src/api/`) with JWT auth:

- Login authenticates against `/api/auth/login` (JWT stored in `localStorage`).
- Letters, replies, reminders, and user management read/write MongoDB.
- History reads the audit log; secretary inbox is role-scoped by the backend.

## Notes

- **MongoDB required for production.** If local MongoDB is not running, the server automatically falls back to an in-memory database for development and auto-seeds demo data on first startup.
- For persistent data, install MongoDB and set `MONGODB_URI` in `server/.env`, then run `npm run seed`.
- Daily reminder notifications are generated via cron at 5 PM (Asia/Colombo) and when the dashboard loads.
- Officers cannot delete letters unless admin grants `canDeleteLetters`.
- Head role is view-only for letters; admin manages users only.
