<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(5)
                ->by($request->ip())
                ->response(function (Request $request, array $headers) {
                    \Log::warning("Rate limit exceeded on login endpoint from IP: {$request->ip()}");
                    return response()->json([
                        'message' => 'Too many login attempts. Please try again in 1 minute.'
                    ], 429, $headers);
                });
        });

        RateLimiter::for('tickets_store', function (Request $request) {
            return Limit::perMinute(5)
                ->by($request->ip())
                ->response(function (Request $request, array $headers) {
                    \Log::warning("Rate limit exceeded on ticket creation from IP: {$request->ip()}");
                    return response()->json([
                        'message' => 'Ticket submission limit reached. Please wait before submitting another ticket.'
                    ], 429, $headers);
                });
        });
    }
}
