# Company Portal

Monorepo with two independent apps, built and deployed separately:

```
company-portal/
├── client/                    # Next.js frontend (React 19, Tailwind CSS 4)
│   └── src/
│       ├── app/               # routes (keep thin)
│       ├── features/<name>/   # feature-scoped components & hooks
│       └── lib/               # shared helpers & domain types
└── server/                    # Express API (TypeScript, MongoDB, JWT)
    └── src/
        ├── modules/<name>/    # router → controller → service → model
        ├── middleware/        # auth, error handler, validators
        └── config/            # db connection etc.
```

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
