<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Notification;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * List current user's notifications.
     */
    public function index()
    {
        $notifications = Notification::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($notifications);
    }

    /**
     * Mark selected or all notifications as read.
     */
    public function bulkRead(Request $request)
    {
        $query = Notification::where('user_id', Auth::id());

        if ($request->has('ids') && is_array($request->ids)) {
            $query->whereIn('id', $request->ids);
        }

        $query->update(['is_read' => true]);

        return response()->json(['message' => 'Notifications marked as read']);
    }

    /**
     * Mark selected or all notifications as unread.
     */
    public function bulkUnread(Request $request)
    {
        $query = Notification::where('user_id', Auth::id());

        if ($request->has('ids') && is_array($request->ids)) {
            $query->whereIn('id', $request->ids);
        }

        $query->update(['is_read' => false]);

        return response()->json(['message' => 'Notifications marked as unread']);
    }

    /**
     * Dismiss (delete) a single notification.
     */
    public function dismiss($id)
    {
        $notification = Notification::where('user_id', Auth::id())->find($id);

        if (!$notification) {
            return response()->json(['message' => 'Notification not found'], 404);
        }

        $notification->delete();

        return response()->json(['message' => 'Notification dismissed successfully']);
    }
}
