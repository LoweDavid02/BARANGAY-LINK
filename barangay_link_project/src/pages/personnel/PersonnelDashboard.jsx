import React, { useState } from 'react';
import { useTickets } from '../../context/TicketContext';
import { 
  Check, 
  X, 
  RotateCw, 
  Calendar, 
  SlidersHorizontal, 
  ArrowUpDown,
  CheckCircle,
  Star,
  Activity,
  MapPin,
  Info,
  TrendingUp,
  Play,
  AlertTriangle
} from 'lucide-react';

const PersonnelDashboard = () => {
  const { tickets, updateTicketStatus, currentUser, setCurrentRoute } = useTickets();
  const [toastMessage, setToastMessage] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);

  // Map API tickets to the expected dashboard task structure
  const tasks = tickets.map(ticket => {
    let priorityColor = 'bg-slate-50 text-slate-500 border-slate-105';
    if (ticket.priority === 'HIGH') {
      priorityColor = 'bg-rose-50 text-rose-600 border-rose-105';
    } else if (ticket.priority === 'MEDIUM') {
      priorityColor = 'bg-blue-50 text-blue-650 border-blue-105';
    }

    let statusColor = 'bg-slate-50 text-slate-500 border-slate-105';
    if (ticket.status === 'In Progress') {
      statusColor = 'bg-blue-50 text-blue-650 border-blue-105';
    } else if (ticket.status === 'Resolved') {
      statusColor = 'bg-emerald-50 text-emerald-600 border-emerald-105';
    }

    return {
      id: ticket.id,
      title: ticket.subject,
      description: ticket.description,
      priority: `${ticket.priority.charAt(0) + ticket.priority.slice(1).toLowerCase()} Priority`,
      priorityColor,
      location: ticket.location?.address || 'San Vicente, Apalit, Pampanga',
      lat: ticket.location?.lat || 14.9427,
      lng: ticket.location?.lng || 120.7621,
      status: ticket.status,
      statusColor,
      assigned: ticket.dateSubmitted || 'Just now',
      due: 'Within 24 Hours',
      personnel: {
        name: ticket.assignee || 'Unassigned',
        role: 'Field Personnel'
      },
      impact: `Category: ${ticket.category}. Resolving community requests safely.`
    };
  });

  // Calculate metrics dynamically based on live database data
  const resolvedCount = tickets.filter(t => t.status === 'Resolved').length;
  const totalCount = tickets.length;
  const completionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 100;
  const totalResolved = resolvedCount;

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

  return (
    <div className="space-y-4 text-left relative font-sans">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in">
          <Check className="w-5 h-5 shrink-0" />
          <span className="text-sm font-extrabold tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* Task Details Modal (Screenshot Match) */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col animate-scale-up relative p-6 md:p-8 space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="space-y-0.5 text-left">
                <span className="text-[10px] font-extrabold text-slate-400 block tracking-wider">#{selectedTask.id}</span>
                <h3 className="font-heading font-extrabold text-xl text-slate-900 leading-snug">
                  {selectedTask.title}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedTask(null)}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-650 transition-all cursor-pointer"
              >
                <X className="w-4.5 h-4.5 stroke-[2.5]" />
              </button>
            </div>

            {/* Grid Body */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              
              {/* Left Column (2/3 width) */}
              <div className="md:col-span-2 space-y-6">
                
                {/* Badges row */}
                <div className="flex flex-wrap gap-2.5">
                  {/* Status Badge */}
                  <span className={`px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${selectedTask.statusColor}`}>
                    <Activity className="w-3.5 h-3.5 shrink-0" />
                    {selectedTask.status}
                  </span>
                  
                  {/* Priority Badge */}
                  <span className={`px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${selectedTask.priorityColor}`}>
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 animate-pulse" />
                    {selectedTask.priority}
                  </span>
                </div>

                {/* Description Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
                  <h4 className="font-heading font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                    Description
                  </h4>
                  <p className="text-xs text-slate-650 font-semibold leading-relaxed">
                    {selectedTask.description}
                  </p>
                </div>

                {/* Location & Timeline Subgrid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Location Column */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      Location
                    </span>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-650 shrink-0" />
                      <span className="text-xs font-extrabold text-slate-800">{selectedTask.location}</span>
                    </div>
                    {/* Map Thumbnail image */}
                    <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-200 mt-2 bg-slate-100">
                      <iframe 
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        scrolling="no" 
                        marginHeight="0" 
                        marginWidth="0" 
                        src={`https://maps.google.com/maps?q=${selectedTask.lat},${selectedTask.lng}&z=15&output=embed`}
                        title="Task Location Map"
                      />
                    </div>
                  </div>

                  {/* Timeline Column */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      Timeline
                    </span>
                    
                    <div className="space-y-4">
                      {/* Assigned time row */}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div className="leading-snug text-left">
                          <span className="text-[10px] text-slate-400 font-bold block">Assigned</span>
                          <span className="text-xs font-extrabold text-slate-800">{selectedTask.assigned}</span>
                        </div>
                      </div>

                      {/* Due time row */}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div className="leading-snug text-left">
                          <span className="text-[10px] text-slate-400 font-bold block">Due</span>
                          <span className="text-xs font-extrabold text-slate-800">{selectedTask.due}</span>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

              </div>

              {/* Right Column (1/3 width) */}
              <div className="md:col-span-1 space-y-6">
                
                {/* Section: Personnel Assigned */}
                <div className="space-y-3">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Personnel Assigned
                  </span>
                  <div className="flex items-center justify-between border border-slate-200 rounded-2xl p-3.5 bg-white gap-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      {/* Circle Avatar placeholder */}
                      <div className="w-9 h-9 rounded-full border border-blue-600 bg-slate-50 flex items-center justify-center text-[#0B3A9B] font-bold text-xs shrink-0">
                        {selectedTask.personnel.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="leading-tight text-left">
                        <h5 className="text-xs font-extrabold text-slate-905">{selectedTask.personnel.name}</h5>
                        <span className="text-[10px] text-slate-400 font-bold block pt-0.5">{selectedTask.personnel.role}</span>
                      </div>
                    </div>
                    <button className="p-1 hover:bg-slate-50 rounded-lg text-slate-405 hover:text-slate-650 transition-colors">
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Section: Task Impact */}
                <div className="bg-[#EFF6FF]/60 border border-blue-100 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-[#0B3A9B]">
                    <TrendingUp className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-extrabold">Task Impact</span>
                  </div>
                  <p className="text-[11px] text-[#1E4E7C] font-semibold leading-relaxed">
                    {selectedTask.impact}
                  </p>
                </div>

              </div>

            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 pt-5 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setSelectedTask(null)}
                className="px-6 py-2.5 border border-[#0B3A9B] bg-white hover:bg-blue-50/20 text-[#0B3A9B] rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-sm"
              >
                Close
              </button>
              <button
                onClick={() => handleStartTask(selectedTask.id)}
                className="px-6 py-2.5 bg-[#0B3A9B] hover:bg-[#093082] text-white rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-all shadow-md"
              >
                <Play className="w-3.5 h-3.5 fill-white text-white shrink-0" />
                Start Task
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 1. TOP HEADER & PERFORMANCE TRACKING SUBTEXT */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="space-y-1">
          <h2 className="font-heading font-extrabold text-2xl tracking-tight text-slate-900">
            Personnel Overview
          </h2>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
            Tracking real-time performance and service delivery across B-Blink sectors.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => triggerToast('Dashboard metrics refreshed successfully!')}
            className="bg-[#0B3A9B] hover:bg-[#093082] text-white px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-all shadow-sm"
          >
            <RotateCw className="w-3.5 h-3.5 text-white" />
            Refresh Data
          </button>

          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs font-extrabold text-slate-650 shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-slate-405" />
            <span>Today: October 24, 2024</span>
          </div>
        </div>
      </div>

      {/* 2. METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Completion Rate */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Completion Rate</span>
            <h3 className="font-heading font-black text-3xl text-slate-800 tracking-tight">{completionRate}%</h3>
          </div>
          {/* Circular Progress Arc */}
          <div className="relative w-12 h-12 flex items-center justify-center bg-blue-50 rounded-full shrink-0">
            <svg className="w-10 h-10 transform -rotate-90">
              <circle cx="20" cy="20" r="16" className="stroke-slate-100" strokeWidth="3" fill="transparent" />
              <circle cx="20" cy="20" r="16" className="stroke-blue-600" strokeWidth="3" fill="transparent"
                strokeDasharray={2 * Math.PI * 16}
                strokeDashoffset={2 * Math.PI * 16 * (1 - completionRate / 100)}
                strokeLinecap="round"
              />
            </svg>
            <Activity className="absolute w-4.5 h-4.5 text-blue-600" />
          </div>
        </div>

        {/* Card 2: Total Resolved */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Resolved</span>
            <h3 className="font-heading font-black text-3xl text-slate-800 tracking-tight">{totalResolved}</h3>
            <span className="text-[10px] text-slate-450 font-bold block">Lifetime</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-650 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Ratings */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Your Ratings by Residents</span>
            <h3 className="font-heading font-black text-3xl text-slate-800 tracking-tight">
              4.9 <span className="text-sm text-slate-400 font-extrabold">/ 5.0</span>
            </h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
          </div>
        </div>

      </div>

      {/* 3. SPLIT WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left 2 Columns: Tasks to Accomplish */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-extrabold text-base text-slate-800">
              Tasks to Accomplish
            </h3>
            
            {/* Filter buttons */}
            <div className="flex gap-2">
              <button className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-650 rounded-xl transition-all cursor-pointer shadow-sm">
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
              <button className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-655 rounded-xl transition-all cursor-pointer shadow-sm">
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Grid Tasks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tasks.map((task) => (
              <div 
                key={task.id} 
                className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 hover:border-blue-600/30 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3 text-left">
                  {/* Card Header ID & Priority badge */}
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span>#{task.id}</span>
                    <span className={`px-2 py-0.5 rounded-lg border text-[9px] font-extrabold uppercase tracking-wider ${task.priorityColor}`}>
                      {task.priority}
                    </span>
                  </div>
                  
                  {/* Title & Description */}
                  <div className="space-y-1 text-left">
                    <h4 className="font-heading font-extrabold text-sm text-slate-900 leading-snug">
                      {task.title}
                    </h4>
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed line-clamp-2">
                      {task.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="border-t border-slate-100 pt-3 flex justify-start">
                    <button 
                      onClick={() => setSelectedTask(task)}
                      className="px-4.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right 1 Column: Weekly Chart & Recent History */}
        <div className="space-y-6">
          
          {/* Resolved per Day card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-5 text-left">
            <h3 className="font-heading font-extrabold text-sm text-slate-900">
              Resolved per Day
            </h3>

            {/* Custom Bar Chart */}
            <div className="space-y-4">
              <div className="h-32 flex items-end justify-between px-1 pt-2 gap-1.5">
                {[
                  { day: 'MON', val: 55 },
                  { day: 'TUE', val: 75 },
                  { day: 'WED', val: 40 },
                  { day: 'THU', val: 65 },
                  { day: 'FRI', val: 85, active: true },
                  { day: 'SAT', val: 12 },
                  { day: 'SUN', val: 12 }
                ].map((item, index) => (
                  <div key={index} className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-full bg-slate-50 rounded-t-lg h-24 flex items-end overflow-hidden">
                      <div 
                        className={`w-full rounded-t-lg transition-all duration-500 ${
                          item.active ? 'bg-[#0B3A9B]' : 'bg-[#93C5FD]/60'
                        }`}
                        style={{ height: `${item.val}%` }}
                      />
                    </div>
                    <span className={`text-[9px] tracking-wide ${
                      item.active ? 'text-[#0B3A9B] font-extrabold' : 'text-slate-405 font-bold'
                    }`}>
                      {item.day}
                    </span>
                  </div>
                ))}
              </div>

              {/* Average Completion Time Info */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-650 font-bold">
                  <span>Avg Completion Time</span>
                  <span className="text-slate-900 font-extrabold">2.4 hrs</span>
                </div>
                
                {/* Thick progress line indicator */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#0B3A9B] rounded-full w-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent History Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4 text-left">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Recent History</span>
            
            <div className="space-y-4">
              {[
                { id: 'BRG-2024-039', desc: 'Debris removal at Main Sq', time: '45m ago' },
                { id: 'BRG-2024-035', desc: 'Signage correction', time: '2h ago' },
                { id: 'BRG-2024-035', desc: 'Signage correction', time: '2h ago' },
                { id: 'BRG-2024-035', desc: 'Signage correction', time: '2h ago' },
                { id: 'BRG-2024-035', desc: 'Signage correction', time: '2h ago' },
                { id: 'BRG-2024-035', desc: 'Signage correction', time: '2h ago' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  {/* Bullet Dot */}
                  <div className="w-2 h-2 rounded-full bg-[#7E22CE] shrink-0 mt-1.5" />
                  
                  <div className="space-y-0.5 leading-snug">
                    <h4 className="font-extrabold text-slate-800">
                      Resolved #{item.id}
                    </h4>
                    <p className="text-[10px] text-slate-405 font-bold">
                      {item.desc} • {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default PersonnelDashboard;
