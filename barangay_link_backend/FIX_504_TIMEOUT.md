# Fix for 504 Gateway Timeout on Ticket Submission

## Problem Summary
The `POST /api/tickets` endpoint was returning a 504 Gateway Timeout error after validation passed. The request would hang when Laravel tried to write to the PostgreSQL database.

## Root Cause
The PostgreSQL database connection was hanging due to missing SSL configuration, which is required by Render's PostgreSQL service and most cloud database providers.

## Fixes Applied

### 1. Database Configuration (`config/database.php`)
Added connection timeout and SSL mode configuration to the PostgreSQL connection:

```php
'pgsql' => [
    // ... existing config
    'sslmode' => env('DB_SSLMODE', 'prefer'),
    'options' => extension_loaded('pdo_pgsql') ? array_filter([
        \PDO::ATTR_TIMEOUT => env('DB_CONNECT_TIMEOUT', 10),
        \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
    ]) : [],
],
```

**What this does:**
- `DB_SSLMODE`: Configures SSL/TLS connection mode (required for Render)
- `PDO::ATTR_TIMEOUT`: Sets connection timeout to 10 seconds (prevents hanging)
- `PDO::ATTR_ERRMODE`: Forces PDO to throw exceptions for better error handling

### 2. Environment Variables (`.env`)
Added required database configuration variables:

```env
DB_SSLMODE=prefer  # Use 'require' for production on Render
DB_CONNECT_TIMEOUT=10
```

### 3. Environment Template (`.env.example`)
Documented the new variables:

```env
# DB_SSLMODE=prefer # For PostgreSQL: use 'require' for Render/production, 'prefer' for local
# DB_CONNECT_TIMEOUT=10 # Connection timeout in seconds (prevents hanging)
```

### 4. Enhanced Error Handling (`TicketController.php`)
Wrapped the ticket creation logic with comprehensive error handling:

```php
try {
    return DB::transaction(function () use ($request) {
        // ... ticket creation logic
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
        'details' => config('app.debug') ? $e->getMessage() : null,
    ], 503);
} catch (\Exception $e) {
    \Log::error('Error creating ticket: ' . $e->getMessage(), [
        'exception' => $e,
        'trace' => $e->getTraceAsString(),
    ]);
    
    return response()->json([
        'message' => 'An error occurred while creating the ticket.',
        'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
    ], 500);
}
```

**Benefits:**
- Returns 503 (Service Unavailable) for database connection issues
- Returns 500 (Internal Server Error) for other errors
- Logs detailed error information for debugging
- Returns user-friendly error messages
- Shows debug details only when `APP_DEBUG=true`
- Prevents hanging - fails fast with clear error messages

## Deployment Instructions

### For Local Development
Your current `.env` is already updated with:
```env
DB_SSLMODE=prefer
DB_CONNECT_TIMEOUT=10
```

### For Production (Render)
Set these environment variables in Render Dashboard:

```env
DB_SSLMODE=require  # CRITICAL - must be 'require' for Render
DB_CONNECT_TIMEOUT=10
```

Also ensure:
1. `DB_HOST` uses the **internal** database URL from Render
2. All other DB_* variables are correctly set
3. Database instance is running (not sleeping on free tier)

## Testing the Fix

### 1. Test Database Connection
```bash
php artisan migrate:status
```

If this hangs or fails, database configuration needs attention.

### 2. Test API Endpoint
Submit a ticket via the API:

```bash
curl -X POST http://your-api-url/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Infrastructure",
    "department": "Engineering",
    "subject": "Test Ticket",
    "description": "Testing after fix",
    "location": {
      "lat": 14.1234,
      "lng": 120.5678,
      "address": "Test Address"
    },
    "submitter": {
      "name": "Test User",
      "email": "test@example.com",
      "phone": "1234567890"
    }
  }'
```

### 3. Check Logs
Monitor `storage/logs/laravel.log` for any errors:

```bash
tail -f storage/logs/laravel.log
```

## Expected Behavior After Fix

### Success Case
- API responds with 201 Created
- Ticket is saved to database
- Response includes ticket ID
- No hanging or timeout

### Database Connection Failure
- API responds with 503 Service Unavailable within 10 seconds
- Error message: "Database connection error"
- Detailed error logged to `laravel.log`
- No hanging for 504 seconds

### Other Errors
- API responds with 500 Internal Server Error
- User-friendly error message
- Full error details logged

## Additional Documentation

- **`DATABASE_CONFIG.md`** - Comprehensive database configuration guide
- **`RENDER_ENV_TEMPLATE.md`** - Environment variables template for Render deployment

## Troubleshooting

If you still experience 504 timeouts:

1. **Check SSL Mode**: Ensure `DB_SSLMODE=require` on Render
2. **Verify Database URL**: Use internal URL, not external
3. **Check Database Status**: Ensure database is running (may sleep on free tier)
4. **Review Logs**: Check `storage/logs/laravel.log` for connection errors
5. **Test Connection**: Run `php artisan migrate:status`
6. **Increase Timeout**: Try setting `DB_CONNECT_TIMEOUT=30` if needed

## Files Modified

1. `config/database.php` - Added SSL mode and connection timeout
2. `.env` - Added DB_SSLMODE and DB_CONNECT_TIMEOUT
3. `.env.example` - Documented new variables
4. `app/Http/Controllers/TicketController.php` - Enhanced error handling

## Files Created

1. `DATABASE_CONFIG.md` - Database configuration guide
2. `RENDER_ENV_TEMPLATE.md` - Render environment variables template
3. `FIX_504_TIMEOUT.md` - This file
