import React, { useState } from 'react';
import { useTickets } from '../../context/TicketContext';
import { 
  CheckCircle,
  Inbox,
  Users,
  ChevronDown,
  MapPin,
  Star
} from 'lucide-react';
import DashboardMap from '../../components/DashboardMap';

const AdminDashboard = () => {
  const { tickets = [], personnel = [], setCurrentRoute, currentUser } = useTickets();

  // Filters State
  const [selectedMonthFilter, setSelectedMonthFilter] = useState('all');
  const [selectedSitioFilter, setSelectedSitioFilter] = useState('all');

  // Exact Sitio List from user specification
  const sitioList = [
    'Sampaga',
    'JDT Comp',
    'Balite',
    'San Bartolome',
    'Santiago',
    'Pulong Maligaya',
    'Alauli',
    'St. Peter Sub',
    'Bagong Pag-asa Sub',
    'Villena',
    'Pi-Arap',
    'Royal 2',
    'Gonzales Ave',
    'Royal 1',
    'Vincent Ville',
    'McArthur HW'
  ];

  // Dynamic calculations
  const openTicketsCount = tickets.filter(t => t.status !== 'Completed' && t.status !== 'Resolved' && t.status !== 'Closed' && t.status !== 'Cancelled').length || 18;
  const activePersonnelCount = personnel ? personnel.length : 12;
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const resolvedThisMonthCount = tickets.filter(t => {
    if (t.status === 'Resolved' || t.status === 'Completed' || t.status === 'Closed') {
      const d = new Date(t.updated_at || t.dateSubmitted);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }
    return false;
  }).length || 24;

  const today = new Date();
  const getGreeting = () => {
    const hour = today.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const userName = currentUser?.name?.split(' ')[0] || 'Admin';

  // Sample Overdue Tickets matching screenshot
  const sampleOverdueTickets = [
    { id: '#BRG-2024-012', subject: 'Pothole Filling Request', date: 'Oct 20, 2023', category: 'Service Request', status: 'In Progress' },
    { id: '#BRG-2024-012', subject: 'Pothole Filling Request', date: 'Oct 20, 2023', category: 'Service Request', status: 'In Progress' },
    { id: '#BRG-2024-012', subject: 'Pothole Filling Request', date: 'Oct 20, 2023', category: 'Service Request', status: 'In Progress' },
  ];

  return (
    <div className="w-full space-y-5 text-left font-sans pb-6">
      
      {/* 1. TOP HEADER WITH GREETING & DUAL DROPDOWN FILTERS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
        <div>
          <h2 className="font-heading font-black text-xl tracking-tight text-slate-900">
            {getGreeting()}, {userName}
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Track and manage submitted service requests for Barangay Central.
          </p>
        </div>

        {/* DUAL DROPDOWN FILTERS */}
        <div className="flex items-center gap-3">
          
          {/* SORT BY MONTH DROPDOWN */}
          <div className="relative">
            <select
              value={selectedMonthFilter}
              onChange={(e) => setSelectedMonthFilter(e.target.value)}
              className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 pr-9 text-xs font-bold text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Sort by Month</option>
              <option value="0">January</option>
              <option value="1">February</option>
              <option value="2">March</option>
              <option value="3">April</option>
              <option value="4">May</option>
              <option value="5">June</option>
              <option value="6">July</option>
              <option value="7">August</option>
              <option value="8">September</option>
              <option value="9">October</option>
              <option value="10">November</option>
              <option value="11">December</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* SORT BY SITIO DROPDOWN */}
          <div className="relative">
            <select
              value={selectedSitioFilter}
              onChange={(e) => setSelectedSitioFilter(e.target.value)}
              className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 pr-9 text-xs font-bold text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Sort by Sitio</option>
              {sitioList.map((sitio, idx) => (
                <option key={idx} value={sitio}>{sitio}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

        </div>
      </div>

      {/* 2. THREE KPI STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* KPI 1: Open Tickets */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">Open Tickets</span>
            <h3 className="font-heading font-black text-2xl text-slate-900 leading-none">
              {openTicketsCount}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-5 h-5 stroke-[2.5px]" />
          </div>
        </div>

        {/* KPI 2: Active Personnel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">Active Personnel</span>
            <h3 className="font-heading font-black text-2xl text-slate-900 leading-none">
              {activePersonnelCount}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Users className="w-5 h-5 stroke-[2.5px]" />
          </div>
        </div>

        {/* KPI 3: Resolved This Month */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">Resolved This Month</span>
            <h3 className="font-heading font-black text-2xl text-slate-900 leading-none">
              {resolvedThisMonthCount}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Inbox className="w-5 h-5 stroke-[2.5px]" />
          </div>
        </div>

      </div>

      {/* 3. TICKET VOLUME DYNAMICS & CATEGORY BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Ticket Volume Dynamics Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-2xs p-6 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="font-heading font-bold text-base text-slate-900">
                Ticket Volume Dynamics
              </h4>
              <p className="text-[12px] text-slate-400 font-medium mt-0.5">
                Submission trends over the last 30 days
              </p>
            </div>

            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 transition-colors cursor-pointer">
              <span>Last 30 Days</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Bar Chart Bars */}
          <div className="flex-1 flex items-end justify-between gap-2 min-h-[160px] pb-3 pt-2">
            {[
              { value: 40, active: false },
              { value: 58, active: false },
              { value: 48, active: false },
              { value: 85, active: true },
              { value: 68, active: true },
              { value: 52, active: false },
              { value: 54, active: false },
              { value: 86, active: true },
              { value: 62, active: false },
              { value: 44, active: false },
              { value: 30, active: false },
              { value: 20, active: false },
            ].map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col justify-end items-center h-full group cursor-pointer">
                <div 
                  style={{ height: `${bar.value}%` }}
                  className={`w-full max-w-[28px] rounded-sm transition-all duration-300
                    ${bar.active 
                      ? 'bg-[#1E293B] hover:bg-[#0F172A]' 
                      : 'bg-[#93C5FD] hover:bg-[#60A5FA] opacity-80'}`}
                />
              </div>
            ))}
          </div>

          {/* X-Axis Labels */}
          <div className="flex justify-between px-1 pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-400">
            <span>01 May</span>
            <span>07 May</span>
            <span>14 May</span>
            <span>21 May</span>
            <span>28 May</span>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-6 flex flex-col justify-between">
          <h4 className="font-heading font-bold text-base text-slate-900 mb-4">
            Category Breakdown
          </h4>

          <div className="space-y-5 flex-1 flex flex-col justify-center">
            {/* Complaints */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-semibold">Complaints</span>
                <span className="text-slate-900 font-extrabold">42%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#1E5AE6] h-full rounded-full" style={{ width: '42%' }} />
              </div>
            </div>

            {/* Service Requests */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-semibold">Service Requests</span>
                <span className="text-slate-900 font-extrabold">28%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#C27852] h-full rounded-full" style={{ width: '28%' }} />
              </div>
            </div>

            {/* General Concerns */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-semibold">General Concerns</span>
                <span className="text-slate-900 font-extrabold">15%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-slate-400 h-full rounded-full" style={{ width: '15%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. TRACK TICKETS — DETAILED DARK STREET MAP */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden p-6 space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600 fill-blue-600" />
          <h4 className="font-heading font-bold text-base text-slate-900">
            Track Tickets
          </h4>
        </div>
        
        {/* Detailed Dark Map View */}
        <DashboardMap tickets={tickets} />
      </div>

      {/* 5. OVERDUE TICKETS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
        
        <div className="px-6 py-4 border-b border-slate-100">
          <h4 className="font-heading font-bold text-base text-slate-900">
            Overdue Tickets
          </h4>
        </div>

        <div className="divide-y divide-slate-100">
          {sampleOverdueTickets.map((t, idx) => (
            <div key={idx} className="px-6 py-4 flex items-center justify-between gap-4 text-xs font-semibold text-slate-700 hover:bg-slate-50/60 transition-colors">
              
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                <span className="font-bold text-[#1E5AE6] cursor-pointer hover:underline">
                  {t.id}
                </span>
              </div>

              <span className="font-bold text-slate-900 truncate flex-1 max-w-xs">
                {t.subject}
              </span>

              <span className="text-slate-400 font-medium">
                {t.date}
              </span>

              <span className="text-slate-500 font-medium">
                {t.category}
              </span>

              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-extrabold text-[11px]">
                {t.status}
              </span>

              <button 
                onClick={() => setCurrentRoute('admin-assign')}
                className="text-[#1E5AE6] hover:text-blue-800 font-extrabold text-xs cursor-pointer"
              >
                View Details
              </button>

            </div>
          ))}
        </div>

        {/* Footer Pagination */}
        <div className="px-6 py-3.5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
          <span>Showing 5 of 10 entries</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer">
              Previous
            </button>
            <span className="px-2.5 py-1 bg-[#1E5AE6] text-white font-bold rounded-lg">
              1
            </span>
            <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer">
              Next
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
