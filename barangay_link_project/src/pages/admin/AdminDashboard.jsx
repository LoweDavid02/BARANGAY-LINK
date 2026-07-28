import React, { useState } from 'react';
import { useTickets } from '../../context/TicketContext';
import { 
  CheckCircle,
  Inbox,
  Clock,
  MapPin,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import DashboardMap from '../../components/DashboardMap';

const AdminDashboard = () => {
  const { tickets, personnel, setCurrentRoute } = useTickets();

  const [sortMonth, setSortMonth] = useState('Sort by Month');
  const [sortSitio, setSortSitio] = useState('Sort by Sitio');
  const [showSitioDropdown, setShowSitioDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const sitios = [
    "Sampaga", "JDT Comp", "Balite", "San Bartolome", "Santiago", 
    "Pulong Maligaya", "Alauli", "St. Peter Sub", "Bagong Pag-asa Sub", 
    "Villena", "Pi-Arap", "Royal 2", "Gonzales Ave", "Royal 1", 
    "Vincent Ville", "McArthur HW"
  ];

  // Dynamic KPI counts
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

  // Overdue / Action tickets
  const overdueTickets = [
    { id: '#BRG-2024-012', subject: 'Pothole Filling Request', date: 'Oct 20, 2023', category: 'Service Request', status: 'In Progress' },
    { id: '#BRG-2024-012', subject: 'Pothole Filling Request', date: 'Oct 20, 2023', category: 'Service Request', status: 'In Progress' },
    { id: '#BRG-2024-012', subject: 'Pothole Filling Request', date: 'Oct 20, 2023', category: 'Service Request', status: 'In Progress' },
  ];

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* 1. WELCOME HEADER + TOP FILTERS */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-2.5xl tracking-tight text-[#1E2536]">
            Good Evening, Admin
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Track and manage submitted service requests for Barangay Central.
          </p>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-3 relative shrink-0">
          {/* Sort by Month */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowMonthDropdown(!showMonthDropdown);
                setShowSitioDropdown(false);
              }}
              className="flex items-center justify-between gap-6 px-4 py-2 bg-white border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 min-w-[140px] cursor-pointer"
            >
              <span>{sortMonth}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {showMonthDropdown && (
              <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1.5 text-xs font-medium text-slate-700">
                {['All Months', 'Last 30 Days', 'This Month', 'Last Month'].map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setSortMonth(m);
                      setShowMonthDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors"
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort by Sitio */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowSitioDropdown(!showSitioDropdown);
                setShowMonthDropdown(false);
              }}
              className="flex items-center justify-between gap-6 px-4 py-2 bg-white border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 min-w-[140px] cursor-pointer"
            >
              <span>{sortSitio}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {showSitioDropdown && (
              <div className="absolute right-0 mt-1 w-48 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1.5 text-xs font-medium text-slate-700">
                {sitios.map((sitio) => (
                  <button
                    key={sitio}
                    onClick={() => {
                      setSortSitio(sitio);
                      setShowSitioDropdown(false);
                    }}
                    className="w-full text-left px-4 py-1.5 hover:bg-slate-50 transition-colors"
                  >
                    {sitio}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. KPI CARDS (3 Cards with green & orange badges) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* KPI 1: Open Tickets */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/70 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 block">Open Tickets</span>
            <h3 className="font-heading font-extrabold text-2xl text-slate-900 leading-none">
              {openTicketsCount || 24}
            </h3>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>

        {/* KPI 2: Active Personnel */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/70 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 block">Active Personnel</span>
            <h3 className="font-heading font-extrabold text-2xl text-slate-900 leading-none">
              {activePersonnelCount || 18}
            </h3>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* KPI 3: Resolved This Month */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/70 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 block">Resolved This Month</span>
            <h3 className="font-heading font-extrabold text-2xl text-slate-900 leading-none">
              {resolvedThisMonthCount || 42}
            </h3>
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <Inbox className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 3. TICKET VOLUME DYNAMICS + CATEGORY BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left: Ticket Volume Dynamics Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xs border border-slate-200/70 p-6 flex flex-col">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h4 className="font-heading font-bold text-base text-slate-900">
                Ticket Volume Dynamics
              </h4>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Submission trends over the last 30 days
              </p>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer">
              Last 30 Days
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Bar Chart */}
          <div className="flex-1 flex items-end justify-between gap-2.5 min-h-[160px] pb-4 px-2">
            {[
              { value: 45, dark: false },
              { value: 65, dark: false },
              { value: 55, dark: false },
              { value: 90, dark: true },
              { value: 72, dark: true },
              { value: 60, dark: false },
              { value: 65, dark: false },
              { value: 90, dark: true },
              { value: 75, dark: true },
              { value: 58, dark: false },
              { value: 38, dark: false },
              { value: 25, dark: false },
            ].map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col justify-end items-center h-full group cursor-pointer">
                <div 
                  style={{ height: `${bar.value}%` }}
                  className={`w-full rounded-t-xs transition-all duration-300 ${
                    bar.dark ? 'bg-[#31415B]' : 'bg-[#92A7CF]'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* X-Axis Dates */}
          <div className="flex justify-between px-2 pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-400 tracking-tight">
            <span>01 May</span>
            <span>07 May</span>
            <span>14 May</span>
            <span>21 May</span>
            <span>28 May</span>
          </div>
        </div>

        {/* Right: Category Breakdown Progress Bars */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/70 p-6 flex flex-col">
          <h4 className="font-heading font-bold text-base text-slate-900 mb-6">
            Category Breakdown
          </h4>

          <div className="space-y-6 flex-1 flex flex-col justify-center">
            {/* Complaints */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-600 block">Complaints</span>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#5B739B] h-full rounded-full" style={{ width: '70%' }} />
              </div>
            </div>

            {/* Service Requests */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-600 block">Service Requests</span>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#B07D62] h-full rounded-full" style={{ width: '45%' }} />
              </div>
            </div>

            {/* General Concerns */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-600 block">General Concerns</span>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-slate-400 h-full rounded-full" style={{ width: '30%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. TRACK TICKETS — DARK LEAFLET MAP */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/70 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600 fill-blue-600/20" />
          <h4 className="font-heading font-bold text-sm text-slate-900">
            Track Tickets
          </h4>
        </div>
        <DashboardMap tickets={tickets} />
      </div>

      {/* 5. OVERDUE TICKETS LIST */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/70 overflow-hidden">
        
        {/* Section Header */}
        <div className="px-6 py-4 border-b border-slate-100">
          <h4 className="font-heading font-bold text-sm text-slate-900">
            Overdue Tickets
          </h4>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-slate-100">
          {overdueTickets.map((t, idx) => (
            <div key={idx} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
              
              {/* Red dot + ID */}
              <div className="flex items-center gap-3 w-40 shrink-0">
                <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                <span className="text-xs font-bold text-blue-600">{t.id}</span>
              </div>

              {/* Subject */}
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-slate-800 block truncate">{t.subject}</span>
              </div>

              {/* Date */}
              <span className="text-xs font-medium text-slate-400 w-32 shrink-0">
                {t.date}
              </span>

              {/* Category */}
              <span className="text-xs font-medium text-slate-500 w-36 shrink-0 leading-tight">
                Service<br />Request
              </span>

              {/* Status Pill */}
              <div className="w-32 shrink-0">
                <span className="inline-block px-3 py-1 bg-amber-100/70 text-amber-800 text-[11px] font-bold rounded-full border border-amber-200/50">
                  {t.status}
                </span>
              </div>

              {/* Action Link */}
              <button 
                onClick={() => setCurrentRoute('admin-assign')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline shrink-0 cursor-pointer"
              >
                View Details
              </button>
            </div>
          ))}
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Showing 5 of 10 entries</span>
          
          <div className="flex items-center gap-1.5">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="px-2.5 py-1 rounded-md border border-slate-200/80 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>
            <span className="w-7 h-7 rounded-md border border-slate-300 text-slate-800 font-bold flex items-center justify-center">
              1
            </span>
            <button 
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="px-2.5 py-1 rounded-md border border-slate-200/80 hover:bg-slate-50 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
