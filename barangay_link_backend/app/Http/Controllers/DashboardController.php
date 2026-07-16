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
        $totalTickets = Ticket::count();
        $submitted = Ticket::where('status', 'Submitted')->count();
        $inProgress = Ticket::where('status', 'In Progress')->count();
        $resolved = Ticket::whereIn('status', ['Resolved', 'Completed'])->count();
        
        // Department counts
        $byDepartment = Ticket::select('department', DB::raw('count(*) as total'))
            ->groupBy('department')
            ->pluck('total', 'department');
            
        // Priority counts
        $byPriority = Ticket::select('priority', DB::raw('count(*) as total'))
            ->groupBy('priority')
            ->pluck('total', 'priority');
            
        // Active personnel workload status
        $personnelCount = Personnel::count();
        $busyPersonnel = Personnel::whereIn('status', ['Busy', 'Full'])->count();
        
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
