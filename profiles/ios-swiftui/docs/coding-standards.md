# iOS SwiftUI Coding Standards

Read only the sections that match the task.

| If the task involves... | Read section |
|---|---|
| Any Swift code | 1. Swift language defaults, 8. Naming |
| Async, networking, device APIs, shared state | 2. Concurrency |
| New feature, screen, service, or ViewModel | 3. Architecture |
| SwiftUI UI | 4. SwiftUI, 5. State, 9. Accessibility |
| Navigation | 6. Navigation |
| Persistence or sync | 7. Persistence |
| Tests | 10. Testing |

## 1. Swift Language Defaults

- Prefer `let` unless mutation is required.
- Prefer `struct` and value semantics.
- Use `final class` when a class is required.
- Keep one primary type per file unless the local project already uses a different pattern.
- Avoid speculative abstractions and generic wrappers for single-use code.

## 2. Concurrency

- Put UI-affecting view models on `@MainActor`.
- Use structured concurrency (`async`/`await`, task groups) instead of raw queue juggling.
- Protect shared mutable state with actors or clear ownership.
- Do not use `@unchecked Sendable` to silence warnings without a written reason.

## 3. Architecture

Default layout:

```text
App/
Core/
  DesignSystem/
  Error/
  Navigation/
  Persistence/
  Repositories/
  Services/
Features/
  FeatureName/
    Views/
    ViewModels/
```

Rules:

- Views declare UI from state.
- ViewModels own screen state and user actions.
- Repositories abstract data sources.
- Services wrap system APIs, network APIs, camera, notifications, or storage engines.
- Inject dependencies through initializers when practical.
- Do not import SwiftUI in ViewModels unless the project has an explicit exception.

## 4. SwiftUI

- Every new view should have a preview unless impossible in the project setup.
- Keep `body` lightweight. Do not create formatters, parse data, or filter large collections inside `body`.
- Extract subviews when a view body becomes hard to scan.
- Prefer native controls and platform navigation patterns.
- Use design-system tokens when available.

## 5. State

- Use `@State` for view-local state.
- Use `@Binding` for parent-owned state passed down.
- Use `@Observable` / `@State` for view models when the deployment target supports Observation.
- Keep long-lived app state in explicit stores or coordinators documented in `docs/architecture-decisions.md`.

## 6. Navigation

- Prefer `NavigationStack`.
- Keep one clear navigation owner per flow or tab.
- Preserve back behavior and deep-link behavior when editing route code.
- Avoid nested navigation stacks unless the product requires independent navigation state.

## 7. Persistence

- Choose persistence based on requirements, not habit.
- If CloudKit sharing is required, verify the chosen framework supports shared databases before implementing.
- Document model invariants, migrations, sync limitations, and delete behavior in `docs/data-models.md`.

## 8. Naming

- Types: PascalCase.
- Functions and properties: camelCase.
- Booleans should read as assertions: `isLoading`, `hasAccess`, `canDelete`, `shouldShow`.
- File names should match the main type or feature.

## 9. Accessibility

- Give icon-only buttons meaningful labels.
- Maintain 44pt minimum touch targets.
- Support Dynamic Type.
- Do not use color as the only state indicator.
- Respect safe areas and reduced motion.

## 10. Testing

- Add tests for new behavior and bug fixes.
- Prefer Swift Testing for unit tests.
- Use XCTest UI tests only for flows that need full app interaction.
- For bugs, write a regression test that fails before the fix when feasible.
