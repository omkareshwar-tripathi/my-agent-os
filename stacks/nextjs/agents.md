When working in a Next.js project:

- Use the App Router unless the project explicitly uses Pages Router.
- Prefer Server Components. Use 'use client' only when the component needs browser APIs, event handlers, or state.
- Place API logic in Route Handlers (app/api/). Do not use API routes for same-origin data that Server Components can fetch directly.
- Use Next.js built-in data fetching patterns. Avoid client-side fetching for data available at build or request time.
- Follow the project's existing file-based routing structure.
- Use next/image for images, next/link for navigation, next/font for fonts.
