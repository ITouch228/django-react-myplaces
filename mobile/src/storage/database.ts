import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { initialSchema } from './schema';

let connection: Promise<SQLiteDatabase> | undefined;
let pendingOperation: Promise<unknown> = Promise.resolve();

// All queries share one connection. Keep unrelated queries outside an active transaction.
export function withDatabase<T>(operation: (database: SQLiteDatabase) => Promise<T>): Promise<T> {
  const result = pendingOperation.then(async () => operation(await getDatabase()));
  pendingOperation = result.catch(() => undefined);
  return result;
}

function getDatabase(): Promise<SQLiteDatabase> {
  connection ??= openAndMigrate().catch((error: unknown) => {
    connection = undefined;
    throw error;
  });
  return connection;
}

async function openAndMigrate(): Promise<SQLiteDatabase> {
  const database = await openDatabaseAsync('myplaces.db');
  try {
    await database.execAsync('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');
    const version = await database.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    if (version?.user_version === 0) {
      await database.withTransactionAsync(async () => {
        await database.execAsync(initialSchema);
        await database.execAsync('PRAGMA user_version = 1;');
      });
    } else if (version?.user_version !== 1) {
      throw new Error('Версия базы данных не поддерживается.');
    }
    return database;
  } catch (error) {
    await database.closeAsync();
    throw error;
  }
}
