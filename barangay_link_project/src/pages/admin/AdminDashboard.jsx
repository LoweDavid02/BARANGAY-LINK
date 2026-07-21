import React from 'react';
import { useTickets } from '../../context/TicketContext';
import { 
  CheckCircle,
  Inbox,
  Users,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import DashboardMap from '../../components/DashboardMap';

const AdminDashboard = () => {
  const { tickets, personnel, setCurrentRoute, currentUser } = useTickets();

  // Dynamic calculations
  const openTicketsCount = tickets.filter(t => t.status !== 'Completed' && t.status !== 'Resolved' && t.status !== 'Closed' && t.status !== 'Cancelled').length;
  const activePersonnelCount = personnel ? personnel.length : 34;
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const resolvedThisMonthCount = tickets.filter(t => {
    if (t.status === 'Resolved' || t.status === 'Completed' || t.status === 'Closed') {
      const d = new Date(t.updated_at || t.dateSubmitted);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }
    return false;
  }).length;

  // Date Formatting for Welcome Text
  const today = new Date();
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString(undefined, dateOptions);
  
  const getGreeting = () => {
    const hour = today.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = currentUser?.name?.split(' ')[0] || 'Juan';

  // Time-ago helper
  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const now = new Date();
    const past = new Date(dateStr);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays}d ago`;
  };

  // Status pill styling
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Submitted':
      case 'Needs Attention':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'Assigned':
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Resolved':
      case 'Completed':
        return 'bg-slate-100 text-slate-600 border border-slate-200';
      default:
        return 'bg-amber-50 text-amber-700 border border-amber-200';
    }
  };

  const getStatusLabel = (status) => {
    if (status === 'Submitted' || status === 'Needs Attention') return 'New';
    if (status === 'Assigned') return 'In review';
    return status;
  };

  // Get newest tickets (any status) for the list
  const recentTickets = [...tickets]
    .sort((a, b) => new Date(b.created_at || b.dateSubmitted) - new Date(a.created_at || a.dateSubmitted))
    .slice(0, 6);

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* 1. WELCOME HEADER */}
      <div className="space-y-1">
        <h2 className="font-heading font-extrabold text-2xl tracking-tight text-slate-900">
          {getGreeting()}, {userName}
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          {formattedDate} — here's what's happening across the barangay today.
        </p>
      </div>

      {/* 2. KPI CARDS (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* KPI 1: Open Tickets */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#FFF3E0] flex items-center justify-center shrink-0">
            <Inbox className="w-5 h-5 text-[#E8913A]" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-2xl text-slate-900 leading-none">
              {openTicketsCount}
            </h3>
            <span className="text-[12px] font-medium text-slate-400 block mt-0.5">Open tickets</span>
          </div>
        </div>

        {/* KPI 2: Active Personnel */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#EBF3FF] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-[#0B2545]" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-2xl text-slate-900 leading-none">
              {activePersonnelCount}
            </h3>
            <span className="text-[12px] font-medium text-slate-400 block mt-0.5">Active personnel</span>
          </div>
        </div>

        {/* KPI 3: Resolved This Month */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#E8F5E9] flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5 text-[#2E7D32]" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-2xl text-slate-900 leading-none">
              {resolvedThisMonthCount}
            </h3>
            <span className="text-[12px] font-medium text-slate-400 block mt-0.5">Resolved this month</span>
          </div>
        </div>
      </div>

      {/* 3. TICKET VOLUME DYNAMICS + CATEGORY BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left: Ticket Volume Dynamics Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h4 className="font-heading font-bold text-base text-slate-900">
                Ticket Volume Dynamics
              </h4>
              <p className="text-[12px] text-slate-400 font-medium mt-0.5">
                Submission trends over the last 30 days
              </p>
            </div>
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-colors cursor-pointer">
              Last 30 Days
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Bar Chart */}
          <div className="flex-1 flex items-end justify-between gap-1.5 min-h-[180px] pb-4">
            {[
              { value: 35, active: false },
              { value: 55, active: false },
              { value: 45, active: false },
              { value: 80, active: true },
              { value: 65, active: true },
              { value: 50, active: false },
              { value: 42, active: false },
              { value: 90, active: true },
              { value: 70, active: false },
              { value: 55, active: false },
              { value: 32, active: false },
              { value: 15, active: false },
            ].map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col justify-end items-center h-full group cursor-pointer">
                <div className="relative w-full flex justify-center">
                  <span className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow pointer-events-none z-10">
                    {Math.round(bar.value / 5)}
                  </span>
                </div>
                <div 
                  style={{ height: `${bar.value}%` }}
                  className={`w-[70%] rounded-t-sm transition-all duration-500
                    ${bar.active 
                      ? 'bg-[#1E293B] hover:bg-[#0F172A]' 
                      : 'bg-[#93C5FD] hover:bg-[#60A5FA] opacity-70'}`}
                />
              </div>
            ))}
          </div>

          {/* X-Axis */}
          <div className="flex justify-between px-1 pt-3 border-t border-slate-100 text-[10px] font-semibold text-slate-400 tracking-wide">
            <span>01 May</span>
            <span>07 May</span>
            <span>14 May</span>
            <span>21 May</span>
            <span>28 May</span>
          </div>
        </div>

        {/* Right: Category Breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <h4 className="font-heading font-bold text-base text-slate-900 mb-6">
            Category Breakdown
          </h4>

          <div className="space-y-6 flex-1 flex flex-col justify-center">
            {/* Complaints */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Complaints</span>
                <span className="text-slate-800 font-bold">42%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#1E5AE6] h-full rounded-full transition-all duration-1000" style={{ width: '42%' }} />
              </div>
            </div>

            {/* Service Requests */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Service Requests</span>
                <span className="text-slate-800 font-bold">28%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#C27852] h-full rounded-full transition-all duration-1000" style={{ width: '28%' }} />
              </div>
            </div>

            {/* General Concerns */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">General Concerns</span>
                <span className="text-slate-800 font-bold">15%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-slate-400 h-full rounded-full transition-all duration-1000" style={{ width: '15%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. BARANGAY SERVICE MAP */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 pt-5 pb-3">
          <h4 className="font-heading font-bold text-base text-slate-900">
            Barangay Service Map
          </h4>
          <p className="text-[12px] text-slate-400 font-medium mt-0.5">
            San Vicente, Apalit, Pampanga
          </p>
        </div>
        <DashboardMap tickets={tickets} />
      </div>

      {/* 4. NEW TICKETS — Card-style list rows (matching the design) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Section Header */}
        <div className="px-6 pt-5 pb-4 flex items-start justify-between">
          <div>
            <h4 className="font-heading font-bold text-base text-slate-900">
              New Tickets
            </h4>
            <p className="text-[12px] text-slate-400 font-medium mt-0.5">
              Recently submitted tickets awaiting review and assignment
            </p>
          </div>
          <button
            onClick={() => setCurrentRoute('admin-assign')}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0B2545] hover:bg-[#081d36] text-white text-xs font-bold rounded-full transition-all cursor-pointer shrink-0"
          >
            View All Tickets
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Ticket Rows */}
        <div className="divide-y divide-slate-100">
          {recentTickets.map((ticket) => (
            <div key={ticket.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors cursor-pointer group">
              
              {/* Ticket ID */}
              <span className="text-[12px] font-bold text-slate-400 w-14 shrink-0">
                #{ticket.id?.toString().replace(/\D/g, '').slice(-4) || '0000'}
              </span>
              
              {/* Subject & Requester */}
              <div className="flex-1 min-w-0">
                <h5 className="text-sm font-bold text-slate-800 truncate leading-snug">
                  {ticket.subject}
                </h5>
                <p className="text-[12px] text-slate-400 font-medium truncate mt-0.5">
                  {ticket.resident?.name || 'Resident'} · {ticket.location?.address || ticket.category || 'San Vicente'}
                </p>
              </div>

              {/* Status Pill */}
              <span className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${getStatusStyle(ticket.status)}`}>
                {getStatusLabel(ticket.status)}
              </span>

              {/* Timestamp */}
              <span className="text-[12px] text-slate-400 font-medium w-16 text-right shrink-0">
                {timeAgo(ticket.created_at || ticket.dateSubmitted)}
              </span>
            </div>
          ))}

          {recentTickets.length === 0 && (
            <div className="px-6 py-12 text-center text-slate-400 font-medium text-sm">
              No tickets at this time.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
