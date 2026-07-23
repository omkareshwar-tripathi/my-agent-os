# my-agent-os

My personal operating system for Claude Code. Install it once and every coding
session on the machine starts with the same habits, in every project.

It is a Claude Code plugin with three small parts:

## The three hooks

Little scripts that run automatically at set moments in a session:

- **Session start** — shows the project's `STATUS.md` so the session begins oriented.
- **On each message** — reminds the assistant to consult the methodology skill and lists the skills available.
- **Session end** — nudges you to update `STATUS.md` if the project changed but the file's date is stale.

They stay quiet in any folder that isn't a tracked project.

## The one skill

`coding-agent-methodology` — the operating contract for how work gets done here:
think first, keep changes small and surgical, prove it works, don't surprise the
person or the repo. Once installed it is available as
`my-agent-os:coding-agent-methodology`.

## Install (two commands)

```sh
claude plugin marketplace add omkareshwar-tripathi/my-agent-os
claude plugin install my-agent-os@my-agent-os
```

That's it — the three hooks and the skill now apply in every project. Updates
pull in automatically on new commits; there is nothing to copy or re-run.

**One manual step:** the methodology skill tells the agent to consult the
Advisor tool at decision points, but installing this plugin does not enable
it — Advisor is a per-machine Claude Code setting. Turn it on yourself with
`/advisor <model>` in a session, `claude --advisor <model>` at launch, or the
`advisorModel` setting. Without it, the agent falls back to asking you.

## Join a repo to the system

Add a `STATUS.md` at the repo root:

```
# STATUS — <repo>                                   updated YYYY-MM-DD
## What this is
## Now
## Next
## Recently done
## How we work here
```

That's the whole opt-in. The hooks pick it up automatically.
