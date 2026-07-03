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

## User skills library (`~/.claude/skills/`) — the global standard

**The rule for this scope: only skills needed in EVERY project live here.**
Anything stack-specific — even a stack several repos share — belongs in each
repo's `.claude/skills/` instead. The skill-reminder hook injects every user
skill into every prompt, so each global skill is a recurring context tax paid
by all sessions everywhere.

The global standard is six skills:

| Skill | Why it's global |
|---|---|
| **atlas** | The agent-OS control (overview, dashboard, adopt, jot). |
| **graphify** | Any-folder → knowledge graph; wired to `/graphify` in global CLAUDE.md. |
| **find-skills** | Discover/install skills on demand — the escape hatch that lets everything else stay lean. |
| **grill-me** | Stress-test any plan or design. |
| **teach** | Learn a concept inside the workspace. |
| **build-in-public** | Draft X/LinkedIn posts from any coding session. |

Stack skills (web: frontend-design, react-dev, nextjs-*, ui-design-system,
vercel-react-best-practices, deploy-to-vercel, playwright-e2e-testing,
user-acceptance; iOS: the swift/cloudkit set) are installed per-repo where that
stack lives. Retired skills sit in `~/.claude/skills-archive/` — restore with a
`mv` or reinstall from source via find-skills.

> Skills are installed from their **original source repos**. The convention:
> prefer installing from source; keep the local copy as a backup if a source
> goes offline.

## Project skills (`<repo>/.claude/skills/`) — iOS/Swift focused

Nine skills scoped to the iOS project, used during brick work:

| Skill | Use for |
|---|---|
| **swiftui-pro** | SwiftUI best practices, modern APIs, performance review. |
| **swift-testing-pro** | Writing/reviewing Swift Testing (`@Test`) code. |
| **swift-concurrency-pro** | async/await correctness, actor isolation, concurrency pitfalls. |
| **core-data-expert** | Core Data stack, fetches, saving/merge, migrations, CloudKit sync. |
| **cloudkit** | CloudKit/iCloud sync (CKContainer, CKRecord, conflict handling). |
| **ios-accessibility** | VoiceOver, Dynamic Type, focus, a11y testing. |
| **ios-glass-ui-designer** | iOS-native glass-material UI (translucency, blur, depth). |
| **grill-me** | Interrogate a plan/design until shared understanding. |
| **gitnexus/** (7 sub-skills) | exploring, impact-analysis, debugging, refactoring, pr-review, cli, guide. |

## How a skill gets used in practice

The global engineering discipline (`~/.claude/CLAUDE.md` §4) requires every plan step to name
the skill(s) it relies on with a `Skill:` line — e.g.
`Skill: core-data-expert/references/saving.md` or `Skill: none` when none applies.
This makes skill use deliberate rather than incidental.
