# Database Migration Guide (Render → Supabase)

## Overview
This guide helps you migrate from Render PostgreSQL to Supabase PostgreSQL.

⚠️ **SECURITY NOTE**: This document uses PLACEHOLDERS. Never commit real credentials!

---

## Prerequisites

- PostgreSQL tools installed (`psql`, `pg_dump`, `pg_restore`)
- Render database access
- Supabase account

---

## Step 1: Export from Render

```powershell
# Get your Render External Database URL from dashboard
# Format: postgres://USER:PASSWORD@HOST/DATABASE

pg_dump "YOUR_RENDER_DATABASE_URL" -F c -f C:\BARANGAY_LINK\render_backup.dump --no-owner --no-acl
```

---

## Step 2: Import to Supabase

```powershell
# Get connection details from Supabase Dashboard → Settings → Database
pg_restore -d "postgresql://postgres:YOUR_SUPABASE_PASSWORD@YOUR_SUPABASE_HOST:5432/postgres" --no-owner --no-acl --clean --if-exists C:\BARANGAY_LINK\render_backup.dump
```

---

## Step 3: Verify Data

```powershell
cd C:\BARANGAY_LINK\barangay_link_backend
php artisan tinker
```

Run:
```php
DB::table('users')->count();
DB::table('tickets')->count();
exit
```

---

## Step 4: Update Environment Variables

### In Render Dashboard → Backend → Environment:

```env
DB_CONNECTION=pgsql
DB_HOST=YOUR_SUPABASE_HOST
DB_PORT=6543
DB_DATABASE=postgres
DB_USERNAME=YOUR_SUPABASE_USERNAME
DB_PASSWORD=YOUR_SUPABASE_PASSWORD
DB_SSLMODE=require
DB_CONNECT_TIMEOUT=10
```

⚠️ **Replace ALL placeholders with actual values!**

---

## Step 5: Test

```powershell
# Test health endpoint
Invoke-WebRequest -Uri "https://barangay-link-backend.onrender.com/api/health"
```

Expected: `200 OK` with `"database":"connected"`

---

## Security Best Practices

✅ **DO**:
- Use environment variables
- Store credentials in password manager
- Use `.env.example` with placeholders
- Keep `.env` in `.gitignore`

❌ **DON'T**:
- Commit `.env` files
- Put real credentials in documentation
- Share credentials in chat/email
- Commit backup files (*.dump, *.sql)

---

## Troubleshooting

**Connection failed?**
1. Check credentials are correct
2. Verify SSL mode (`require` for Supabase)
3. Use correct port (6543 for pooler, 5432 for direct)

**Data missing?**
1. Check Supabase Dashboard → Table Editor
2. Verify backup file has size
3. Re-run import with `-v` flag for verbose output

---

## Support

- Supabase Dashboard: https://supabase.com/dashboard
- Render Dashboard: https://dashboard.render.com

**Need help?** Check logs and verify all placeholders are replaced with real values.
