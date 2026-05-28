# Task Manager — Full Stack Application

A full-stack Task Management web application built with **React + Redux Toolkit** on the frontend and **Node.js + Express + MongoDB** on the backend. Features JWT authentication via httpOnly cookies, full CRUD task management, role-based access control (RBAC), an admin panel, and a responsive dark-mode UI.

---

## Features

### User Features
- Register and login with form validation; session restored on page reload via httpOnly cookie
- Create, edit, delete, and reorder tasks with drag-and-drop
- Toggle task status between Pending and Completed
- Filter tasks by status and priority; debounced search across title and description
- List view (drag-and-drop) and Card (grid) view modes
- Live task stats — Total, Pending, Completed counters
- Dark mode, persisted to `localStorage`
- Optimistic UI — all mutations update instantly with automatic rollback on failure

### Admin Features
- Access admin panel via header dropdown (admin accounts only)
- View all registered users with role badges and join dates
- Drill down into any user's tasks by clicking their row
- Delete any user (cascade-deletes all their tasks)
- Delete any task across all users
- Cannot delete your own account (guarded at both UI and API level)

### Security
- JWT stored in httpOnly, Secure cookie — immune to XSS; `SameSite=none` in production for cross-origin support, `SameSite=strict` in development
- Every API request verified by `protect` middleware
- Role-based route guard (`requireRole('admin')`) on all admin endpoints
- 401 responses handled by Redux middleware — no full-page reload, clean redirect via React Router
- Frontend route guards: `ProtectedRoute`, `RequireAdmin`, `GuestRoute` (no auth page flash)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite 5 |
| State — Server Data | Redux Toolkit (auth, tasks, admin) |
| State — UI Preferences | Zustand (theme, view mode) |
| Styling | Tailwind CSS v3, shadcn/ui |
| Routing | React Router v6 |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB with Mongoose ODM |
| Authentication | JWT in httpOnly cookies |
| API Docs | Swagger UI (OpenAPI 3.0) |

---

## Design Decisions

### Why Redux Toolkit + Zustand together?

Two different kinds of state need two different tools.

**Redux Toolkit** handles all server-synchronised state (auth, tasks, admin data). RTK's `createAsyncThunk` gives a uniform `pending / fulfilled / rejected` pattern for every API call, which is what makes optimistic updates with rollback clean and consistent. Redux DevTools time-travel, typed selectors, and `createSelector` memoisation make the data layer maintainable at scale.

**Zustand** handles ephemeral UI preferences — theme and view mode. These are synchronous, local, and never shared across features. Adding RTK boilerplate (actions, reducers, selectors) for a two-field preference object would be overhead with zero benefit.

### Why shadcn/ui?

shadcn/ui is not a component library you install — it is a collection of copy-paste components built on **Radix UI primitives** (fully accessible, keyboard-navigable, WAI-ARIA compliant) styled with Tailwind CSS. Because the component source lives in your repo (`src/components/ui/`), you own it completely: no version lock-in, no bundle overhead from unused components, and full control to customise without fighting a library's internal API. It is the current industry standard for React + Tailwind projects.

### Why Redux Thunks over Redux Saga?

Every async operation in this app is a straightforward REST call. Sagas add generator boilerplate (watchers, workers, channels) that pays off only when you need polling, WebSockets, request cancellation across flows, or complex sequential chains — none of which apply here. RTK `createAsyncThunk` handles optimistic updates and rollback cleanly via `pending / rejected` reducers. Clean, purposeful code is more valuable than unnecessary complexity.

### Why httpOnly cookies over localStorage for JWT?

Tokens in `localStorage` are accessible to any JavaScript on the page — a single XSS vulnerability exposes the token. An httpOnly cookie cannot be read by JavaScript at all; the browser attaches it automatically on every request. Paired with `SameSite=strict` it is also CSRF-resistant without extra headers.

---

## Prerequisites

