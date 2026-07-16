# Database Configuration Guide

## Overview
This document explains the database configuration for the Barangay Link backend, particularly for PostgreSQL connections on Render or other cloud platforms.

## Required Environment Variables

### For PostgreSQL (Production - Render)
```env
DB_CONNECTION=pgsql
DB_HOST=<your-render-internal-db-url>  # Use internal URL, not external
DB_PORT=5432
DB_DATABASE=<your-database-name>
DB_USERNAME=<your-database-user>
DB_PASSWORD=<your-database-password>
DB_SSLMODE=require  # CRITICAL for Render Postgres
DB_CONNECT_TIMEOUT=10  # Prevents hanging connections
```

### For PostgreSQL (Local Development)
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=barangay_link
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_SSLMODE=prefer  # Less strict for local
DB_CONNECT_TIMEOUT=10
```

## Key Configuration Parameters

### 1. DB_SSLMODE
Controls SSL/TLS connection mode for PostgreSQL:
- **`require`**: Forces SSL connection (REQUIRED for Render and most cloud providers)
- **`prefer`**: Tries SSL first, falls back to non-SSL (good for local development)
- **`disable`**: No SSL (only for local development)

**Important**: Render's PostgreSQL requires `DB_SSLMODE=require`. Without this, connections will hang and timeout.

### 2. DB_CONNECT_TIMEOUT
Sets the connection timeout in seconds (default: 10 seconds):
- Prevents indefinite hanging when database is unreachable
- Returns a 503 error quickly instead of timing out after several minutes
- Configured in `config/database.php` via PDO::ATTR_TIMEOUT

### 3. DB_HOST
**For Render deployments**:
- Use the **internal database URL** (e.g., `dpg-xxxxx-a.oregon-postgres.render.com`)
- Internal connections are faster and more reliable than external URLs
- Found in Render Dashboard → Database → Internal Database URL

## Database Configuration File

The `config/database.php` file includes these critical settings for PostgreSQL:

```php
'pgsql' => [
    'driver' => 'pgsql',
    'url' => env('DATABASE_URL', env('DB_URL')),
    'host' => env('DB_HOST', '127.0.0.1'),
    'port' => env('DB_PORT', '5432'),
    'database' => env('DB_DATABASE', 'laravel'),
    'username' => env('DB_USERNAME', 'root'),
    'password' => env('DB_PASSWORD', ''),
    'charset' => env('DB_CHARSET', 'utf8'),
    'prefix' => '',
    'prefix_indexes' => true,
    'search_path' => 'public',
    'sslmode' => env('DB_SSLMODE', 'prefer'),
    'options' => extension_loaded('pdo_pgsql') ? array_filter([
        \PDO::ATTR_TIMEOUT => env('DB_CONNECT_TIMEOUT', 10),
        \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
    ]) : [],
],
```

## Troubleshooting 504 Gateway Timeout

### Symptoms
- API endpoint returns 504 Gateway Timeout
- Request hangs during database write operations
- Validation passes but response never returns

### Common Causes & Solutions

#### 1. Missing SSL Mode
**Problem**: PostgreSQL connection hangs because SSL is required but not configured.

**Solution**: Add to `.env`:
```env
DB_SSLMODE=require
```

#### 2. Using External Database URL
**Problem**: External database URLs are slower and may have network issues.

**Solution**: Use Render's internal database URL in `DB_HOST`.

#### 3. Database Instance Sleeping (Free Tier)
**Problem**: Render free tier databases may sleep after inactivity.

**Solution**: 
- Upgrade to paid tier for always-on database
- Or implement retry logic in your application
- Or add a database wake-up endpoint and call it periodically

#### 4. Connection Pool Exhaustion
**Problem**: Too many open connections to database.

**Solution**: Check connection limits and ensure connections are properly closed.

#### 5. No Connection Timeout
**Problem**: Application waits indefinitely for database response.

**Solution**: Set `DB_CONNECT_TIMEOUT=10` (already configured).

## Error Handling

The TicketController now includes comprehensive error handling:

```php
try {
    return DB::transaction(function () use ($request) {
        // ... database operations
    });
} catch (\Illuminate\Database\QueryException $e) {
    \Log::error('Database error during ticket creation: ' . $e->getMessage(), [
        'exception' => $e,
        'sql_state' => $e->errorInfo[0] ?? 'unknown',
        'error_code' => $e->errorInfo[1] ?? 'unknown',
    ]);
    
    return response()->json([
        'message' => 'Database connection error. Please try again later.',
        'error' => 'Unable to connect to database',
    ], 503);
}
```

## Checking Logs

Logs are stored in `storage/logs/laravel.log`. Look for:
- `Database error during ticket creation`
- Connection timeout messages
- SSL/TLS handshake failures
- PDO exceptions

## Testing Database Connection

Run this artisan command to test the database connection:

```bash
php artisan migrate:status
```

If this hangs or fails, your database configuration needs attention.

## Production Deployment Checklist

Before deploying to Render:

- [ ] Set `DB_SSLMODE=require` in Render environment variables
- [ ] Use internal database URL for `DB_HOST`
- [ ] Set `DB_CONNECT_TIMEOUT=10`
- [ ] Verify all DB_* environment variables are set
- [ ] Test database connection with `php artisan migrate:status`
- [ ] Check logs for any connection errors
- [ ] Ensure database instance is not on free tier (or accept sleep limitations)

## Additional Resources

- [Laravel Database Configuration](https://laravel.com/docs/database)
- [Render PostgreSQL Docs](https://render.com/docs/databases)
- [PostgreSQL SSL Modes](https://www.postgresql.org/docs/current/libpq-ssl.html)
