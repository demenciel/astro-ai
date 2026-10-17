// Shared helpers for scripts/*.mjs. Zero runtime dependencies.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { execSync, spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';

export const ROOT = new URL('..', import.meta.url).pathname;
export const p = (rel) => ROOT + rel;
export const read = (rel) => (existsSync(p(rel)) ? readFileSync(p(rel), 'utf8') : null);
export const write = (rel, text) => writeFileSync(p(rel), text);
export const exists = (rel) => existsSync(p(rel));
export const randomSecret = (bytes = 24) => randomBytes(bytes).toString('base64url');

/** Parse KEY=VALUE files (.env.setup, .dev.vars). */
export function parseEnv(text) {
  const out = {};
  for (const line of (text ?? '').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
  return out;
}

/** Set KEY=VALUE in an env file, keeping comments and order. */
export function setEnvValue(rel, key, value) {
  const text = read(rel) ?? '';
  const re = new RegExp(`^\\s*${key}\\s*=.*$`, 'm');
  write(rel, re.test(text) ? text.replace(re, `${key}=${value}`) : `${text.replace(/\n?$/, '\n')}${key}=${value}\n`);
}

/** Strip // and /* *\/ comments and trailing commas so JSONC can be JSON.parsed. */
export function parseJsonc(text) {
  let out = '';
  let inStr = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inStr) {
      out += c;
      if (c === '\\') out += text[++i];
      else if (c === '"') inStr = false;
    } else if (c === '"') {
      inStr = true;
      out += c;
    } else if (c === '/' && text[i + 1] === '/') {
      while (i < text.length && text[i] !== '\n') i++;
      out += '\n';
    } else if (c === '/' && text[i + 1] === '*') {
      i = text.indexOf('*/', i + 2) + 1;
    } else out += c;
  }
  return JSON.parse(out.replace(/,(\s*[}\]])/g, '$1'));
}

export const wranglerConfig = () => parseJsonc(read('wrangler.jsonc'));

export const PLACEHOLDER_DB_ID = '00000000-0000-0000-0000-000000000000';

export const has = (cmd) => spawnSync('sh', ['-c', `command -v ${cmd}`]).status === 0;

export function sh(cmd, opts = {}) {
  return execSync(cmd, { cwd: ROOT, stdio: 'inherit', ...opts });
}

export function gitRepoSlug() {
  try {
    const url = execSync('git remote get-url origin', { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
    return url.match(/github\.com[/:]([^/]+\/[^/.]+?)(?:\.git)?$/)?.[1] ?? null;
  } catch {
    return null;
  }
}

/** Secret names the Worker understands (keep in sync with .dev.vars.example). */
export const WORKER_SECRETS = [
  'ADMIN_PASSWORD',
  'SESSION_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
  'GEMINI_API_KEY',
  'XAI_API_KEY',
  'DEEPSEEK_API_KEY',
];

export const SETUP_FILE = '.env.setup';
export const loadSetupEnv = () => ({ ...parseEnv(read(SETUP_FILE)), ...pickEnv(process.env) });
function pickEnv(env) {
  const keys = [
    ...WORKER_SECRETS,
    'PROJECT_NAME',
    'SITE_URL',
    'CLOUDFLARE_API_TOKEN',
    'CLOUDFLARE_ACCOUNT_ID',
    'GITHUB_TOKEN',
    'GITHUB_REPO',
  ];
  return Object.fromEntries(keys.filter((k) => env[k]).map((k) => [k, env[k]]));
}

export const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
