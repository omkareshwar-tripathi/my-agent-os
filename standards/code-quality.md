When writing or reviewing code quality:

- Follow the project's linter and formatter rules. Do not override them without a decision record.
- Remove dead code you introduced. Flag pre-existing dead code without removing it.
- Keep functions short enough to understand at a glance. Extract when a function does more than one thing.
- Name things for what they represent, not how they work internally.
- Prefer explicit dependencies over implicit global state.
