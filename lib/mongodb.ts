import { MongoClient, type Db } from "mongodb";

/**
 * Cached MongoDB connection.
 *
 * In development, Next.js hot-reloads modules on every save, which would
 * open a new MongoClient (and a new connection pool) each time without
 * caching. In production/serverless, the same module can be reused across
 * invocations of a warm function, so caching avoids reconnecting per request.
 */

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

let client: MongoClient | undefined;
let clientPromise: Promise<MongoClient> | undefined;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClientPromise(): Promise<MongoClient> {
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Add it to .env.local (development) or your " +
        "hosting provider's environment variables (production)."
    );
  }

  if (process.env.NODE_ENV === "development") {
    // Reuse the connection across hot-reloads via a global variable.
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  }

  if (!clientPromise) {
    client = new MongoClient(uri);
    clientPromise = client.connect();
  }
  return clientPromise;
}

/** Resolves to a connected MongoClient, reusing the pooled connection. */
export function getMongoClient(): Promise<MongoClient> {
  return getClientPromise();
}

/**
 * Resolves to the application database.
 * Uses MONGODB_DB if set, otherwise the database named in the connection string.
 */
export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(dbName);
}
