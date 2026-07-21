<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable([
    'id', 'category', 'department', 'subject', 'description', 
    'status', 'priority', 'progress', 'asset_id', 'last_inspection', 
    'source', 'evidence_photo', 'resident_id', 'assigned_personnel_id'
])]
class Ticket extends Model
{
    use HasFactory;

    protected static function booted()
    {
        $incrementVersion = function () {
            if (!\Illuminate\Support\Facades\Cache::increment('tickets_version')) {
                \Illuminate\Support\Facades\Cache::forever('tickets_version', 2);
            }
        };

        static::saved($incrementVersion);
        static::deleted($incrementVersion);
    }

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * The "type" of the primary key ID.
     *
     * @var string
     */
    protected $keyType = 'string';

    /**
     * Get the resident who submitted the ticket.
     */
    public function resident()
    {
        return $this->belongsTo(Resident::class);
    }

    /**
     * Get the personnel assigned to the ticket.
     */
    public function assignedPersonnel()
    {
        return $this->belongsTo(Personnel::class, 'assigned_personnel_id');
    }

    /**
     * Get the location associated with the ticket.
     */
    public function location()
    {
        return $this->hasOne(TicketLocation::class);
    }

    /**
     * Get the history records for the ticket.
     */
    public function history()
    {
        return $this->hasMany(TicketHistory::class);
    }

    /**
     * Get the attachments for the ticket.
     */
    public function attachments()
    {
        return $this->hasMany(TicketAttachment::class);
    }

    /**
     * Get the audit logs for the ticket.
     */
    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }
}
