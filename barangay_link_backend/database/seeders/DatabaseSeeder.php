<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use Illuminate\Support\Facades\Hash;
use App\Models\Personnel;
use App\Models\Resident;
use App\Models\Ticket;
use App\Models\TicketLocation;
use App\Models\TicketHistory;
use App\Models\AuditLog;
use App\Models\Notification;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Admin
        $admin = User::create([
            'name' => 'Admin Officer',
            'email' => 'admin@example.com',
            'phone' => '+63 900 123 4567',
            'password' => Hash::make('admin123'),
            'user_type' => 'admin',
            'role' => 'Barangay Admin',
            'avatar_url' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
            'email_notifications_enabled' => true,
        ]);

        // 2. Seed Personnel Users & Personnel Profiles
        $p1User = User::create([
            'name' => 'Marcus Sterling',
            'email' => 'm.sterling@barangaylink.gov',
            'phone' => '+63 917 777 8888',
            'password' => Hash::make('personnel123'),
            'user_type' => 'personnel',
            'role' => 'Lead Field Engineer',
            'avatar_url' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
            'email_notifications_enabled' => true,
        ]);
        $p1 = Personnel::create([
            'user_id' => $p1User->id,
            'status' => 'Busy',
            'rating' => 4.8,
            'detailed_role' => 'Lead Field Engineer',
            'active_tickets_count' => 2,
        ]);

        $p2User = User::create([
            'name' => 'Elena Santos',
            'email' => 'e.santos@barangaylink.gov',
            'phone' => '+63 920 888 9999',
            'password' => Hash::make('personnel123'),
            'user_type' => 'personnel',
            'role' => 'Desk Relations Officer',
            'avatar_url' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
            'email_notifications_enabled' => true,
        ]);
        $p2 = Personnel::create([
            'user_id' => $p2User->id,
            'status' => 'Available',
            'rating' => 4.9,
            'detailed_role' => 'Desk Relations Officer',
            'active_tickets_count' => 1,
        ]);

        $p3User = User::create([
            'name' => 'Ramon Valenzuela',
            'email' => 'r.valenzuela@barangaylink.gov',
            'phone' => '+63 909 333 4444',
            'password' => Hash::make('personnel123'),
            'user_type' => 'personnel',
            'role' => 'Public Safety Officer',
            'avatar_url' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
            'email_notifications_enabled' => true,
        ]);
        $p3 = Personnel::create([
            'user_id' => $p3User->id,
            'status' => 'Available',
            'rating' => 4.7,
            'detailed_role' => 'Public Safety Officer',
            'active_tickets_count' => 0,
        ]);

        $p4User = User::create([
            'name' => 'Clara Gatchalian',
            'email' => 'c.gatchalian@barangaylink.gov',
            'phone' => '+63 945 555 6666',
            'password' => Hash::make('personnel123'),
            'user_type' => 'personnel',
            'role' => 'Sanitation Coordinator',
            'avatar_url' => 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
            'email_notifications_enabled' => true,
        ]);
        $p4 = Personnel::create([
            'user_id' => $p4User->id,
            'status' => 'Available',
            'rating' => 4.6,
            'detailed_role' => 'Sanitation Coordinator',
            'active_tickets_count' => 0,
        ]);

        // 3. Seed Residents
        $res1 = Resident::create([
            'name' => 'Maria Santos',
            'email' => 'maria.santos@example.com',
            'phone' => '+63 917 123 4567',
        ]);
        $res2 = Resident::create([
            'name' => 'Juan Dela Cruz',
            'email' => 'juan.dc@example.com',
            'phone' => '+63 920 456 7890',
        ]);
        $res3 = Resident::create([
            'name' => 'Pedro Penduko',
            'email' => 'pedro.p@example.com',
            'phone' => '+63 908 765 4321',
        ]);
        $res4 = Resident::create([
            'name' => 'Sarah Lim',
            'email' => 'sarah.lim@example.com',
            'phone' => '+63 945 999 8888',
        ]);

        // 4. Seed Tickets, Locations, histories
        // Ticket 1: Street Light Repair
        $t1 = Ticket::create([
            'id' => 'TC-2026-00042', // modified format to string
            'category' => 'Complaint',
            'department' => 'Infrastructure',
            'subject' => 'Street Light Repair',
            'description' => 'Multiple residents reported a malfunctioning street light at the corner of Oak Drive and Pine Lane in Green Valley, Sector 4. The unit flickers intermittently throughout the night, causing poor visibility for motorists and pedestrians. Local residents have noted this as a safety concern due to the high volume of traffic during evening hours.',
            'status' => 'In Progress',
            'priority' => 'High',
            'progress' => 40,
            'asset_id' => 'SL-992-GV',
            'last_inspection' => 'Mar 12, 2024',
            'source' => 'Mobile App',
            'resident_id' => $res1->id,
            'assigned_personnel_id' => $p1->id,
        ]);
        TicketLocation::create([
            'ticket_id' => $t1->id,
            'latitude' => 14.9490,
            'longitude' => 120.7608,
            'address' => 'Main St. Corner 4th Ave',
        ]);
        TicketHistory::create([
            'ticket_id' => $t1->id,
            'action_date' => '2026-07-10 10:30:00',
            'action' => 'Ticket Submitted',
            'performed_by' => 'Maria Santos (Resident)',
        ]);
        TicketHistory::create([
            'ticket_id' => $t1->id,
            'action_date' => '2026-07-11 09:15:00',
            'action' => 'Assigned to Marcus Sterling',
            'performed_by' => 'Admin Officer',
        ]);
        TicketHistory::create([
            'ticket_id' => $t1->id,
            'action_date' => '2026-07-11 14:00:00',
            'action' => 'Status updated to In Progress',
            'performed_by' => 'Marcus Sterling',
        ]);

        // Ticket 2: Main Line Leakage
        $t2 = Ticket::create([
            'id' => 'TC-2026-00015',
            'category' => 'General Concern',
            'department' => 'Infrastructure',
            'subject' => 'Main Line Leakage',
            'description' => 'Major mainline pipe leak reported. Water bubbling through road pavement causing erosion and potential safety issue for vehicles.',
            'status' => 'Submitted',
            'priority' => 'High',
            'progress' => 10,
            'asset_id' => 'WL-551-RD',
            'last_inspection' => 'Jan 10, 2024',
            'source' => 'Web Portal',
            'resident_id' => $res2->id,
            'assigned_personnel_id' => null,
        ]);
        TicketLocation::create([
            'ticket_id' => $t2->id,
            'latitude' => 14.9472,
            'longitude' => 120.7589,
            'address' => 'Lincoln Residential District',
        ]);
        TicketHistory::create([
            'ticket_id' => $t2->id,
            'action_date' => '2026-07-12 15:20:00',
            'action' => 'Ticket Submitted',
            'performed_by' => 'Juan Dela Cruz (Resident)',
        ]);

        // Ticket 3: Graffiti Removal
        $t3 = Ticket::create([
            'id' => 'TC-2026-00088',
            'category' => 'Service Request',
            'department' => 'Public Safety',
            'subject' => 'Graffiti Removal',
            'description' => 'Graffiti spray paint defaced the main brick sign of the park. Requires cleaning solvents and repainting.',
            'status' => 'In Progress',
            'priority' => 'Low',
            'progress' => 40,
            'asset_id' => 'PK-088-NG',
            'last_inspection' => 'Never',
            'source' => 'Citizen Report',
            'resident_id' => $res3->id,
            'assigned_personnel_id' => $p1->id,
        ]);
        TicketLocation::create([
            'ticket_id' => $t3->id,
            'latitude' => 14.9510,
            'longitude' => 120.7620,
            'address' => 'Heritage Park North Gate',
        ]);
        TicketHistory::create([
            'ticket_id' => $t3->id,
            'action_date' => '2026-07-08 20:10:00',
            'action' => 'Ticket Submitted',
            'performed_by' => 'Pedro Penduko (Resident)',
        ]);
        TicketHistory::create([
            'ticket_id' => $t3->id,
            'action_date' => '2026-07-09 08:30:00',
            'action' => 'Assigned to Marcus Sterling',
            'performed_by' => 'Admin Officer',
        ]);

        // Ticket 4: Illegal Dumping Report
        $t4 = Ticket::create([
            'id' => 'TC-2026-00112',
            'category' => 'Complaint',
            'department' => 'Sanitation',
            'subject' => 'Illegal Dumping Report',
            'description' => 'Unauthorized dumping of industrial waste and construction debris in empty lot behind warehouse.',
            'status' => 'Resolved',
            'priority' => 'Medium',
            'progress' => 100,
            'asset_id' => 'SN-112-IZ',
            'last_inspection' => 'Yesterday',
            'source' => 'Mobile App',
            'evidence_photo' => '/map_placeholder.png',
            'resident_id' => $res4->id,
            'assigned_personnel_id' => $p2->id,
        ]);
        TicketLocation::create([
            'ticket_id' => $t4->id,
            'latitude' => 14.9502,
            'longitude' => 120.7612,
            'address' => 'Industrial Zone, Lot B',
        ]);
        TicketHistory::create([
            'ticket_id' => $t4->id,
            'action_date' => '2026-07-13 08:00:00',
            'action' => 'Ticket Submitted',
            'performed_by' => 'Sarah Lim (Resident)',
        ]);
        TicketHistory::create([
            'ticket_id' => $t4->id,
            'action_date' => '2026-07-13 09:00:00',
            'action' => 'Assigned to Elena Santos',
            'performed_by' => 'Admin Officer',
        ]);
        TicketHistory::create([
            'ticket_id' => $t4->id,
            'action_date' => '2026-07-13 16:30:00',
            'action' => 'Status updated to Resolved: "Illegal dumping site cleared."',
            'performed_by' => 'Elena Santos',
        ]);

        // 5. Seed Audit Logs
        AuditLog::create([
            'ticket_id' => 'TC-2026-00112',
            'action' => 'Resolve',
            'details' => 'Elena Santos resolved illegal dumping concern at Industrial Zone, Lot B',
            'timestamp' => '2026-07-13 16:30:00',
            'user_name' => 'Elena Santos',
            'log_type' => 'success',
        ]);
        AuditLog::create([
            'ticket_id' => 'TC-2026-00042',
            'action' => 'Assign',
            'details' => 'Assigned Street Light Repair to Marcus Sterling',
            'timestamp' => '2026-07-11 09:15:00',
            'user_name' => 'Admin Officer',
            'log_type' => 'info',
        ]);
        AuditLog::create([
            'ticket_id' => 'TC-2026-00112',
            'action' => 'Create',
            'details' => 'Sarah Lim submitted Illegal Dumping Report',
            'timestamp' => '2026-07-13 08:00:00',
            'user_name' => 'Sarah Lim',
            'log_type' => 'info',
        ]);

        // 6. Seed Notifications
        Notification::create([
            'user_id' => $p1User->id,
            'notification_type' => 'urgent',
            'title' => 'Urgent Priority Change',
            'message' => 'Ticket #TC-2026-00042 (Street Light Repair) has been escalated to High Priority by Administrative Services.',
            'is_read' => false,
            'created_at' => now()->subMinutes(2),
        ]);
        Notification::create([
            'user_id' => $p1User->id,
            'notification_type' => 'assigned',
            'title' => 'New Ticket Assigned',
            'message' => 'You have been assigned to Street Light Repair in Main St. Corner 4th Ave.',
            'is_read' => false,
            'created_at' => now()->subMinutes(15),
        ]);
        Notification::create([
            'user_id' => $p2User->id,
            'notification_type' => 'status',
            'title' => 'Ticket Status Updated',
            'message' => 'Illegal Dumping Report has been marked as Resolved.',
            'is_read' => true,
            'created_at' => now()->subDay(),
        ]);
        Notification::create([
            'user_id' => $p1User->id,
            'notification_type' => 'assigned',
            'title' => 'New Ticket Assigned',
            'message' => 'You have been assigned to Graffiti Removal in Heritage Park North Gate.',
            'is_read' => false,
            'created_at' => now()->subMinutes(30),
        ]);
    }
}
