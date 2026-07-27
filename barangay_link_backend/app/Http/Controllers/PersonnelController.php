<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Personnel;
use App\Models\User;

class PersonnelController extends Controller
{
    /**
     * List all personnel with user details.
     */
    public function index()
    {
        $personnel = Personnel::with('user')->get();

        return response()->json($personnel);
    }

    /**
     * Create a new personnel user and profile.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'role' => 'required|string|max:100',
            'department' => 'required|string|max:255',
        ]);

        return \Illuminate\Support\Facades\DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => '',
                'password' => null, // Expects Google sign-in
                'user_type' => 'personnel',
                'role' => $request->role,
            ]);

            $personnel = Personnel::create([
                'user_id' => $user->id,
                'status' => 'Available',
                'rating' => 5.0,
                'detailed_role' => $request->role,
                'active_tickets_count' => 0,
            ]);

            try {
                \App\Models\AuditLog::create([
                    'action' => 'Create Personnel',
                    'user' => auth()->user()?->name ?? 'Admin',
                    'details' => "Provisioned new personnel account: {$user->name} ({$user->email})",
                    'ip_address' => $request->ip(),
                ]);
            } catch (\Exception $e) {
                \Log::warning("Failed to record audit log: " . $e->getMessage());
            }

            return response()->json($personnel->load('user'), 201);
        });
    }

    /**
     * Remove a personnel user and profile.
     */
    public function destroy($id)
    {
        $personnel = Personnel::findOrFail($id);
        $name = $personnel->user?->name ?? "ID #{$id}";
        
        \Illuminate\Support\Facades\DB::transaction(function () use ($personnel) {
            if ($personnel->user) {
                $personnel->user->delete();
            }
            $personnel->delete();
        });

        try {
            \App\Models\AuditLog::create([
                'action' => 'Delete Personnel',
                'user' => auth()->user()?->name ?? 'Admin',
                'details' => "Deprovisioned personnel account: {$name}",
                'ip_address' => request()->ip(),
            ]);
        } catch (\Exception $e) {
            \Log::warning("Failed to record audit log: " . $e->getMessage());
        }

        return response()->json(['message' => 'Personnel removed successfully']);
    }
}
