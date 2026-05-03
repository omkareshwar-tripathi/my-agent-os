When working in a Node.js project:

- Use the project's module system (ESM or CommonJS) consistently.
- Handle async operations with async/await. Avoid callback-style code in new code.
- Use the project's existing dependency management tool (npm, yarn, pnpm).
- Validate environment variables at startup, not at first use.
- Handle process signals and graceful shutdown for long-running services.
- Use TypeScript when the project uses it.
