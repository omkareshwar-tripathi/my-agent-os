# iOS SwiftUI Gotchas

Use this file for project-specific platform traps.

## Common Starting Points

## SwiftUI Body Work

Symptom: Scrolling or typing feels janky.

Cause: Heavy computation, formatters, parsing, or filtering inside `body`.

Resolution: Move work to the ViewModel, a cached formatter, or precomputed model property.

## Navigation Ownership

Symptom: Back behavior breaks or tabs lose state.

Cause: Multiple nested owners are trying to control the same navigation flow.

Resolution: Keep one route owner per flow or tab and document it in `docs/architecture-decisions.md`.

## Cloud Sync Assumptions

Symptom: A persistence choice works locally but cannot support the requested sharing model.

Cause: The storage framework does not support the exact sync or sharing requirement.

Resolution: Verify private sync, shared sync, migration, and delete constraints before writing model code.
