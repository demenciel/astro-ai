# Add a D1 table / column

1. `npm run new -- migration <name>` → `migrations/NNNN_<name>.sql`. Write `CREATE TABLE` /
   `ALTER TABLE ... ADD COLUMN`. Never edit an applied migration.
2. `npm run db:migrate` (local). Production migrations run on deploy (CI and `npm run deploy`).
3. Add a `<Name>Row` interface in `src/lib/db.ts`.
4. Query with `all<Row>()`, `first<Row>()`, `run()` from `~/lib/db` — always `?` placeholders.
5. Inspect: `npm run db:query -- "SELECT * FROM <table> LIMIT 5"`.

D1 is SQLite: `INTEGER PRIMARY KEY AUTOINCREMENT`, `TEXT` ISO dates (`now()` helper),
`ON CONFLICT ... DO UPDATE` for upserts, JSON in `TEXT` columns.
Free plan: 5 GB, 5M rows read/day.
