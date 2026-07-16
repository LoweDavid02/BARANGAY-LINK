<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['ticket_id', 'action_date', 'action', 'performed_by'])]
class TicketHistory extends Model
{
    use HasFactory;

    /**
     * Get the ticket associated with this history record.
     */
    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }
}
