---
name: sleek-design-mobile-apps
description: Use when the user wants to design a mobile app, create screens, build UI, or interact with their Sleek projects. Covers high-level requests ("design an app that does X") and specific ones ("list my projects", "create a new project", "screenshot that screen").
compatibility: Requires SLEEK_API_KEY environment variable. Network access limited to https://sleek.design only.
metadata:
  requires-env: SLEEK_API_KEY
  allowed-hosts: https://sleek.design
---

[![Design mobile apps in minutes](https://raw.githubusercontent.com/sleekdotdesign/agent-skills/main/assets/hero.png)](https://sleek.design)

## Overview
[sleek.design](https://sleek.design) is an AI-powered mobile app design tool. You interact with it via a REST API at `/api/v1/*` to create projects, describe what you want built in plain language, and get back rendered screens. All communication is standard HTTP with bearer token auth.

**Base URL**: `https://sleek.design`
**Auth**: `Authorization: Bearer $SLEEK_API_KEY` on every `/api/v1/*` request
**Content-Type**: `application/json` (requests and responses)

---

## Prerequisites: API Key
Create API keys at **https://sleek.design/dashboard/api-keys**. The full key value is shown only once at creation — store it in the `SLEEK_API_KEY` environment variable.

**Required plan**: Pro or higher (API access is gated)

| Scope             | What it unlocks              |
| ----------------- | ---------------------------- |
| `projects:read`   | List / get projects          |
| `projects:write`  | Create / delete projects     |
| `components:read` | List components in a project |
| `chats:read`      | Get chat run status          |
| `chats:write`     | Send chat messages           |
| `screenshots`     | Render component screenshots |

---

## Quick Reference — All Endpoints
| Method   | Path                                    | Scope             | Description       |
| -------- | --------------------------------------- | ----------------- | ----------------- |
| `GET`    | `/api/v1/projects`                      | `projects:read`   | List projects     |
| `POST`   | `/api/v1/projects`                      | `projects:write`  | Create project    |
| `GET`    | `/api/v1/projects/:id`                  | `projects:read`   | Get project       |
| `DELETE` | `/api/v1/projects/:id`                  | `projects:write`  | Delete project    |
| `GET`    | `/api/v1/projects/:id/components`       | `components:read` | List components   |
| `POST`   | `/api/v1/projects/:id/chat/messages`    | `chats:write`     | Send chat message |
| `GET`    | `/api/v1/projects/:id/chat/runs/:runId` | `chats:read`      | Poll run status   |
| `POST`   | `/api/v1/screenshots`                   | `screenshots`     | Render screenshot |

---

## Prompting Sleek
Sleek has its own AI that plans screen content, visual style, and layout. Pass the user's request to Sleek as-is — don't add details the user didn't ask for. Sleek produces richer designs when given room to plan.

### Workflow
1. **Create a project** with `POST /api/v1/projects`
2. **Send a chat message** with `POST /api/v1/projects/:id/chat/messages`
3. **Poll for completion** with `GET /api/v1/projects/:id/chat/runs/:runId`
4. **Take screenshots** with `POST /api/v1/screenshots` — always show results to user

### Native frameworks (React Native, SwiftUI, etc.)
Use both the HTML code and the screenshots together:
- **HTML code** is the implementation reference — it contains the exact structure, layout, styling, colors, spacing, content, image URLs, and icon names.
- **Screenshots** are the visual target — use them to verify your implementation matches the intended look.

#### Icons
Sleek uses [Iconify](https://iconify.design) icons in the format `prefix:name` (e.g., `solar:heart-bold`, `material-symbols:search-rounded`). **Use the exact icons from the HTML code** — do not substitute with a different icon set.

#### Fonts
The HTML includes Google Fonts via `<link>` tags. Use the same fonts and weights when implementing in a native framework.

#### Navigation
Update the project's navigation styling and structure to match the designs — don't just implement the screen content while leaving the default navigation untouched.
