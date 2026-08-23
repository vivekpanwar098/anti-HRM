# Contributing Guidelines — Anti-Bikli-Tech / company-portal

This is the **single source of truth** for how we develop, name branches, commit, test, and review code in this repository. Every contributor must follow these rules.

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Branch Naming Convention](#2-branch-naming-convention)
3. [Commit Message Convention](#3-commit-message-convention)
4. [Coding Standards](#4-coding-standards)
5. [Testing Standards & How to Write Test Cases](#5-testing-standards--how-to-write-test-cases)
6. [Pull Requests & Code Review on GitHub](#6-pull-requests--code-review-on-github)
7. [Definition of Done](#7-definition-of-done)

---

## 1. Project Structure

Monorepo with two independent apps, built and deployed separately:

```
company-portal/
├── client/   # Next.js frontend (React 19, Tailwind CSS 4, TypeScript)
└── server/   # Express API (TypeScript, MongoDB via Mongoose, JWT auth)
```

- Work inside **only one app per PR** whenever possible.
- Shared cross-app changes require a PR touching both folders and both owners as reviewers.

---

## 2. Branch Naming Convention

**Format:**

```
<type>/<ticket-id>-<short-description>
```

- All **lowercase**, words separated by **hyphens** (`-`). No spaces, no underscores.
- `<type>` is one of:

| Type       | Purpose                                          | Example                                        |
| ---------- | ------------------------------------------------ | ---------------------------------------------- |
| `feature`  | New functionality                                | `feature/PORT-12-add-login-page`               |
| `fix`      | Bug fix                                          | `fix/PORT-34-correct-token-expiry`             |
| `hotfix`   | Urgent fix straight to production                | `hotfix/PORT-51-server-crash-on-startup`       |
| `refactor` | Code change that adds no feature and fixes nothing | `refactor/PORT-07-extract-auth-middleware`   |
| `update`   | Dependency bumps, config, folder structure       | `update/PORT-03-folder-structure`              |
| `docs`     | Documentation only                               | `docs/PORT-08-api-guidelines`                  |
| `test`     | Adding or fixing tests                           | `test/PORT-19-auth-endpoint-tests`             |
| `chore`    | Tooling, CI, build scripts                       | `chore/PORT-02-setup-eslint`                   |

**Rules:**

- Branch off `main` (except `hotfix/*`, which branches off the latest release tag).
- Keep branches short-lived (< 5 working days). Rebase onto `main` frequently.
- ❌ **No personal-name branches** (`anshul`, `vivek`) — they are banned going forward; use your ticket ID instead.

```bash
# Create a branch from latest main
git checkout main && git pull origin main
git checkout -b feature/PORT-12-add-login-page
```

---

## 3. Commit Message Convention

We follow **Conventional Commits**:

```
<type>(<scope>): <short imperative summary>

[optional body]
[optional footer — e.g. Closes #123]
```

| Type       | When to use                                  |
| ---------- | -------------------------------------------- |
| `feat`     | New feature                                  |
| `fix`      | Bug fix                                      |
| `refactor` | Neither fixes a bug nor adds a feature       |
| `test`     | Adding/fixing tests                          |
| `docs`     | Documentation only                           |
| `style`    | Formatting, no logic change                  |
| `perf`     | Performance improvement                      |
| `chore`    | Build, deps, CI                              |
| `revert`   | Reverting a previous commit                  |

**Rules:**

- Summary ≤ 72 chars, lowercase after the colon, no trailing period.
- Scope = app or module: `client`, `server`, `auth`, `sidebar`, …
  - Example: `feat(auth): add refresh token rotation`
- One logical change per commit. Never mix formatting + logic.
- Link issues in the footer: `Closes #42`.

```bash
git commit -m "feat(sidebar): add active route highlight"
```

---

## 4. Coding Standards

### General

- **TypeScript everywhere.** No `any`. Prefer `unknown` + narrowing over `any`.
- Run `npm run lint` before every push (client). Zero warnings allowed on new code.
  > Note: the server has no ESLint yet — `typescript-eslint` does not support TypeScript 7 (tracked in typescript-eslint#10940). Add it once supported; until then `tsc` is the server's gatekeeper.
- No commented-out code, no dead files, no `console.log` in merged code (server startup logs excepted).
- Secrets live in `.env` only — copy `.env.example` to `.env` in each app and fill in real values. `.env` is git-ignored; never commit keys/tokens.

### Client (Next.js)

- App Router structure; components grouped by **feature**, not by type:

  ```
  src/
  ├── app/            # routes only — keep thin
  ├── components/ui/  # shared UI primitives (Button, Card, Modal, Table, …)
  ├── features/<name>/
  │   ├── components/
  │   ├── hooks/
  │   └── utils.ts
  └── lib/            # shared helpers (api client, formatters, types)
  ```

- Never edit `components/ui` primitives inside a feature — extend their props instead. New primitives need tests beside them.

- Server Components by default; add `"use client"` only when needed (state, effects, browser APIs).
- Styling with Tailwind utility classes only; extract repeated class sets into components, not CSS files.
- Fetching through a shared typed API client in `lib/`; never call raw `fetch` inside components.
- File naming: components `PascalCase.tsx`, everything else `camelCase.ts`.

### Server (Express)

- Layered structure:

  ```
  src/
  ├── modules/<name>/
  │   ├── <name>.router.ts    # routes only
  │   ├── <name>.controller.ts # request/response handling only
  │   ├── <name>.service.ts    # business logic
  │   └── <name>.model.ts      # Mongoose schema/model
  └── middleware/              # auth, error handler, validators
  ```

- Controllers never contain business logic; services never touch `req`/`res`.
- Validate every request body/query/params (zod or express-validator) before the controller.
- Central error handler middleware — never send ad-hoc errors from controllers.
- All async code wrapped in try/catch or an async wrapper; unhandled rejections must crash loudly in dev.
- Auth via JWT helpers in `middleware/auth`; never decode tokens manually elsewhere.

---

## 5. Testing Standards & How to Write Test Cases

### Stack

| Area          | Runner            | Location                          |
| ------------- | ----------------- | --------------------------------- |
| Server (API)  | Vitest + Supertest | `server/tests/<module>.test.ts`  |
| Client (UI)   | Vitest + React Testing Library | next to component: `Component.test.tsx` |

Scripts per app: `npm run test` (once), `npm run test:watch`, `npm run test:coverage`.
From the repo root: `npm run test` runs both apps sequentially; `npm run dev` starts both.

### Test file naming

- Server: `tests/auth.test.ts`, `tests/posts.test.ts`
- Client: `SidebarItem.test.tsx` beside `SidebarItem.tsx`

### How to write a test case (the standard)

Every test follows **Arrange → Act → Assert (AAA)** and this naming pattern:

```
describe("<unit under test>")           → what is being tested
  describe("<method / endpoint>")       → function or HTTP route
    it("should <expected> when <condition>") → behavior, not implementation
```

Each `it()` tests **one** behavior. Cover at minimum:

1. ✅ Happy path (valid input → expected result)
2. ⚠️ Validation failures (missing/empty/invalid fields → 400 / inline error)
3. 🔐 Authorization (unauthenticated → 401, wrong role → 403)
4. 🚫 Not found / conflict (unknown id → 404, duplicate email → 409)
5. 🧩 Edge cases (boundaries, unicode, very long input)

### Example — Server API test (`server/tests/auth.test.ts`)

```ts
import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../src/app";

describe("Auth API", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send({
      name: "Vishal",
      email: "vishal@company.com",
      password: "Str0ng!Pass",
    });
  });

  describe("POST /api/auth/login", () => {
    it("should return 200 and a token when credentials are valid", async () => {
      // Arrange
      const body = { email: "vishal@company.com", password: "Str0ng!Pass" };

      // Act
      const res = await request(app).post("/api/auth/login").send(body);

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it("should return 401 when password is wrong", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "vishal@company.com", password: "wrong-pass" });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid credentials");
    });

    it("should return 400 when email is missing", async () => {
      const res = await request(app).post("/api/auth/login").send({});

      expect(res.status).toBe(400);
    });
  });
});
```

### Example — Client component test (`src/features/sidebar/SidebarItem.test.tsx`)

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SidebarItem } from "./SidebarItem";

describe("SidebarItem", () => {
  it("should render its label", () => {
    render(<SidebarItem label="Dashboard" href="/dashboard" />);
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeDefined();
  });

  it("should navigate when clicked", async () => {
    render(<SidebarItem label="Dashboard" href="/dashboard" />);
    const link = screen.getByRole("link", { name: "Dashboard" });
    expect(link.getAttribute("href")).toBe("/dashboard");
  });
});
```

### Rules

- A bug fix **must** come with a regression test that fails without the fix.
- Tests are written in the same PR as the feature — never "tests later".
- No network/database in client tests; mock at the boundary.
- Aim for meaningful coverage of services/middleware (>80% on `server/src/modules`); coverage % is a signal, not the goal.

---

## 6. Pull Requests & Code Review on GitHub

### Opening a PR

1. Push your branch and open a **Draft PR early** for big work, mark **Ready for Review** when complete.
2. PR title = Conventional Commit style: `feat(auth): add login page (#PORT-12)`.
3. Fill in the PR template:

```markdown
## What does this PR do?
<!-- 2–3 sentences -->

## How was it tested?
<!-- commands run, manual steps, screenshots for UI -->

## Checklist
- [ ] Lint passes (`npm run lint`)
- [ ] Build passes (`npm run build`)
- [ ] Tests added/updated and passing
- [ ] No secrets committed
- [ ] Docs updated if behavior changed
```

4. Add **at least 1 reviewer** (2 for auth/payments/data-model changes).
5. Add labels: `feature` / `bug` / `needs-review` / `ready-to-merge`.

### Review rules

| Rule                | Detail                                                        |
| ------------------- | ------------------------------------------------------------- |
| Response time       | First review within **24 hours** on working days              |
| PR size             | Keep **< ~400 changed lines**; split otherwise                |
| Approval            | Minimum **1 approving review** required to merge              |
| Merge strategy      | **Squash & merge** into `main`; delete the branch afterwards  |
| Who merges          | The **author** merges after approval (reviewer never pushes)  |

### How to give feedback (as reviewer)

- Comment on lines via GitHub's inline comments — be specific and kind.
- Prefix your comments so intent is clear:
  - `nit:` minor preference, author may ignore
  - `suggestion:` optional improvement
  - `blocking:` must be fixed before merge
- Ask questions instead of commanding ("Could we extract this into a service?").
- Approve only if you would stand behind this code in production.

### How to receive feedback (as author)

- Respond to every comment (even just 👍 / "done").
- Push fixes as new commits; do not force-push while a review is in progress.
- Re-request review after resolving all threads.

### Protecting `main`

GitHub repo settings (owner/admin):

- ✅ Require pull request before merging (1 approval)
- ✅ Require status checks: lint, build, tests
- ✅ Require linear history; block force pushes & deletions

---

## 7. Definition of Done

A task is done only when ALL of these are true:

1. Code on a correctly named branch with conventional commits.
2. `npm run lint` and `npm run build` pass for the touched app(s).
3. Tests written per Section 5 and passing in CI.
4. PR approved by the required number of reviewers.
5. Squash-merged into `main`, branch deleted, ticket closed.
