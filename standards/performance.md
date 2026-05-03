When working on performance-sensitive code:

- Measure before optimizing. Use the project's existing profiling and monitoring tools.
- Identify the bottleneck before changing code. Do not optimize speculatively.
- Consider caching only when a measured bottleneck justifies it. Document cache invalidation.
- Prefer efficient data structures and algorithms for hot paths. Prefer clarity for cold paths.
- Watch for N+1 queries in data fetching.
