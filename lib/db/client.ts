import "server-only";
import { Pool, type QueryResultRow } from "pg";

export class DatabaseUnavailableError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "DatabaseUnavailableError";
  }
}

declare global {
  // eslint-disable-next-line no-var
  var indusScriptDatabasePool: Pool | undefined;
}

function getPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new DatabaseUnavailableError("DATABASE_URL is not configured on the server.");
  }

  if (!global.indusScriptDatabasePool) {
    global.indusScriptDatabasePool = new Pool({
      connectionString,
      max: process.env.DB_POOL_MAX ? parseInt(process.env.DB_POOL_MAX, 10) : 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }

  return global.indusScriptDatabasePool;
}

export async function databaseQuery<T extends QueryResultRow>(text: string, values: readonly unknown[] = []) {
  try {
    return await getPool().query<T>(text, values as unknown[]);
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) throw error;
    throw new DatabaseUnavailableError("The PostgreSQL database could not be reached.", { cause: error });
  }
}

export function isDatabaseUnavailable(error: unknown): error is DatabaseUnavailableError {
  return error instanceof DatabaseUnavailableError;
}
