# Company Portal

Monorepo with two independent apps, built and deployed separately:

```
company-portal/
├── client/   # Next.js frontend (React 19, Tailwind CSS 4)
└── server/   # Express + TypeScript + MongoDB API
```

## Client (Next.js)

```bash
cd client
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint
```

## Server (Express API)

```bash
cd server
npm install
npm run dev      # build + start on http://localhost:5000
npm run build    # tsc -> dist/
npm start        # node ./dist/app.js
```

Health check: `GET http://localhost:5000/health`
