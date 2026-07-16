<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['ticket_id', 'file_url', 'file_type', 'uploaded_at'])]
class TicketAttachment extends Model
{
    use HasFactory;

    /**
     * Get the ticket associated with this attachment.
     */
    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }
}
