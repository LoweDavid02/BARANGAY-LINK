<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['ticket_id', 'action', 'details', 'timestamp', 'user_name', 'log_type'])]
class AuditLog extends Model
{
    use HasFactory;

    protected static function booted()
    {
        $incrementVersion = function () {
            if (!\Illuminate\Support\Facades\Cache::has('audit_logs_version')) {
                \Illuminate\Support\Facades\Cache::forever('audit_logs_version', 2);
            } else {
                \Illuminate\Support\Facades\Cache::increment('audit_logs_version');
            }
        };

        static::saved($incrementVersion);
        static::deleted($incrementVersion);
    }

    /**
     * Get the ticket associated with this audit log.
     */
    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }
}
