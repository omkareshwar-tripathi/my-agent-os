When working on code that handles authentication, authorization, or sensitive data:

- Validate and sanitize all external inputs. Never trust client data.
- Use parameterized queries for all database operations. Never construct SQL from user input.
- Never log, commit, or expose secrets, tokens, passwords, or PII.
- Follow the principle of least privilege for service accounts and API keys.
- Use the project's established auth patterns. Do not invent custom auth schemes.
- Consider rate limiting for public-facing endpoints.
