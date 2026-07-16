<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\User;
use App\Models\Resident;
use App\Models\Personnel;
use App\Models\Ticket;
use App\Models\TicketLocation;
use App\Models\TicketHistory;
use App\Models\AuditLog;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class TicketController extends Controller
{
    /**
     * Resident: Submit a new ticket/concern.
     */
    public function store(Request $request)
    {
        $request->validate([
            'category' => 'required|string|max:100',
            'department' => 'required|string|max:100',
            'subject' => 'required|string|max:255',
            'description' => 'required|string',
            'location' => 'required|array',
            'location.lat' => 'required|numeric',
            'location.lng' => 'required|numeric',
            'location.address' => 'required|string|max:255',
            'submitter' => 'required|array',
            'submitter.name' => 'required|string|max:255',
            'submitter.email' => 'required|email|max:255',
            'submitter.phone' => 'required|string|max:50',
            'asset_id' => 'nullable|string|max:100',
            'last_inspection' => 'nullable|string|max:100',
            'source' => 'nullable|string|max:100',
            'evidence_photo' => 'nullable|string|max:255',
        ]);

        return DB::transaction(function () use ($request) {
            // Find or create resident
            $resident = Resident::firstOrCreate(
                ['email' => $request->submitter['email']],
                [
                    'name' => $request->submitter['name'],
                    'phone' => $request->submitter['phone']
                ]
            );

            // Generate unique ticket ID: TC-2026-XXXXX
            do {
                $ticketId = 'TC-2026-' . rand(10000, 99999);
            } while (Ticket::where('id', $ticketId)->exists());

            // Create Ticket
            $ticket = Ticket::create([
                'id' => $ticketId,
                'category' => $request->category,
                'department' => $request->department,
                'subject' => $request->subject,
                'description' => $request->description,
                'status' => 'Submitted',
                'priority' => $request->priority ?? 'Medium',
                'progress' => 10,
                'asset_id' => $request->asset_id,
                'last_inspection' => $request->last_inspection,
                'source' => $request->source ?? 'Web Portal',
                'evidence_photo' => $request->evidence_photo,
                'resident_id' => $resident->id,
            ]);

            // Create Location
            TicketLocation::create([
                'ticket_id' => $ticketId,
                'latitude' => $request->location['lat'],
                'longitude' => $request->location['lng'],
                'address' => $request->location['address'],
            ]);

            // Create Initial History
            TicketHistory::create([
                'ticket_id' => $ticketId,
                'action' => 'Ticket Submitted',
                'performed_by' => $resident->name . ' (Resident)',
            ]);

            // Create Audit Log
            AuditLog::create([
                'ticket_id' => $ticketId,
                'action' => 'Create',
                'details' => $resident->name . ' submitted ticket: "' . $request->subject . '"',
                'user_name' => $resident->name,
                'log_type' => 'info',
            ]);

            // Notify Admins
            $admins = User::where('user_type', 'admin')->get();
            foreach ($admins as $admin) {
                Notification::create([
                    'user_id' => $admin->id,
                    'notification_type' => 'status',
                    'title' => 'New Ticket Submitted',
                    'message' => 'A new ticket "' . $request->subject . '" was submitted by ' . $resident->name,
                    'is_read' => false,
                ]);
            }

            // Send email to resident (use first admin's email as sender)
            try {
                $adminSender = User::where('user_type', 'admin')->first();
                $senderEmail = $adminSender ? $adminSender->email : config('mail.from.address');
                $senderName = 'Barangay Link - San Vicente';
                $recipientEmail = $resident->email;
                $subject = "Ticket #{$ticketId} Submitted Successfully";
                Mail::raw("Hello {$resident->name},\n\nYour ticket '{$ticket->subject}' has been successfully submitted to Barangay San Vicente, Apalit, Pampanga.\n\nYour Tracking ID: {$ticketId}\n\nYou can track the live status of your ticket anytime on our Resident Portal.\n\nThank you,\nBarangay Link Support Team", function ($message) use ($recipientEmail, $subject, $senderEmail, $senderName) {
                    $message->from($senderEmail, $senderName)->to($recipientEmail)->subject($subject);
                });
            } catch (\Exception $e) {
                \Log::error("Failed to send submission email to {$resident->email}: " . $e->getMessage());
            }

            return response()->json([
                'message' => 'Ticket submitted successfully',
                'ticket_id' => $ticketId
            ], 201);
        });
    }

    /**
     * Resident: Track a single ticket by ID.
     */
    public function track($id)
    {
        $ticket = Ticket::with(['resident', 'location', 'history' => function($q) {
            $q->orderBy('action_date', 'desc');
        }, 'attachments'])->find($id);

        if (!$ticket) {
            return response()->json(['message' => 'Ticket not found'], 404);
        }

        return response()->json($ticket);
    }

    /**
     * Resident: Search tickets by email or phone.
     */
    public function trackByContact(Request $request)
    {
        $request->validate([
            'contact' => 'required|string',
        ]);

        $contact = $request->contact;

        $tickets = Ticket::with(['resident', 'location', 'assignedPersonnel.user'])
            ->whereHas('resident', function ($query) use ($contact) {
                $query->where('email', $contact)->orWhere('phone', $contact);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($tickets);
    }

    /**
     * Resident: Verify and complete ticket.
     */
    public function verifyResolution($id, Request $request)
    {
        $ticket = Ticket::find($id);

        if (!$ticket) {
            return response()->json(['message' => 'Ticket not found'], 404);
        }

        return DB::transaction(function () use ($ticket, $request) {
            $oldStatus = $ticket->status;
            $ticket->status = 'Completed';
            $ticket->progress = 100;
            $ticket->save();

            // Create History
            TicketHistory::create([
                'ticket_id' => $ticket->id,
                'action' => 'Ticket verified & completed by the resident.',
                'performed_by' => $ticket->resident ? $ticket->resident->name . ' (Resident)' : 'Resident',
            ]);

            // Create Audit Log
            AuditLog::create([
                'ticket_id' => $ticket->id,
                'action' => 'Complete',
                'details' => 'Ticket verified & completed by the resident.',
                'user_name' => $ticket->resident ? $ticket->resident->name : 'Resident',
                'log_type' => 'success',
            ]);

            // Decrement workload of assigned personnel if any
            if ($ticket->assigned_personnel_id) {
                $personnel = Personnel::find($ticket->assigned_personnel_id);
                if ($personnel) {
                    $personnel->active_tickets_count = max(0, $personnel->active_tickets_count - 1);
                    $personnel->status = $this->calculatePersonnelStatus($personnel->active_tickets_count);
                    $personnel->save();

                    // Notify Assigned Personnel
                    Notification::create([
                        'user_id' => $personnel->user_id,
                        'notification_type' => 'status',
                        'title' => 'Ticket Completed',
                        'message' => 'Ticket ' . $ticket->id . ' has been verified & completed by the resident.',
                        'is_read' => false,
                    ]);
                }
            }

            return response()->json(['message' => 'Ticket completed successfully', 'ticket' => $ticket]);
        });
    }

    /**
     * Admin: List all tickets.
     */
    public function index(Request $request)
    {
        $query = Ticket::with(['resident', 'location', 'assignedPersonnel.user', 'history' => function($q) {
            $q->orderBy('action_date', 'desc');
        }]);

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('priority') && $request->priority !== 'all') {
            $query->where('priority', $request->priority);
        }

        $tickets = $query->orderBy('created_at', 'desc')->get();

        return response()->json($tickets);
    }

    /**
     * Admin: Assign personnel to ticket.
     */
    public function assign($id, Request $request)
    {
        $request->validate([
            'personnel_id' => 'nullable|exists:personnels,id',
        ]);

        $ticket = Ticket::find($id);

        if (!$ticket) {
            return response()->json(['message' => 'Ticket not found'], 404);
        }

        return DB::transaction(function () use ($ticket, $request) {
            $oldPersonnelId = $ticket->assigned_personnel_id;
            $newPersonnelId = $request->personnel_id;

            if ($oldPersonnelId == $newPersonnelId) {
                return response()->json($ticket);
            }

            // Update ticket
            $ticket->assigned_personnel_id = $newPersonnelId;
            
            if ($newPersonnelId) {
                if ($ticket->status === 'Submitted') {
                    $ticket->status = 'Assigned';
                }
                if ($ticket->progress < 20) {
                    $ticket->progress = 20;
                }
            } else {
                $ticket->status = 'Submitted';
                $ticket->progress = 10;
            }
            $ticket->save();

            // Handle Personnel workload updates
            if ($oldPersonnelId) {
                $oldPersonnel = Personnel::find($oldPersonnelId);
                if ($oldPersonnel) {
                    $oldPersonnel->active_tickets_count = max(0, $oldPersonnel->active_tickets_count - 1);
                    $oldPersonnel->status = $this->calculatePersonnelStatus($oldPersonnel->active_tickets_count);
                    $oldPersonnel->save();
                }
            }

            if ($newPersonnelId) {
                $newPersonnel = Personnel::with('user')->find($newPersonnelId);
                if ($newPersonnel) {
                    $newPersonnel->active_tickets_count += 1;
                    $newPersonnel->status = $this->calculatePersonnelStatus($newPersonnel->active_tickets_count);
                    $newPersonnel->save();

                    // Create History
                    TicketHistory::create([
                        'ticket_id' => $ticket->id,
                        'action' => 'Assigned to ' . $newPersonnel->user->name,
                        'performed_by' => 'Admin Officer',
                    ]);

                    // Create Audit Log
                    AuditLog::create([
                        'ticket_id' => $ticket->id,
                        'action' => 'Assign',
                        'details' => 'Assigned Ticket ' . $ticket->id . ' to ' . $newPersonnel->user->name,
                        'user_name' => 'Admin Officer',
                        'log_type' => 'info',
                    ]);

                    // Notify Personnel
                    Notification::create([
                        'user_id' => $newPersonnel->user_id,
                        'notification_type' => 'assigned',
                        'title' => 'New Ticket Assigned',
                        'message' => 'You have been assigned to "' . $ticket->subject . '" in ' . ($ticket->location ? $ticket->location->address : 'N/A'),
                        'is_read' => false,
                    ]);

                    // Send email to resident on assignment
                    try {
                        $resident = $ticket->resident;
                        if ($resident && $resident->email) {
                            $senderEmail = config('mail.from.address');
                            $senderName = 'Barangay Link - San Vicente';
                            $recipientEmail = $resident->email;
                            $subject = "Ticket #{$ticket->id} Assigned";
                            Mail::raw("Hello {$resident->name},\n\nYour ticket #{$ticket->id} has been assigned to a field officer and is now being processed.\n\nAssigned Personnel: {$newPersonnel->user->name}\nNew Status: Assigned\n\nYou can track the live progress of your ticket anytime on our Resident Portal.\n\nThank you,\nBarangay Link Support Team", function ($message) use ($recipientEmail, $subject, $senderEmail, $senderName) {
                                $message->from($senderEmail, $senderName)
                                        ->to($recipientEmail)
                                        ->subject($subject);
                            });
                        }
                    } catch (\Exception $e) {
                        \Log::error("Failed to send assignment email: " . $e->getMessage());
                    }
                }
            } else {
                // Create History for unassignment
                TicketHistory::create([
                    'ticket_id' => $ticket->id,
                    'action' => 'Unassigned ticket',
                    'performed_by' => 'Admin Officer',
                ]);

                // Create Audit Log
                AuditLog::create([
                    'ticket_id' => $ticket->id,
                    'action' => 'Assign',
                    'details' => 'Unassigned Ticket ' . $ticket->id,
                    'user_name' => 'Admin Officer',
                    'log_type' => 'info',
                ]);
            }

            // Dispatch Real-time Event
            event(new \App\Events\TicketUpdated($ticket));

            return response()->json($ticket->load(['assignedPersonnel.user', 'history']));
        });
    }

    /**
     * Admin/Personnel: Update status/priority/progress/notes.
     */
    public function updateStatus($id, Request $request)
    {
        $request->validate([
            'status' => 'nullable|string|in:Submitted,Assigned,Pending,In Progress,Resolved,Completed,Cancelled',
            'priority' => 'nullable|string|in:Low,Medium,High,Urgent',
            'progress' => 'nullable|integer|between:0,100',
            'comment' => 'nullable|string',
            'evidence_photo' => 'nullable|string',
        ]);

        $ticket = Ticket::find($id);

        if (!$ticket) {
            return response()->json(['message' => 'Ticket not found'], 404);
        }

        $user = Auth::user();
        $performedBy = $user ? $user->name . ' (' . ucfirst($user->user_type) . ')' : 'Admin Officer';

        return DB::transaction(function () use ($ticket, $request, $performedBy) {
            $changes = [];

            if ($request->has('status')) {
                $oldStatus = $ticket->status;
                $ticket->status = $request->status;
                
                if ($request->status === 'Resolved' || $request->status === 'Completed') {
                    $ticket->progress = 100;
                } elseif ($request->status === 'Cancelled') {
                    $ticket->progress = 0;
                } elseif ($request->status === 'In Progress' && $ticket->progress < 30) {
                    $ticket->progress = 30;
                }
                
                $changes[] = 'Status updated to ' . $request->status . ($request->comment ? ': "' . $request->comment . '"' : '');
                
                // If status transitions to Completed/Resolved/Cancelled, decrement workload of personnel
                if (in_array($request->status, ['Resolved', 'Completed', 'Cancelled']) && !in_array($oldStatus, ['Resolved', 'Completed', 'Cancelled']) && $ticket->assigned_personnel_id) {
                    $personnel = Personnel::find($ticket->assigned_personnel_id);
                    if ($personnel) {
                        $personnel->active_tickets_count = max(0, $personnel->active_tickets_count - 1);
                        $personnel->status = $this->calculatePersonnelStatus($personnel->active_tickets_count);
                        $personnel->save();
                    }
                }
            }

            if ($request->has('priority')) {
                $ticket->priority = $request->priority;
                $changes[] = 'Priority updated to ' . $request->priority;
            }

            if ($request->has('progress') && !$request->has('status')) {
                $ticket->progress = $request->progress;
                if ($request->progress == 100) {
                    $ticket->status = 'Resolved';
                }
                $changes[] = 'Progress updated to ' . $request->progress . '%';
            }

            if ($request->has('evidence_photo')) {
                $ticket->evidence_photo = $request->evidence_photo;
            }

            $ticket->save();

            // Record Histories & Audit Logs
            foreach ($changes as $change) {
                TicketHistory::create([
                    'ticket_id' => $ticket->id,
                    'action' => $change,
                    'performed_by' => $performedBy,
                ]);

                AuditLog::create([
                    'ticket_id' => $ticket->id,
                    'action' => 'Status Change',
                    'details' => 'Ticket ' . $ticket->id . ': ' . $change,
                    'user_name' => $performedBy,
                    'log_type' => 'info',
                ]);
            }

            // Create notification if status changed
            if ($request->has('status')) {
                // If resolved or completed, notify submitter (resident) in real life. Here we also notify admin/personnel
                $notifyUser = null;
                if (Auth::user() && Auth::user()->user_type === 'personnel') {
                    // Notify admins
                    $admins = User::where('user_type', 'admin')->get();
                    foreach ($admins as $admin) {
                        Notification::create([
                            'user_id' => $admin->id,
                            'notification_type' => 'status',
                            'title' => 'Ticket Updated',
                            'message' => 'Ticket ' . $ticket->id . ' status updated to ' . $ticket->status . ' by ' . Auth::user()->name,
                            'is_read' => false,
                        ]);
                    }
                }
            }

            // Send email to resident on status update (use logged-in user's email as sender)
            try {
                $resident = $ticket->resident;
                if ($resident && $resident->email && $request->has('status')) {
                    $user = Auth::user();
                    $senderEmail = $user ? $user->email : config('mail.from.address');
                    $senderName = 'Barangay Link - San Vicente';
                    $recipientEmail = $resident->email;
                    $subject = "Ticket #{$ticket->id} Status Updated";
                    $details = $request->comment ? $request->comment : 'Status changed to ' . $request->status;
                    Mail::raw("Hello {$resident->name},\n\nYour ticket #{$ticket->id} has been updated by the Barangay Team.\n\nNew Status: {$ticket->status}\nDetails: {$details}\n\nYou can track the live progress of your ticket anytime on our Resident Portal.\n\nThank you,\nBarangay Link Support Team", function ($message) use ($recipientEmail, $subject, $senderEmail, $senderName, $user) {
                        $message->from(config('mail.from.address'), config('mail.from.name'))
                                ->replyTo($senderEmail, $user ? $user->name : $senderName)
                                ->to($recipientEmail)
                                ->subject($subject);
                    });
                }
            } catch (\Exception $e) {
                \Log::error("Failed to send status update email: " . $e->getMessage());
            }

            // Dispatch Real-time Event
            event(new \App\Events\TicketUpdated($ticket));

            return response()->json($ticket->load(['assignedPersonnel.user', 'history']));
        });
    }

    /**
     * Personnel: List assigned tickets.
     */
    public function personnelTickets()
    {
        $user = Auth::user();
        if (!$user || $user->user_type !== 'personnel' || !$user->personnel) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $tickets = Ticket::with(['resident', 'location', 'assignedPersonnel.user', 'history' => function($q) {
            $q->orderBy('action_date', 'desc');
        }])
        ->where('assigned_personnel_id', $user->personnel->id)
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json($tickets);
    }

    /**
     * Personnel: Start ticket work.
     */
    public function startTicket($id)
    {
        $ticket = Ticket::find($id);

        if (!$ticket) {
            return response()->json(['message' => 'Ticket not found'], 404);
        }

        $user = Auth::user();
        if (!$user || !$user->personnel || $ticket->assigned_personnel_id !== $user->personnel->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return DB::transaction(function () use ($ticket, $user) {
            $ticket->status = 'In Progress';
            $ticket->progress = 30;
            $ticket->save();

            TicketHistory::create([
                'ticket_id' => $ticket->id,
                'action' => 'Work started on this ticket.',
                'performed_by' => $user->name,
            ]);

            AuditLog::create([
                'ticket_id' => $ticket->id,
                'action' => 'Status Change',
                'details' => $user->name . ' started work on Ticket ' . $ticket->id,
                'user_name' => $user->name,
                'log_type' => 'info',
            ]);

            return response()->json($ticket->load('history'));
        });
    }

    /**
     * Personnel: Update ticket progress.
     */
    public function updateProgress($id, Request $request)
    {
        $request->validate([
            'progress' => 'required|integer|between:0,100',
        ]);

        $ticket = Ticket::find($id);

        if (!$ticket) {
            return response()->json(['message' => 'Ticket not found'], 404);
        }

        $user = Auth::user();
        if (!$user || !$user->personnel || $ticket->assigned_personnel_id !== $user->personnel->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return DB::transaction(function () use ($ticket, $request, $user) {
            $ticket->progress = $request->progress;
            $action = 'Progress updated to ' . $request->progress . '%';
            
            if ($request->progress == 100) {
                $ticket->status = 'Resolved';
                $action = 'Work completed. Ticket status updated to Resolved.';

                // Decrement active tickets workload
                $personnel = $user->personnel;
                $personnel->active_tickets_count = max(0, $personnel->active_tickets_count - 1);
                $personnel->status = $this->calculatePersonnelStatus($personnel->active_tickets_count);
                $personnel->save();

                // Notify Admin
                $admins = User::where('user_type', 'admin')->get();
                foreach ($admins as $admin) {
                    Notification::create([
                        'user_id' => $admin->id,
                        'notification_type' => 'status',
                        'title' => 'Ticket Resolved',
                        'message' => 'Ticket ' . $ticket->id . ' has been marked as Resolved by ' . $user->name,
                        'is_read' => false,
                    ]);
                }
            }
            $ticket->save();

            TicketHistory::create([
                'ticket_id' => $ticket->id,
                'action' => $action,
                'performed_by' => $user->name,
            ]);

            AuditLog::create([
                'ticket_id' => $ticket->id,
                'action' => 'Status Change',
                'details' => $user->name . ' updated Ticket ' . $ticket->id . ': ' . $action,
                'user_name' => $user->name,
                'log_type' => 'info',
            ]);

            return response()->json($ticket->load('history'));
        });
    }

    /**
     * Personnel: Add timeline note.
     */
    public function addNote($id, Request $request)
    {
        $request->validate([
            'note' => 'required|string',
        ]);

        $ticket = Ticket::find($id);

        if (!$ticket) {
            return response()->json(['message' => 'Ticket not found'], 404);
        }

        $user = Auth::user();
        $performedBy = $user ? $user->name : 'System';

        TicketHistory::create([
            'ticket_id' => $ticket->id,
            'action' => 'Internal Note Added: "' . $request->note . '"',
            'performed_by' => $performedBy,
        ]);

        AuditLog::create([
            'ticket_id' => $ticket->id,
            'action' => 'Status Change',
            'details' => $performedBy . ' added note to Ticket ' . $ticket->id . ': "' . $request->note . '"',
            'user_name' => $performedBy,
            'log_type' => 'info',
        ]);

        return response()->json(['message' => 'Note added successfully']);
    }

    /**
     * Personnel: Escalate ticket.
     */
    public function escalate($id)
    {
        $ticket = Ticket::find($id);

        if (!$ticket) {
            return response()->json(['message' => 'Ticket not found'], 404);
        }

        $user = Auth::user();
        if (!$user || !$user->personnel || $ticket->assigned_personnel_id !== $user->personnel->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return DB::transaction(function () use ($ticket, $user) {
            $ticket->priority = 'Urgent';
            $ticket->save();

            TicketHistory::create([
                'ticket_id' => $ticket->id,
                'action' => 'Ticket Escalated: Dispatched urgent notice to Barangay Engineering Board.',
                'performed_by' => $user->name,
            ]);

            AuditLog::create([
                'ticket_id' => $ticket->id,
                'action' => 'Status Change',
                'details' => $user->name . ' escalated Ticket ' . $ticket->id . ' to Urgent priority.',
                'user_name' => $user->name,
                'log_type' => 'warning',
            ]);

            // Notify Admins
            $admins = User::where('user_type', 'admin')->get();
            foreach ($admins as $admin) {
                Notification::create([
                    'user_id' => $admin->id,
                    'notification_type' => 'urgent',
                    'title' => 'Urgent Priority Change',
                    'message' => 'Ticket #' . $ticket->id . ' has been escalated to Urgent priority by ' . $user->name,
                    'is_read' => false,
                ]);
            }

            return response()->json($ticket->load('history'));
        });
    }

    /**
     * Admin: Delete ticket.
     */
    public function destroy($id)
    {
        $ticket = Ticket::find($id);

        if (!$ticket) {
            return response()->json(['message' => 'Ticket not found'], 404);
        }

        return DB::transaction(function () use ($ticket) {
            // Re-adjust personnel workload
            if ($ticket->assigned_personnel_id) {
                $personnel = Personnel::find($ticket->assigned_personnel_id);
                if ($personnel) {
                    $personnel->active_tickets_count = max(0, $personnel->active_tickets_count - 1);
                    $personnel->status = $this->calculatePersonnelStatus($personnel->active_tickets_count);
                    $personnel->save();
                }
            }

            AuditLog::create([
                'ticket_id' => null,
                'action' => 'Delete',
                'details' => 'Deleted ticket: "' . $ticket->subject . '" (ID: ' . $ticket->id . ')',
                'user_name' => 'Admin Officer',
                'log_type' => 'warning',
            ]);

            $ticket->delete();

            return response()->json(['message' => 'Ticket deleted successfully']);
        });
    }

    /**
     * Utility method to determine personnel availability status based on active ticket load.
     */
    private function calculatePersonnelStatus($count)
    {
        if ($count >= 3) {
            return 'Full';
        } elseif ($count > 0) {
            return 'Busy';
        }
        return 'Available';
    }
}
