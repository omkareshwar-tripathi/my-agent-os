# Coding Standards

Project-specific standards go here. Keep sections focused so agents can read only what applies.

## 1. Language And Style

Match the existing style, formatter, naming conventions, and project architecture.

## 2. Architecture

Prefer small units with explicit dependencies. Avoid speculative abstractions and broad refactors.

## 3. State And Data Flow

Keep state ownership clear. Document cross-module state and persistence rules in `docs/architecture-decisions.md` or `docs/data-models.md`.

## 4. UI And Accessibility

Use the local design system. Preserve accessible names, keyboard or touch behavior, contrast, reduced-motion behavior, and responsive layout.

## 5. Error Handling

Handle errors at boundaries where the user, caller, or log can act on them. Do not hide failures with empty catches or broad fallbacks.

## 6. Testing

Add or update tests for behavior changes and bug fixes. Prefer the project's existing test framework.

## 7. Security

Do not commit secrets. Validate untrusted input. Avoid logging credentials, tokens, personal data, or sensitive payloads.

## 8. Performance

Avoid avoidable work in hot paths. Preserve lazy loading, caching, pagination, and rendering constraints documented by the project.
