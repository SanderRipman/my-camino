# UAT 3R – exact live Supabase edge-function rollback baselines

Source: Supabase project ibloovohuhrceivrvhvn, fetched 2026-11-22 during UAT 3R. Do not merge this backup branch into demo-uat/main. Edge function source contains no secrets, uses environment variables.

- admin-grant-role: live version 4, verify_jwt true, ezbr_sha256 a785344748e1550140a06b455874db227b10a18d636ef408342c9f730cba1eb0, backup path `supabase/edge-backups/2026-11-22/admin-grant-role.v4.index.ts`.
- task-command: live version 5, verify_jwt true, ezbr_sha256 534498e302644e11e8781a0d598b97a6c290cabd1d79ab38640402cf20dd83d4, backup path `supabase/edge-backups/2026-11-22/task-command.v5.index.ts`.

Rollback: stop new requests; redeploy the exact archived function source with verify_jwt=true using authorized Supabase function deployment; verify new active code matches backup; read-only check UAT Mina roles/tasks/GO and context, and log incident. Avoid rolling back unrelated functions or dropping data.
