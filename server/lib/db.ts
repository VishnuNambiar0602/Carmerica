import pg from 'pg';

const { Pool } = pg;

let pool: pg.Pool | null = null;

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured. PostgreSQL/Supabase persistence is required.');
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
      max: Number(process.env.DATABASE_POOL_SIZE || 10),
    });
  }

  return pool;
}

export async function query<T = any>(text: string, params: any[] = []) {
  return getPool().query<T>(text, params);
}

const camelPattern = /_([a-z])/g;
const snakePattern = /[A-Z]/g;

export function toCamel(value: string) {
  return value.replace(camelPattern, (_, letter: string) => letter.toUpperCase());
}

export function toSnake(value: string) {
  return value.replace(snakePattern, (letter) => `_${letter.toLowerCase()}`);
}

export function rowToApi(row: any) {
  if (!row) return null;
  const api: Record<string, any> = {};
  for (const [key, value] of Object.entries(row)) {
    if (key === 'metadata' && value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(api, value);
      continue;
    }
    api[toCamel(key)] = value;
  }
  return api;
}

export function rowsToApi(rows: any[]) {
  return rows.map(rowToApi);
}

export function splitAllowed(input: Record<string, any>, allowed: string[]) {
  const row: Record<string, any> = {};
  const metadata: Record<string, any> = {};
  const allowedSet = new Set(allowed);

  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    const snake = toSnake(key);
    if (allowedSet.has(snake)) {
      row[snake] = value;
    } else if (!['id', 'created_at', 'updated_at', 'createdAt', 'updatedAt'].includes(key)) {
      metadata[key] = value;
    }
  }

  if (Object.keys(metadata).length) {
    row.metadata = metadata;
  }

  return row;
}

export async function insertRow(table: string, row: Record<string, any>) {
  const columns = Object.keys(row);
  const values = Object.values(row);
  const placeholders = columns.map((_, index) => `$${index + 1}`);
  const result = await query(
    `insert into ${table} (${columns.join(', ')}) values (${placeholders.join(', ')}) returning *`,
    values,
  );
  return rowToApi(result.rows[0]);
}

export async function updateRow(table: string, id: string, row: Record<string, any>) {
  const columns = Object.keys(row);
  if (!columns.length) {
    const current = await query(`select * from ${table} where id = $1`, [id]);
    return rowToApi(current.rows[0]);
  }

  const assignments = columns.map((column, index) => `${column} = $${index + 2}`);
  const values = [id, ...Object.values(row)];
  const result = await query(
    `update ${table} set ${assignments.join(', ')}, updated_at = now() where id = $1 returning *`,
    values,
  );
  return rowToApi(result.rows[0]);
}

export async function deleteRow(table: string, id: string) {
  const result = await query(`delete from ${table} where id = $1 returning *`, [id]);
  return rowToApi(result.rows[0]);
}
