# Next.js Supabase Profile

This profile generalizes a practical web app setup for projects built with Next.js App Router, React, TypeScript, Tailwind CSS, and Supabase/Postgres.

It assumes:

- Next.js App Router.
- React functional components with TypeScript.
- Tailwind CSS utilities for styling.
- Supabase Auth, SSR helpers, and Postgres when backend persistence is needed.
- npm as the default package manager unless the target project says otherwise.

It does not assume a specific product, database schema, hosting platform, or deployment target.

## Recommended Structure

```text
src/app/                    App Router pages, layouts, route groups, route handlers
src/app/api/                Route handlers for server-only API boundaries
src/components/ui/          Shared primitives
src/components/layout/      Shells, nav, sidebars, headers
src/components/<feature>/   Feature-specific UI
src/hooks/                  Client hooks
src/lib/                    Server utilities, clients, actions, validation
src/lib/actions/            Server actions
src/lib/supabase/           Supabase clients and auth helpers
supabase/migrations/        Versioned SQL migrations
```

## Agent Rules Added By This Profile

- Read local Next.js docs or version notes before assuming APIs, especially on new major versions.
- Prefer Server Components by default. Use Client Components only for interactivity, browser APIs, or client state.
- Keep database changes in migrations. Do not describe manual production SQL as the deployment path.
- Validate route handler and server action inputs.
- Keep Supabase service-role credentials server-only.
- Use Tailwind utilities and project tokens; avoid introducing CSS modules or styled-components unless the project already uses them.
- Use Framer Motion for meaningful motion, not decorative churn.
