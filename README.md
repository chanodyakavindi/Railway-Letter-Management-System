# Railway Letter Management System (RLMS)

Full MERN stack application for Sri Lanka Railways correspondence management.

## Stack

- **Frontend (active):** Original wireframe UI (`legacy-wireframe/`) — HTML/CSS/vanilla JS, served by Express and wired to the live API through `legacy-wireframe/api-bridge.js`
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Auth:** JWT + bcryptjs
- **Uploads:** Multer (PDF only, 10MB max)
- **Frontend (legacy/alternate):** A React + Vite client also exists in `client/` but the served UI is the original wireframe

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

# 5. Start the app (Express serves both the API and the wireframe UI)
npm start
```

Open **http://localhost:5001**

The original wireframe UI is served directly by the Express server and talks
to the real MongoDB-backed API. There is no separate frontend dev server to run.

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
| `npm start` | Run the app: Express API + wireframe UI on :5001 |
| `npm run server` | Same as `npm start` but with nodemon auto-reload |
| `npm run seed` | Reset & seed MongoDB |
| `npm run dev` | Run API + the alternate React dev server (optional) |
| `npm run client` | Vite React only (optional alternate UI) |
| `npm run build` | Build React for production (optional) |

## Project Structure

```
railway-letter-system/
├── client/          # React + Vite frontend
├── server/          # Express API + MongoDB
├── legacy-wireframe/  # Original static wireframe (preserved)
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
- **AI letter scanning** — upload a photo/PDF of a handwritten letter (Sinhala or English) and the form fields auto-fill via OpenAI GPT-4o vision (Option 02 page and the main Add Letter form)

## AI Letter Scanning Setup

Auto-fill works on both the **Option 02 – AI Letter Scanning** page and the main
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

## Wireframe UI (served frontend)

The original static HTML/CSS/JS wireframe in `legacy-wireframe/` is the UI that
the system serves. Its look, colours, Sinhala/English labels, pages and
workflow are unchanged. `legacy-wireframe/api-bridge.js` replaces the old
`localStorage` demo logic with real REST calls:

- Login authenticates against `/api/auth/login` (JWT).
- Letters, replies, reminders, no-action and user management read/write MongoDB.
- History reads the audit log; secretary inbox is role-scoped by the backend.

## Notes

- **MongoDB required for production.** If local MongoDB is not running, the server automatically falls back to an in-memory database for development and auto-seeds demo data on first startup.
- For persistent data, install MongoDB and set `MONGODB_URI` in `server/.env`, then run `npm run seed`.
- Daily reminder notifications are generated via cron at 5 PM (Asia/Colombo) and when the dashboard loads.
- Officers cannot delete letters unless admin grants `canDeleteLetters`.
- Head role is view-only for letters; admin manages users only.
