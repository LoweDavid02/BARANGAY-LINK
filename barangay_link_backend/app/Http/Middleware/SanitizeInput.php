<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SanitizeInput
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $input = $request->all();
        
        array_walk_recursive($input, function (&$val) {
            if (is_string($val)) {
                // Strip null bytes and control characters
                $val = str_replace(chr(0), '', $val);
                // Strip HTML tags
                $val = strip_tags($val);
                // Remove javascript: URI protocols
                $val = preg_replace('/javascript\s*:/i', '', $val);
                // Trim leading/trailing whitespace
                $val = trim($val);
            }
        });
        
        $request->merge($input);
        
        return $next($request);
    }
}
