# Architecture Decisions

This profile starts from a Next.js App Router architecture with server-first data flow and explicit Supabase boundaries.

## Default Boundaries

```text
Route/Page -> Server Component or Client Component -> Server Action/Route Handler -> Supabase/Postgres
```

- `src/app/` owns routes, layouts, and server route handlers.
- `src/components/ui/` owns reusable primitives.
- `src/components/<feature>/` owns feature UI.
- `src/lib/` owns server utilities, clients, validation, and shared domain helpers.
- `src/lib/supabase/` owns Supabase client creation and auth helpers.
- `supabase/migrations/` owns database evolution.

## Decisions To Record

- Runtime and hosting assumptions.
- Authentication and session model.
- Server action vs route handler boundaries.
- Database schema, RLS, indexing, and migration decisions.
- Caching and revalidation strategy.

Use this format:

```markdown
## YYYY-MM-DD - Decision title

Decision: What rule or architecture was chosen.

Reason: Why this option fits the project.

Consequences: What future agents must preserve or verify.
```
