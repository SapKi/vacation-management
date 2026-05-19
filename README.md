# Vacation Management Interface

A full-stack web application for managing employee vacation requests. Employees submit requests, and managers approve or reject them with comments.

---

## Tech Stack

| Layer      | Technology                     |
|------------|-------------------------------|
| Frontend   | Vue 3, Vue Router, Axios, Vite |
| Backend    | Node.js, Express, TypeScript   |
| Database   | PostgreSQL                     |
| ORM        | TypeORM                        |
| Tests      | Jest, Supertest, ts-jest       |

---

## Features

### Requester Interface (`/requester`)
- Submit vacation requests (start date, end date, optional reason)
- View your own request history with live status badges
- Client-side and server-side validation with clear error messages
- Loading, error, and empty states handled

### Validator Interface (`/validator`)
- View **all** vacation requests across all employees
- Filter by status: All / Pending / Approved / Rejected
- Approve a request with one click
- Reject a request with a required comment (modal dialog)
- Status badges, employee names, and date ranges shown clearly

---

## Folder Structure

```
vacation-management/
├── backend/
│   ├── src/
│   │   ├── app.ts                  # Express app setup
│   │   ├── server.ts               # Entry point — connects DB and starts server
│   │   ├── data-source.ts          # TypeORM DataSource config
│   │   ├── entities/
│   │   │   ├── User.ts
│   │   │   └── VacationRequest.ts
│   │   ├── routes/
│   │   │   ├── vacationRequest.routes.ts
│   │   │   └── user.routes.ts
│   │   ├── controllers/
│   │   │   └── vacationRequest.controller.ts
│   │   ├── services/
│   │   │   └── vacationRequest.service.ts
│   │   ├── middleware/
│   │   │   └── errorHandler.ts
│   │   ├── seed/
│   │   │   └── seed.ts
│   │   └── tests/
│   │       └── vacationRequest.test.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── main.ts
    │   ├── App.vue
    │   ├── router/
    │   │   └── index.ts
    │   ├── services/
    │   │   ├── api.ts              # Axios client
    │   │   └── vacationRequestsApi.ts
    │   ├── pages/
    │   │   ├── RequesterPage.vue
    │   │   └── ValidatorPage.vue
    │   ├── components/
    │   │   ├── VacationRequestForm.vue
    │   │   ├── VacationRequestList.vue
    │   │   ├── VacationRequestCard.vue
    │   │   ├── StatusBadge.vue
    │   │   ├── StatusFilter.vue
    │   │   └── RejectModal.vue
    │   └── styles/
    │       └── main.css
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    └── .env.example
```

---

## Database Setup

You need a running PostgreSQL instance (version 13+).

### 1. Create the database

```sql
-- Connect to PostgreSQL as a superuser and run:
CREATE DATABASE vacation_management;
```

Using psql:
```bash
psql -U postgres -c "CREATE DATABASE vacation_management;"
```

---

## Environment Variables

### Backend (`backend/.env`)

Copy the example and fill in your credentials:

```bash
cp backend/.env.example backend/.env
```

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=vacation_management
```

### Frontend (`frontend/.env`)

```bash
cp frontend/.env.example frontend/.env
```

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

---

## How to Install

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

---

## How to Run

### 1. Start the backend

```bash
cd backend
npm run dev
```

Server starts at `http://localhost:3000`.  
TypeORM creates/syncs tables automatically on first run.

### 2. Seed the database

In a second terminal:

```bash
cd backend
npm run seed
```

This inserts test users and sample vacation requests.

### 3. Start the frontend

```bash
cd frontend
npm run dev
```

Frontend runs at `http://localhost:5173`.

Open your browser:
- **Requester view**: http://localhost:5173/requester
- **Validator view**: http://localhost:5173/validator

---

## How to Run Tests

Tests use the real PostgreSQL database (same `.env`). Make sure the database is running and `.env` is configured.

```bash
cd backend
npm test
```

Tests clean up after themselves — they create a test user, run assertions, then delete all test data.

---

## Seed Data Explanation

Running `npm run seed` inserts:

| Type      | Name           | ID | Role      |
|-----------|----------------|----|-----------|
| User      | Alice Johnson  | 1  | Requester |
| User      | Bob Smith      | 2  | Validator |

And 3 vacation requests for Alice:

| Start      | End        | Status   | Reason          |
|------------|------------|----------|-----------------|
| 2026-06-01 | 2026-06-05 | Pending  | Summer vacation |
| 2026-07-10 | 2026-07-15 | Approved | Family trip     |
| 2026-08-20 | 2026-08-22 | Rejected | Personal days   |

> **Note:** The seed deletes all existing data before inserting. Run it only once, or re-run to reset to a clean state.

---

## API Endpoints

### Vacation Requests

| Method | Endpoint                              | Description                           |
|--------|---------------------------------------|---------------------------------------|
| POST   | `/api/vacation-requests`              | Submit a new vacation request         |
| GET    | `/api/vacation-requests`              | Get all requests (optional `?status=Pending`) |
| GET    | `/api/vacation-requests/user/:userId` | Get requests for a specific user      |
| PATCH  | `/api/vacation-requests/:id/approve`  | Approve a request                     |
| PATCH  | `/api/vacation-requests/:id/reject`   | Reject a request (body: `{ comments }`) |

### Users

| Method | Endpoint         | Description      |
|--------|------------------|------------------|
| GET    | `/api/users`     | List all users   |
| GET    | `/api/users/:id` | Get user by id   |

### Example: Submit a request

```bash
curl -X POST http://localhost:3000/api/vacation-requests \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"startDate":"2026-06-10","endDate":"2026-06-14","reason":"Holiday"}'
```

### Example: Reject a request

```bash
curl -X PATCH http://localhost:3000/api/vacation-requests/1/reject \
  -H "Content-Type: application/json" \
  -d '{"comments":"Too many absences that week"}'
```

---

## Technical Decisions

### Why TypeORM with `synchronize: true`?
For a local assignment, auto-sync removes the need to manage migrations manually. In production, you'd use migrations instead.

### Why no authentication?
The spec explicitly allows skipping auth. The requester page uses user ID 1 (hardcoded), and the validator uses user ID 2. This is documented clearly and keeps the app clean and testable.

### Controller → Service separation
Controllers only parse HTTP input and call services. All business logic (validation, DB queries) lives in the service layer. This makes the service independently testable.

### Centralized error handler
A single Express error-handler middleware catches all thrown errors and returns consistent `{ error: "..." }` JSON responses with the correct HTTP status code.

### Vue 3 Composition API
All components use `<script setup>` with the Composition API for concise, type-safe components. No Options API was used.

### Axios service layer
All API calls are encapsulated in `vacationRequestsApi.ts`. Components never import Axios directly — they call functions from the service. This makes it trivial to mock or swap the API layer.

---

## Known Limitations

- **No authentication** — user identity is hardcoded. In production, use JWT or sessions.
- **Single requester** — the form always submits as user ID 1. A real app would use the logged-in user's ID.
- **`synchronize: true`** — convenient for dev/demo, but should use migrations in production.
- **No pagination** — the validator list fetches all requests at once. Fine for a small dataset, but would need pagination at scale.
- **Tests require a live database** — integration tests hit real PostgreSQL. Mocking the DB would speed up the test suite but was skipped for simplicity.
