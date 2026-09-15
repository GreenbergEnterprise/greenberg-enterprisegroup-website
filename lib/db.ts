import postgres from "postgres";

/**
 * Cached Postgres (Supabase) connection.
 *
 * The client is created once at module scope and reused across invocations of
 * a warm serverless function, so we don't open a fresh connection per request.
 * In development Next.js hot-reloads modules on every save, so the client is
 * stashed on a global to avoid leaking a new pool each reload.
 *
 * `DATABASE_URL` should be the Supabase connection-pooler string (Supavisor,
 * transaction mode — the ":6543" pooler host), which is what works from
 * Vercel's serverless functions.
 */

type Sql = ReturnType<typeof postgres>;

let sql: Sql | undefined;

declare global {
  // eslint-disable-next-line no-var
  var _sql: Sql | undefined;
}

function createClient(url: string): Sql {
  return postgres(url, {
    // Supabase's transaction pooler (Supavisor/PgBouncer) doesn't support
    // prepared statements; disabling them keeps queries working through it.
    prepare: false,
    // One connection per function instance — the pooler fans out server-side.
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: "require",
  });
}

/**
 * Returns the shared postgres client. Throws if `DATABASE_URL` is unset so the
 * contact/health routes can report a clear "not configured" error instead of
 * crashing — the pages themselves still render without a database.
 */
export function getSql(): Sql {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local (development) or your " +
        "hosting provider's environment variables (production)."
    );
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._sql) global._sql = createClient(url);
    return global._sql;
  }

  if (!sql) sql = createClient(url);
  return sql;
}
