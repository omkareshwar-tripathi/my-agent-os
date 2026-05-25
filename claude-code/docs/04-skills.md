# 04 — Skills

Skills are focused capability packs Claude invokes on demand (via the `Skill` tool
or a `/slash` command). They come from three places in this setup: the **superpowers**
plugin, the **user** skills directory (`~/.claude/skills/`), and the **project**
skills directory (`<repo>/.claude/skills/`). A `UserPromptSubmit` hook lists the
project + user skills on every prompt so Claude always knows what's available (see
[`05-hooks.md`](05-hooks.md)).

## Superpowers skills (process discipline — user scope)

The superpowers plugin (v5.1.0) provides the "how to work" skills. These are
**rigid** — meant to be followed exactly, not adapted away:

| Skill | When it fires |
|---|---|
| **using-superpowers** | Start of any conversation — establishes how to find/use skills. |
| **brainstorming** | Before any creative work — explore intent & design before code. Hard gate. |
| **writing-plans** | Turn a spec into a written multi-step plan before touching code. |
| **executing-plans** | Execute a written plan with review checkpoints. |
| **subagent-driven-development** | Execute plan tasks via fresh subagents with two-stage review. |
| **dispatching-parallel-agents** | 2+ independent tasks with no shared state → run in parallel. |
| **test-driven-development** | Write the failing test first, then minimal code to pass. |
| **systematic-debugging** | Any bug/failure — find root cause before proposing a fix. |
| **verification-before-completion** | Before claiming "done" — run the checks, show evidence. |
| **requesting-code-review** / **receiving-code-review** | Ask for review; respond to feedback with rigor, not blind agreement. |
| **using-git-worktrees** | Isolate feature work in a worktree before executing a plan. |
| **finishing-a-development-branch** | Decide how to integrate finished work (merge/PR/cleanup). |
| **writing-skills** | Create/edit skills (TDD applied to documentation). |

## graphify (user scope, with global trigger)

`graphify` (`~/.claude/skills/graphify/`) turns any folder — code, docs, papers,
images, video — into a navigable **knowledge graph** with community detection and an
honest audit trail (edges tagged EXTRACTED / INFERRED / AMBIGUOUS). Outputs an
interactive HTML view, GraphRAG-ready JSON, and a plain-language report. The global
`~/.claude/CLAUDE.md` ([artifact](../artifacts/global/CLAUDE.md)) wires `/graphify`
to invoke it immediately.

## User skills library (`~/.claude/skills/`)

~30 skills installed from the open ecosystem (each tracked with its source repo).
Grouped by theme:

- **Design / UI-UX:** app-ui-design, mobile-app-ui-design, mobile-app-design-mastery,
  ios-glass-ui-designer, ui-design-system, ui-ux-designer, ui-ux-pro-max,
  extract-design-system, emil-design-eng, frontend-design.
- **Frontend / web:** react-dev, nextjs-app-router-patterns, nextjs-supabase-auth,
  vercel-react-best-practices, tailwind-design-system, framer-motion-animator,
  clone-website, meta-tags-optimizer, deploy-to-vercel, render-deploy.
- **Mobile:** mobile-app, flutter-design, flutter-frontend-design.
- **Testing / quality:** playwright-e2e-testing, user-acceptance.
- **Backend / infra:** bullmq-specialist.
- **Meta:** find-skills (discover/install more), grill-me (stress-test a plan).

> These are installed from their **original source repos** and tracked in a skill
> lock file. The convention: prefer installing from source; keep the local copy as a
> backup if a source goes offline.

## Project skills (`<repo>/.claude/skills/`) — iOS/Swift focused

Eight skills scoped to the iOS project, used during brick work:

| Skill | Use for |
|---|---|
| **swiftui-pro** | SwiftUI best practices, modern APIs, performance review. |
| **swift-testing-pro** | Writing/reviewing Swift Testing (`@Test`) code. |
| **swift-concurrency-pro** | async/await correctness, actor isolation, concurrency pitfalls. |
| **core-data-expert** | Core Data stack, fetches, saving/merge, migrations, CloudKit sync. |
| **cloudkit** | CloudKit/iCloud sync (CKContainer, CKRecord, conflict handling). |
| **ios-accessibility** | VoiceOver, Dynamic Type, focus, a11y testing. |
| **grill-me** | Interrogate a plan/design until shared understanding. |
| **gitnexus/** (7 sub-skills) | exploring, impact-analysis, debugging, refactoring, pr-review, cli, guide. |

## How a skill gets used in practice

The project's planning discipline (`CLAUDE.md` §5) requires every plan step to name
the skill(s) it relies on with a `Skill:` line — e.g.
`Skill: core-data-expert/references/saving.md` or `Skill: none` when none applies.
This makes skill use deliberate rather than incidental.
