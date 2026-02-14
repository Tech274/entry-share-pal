# Database schema setup

If you see **"no DB Schema"** or **"relation does not exist"** (in the app or in Supabase), the database tables are missing. Apply the SQL in Supabase so the app can run.

## Option 1: Only personnel tables missing

If you already have core tables (e.g. `lab_requests`, `delivery_requests`) but cannot add personnel:

1. Open **Supabase Dashboard** → **SQL Editor**.
2. Open the file **`RUN_PERSONNEL_MIGRATIONS.sql`** in this folder, copy its contents, paste into the editor, and **Run**.

This creates: `agents`, `account_managers`, `clients`, `solution_managers`, `delivery_managers`, plus RLS and optional FK columns on `lab_requests`/`delivery_requests` if those tables exist.

## Option 2: No schema at all (brand‑new project)

If the project has **no tables yet** (Supabase says there is no DB schema):

1. Run the **migrations in order** in SQL Editor:
   - Open **`migrations/`** and run each `.sql` file in **date order** (oldest first), e.g. `20260202042054_...sql` first, then the next, and so on.
   - Then run **`RUN_PERSONNEL_MIGRATIONS.sql`** to add personnel tables.

2. Or, if you use **Supabase CLI** and the project is linked:
   - `supabase db push` applies all migrations from `migrations/` automatically.

After the schema exists, the app can add personnel and use lab/delivery requests as expected.
