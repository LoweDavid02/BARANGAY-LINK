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
            'email' => 'required|string|email|max:255|unique:users',
            'role' => 'required|string|max:255',
            'department' => 'required|string|max:255',
        ]);

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
            'detailed_role' => $request->role, // Using role as detailed_role for simplicity
            'active_tickets_count' => 0,
        ]);

        return response()->json($personnel->load('user'), 201);
    }

    /**
     * Remove a personnel user and profile.
     */
    public function destroy($id)
    {
        $personnel = Personnel::findOrFail($id);
        
        // Also delete the associated user account
        if ($personnel->user) {
            $personnel->user->delete();
        }
        
        $personnel->delete();

        return response()->json(['message' => 'Personnel removed successfully']);
    }
}
