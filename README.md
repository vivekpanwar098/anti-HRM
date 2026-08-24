# Company Portal

Monorepo with two independent apps, built and deployed separately:

```
company-portal/
├── client/                        # Next.js frontend (React 19, Tailwind CSS 4)
│   └── src/
│       ├── app/
│       │   ├── login/             # auth screens
│       │   ├── employee/**        # EMPLOYEE zone routes  → one developer
│       │   ├── admin/**           # ADMIN zone routes     → other developer
│       │   └── dashboard/         # shared landing (redirects by role)
│       ├── components/
│       │   ├── ui/                # shared UI kit (Button, Card, Table…)
│       │   └── layout/            # shared shells (Sidebar, Header)
│       ├── context/               # AuthContext (shared auth state)
│       ├── features/
│       │   ├── admin/             # ADMIN zone: components / hooks / services
│       │   ├── employee/          # EMPLOYEE zone: components / hooks / services
│       │   ├── auth/              # useAuth hook
│       │   ├── header/            # Header component
│       │   └── sidebar/           # Sidebar components
│       ├── services/              # axios instance (API base URL)
│       └── lib/                   # shared helpers & domain types
└── server/                        # Express API (TypeScript, MongoDB, JWT)
    └── src/
        ├── controllers/           # admin / auth / employee / leave
        ├── middlewares/           # auth (JWT), validation
        ├── models/                # User, Employee, Attendance, Leave, Payroll
        ├── routes/                # per-resource routers mounted at /api/v1
        ├── utils/                 # jwt helpers
        ├── validation/            # zod schemas
        └── config/                # db connection, env
```

## Role-based zones (two frontend developers)

The frontend is split so each developer works in their own area without merge
conflicts:

| Zone     | Owner               | Routes                  | Feature code                     |
| -------- | ------------------- | ----------------------- | -------------------------------- |
| Admin    | Admin-side dev      | `src/app/admin/**`      | `src/features/admin/**`          |
| Employee | Employee-side dev   | `src/app/employee/**`   | `src/features/employee/**`       |

Rules:

1. Only touch your own zone (`app/<zone>` + `features/<zone>`).
2. Shared code (`components/ui`, `components/layout`, `context`, `services`,
   `lib`) is common ground — coordinate in PR review before changing it.
3. Route files stay thin; all screens live inside `features/<zone>/components`.

## Quick start

```bash
npm run setup     # install deps for both apps
cp server/.env.example server/.env   # fill in real values
cp client/.env.example client/.env   # if/when needed
npm run dev       # client :3000 + server :5000 together
```

Other root scripts: `npm run lint`, `npm run test`, `npm run build` (run for both apps).

## Client (Next.js)

```bash
cd client
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run lint
npm run test       # vitest (run once)
npm run test:watch # vitest (watch mode)
```

## Server (Express API)

```bash
cd server
npm install
npm run dev        # build + start on http://localhost:5000
npm run build      # tsc -> dist/
npm start          # node ./dist/server.js
npm run test       # vitest + supertest (run once)
npm run test:watch # vitest (watch mode)
```

Health check: `GET http://localhost:5000/health`

## Workflow

Branch naming, commits, tests, and code review rules are defined in [CONTRIBUTING.md](./CONTRIBUTING.md). CI runs lint, tests, and builds for both apps on every PR to `main`.
