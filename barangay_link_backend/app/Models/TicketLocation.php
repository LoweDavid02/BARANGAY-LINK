<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['ticket_id', 'latitude', 'longitude', 'address'])]
class TicketLocation extends Model
{
    use HasFactory;

    /**
     * Get the ticket associated with this location.
     */
    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }
}
