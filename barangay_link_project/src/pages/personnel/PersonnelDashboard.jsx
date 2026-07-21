import React, { useState } from 'react';
import { useTickets } from '../../context/TicketContext';
import { 
  CheckCircle,
  Inbox,
  Users,
  ArrowRight,
  Check,
  X,
  Activity,
  AlertTriangle,
  MapPin,
  Calendar,
  Info,
  TrendingUp,
  Play
} from 'lucide-react';
import DashboardMap from '../../components/DashboardMap';

const PersonnelDashboard = () => {
  const { tickets, updateTicketStatus, currentUser, setCurrentRoute, personnel } = useTickets();
  const [toastMessage, setToastMessage] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);

  // Dynamic calculations — same as Admin
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

  const today = new Date();
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString(undefined, dateOptions);
  
  const getGreeting = () => {
    const hour = today.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = currentUser?.name?.split(' ')[0] || 'Personnel';

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handleStartTask = async (taskId) => {
    if (updateTicketStatus) {
      await updateTicketStatus(taskId, 'In Progress', currentUser?.name || 'Field Officer', 'Work started via Dashboard.');
    }
    triggerToast(`Task #${taskId} started successfully!`);
    setSelectedTask(null);
  };

  // Maps API ticket to modal view task structure
  const getTaskDetails = (ticket) => {
    let priorityColor = 'bg-slate-50 text-slate-500 border-slate-100';
    if (ticket.priority === 'Urgent') priorityColor = 'bg-red-50 text-red-600 border-red-100';
    else if (ticket.priority === 'High') priorityColor = 'bg-orange-50 text-orange-600 border-orange-100';
    else if (ticket.priority === 'Medium') priorityColor = 'bg-amber-50 text-amber-600 border-amber-100';

    let statusColor = 'bg-slate-50 text-slate-500 border-slate-100';
    if (ticket.status === 'In Progress') statusColor = 'bg-blue-50 text-blue-600 border-blue-100';
    else if (ticket.status === 'Resolved' || ticket.status === 'Completed') statusColor = 'bg-emerald-50 text-emerald-600 border-emerald-100';
    else if (ticket.status === 'Submitted' || ticket.status === 'Needs Attention' || ticket.status === 'Assigned') statusColor = 'bg-yellow-50 text-yellow-600 border-yellow-100';

    return {
      id: ticket.id,
      title: ticket.subject,
      description: ticket.description,
      priority: `${ticket.priority || 'Medium'} Priority`,
      priorityColor,
      location: ticket.location?.address || 'San Vicente, Apalit, Pampanga',
      lat: ticket.location?.latitude || ticket.location?.lat || 14.9427,
      lng: ticket.location?.longitude || ticket.location?.lng || 120.7621,
      status: ticket.status,
      statusColor,
      assigned: ticket.dateSubmitted ? new Date(ticket.dateSubmitted).toLocaleDateString() : 'Just now',
      due: 'Within 24 Hours',
      personnel: { name: ticket.assignee || currentUser?.name || 'Assigned Officer', role: 'Field Personnel' },
      impact: `Category: ${ticket.category}. Resolving community requests safely.`
    };
  };

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

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Submitted': case 'Needs Attention': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'Assigned': case 'In Progress': return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Resolved': case 'Completed': return 'bg-slate-100 text-slate-600 border border-slate-200';
      default: return 'bg-amber-50 text-amber-700 border border-amber-200';
    }
  };
  const getStatusLabel = (status) => {
    if (status === 'Submitted' || status === 'Needs Attention') return 'New';
    if (status === 'Assigned') return 'In review';
    return status;
  };

  const recentTickets = [...tickets]
    .filter(t => t.status !== 'Resolved' && t.status !== 'Completed')
    .sort((a, b) => new Date(b.created_at || b.dateSubmitted) - new Date(a.created_at || a.dateSubmitted))
    .slice(0, 6);

  return (
    <div className="space-y-6 text-left font-sans relative">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in">
          <Check className="w-5 h-5 shrink-0" />
          <span className="text-sm font-extrabold tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col animate-scale-up relative p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="space-y-0.5 text-left">
                <span className="text-[10px] font-extrabold text-slate-400 block tracking-wider">#{selectedTask.id}</span>
                <h3 className="font-heading font-extrabold text-xl text-slate-900 leading-snug">{selectedTask.title}</h3>
              </div>
              <button onClick={() => setSelectedTask(null)} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all cursor-pointer">
                <X className="w-4.5 h-4.5 stroke-[2.5]" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="md:col-span-2 space-y-6">
                <div className="flex flex-wrap gap-2.5">
                  <span className={`px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${selectedTask.statusColor}`}>
                    <Activity className="w-3.5 h-3.5 shrink-0" /> {selectedTask.status}
                  </span>
                  <span className={`px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${selectedTask.priorityColor}`}>
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 animate-pulse" /> {selectedTask.priority}
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
                  <h4 className="font-heading font-extrabold text-xs text-slate-800 uppercase tracking-wider">Description</h4>
                  <p className="text-xs text-slate-600 font-semibold leading-relaxed">{selectedTask.description}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Location</span>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="text-xs font-extrabold text-slate-800">{selectedTask.location}</span>
                    </div>
                    <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-200 mt-2 bg-slate-100">
                      <iframe width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0"
                        src={`https://maps.google.com/maps?q=${selectedTask.lat},${selectedTask.lng}&z=15&output=embed`}
                        title="Task Location Map" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Timeline</span>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0"><Calendar className="w-4 h-4" /></div>
                        <div className="leading-snug text-left"><span className="text-[10px] text-slate-400 font-bold block">Assigned</span><span className="text-xs font-extrabold text-slate-800">{selectedTask.assigned}</span></div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0"><Calendar className="w-4 h-4" /></div>
                        <div className="leading-snug text-left"><span className="text-[10px] text-slate-400 font-bold block">Due</span><span className="text-xs font-extrabold text-slate-800">{selectedTask.due}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:col-span-1 space-y-6">
                <div className="space-y-3">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Personnel Assigned</span>
                  <div className="flex items-center justify-between border border-slate-200 rounded-2xl p-3.5 bg-white gap-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full border border-blue-600 bg-slate-50 flex items-center justify-center text-[#0B3A9B] font-bold text-xs shrink-0">
                        {selectedTask.personnel.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="leading-tight text-left">
                        <h5 className="text-xs font-extrabold text-slate-900">{selectedTask.personnel.name}</h5>
                        <span className="text-[10px] text-slate-400 font-bold block pt-0.5">{selectedTask.personnel.role}</span>
                      </div>
                    </div>
                    <button className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"><Info className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="bg-[#EFF6FF]/60 border border-blue-100 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-[#0B3A9B]"><TrendingUp className="w-4 h-4 shrink-0" /><span className="text-xs font-extrabold">Task Impact</span></div>
                  <p className="text-[11px] text-[#1E4E7C] font-semibold leading-relaxed">{selectedTask.impact}</p>
                </div>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-5 flex justify-end gap-3 shrink-0">
              <button onClick={() => setSelectedTask(null)} className="px-6 py-2.5 border border-[#0B3A9B] bg-white hover:bg-blue-50/20 text-[#0B3A9B] rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-sm">Close</button>
              <button onClick={() => handleStartTask(selectedTask.id)} className="px-6 py-2.5 bg-[#0B3A9B] hover:bg-[#093082] text-white rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-all shadow-md">
                <Play className="w-3.5 h-3.5 fill-white text-white shrink-0" /> Start Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. WELCOME HEADER */}
      <div className="space-y-1">
        <h2 className="font-heading font-extrabold text-2xl tracking-tight text-slate-900">
          {getGreeting()}, {userName}
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          {formattedDate} — here's what's happening across the barangay today.
        </p>
      </div>

      {/* 2. KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#FFF3E0] flex items-center justify-center shrink-0"><Inbox className="w-5 h-5 text-[#E8913A]" /></div>
          <div><h3 className="font-heading font-extrabold text-2xl text-slate-900 leading-none">{openTicketsCount}</h3><span className="text-[12px] font-medium text-slate-400 block mt-0.5">Open tickets</span></div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#EBF3FF] flex items-center justify-center shrink-0"><Users className="w-5 h-5 text-[#0B2545]" /></div>
          <div><h3 className="font-heading font-extrabold text-2xl text-slate-900 leading-none">{activePersonnelCount}</h3><span className="text-[12px] font-medium text-slate-400 block mt-0.5">Active personnel</span></div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#E8F5E9] flex items-center justify-center shrink-0"><CheckCircle className="w-5 h-5 text-[#2E7D32]" /></div>
          <div><h3 className="font-heading font-extrabold text-2xl text-slate-900 leading-none">{resolvedThisMonthCount}</h3><span className="text-[12px] font-medium text-slate-400 block mt-0.5">Resolved this month</span></div>
        </div>
      </div>

      {/* 3. MAP */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 pt-5 pb-3">
          <h4 className="font-heading font-bold text-base text-slate-900">Barangay Service Map</h4>
          <p className="text-[12px] text-slate-400 font-medium mt-0.5">San Vicente, Apalit, Pampanga</p>
        </div>
        <DashboardMap tickets={tickets} />
      </div>

      {/* 4. ACTIVE TASKS */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 pt-5 pb-4 flex items-start justify-between">
          <div>
            <h4 className="font-heading font-bold text-base text-slate-900">Your Active Tasks</h4>
            <p className="text-[12px] text-slate-400 font-medium mt-0.5">Tickets currently assigned to you or awaiting your action</p>
          </div>
          <button onClick={() => setCurrentRoute('personnel-worklist')}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0B2545] hover:bg-[#081d36] text-white text-xs font-bold rounded-full transition-all cursor-pointer shrink-0">
            View Worklist <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {recentTickets.map((ticket) => (
            <div key={ticket.id} onClick={() => setSelectedTask(getTaskDetails(ticket))}
              className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors cursor-pointer group">
              <span className="text-[12px] font-bold text-slate-400 w-14 shrink-0">
                #{ticket.id?.toString().replace(/\D/g, '').slice(-4) || '0000'}
              </span>
              <div className="flex-1 min-w-0">
                <h5 className="text-sm font-bold text-slate-800 truncate leading-snug">{ticket.subject}</h5>
                <p className="text-[12px] text-slate-400 font-medium truncate mt-0.5">
                  {ticket.resident?.name || 'Resident'} · {ticket.location?.address || ticket.category || 'San Vicente'}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${getStatusStyle(ticket.status)}`}>
                {getStatusLabel(ticket.status)}
              </span>
              <span className="text-[12px] text-slate-400 font-medium w-16 text-right shrink-0">
                {timeAgo(ticket.created_at || ticket.dateSubmitted)}
              </span>
            </div>
          ))}
          {recentTickets.length === 0 && (
            <div className="px-6 py-12 text-center text-slate-400 font-medium text-sm">No active tasks at this time.</div>
          )}
        </div>
      </div>

    </div>
  );
};

export default PersonnelDashboard;
