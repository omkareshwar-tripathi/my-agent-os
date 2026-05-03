When working with Supabase:

- Use Row Level Security (RLS) policies for all tables that store user data. Never bypass RLS in client code.
- Use the Supabase client library, not raw HTTP requests.
- Define database schema changes as SQL migrations, not through the dashboard.
- Use Supabase Auth for authentication. Do not build custom auth on top of Supabase.
- Handle realtime subscriptions with proper cleanup on unmount.
- Use the Supabase CLI for local development and migration management.
