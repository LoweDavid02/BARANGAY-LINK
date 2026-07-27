<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Handle user login and return Sanctum token.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our records.'],
            ]);
        }

        // Revoke previous tokens to prevent token accumulation
        $user->tokens()->delete();

        // Generate Sanctum token
        $token = $user->createToken('auth_token')->plainTextToken;

        // Load personnel relation if user is personnel
        if ($user->user_type === 'personnel') {
            $user->load('personnel');
        }

        // Log login audit
        try {
            \App\Models\AuditLog::create([
                'action' => 'User Login',
                'user' => $user->name,
                'details' => "Logged in via password authentication (type: {$user->user_type})",
                'ip_address' => $request->ip(),
            ]);
        } catch (\Exception $e) {
            \Log::warning("Failed to record login audit log: " . $e->getMessage());
        }

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->makeHidden(['password', 'remember_token', 'google_id'])
        ]);
    }

    /**
     * Handle user logout (revoke token).
     */
    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user) {
            try {
                \App\Models\AuditLog::create([
                    'action' => 'User Logout',
                    'user' => $user->name,
                    'details' => "Logged out from system",
                    'ip_address' => $request->ip(),
                ]);
            } catch (\Exception $e) {
                // Ignore audit log failure during logout
            }

            $user->currentAccessToken()?->delete();
        }

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Retrieve current authenticated user.
     */
    public function me(Request $request)
    {
        $user = $request->user();
        
        if ($user->user_type === 'personnel') {
            $user->load('personnel');
        }

        return response()->json($user->makeHidden(['password', 'remember_token', 'google_id']));
    }

    /**
     * Handle Google OAuth login.
     */
    public function googleLogin(Request $request)
    {
        $request->validate([
            'credential' => 'required|string',
            'portal' => 'required|string|in:Admin,Personnel',
        ]);

        // Verify the Google ID token with Google's tokeninfo endpoint (SSL verification ENFORCED)
        $client = new \GuzzleHttp\Client();
        try {
            $response = $client->get('https://oauth2.googleapis.com/tokeninfo', [
                'query' => ['id_token' => $request->credential],
                'timeout' => 10,
                'verify' => true,
            ]);
            $payload = json_decode($response->getBody()->getContents(), true);
        } catch (\Exception $e) {
            \Log::error("Google Token Verification Failed: " . $e->getMessage());
            return response()->json(['message' => 'Invalid Google token. Please try again.'], 401);
        }

        if (!isset($payload['email']) || !isset($payload['sub'])) {
            return response()->json(['message' => 'Invalid Google token payload.'], 401);
        }

        $googleId = $payload['sub'];
        $email = $payload['email'];
        $name = $payload['name'] ?? $payload['email'];
        $avatar = $payload['picture'] ?? null;
        $portalType = strtolower($request->portal); // 'admin' or 'personnel'

        // Strict authorization: Find pre-registered user by email or google_id
        $user = User::where('email', $email)->orWhere('google_id', $googleId)->first();

        if (!$user) {
            return response()->json([
                'message' => 'No account found matching this Google email address. Please contact your system administrator.'
            ], 403);
        }

        // Enforce user_type matching: users cannot switch portals/roles arbitrarily
        if ($user->user_type !== $portalType) {
            return response()->json([
                'message' => "Access denied. Your account is registered as '{$user->user_type}', which cannot log in to the {$request->portal} portal."
            ], 403);
        }

        // Link google_id and update avatar if not set
        if (!$user->google_id) {
            $user->google_id = $googleId;
        }
        if ($avatar && !$user->avatar_url) {
            $user->avatar_url = $avatar;
        }
        $user->save();

        // Revoke previous tokens to prevent token accumulation
        $user->tokens()->delete();

        // Generate Sanctum token
        $token = $user->createToken('auth_token')->plainTextToken;

        if ($user->user_type === 'personnel') {
            $user->load('personnel');
        }

        // Log OAuth login audit
        try {
            \App\Models\AuditLog::create([
                'action' => 'Google OAuth Login',
                'user' => $user->name,
                'details' => "Authenticated via Google OAuth into {$request->portal} Portal",
                'ip_address' => $request->ip(),
            ]);
        } catch (\Exception $e) {
            \Log::warning("Failed to record Google OAuth login audit: " . $e->getMessage());
        }

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->makeHidden(['password', 'remember_token', 'google_id']),
        ]);
    }
}
