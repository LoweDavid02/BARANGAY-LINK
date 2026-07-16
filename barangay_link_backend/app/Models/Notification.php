<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['user_id', 'notification_type', 'title', 'message', 'is_read'])]
class Notification extends Model
{
    use HasFactory;

    /**
     * Get the user associated with this notification.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