- **Node.js** v18+ (v20 recommended)
- **MongoDB** — local instance or [MongoDB Atlas](https://www.mongodb.com/atlas)
- **npm** v9+

---

## Running Locally

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd task-management-adit
```

### 2. Start the backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in your values:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=<generate a 64-character random string>
JWT_EXPIRES_IN=7d
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

```bash
npm run dev
# API running at http://localhost:5000
# Swagger docs at http://localhost:5000/api/docs
```

### 3. Start the frontend

Open a new terminal from the project root:

```bash
npm install
npm run dev
# App running at http://localhost:5173
```

> The Vite dev server proxies all `/api/*` requests to `localhost:5000` — no manual CORS configuration needed in development.

### 4. Create an admin account

Register a normal account through the app, then promote it in MongoDB:

```js
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

Log out and back in — the Admin option will appear in the header dropdown.

---

## Folder Structure

```
├── backend/
│   └── src/
│       ├── config/db.ts
│       ├── controllers/          # auth, task, admin
│       ├── middleware/           # protect, requireRole, errorHandler
│       ├── models/               # User, Task (Mongoose)
│       ├── routes/               # auth, task, admin
│       ├── types/express.d.ts    # req.user augmentation
│       ├── utils/swagger.ts
│       ├── app.ts
│       └── server.ts
│
└── src/
    ├── features/
    │   ├── auth/                 # authSlice, authService, Login, Register, route guards
    │   ├── tasks/                # taskSlice, taskService, TaskList, TaskFormModal, hooks
    │   └── admin/                # adminSlice, adminService, AdminPage, AdminUsersTable, AdminUserTasks
    ├── shared/
    │   ├── components/           # Header, TaskStats, SearchFilter, ErrorBoundary
    │   └── store/uiStore.ts      # Zustand: theme + viewMode
    ├── store/
    │   ├── index.ts              # Redux configureStore
    │   ├── hooks.ts              # useAppDispatch, useAppSelector
    │   └── sessionMiddleware.ts  # Intercepts AuthError, dispatches sessionExpired
    ├── lib/apiClient.ts          # Fetch wrapper (credentials: include, AuthError tagging)
    ├── components/ui/            # shadcn/ui primitives
    ├── App.tsx                   # Routes + Dashboard
    └── main.tsx                  # Redux Provider, BrowserRouter, fetchMeThunk on mount
```

---

## API Reference

Base URL: `http://localhost:5000/api` — Interactive docs: `http://localhost:5000/api/docs`

### Auth

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/auth/register` | Register a new user | No |
| POST | `/auth/login` | Login — sets httpOnly JWT cookie | No |
| GET | `/auth/me` | Get current authenticated user | Yes |
| POST | `/auth/logout` | Logout — clears cookie | Yes |

### Tasks

All task endpoints require authentication.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/tasks` | List own tasks (pagination + search + filters) |
| POST | `/tasks` | Create a task |
| PUT | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task |
| PATCH | `/tasks/:id/status` | Toggle pending ↔ completed |

Query params for `GET /tasks`: `page`, `limit`, `search`, `status` (all/pending/completed), `priority` (all/low/medium/high)

### Admin

Requires `admin` role on all endpoints.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/users` | List all registered users |
| GET | `/admin/tasks` | List all tasks (optional `?userId=` filter) |
| DELETE | `/admin/users/:id` | Delete user + cascade-delete their tasks |
| DELETE | `/admin/tasks/:id` | Delete any task |

---

## Scripts

### Frontend (project root)

```bash
npm run dev       # Vite dev server on :5173
npm run build     # TypeScript check + production build
npm run lint      # ESLint
npm run preview   # Preview production build locally
```

### Backend

```bash
cd backend
npm run dev       # ts-node-dev with hot reload
npm run build     # Compile TypeScript → dist/
npm start         # Run compiled dist/server.js
```

---

## Deployment

| Service | Platform |
|---|---|
| Frontend | [Vercel](https://vercel.com) |
| Backend | [Render](https://render.com) |
| Database | [MongoDB Atlas](https://mongodb.com/atlas) |

### Backend — Render

1. New Web Service → connect GitHub repo
2. Root Directory: `backend`
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Add environment variables: `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `NODE_ENV=production`, `CORS_ORIGIN=https://your-app.vercel.app`

### Frontend — Vercel

1. New Project → import repo (root directory: `/`)
2. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`
3. Deploy → update `CORS_ORIGIN` on Render with the Vercel URL

### Note on Render free tier

Render's free tier spins down the backend after **15 minutes of inactivity**. The first request after the server sleeps will take **20–30 seconds** to respond while it wakes up. Subsequent requests are fast. This is expected behaviour on the free plan.

---

## Assumptions

1. User `role` defaults to `'user'` on registration. Admin accounts are promoted manually via MongoDB (no admin registration UI).
2. Drag-and-drop reordering uses fire-and-forget API sync — order is eventually consistent across sessions.
3. In production, frontend and backend should be deployed separately with `CORS_ORIGIN` set to the deployed frontend URL.
