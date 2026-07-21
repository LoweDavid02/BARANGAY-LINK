<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\AuditLog;

class AuditLogController extends Controller
{
    /**
     * List all audit logs.
     */
    public function index()
    {
        $logs = AuditLog::with('ticket')->orderBy('timestamp', 'desc')->get();

        return response()->json($logs);
    }

    /**
     * Export audit logs.
     */
    public function export()
    {
        $csvHeader = ['ID', 'Ticket ID', 'Action', 'Details', 'Timestamp', 'Performed By', 'Log Type'];
        
        $callback = function() use ($csvHeader) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $csvHeader);
            
            foreach (AuditLog::orderBy('timestamp', 'desc')->cursor() as $log) {
                fputcsv($file, [
                    $log->id,
                    $log->ticket_id,
                    $log->action,
                    $log->details,
                    $log->timestamp,
                    $log->user_name,
                    $log->log_type
                ]);
            }
            fclose($file);
        };
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="audit_logs_' . date('Ymd_His') . '.csv"',
        ];
        
        return response()->stream($callback, 200, $headers);
    }
}
