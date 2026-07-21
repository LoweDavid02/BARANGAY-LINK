<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Ticket;
use App\Models\Personnel;
use App\Models\AuditLog;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get dashboard metrics for administrative overview.
     */
    public function metrics()
    {
        // Single query for all status counts (replaces 4 separate count queries)
        $statusCounts = Ticket::select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $totalTickets = $statusCounts->sum();
        $submitted = $statusCounts->get('Submitted', 0);
        $inProgress = $statusCounts->get('In Progress', 0);
        $resolved = ($statusCounts->get('Resolved', 0)) + ($statusCounts->get('Completed', 0));
        
        // Department counts
        $byDepartment = Ticket::select('department', DB::raw('count(*) as total'))
            ->groupBy('department')
            ->pluck('total', 'department');
            
        // Priority counts
        $byPriority = Ticket::select('priority', DB::raw('count(*) as total'))
            ->groupBy('priority')
            ->pluck('total', 'priority');
            
        // Single query for personnel counts (replaces 2 separate count queries)
        $personnelStatusCounts = Personnel::select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $personnelCount = $personnelStatusCounts->sum();
        $busyPersonnel = ($personnelStatusCounts->get('Busy', 0)) + ($personnelStatusCounts->get('Full', 0));
        
        // Recent activity
        $recentTickets = Ticket::with(['resident', 'location'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
            
        $recentLogs = AuditLog::orderBy('timestamp', 'desc')
            ->limit(5)
            ->get();


        $data = [
            'tickets' => [
                'total' => $totalTickets,
                'submitted' => $submitted,
                'in_progress' => $inProgress,
                'resolved' => $resolved,
            ],
            'by_department' => $byDepartment,
            'by_priority' => $byPriority,
            'personnel' => [
                'total' => $personnelCount,
                'busy' => $busyPersonnel,
                'available' => $personnelCount - $busyPersonnel,
            ],
            'recent_tickets' => $recentTickets,
            'recent_logs' => $recentLogs
        ];

        return response()->json($data);
    }
}
