# MERN Todo App — Frontend

Workspace-based project and task management app built with React and Vite. Signed-in members can switch between their workspaces and use the workspace dashboard, projects, tasks, calendar, chat, notifications, and settings. Workspace invitations can also be opened from the public `/accept-invitation` route.

## Requirements

- Node.js 18.18 or later and npm (Node.js 20 or later is recommended)
- The companion Express backend running locally, or a deployed backend URL

Install and run the frontend from this directory:

```sh
npm ci
npm run dev
```

Vite prints the local URL (normally `http://localhost:5173`). The checked-in `.env.local` contains one active `VITE_API_URL` and a commented alternative. Keep the local URL active while developing; before pushing a production build, comment the local line and uncomment the live URL. This variable contains public endpoint URLs only, not credentials.

```dotenv
# Development
VITE_API_URL=http://localhost:5174/api

# Live (switch these comments before a production push)
# VITE_API_URL=https://task-management-backend-live.vercel.app/api
```

`VITE_API_URL` is the complete API base URL, including `/api`. Vite embeds `VITE_` variables in the browser bundle, so put only public configuration here; never put credentials, signing keys, database URLs, or other secrets in frontend env files.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite development server with hot reload |
| `npm run build` | Create the production bundle in `dist/` |
| `npm run preview` | Serve the built bundle locally for a production-like check |
| `npm run lint` | Run ESLint across the frontend |

## App structure

- `src/App.jsx` sets up React Router, public and protected routes, workspace loading, and the initial workspace creation prompt.
- `src/routes/public/routes.js` contains the login route. Invitation landing is mounted at `/accept-invitation` so a user can retain an invite while authenticating.
- `src/routes/admin/routes.js` maps authenticated screens: `/dashboard`, `/chats`, `/calendar`, `/tasks`, `/projects`, `/settings`, and `/notifications`.
- `src/api/` contains the Axios service modules and route builders for auth, workspaces, members/invitations, projects, tasks, chat, and notifications.
- `src/config/zustand/` holds shared client state, including the selected workspace and project data. `src/context/` contains authentication and notification contexts.
- `src/components/layout/` provides the authenticated application shell and workspace navigation.
- `public/flow.svg` is used for the browser favicon and app manifest icon; `public/manifest.webmanifest` provides Flow's saved-app name and display colors.

Requests use the Axios instance in `src/config/axios/axios.js`. It sets the `Authorization: Bearer ...` header from the signed-in user's browser storage. API paths are relative to `VITE_API_URL`; see the route builders under `src/api/*/routes.js` for the frontend's expected endpoints.

Chat and notification updates use Socket.IO over WebSocket. The client derives the socket origin by removing the trailing `/api` from `VITE_API_URL`, then authenticates the socket with the user's token. For example, `https://api.example.com/api` uses `https://api.example.com` for Socket.IO. The backend must allow the frontend origin for both HTTP/CORS and Socket.IO connections.

## Deploy frontend to Vercel

Deploy the frontend and backend as separately configured Vercel projects (or configure an equivalent monorepo setup with distinct project roots). For the frontend project, set its root directory to `frontend` when importing the repository.

Use these project settings:

- Framework preset: **Vite**
- Install command: `npm install` (Vercel may use the lockfile-aware default)
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL=https://<your-backend-domain>/api`

Set `VITE_API_URL` in Vercel to `https://task-management-backend-live.vercel.app/api` for Production builds, then redeploy so the value is included in the client bundle. The checked-in [`vercel.json`](./vercel.json) rewrites SPA paths to `index.html`, allowing direct navigation and refresh on routes such as `/tasks` and `/accept-invitation`.

Before launch, configure the backend's allowed origins to include the deployed frontend domains (including Preview domains if previews should connect). Verify signup/login and OTP, invitation acceptance, workspace switching, API requests, chat, and notifications against the deployed backend. Socket.IO is used by chat and notifications, so confirm the backend's Vercel runtime and connection behavior with real clients; for sustained realtime workloads or multi-instance room fanout, plan for reconnect handling and a shared Socket.IO adapter/store.

## Local production bundle

```sh
npm run build
npm run preview
```

The preview server only serves the frontend bundle; API and Socket.IO requests still go to the backend configured by `VITE_API_URL`.
