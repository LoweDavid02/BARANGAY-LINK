<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['user_id', 'status', 'rating', 'detailed_role', 'active_tickets_count'])]
class Personnel extends Model
{
    use HasFactory;

    protected static function booted()
    {
        $incrementVersion = function () {
            if (!\Illuminate\Support\Facades\Cache::has('personnel_version')) {
                \Illuminate\Support\Facades\Cache::forever('personnel_version', 2);
            } else {
                \Illuminate\Support\Facades\Cache::increment('personnel_version');
            }
        };

        static::saved($incrementVersion);
        static::deleted($incrementVersion);
    }

    // Use default table name 'personnels'

    /**
     * Get the user record associated with the personnel.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the tickets assigned to this personnel.
     */
    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'assigned_personnel_id');
    }
}
