# SplitWise — Group Expense Management & Debt Simplification App
Live : https://sathwiksplitapp-1.onrender.com

A full-stack web application for splitting group expenses, tracking balances, and settling debts with the minimum number of transactions. Includes OTP-based email verification and a role-protected Admin Dashboard.

---

## 🌟 Key Features

- **Integer Paise Financial Precision** — all money is stored as integer paise (1 INR = 100 paise) to avoid floating-point rounding errors.
- **Minimum Debt Simplification** — a greedy debt-graph algorithm reduces a group's balances down to the fewest possible settlement transactions.
- **Email OTP Verification** — 6-digit codes for registration and password reset, sent via Brevo.
- **Group Invite Links & Codes** — 8-character invite codes (e.g. `GOAT1234`) and shareable join links (`/join/GOAT1234`).
- **Flexible Expense Splitting** — Equal, Exact Amount, Percentage, and Share-ratio splits.
- **Settlement Tracking** — record payments between members with live balance updates.
- **Admin Dashboard** — separate, backend-enforced admin UI (`/admin/*`) for managing users, groups, and platform activity.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Axios, React Router DOM v6, Lucide Icons |
| Backend | Node.js, Express.js, TypeScript, Mongoose |
| Auth | JWT (HttpOnly cookies), bcrypt |
| Validation & Security | Zod, Helmet, express-rate-limit |
| Database | MongoDB (Atlas) |
| Email | Brevo (SMTP + REST API) |
| Hosting | Render (Web Service for backend, Static Site for frontend) |

---

## 📁 Project Structure

```
split-expense-app/
├── client/     → React frontend (Vite)
├── server/     → Express backend (TypeScript)
└── README.md
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+ installed
- A MongoDB Atlas cluster (or local MongoDB instance)
- A free Brevo account (for sending OTP emails)

### 1. Clone the repository
```bash
git clone https://github.com/sathwik-0701/sathwiksplitapp.git
cd sathwiksplitapp
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create a file named `.env` inside `server/` with the following (fill in your own values):

```env
MONGODB_URI=your_mongodb_connection_string
BREVO_SMTP_USER=your_brevo_smtp_login
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_verified_sender_email
JWT_SECRET=your_own_random_secret_string
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
```

> Where to get Brevo values: log in to [Brevo](https://app.brevo.com) → profile icon → **SMTP & API** → **SMTP tab** for `BREVO_SMTP_USER` / `BREVO_API_KEY`, and **Senders** tab to verify `BREVO_SENDER_EMAIL`.

Start the backend:
```bash
npm run dev
```
API runs at `http://localhost:5000`. Check `http://localhost:5000/api/health` to confirm it's up.

### 3. Set up the frontend

In a **second terminal**:
```bash
cd client
npm install
```

Create a file named `.env` inside `client/`:
```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:
```bash
npm run dev
```
App runs at `http://localhost:5173`.

---

## 🔑 Admin Account

The backend automatically creates an admin user on first startup, using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`.

**Important:** this only happens the *first time* the server ever connects to a fresh database. If you change `ADMIN_EMAIL` / `ADMIN_PASSWORD` later, the existing database record does **not** update automatically. To sync it manually, run:
```bash
cd server
npm run reset:admin
```
This creates the admin if missing, or updates the password/role of the existing one to match your current `.env` values.

---

## 🧪 Useful Scripts (run inside `server/`)

| Command | Purpose |
|---|---|
| `npm run dev` | Start backend in development mode (auto-restarts on changes) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled backend (`dist/server.js`) — used in production |
| `npm run test:db` | Test the MongoDB connection |
| `npm run test:algo` | Test the debt-simplification algorithm |
| `npm run reset:admin` | Create/update the admin user from current `.env` values |

---

## ☁️ Deployment (Render)

This app deploys as two separate services on [Render](https://render.com): a **Web Service** for the backend and a **Static Site** for the frontend.

### Backend — Web Service
- **Root Directory:** `server`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Environment Variables:** same keys as the local `server/.env` above, plus:
  - `CLIENT_URL` → set to your deployed frontend URL once it exists
  - `NODE_ENV=production`

> MongoDB Atlas must allow connections from Render: **Atlas → Network Access → Add IP Address → Allow Access from Anywhere (`0.0.0.0/0`)**.

### Frontend — Static Site
- **Root Directory:** `client`
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`
- **Environment Variables:**
  ```env
  VITE_API_URL=https://your-backend-service.onrender.com
  ```

After both are live, update the backend's `CLIENT_URL` environment variable to the frontend's live URL and redeploy the backend, so CORS allows requests from it.

---

## 📡 REST API Overview

### Auth (`/api/auth`)
- `POST /register` — Register & send OTP email
- `POST /verify-email` — Verify 6-digit OTP
- `POST /login` — Log in, issues HttpOnly JWT cookie
- `POST /logout` — Clear auth cookie
- `POST /forgot-password` — Request password reset OTP
- `POST /reset-password` — Reset password using OTP

### Users (`/api/users`)
- `GET /me` — Fetch current logged-in profile

### Groups (`/api/groups`)
- `POST /` — Create group (auto-generates invite code)
- `GET /` — List groups for the current user
- `GET /:id` — Group details & members
- `POST /join` — Join a group via invite code
- `POST /:id/leave` — Leave a group
- `GET /:id/balances` — Net balances & simplified settlement plan
- `POST /:id/expenses` — Add an expense
- `GET /:id/expenses` — List group expenses
- `POST /:id/settlements` — Record a settlement payment
- `GET /:id/settlements` — List settlement history

### Admin (`/api/admin`) — requires admin role
- `GET /dashboard` — Platform stats
- `GET /users` — List/search users
- `PATCH /users/:id/toggle-status` — Activate/deactivate a user
- `GET /groups` — All groups & totals
- `DELETE /groups/:id` — Delete a group
- `GET /expenses` — Platform-wide expense audit
- `GET /settlements` — Platform-wide settlement audit

---

## 🔒 Security Notes

- Never commit real values for `MONGODB_URI`, `BREVO_API_KEY`, `JWT_SECRET`, or `ADMIN_PASSWORD` — keep them only in your local `.env` (which should be listed in `.gitignore`) or in your hosting platform's environment variable settings.
- `.env.example` files should contain placeholder values only, never real credentials.
