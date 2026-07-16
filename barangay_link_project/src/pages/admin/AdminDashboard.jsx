import React, { useState } from 'react';
import { useTickets } from '../../context/TicketContext';
import { 
  CheckCircle, 
  Clock, 
  RefreshCw,
  ChevronDown,
  Inbox,
  AlertTriangle,
  Activity,
  Shield,
  ArrowRight,
  MapPin,
  Calendar
} from 'lucide-react';
import DashboardMap from '../../components/DashboardMap';

const AdminDashboard = () => {
  const { tickets, setCurrentRoute } = useTickets();
  const [refreshing, setRefreshing] = useState(false);

  // Dynamic calculations to match KPI numbers from the screenshot
  const totalTicketsCount = tickets.length;
  const pendingCount = tickets.filter(t => t.status === 'Submitted' || t.status === 'Needs Attention').length;
  const inProgressCount = tickets.filter(t => t.status === 'In Progress').length;
  
  // Format numbers to two digits (e.g. 02)
  const formatNum = (num) => num.toString().padStart(2, '0');

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  // Mock bar chart data to match the screenshot dynamics
  const barData = [
    { day: '01 May', value: 40, active: false },
    { day: '', value: 62, active: false },
    { day: '', value: 50, active: false },
    { day: '07 May', value: 85, active: true }, // highlighted dark blue
    { day: '', value: 72, active: false },
    { day: '', value: 52, active: false },
    { day: '14 May', value: 58, active: false },
    { day: '', value: 92, active: true }, // highlighted dark blue
    { day: '', value: 80, active: false },
    { day: '21 May', value: 54, active: false },
    { day: '', value: 36, active: false },
    { day: '28 May', value: 18, active: false },
  ];

  return (
    <div className="space-y-4 text-left">
      
      {/* Header Panel Action Bar */}
      <div className="flex justify-end items-center">
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-[#0B3A9B] hover:bg-[#093082] text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-98 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* 1. FOUR KPI CARDS (MATCHING THE SCREENSHOT) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Total Tickets */}
        <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 block">Total Tickets</span>
            <div className="flex items-end gap-1.5">
              <h3 className="font-heading font-extrabold text-3xl text-slate-900 leading-none">
                {formatNum(totalTicketsCount)}
              </h3>
              <span className="text-[10px] text-slate-400 font-bold mb-0.5">+10% total</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle className="w-4.5 h-4.5 text-emerald-650" />
          </div>
        </div>

        {/* KPI 2: Pending Tickets */}
        <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 block">Pending Tickets</span>
            <div className="flex items-end gap-1.5">
              <h3 className="font-heading font-extrabold text-3xl text-slate-900 leading-none">
                {formatNum(pendingCount)}
              </h3>
              <span className="text-[10px] text-slate-400 font-bold mb-0.5">Needs attention</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-orange-100/80 flex items-center justify-center text-orange-600 shrink-0">
            <Clock className="w-4.5 h-4.5 text-orange-600" />
          </div>
        </div>

        {/* KPI 3: In Progress */}
        <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 block">In Progress</span>
            <div className="flex items-end gap-1.5">
              <h3 className="font-heading font-extrabold text-3xl text-slate-900 leading-none">
                {formatNum(inProgressCount)}
              </h3>
              <span className="text-[10px] text-slate-400 font-bold mb-0.5">Active Now</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <RefreshCw className="w-4.5 h-4.5 text-blue-600" />
          </div>
        </div>

        {/* KPI 4: Active */}
        <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 block">Active</span>
            <div className="flex items-end gap-1.5">
              <h3 className="font-heading font-extrabold text-3xl text-slate-900 leading-none">
                {formatNum(totalTicketsCount)}
              </h3>
              <span className="text-[10px] text-slate-400 font-bold mb-0.5">Registered</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle className="w-4.5 h-4.5 text-emerald-650" />
          </div>
        </div>

      </div>

      {/* 2. DUAL COLUMN LAYOUT CHART & CATEGORIES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left Card: Ticket Volume Dynamics Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          
          {/* Chart Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h4 className="font-heading font-bold text-base text-slate-900">
                Ticket Volume Dynamics
              </h4>
              <p className="text-xs text-slate-400 font-semibold">
                Submission trends over the last 30 days
              </p>
            </div>
            
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 transition-colors cursor-pointer">
              Last 30 Days
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Bar Chart Columns */}
          <div className="pt-8 pb-4">
            <div className="flex items-end justify-between h-48 w-full px-2">
              {barData.map((bar, idx) => (
                <div key={idx} className="flex-1 flex flex-col justify-end items-center h-full group">
                  
                  {/* Tooltip on Hover */}
                  <div className="relative w-full flex justify-center">
                    <span className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow pointer-events-none z-10">
                      {Math.round(bar.value / 5)}
                    </span>
                  </div>

                  {/* Vertical Column Bar */}
                  <div 
                    style={{ height: `${bar.value}%` }}
                    className={`w-[60%] sm:w-[50%] rounded-t-sm transition-all duration-500 cursor-pointer
                      ${bar.active 
                        ? 'bg-[#1E293B] hover:bg-[#0F172A]' 
                        : 'bg-[#93C5FD] hover:bg-[#60A5FA] opacity-80'}`}
                  ></div>
                </div>
              ))}
            </div>

            {/* X-Axis labels matching screenshot layout */}
            <div className="flex justify-between px-2 pt-2 border-t border-slate-100 text-[10px] font-bold text-slate-450 tracking-wide uppercase">
              <span className="w-12 text-center">01 May</span>
              <span className="w-12 text-center">07 May</span>
              <span className="w-12 text-center">14 May</span>
              <span className="w-12 text-center">21 May</span>
              <span className="w-12 text-center">28 May</span>
            </div>
          </div>

        </div>

        {/* Right Card: Category Breakdown */}
        <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          
          {/* Card Header */}
          <div className="space-y-1 pb-4">
            <h4 className="font-heading font-bold text-base text-slate-900">
              Category Breakdown
            </h4>
          </div>

          {/* Progress Bars Stack */}
          <div className="space-y-5 flex-1 flex flex-col justify-center">
            
            {/* Complaints (42%) */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500 font-semibold">Complaints</span>
                <span className="text-slate-800 font-extrabold">42%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#1E5AE6] h-full rounded-full transition-all duration-1000" 
                  style={{ width: '42%' }}
                ></div>
              </div>
            </div>

            {/* Service Requests (28%) */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500 font-semibold">Service Requests</span>
                <span className="text-slate-800 font-extrabold">28%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#C27852] h-full rounded-full transition-all duration-1000" 
                  style={{ width: '28%' }}
                ></div>
              </div>
            </div>

            {/* General Concerns (15%) */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500 font-semibold">General Concerns</span>
                <span className="text-slate-800 font-extrabold">15%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-slate-400 h-full rounded-full transition-all duration-1000" 
                  style={{ width: '15%' }}
                ></div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* 3. TICKET HEATMAP MAP */}
      <DashboardMap tickets={tickets} />

      {/* 3. NEW TICKETS SECTION */}
      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
        
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="font-heading font-bold text-base text-slate-900">
              New Tickets
            </h4>
            <p className="text-xs text-slate-400 font-semibold">
              Recently submitted tickets awaiting review and assignment
            </p>
          </div>
          <button
            onClick={() => setCurrentRoute('admin-assign')}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0B3A9B] hover:bg-[#093082] text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-98 cursor-pointer"
          >
            View All Tickets
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-3 px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Ticket ID</th>
                <th className="py-3 px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Subject</th>
                <th className="py-3 px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="py-3 px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Location</th>
                <th className="py-3 px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Priority</th>
                <th className="py-3 px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Date</th>
                <th className="py-3 px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tickets
                .filter(t => t.status === 'Submitted' || t.status === 'Needs Attention')
                .slice(0, 5)
                .map((ticket) => {
                  const priorityStyle = ticket.priority === 'Urgent' ? 'bg-red-50 text-red-600 border-red-100'
                    : ticket.priority === 'High' ? 'bg-orange-50 text-orange-600 border-orange-100'
                    : ticket.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100'
                    : 'bg-slate-50 text-slate-500 border-slate-100';

                  return (
                    <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-3 font-black text-slate-800 uppercase">{ticket.id}</td>
                      <td className="py-3.5 px-3 font-semibold text-slate-700 max-w-[200px] truncate">{ticket.subject}</td>
                      <td className="py-3.5 px-3 font-semibold text-slate-500 hidden md:table-cell">{ticket.category}</td>
                      <td className="py-3.5 px-3 hidden lg:table-cell">
                        <span className="flex items-center gap-1 text-slate-500 font-semibold">
                          <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                          <span className="truncate max-w-[150px]">{ticket.location?.address || 'N/A'}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded-lg border text-[9px] font-extrabold uppercase tracking-wider ${priorityStyle}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 hidden sm:table-cell">
                        <span className="flex items-center gap-1 text-slate-400 font-semibold">
                          <Calendar className="w-3 h-3 shrink-0" />
                          {new Date(ticket.dateSubmitted).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-lg border text-[9px] font-extrabold uppercase tracking-wider bg-yellow-50 text-yellow-600 border-yellow-100">
                          {ticket.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              {tickets.filter(t => t.status === 'Submitted' || t.status === 'Needs Attention').length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 font-semibold">
                    No new tickets at this time.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
