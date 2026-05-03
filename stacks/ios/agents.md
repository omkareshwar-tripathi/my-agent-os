When working on iOS code:

- Use SwiftUI for new views unless the project explicitly uses UIKit.
- Follow Apple's Human Interface Guidelines for layout, navigation, and interaction patterns.
- Use the project's existing architecture pattern (MVVM, TCA, etc.) consistently.
- Handle errors at the appropriate boundary. Use Swift's Result or async/throws patterns.
- Manage memory carefully: avoid retain cycles in closures with [weak self] where needed.
- Use @MainActor for all ViewModel classes. Prefer Strict Concurrency.
- Every View must have a #Preview block.
