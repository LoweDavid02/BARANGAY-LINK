<?php

namespace App\Http\Controllers;

abstract class Controller
{
    /**
     * Get the current cache version for a specific entity type.
     */
    protected function getCacheVersion(string $key): int
    {
        return \Illuminate\Support\Facades\Cache::get($key . '_version', 1);
    }

    /**
     * Increment the cache version for a specific entity type.
     */
    protected function incrementCacheVersion(string $key): int
    {
        // Remember forever initially, or increment if it exists
        if (!\Illuminate\Support\Facades\Cache::has($key . '_version')) {
            \Illuminate\Support\Facades\Cache::forever($key . '_version', 2);
            return 2;
        }
        return \Illuminate\Support\Facades\Cache::increment($key . '_version');
    }
}
