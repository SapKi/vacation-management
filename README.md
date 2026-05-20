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
┌─────────────────────────────────────────────────────┐
│                 Browser (Vue 3 SPA)                  │
│   Pages → Composables → Services → IStorage         │
│                  ↓  Axios HTTP                       │
├─────────────────────────────────────────────────────┤
│               Express REST API                       │
│  Routes(factory) → Controllers(factory)              │
│       → Services(injected repos)                     │
│       → IRepository<T> ← TypeOrmBaseRepository<T>   │
│                  ↓  TypeORM                          │
├─────────────────────────────────────────────────────┤
│                  PostgreSQL                          │
│        users   |   vacation_requests                 │
└─────────────────────────────────────────────────────┘
```

The backend exposes a REST API on port **3000**. The frontend dev server runs on port **5173** and calls the API directly via Axios (`baseURL = http://localhost:3000/api`).

All layers are wired through dependency injection — no layer imports concrete implementations directly. Swapping PostgreSQL for another DB requires only new `IRepository` implementations registered in `container.ts`.

---

## Project Structure

```
vacation-management/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts            # factory: createAuthController(service)
│   │   │   └── vacationRequest.controller.ts # factory: createVacationRequestController(service)
│   │   ├── services/
│   │   │   ├── auth.service.ts               # login/register — receives IUserRepository
│   │   │   └── vacationRequest.service.ts    # CRUD/approve/reject — receives IRepository deps
│   │   ├── repositories/
│   │   │   ├── IRepository.ts                # generic base: findById, save, remove, create
│   │   │   ├── IUserRepository.ts            # extends IRepository<User> + domain methods
│   │   │   ├── IVacationRequestRepository.ts # extends IRepository<VacationRequest>
│   │   │   └── typeorm/
│   │   │       ├── TypeOrmBaseRepository.ts  # abstract TypeORM impl of IRepository<T>
│   │   │       ├── TypeOrmUserRepository.ts  # extends base, adds user-specific queries
│   │   │       └── TypeOrmVacationRequestRepository.ts
│   │   ├── validators/
│   │   │   ├── auth.validator.ts             # pure validation functions for auth
│   │   │   └── vacationRequest.validator.ts  # pure validation functions for requests
│   │   ├── entities/
│   │   │   ├── User.ts                       # TypeORM entity + UserRole enum
│   │   │   └── VacationRequest.ts            # TypeORM entity + RequestStatus enum
│   │   ├── routes/
│   │   │   ├── auth.routes.ts                # factory: createAuthRouter(service)
│   │   │   ├── vacationRequest.routes.ts     # factory: createVacationRequestRouter(service)
│   │   │   └── user.routes.ts                # factory: createUserRouter(userRepo)
│   │   ├── middleware/
│   │   │   └── errorHandler.ts               # centralised Express error handler
│   │   ├── utils/
│   │   │   └── asyncHandler.ts               # generic async Express wrapper (removes try/catch)
│   │   ├── tests/
│   │   │   ├── auth.service.test.ts          # unit — mocked IUserRepository
│   │   │   ├── auth.routes.test.ts           # integration — real DB + health endpoint
│   │   │   ├── vacationRequest.service.test.ts # unit — mocked IRepository
│   │   │   ├── vacationRequest.routes.test.ts  # integration — real DB
│   │   │   ├── vacationRequest.test.ts         # integration — original suite
│   │   │   ├── user.routes.test.ts             # integration — GET /users endpoints
│   │   │   ├── validators.test.ts              # unit — all validator functions
│   │   │   └── errorHandler.test.ts            # unit — middleware fallback branches
│   │   ├── seed/
│   │   │   └── seed.ts                       # wipes and re-seeds demo data
│   │   ├── container.ts                      # DI wiring: creates and injects all deps
│   │   ├── app.ts                            # Express app — uses container + route factories
│   │   ├── data-source.ts                    # TypeORM DataSource — fully env-driven
│   │   └── server.ts                         # HTTP server entry point
│   ├── .env.example
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
    │   │   ├── auth.ts               # createAuthService(IStorage) factory + singleton
    │   │   └── vacationRequestsApi.ts # all vacation request API calls
    │   ├── storage/
    │   │   ├── IStorage.ts           # generic interface: get, set, remove, has
    │   │   └── LocalStorage.ts       # default IStorage impl using localStorage
    │   ├── utils/
    │   │   ├── date.ts               # formatDate, formatRelative, daysBetween
    │   │   └── error.ts              # getApiError (extracts Axios error message)
    │   ├── constants/
    │   │   └── index.ts              # enums, ROUTES, roleToRoute, STATUS_FILTER_OPTIONS
    │   ├── router/
    │   │   └── index.ts              # Vue Router with navigation guards
    │   └── styles/
    │       └── main.css              # global design tokens + component styles
    ├── .env.example
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

**8 suites — 103 tests — 100% statement/function/line coverage**

| Suite | Type | What it covers |
|---|---|---|
| `auth.service.test.ts` | Unit (mocked `IUserRepository`) | `AuthService.login` + `.register` — all validation branches |
| `vacationRequest.service.test.ts` | Unit (mocked `IRepository`) | All 7 service methods including `??` fallback branches |
| `auth.routes.test.ts` | Integration (real DB) | POST /auth/register + /auth/login + GET /health |
| `vacationRequest.routes.test.ts` | Integration (real DB) | GET all, PATCH update/reject, DELETE — all status codes |
| `vacationRequest.test.ts` | Integration (real DB) | POST create, PATCH approve/reject, GET by user |
| `user.routes.test.ts` | Integration (real DB) | GET /users + GET /users/:id + 404 case |
| `validators.test.ts` | Unit | Every validator function — all branches including boundary values |
| `errorHandler.test.ts` | Unit | Middleware — status/message present, missing, and both absent |

Unit tests inject mock `IRepository` / `IUserRepository` objects directly into service constructors — no database or module mocking needed.

### Frontend (Vitest)

```bash
cd frontend
npm test
```

**7 suites — 65 tests — 100% statement/function/line coverage**

| Suite | What it covers |
|---|---|
| `utils/date.test.ts` | `formatDate`, `formatRelative` (fake timers), `daysBetween`, `MS_PER_DAY` |
| `utils/error.test.ts` | `getApiError` — Axios shape, plain Error, null, string, custom fallback |
| `services/auth.test.ts` | `createAuthService` with injected mock storage + HTTP `login`/`register` with mocked Axios |
| `services/vacationRequestsApi.test.ts` | All 7 API methods with mocked Axios — URL, method, and payload assertions |
| `storage/LocalStorage.test.ts` | `get`, `set`, `remove`, `has` — including overwrite and nested object serialisation |
| `composables/useAuth.test.ts` | `setUser`, `logout`, `isRequester`, `isValidator`, initial state |
| `constants/index.test.ts` | Enum values, ROUTES, `roleToRoute`, `STATUS_FILTER_OPTIONS` |

The only uncovered branch is `api.ts` line 4: the `import.meta.env.VITE_API_BASE_URL` fallback — this requires a Vite build environment and is not meaningfully testable in unit tests.

---

## Design Decisions

**Cancel = hard delete.** Cancelled requests are permanently removed from the database. There is no "Cancelled" status and no restore flow. This keeps the state machine simple — only three statuses exist.

**`DB_SYNC` env-controlled.** `synchronize` is driven by `DB_SYNC=true` in `.env`. Set to `false` in staging/production and use TypeORM migrations instead.

**No JWT.** The user object is stored directly via `IStorage` after login. Acceptable for a demo; in production, use a signed JWT or a server-side session with a secure `httpOnly` cookie.

**Single source of truth for routes and role strings.** All route paths live in the `ROUTES` constant in `constants/index.ts`. All role strings live in the `UserRole` enum. No string literals are scattered through components.

**`password_hash` is `select: false`.** TypeORM never includes the column in standard repository queries. `TypeOrmUserRepository.findByNameWithPassword` uses a QueryBuilder with `.addSelect("u.password_hash")` only when needed for bcrypt comparison.

**Repository pattern with generic base.** `IRepository<T>` defines the minimal contract (findById, save, remove, create). Domain interfaces extend it with query-specific methods. `TypeOrmBaseRepository<T>` provides one TypeORM implementation of the base. Swapping databases requires only new classes implementing the domain interfaces — services and controllers are untouched.

**Dependency injection via `container.ts`.** All wiring happens in one file. No service, controller, or route imports a concrete implementation directly.

**Generic `asyncHandler`.** Eliminates the try/catch boilerplate from every controller method. Any thrown `{ status, message }` object flows to the centralised `errorHandler` middleware.

**Injected storage on the frontend.** `createAuthService(storage: IStorage)` accepts any storage implementation. The production singleton uses `LocalStorageAdapter`; tests inject a plain mock object — no `localStorage` stubbing needed.

**Role-aware navigation.** The header shows only the link relevant to the current user's role, plus a "Switch to [other role]" button that logs out and redirects to `/login`.

**Background decoration is a fixed layer at `z-index: 0`.** All page content sits at `z-index: 1` (via `.main-content`) so the icons are always behind interactive elements.

---

## Known Limitations

- Session is not invalidated server-side on logout — the token / stored object is simply removed from the client.
- No pagination — the validator view loads all requests at once.
- No role-based protection on the API — any client can call any endpoint without authentication.
- `synchronize: true` must be disabled before any production deployment.
- No email or in-app notifications for status changes.
- No support for partial-day or recurring requests.
