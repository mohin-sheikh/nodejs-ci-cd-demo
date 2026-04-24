import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity.';
import { config } from './validate';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  synchronize: false,
  logging: config.nodeEnv === 'development',
  entities: [User],
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
});
