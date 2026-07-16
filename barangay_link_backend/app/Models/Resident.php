<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['name', 'email', 'phone'])]
class Resident extends Model
{
    use HasFactory;

    /**
     * Get the tickets submitted by this resident.
     */
    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }
}
