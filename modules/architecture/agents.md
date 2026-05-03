When making architectural decisions:

- Document significant decisions in docs/decision-log.md before implementing.
- Prefer composition over inheritance. Prefer small, focused modules over large ones.
- Define clear boundaries between system components. Make dependencies explicit.
- Evaluate reversibility: prefer easily reversible choices unless constraints force otherwise.
- For new patterns, find or create a reference implementation before scaling across the codebase.
- Consider the cost of the abstraction against the cost of duplication.
