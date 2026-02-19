import { Pool, QueryResult } from 'pg';

// Create a single pool instance to be reused across the application
let pool: Pool | null = null;

function getPool(): Pool {
  // Validate DATABASE_URL on first pool access (runtime, not build-time)
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL environment variable is not set. ' +
      'Please configure your database connection string in your environment variables. ' +
      'For Vercel: Add DATABASE_URL to Project Settings > Environment Variables'
    );
  }

  if (!pool) {
    pool = new Pool({
      connectionString: url,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    pool.on('error', (err) => {
      // Only log safe error message
      const safeError = err instanceof Error ? err.message : 'Unknown error';
      console.error('Unexpected error on idle client:', safeError);
    });
  }

  return pool;
}

export async function query(text: string, params?: unknown[]): Promise<QueryResult> {
  const client = await getPool().connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export async function initializeDatabase(): Promise<void> {
  try {
    // Create referrals table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS referrals (
        id SERIAL PRIMARY KEY,
        referrer_email VARCHAR(255),
        referred_email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'pending',
        email_sent_at TIMESTAMP,
        utm_source VARCHAR(255),
        notes TEXT
      );
    `);

    // Create index on referred_email for faster lookups
    await query(`
      CREATE INDEX IF NOT EXISTS idx_referrals_referred_email 
      ON referrals(referred_email);
    `);

    // Create index on referrer_email for tracking
    await query(`
      CREATE INDEX IF NOT EXISTS idx_referrals_referrer_email 
      ON referrals(referrer_email);
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    // Only log safe error message, not the full error object which may contain connection strings
    const safeError = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error initializing database:', safeError);
    throw error;
  }
}
