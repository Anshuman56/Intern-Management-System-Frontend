# Intern Management System - Frontend

React app for the Intern Management System: admins manage interns, assign tasks and review submitted work;
interns see their tasks, start them and submit their work.

Built with React 19, TypeScript, Vite, Tailwind CSS v4 and React Router.

- Backend API: https://intern-management-system-backend-7uvd.onrender.com
- Backend repo: https://github.com/Anshuman56/Intern-Management-System-Backend

The API runs on Render's free tier, so the first login after a while can take up to a minute while the server wakes up.

**Demo intern account:** `demo.intern@ims.com` / `Intern@123`

## Setup

1. `npm install`
2. Copy `.env.example` to `.env`. It points at the live API by default; for a local backend use
   `VITE_API_URL=http://localhost:3000`
3. `npm run dev` and open http://localhost:5173

Other scripts: `npm run build` (type-check and production build into `dist/`), `npm run preview`, `npm run lint`.

## Features

| Role | Page | What it does |
|---|---|---|
| Both | Login | Signs in and sends admins to `/dashboard`, interns to `/my-dashboard` |
| Both | Dashboard | Six number cards from `GET /api/dashboard/stats` (system-wide for admins, own work for interns) |
| Admin | Interns | List and search interns; add, edit, deactivate or delete them |
| Admin | Tasks | Create a task and assign it to an active intern with a deadline and priority; filter by status and priority; overdue tasks are highlighted |
| Admin | Submissions | Review work awaiting review, write feedback, then mark the task Completed or request changes (back to In Progress) |
| Intern | My Tasks | See assigned tasks, mark a Pending task In Progress, and submit a GitHub link and/or document link with notes |

## Typical flow

1. Admin logs in, adds an intern on **Interns** and assigns a task on **Tasks**.
2. The intern logs in, opens **My Tasks**, clicks **Mark In Progress**, then **Submit work**.
3. Admin opens **Submissions**, writes feedback and clicks **Mark Completed** (or **Request changes**).
4. Both dashboards update.

## How it works

- **Auth:** the JWT and the user returned by `POST /api/auth/login` are saved in `localStorage`
  (`ims_token`, `ims_user`). Every request sends `Authorization: Bearer <token>`.
  If the API answers 401 (expired token or deactivated account), the session is cleared and the user goes back to login.
- **Role-based routes:** `ProtectedRoute` sends logged-out users to `/login` and users with the wrong role to their own dashboard.
  The backend enforces the same rules, so this only keeps the UI tidy.
- **API calls:** `src/api.ts` is a small `fetch` wrapper that adds the token and turns the backend's `{ message }` errors into readable errors.
  `src/useApi.ts` loads a GET route and ignores stale responses when a newer request has already started.

## Project structure

```
src/
  api.ts               fetch wrapper (base URL from VITE_API_URL)
  useApi.ts            data loading hook with reload()
  types.ts             shared types matching the backend models
  format.ts            date and badge helpers
  auth/                auth context, provider and useAuth()
  components/          Layout (nav), ProtectedRoute, Modal
  pages/               Login, Dashboard, Interns, Tasks, MyTasks, Submissions
```

## Deploying

Build command `npm run build`, output directory `dist`, and set `VITE_API_URL` to the backend URL.
`vercel.json` (Vercel) and `public/_redirects` (Netlify) send every path to `index.html` so page refreshes work.
