import { Pool, QueryResult } from 'pg';

// Create a single pool instance to be reused across the application
let pool: Pool | null = null;

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

function isLocalConnection(connectionString: string): boolean {
  try {
    return LOCAL_HOSTS.has(new URL(connectionString).hostname);
  } catch {
    return false;
  }
}

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
      // Verify the server certificate. Disabling this (the previous default)
      // leaves the connection open to man-in-the-middle interception. Managed
      // providers such as Neon present certificates from a public CA, so
      // verification works out of the box. Local development databases
      // generally speak plaintext, so TLS is skipped only for loopback hosts.
      ssl: isLocalConnection(url) ? false : { rejectUnauthorized: true },
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

// Schema setup runs once per server instance rather than on every request.
let initialized: Promise<void> | null = null;

export function initializeDatabase(): Promise<void> {
  if (!initialized) {
    initialized = createSchema().catch((error) => {
      initialized = null; // retry on the next request
      throw error;
    });
  }
  return initialized;
}

async function createSchema(): Promise<void> {
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

    // Client portal: one-time login codes (stored as HMACs) and change requests.
    await query(`
      CREATE TABLE IF NOT EXISTS client_login_codes (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        client_id VARCHAR(100) NOT NULL,
        code_hash CHAR(64) NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        used_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_client_login_codes_email
      ON client_login_codes(email, created_at DESC);
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS client_change_requests (
        id SERIAL PRIMARY KEY,
        client_id VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        requested_plan JSONB NOT NULL,
        notes TEXT,
        new_email VARCHAR(255),
        emailed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    // Only log safe error message, not the full error object which may contain connection strings
    const safeError = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error initializing database:', safeError);
    throw error;
  }
}
