# Vacation Management Platform

A full-stack web application for managing employee vacation requests. Employees submit time-off requests; managers review, approve, or reject them — all from one workspace.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Project Structure](#project-structure)
5. [Database Schema](#database-schema)
6. [API Reference](#api-reference)
7. [Frontend Pages & Components](#frontend-pages--components)
8. [State Management & Services](#state-management--services)
9. [Environment Variables](#environment-variables)
10. [Local Setup](#local-setup)
11. [Seed Data](#seed-data)
12. [Testing](#testing)
13. [Design Decisions](#design-decisions)
14. [Known Limitations](#known-limitations)

---

## Overview

The platform supports two user roles:

| Role | Capabilities |
|---|---|
| **Requester** | Submit vacation requests, view own history, edit or cancel pending requests |
| **Validator** | View all employees' requests, filter by status, approve or reject with a comment |

Sessions are stored in `localStorage`. There is no JWT — the user object is persisted directly after a successful login.

---

## Tech Stack

### Backend

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express 4 |
| Language | TypeScript 5 |
| ORM | TypeORM 0.3 |
| Database | PostgreSQL |
| Password hashing | bcryptjs |
| Test runner | Jest 29 + ts-jest + Supertest |

### Frontend

| Layer | Technology |
|---|---|
| Framework | Vue 3 (Composition API, `<script setup>`) |
| Language | TypeScript 5 |
| Build tool | Vite 5 |
| Routing | Vue Router 4 |
| HTTP client | Axios |
| Icons | Lucide Vue Next |
| Fonts | Electrolize (body), Funnel Display (headings) — Google Fonts |
| Test runner | Vitest 4 + @vue/test-utils |

---

## Architecture

```
┌─────────────────────────────────────┐
│           Browser (Vue 3 SPA)        │
│  Pages → Composables → Services     │
│          ↓  Axios HTTP               │
├─────────────────────────────────────┤
│         Express REST API             │
│  Routes → Controllers → Services    │
│          ↓  TypeORM                  │
├─────────────────────────────────────┤
│           PostgreSQL                 │
│   users   |   vacation_requests      │
└─────────────────────────────────────┘
```

The backend exposes a REST API on port **3000**. The frontend dev server runs on port **5173** and calls the API directly via Axios (`baseURL = http://localhost:3000/api`).

---

## Project Structure

```
vacation-management/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts            # login, register handlers
│   │   │   └── vacationRequest.controller.ts # vacation request handlers
│   │   ├── services/
│   │   │   ├── auth.service.ts               # login/register business logic
│   │   │   └── vacationRequest.service.ts    # CRUD + approve/reject logic
│   │   ├── entities/
│   │   │   ├── User.ts                       # TypeORM entity + UserRole enum
│   │   │   └── VacationRequest.ts            # TypeORM entity + RequestStatus enum
│   │   ├── routes/
│   │   │   ├── auth.routes.ts                # POST /login, /register
│   │   │   ├── vacationRequest.routes.ts     # vacation request endpoints
│   │   │   └── user.routes.ts                # GET /users, /users/:id
│   │   ├── middleware/
│   │   │   └── errorHandler.ts               # centralised Express error handler
│   │   ├── tests/
│   │   │   ├── auth.service.test.ts          # unit tests (mocked DB)
│   │   │   ├── auth.routes.test.ts           # integration tests (real DB)
│   │   │   ├── vacationRequest.service.test.ts
│   │   │   ├── vacationRequest.routes.test.ts
│   │   │   └── vacationRequest.test.ts       # original integration tests
│   │   ├── seed/
│   │   │   └── seed.ts                       # wipes and re-seeds demo data
│   │   ├── app.ts                            # Express app + route mounting
│   │   ├── data-source.ts                    # TypeORM DataSource config
│   │   └── server.ts                         # HTTP server entry point
│   ├── jest.config.js
│   ├── tsconfig.json
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── HomePage.vue          # landing page with login/switch CTA
    │   │   ├── LoginPage.vue         # sign-in form
    │   │   ├── SignUpPage.vue        # registration form
    │   │   ├── RequesterPage.vue     # employee dashboard
    │   │   └── ValidatorPage.vue     # manager dashboard
    │   ├── components/
    │   │   ├── VacationRequestForm.vue    # create/submit request form
    │   │   ├── VacationRequestList.vue    # list with filter bar
    │   │   ├── VacationRequestCard.vue    # single request card
    │   │   ├── StatusBadge.vue            # Pending/Approved/Rejected pill
    │   │   ├── StatusFilter.vue           # filter tabs (All/Pending/…)
    │   │   ├── EditRequestModal.vue       # edit dates/reason of pending request
    │   │   ├── CancelModal.vue            # confirm hard delete
    │   │   ├── RejectModal.vue            # reject with required comment
    │   │   └── VacationDeco.vue           # decorative background SVG icons
    │   ├── composables/
    │   │   └── useAuth.ts            # reactive auth state (module-level ref)
    │   ├── services/
    │   │   ├── api.ts                # Axios instance (baseURL from env)
    │   │   ├── auth.ts               # login/register + localStorage helpers
    │   │   └── vacationRequestsApi.ts
    │   ├── utils/
    │   │   ├── date.ts               # formatDate, formatRelative, daysBetween
    │   │   └── error.ts              # getApiError (extracts Axios error message)
    │   ├── constants/
    │   │   └── index.ts              # enums, ROUTES, roleToRoute, STATUS_FILTER_OPTIONS
    │   ├── router/
    │   │   └── index.ts              # Vue Router with navigation guards
    │   └── styles/
    │       └── main.css              # global design tokens + component styles
    ├── vite.config.ts
    ├── tsconfig.json
    └── package.json
```

---

## Database Schema

### `users`

| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | auto-incremented |
| `name` | varchar | unique display name, used as the login identifier |
| `role` | enum | `Requester` \| `Validator` |
| `password_hash` | text | bcrypt hash; `select: false` — never returned in standard queries |

### `vacation_requests`

| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | |
| `user_id` | int FK → users.id | |
| `start_date` | date | |
| `end_date` | date | must be ≥ start_date |
| `reason` | text nullable | optional free-text reason from employee |
| `status` | enum | `Pending` \| `Approved` \| `Rejected` — defaults to `Pending` |
| `comments` | text nullable | required when rejecting; written by the validator |
| `created_at` | timestamptz | auto-set by TypeORM `@CreateDateColumn` |

> `synchronize: true` is enabled — TypeORM updates the schema automatically on server start. **Disable this before any production deployment.**

---

## API Reference

**Base URL:** `http://localhost:3000/api`

All error responses use the shape: `{ "error": "message string" }`

---

### Auth — `/api/auth`

#### `POST /api/auth/register`
Creates a new user account.

**Request body:**
```json
{
  "name": "Alice Johnson",
  "role": "Requester",
  "password": "alice123"
}
```

| Status | Meaning |
|---|---|
| 201 | User created — returns user object (no `password_hash`) |
| 400 | Missing name / role / password shorter than 4 characters |
| 409 | Name already taken |

---

#### `POST /api/auth/login`
Authenticates an existing user.

**Request body:**
```json
{
  "name": "Alice Johnson",
  "password": "alice123"
}
```

| Status | Meaning |
|---|---|
| 200 | Login successful — returns user object (no `password_hash`) |
| 400 | Missing name or password |
| 401 | Invalid name or password |

---

### Users — `/api/users`

#### `GET /api/users`
Returns all users (without `password_hash`).

#### `GET /api/users/:id`
Returns a single user by ID.

| Status | Meaning |
|---|---|
| 200 | User found |
| 404 | User not found |

---

### Vacation Requests — `/api/vacation-requests`

#### `POST /api/vacation-requests`
Creates a new vacation request. Status defaults to `Pending`.

**Request body:**
```json
{
  "userId": 1,
  "startDate": "2026-09-01",
  "endDate": "2026-09-05",
  "reason": "Summer holiday"
}
```

| Status | Meaning |
|---|---|
| 201 | Request created |
| 400 | Missing userId / startDate / endDate, or endDate < startDate |
| 404 | User not found |

---

#### `GET /api/vacation-requests`
Returns all requests. Optionally filter by status.

**Query params:** `?status=Pending` | `Approved` | `Rejected`

Invalid status values are ignored and all requests are returned. Includes the `user` relation (id, name, role).

---

#### `GET /api/vacation-requests/user/:userId`
Returns all requests belonging to a specific user, ordered by `created_at DESC`.

---

#### `PATCH /api/vacation-requests/:id`
Updates `startDate`, `endDate`, and/or `reason` on a **Pending** request only.

| Status | Meaning |
|---|---|
| 200 | Updated — returns updated request |
| 400 | Request is not Pending, or new endDate < startDate |
| 404 | Request not found |

---

#### `PATCH /api/vacation-requests/:id/approve`
Sets status to `Approved`.

| Status | Meaning |
|---|---|
| 200 | Approved — returns updated request |
| 404 | Request not found |

---

#### `PATCH /api/vacation-requests/:id/reject`
Sets status to `Rejected` and stores the validator's comment.

**Request body:**
```json
{ "comments": "Too many absences that week" }
```

| Status | Meaning |
|---|---|
| 200 | Rejected — returns updated request |
| 400 | `comments` is missing or blank |
| 404 | Request not found |

---

#### `DELETE /api/vacation-requests/:id`
Permanently deletes a **Pending** request (hard delete — no restore).

| Status | Meaning |
|---|---|
| 204 | Deleted |
| 400 | Request is not Pending |
| 404 | Request not found |

---

#### `GET /api/health`
Returns `{ "status": "ok" }`. Used to verify the server is running.

---

## Frontend Pages & Components

### Pages

| Page | Route | Access |
|---|---|---|
| `HomePage` | `/` | Public — landing with "Continue" or "Sign In" CTA |
| `LoginPage` | `/login` | Public |
| `SignUpPage` | `/signup` | Public |
| `RequesterPage` | `/requester` | Requires login |
| `ValidatorPage` | `/validator` | Requires login |

Navigation guards in `router/index.ts` redirect unauthenticated users to `/login` when accessing protected routes.

### Component Responsibilities

**`VacationRequestForm`** — date pickers for start/end + optional reason textarea. Client-side validation ensures end ≥ start before submitting.

**`VacationRequestList`** — renders a `StatusFilter` bar followed by a list of `VacationRequestCard` components. Accepts props: `:requests`, `:loading`, `:error`, `:show-edit`, `:show-cancel`, `:show-approve`, `:show-reject`.

**`VacationRequestCard`** — displays dates, duration in days, employee name, relative submission time ("Submitted today"), optional reason, optional manager note. Shows action buttons based on props.

**`EditRequestModal`** — modal dialog for editing start/end/reason of a pending request.

**`CancelModal`** — confirmation dialog for hard-deleting a pending request, shows a summary of what will be removed.

**`RejectModal`** — requires a non-empty comment before allowing rejection.

**`StatusBadge`** — colour-coded pill badge: yellow = Pending, green = Approved, red = Rejected.

**`StatusFilter`** — tab bar for All / Pending / Approved / Rejected. Emits the selected filter to the parent.

**`VacationDeco`** — `position: fixed; z-index: 0` layer of 13 small neon vacation-themed icons (camera, sunglasses, sun, airplane, palm tree, cocktail, waves, beach umbrella, ticket, flip flops, suitcase, map pin, binoculars). Uses CSS `drop-shadow` for neon glow. Purely decorative, `pointer-events: none`.

---

## State Management & Services

### `useAuth` composable

**File:** `src/composables/useAuth.ts`

A module-level `ref<AuthUser | null>` is initialised from `localStorage` when the module first loads. All components share the same reactive reference.

```ts
const { currentUser, isLoggedIn, isRequester, isValidator, setUser, logout } = useAuth();
```

| Property / Method | Description |
|---|---|
| `currentUser` | Reactive ref — the logged-in user or `null` |
| `isLoggedIn` | Computed — `!!currentUser.value` |
| `isRequester` | Computed — role is `Requester` |
| `isValidator` | Computed — role is `Validator` |
| `setUser(user)` | Saves to localStorage + updates ref |
| `logout()` | Clears localStorage + nulls ref |

---

### `authService`

**File:** `src/services/auth.ts`

| Method | Description |
|---|---|
| `login(name, password)` | POST /auth/login |
| `register(payload)` | POST /auth/register |
| `save(user)` | Write user to `localStorage` key `vm_user` |
| `get()` | Parse and return `vm_user` from localStorage, or `null` |
| `clear()` | Remove `vm_user` from localStorage |
| `isLoggedIn()` | Returns `!!localStorage.getItem("vm_user")` |

---

### `vacationRequestsApi`

**File:** `src/services/vacationRequestsApi.ts`

| Method | HTTP call |
|---|---|
| `create(payload)` | POST /vacation-requests |
| `getByUser(userId)` | GET /vacation-requests/user/:userId |
| `getAll(status?)` | GET /vacation-requests[?status=…] |
| `update(id, payload)` | PATCH /vacation-requests/:id |
| `cancel(id)` | DELETE /vacation-requests/:id |
| `approve(id)` | PATCH /vacation-requests/:id/approve |
| `reject(id, comments)` | PATCH /vacation-requests/:id/reject |

---

### Utility functions

**`src/utils/date.ts`**

```ts
formatDate(dateStr: string): string
// "2026-09-01" → "Sep 1, 2026"

formatRelative(dateStr: string): string
// → "Submitted today" | "Submitted yesterday" | "Submitted 3 days ago" | "Jun 1"

daysBetween(startDate: string, endDate: string): number
// inclusive — daysBetween("2026-09-01", "2026-09-05") === 5
```

**`src/utils/error.ts`**

```ts
getApiError(err: unknown, fallback?: string): string
// Extracts err.response.data.error (Axios), falls back to err.message, then fallback string
```

---

## Environment Variables

### Backend — `backend/.env`

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=vacation_management
```

All values have defaults in `data-source.ts` — the server starts without a `.env` file in development.

### Frontend — `frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

If not set, Axios defaults to `http://localhost:3000/api`.

---

## Local Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ running locally

### 1. Create the database

```bash
psql -U postgres -c "CREATE DATABASE vacation_management;"
```

### 2. Start the backend

```bash
cd backend
npm install
npm run dev
# → http://localhost:3000
```

TypeORM `synchronize: true` creates the `users` and `vacation_requests` tables automatically on first start.

### 3. Seed demo data

```bash
cd backend
npm run seed
```

Wipes all existing data and creates two demo users plus 3 sample requests (see [Seed Data](#seed-data) below).

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## Seed Data

| User | Role | Password |
|---|---|---|
| Alice Johnson | Requester | `Tr0pic@lLeave!` |
| Bob Smith | Validator | `Appr0ve&Rest!` |

**Sample vacation requests (Alice Johnson):**

| Dates | Reason | Status |
|---|---|---|
| Jun 1 – Jun 5, 2026 | Summer vacation | Pending |
| Jul 10 – Jul 15, 2026 | Family trip | Approved |
| Aug 20 – Aug 22, 2026 | Personal days | Rejected — "Too many employees absent that week" |

---

## Testing

### Backend (Jest + Supertest)

```bash
cd backend
npm test
```

**5 suites — 63 tests — all passing**

| Suite | Type | What it covers |
|---|---|---|
| `auth.service.test.ts` | Unit (mocked DB) | `AuthService.login` + `.register` — all validation branches |
| `vacationRequest.service.test.ts` | Unit (mocked DB) | All 6 service methods with every error guard |
| `auth.routes.test.ts` | Integration (real DB) | POST /auth/register + /auth/login — all status codes |
| `vacationRequest.routes.test.ts` | Integration (real DB) | GET all, PATCH update, PATCH reject, DELETE — all guards |
| `vacationRequest.test.ts` | Integration (real DB) | POST create, PATCH approve/reject, GET by user |

Unit tests mock `AppDataSource.getRepository` with Jest — no database connection required.
Integration tests require a running PostgreSQL instance and clean up all test rows after each suite.

### Frontend (Vitest)

```bash
cd frontend
npm test
```

**5 suites — 47 tests — all passing**

| Suite | What it covers |
|---|---|
| `utils/date.test.ts` | `formatDate`, `formatRelative` (vi.useFakeTimers), `daysBetween`, `MS_PER_DAY` |
| `utils/error.test.ts` | `getApiError` — Axios shape, plain Error, null, string, custom fallback |
| `services/auth.test.ts` | `authService` localStorage operations (save, get, clear, isLoggedIn) |
| `composables/useAuth.test.ts` | `setUser`, `logout`, `isRequester`, `isValidator`, initial state from localStorage |
| `constants/index.test.ts` | Enum values, ROUTES constants, `roleToRoute`, `STATUS_FILTER_OPTIONS` |

---

## Design Decisions

**Cancel = hard delete.** Cancelled requests are permanently removed from the database. There is no "Cancelled" status and no restore flow. This keeps the state machine simple — only three statuses exist.

**`synchronize: true` in TypeORM.** The database schema auto-updates on every server start. Must be replaced with TypeORM migrations before any production deployment.

**No JWT.** The user object is stored directly in `localStorage` after login. Acceptable for a demo; in production, use a signed JWT or a server-side session with a secure `httpOnly` cookie.

**Single source of truth for routes and role strings.** All route paths live in the `ROUTES` constant in `constants/index.ts`. All role strings live in the `UserRole` enum. No string literals are scattered through components.

**`password_hash` is `select: false`.** TypeORM never includes the column in standard repository queries. `AuthService.login` uses a QueryBuilder with `.addSelect("u.password_hash")` to fetch it only for the bcrypt comparison.

**Role-aware navigation.** The header shows only the link relevant to the current user's role, plus a "Switch to [other role]" button that logs the current user out and redirects to `/login`. Neither role can navigate to the other's dashboard through the UI.

**Background decoration is a fixed layer at `z-index: 0`.** All page content sits at `z-index: 1` (via `.main-content`) so the icons are always behind interactive elements without needing per-component z-index management.

---

## Known Limitations

- Session is not invalidated server-side on logout — the token / stored object is simply removed from the client.
- No pagination — the validator view loads all requests at once.
- No role-based protection on the API — any client can call any endpoint without authentication.
- `synchronize: true` must be disabled before any production deployment.
- No email or in-app notifications for status changes.
- No support for partial-day or recurring requests.
