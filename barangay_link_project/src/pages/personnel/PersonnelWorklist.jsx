import React, { useState } from 'react';
import { useTickets } from '../../context/TicketContext';
import { 
  ArrowLeft, 
  Clock, 
  FileText, 
  CheckCircle2, 
  User, 
  RefreshCw, 
  Edit3, 
  FilePlus, 
  Flag, 
  ChevronRight, 
  Check, 
  X,
  Ticket,
  Mail,
  TrendingUp,
  XCircle,
  Circle,
  ChevronDown,
  RotateCw,
  ChevronLeft,
  Camera,
  MapPin
} from 'lucide-react';

const PersonnelWorklist = () => {
  const { setCurrentRoute, tickets, updateTicketStatus, currentUser } = useTickets();
  const [toastMessage, setToastMessage] = useState('');
  const [activeModal, setActiveModal] = useState(null); // 'status' | 'note' | null
  const [selectedTicket, setSelectedTicket] = useState(null); // Selected ticket details view modal
  
  // Progress and notes states for modals
  const [statusVal, setStatusVal] = useState('In Progress');
  const [progressVal, setProgressVal] = useState(40);
  const [reportVal, setReportVal] = useState('');
  const [noteVal, setNoteVal] = useState('');
  const [notifyVal, setNotifyVal] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [evidencePhoto, setEvidencePhoto] = useState(null); // Local evidence photo for Resolved status

  // Status Filter / Priority Selection states
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All Priorities');

  // Initial timeline items matching the screenshot
  const [timelineItems, setTimelineItems] = useState([
    {
      id: 1,
      type: 'status-card',
      title: "Status updated to 'In Progress'",
      description: "Personnel Alex Rivera updated the status and initiated the repair process.",
      time: "Today at 10:45 AM",
      icon: RefreshCw,
      iconClass: "bg-[#1E5AE6] text-white border-blue-200"
    },
    {
      id: 2,
      type: 'text',
      title: "Assigned to Alex Rivera",
      description: "Work order dispatched to the District 7 Utility Crew.",
      time: "Yesterday at 3:30 PM",
      icon: User,
      iconClass: "bg-slate-100 text-slate-500 border-slate-200"
    },
    {
      id: 3,
      type: 'text',
      title: "Ticket Created & Validated",
      description: "Validated through official mobile citizen portal.",
      time: "Oct 24, 2024 at 09:12 AM",
      icon: CheckCircle2,
      iconClass: "bg-slate-100 text-slate-500 border-slate-200"
    }
  ]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handleUpdateStatusSave = () => {
    // Add status change to timeline
    const newItem = {
      id: Date.now(),
      type: 'status-card',
      title: `Status updated to '${statusVal}'`,
      description: reportVal.trim() || `Personnel updated task status to ${statusVal}.`,
      time: "Just now",
      icon: RefreshCw,
      iconClass: "bg-[#1E5AE6] text-white border-blue-200"
    };

    setTimelineItems(prev => [newItem, ...prev]);

    // Update the ticket status in context
    if (selectedTicket) {
      updateTicketStatus(selectedTicket.id, statusVal, currentUser?.name || 'Marcus Sterling', reportVal, null, evidencePhoto);
      setSelectedTicket(prev => ({ 
        ...prev, 
        status: statusVal, 
        evidencePhoto: statusVal === 'Resolved' ? (evidencePhoto || prev.evidencePhoto) : prev.evidencePhoto 
      }));
    }

    setActiveModal(null);
    setReportVal('');
    setEvidencePhoto(null);
    setShowSuccessModal(true);
  };

  const handleTriggerMockUpload = () => {
    // Simulates an evidence photo upload with a realistic repair visual
    setEvidencePhoto("/map_placeholder.png");
    triggerToast("Resolution photo evidence uploaded successfully!");
  };

  const handleAddNoteSave = () => {
    if (!noteVal.trim()) return;

    const newItem = {
      id: Date.now(),
      type: 'text',
      title: "Internal Note Added",
      description: noteVal,
      time: "Just now",
      icon: FilePlus,
      iconClass: "bg-amber-50 text-amber-600 border-amber-250"
    };

    setTimelineItems(prev => [newItem, ...prev]);
    triggerToast("Internal note appended!");
    setActiveModal(null);
    setNoteVal('');
  };

  const handleEscalate = () => {
    triggerToast("Ticket escalated to Barangay Engineering Board successfully!");
  };

  // Filter list based on selected tab/dropdown values
  const filteredTickets = tickets.filter(t => {
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'All Priorities' || t.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  const clearAllFilters = () => {
    setStatusFilter('All');
    setPriorityFilter('All Priorities');
    triggerToast("Filters cleared.");
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Medium':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Low':
        return 'bg-slate-50 text-slate-505 border-slate-100';
      default:
        return 'bg-slate-50 text-slate-505 border-slate-100';
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'In Progress':
        return {
          bg: 'bg-blue-50 text-blue-650 border border-blue-100',
          dot: 'bg-blue-600'
        };
      case 'Pending':
        return {
          bg: 'bg-orange-50 text-orange-650 border border-orange-100',
          dot: 'bg-orange-600'
        };
      case 'Resolved':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
          dot: 'bg-emerald-600'
        };
      case 'Completed':
        return {
          bg: 'bg-teal-50 text-teal-700 border border-teal-100',
          dot: 'bg-teal-650'
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-505 border border-slate-100',
          dot: 'bg-slate-400'
        };
    }
  };

  return (
    <div className="space-y-6 text-left relative font-sans">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-55 bg-[#0B3A9B] text-white px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in">
          <Check className="w-5 h-5 shrink-0" />
          <span className="text-sm font-extrabold tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="space-y-1">
          <h2 className="font-heading font-extrabold text-2xl tracking-tight text-slate-900">
            Assigned Tickets
          </h2>
          <p className="text-xs text-slate-405 font-semibold leading-relaxed">
            Manage and track your active service requests for the metropolitan area.
          </p>
        </div>

        <div>
          <button
            onClick={() => triggerToast("Ticket list refreshed successfully!")}
            className="bg-[#0B3A9B] hover:bg-[#093082] text-white px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-all shadow-sm"
          >
            <RotateCw className="w-3.5 h-3.5 text-white" />
            Refresh Data
          </button>
        </div>
      </div>

      {/* 2. FILTER CONTROLS CARD */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6">
          
          {/* Status Pills */}
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] font-extrabold text-slate-405 uppercase tracking-wide block">Filter by Status</span>
            <div className="flex gap-2">
              {['All', 'In Progress', 'Pending', 'Resolved', 'Completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                    statusFilter === status
                      ? 'bg-[#0B3A9B] border-[#0B3A9B] text-white font-extrabold'
                      : 'bg-white border-slate-200 text-slate-655 hover:bg-slate-50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Priority dropdown selector */}
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] font-extrabold text-slate-405 uppercase tracking-wide block">Priority Level</span>
            <div className="relative">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="appearance-none bg-white border border-slate-205 rounded-xl pl-4 pr-10 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-650 cursor-pointer shadow-sm min-w-[130px]"
              >
                <option value="All Priorities">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

        </div>

        {/* Clear Filters Link */}
        {(statusFilter !== 'All' || priorityFilter !== 'All Priorities') && (
          <button 
            onClick={clearAllFilters}
            className="text-xs font-extrabold text-slate-450 hover:text-[#0B3A9B] transition-colors cursor-pointer"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* 3. MAIN TICKETS TABLE CARD */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col justify-between min-h-[50vh]">
        
        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-4.5 px-6">Ticket ID</th>
                <th className="py-4.5 px-6">Subject</th>
                <th className="py-4.5 px-6">Category</th>
                <th className="py-4.5 px-6">Priority</th>
                <th className="py-4.5 px-6">Status</th>
                <th className="py-4.5 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-24 text-center text-xs text-slate-450 font-extrabold">
                    No tickets match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => {
                  const statusStyle = getStatusBadgeStyle(ticket.status);
                  return (
                    <tr key={ticket.id} className="hover:bg-slate-50/40 transition-colors">
                      {/* Ticket ID */}
                      <td className="py-4 px-6 text-xs font-extrabold text-[#0B3A9B]">
                        {ticket.id}
                      </td>

                      {/* Subject (Title + Subtitle Address) */}
                      <td className="py-4 px-6 text-left">
                        <div className="leading-snug">
                          <h4 className="text-xs font-extrabold text-slate-800">
                            {ticket.subject}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-bold block pt-0.5">
                            {ticket.location?.address || ticket.address}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-6 text-xs font-bold text-slate-655">
                        {ticket.category}
                      </td>

                      {/* Priority badge */}
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-0.5 rounded-lg border text-[9px] font-extrabold uppercase tracking-wider ${getPriorityStyle(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </td>

                      {/* Status badge with colored dot */}
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wide flex items-center gap-1.5 w-fit ${statusStyle.bg}`}>
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusStyle.dot}`} />
                          {ticket.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => {
                            setStatusVal(ticket.status);
                            setSelectedTicket(ticket);
                          }}
                          className="px-4 py-1.5 border border-[#0B3A9B] hover:bg-blue-50/20 text-[#0B3A9B] rounded-lg text-[10px] font-extrabold transition-all cursor-pointer shadow-sm"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer pagination block */}
        <div className="border-t border-slate-100 p-5 flex items-center justify-between shrink-0 flex-wrap gap-3">
          <span className="text-[11px] text-slate-400 font-bold">
            Showing {filteredTickets.length} of {tickets.length} active tickets
          </span>

          <div className="flex items-center gap-1.5">
            <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-lg bg-[#0B3A9B] text-white shadow-sm text-xs font-extrabold flex items-center justify-center cursor-pointer">
              1
            </button>
            <button className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-655 text-xs font-bold flex items-center justify-center cursor-pointer">
              2
            </button>
            <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* 4. DETAILS MODAL OVERLAY */}
      {selectedTicket && (
        <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 md:p-8 animate-scale-up relative space-y-5">
            
            {/* Close Button X */}
            <button 
              onClick={() => setSelectedTicket(null)}
              className="absolute top-6 right-6 p-1 hover:bg-slate-100 rounded-lg text-slate-450 hover:text-slate-700 transition-all cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Ticket IDs and submitted state */}
            <div className="space-y-1.5 text-left pr-8">
              <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                <span className="bg-slate-100 text-slate-705 px-2.5 py-0.5 rounded-md font-extrabold">{selectedTicket.id}</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Submitted 2 days ago</span>
                </div>
              </div>

              <h2 className="font-heading font-extrabold text-2xl tracking-tight text-slate-900 leading-none">
                {selectedTicket.subject}
              </h2>
            </div>

            {/* SPLIT LAYOUT CONTAINER */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
              
              {/* Left Column (2/3 width) - Case details & Timeline */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Case Description Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4 text-left">
                  <h3 className="font-heading font-extrabold text-xs text-[#0B3A9B] uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#0B3A9B]" />
                    Case Description
                  </h3>

                  <p className="text-xs text-slate-655 font-semibold leading-relaxed">
                    {selectedTicket.description}
                  </p>

                  {/* Show resolution photo evidence if available */}
                  {selectedTicket.evidencePhoto && (
                    <div className="mt-4 p-4.5 bg-slate-50 border border-slate-150 rounded-2xl space-y-2 text-left">
                      <span className="text-[10px] text-slate-450 font-extrabold uppercase tracking-wide block">Resolution Photo Evidence</span>
                      <div className="rounded-xl overflow-hidden border border-slate-205 max-w-sm bg-white shadow-sm">
                        <img src={selectedTicket.evidencePhoto} alt="Fix Evidence" className="w-full h-auto max-h-48 object-cover" />
                      </div>
                    </div>
                  )}

                  <div className="border-t border-slate-100 my-2" />

                  {/* Metadata Fields Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                    <div>
                      <span className="text-[9px] text-slate-404 font-extrabold uppercase tracking-wide block">Asset ID</span>
                      <span className="text-xs font-extrabold text-slate-800">{selectedTicket.assetId || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-404 font-extrabold uppercase tracking-wide block">Last Inspection</span>
                      <span className="text-xs font-extrabold text-slate-800">{selectedTicket.lastInspection || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-404 font-extrabold uppercase tracking-wide block">Category</span>
                      <span className="text-xs font-extrabold text-[#0B3A9B]">{selectedTicket.category}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-404 font-extrabold uppercase tracking-wide block">Source</span>
                      <span className="text-xs font-extrabold text-slate-800">{selectedTicket.source || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Location Details Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4 text-left">
                  <h3 className="font-heading font-extrabold text-xs text-[#0B3A9B] uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#0B3A9B]" />
                    Location Details
                  </h3>
                  <p className="text-xs font-bold text-slate-705">
                    {selectedTicket.location?.address || 'No location provided.'}
                  </p>
                  
                  <div className="w-full h-44 rounded-2xl overflow-hidden relative shadow-inner border border-slate-100 bg-[#E5E7EB]">
                    <iframe
                      title="Ticket Map"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent((selectedTicket.location?.address || '') + ', San Vicente, Apalit, Pampanga')}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                      className="w-full h-full border-0"
                      loading="lazy"
                    ></iframe>
                  </div>
                </div>

                {/* Activity Timeline Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6 text-left">
                  <h3 className="font-heading font-extrabold text-xs text-[#0B3A9B] uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#0B3A9B]" />
                    Activity Timeline
                  </h3>

                  {/* Timeline track container */}
                  <div className="space-y-0.5">
                    {timelineItems.map((item, index) => {
                      const Icon = item.icon;
                      const isLast = index === timelineItems.length - 1;
                      
                      return (
                        <div key={item.id} className="flex gap-4.5 items-stretch min-h-[90px] relative">
                          
                          {/* Track line indicator */}
                          <div className="relative flex flex-col items-center shrink-0 w-8">
                            <div className={`w-7.5 h-7.5 rounded-full border flex items-center justify-center z-10 shrink-0 ${item.iconClass}`}>
                              <Icon className="w-3.5 h-3.5 stroke-[2.5]" />
                            </div>
                            {!isLast && (
                              <div className="absolute top-7.5 bottom-0 w-0.5 bg-slate-100 -z-0"></div>
                            )}
                          </div>

                          {/* Timeline card vs text content */}
                          {item.type === 'status-card' ? (
                            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4.5 text-left space-y-1.5 mb-5 shadow-sm">
                              <h4 className="text-xs font-extrabold text-slate-855">
                                {item.title}
                              </h4>
                              <p className="text-[11px] text-slate-550 font-semibold leading-relaxed">
                                {item.description}
                              </p>
                              <span className="text-[10px] text-slate-400 font-bold block pt-0.5">
                                {item.time}
                              </span>
                            </div>
                          ) : (
                            <div className="flex-1 text-left py-0.5 pl-0.5 space-y-1 mb-5">
                              <h4 className="text-xs font-extrabold text-slate-850">
                                {item.title}
                              </h4>
                              <p className="text-[11px] text-slate-550 font-semibold leading-relaxed">
                                {item.description}
                              </p>
                              <span className="text-[10px] text-slate-400 font-bold block">
                                {item.time}
                              </span>
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Right Column (1/3 width) - Quick Actions */}
              <div className="lg:col-span-1">
                
                <div className="bg-slate-50 border border-slate-205 rounded-3xl p-6 space-y-4 text-left shadow-sm">
                  <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest block pl-0.5">
                    Quick Actions
                  </span>

                  {/* Buttons stack */}
                  <div className="space-y-3 pt-1">
                    
                    {/* Action 1: Update Status */}
                    <button
                      onClick={() => {
                        setStatusVal(selectedTicket.status);
                        setActiveModal('status');
                      }}
                      className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
                    >
                      <div className="flex items-center text-xs font-extrabold text-slate-800">
                        <Edit3 className="w-4.5 h-4.5 text-[#0B3A9B] shrink-0" />
                        <span className="ml-3">Update Status</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>

                    {/* Action 2: Add Note */}
                    <button
                      onClick={() => setActiveModal('note')}
                      className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
                    >
                      <div className="flex items-center text-xs font-extrabold text-slate-800">
                        <FilePlus className="w-4.5 h-4.5 text-[#0B3A9B] shrink-0" />
                        <span className="ml-3">Add Internal Note</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>

                    {/* Action 3: Escalate (Red button) */}
                    <button
                      onClick={handleEscalate}
                      className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded-2xl text-xs font-extrabold transition-all shadow-md cursor-pointer mt-4"
                    >
                      <Flag className="w-4 h-4 text-white shrink-0" />
                      Escalate Ticket
                    </button>

                  </div>

                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* 5. MODAL A: Update Status (Redesigned Split Layout) */}
      {activeModal === 'status' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-205 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col md:flex-row animate-scale-up relative">
            
            {/* Left Column (Reference block) */}
            <div className="w-full md:w-72 bg-[#F8FAFC] p-6 flex flex-col justify-between border-r border-slate-100 text-left">
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] text-[#0B3A9B] font-extrabold tracking-wider uppercase block">Ticket Update</span>
                  <h3 className="font-heading font-extrabold text-xl text-slate-905 leading-tight mt-1">Update Ticket Status</h3>
                </div>

                {/* Ticket reference */}
                <div className="flex items-center gap-3.5 mt-6">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                    <Ticket className="w-4.5 h-4.5 stroke-[2.5]" />
                  </div>
                  <div className="leading-tight text-left">
                    <span className="text-[10px] text-slate-400 font-bold block">Ticket Reference</span>
                    <span className="text-xs font-black text-slate-800">{selectedTicket?.id}</span>
                  </div>
                </div>

                {/* Subject */}
                <div className="flex items-center gap-3.5 mt-4">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <FileText className="w-4.5 h-4.5" />
                  </div>
                  <div className="leading-tight text-left">
                    <span className="text-[10px] text-slate-400 font-bold block">Subject</span>
                    <span className="text-xs font-black text-slate-855">{selectedTicket?.subject}</span>
                  </div>
                </div>
              </div>

              {/* Secure Subtext */}
              <div className="text-center pt-8 md:pt-0 mt-auto">
                <span className="text-[9px] text-slate-405 font-bold leading-normal block">
                  Processing updates securely through B-Blink City Systems
                </span>
              </div>
            </div>

            {/* Right Column (Form block) */}
            <div className="flex-1 p-6 md:p-8 space-y-5 text-left relative bg-white max-h-[85vh] overflow-y-auto">
              {/* Close X button inside right column header corner */}
              <button 
                onClick={() => {
                  setActiveModal(null);
                  setEvidencePhoto(null);
                }}
                className="absolute top-5 right-5 p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-655 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Select Status */}
              <div className="space-y-3">
                <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider block">
                  Select New Status
                </span>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'In Progress', label: 'In Progress', icon: TrendingUp },
                    { id: 'Resolved', label: 'Resolved', icon: CheckCircle2 },
                    { id: 'Cancelled', label: 'Cancelled', icon: XCircle },
                    { id: 'Pending', label: 'Pending', icon: Circle }
                  ].map((option) => {
                    const Icon = option.icon;
                    const isSelected = statusVal === option.id;
                    return (
                      <button
                        type="button"
                        key={option.id}
                        onClick={() => setStatusVal(option.id)}
                        className={`
                          border rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:bg-slate-50/50 text-center
                          ${isSelected 
                            ? 'border-[#1E5AE6] bg-blue-50/30 ring-1 ring-[#1E5AE6]' 
                            : 'border-slate-200 bg-white'}
                        `}
                      >
                        <Icon className={`w-5 h-5 shrink-0 ${isSelected ? 'text-[#1E5AE6]' : 'text-slate-800'}`} />
                        <span className="text-[10px] font-extrabold text-slate-855 leading-tight block">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes Textarea */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider block">
                  Add Update Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={reportVal}
                  onChange={(e) => setReportVal(e.target.value)}
                  placeholder="Briefly describe the update or work done..."
                  className="w-full bg-slate-100 border border-slate-205 rounded-2xl px-4 py-3 text-xs font-semibold outline-none focus:border-blue-600 focus:bg-white transition-all placeholder-slate-455 resize-none text-slate-800 h-24 leading-relaxed"
                />
              </div>

              {/* REQUIRED PHOTO EVIDENCE FOR RESOLVED STATUS */}
              {statusVal === 'Resolved' && (
                <div className="space-y-2">
                  <label className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider block">
                    Resolution Photo Evidence <span className="text-red-500">*</span>
                  </label>
                  
                  {evidencePhoto ? (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 p-2 flex items-center justify-between gap-4">
                      <img src={evidencePhoto} alt="Evidence Preview" className="w-16 h-16 object-cover rounded-lg shadow-sm shrink-0" />
                      <div className="flex-1 text-left min-w-0">
                        <span className="text-xs font-extrabold text-slate-800 block truncate">evidence_upload_fix.jpg</span>
                        <span className="text-[10px] text-emerald-600 font-bold block pt-0.5">Verification Photo Uploaded</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setEvidencePhoto(null)}
                        className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-655 cursor-pointer shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={handleTriggerMockUpload}
                      className="border-[1.5px] border-dashed border-[#1E5AE6] rounded-2xl p-6 bg-slate-50/50 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <Camera className="w-6 h-6 text-[#1E5AE6] mb-2" />
                      <span className="text-xs font-bold text-[#1E5AE6]">Click to upload resolution evidence photo</span>
                      <span className="text-[10px] text-slate-400 font-semibold pt-1">Required for Resolved status</span>
                    </div>
                  )}
                </div>
              )}

              {/* Notify Toggle */}
              <div className="flex items-center justify-between p-4 bg-[#F8FAFC] border border-slate-150 rounded-2xl gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-650 shrink-0" />
                  <div className="leading-tight text-left">
                    <span className="text-xs font-extrabold text-slate-855">Notify Resident of Status Change</span>
                    <span className="text-[10px] text-slate-400 font-bold block pt-0.5">
                      The requester will receive an automated SMS & Email update.
                    </span>
                  </div>
                </div>
                {/* Switch Toggle */}
                <button
                  type="button"
                  onClick={() => setNotifyVal(!notifyVal)}
                  className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none shrink-0 cursor-pointer ${notifyVal ? 'bg-[#0B3A9B]' : 'bg-slate-300'}`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white absolute top-1 left-1 transition-transform ${notifyVal ? 'translate-x-5' : ''}`} />
                </button>
              </div>

              {/* Footer Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setActiveModal(null);
                    setEvidencePhoto(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-extrabold text-slate-700 transition-all cursor-pointer shadow-sm text-center"
                >
                  Cancel
                </button>
                <button
                  onClick={(reportVal.trim() && (statusVal !== 'Resolved' || evidencePhoto)) ? handleUpdateStatusSave : undefined}
                  disabled={!reportVal.trim() || (statusVal === 'Resolved' && !evidencePhoto)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold text-center transition-all shadow-md
                    ${(reportVal.trim() && (statusVal !== 'Resolved' || evidencePhoto))
                      ? 'bg-[#1E5AE6] hover:bg-[#1546B8] text-white cursor-pointer'
                      : 'bg-[#BFC7D6] text-white cursor-not-allowed'
                    }
                  `}
                >
                  Update Status
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* 6. MODAL B: Add Note */}
      {activeModal === 'note' && (
        <div className="fixed inset-0 z-55 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-scale-up relative p-6 space-y-5">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-extrabold text-base text-slate-905">Add Internal Note</h3>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-655 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notes textarea */}
            <div className="space-y-1 text-left">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Internal Comment</label>
              <textarea
                rows={4}
                value={noteVal}
                onChange={(e) => setNoteVal(e.target.value)}
                placeholder="Enter internal comment for task record (only visible to staff)..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:border-blue-600 focus:bg-white transition-all placeholder-slate-455 resize-none text-slate-800"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-extrabold text-slate-700 transition-all cursor-pointer shadow-sm text-center"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNoteSave}
                className="flex-1 py-2.5 rounded-xl bg-[#0B3A9B] hover:bg-[#093082] text-xs font-extrabold text-white transition-all shadow-md cursor-pointer"
              >
                Add Note
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 7. SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-55 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col p-6 animate-scale-up relative space-y-6 text-center">
            
            {/* Close button */}
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-5 right-5 p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-655 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Circular Checkmark Icon */}
            <div className="mx-auto w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0B3A9B] shrink-0 mt-4 shadow-sm">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>

            {/* Info text */}
            <div className="space-y-2 text-center">
              <h3 className="font-heading font-extrabold text-lg text-slate-900">Ticket Updated Successfully</h3>
              <p className="text-xs text-slate-505 font-semibold leading-relaxed px-2">
                Your report to <span className="text-[#0B3A9B] font-extrabold">"Ticket {selectedTicket?.id}"</span> has been successfully updated.
              </p>
            </div>

            {/* Divider line */}
            <div className="border-t border-slate-100 pt-5 mt-2">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-2.5 bg-[#0B3A9B] hover:bg-[#093082] text-white rounded-xl text-xs font-extrabold transition-all shadow-md cursor-pointer text-center"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default PersonnelWorklist;
