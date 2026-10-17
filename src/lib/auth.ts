import type { AstroCookies } from 'astro';
import { env } from '~/lib/env';

/**
 * Minimal single-admin auth: password = ADMIN_PASSWORD secret, session = HMAC-signed
 * cookie (key = SESSION_SECRET, falls back to ADMIN_PASSWORD). No KV/DB needed.
 * Swap for real user accounts later (see .agents/skills/add-admin-section.md).
 */
export const COOKIE = 'admin_session';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const enc = new TextEncoder();

async function hmac(data: string) {
  const secret = env.SESSION_SECRET || env.ADMIN_PASSWORD || '';
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ]);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/** Constant-time string comparison. */
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function checkPassword(password: string) {
  return Boolean(env.ADMIN_PASSWORD) && safeEqual(password, env.ADMIN_PASSWORD!);
}

export async function createSession(cookies: AstroCookies, secure: boolean) {
  const exp = String(Math.floor(Date.now() / 1000) + MAX_AGE);
  cookies.set(COOKIE, `${exp}.${await hmac(exp)}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: MAX_AGE,
  });
}

export async function isAuthenticated(cookies: AstroCookies) {
  if (!env.ADMIN_PASSWORD) return false;
  const value = cookies.get(COOKIE)?.value;
  if (!value) return false;
  const [exp, sig] = value.split('.');
  if (!exp || !sig || Number(exp) < Date.now() / 1000) return false;
  return safeEqual(sig, await hmac(exp));
}

export function destroySession(cookies: AstroCookies) {
  cookies.delete(COOKIE, { path: '/' });
}
