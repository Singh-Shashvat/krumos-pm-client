# KRUMOS — Project Management Client

A premium, editorial-style project management frontend built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Vite**. KRUMOS features a Kanban board, real-time WebSocket updates, Google OAuth authentication, workspace management, team collaboration, and a bespoke design system inspired by architectural typography.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Design System](#design-system)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Architecture](#architecture)
- [Routing](#routing)
- [State Management](#state-management)
- [API Layer](#api-layer)
- [Real-Time Events](#real-time-events)
- [Theming (Light / Dark Mode)](#theming-light--dark-mode)
- [Code Quality](#code-quality)
- [Testing](#testing)
- [Deployment](#deployment)
- [Backend Repository](#backend-repository)
- [License](#license)

---

## Features

| Category | Details |
|---|---|
| **Authentication** | Google OAuth 2.0 via backend redirect. JWT token stored in `localStorage`. |
| **Workspaces** | Create, switch, rename, delete workspaces. Workspace settings modal with danger zone. |
| **Kanban Board** | Drag-free column-based board with status columns: `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`. |
| **Projects** | Create and filter by projects within a workspace. |
| **Tasks** | Create, view, edit, assign, change status/priority. Full task detail modal with comments and activity log. |
| **Dashboard** | Summary strip (total tasks, in-progress, completed), analytics charts (Recharts), activity feed, personal task widget. |
| **Members** | View workspace members, invite by email, change roles (ADMIN/MEMBER), remove members. |
| **Invitations** | Accept workspace invitations via tokenized URL (`/accept-invite?token=...`). |
| **Real-Time** | Socket.IO integration for live task updates, member joins, and workspace changes. |
| **Notifications** | In-app notification dropdown powered by WebSocket events. |
| **Theme** | Light/Dark mode toggle with persistent `localStorage` preference. |
| **Error Handling** | Global error boundary, network connectivity detection, global toast notifications on API failures. |
| **Responsive** | Collapsible sidebar, adaptive layouts. |

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Framework** | React | 19.x |
| **Language** | TypeScript | 6.x |
| **Build Tool** | Vite | 8.x |
| **Styling** | Tailwind CSS (v4 with `@tailwindcss/vite`) | 4.x |
| **Routing** | React Router DOM | 7.x |
| **State / Cache** | TanStack React Query | 5.x |
| **HTTP Client** | Axios | 1.x |
| **WebSocket** | Socket.IO Client | 4.x |
| **Charts** | Recharts | 3.x |
| **Icons** | Lucide React | 1.x |
| **Error Boundary** | react-error-boundary | 6.x |
| **Linting** | ESLint + Prettier + eslint-plugin-react-hooks | 10.x / 3.x |
| **Git Hooks** | Husky + lint-staged | 9.x / 16.x |
| **E2E Testing** | Playwright | 1.x |

---

## Design System

KRUMOS uses a bespoke, editorial design language inspired by architectural and typographic aesthetics. All design tokens are defined in `src/index.css`.

### Typography

| Token | Font | Usage |
|---|---|---|
| `--font-sans` | **Switzer** (Fontshare) | Body text, headings, UI labels |
| `--font-mono` | **Space Mono** (Google Fonts) | Eyebrows, buttons, metadata, code |

### Color Palette

| Token | Light Mode | Dark Mode | Purpose |
|---|---|---|---|
| `--bone` | `#F2EFE9` | `#120F0E` | Page background |
| `--bone-dark` | `#EAE6DE` | `#1B1715` | Secondary surface / sidebar bg |
| `--ink` | `#1B1713` | `#F2EFE9` | Primary foreground / text |
| `--ink-text` | `#372D2B` | `#EAE6DE` | Body text / sidebar text |
| `--ink-soft` | `#4F4948` | `#8D8276` | Muted text |
| `--orange-accent` | `#F44E14` | `#FF5A1F` | Primary brand accent |
| `--orange-deep` | `#E03A00` | `#FF6A2B` | Hover / pressed accent |
| `--orange-hot` | `#FF6A2B` | `#FF8452` | Active / highlight accent |
| `--success-green` | `#3DCC6D` | `#3DCC6D` | Success indicators |

### Utility Classes

| Class | Description |
|---|---|
| `krumos-eyebrow` | Mono uppercase eyebrow label |
| `krumos-heading` | Tight-tracked uppercase heading |
| `krumos-mono-btn` | Mono uppercase button |
| `krumos-card` | Dark card surface (ink bg, bone text) |
| `krumos-card-light` | Light card surface (bone-dark bg, ink text) |
| `krumos-overlay` | Dark semi-transparent modal backdrop |
| `krumos-border-*` | Directional border utilities (top, right, bottom, left, all) |

---

## Project Structure

```
krumos-pm-client/
├── public/                         # Static assets (favicon)
├── src/
│   ├── api/                        # React Query hooks per feature
│   │   ├── queryKeys.ts            # Centralized query key factory
│   │   ├── useBoardApi.ts          # Board/project/task CRUD mutations & queries
│   │   ├── useDashboardApi.ts      # Dashboard summary & analytics queries
│   │   ├── useMembersApi.ts        # Members & invitations API hooks
│   │   └── useTaskDetailApi.ts     # Task detail, comments, activity API hooks
│   ├── assets/                     # SVG logos (krumos_full_logo, favicon)
│   ├── components/
│   │   ├── board/                  # Kanban board components
│   │   │   ├── BoardColumn.tsx     # Single status column
│   │   │   ├── BoardHeader.tsx     # Board header with project/priority filters
│   │   │   ├── CreateProjectModal.tsx
│   │   │   ├── CreateTaskModal.tsx
│   │   │   └── TaskCard.tsx        # Individual task card
│   │   ├── common/                 # Shared UI components
│   │   │   ├── ConfirmDialog.tsx   # Reusable confirmation modal
│   │   │   └── ToastContainer.tsx  # Toast notification renderer
│   │   ├── dashboard/              # Dashboard widgets
│   │   │   ├── ActivityFeed.tsx    # Recent activity timeline
│   │   │   ├── AnalyticsSection.tsx# Charts (Recharts bar/pie/area)
│   │   │   ├── MyTasksWidget.tsx   # Personal tasks widget
│   │   │   └── SummaryStrip.tsx    # KPI metric cards
│   │   ├── layout/                 # Application shell components
│   │   │   ├── NotificationDropdown.tsx
│   │   │   ├── Sidebar.tsx         # Collapsible navigation sidebar
│   │   │   ├── TopBar.tsx          # Top bar with search & theme toggle
│   │   │   ├── WorkspaceSelectionOverlay.tsx
│   │   │   ├── WorkspaceSelector.tsx
│   │   │   └── WorkspaceSettingsModal.tsx
│   │   ├── members/                # Members page components
│   │   │   ├── InviteMemberForm.tsx
│   │   │   ├── MemberListItem.tsx
│   │   │   └── PendingInvitesList.tsx
│   │   ├── Error.tsx               # Global error fallback
│   │   ├── NetworkWrapper.tsx      # Online/offline detection wrapper
│   │   ├── NoInternet.tsx          # No internet fallback UI
│   │   ├── TaskDetailModal.tsx     # Full task detail modal (edit, comments, activity)
│   │   └── WorkspaceLayout.tsx     # Authenticated app shell (sidebar + topbar + outlet)
│   ├── config/
│   │   └── reactQueryConfig.ts     # QueryClient with global error handling
│   ├── context/                    # React Context providers
│   │   ├── AuthContext.tsx         # Authentication state & Google OAuth
│   │   ├── SocketContext.tsx       # Socket.IO connection & event management
│   │   ├── ToastContext.tsx        # Toast notification state & global dispatcher
│   │   └── WorkspaceContext.tsx    # Workspace CRUD & active workspace state
│   ├── hooks/
│   │   └── useAppNavigate.ts      # Type-safe navigation helper
│   ├── pages/                      # Route-level page components
│   │   ├── AcceptInvite.tsx        # Invitation acceptance flow
│   │   ├── AuthCallback.tsx        # OAuth callback handler
│   │   ├── Board.tsx               # Kanban board page
│   │   ├── Dashboard.tsx           # Dashboard page
│   │   ├── Login.tsx               # Login page (Google OAuth)
│   │   ├── Members.tsx             # Members management page
│   │   └── Onboarding.tsx          # First workspace creation
│   ├── route/
│   │   ├── index.ts                # Route constants (APP_ROUTES)
│   │   └── Routes.tsx              # Route definitions & auth guards
│   ├── services/
│   │   └── api.ts                  # Axios instance with interceptors
│   ├── types/                      # TypeScript type definitions
│   │   ├── auth.ts
│   │   ├── board.ts
│   │   ├── dashboard.ts
│   │   ├── members.ts
│   │   ├── socket.ts
│   │   ├── task.ts
│   │   ├── toast.ts
│   │   └── workspace.ts
│   ├── utils/                      # Utility functions
│   ├── App.tsx                     # Root component with provider tree
│   ├── main.tsx                    # Application entry point
│   └── index.css                   # Design system & Tailwind configuration
├── tests/
│   └── auth.spec.ts                # Playwright E2E tests
├── .env.example                    # Environment variable template
├── .prettierrc                     # Prettier configuration
├── eslint.config.js                # ESLint flat config
├── index.html                      # HTML entry point
├── package.json
├── playwright.config.ts            # Playwright E2E configuration
├── tsconfig.json                   # TypeScript project references
├── tsconfig.app.json               # App TypeScript config
├── tsconfig.node.json              # Node TypeScript config (Vite)
└── vite.config.ts                  # Vite build configuration
```

---

## Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x (or yarn / pnpm)
- **KRUMOS Backend Server** running (NestJS) — see [Backend Repository](#backend-repository)

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd krumos-pm-client
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your backend URL:

```env
VITE_API_URL=http://localhost:5678
```

### 4. Start the development server

```bash
npm run dev
```

The app will be available at **http://localhost:5173**.

> **Note:** The backend server must be running on the configured `VITE_API_URL` for authentication and API calls to work.

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5678` |

---

## Available Scripts

| Script | Command | Description |
|---|---|---|
| **Dev Server** | `npm run dev` | Start Vite dev server with HMR |
| **Build** | `npm run build` | TypeScript compilation + Vite production build |
| **Preview** | `npm run preview` | Preview the production build locally |
| **Lint** | `npm run lint` | Run ESLint across the project |
| **E2E Tests** | `npm run test:e2e` | Run Playwright end-to-end tests |
| **Prepare** | `npm run prepare` | Install Husky git hooks |

---

## Architecture

### Provider Tree

The application wraps all components in a layered provider tree defined in `App.tsx`:

```
ErrorBoundary
 └── QueryClientProvider (TanStack React Query)
      └── ToastProvider (Global toast state)
           └── BrowserRouter (React Router)
                └── AuthProvider (JWT + Google OAuth)
                     └── WorkspaceProvider (Workspace CRUD)
                          └── SocketProvider (Socket.IO)
                               └── NetworkWrapper (Online detection)
                                    └── Routes + ToastContainer
```

### Data Flow

```
User Action → React Query Mutation → Axios (with JWT interceptor) → Backend API
                                                                        ↓
                                                              Socket.IO Event
                                                                        ↓
                                                         Query Invalidation
                                                                        ↓
                                                             UI Re-render
```

---

## Routing

All routes are defined in `src/route/Routes.tsx` with authentication guards.

| Route | Page | Auth Required | Description |
|---|---|---|---|
| `/login` | Login | No | Google OAuth login page |
| `/auth/callback` | AuthCallback | No | OAuth redirect handler |
| `/accept-invite` | AcceptInvite | No | Workspace invitation acceptance |
| `/onboarding` | Onboarding | Yes | First workspace creation (shown when user has no workspaces) |
| `/` | Dashboard | Yes | Main dashboard with analytics |
| `/board` | Board | Yes | Kanban board with task management |
| `/members` | Members | Yes | Team members and invitation management |

### Route Guards

- **`ProtectedRoute`** — Redirects unauthenticated users to `/login`. Redirects users with no workspaces to `/onboarding`.
- **`OnboardingRoute`** — Redirects users who already have workspaces to `/` (prevents re-onboarding).
- **`GuestRoute`** — Redirects authenticated users away from login to `/`.

---

## State Management

| Concern | Solution | Details |
|---|---|---|
| **Server State** | TanStack React Query | All API data fetching, caching, and mutation. Centralized query keys in `api/queryKeys.ts`. |
| **Auth State** | React Context (`AuthContext`) | JWT token, user object, login/logout. Stored in `localStorage`. |
| **Workspace State** | React Context (`WorkspaceContext`) | Active workspace, workspace list, CRUD operations. |
| **Socket State** | React Context (`SocketContext`) | Socket.IO connection lifecycle, real-time event subscriptions. |
| **Toast State** | React Context (`ToastContext`) | Toast queue with global singleton dispatcher for use outside React tree. |
| **Theme State** | Component State (`WorkspaceLayout`) | Light/dark mode toggle, persisted in `localStorage` as `krumos_theme`. |

---

## API Layer

### Axios Configuration (`src/services/api.ts`)

- **Base URL**: Configured via `VITE_API_URL` environment variable.
- **Request Interceptor**: Automatically attaches `Authorization: Bearer <token>` header from `localStorage`.
- **Response Interceptor**: Unwraps the backend's `AppResponse` envelope (`{ success, data, error }`) — returns `data` directly on success, or rejects with structured error on failure.

### React Query Hooks (`src/api/`)

Each feature area has its own hook file:

| File | Hooks | Description |
|---|---|---|
| `useBoardApi.ts` | `useBoardData`, `useCreateProject`, `useCreateTask`, `useUpdateTaskStatus` | Board data fetching and task/project mutations |
| `useDashboardApi.ts` | `useDashboardData` | Dashboard summary and analytics |
| `useMembersApi.ts` | `useWorkspaceMembers`, `useInviteMember`, `useUpdateRole`, `useRemoveMember` | Member management |
| `useTaskDetailApi.ts` | `useTaskDetail`, `useUpdateTask`, `useAddComment`, `useTaskActivity` | Task detail CRUD |

### Global Error Handling (`src/config/reactQueryConfig.ts`)

The `QueryClient` is configured with global `QueryCache` and `MutationCache` error callbacks that automatically trigger toast notifications for any unhandled API error.

---

## Real-Time Events

KRUMOS uses **Socket.IO** for real-time communication with the backend.

### Connection

- Managed by `SocketContext.tsx`.
- Connects when a user is authenticated. Disconnects on logout.
- Sends JWT token and active workspace ID in the handshake `auth` payload.
- Automatically joins the active workspace's room on connection.

### Events Listened

| Event | Action |
|---|---|
| `task:created` | Invalidates board queries → new task appears |
| `task:updated` | Invalidates board & task detail queries |
| `task:deleted` | Invalidates board queries |
| `member:joined` | Invalidates member queries |
| `member:removed` | Invalidates member queries |
| `workspace:updated` | Invalidates workspace queries |

### Notification System

- `NotificationDropdown.tsx` in the top bar displays recent real-time events.
- Notifications are stored in component state and populated from socket events.
- Unread count badge with animated indicator.

---

## Theming (Light / Dark Mode)

### How It Works

1. Theme state is managed in `WorkspaceLayout.tsx` and persisted to `localStorage` as `krumos_theme`.
2. Toggling adds/removes the `dark` class on `document.documentElement`.
3. All CSS custom properties in `index.css` are defined under both `:root` (light) and `.dark` (dark) selectors.
4. Tailwind utility classes reference these CSS variables via the `@theme` block.

### Default Behavior

- **Default theme**: Light mode.
- **Login page**: Always forces light mode regardless of saved preference.
- **Onboarding page**: Always forces light mode (prevents dark flash after workspace deletion).
- **Workspace pages**: Respect saved user preference.

### Toggle Location

The theme toggle button (Sun/Moon icon) is located in the **TopBar** component, visible on all authenticated pages.

---

## Code Quality

### ESLint

Flat config in `eslint.config.js` with:
- `eslint-plugin-react-hooks` (enforced hook rules)
- `eslint-plugin-react-refresh` (fast refresh exports)
- `eslint-plugin-prettier` (formatting as lint rule)
- `eslint-config-prettier` (disables conflicting rules)
- `typescript-eslint` (TypeScript-aware linting)

### Prettier

Configuration in `.prettierrc`:
```json
{
  "singleQuote": true,
  "trailingComma": "es5",
  "semi": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### Git Hooks (Husky + lint-staged)

Pre-commit hook automatically runs ESLint and Prettier on staged `.ts` / `.tsx` files:
```json
{
  "src/**/*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ]
}
```

---

## Testing

### End-to-End (Playwright)

Playwright is configured in `playwright.config.ts` pointing to the local dev server.

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode
npx playwright test --ui

# Generate HTML report
npx playwright show-report
```

Test files are located in the `tests/` directory:
- `auth.spec.ts` — Validates authentication redirect guards for protected routes.

---

## Deployment

### Production Build

```bash
npm run build
```

This runs TypeScript compilation (`tsc -b`) followed by Vite production bundling. Output is written to the `dist/` directory.

### Serving the Build

```bash
npm run preview
```

Or serve the `dist/` directory with any static file server (Nginx, Vercel, Netlify, etc.).

### Environment Notes

- Ensure `VITE_API_URL` is set to the production backend URL in the build environment.
- The app uses client-side routing — configure your hosting to redirect all paths to `index.html` (SPA fallback).

---

## Backend Repository

This frontend is designed to work with the **KRUMOS Backend** — a NestJS application providing:

- RESTful API endpoints
- Google OAuth 2.0 authentication
- JWT token management
- MongoDB data persistence
- Socket.IO event gateway
- Role-based access control (ADMIN / MEMBER)

> **Backend Location**: `krumos-pm-server/` (sibling directory in the same project)

---

## License

This project is private and proprietary. All rights reserved.

---

<p align="center">
  <strong>KRUMOS</strong> — Built with precision. Designed with intent.
</p>
