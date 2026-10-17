#!/usr/bin/env node
// Scaffolders so agents write intent, not boilerplate. Prints created paths only.
//   npm run new -- page <slug>         src/pages/<slug>.astro (static marketing page)
//   npm run new -- api <name>          src/pages/api/<name>.ts (Worker endpoint)
//   npm run new -- admin <name>        src/pages/admin/<name>.astro + sidebar entry
//   npm run new -- migration <name>    migrations/NNNN_<name>.sql
//   npm run new -- job <name>          handler stub in src/lib/jobs.ts
import { mkdirSync, readdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { exists, p, read, slugify, write } from './lib.mjs';

const [kind, rawName] = process.argv.slice(2);
if (!kind || !rawName) {
  console.log('usage: npm run new -- <page|api|admin|migration|job> <name>');
  process.exit(1);
}
const name = rawName.replace(/^\/+|\.(astro|ts|sql)$/g, '');
const title = name
  .split(/[/_-]/)
  .pop()
  .replace(/^\w/, (c) => c.toUpperCase());

function create(rel, content) {
  if (exists(rel)) {
    console.error(`exists: ${rel}`);
    process.exit(1);
  }
  mkdirSync(dirname(p(rel)), { recursive: true });
  write(rel, content);
  console.log(`created ${rel}`);
}

const templates = {
  page: () =>
    create(
      `src/pages/${name}.astro`,
      `---
import Layout from '~/layouts/PageLayout.astro';
import HeroText from '~/components/widgets/HeroText.astro';
import Content from '~/components/widgets/Content.astro';

const metadata = { title: '${title}', description: 'TODO: one-sentence description for SEO.' };
---

<Layout metadata={metadata}>
  <HeroText tagline="${title}" title="TODO headline" subtitle="TODO subtitle" />
  <Content title="TODO section" items={[{ title: 'Point', description: 'Detail' }]} />
</Layout>
`
    ),

  api: () =>
    create(
      `src/pages/api/${name}.ts`,
      `import type { APIRoute } from 'astro';
import { error, json, readBody } from '~/lib/http';

export const prerender = false;

export const GET: APIRoute = async () => json({ ok: true });

export const POST: APIRoute = async ({ request }) => {
  const body = await readBody(request);
  if (!body) return error('Invalid body');
  return json({ ok: true, body });
};
`
    ),

  admin: () => {
    create(
      `src/pages/admin/${name}.astro`,
      `---
import AdminLayout from '~/layouts/AdminLayout.astro';
import DataTable from '~/components/admin/DataTable.astro';
import { all } from '~/lib/db';

export const prerender = false;

// TODO: replace with the real table.
const rows = await all<{ id: number; created_at: string }>('SELECT id, created_at FROM jobs ORDER BY id DESC LIMIT 50');
---

<AdminLayout title="${title}">
  <DataTable
    rows={rows}
    columns={[
      { key: 'id', label: '#' },
      { key: 'created_at', label: 'Created' },
    ]}
  />
</AdminLayout>
`
    );
    const navFile = 'src/components/admin/nav.ts';
    write(
      navFile,
      read(navFile).replace(/\n\];\s*$/, `\n  { text: '${title}', href: '/admin/${name}', icon: 'tabler:file' },\n];\n`)
    );
    console.log(`updated ${navFile}`);
  },

  migration: () => {
    const nums = readdirSync(p('migrations'))
      .map((f) => parseInt(f, 10))
      .filter((n) => !Number.isNaN(n));
    const next = String(Math.max(0, ...nums) + 1).padStart(4, '0');
    create(
      `migrations/${next}_${slugify(name).replace(/-/g, '_')}.sql`,
      `-- ${name}\n-- Apply: npm run db:migrate (local), deploy applies it remotely.\n\n`
    );
  },

  job: () => {
    const file = 'src/lib/jobs.ts';
    const src = read(file);
    if (src.includes(`'${name}':`)) {
      console.error(`exists: job ${name}`);
      process.exit(1);
    }
    write(
      file,
      src.replace(
        '} satisfies Record<string, Handler>;',
        `  '${name}': async (payload: Record<string, unknown>) => {\n    console.log('${name}', payload);\n  },\n} satisfies Record<string, Handler>;`
      )
    );
    console.log(`updated ${file} (enqueue('${name}', payload) from any route)`);
  },
};

if (!templates[kind]) {
  console.error(`unknown kind "${kind}"`);
  process.exit(1);
}
templates[kind]();
