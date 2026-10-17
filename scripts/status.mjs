#!/usr/bin/env node
// Compact project status for humans and agents. Prints key NAMES, never values.
//   npm run status            # checklist
//   npm run status -- --json  # machine-readable
//   node scripts/status.mjs --hook   # one-liner for agent SessionStart hooks
import {
  PLACEHOLDER_DB_ID,
  SETUP_FILE,
  exists,
  gitRepoSlug,
  loadSetupEnv,
  parseEnv,
  read,
  wranglerConfig,
} from './lib.mjs';

const env = loadSetupEnv();
const cfg = wranglerConfig();
const brief = read('PROJECT.md') ?? '';
const onboarded = /^onboarded:\s*true/m.test(brief);
const set = (k) => Boolean(env[k]);
const ai = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'GEMINI_API_KEY', 'XAI_API_KEY', 'DEEPSEEK_API_KEY'].filter(set);

const s = {
  onboarded,
  deps: exists('node_modules'),
  setupFile: exists(SETUP_FILE),
  devVars: exists('.dev.vars') && Boolean(parseEnv(read('.dev.vars')).ADMIN_PASSWORD),
  worker: cfg.name,
  d1Provisioned: cfg.d1_databases?.[0]?.database_id !== PLACEHOLDER_DB_ID,
  siteUrl: cfg.vars?.SITE_URL,
  repo: gitRepoSlug(),
  keys: {
    cloudflare: set('CLOUDFLARE_API_TOKEN'),
    github: set('GITHUB_TOKEN'),
    stripe: set('STRIPE_SECRET_KEY'),
    stripeWebhook: set('STRIPE_WEBHOOK_SECRET'),
    ai,
  },
};

const next = [];
if (!s.onboarded) next.push('Onboard: interview the user and fill PROJECT.md (.agents/skills/onboarding.md)');
if (!s.deps) next.push('npm install');
if (!s.setupFile) next.push('cp .env.setup.example .env.setup and ask the user to paste their keys there');
if (!s.devVars) next.push('npm run setup -- --only=local');
if (s.keys.cloudflare && !s.d1Provisioned) next.push('npm run setup  (provisions D1 + queue, deploys)');
if (!s.keys.cloudflare) next.push('Ask user for CLOUDFLARE_API_TOKEN (see .env.setup.example)');
if (s.keys.stripe && !s.keys.stripeWebhook) next.push('npm run setup -- --only=stripe,deploy');

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ ...s, next }));
} else if (process.argv.includes('--hook')) {
  if (!s.onboarded) {
    console.log(
      'astro-ai: project NOT onboarded yet. Before other work, follow .agents/skills/onboarding.md (interview the user, fill PROJECT.md, run setup). Status: `npm run status`.'
    );
  } else if (next.length) console.log(`astro-ai next: ${next.join(' | ')}`);
} else {
  const c = (b) => (b ? '✔' : '·');
  console.log(`${c(s.onboarded)} onboarded (PROJECT.md)
${c(s.deps)} dependencies installed
${c(s.setupFile)} .env.setup present
${c(s.devVars)} .dev.vars (local secrets)
${c(s.d1Provisioned)} Cloudflare D1 provisioned  [worker: ${s.worker}]
  site: ${s.siteUrl}   repo: ${s.repo ?? 'no remote'}
keys: cloudflare=${c(s.keys.cloudflare)} github=${c(s.keys.github)} stripe=${c(s.keys.stripe)} webhook=${c(s.keys.stripeWebhook)} ai=[${ai.map((k) => k.split('_')[0].toLowerCase()).join(',')}]`);
  if (next.length) console.log(`\nnext:\n- ${next.join('\n- ')}`);
}
