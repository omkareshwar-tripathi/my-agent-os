# Project Setup Guide

Step-by-step instructions for setting up a new project with skills, standards, and templates from this repo.

## 1. Create project structure

```bash
mkdir -p docs skills/methods skills/tools .claude
```

## 2. Copy doc templates

Copy the templates you need from this repo:

```bash
cp ~/my-agent-os/templates/agent-workflow.md docs/
cp ~/my-agent-os/templates/decision-log.md docs/
cp ~/my-agent-os/templates/changelog.md docs/
cp ~/my-agent-os/templates/docs-index.md docs/INDEX.md
```

## 3. Install skills

Copy skills from their **original source** (see [skills/README.md](../skills/README.md) for links). For local skills, copy from this repo:

```bash
# Example: install TDD skill from this repo (local)
cp -r ~/my-agent-os/skills/methods/test-driven-development skills/methods/

# Example: install GitNexus from source
git clone https://github.com/nicepkg/gitnexus-claude-plugin /tmp/gitnexus
cp -r /tmp/gitnexus/skills/* skills/tools/
rm -rf /tmp/gitnexus
```

Pick the skills relevant to your project. You don't need all of them.

## 4. Set up CLAUDE.md

Create a `CLAUDE.md` in your project root:

```markdown
# Project Instructions

Read `standards/` files relevant to this project's stack before making changes.

## Stack
- [List your tech stack here]

## Project-specific rules
- [Add any project-specific instructions here]
```

## 5. Copy relevant standards

Copy only the standards that match your project's stack:

```bash
mkdir -p standards

# Always copy universal
cp ~/my-agent-os/standards/universal.md standards/
cp ~/my-agent-os/standards/coding-standards.md standards/

# Copy stack-specific (example: Next.js + React project)
cp ~/my-agent-os/standards/frontend.md standards/
cp ~/my-agent-os/standards/nextjs.md standards/
cp ~/my-agent-os/standards/react.md standards/
cp ~/my-agent-os/standards/testing.md standards/
```

## 6. Configure Claude Code permissions (optional)

Merge stack-specific permissions into `.claude/settings.json`:

```bash
# Check what permissions are available
ls ~/my-agent-os/permissions/

# Copy and adapt for your project
cat ~/my-agent-os/permissions/nextjs.json
# Then add those entries to your .claude/settings.json permissions.allow array
```

## 7. Set up MCPs (optional)

See individual guides in this directory for MCP setup instructions as you add them.
