When working on backend code:

- Validate inputs at API boundaries. Trust nothing from the client.
- Use the project's existing error handling patterns before introducing new ones.
- Keep business logic out of route handlers and controllers.
- Handle database operations through the project's established data access patterns.
- Log meaningful events at appropriate levels. Do not log sensitive data.
- Consider idempotency for operations that may be retried.
