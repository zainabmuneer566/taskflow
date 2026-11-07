# TaskFlow – Project & Task Tracker

Responsive web app built with **React (Vite)**, **Node/Express** and **PostgreSQL**.
Users can manage projects and tasks, filter and search tasks, and see progress on a dashboard.

## Structure
```
taskflow/
├── database/schema.sql   # tables, constraints, sample data
├── server/               # Express REST API (pg)
└── client/               # React frontend (Vite)
```

## Setup
**Requirements:** Node.js 18+, PostgreSQL 14+

1. **Database**
   ```bash
   psql -U postgres -c "CREATE DATABASE taskflow;"
   psql -U postgres -d taskflow -f database/schema.sql
   ```
2. **Backend**
   ```bash
   cd server
   cp .env.example .env      # then put your PostgreSQL password in DATABASE_URL
   npm install
   npm run dev               # http://localhost:5000
   ```
3. **Frontend** (new terminal)
   ```bash
   cd client
   npm install
   npm run dev               # http://localhost:5173
   ```
   Vite proxies `/api` to port 5000, so no extra config is needed.

## Database schema
| Table | Columns | Notes |
|---|---|---|
| users | id PK, name, email UNIQUE, created_at | |
| projects | id PK, title, description, owner_id FK→users, created_at | owner set to NULL if user deleted |
| tasks | id PK, project_id FK→projects, title, status, priority, due_date, assigned_to FK→users, created_at | status CHECK (todo/in_progress/done), priority CHECK (low/medium/high), deleted with project (CASCADE) |

Relationships: one user owns many projects; one project has many tasks; one user can be assigned many tasks.
Indexes on `tasks.project_id` and `tasks.status` speed up filtering.

## REST API
| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/stats | dashboard counts |
| GET/POST | /api/users | list / create user |
| GET/POST | /api/projects | list (with task counts) / create |
| PUT/DELETE | /api/projects/:id | update / delete |
| GET | /api/tasks?status=&project_id=&q= | list with filters |
| POST | /api/tasks | create |
| PUT/DELETE | /api/tasks/:id | update / delete |

Errors return `{ "errors": ["message"] }` with status 400 (validation), 404, 409 (duplicate) or 500.

## Validation
- **Client:** required fields and minimum lengths checked before sending; inline error text.
- **Server:** same rules re-checked, plus allowed status/priority values; DB constraints are the final safeguard.
- UI feedback: loading spinner, success toast, error toast, empty states, delete confirmation.

## Development workflow
1. Design schema → 2. build and test API in Postman → 3. build reusable components → 4. connect pages to API (`client/src/api.js`) → 5. add validation and messages → 6. test → 7. document.
Git: work on feature branches (`feature/api`, `feature/ui`), commit small, merge via pull request to `main`.

## Reusable components
`Navbar`, `ProjectCard`, `ProjectForm`, `TaskForm`, `TaskTable`, `StatusBadge`, `Loader`, `Toast`.

## Testing checklist
**Responsiveness:** 360px phone, 768px tablet, 1280px desktop (Chrome DevTools). Navbar collapses to a menu and the task table becomes stacked cards below 720px.
**Browsers:** Chrome, Firefox, Edge.
**API (Postman):** for each endpoint test success, validation error (empty title → 400), missing id (404), duplicate email (409).
**Database:** create/update/delete a project and confirm its tasks are removed (CASCADE); try inserting a task with status `foo` (should fail the CHECK); confirm duplicate email is rejected.
**UI flows:** create/edit/delete project and task, change status inline, filter by status/project, search by title, stop the API and confirm an error message appears.

## Possible next steps
Login/authentication, pagination, drag-and-drop board view, deployment (Render/Railway + managed PostgreSQL).
