# Architecture Decisions

This iOS profile starts from a feature-based SwiftUI architecture with clear `App/`, `Core/`, and `Features/` boundaries.

## Default Boundaries

```text
View -> ViewModel -> Repository -> Service or Persistence
```

- `View` renders state and forwards user actions.
- `ViewModel` owns screen state and coordinates work.
- `Repository` provides a stable data contract to features.
- `Service` wraps external systems or platform APIs.
- `Core` contains shared primitives; `Features` contains product behavior.

## Decision Log

Use this format:

```markdown
## YYYY-MM-DD - Decision title

Decision: What rule or architecture was chosen.

Reason: Why this option fits the project.

Consequences: What future agents must preserve or verify.
```
