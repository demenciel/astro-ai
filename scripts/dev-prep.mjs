#!/usr/bin/env node
// Runs before `npm run dev`: first time, create .dev.vars (generated admin password) and the
// local D1 schema; afterwards just apply any new local migrations. Fast and idempotent.
import { spawnSync } from 'node:child_process';
import { exists, p } from './lib.mjs';

if (!exists('.dev.vars')) {
  spawnSync('node', ['scripts/setup.mjs', '--only=local'], { cwd: p(''), stdio: 'inherit' });
} else {
  spawnSync('npx', ['wrangler', 'd1', 'migrations', 'apply', 'DB', '--local'], { cwd: p(''), stdio: 'ignore' });
}
console.log('admin: http://localhost:4321/admin (password: ADMIN_PASSWORD in .env.setup or .dev.vars)');
