import pg from 'pg';
import { environment } from './environment.js';

const { Pool } = pg;

export const pool = new Pool({
  host: environment.database.host,
  port: environment.database.port,
  user: environment.database.user,
  password: environment.database.password,
  database: environment.database.database,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export async function initializeDatabase() {
  try {
    const client = await pool.connect();
    console.log('✓ Connected to PostgreSQL');
    client.release();
  } catch (error) {
    console.error('✗ Failed to connect to database:', error);
    throw error;
  }
}

export async function closeDatabase() {
  await pool.end();
  console.log('✓ Database connection closed');
}
