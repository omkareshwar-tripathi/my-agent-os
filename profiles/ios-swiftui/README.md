# iOS SwiftUI Profile

This profile generalizes a practical iOS app setup for new SwiftUI projects.

It assumes:

- Swift 6 or newer.
- SwiftUI for UI.
- `@Observable` view models when the deployment target supports it.
- Feature-based folders using an `App/`, `Core/`, and `Features/` layout.
- Native Apple frameworks before third-party dependencies.

It does not assume product-specific requirements, family sharing, health tracking, or CloudKit unless your generated project docs say so.

## Recommended Structure

```text
App/                         App entry, environment wiring, app delegates
Core/DesignSystem/           Tokens, reusable UI components, modifiers
Core/Error/                  Shared app error types
Core/Navigation/             Routes, navigation state, tab coordination
Core/Persistence/            Storage stack and model definitions
Core/Repositories/           Data-source abstractions
Core/Services/               External APIs, device APIs, system integrations
Features/<Feature>/Views/    SwiftUI screens and subviews
Features/<Feature>/ViewModels/ View state and user actions
```

## Agent Rules Added By This Profile

- Keep SwiftUI views declarative and lightweight.
- Use feature-scoped folders for new screens.
- Put shared primitives in `Core/`, not in feature folders.
- Prefer `struct` and value semantics. Use `final class` only when identity or reference semantics are required.
- Keep ViewModels UI-independent except for `@MainActor`; avoid importing SwiftUI into ViewModels.
- Add previews for SwiftUI views.
- Preserve accessibility labels, Dynamic Type, safe areas, and 44pt touch targets.
