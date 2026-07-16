# Recommended Improvements for Database Error Handling

## Current Status
✅ Fixed 504 Gateway Timeout issue
✅ Added connection timeout and SSL configuration
✅ Enhanced error handling in `TicketController::store()` method

## Additional Improvements (Optional)

### 1. Global Database Error Handler Middleware

Create a middleware to catch database exceptions across all controllers:

**File: `app/Http/Middleware/HandleDatabaseErrors.php`**

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;

class HandleDatabaseErrors
{
    public function handle(Request $request, Closure $next)
    {
        try {
            return $next($request);
        } catch (QueryException $e) {
            \Log::error('Database error: ' . $e->getMessage(), [
                'exception' => $e,
                'sql_state' => $e->errorInfo[0] ?? 'unknown',
                'error_code' => $e->errorInfo[1] ?? 'unknown',
                'url' => $request->fullUrl(),
                'method' => $request->method(),
            ]);
            
            // Check if it's a connection timeout
            if (str_contains($e->getMessage(), 'timeout') || 
                str_contains($e->getMessage(), 'connection') ||
                $e->getCode() === '08006') {
                return response()->json([
                    'message' => 'Database connection error. Please try again later.',
                    'error' => 'Unable to connect to database',
                ], 503);
            }
            
            return response()->json([
                'message' => 'A database error occurred. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : 'Database error',
            ], 500);
        }
    }
}
```

**Register in `bootstrap/app.php`:**

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->append(\App\Http\Middleware\HandleDatabaseErrors::class);
})
```

### 2. Database Health Check Endpoint

Add a health check endpoint to monitor database connectivity:

**File: `app/Http/Controllers/HealthController.php`**

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

class HealthController extends Controller
{
    public function check()
    {
        $health = [
            'status' => 'ok',
            'database' => 'unknown',
            'timestamp' => now()->toIso8601String(),
        ];
        
        try {
            DB::connection()->getPdo();
            $health['database'] = 'connected';
        } catch (\Exception $e) {
            $health['status'] = 'error';
            $health['database'] = 'disconnected';
            $health['error'] = config('app.debug') ? $e->getMessage() : 'Database connection failed';
            
            return response()->json($health, 503);
        }
        
        return response()->json($health);
    }
}
```

**Add route in `routes/api.php`:**

```php
Route::get('/health', [HealthController::class, 'check']);
```

### 3. Connection Retry Logic

Add automatic retry for transient connection failures:

**File: `app/Services/DatabaseRetryService.php`**

```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class DatabaseRetryService
{
    public static function transaction(callable $callback, int $maxAttempts = 3, int $delayMs = 1000)
    {
        $attempts = 0;
        
        while ($attempts < $maxAttempts) {
            try {
                return DB::transaction($callback);
            } catch (\Illuminate\Database\QueryException $e) {
                $attempts++;
                
                // Only retry on connection errors
                if ($attempts >= $maxAttempts || 
                    !self::isConnectionError($e)) {
                    throw $e;
                }
                
                \Log::warning("Database connection retry {$attempts}/{$maxAttempts}", [
                    'error' => $e->getMessage(),
                ]);
                
                usleep($delayMs * 1000);
            }
        }
    }
    
    private static function isConnectionError(\Illuminate\Database\QueryException $e): bool
    {
        $message = strtolower($e->getMessage());
        return str_contains($message, 'connection') ||
               str_contains($message, 'timeout') ||
               str_contains($message, 'gone away');
    }
}
```

**Usage in controllers:**

```php
use App\Services\DatabaseRetryService;

public function store(Request $request)
{
    try {
        return DatabaseRetryService::transaction(function () use ($request) {
            // ... your transaction logic
        });
    } catch (\Exception $e) {
        // ... error handling
    }
}
```

### 4. Database Connection Pool Configuration

Optimize connection pooling in `config/database.php`:

```php
'pgsql' => [
    // ... existing config
    'pool' => [
        'min' => env('DB_POOL_MIN', 2),
        'max' => env('DB_POOL_MAX', 10),
    ],
],
```

Add to `.env`:

```env
DB_POOL_MIN=2
DB_POOL_MAX=10
```

### 5. Monitoring and Alerting

Add database performance monitoring:

**File: `app/Providers/DatabaseMonitoringServiceProvider.php`**

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\DB;

class DatabaseMonitoringServiceProvider extends ServiceProvider
{
    public function boot()
    {
        DB::listen(function ($query) {
            // Log slow queries (> 1 second)
            if ($query->time > 1000) {
                \Log::warning('Slow query detected', [
                    'sql' => $query->sql,
                    'bindings' => $query->bindings,
                    'time' => $query->time . 'ms',
                ]);
            }
        });
        
        // Monitor connection events
        DB::getEventDispatcher()->listen(
            \Illuminate\Database\Events\ConnectionEstablished::class,
            function ($event) {
                \Log::info('Database connection established', [
                    'connection' => $event->connectionName,
                ]);
            }
        );
    }
}
```

### 6. Graceful Degradation

For non-critical features, implement graceful degradation:

```php
try {
    // Try to create notification
    Notification::create([...]);
} catch (\Exception $e) {
    // Log but don't fail the entire request
    \Log::warning('Failed to create notification: ' . $e->getMessage());
    // Continue without notification
}
```

### 7. Database Queue Fallback

For write-heavy operations, use queued jobs:

```php
// Instead of immediate writes
AuditLog::create([...]);

// Queue the write
dispatch(new CreateAuditLog([...]));
```

## Priority Recommendations

### High Priority (Implement Soon)
1. ✅ **Database timeout configuration** - Already implemented
2. ✅ **SSL mode configuration** - Already implemented
3. ✅ **Error handling in critical endpoints** - Already implemented for store()
4. **Health check endpoint** - Easy to implement, highly valuable for monitoring

### Medium Priority (Consider for Next Sprint)
5. **Global database error handler middleware** - Improves consistency across all endpoints
6. **Connection retry logic** - Helps with transient failures
7. **Monitoring slow queries** - Helps identify performance issues

### Low Priority (Future Enhancements)
8. **Connection pooling optimization** - Only needed at scale
9. **Queue-based writes** - Only if write performance becomes an issue
10. **Graceful degradation** - Nice to have for better UX

## Testing Recommendations

After implementing any of these improvements:

1. **Unit Tests**: Test error handling paths
2. **Integration Tests**: Test with database disconnected
3. **Load Tests**: Verify behavior under heavy load
4. **Chaos Engineering**: Randomly disconnect database to test recovery

## Monitoring Checklist

Set up monitoring for:
- [ ] Database connection pool usage
- [ ] Query execution times
- [ ] Connection timeout errors
- [ ] SSL/TLS handshake failures
- [ ] Transaction rollback rates
- [ ] Database response times
- [ ] Connection retry attempts

## Documentation

Update the following when implementing improvements:
- [ ] API documentation with new error codes
- [ ] Deployment guide with new environment variables
- [ ] Runbook for database connection issues
- [ ] Monitoring dashboard setup guide
