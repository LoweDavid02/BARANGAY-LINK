<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthenticated.'
            ], 401);
        }

        // Allow matching on user_type (e.g. 'admin', 'personnel', 'resident')
        if (in_array($user->user_type, $roles, true)) {
            return $next($request);
        }

        // Also allow matching on role (e.g. 'Barangay Admin', 'Tanod') if specified
        if (in_array($user->role, $roles, true)) {
            return $next($request);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Unauthorized access. Insufficient privileges for this operation.'
        ], 403);
    }
}
