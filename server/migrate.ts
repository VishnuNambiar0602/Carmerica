import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrate() {
  const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

  if (!databaseUrl) {
    console.log('[Migrate] No DATABASE_URL found — skipping migration (using in-memory mode)');
    process.exit(0);
  }

  let client: pg.Client | null = null;

  try {
    client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
    await client.connect();
    console.log('[Migrate] Connected to database');

    const schemaPath = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      console.error('[Migrate] schema.sql not found at', schemaPath);
      process.exit(1);
    }

    const schema = fs.readFileSync(schemaPath, 'utf-8');
    console.log('[Migrate] Running schema migration...');

    await client.query(schema);
    console.log('[Migrate] Schema migration completed successfully');

    const { rows } = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log('[Migrate] Tables created/verified:', rows.map((r: any) => r.table_name).join(', '));

    // Verify indexes exist
    const { rows: indexes } = await client.query(`
      SELECT indexname, tablename FROM pg_indexes 
      WHERE schemaname = 'public' 
      ORDER BY tablename, indexname
    `);
    console.log(`[Migrate] ${indexes.length} indexes verified`);

    await client.end();
    console.log('[Migrate] Migration complete');
    process.exit(0);
  } catch (error) {
    console.error('[Migrate] Migration failed:', error);
    if (client) {
      try { await client.end(); } catch { /* ignore */ }
    }
    process.exit(1);
  }
}

migrate();
