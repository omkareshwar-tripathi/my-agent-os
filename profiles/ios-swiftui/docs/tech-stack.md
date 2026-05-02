# Tech Stack

Use this profile for iOS apps built with SwiftUI.

| Layer | Recommended Default | Why |
|---|---|---|
| Language | Swift 6+ | Strict concurrency, typed throws, modern language features |
| UI | SwiftUI | Declarative, Apple-native UI model |
| State | Observation (`@Observable`) where available | Property-level tracking and simpler view model state |
| Navigation | `NavigationStack` and typed routes | Modern SwiftUI navigation with explicit state |
| Persistence | Project-specific: Core Data, SQLite, files, CloudKit, or server API | Choose based on sync, migration, and sharing requirements |
| Device APIs | Apple-native frameworks first | Smaller dependency surface and better platform behavior |
| Testing | Swift Testing for unit tests, XCTest for UI tests when needed | Modern Swift tests plus mature UI tooling |

## Dependency Policy

Prefer Apple frameworks. Add third-party packages only when they remove real complexity or provide a proven domain engine the project should not hand-roll.

Every dependency must be recorded in `docs/dependencies.md` with the reason it exists.
