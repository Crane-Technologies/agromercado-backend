import { Provider } from '@nestjs/common';
import Database, { DatabaseConfig } from '@crane-technologies/database';
import { queries } from './queries';

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('dotenv').config();
} catch {
  // dotfile loading is optional; env vars can come from process manager/runtime.
}

export const DATABASE = 'DATABASE';

let db: Database | null = null;

export const dbProvider: Provider = {
  provide: DATABASE,
  useFactory: () => {
    const connectionString = process.env.DB_CONNECTION ?? process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error(
        'Missing DB connection string. Set DB_CONNECTION (or DATABASE_URL).',
      );
    }

    const config: DatabaseConfig = {
      connectionString,
      max: Number(process.env.MAX_POOL_SIZE ?? 10),
      ssl: { rejectUnauthorized: false },
      logLevel: 2,
    };

    db = Database.getInstance(config, queries);

    if (db) {
      console.log('Database connection established');
    }

    return db;
  },
};
