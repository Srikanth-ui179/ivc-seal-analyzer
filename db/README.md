# IndusScript AI database — Phase 1

This directory contains only the stable archaeological and visual-catalogue layer. It does not contain computational observations, model outputs, translations, linguistic assumptions, or decipherment claims.

## Local setup

1. Install Docker Desktop and ensure it is running.
2. Optionally copy `.env.example` to `.env` and replace the development password.
   The same file includes the server-only `DATABASE_URL` used by the Next.js application.
3. Start PostgreSQL and apply migrations:

   ```powershell
   ./scripts/db-migrate.ps1
   ```

4. Check database health:

   ```powershell
   ./scripts/db-health.ps1
   ```

5. Verify Phase 1 integrity rules:

   ```powershell
   ./scripts/db-verify-phase1.ps1
   ```

The development service uses PostgreSQL 16 and listens on `localhost:5432` by default. Credentials default to the development-only values in `.env.example`.

## Application access layer

The server-side TypeScript repository lives in `lib/db/phase1-repository.ts`. It uses parameterized PostgreSQL queries through `lib/db/client.ts`; neither module may be imported by a Client Component. `DATABASE_URL` must remain server-only and must never use a `NEXT_PUBLIC_` prefix.

## Migration policy

Run migrations through `scripts/db-migrate.ps1`. It records completed files in `schema_migrations`, executes files in lexical order, and skips already-applied migrations. Do not edit a migration after it has been applied to a shared database; add a new numbered migration instead.

## Scope and provenance rules

- `research` records are intended for source-backed records; `demo` records are synthetic fixtures only.
- All demo records require a `DEMO-` stable ID and linked records must have the same scope.
- `archaeological_assertions` preserve source-specific claims without overwriting stable records.
- `(subject_type, subject_id)` is a polymorphic reference. PostgreSQL triggers enforce that the target exists in the declared table and that its scope matches the linked source.
- Phase 2 and Phase 3 must only reference this layer. They must not update archaeological facts, catalogue forms, or source assertions.
