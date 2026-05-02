# Next.js Supabase Coding Standards

Read only the sections that match the task.

| If the task involves... | Read section |
|---|---|
| Next.js routing, layouts, route handlers | 1. Next.js App Router |
| React components or state | 2. React and TypeScript |
| Styling or responsive layout | 3. Tailwind and UI |
| Auth, sessions, protected routes | 4. Supabase Auth |
| SQL, schema, migrations, RLS | 5. Supabase Postgres |
| Server actions or API routes | 6. Validation and errors |
| Tests or review | 7. Verification |

## 1. Next.js App Router

- Treat Server Components as the default.
- Use Client Components only for event handlers, browser APIs, local state, effects, or interactive libraries.
- Keep `page.tsx` route files focused; move reusable UI into components.
- Use route groups for organization without URL changes.
- Add `loading.tsx`, `error.tsx`, and `not-found.tsx` when user-facing flows need them.
- Read local Next.js docs or version-specific notes before changing APIs on new major versions.

## 2. React and TypeScript

- Use functional components.
- Keep props typed explicitly for exported components.
- Avoid `any` unless the boundary is truly unknown and documented.
- Keep effects rare and justified. Prefer server data fetching, derived state, or event handlers.
- Put shared utilities in `src/lib/`; keep feature-specific logic near the feature.

## 3. Tailwind and UI

- Use Tailwind utilities and existing design tokens.
- Do not add CSS modules, styled-components, or global CSS patterns unless the project already uses them.
- Build mobile-first layouts.
- Ensure focus states, keyboard navigation, semantic labels, and contrast.
- Use motion for state, hierarchy, and continuity rather than constant decoration.

## 4. Supabase Auth

- Keep service-role keys server-only.
- Use SSR-compatible Supabase clients for server routes and middleware.
- Protect routes at the server boundary when data is sensitive.
- Treat client checks as UX only, not security.
- Do not log tokens, cookies, or session payloads.

## 5. Supabase Postgres

- Put schema changes in `supabase/migrations/`.
- Use Row-Level Security for user-owned data.
- Add indexes for common filters, joins, and ordering paths.
- Keep policies simple and testable.
- Document schema decisions and invariants in `docs/data-models.md` and `docs/architecture-decisions.md`.

## 6. Validation and Errors

- Validate route handler and server action inputs at runtime.
- Return typed success and error shapes from server actions.
- Do not expose internal errors or database details to users.
- Use proper HTTP status codes in route handlers.

## 7. Verification

- Run `npm run lint` and `npm run build` when available before completion.
- Add unit or integration tests for behavior changes when the project has a test setup.
- For database changes, verify migrations apply cleanly in a disposable local or staging database when possible.
