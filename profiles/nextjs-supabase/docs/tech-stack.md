# Tech Stack

Use this profile for web apps built with Next.js App Router, React, TypeScript, Tailwind CSS, and Supabase.

| Layer | Recommended Default | Why |
|---|---|---|
| Framework | Next.js App Router | Server Components, routing, streaming, route handlers |
| Language | TypeScript | Safer contracts across components, server actions, and API boundaries |
| UI | React functional components | Standard Next.js application model |
| Styling | Tailwind CSS utilities | Fast composition with consistent design tokens |
| Motion | Framer Motion | Proven animation library for React interactions |
| Icons | lucide-react or project icon system | Consistent SVG icon family |
| Auth | Supabase Auth with SSR helpers | Handles session cookies across server and client boundaries |
| Database | Supabase Postgres | Managed Postgres with migrations, RLS, and SQL access |
| Validation | Zod or project-standard schema library | Runtime validation for forms, route handlers, and actions |

## Commands

Record exact project commands after install:

```bash
npm run dev
npm run build
npm run lint
npm test
```

If a command does not exist, update this file before asking an agent to rely on it.

## Dependency Policy

Prefer built-in Next.js and platform APIs before adding packages. Add dependencies only when they remove real complexity or provide a proven domain capability.

Every new dependency must be recorded in `docs/dependencies.md` with its purpose and owner files.
