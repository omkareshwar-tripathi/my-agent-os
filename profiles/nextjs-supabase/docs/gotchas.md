# Next.js Supabase Gotchas

Use this file for project-specific web app traps.

## Next.js Version Drift

Symptom: An API or convention appears different from what the agent expects.

Cause: New Next.js major versions can change APIs, docs paths, and file conventions.

Resolution: Read local package version and local docs before editing version-sensitive code.

## Client Component Creep

Symptom: Bundle size grows and server-only code starts leaking into browser paths.

Cause: Adding `'use client'` too high in the tree.

Resolution: Keep Server Components as default and isolate interactivity in leaf components.

## Supabase Secret Leakage

Symptom: Service role or privileged client appears in client code.

Cause: Supabase helpers are not separated by server/client boundary.

Resolution: Keep service-role access in server-only modules and verify imports do not cross into Client Components.

## RLS Policy Drift

Symptom: Queries work with admin credentials but fail for real users.

Cause: Migrations changed schema without matching RLS policy updates.

Resolution: Treat schema, indexes, and RLS policies as one migration unit and test as an authenticated user.
