When working in a React project:

- Use functional components with hooks. Do not introduce class components.
- Keep state as close to where it is used as possible. Lift state only when siblings need it.
- Use the project's existing patterns for side effects, data fetching, and global state.
- Prefer controlled components for forms. Match the project's existing form patterns.
- Memoize expensive computations only when measured to matter.
- Use TypeScript for type safety when the project uses it.
