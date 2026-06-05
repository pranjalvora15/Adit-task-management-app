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

## Tech Stack

| Layer                  | Technology                         |
| ---------------------- | ---------------------------------- |
| Frontend               | React 18, TypeScript, Vite 5       |
| State — Server Data    | Redux Toolkit (auth, tasks, admin) |
| State — UI Preferences | Zustand (theme, view mode)         |
| Styling                | Tailwind CSS v3, shadcn/ui         |
| Routing                | React Router v6                    |
| Drag & Drop            | @dnd-kit/core + @dnd-kit/sortable  |
| Backend                | Node.js, Express.js, TypeScript    |
| Database               | MongoDB with Mongoose ODM          |
| Authentication         | JWT in httpOnly cookies            |
| API Docs               | Swagger UI (OpenAPI 3.0)           |

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
cd frontend
npm install
npm run dev
# App running at http://localhost:5173
```

> The Vite dev server proxies all `/api/*` requests to `localhost:5000` — no manual CORS configuration needed in development.

### 4. Admin account Credentials

- Email: admin@gmail.com
- password: 123456

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
├── frontend/
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


| Service  | Platform                                   |
| -------- | ------------------------------------------ |
| Frontend | [Vercel](https://vercel.com)               |
| Backend  | [Render](https://render.com)               |
| Database | [MongoDB Atlas](https://mongodb.com/atlas) |


---

## Assumptions

1. User `role` defaults to `'user'` on registration. Admin accounts are promoted manually via MongoDB (no admin registration UI).
2. Drag-and-drop reordering uses fire-and-forget API sync — order is eventually consistent across sessions.
3. In production, frontend and backend should be deployed separately with `CORS_ORIGIN` set to the deployed frontend URL.

---

### Note on Render free tier

Render's free tier spins down the backend after **15 minutes of inactivity**. The first request after the server sleeps will take **20–30 seconds** to respond while it wakes up. Subsequent requests are fast. This is expected behaviour on the free plan.
