When working on infrastructure, deployment, or CI/CD:

- Do not hardcode secrets, URLs, or environment-specific values in code or config.
- Use environment variables for anything that varies between environments.
- Keep deployment pipelines reproducible and idempotent.
- Document infrastructure decisions and non-obvious configuration in docs/decision-log.md.
- Prefer the platform's managed services over self-managed alternatives when the project uses a platform.
