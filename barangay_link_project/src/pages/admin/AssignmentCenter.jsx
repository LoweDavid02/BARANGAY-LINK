import React, { useState, useEffect } from 'react';
import { useTickets } from '../../context/TicketContext';
import { 
  Check, 
  Search, 
  ChevronDown, 
  X, 
  Shield, 
  User, 
  Phone, 
  MapPin, 
  Calendar,
  AlertCircle,
  Clock,
  RefreshCw,
  Lock,
  Building,
  FileText
} from 'lucide-react';

const AssignmentCenter = () => {
  const { tickets, personnel, assignPersonnel, updateTicketStatus, refreshData, globalSearchQuery } = useTickets();
  
  // Use real personnel from context
  const personnelList = personnel || [];

  // State
  const [activeStatusFilter, setActiveStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState(globalSearchQuery || '');
  const [currentPage, setCurrentPage] = useState(1);
  
  useEffect(() => {
    if (globalSearchQuery !== undefined) {
      setSearchQuery(globalSearchQuery);
    }
  }, [globalSearchQuery]);

  // Modal flow states
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'details' | 'assign' | 'assign-success' | 'status' | 'status-success'

  // Sub-modal states
  const [personnelSearch, setPersonnelSearch] = useState('');
  const [tempAssignee, setTempAssignee] = useState('');
  const [tempStatus, setTempStatus] = useState('');
  const [tempPriority, setTempPriority] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [assignProgress, setAssignProgress] = useState(0);

  const handleOpenDetails = (ticket) => {
    setSelectedTicketId(ticket.id);
    setTempAssignee(ticket.assignee || '');
    setTempStatus(ticket.status || 'Submitted');
    setTempPriority(ticket.status === 'Submitted' ? '' : (ticket.priority || 'Medium'));
    setInternalNotes('');
    setActiveModal('details');
  };

  // Close details modal handler
  const handleCloseDetails = () => {
    setSelectedTicketId(null);
    setActiveModal(null);
  };

  // 2. Confirm Assignment Action
  const handleConfirmAssignment = async () => {
    if (!selectedTicketId) return;
    setActiveModal('assign-generating');
    setAssignProgress(10);
    const interval = setInterval(() => {
      setAssignProgress(prev => prev >= 90 ? 90 : prev + 15);
    }, 500);

    const assigneeName = tempAssignee === '' ? null : tempAssignee;
    await assignPersonnel(selectedTicketId, assigneeName);
    
    clearInterval(interval);
    setAssignProgress(100);
    
    await refreshData();
    setTimeout(() => {
      setActiveModal('assign-success');
    }, 400);
  };

  // 3. Confirm Status Update Action
  const handleConfirmStatus = () => {
    if (!selectedTicketId) return;
    
    // Pass tempStatus directly. Submitted remains Submitted, Pending becomes Pending, Completed becomes Completed.
    updateTicketStatus(selectedTicketId, tempStatus, "Admin Officer", internalNotes, tempPriority);
    setActiveModal('status-success');
  };

  // Filter tickets roster
  const filteredTickets = tickets.filter(ticket => {
    if (activeStatusFilter === 'Unassigned') {
      if (ticket.status !== 'Submitted') return false;
    } else if (activeStatusFilter === 'Completed') {
      if (ticket.status !== 'Completed' && ticket.status !== 'Cancelled' && ticket.status !== 'Closed') return false;
    } else if (activeStatusFilter !== 'All') {
      if (ticket.status !== activeStatusFilter) return false;
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const subjectMatch = ticket.subject.toLowerCase().includes(q);
      const idMatch = ticket.id.toLowerCase().includes(q);
      const catMatch = ticket.category.toLowerCase().includes(q);
      if (!subjectMatch && !idMatch && !catMatch) return false;
    }
    return true;
  });

  // Pagination parameters
  const itemsPerPage = 5;
  const totalEntries = filteredTickets.length;
  const totalPages = Math.ceil(totalEntries / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalEntries);
  const currentTickets = filteredTickets.slice(startIndex, endIndex);

  const handlePageChange = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

  const getStatusLabel = (status) => {
    if (status === 'Submitted') return 'Unassigned';
    if (status === 'Cancelled' || status === 'Closed') return 'Completed';
    return status;
  };

  const getStatusBadgeColor = (status) => {
    const s = getStatusLabel(status);
    if (s === 'Unassigned') return 'bg-slate-100 text-slate-700';
    if (s === 'Assigned') return 'bg-indigo-50 text-indigo-700';
    if (s === 'Pending') return 'bg-amber-50 text-amber-600';
    if (s === 'In Progress') return 'bg-blue-50 text-[#1E5AE6]';
    if (s === 'Resolved') return 'bg-emerald-50 text-emerald-700';
    if (s === 'Completed') return 'bg-purple-50 text-purple-700';
    return 'bg-slate-100 text-slate-750';
  };

  const activeTicket = tickets.find(t => t.id === selectedTicketId);

  // Search filtered personnel roster
  const filteredPersonnel = personnelList.filter(p => {
    const q = personnelSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.role.toLowerCase().includes(q) ||
      p.department.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 text-left relative font-sans">
      
      {/* Title & Subtitle */}
      <div className="space-y-1">
        <h2 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
          Support Tickets
        </h2>
        <p className="text-sm text-slate-555 font-semibold">
          Track and manage submitted service requests for Barangay Central.
        </p>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <span className="text-xs font-bold text-slate-500 shrink-0 pr-1">Status:</span>
          {['All', 'Unassigned', 'Assigned', 'Pending', 'In Progress', 'Resolved', 'Completed'].map((status) => {
            const isActive = activeStatusFilter === status;
            return (
              <button
                key={status}
                onClick={() => {
                  setActiveStatusFilter(status);
                  setCurrentPage(1);
                }}
                className={`
                  px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0
                  ${isActive 
                    ? 'bg-[#0B3A9B] text-white shadow-sm' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-650'}
                `}
              >
                {status}
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-80 flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 focus-within:border-blue-600 focus-within:bg-white transition-all shadow-sm">
          <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search ticket #, subject..."
            className="w-full bg-transparent border-0 outline-none py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* TICKETS DATA TABLE */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-450 font-extrabold uppercase tracking-wider text-[10px]">
                <th className="pb-3 pr-4">Ticket ID</th>
                <th className="pb-3 px-4">Subject</th>
                <th className="pb-3 px-4">Date Submitted</th>
                <th className="pb-3 px-4">Category</th>
                <th className="pb-3 px-4">Status</th>
                <th className="pb-3 pl-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
              {currentTickets.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-450 font-semibold">
                    No tickets found matching the active filters.
                  </td>
                </tr>
              ) : (
                currentTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-4 pr-4">
                      <button 
                        onClick={() => handleOpenDetails(ticket)}
                        className="text-blue-600 hover:text-blue-850 font-extrabold cursor-pointer hover:underline text-left"
                      >
                        {ticket.id}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-slate-900 font-extrabold truncate max-w-[220px]">
                      {ticket.subject}
                    </td>
                    <td className="py-4 px-4 text-slate-500 font-semibold">
                      {new Date(ticket.dateSubmitted).toLocaleDateString(undefined, { 
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-4 text-slate-500 font-semibold">
                      {ticket.category}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeColor(ticket.status)}`}>
                        {getStatusLabel(ticket.status)}
                      </span>
                    </td>
                    <td className="py-4 pl-4 text-right">
                      <button
                        onClick={() => handleOpenDetails(ticket)}
                        className="text-blue-600 hover:text-blue-805 font-extrabold cursor-pointer hover:underline"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalEntries > 0 && (
          <div className="pt-5 mt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
            <span>
              Showing {startIndex + 1} to {endIndex} of {totalEntries} entries
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className={`px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold transition-all ${currentPage === 1 ? 'opacity-40 cursor-not-allowed bg-slate-50' : 'bg-white hover:bg-slate-50 text-slate-700 cursor-pointer'}`}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-7.5 h-7.5 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${currentPage === pageNum ? 'bg-[#0B3A9B] text-white' : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-650'}`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className={`px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold transition-all ${currentPage === totalPages ? 'opacity-40 cursor-not-allowed bg-slate-50' : 'bg-white hover:bg-slate-50 text-slate-700 cursor-pointer'}`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FLOW MODALS CONTAINER */}
      {selectedTicketId && activeTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          
          {/* A. VIEW DETAILS MODAL (IMAGE 5) */}
          {activeModal === 'details' && (
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col animate-scale-up text-left">
              
              {/* Modal Header */}
              <div className="px-6 py-4.5 bg-white border-b border-slate-200 flex justify-between items-center shrink-0">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                    Ticket {activeTicket?.id || ''}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-heading font-extrabold text-slate-800 text-lg leading-tight">
                      {activeTicket?.subject || 'No Subject'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusBadgeColor(activeTicket?.status || 'Submitted')}`}>
                      {getStatusLabel(activeTicket?.status || 'Submitted')}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={handleCloseDetails}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content (Split Layout) */}
              <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-5 gap-6 max-h-[70vh]">
                
                {/* Left Side (3 columns): Description & Location Map */}
                <div className="md:col-span-3 space-y-5">
                  
                  {/* Description Card */}
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-150 space-y-2">
                    <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      Description
                    </h5>
                    <p className="text-xs text-slate-600 font-semibold leading-relaxed whitespace-pre-line">
                      {activeTicket?.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Location Details Card */}
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-150 space-y-3">
                    <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      Location Details
                    </h5>
                    <p className="text-xs font-bold text-slate-700">{activeTicket?.location?.address || 'No location provided.'}</p>
                    
                    {/* Embedded Map Visual */}
                    <div className="w-full h-44 rounded-xl overflow-hidden relative shadow-inner border border-slate-100 bg-[#E5E7EB]">
                      <iframe
                        title="Ticket Map"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent((activeTicket?.location?.address || '') + ', San Vicente, Apalit, Pampanga')}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                        className="w-full h-full border-0"
                        loading="lazy"
                      ></iframe>
                    </div>
                  </div>

                </div>

                {/* Right Side (2 columns): Assigned Personnel & Status Timeline */}
                <div className="md:col-span-2 space-y-5">
                  
                  {/* Assigned Personnel Card */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative text-left">
                    <div className="flex justify-between items-center pb-3">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        ASSIGNED PERSONNEL
                      </span>
                      {activeTicket?.assignee && (
                        <button
                          onClick={() => {
                            setPersonnelSearch('');
                            setActiveModal('assign');
                          }}
                          className="text-xs font-bold text-blue-650 hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                      )}
                    </div>

                    {activeTicket?.assignee ? (
                      <div className="space-y-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-500 shrink-0">
                            <User className="w-5 h-5 text-slate-400" />
                          </div>
                          <div className="text-left space-y-0.5">
                            <span className="text-xs font-extrabold text-slate-850 block leading-tight">
                              {activeTicket.assignee}
                            </span>
                            <span className="text-[10px] text-slate-450 font-bold block">
                              {personnelList.find(p => p.name === activeTicket?.assignee)?.role || 'Senior Electrician'}
                            </span>
                          </div>
                        </div>

                        <div className="border-t border-slate-100 pt-3.5 space-y-2 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 font-bold">Department:</span>
                            <span className="font-extrabold text-slate-800">
                              {personnelList.find(p => p.name === activeTicket?.assignee)?.department || 'Public Works & Infrastructure'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 font-bold">Priority:</span>
                            <span className={`px-2 py-0.5 rounded-lg border text-[9px] font-bold uppercase tracking-wider ${activeTicket?.priority ? 'bg-orange-50 border-orange-100 text-orange-700' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                              {activeTicket?.priority || 'Not Set'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        <div className="py-2 text-center text-xs text-slate-400 font-semibold">
                          No personnel assigned to this ticket.
                        </div>
                        <div className="border-t border-slate-100 pt-3.5 flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-bold">Priority:</span>
                          <span className="px-2 py-0.5 rounded-lg border text-[9px] font-bold uppercase tracking-wider bg-slate-100 border-slate-200 text-slate-500">
                            Not Set
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status Timeline Card */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-left">
                    <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Status Timeline
                    </h5>
                    
                    <div className="space-y-5 pl-4 border-l-2 border-slate-100 relative ml-2">
                      {(activeTicket?.history || []).map((hist, index) => (
                        <div key={index} className="relative pl-5 space-y-1">
                          
                          {/* Circular Indicator Badge */}
                          <div className="absolute -left-[25px] top-0.5 w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white bg-blue-650 text-white shadow-sm">
                            <Check className="w-2.5 h-2.5 stroke-[3px]" />
                          </div>

                          <div className="flex flex-col text-left">
                            <span className="text-xs font-extrabold text-slate-800 leading-tight">
                              {hist?.action?.split(':')[0] || 'Update'}
                            </span>
                            <span className="text-[9px] text-slate-450 font-bold block pt-0.5">
                              {hist?.date ? new Date(hist.date).toLocaleString(undefined, {
                                month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                              }) : 'N/A'}
                            </span>
                          </div>
                          
                          {/* Display custom comment note if attached */}
                          {hist?.action && hist.action.includes(':') && (
                            <p className="text-[10px] text-slate-500 italic pt-1 leading-snug">
                              "{hist.action.split(':').slice(1).join(':').replace(/"/g, '')}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-white border-t border-slate-200 flex justify-end gap-3 shrink-0">
                <button
                  onClick={handleCloseDetails}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 transition-all cursor-pointer"
                >
                  Close
                </button>
                {getStatusLabel(activeTicket?.status || 'Submitted') === 'Unassigned' ? (
                  <button
                    onClick={() => {
                      setTempPriority('');
                      setTempStatus('In Progress');
                      setPersonnelSearch('');
                      setTempAssignee('');
                      setInternalNotes('');
                      setActiveModal('review-assign');
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#0B2545] hover:bg-[#081d36] text-xs font-extrabold text-white transition-all shadow-md cursor-pointer"
                  >
                    Review & Assign
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setTempStatus(getStatusLabel(activeTicket?.status || 'Submitted'));
                      setTempPriority(activeTicket?.priority || 'Medium');
                      setInternalNotes('');
                      setActiveModal('status');
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#0A3982] hover:bg-[#082e6c] text-xs font-extrabold text-white transition-all shadow-md cursor-pointer"
                  >
                    Update Status
                  </button>
                )}
              </div>

            </div>
          )}

          {/* B. ASSIGN PERSONNEL SUB-MODAL (IMAGE 2) */}
          {activeModal === 'assign' && (
            <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-scale-up text-left">
              
              {/* Header */}
              <div className="px-6 py-4.5 bg-slate-50 border-b border-slate-150 flex items-center justify-between shrink-0">
                <h4 className="font-heading font-extrabold text-lg text-slate-900">
                  Assign Personnel
                </h4>
                <button 
                  onClick={() => setActiveModal('details')}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Bar Input */}
              <div className="px-6 pt-5 pb-3">
                <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 focus-within:border-blue-650 focus-within:bg-white transition-all">
                  <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={personnelSearch}
                    onChange={(e) => setPersonnelSearch(e.target.value)}
                    placeholder="Search by name, role or department..."
                    className="w-full bg-transparent border-0 outline-none py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400"
                  />
                  {personnelSearch && (
                    <button onClick={() => setPersonnelSearch('')} className="p-0.5 text-slate-400 hover:text-slate-650">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Personnel Cards Grid */}
              <div className="px-6 py-3 max-h-[50vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredPersonnel.map((p) => {
                  const isSelected = tempAssignee === p.name;
                  return (
                    <div
                      key={p.name}
                      onClick={() => setTempAssignee(isSelected ? '' : p.name)}
                      className={`
                        p-4 border rounded-2xl flex gap-3.5 items-start cursor-pointer transition-all duration-200 text-left
                        ${isSelected 
                          ? 'border-[#0B2545] bg-blue-50/20 ring-2 ring-blue-50/50' 
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'}
                      `}
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0 text-slate-400">
                        <User className="w-5 h-5" />
                      </div>
                      
                      <div className="space-y-0.5">
                        <h5 className="text-xs font-extrabold text-slate-900 leading-tight">
                          {p.name}
                        </h5>
                        <span className="text-[10px] text-slate-500 font-bold block">
                          {p.role}
                        </span>
                        <div className="flex items-center gap-1 text-[9px] text-slate-400 font-semibold pt-1">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{p.department}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-6 py-4.5 bg-slate-50 border-t border-slate-150 flex justify-end gap-3 shrink-0">
                <button
                  onClick={() => setActiveModal('details')}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-650 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAssignment}
                  className="px-6 py-2.5 rounded-xl bg-[#0B2545] hover:bg-[#081d36] text-xs font-extrabold text-white transition-all shadow-md cursor-pointer"
                >
                  Confirm Assignment
                </button>
              </div>

            </div>
          )}

          {/* ASSIGNMENT GENERATING MODAL */}
          {activeModal === 'assign-generating' && (
            <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col p-8 items-center text-center animate-scale-up shrink-0 space-y-6">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-[#0B3A9B] animate-spin"></div>
                <Check className="w-5 h-5 text-[#0B3A9B]" />
              </div>
              <div className="space-y-2 text-center w-full">
                <h4 className="font-heading font-extrabold text-lg text-slate-900">
                  Assigning Personnel...
                </h4>
                <p className="text-xs text-slate-400 font-semibold leading-relaxed max-w-xs mx-auto">
                  Please wait while we confirm the assignment and notify the resident.
                </p>
              </div>
              <div className="w-full space-y-2.5">
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/40">
                  <div 
                    className="bg-[#0B3A9B] h-full rounded-full transition-all duration-300"
                    style={{ width: `${assignProgress}%` }}
                  ></div>
                </div>
                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block text-center">
                  UPDATING DATABASE
                </span>
              </div>
            </div>
          )}

          {/* C. ASSIGNED SUCCESS POPUP (IMAGE 3) */}
          {activeModal === 'assign-success' && (
            <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col p-8 items-center text-center animate-scale-up shrink-0">
              <div className="w-14 h-14 rounded-full bg-blue-50 border-4 border-blue-100 flex items-center justify-center text-blue-900 shadow-md">
                <Check className="w-7 h-7 text-[#0B2545] stroke-[3px]" />
              </div>
              
              <h4 className="font-heading font-extrabold text-lg text-slate-900 pt-5">
                Assigned Personnel Successfully!
              </h4>
              
              <button
                onClick={() => {
                  setTempAssignee(activeTicket.assignee || '');
                  setActiveModal('details');
                }}
                className="w-full mt-6 py-3 rounded-xl bg-[#0B2545] hover:bg-[#081d36] text-sm font-extrabold text-white transition-all shadow-md cursor-pointer"
              >
                Done
              </button>
            </div>
          )}

          {/* D. UPDATE TICKET STATUS (IMAGE 1) */}
          {activeModal === 'status' && (
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col animate-scale-up text-left">
              
              {/* Header */}
              {/* Header */}
              <div className="px-6 py-4.5 bg-white border-b border-slate-200 flex justify-between items-center shrink-0">
                <h4 className="font-heading font-extrabold text-base text-slate-800">
                  Update Ticket Status
                </h4>
                <button 
                  onClick={() => setActiveModal('details')}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-650 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Grid content split column */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[65vh] overflow-y-auto">
                
                {/* Left Column: Select New Status */}
                <div className="space-y-4 text-left pr-0 md:pr-6 md:border-r md:border-slate-200">
                  <span className="text-xs font-bold text-slate-600 block">Select New Status</span>
                  
                  <div className="space-y-3">
                    
                    {/* Status: Assigned */}
                    <div
                      onClick={() => setTempStatus('Assigned')}
                      className={`
                        p-4.5 bg-white border rounded-xl flex items-center gap-4 cursor-pointer transition-all
                        ${tempStatus === 'Assigned' 
                          ? 'border-[#0B3A9B] ring-1 ring-[#0B3A9B]' 
                          : 'border-slate-200 hover:bg-slate-50/50'}
                      `}
                    >
                      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-sm font-extrabold text-slate-850 block leading-none">Assigned</span>
                        <span className="text-[10px] text-slate-400 font-semibold block">Personnel is designated</span>
                      </div>
                    </div>

                    {/* Status: Pending */}
                    <div
                      onClick={() => setTempStatus('Pending')}
                      className={`
                        p-4.5 bg-white border rounded-xl flex items-center gap-4 cursor-pointer transition-all
                        ${tempStatus === 'Pending' 
                          ? 'border-[#0B3A9B] ring-1 ring-[#0B3A9B]' 
                          : 'border-slate-200 hover:bg-slate-50/50'}
                      `}
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-sm font-extrabold text-slate-850 block leading-none">Pending</span>
                        <span className="text-[10px] text-slate-400 font-semibold block">Awaiting initial review</span>
                      </div>
                    </div>

                    {/* Status: In Progress */}
                    <div
                      onClick={() => setTempStatus('In Progress')}
                      className={`
                        p-4.5 bg-white border rounded-xl flex items-center gap-4 cursor-pointer transition-all
                        ${tempStatus === 'In Progress' 
                          ? 'border-[#0B3A9B] ring-1 ring-[#0B3A9B]' 
                          : 'border-slate-200 hover:bg-slate-50/50'}
                      `}
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        <RefreshCw className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-sm font-extrabold text-slate-850 block leading-none">In Progress</span>
                        <span className="text-[10px] text-slate-400 font-semibold block">Work is actively being handled</span>
                      </div>
                    </div>

                    {/* Status: Resolved */}
                    <div
                      onClick={() => setTempStatus('Resolved')}
                      className={`
                        p-4.5 bg-white border rounded-xl flex items-center gap-4 cursor-pointer transition-all
                        ${tempStatus === 'Resolved' 
                          ? 'border-[#0B3A9B] ring-1 ring-[#0B3A9B]' 
                          : 'border-slate-200 hover:bg-slate-50/50'}
                      `}
                    >
                      <div className="w-10 h-10 rounded-full bg-orange-100/50 flex items-center justify-center text-orange-600 shrink-0">
                        <Check className="w-5 h-5 text-orange-650" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-sm font-extrabold text-slate-850 block leading-none">Resolved</span>
                        <span className="text-[10px] text-slate-400 font-semibold block">Issue addressed, awaiting confirmation</span>
                      </div>
                    </div>

                    {/* Status: Completed */}
                    <div
                      onClick={() => setTempStatus('Completed')}
                      className={`
                        p-4.5 bg-white border rounded-xl flex items-center gap-4 cursor-pointer transition-all
                        ${tempStatus === 'Completed' 
                          ? 'border-[#0B3A9B] ring-1 ring-[#0B3A9B]' 
                          : 'border-slate-200 hover:bg-slate-50/50'}
                      `}
                    >
                      <div className="w-10 h-10 rounded-full bg-purple-100/30 flex items-center justify-center text-purple-600 shrink-0">
                        <Check className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-sm font-extrabold text-slate-850 block leading-none">Completed</span>
                        <span className="text-[10px] text-slate-400 font-semibold block">Ticket is finalized and archived</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Right Column: Change Priority, Notes & Info Box */}
                <div className="space-y-5 flex flex-col justify-between">
                  
                  {/* Change Priority Level */}
                  <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-100 space-y-3">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Change Priority Level</span>
                    <div className="flex gap-2">
                      {['Low', 'Medium', 'High'].map((p) => {
                        const isSelected = tempPriority === p;
                        return (
                          <button
                            type="button"
                            key={p}
                            onClick={() => setTempPriority(p)}
                            className={`
                              w-10 h-10 flex items-center justify-center rounded-lg border text-xs font-bold cursor-pointer transition-all
                              ${isSelected 
                                ? 'border-[#0B3A9B] bg-white text-[#0B3A9B] font-extrabold ring-1 ring-[#0B3A9B]' 
                                : 'border-slate-200 bg-white text-slate-650 hover:bg-slate-50'}
                            `}
                          >
                            {p.charAt(0)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Internal Notes Textarea */}
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-bold text-slate-600 block">Internal Notes</label>
                    <textarea
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      placeholder="Explain the reasoning for this status change..."
                      rows={4}
                      className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 transition-all shadow-sm resize-none"
                    ></textarea>
                  </div>

                  {/* Info Box */}
                  <div className="p-4 bg-blue-50/40 border border-blue-100 rounded-2xl flex gap-3 items-start text-[11px] text-blue-800 leading-relaxed font-semibold">
                    <AlertCircle className="w-4.5 h-4.5 text-blue-650 shrink-0" />
                    <span>A notification email will be sent to the resident automatically upon status update.</span>
                  </div>

                </div>

              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-white border-t border-slate-200 flex justify-end gap-3 shrink-0">
                <button
                  onClick={() => setActiveModal('details')}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-650 transition-all cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={handleConfirmStatus}
                  className="px-6 py-2.5 rounded-xl bg-[#0B3A9B] hover:bg-[#093082] text-xs font-extrabold text-white transition-all shadow-md cursor-pointer"
                >
                  Update Status
                </button>
              </div>

            </div>
          )}

          {/* F. INITIAL TICKET ASSESSMENT (REVIEW & ASSIGN) */}
          {activeModal === 'review-assign' && (
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col animate-scale-up text-left">
              
              {/* Header */}
              <div className="px-6 py-4.5 bg-white border-b border-slate-200 flex justify-between items-center shrink-0">
                <div className="space-y-0.5">
                  <h4 className="font-heading font-extrabold text-base text-slate-800">
                    Initial Ticket Assessment
                  </h4>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                    Ticket {activeTicket?.id || ''}
                  </span>
                </div>
                <button 
                  onClick={() => setActiveModal('details')}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-650 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[65vh] overflow-y-auto">
                
                {/* Left Column: Priority & Personnel */}
                <div className="space-y-5 pr-0 md:pr-6 md:border-r md:border-slate-200 flex flex-col">
                  
                  {/* Step 1: Priority */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-600 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-extrabold">1</span>
                      Set Priority Level
                    </span>
                    <div className="flex gap-3">
                      {['Low', 'Medium', 'High'].map((p) => {
                        const isSelected = tempPriority === p;
                        return (
                          <button
                            type="button"
                            key={p}
                            onClick={() => setTempPriority(p)}
                            className={`
                              flex-1 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all
                              ${isSelected 
                                ? 'border-[#0B3A9B] bg-blue-50 text-[#0B3A9B] font-extrabold ring-1 ring-[#0B3A9B]' 
                                : 'border-slate-200 bg-white text-slate-650 hover:bg-slate-50'}
                            `}
                          >
                            {p}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 2: Personnel */}
                  <div className="space-y-3 flex-1 flex flex-col min-h-[300px]">
                    <span className="text-xs font-bold text-slate-600 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-extrabold">2</span>
                      Assign Personnel
                    </span>
                    
                    <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-3.5 focus-within:border-blue-650 transition-all">
                      <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                      <input
                        type="text"
                        value={personnelSearch}
                        onChange={(e) => setPersonnelSearch(e.target.value)}
                        placeholder="Search personnel..."
                        className="w-full bg-transparent border-0 outline-none py-2 text-xs font-bold text-slate-800 placeholder-slate-400"
                      />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 rounded-xl border border-slate-100 bg-slate-50 p-2">
                      {filteredPersonnel.map((p) => {
                        const isSelected = tempAssignee === p.name;
                        return (
                          <div
                            key={p.name}
                            onClick={() => setTempAssignee(isSelected ? '' : p.name)}
                            className={`
                              p-3 border rounded-xl flex gap-3 items-center cursor-pointer transition-all duration-200 text-left
                              ${isSelected 
                                ? 'border-[#0B2545] bg-blue-100/50 ring-1 ring-blue-200' 
                                : 'border-slate-200 bg-white hover:border-slate-300'}
                            `}
                          >
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0 text-slate-400">
                              <User className="w-4 h-4" />
                            </div>
                            <div className="space-y-0.5">
                              <h5 className="text-xs font-extrabold text-slate-900 leading-tight">
                                {p.name}
                              </h5>
                              <span className="text-[10px] text-slate-500 font-bold block">
                                {p.role} • {p.department}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Right Column: Internal Notes & Summary */}
                <div className="space-y-5 flex flex-col justify-between">
                  
                  {/* Step 3: Status */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-600 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-extrabold">3</span>
                      Set Ticket Status
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {['Submitted', 'Pending', 'In Progress', 'Resolved', 'Completed'].map((s) => {
                        const isSelected = tempStatus === s;
                        const label = s === 'Submitted' ? 'Unassigned' : s;
                        return (
                          <button
                            type="button"
                            key={s}
                            onClick={() => setTempStatus(s)}
                            className={`
                              flex-1 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all
                              ${isSelected 
                                ? 'border-[#0B3A9B] bg-blue-50 text-[#0B3A9B] font-extrabold ring-1 ring-[#0B3A9B]' 
                                : 'border-slate-200 bg-white text-slate-650 hover:bg-slate-50'}
                            `}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 4: Notes */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-600 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-extrabold">4</span>
                      Internal Notes (Optional)
                    </span>
                    <textarea
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      placeholder="Add any specific instructions for the assigned personnel..."
                      rows={5}
                      className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 transition-all shadow-sm resize-none"
                    ></textarea>
                  </div>

                  {/* Summary Box */}
                  <div className="bg-blue-50/50 p-4.5 rounded-2xl border border-blue-100 space-y-3">
                    <h5 className="text-[11px] font-extrabold text-blue-900 uppercase tracking-wider">Assignment Summary</h5>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center border-b border-blue-100/50 pb-2">
                        <span className="text-blue-700/80 font-bold">New Priority:</span>
                        <span className={`font-extrabold ${tempPriority ? 'text-blue-900' : 'text-slate-400'}`}>
                          {tempPriority || 'Not Set'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-blue-100/50 pb-2">
                        <span className="text-blue-700/80 font-bold">Assigned To:</span>
                        <span className={`font-extrabold ${tempAssignee ? 'text-blue-900' : 'text-slate-400'}`}>
                          {tempAssignee || 'None'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-blue-700/80 font-bold">New Status:</span>
                        <span className={`font-extrabold flex items-center gap-1 ${tempStatus === 'Submitted' ? 'text-slate-500' : 'text-emerald-700'}`}>
                          {tempStatus === 'Submitted' ? 'Unassigned' : tempStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl flex gap-3 items-start text-[11px] text-slate-600 leading-relaxed font-semibold">
                    <AlertCircle className="w-4.5 h-4.5 text-blue-600 shrink-0" />
                    <span>Confirming will immediately notify the assigned personnel and update the resident's ticket status.</span>
                  </div>

                </div>

              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-white border-t border-slate-200 flex justify-end gap-3 shrink-0 items-center">
                {(!tempPriority || !tempAssignee) && (
                  <span className="text-[10px] text-red-500 font-bold mr-auto">
                    * Please select both Priority and Personnel.
                  </span>
                )}
                <button
                  onClick={() => setActiveModal('details')}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  disabled={!tempPriority || !tempAssignee}
                  onClick={async () => {
                    await assignPersonnel(selectedTicketId, tempAssignee);
                    await updateTicketStatus(selectedTicketId, tempStatus, "Admin Officer", internalNotes, tempPriority);
                    await refreshData();
                    setActiveModal('status-success');
                  }}
                  className={`px-6 py-2.5 rounded-xl text-xs font-extrabold text-white transition-all shadow-md 
                    ${(!tempPriority || !tempAssignee) 
                      ? 'bg-slate-300 cursor-not-allowed' 
                      : 'bg-[#0B3A9B] hover:bg-[#093082] cursor-pointer'}`}
                >
                  Confirm Assignment
                </button>
              </div>

            </div>
          )}

          {/* E. STATUS SUCCESS POPUP (IMAGE 4) */}
          {activeModal === 'status-success' && (
            <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col p-8 items-center text-center animate-scale-up shrink-0">
              <div className="w-14 h-14 rounded-full bg-blue-50 border-4 border-blue-100 flex items-center justify-center text-blue-900 shadow-md">
                <Check className="w-7 h-7 text-[#0B2545] stroke-[3px]" />
              </div>
              
              <h4 className="font-heading font-extrabold text-lg text-slate-900 pt-5">
                Ticket Updated Successfully
              </h4>
              <p className="text-xs text-slate-500 font-bold pt-2 max-w-xs leading-relaxed">
                Your changes to "Ticket {activeTicket?.id || ''}" has been successfully updated.
              </p>
              
              <button
                onClick={() => {
                  setActiveModal(null);
                  setSelectedTicketId(null);
                }}
                className="w-full mt-6 py-3 rounded-xl bg-[#0B2545] hover:bg-[#081d36] text-sm font-extrabold text-white transition-all shadow-md cursor-pointer"
              >
                Done
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default AssignmentCenter;
