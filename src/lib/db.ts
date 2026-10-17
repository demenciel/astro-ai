import { env } from '~/lib/env';

/**
 * Thin D1 helpers. Schema lives in /migrations (see migrations/AGENTS.md).
 * Use prepared statements with `?` placeholders; never interpolate user input.
 */
export const db = () => env.DB;

export async function all<T>(sql: string, ...params: unknown[]): Promise<T[]> {
  const { results } = await db()
    .prepare(sql)
    .bind(...params)
    .all<T>();
  return results;
}

export async function first<T>(sql: string, ...params: unknown[]): Promise<T | null> {
  return db()
    .prepare(sql)
    .bind(...params)
    .first<T>();
}

export async function run(sql: string, ...params: unknown[]) {
  return db()
    .prepare(sql)
    .bind(...params)
    .run();
}

export const now = () => new Date().toISOString();

// ---- Typed rows (keep in sync with migrations) ----
export interface ContactRow {
  id: number;
  name: string | null;
  email: string | null;
  message: string | null;
  created_at: string;
}

export interface CustomerRow {
  id: number;
  email: string;
  stripe_customer_id: string | null;
  created_at: string;
}

export interface PaymentRow {
  id: number;
  stripe_session_id: string;
  email: string | null;
  amount_total: number | null;
  currency: string | null;
  status: string;
  mode: string | null;
  lookup_key: string | null;
  created_at: string;
}

export interface JobRow {
  id: number;
  type: string;
  status: 'queued' | 'done' | 'failed';
  error: string | null;
  created_at: string;
  updated_at: string;
}
