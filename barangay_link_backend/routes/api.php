<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\PersonnelController;
use App\Http\Controllers\DashboardController;

// Health check endpoint (no auth required, lightweight)
Route::get('/health', function () {
    try {
        // Quick DB check
        \DB::select('SELECT 1');
        return response()->json([
            'status' => 'ok',
            'database' => 'connected',
            'timestamp' => now()->toISOString(),
        ], 200);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'database' => 'disconnected',
            'error' => config('app.debug') ? $e->getMessage() : 'Database error',
            'timestamp' => now()->toISOString(),
        ], 503);
    }
});

// Public routes
Route::middleware('throttle:login')->post('/auth/login', [AuthController::class, 'login']);
Route::middleware('throttle:login')->post('/auth/google', [AuthController::class, 'googleLogin']);

// Resident Portal routes (Public)
Route::middleware('throttle:tickets_store')->post('/tickets', [TicketController::class, 'store']);

Route::middleware('throttle:api')->group(function () {
    Route::get('/tickets/track/{id}', [TicketController::class, 'track']);
    Route::get('/tickets/track-by-contact', [TicketController::class, 'trackByContact']);
    Route::post('/tickets/{id}/verify', [TicketController::class, 'verifyResolution']);
});

// Protected routes
Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    // Auth profile
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Admin center
    Route::get('/admin/metrics', [DashboardController::class, 'metrics']);
    Route::get('/admin/tickets', [TicketController::class, 'index']);
    Route::post('/admin/tickets/{id}/assign', [TicketController::class, 'assign']);
    Route::post('/admin/tickets/{id}/status', [TicketController::class, 'updateStatus']);
    Route::delete('/admin/tickets/{id}', [TicketController::class, 'destroy']);
    Route::get('/admin/personnel', [PersonnelController::class, 'index']);
    Route::post('/admin/personnel', [PersonnelController::class, 'store']);
    Route::delete('/admin/personnel/{id}', [PersonnelController::class, 'destroy']);
    Route::get('/admin/audit-logs', [AuditLogController::class, 'index']);
    Route::get('/admin/audit-logs/export', [AuditLogController::class, 'export']);

    // Personnel center
    Route::get('/personnel/tickets', [TicketController::class, 'personnelTickets']);
    Route::post('/personnel/tickets/{id}/start', [TicketController::class, 'startTicket']);
    Route::post('/personnel/tickets/{id}/update', [TicketController::class, 'updateProgress']);
    Route::post('/personnel/tickets/{id}/note', [TicketController::class, 'addNote']);
    Route::post('/personnel/tickets/{id}/escalate', [TicketController::class, 'escalate']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/bulk-read', [NotificationController::class, 'bulkRead']);
    Route::post('/notifications/bulk-unread', [NotificationController::class, 'bulkUnread']);
    Route::post('/notifications/{id}/dismiss', [NotificationController::class, 'dismiss']);
});
