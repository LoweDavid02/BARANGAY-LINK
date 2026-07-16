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

        // Generate Sanctum token
        $token = $user->createToken('auth_token')->plainTextToken;

        // Load personnel relation if user is personnel
        if ($user->user_type === 'personnel') {
            $user->load('personnel');
        }

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

    /**
     * Handle user logout (revoke token).
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

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

        return response()->json($user);
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

        // Verify the Google ID token with Google's tokeninfo endpoint
        $client = new \GuzzleHttp\Client();
        try {
            $response = $client->get('https://oauth2.googleapis.com/tokeninfo', [
                'query' => ['id_token' => $request->credential],
                'timeout' => 10,
                'verify' => false,
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

        // Find existing user by email or google_id
        $user = User::where('email', $email)->orWhere('google_id', $googleId)->first();

        if ($user) {
            // Update google_id and avatar if not set
            if (!$user->google_id) {
                $user->google_id = $googleId;
            }
            if ($avatar && !$user->avatar_url) {
                $user->avatar_url = $avatar;
            }

            // Allow the user to switch portals seamlessly for testing purposes
            if ($user->user_type !== $portalType) {
                $user->user_type = $portalType;
                $user->role = $portalType === 'admin' ? 'Barangay Admin' : 'Field Personnel';
                
                // If switching to personnel, ensure they have a personnel profile
                if ($portalType === 'personnel') {
                    \App\Models\Personnel::firstOrCreate(
                        ['user_id' => $user->id],
                        [
                            'status' => 'Available',
                            'rating' => 5.0,
                            'detailed_role' => 'Field Personnel',
                            'active_tickets_count' => 0,
                        ]
                    );
                }
            }
            $user->save();
        } else {
            // Create new user for the selected portal
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'phone' => '',
                'password' => null,
                'user_type' => $portalType,
                'role' => $portalType === 'admin' ? 'Barangay Admin' : 'Field Personnel',
                'google_id' => $googleId,
                'avatar_url' => $avatar,
                'email_notifications_enabled' => true,
            ]);

            // If personnel, also create a Personnel profile
            if ($portalType === 'personnel') {
                \App\Models\Personnel::create([
                    'user_id' => $user->id,
                    'status' => 'Available',
                    'rating' => 5.0,
                    'detailed_role' => 'Field Personnel',
                    'active_tickets_count' => 0,
                ]);
            }
        }

        // Generate Sanctum token
        $token = $user->createToken('auth_token')->plainTextToken;

        if ($user->user_type === 'personnel') {
            $user->load('personnel');
        }

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }
}
