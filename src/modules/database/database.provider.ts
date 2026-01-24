import { Provider } from '@nestjs/common';
import Database, { DatabaseConfig } from '@crane-technologies/database';
import { queries } from './queries';

const config: DatabaseConfig = {
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
  max: 10,
  logLevel: 2,
};

export const DatabaseProvider: Provider = {
  provide: 'DATABASE_CONNECTION',
  useValue: Database.getInstance(config, queries),
};
