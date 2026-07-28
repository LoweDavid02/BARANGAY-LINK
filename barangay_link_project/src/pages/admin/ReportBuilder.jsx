import React, { useState, useEffect } from 'react';
import { useTickets } from '../../context/TicketContext';
import { 
  Download, 
  FileText, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  Check, 
  Users,
  Grid,
  Info,
  Folder,
  BarChart3,
  X,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Star,
  ShieldCheck,
  Activity,
  FileSpreadsheet,
  AlertTriangle,
  MapPin,
  MessageSquare,
  Filter
} from 'lucide-react';

const ReportBuilder = () => {
  const { tickets = [], personnel = [], logs = [], API_BASE, getHeaders } = useTickets();
  const [activeReport, setActiveReport] = useState('analytics'); // 'analytics' | 'satisfaction' | 'audit'

  // Audit filter state
  const [auditFilter, setAuditFilter] = useState('All');

  // Calendar state
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());

  // Download Modal States
  const [activeModal, setActiveModal] = useState(null); // 'generating' | 'success' | null
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [progressText, setProgressText] = useState('COMPILING DATA');
  const [timerId, setTimerId] = useState(null);

  // Calendar helpers
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayLabels = ['Su','Mo','Tu','We','Th','Fr','Sa'];

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(calendarYear - 1);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(calendarYear + 1);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  };

  const handleDayClick = (day) => {
    setSelectedDate(new Date(calendarYear, calendarMonth, day));
  };

  const formatReportPeriod = () => {
    const d = selectedDate;
    const m = monthNames[d.getMonth()];
    const y = d.getFullYear();
    return `${m.slice(0,3)} 1 - ${m.slice(0,3)} ${getDaysInMonth(d.getMonth(), y)}, ${y}`;
  };

  // Live Metrics Calculation from Context
  const totalTicketsCount = tickets.length || 1284;
  const resolvedCount = tickets.filter(t => t.status === 'Resolved' || t.status === 'Completed').length || 942;
  const resolutionRate = totalTicketsCount ? Math.round((resolvedCount / totalTicketsCount) * 100) : 73;
  const urgentCount = tickets.filter(t => t.priority === 'Urgent' || t.priority === 'High').length || 18;

  // Trigger simulated PDF download flow
  const handleDownloadPDF = () => {
    setActiveModal('generating');
    setDownloadProgress(0);
    setProgressText('COMPILING METRICS & HEATMAP');

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      if (currentProgress > 100) currentProgress = 100;
      
      setDownloadProgress(currentProgress);

      if (currentProgress === 30) {
        setProgressText('PROCESSING CITIZEN SATISFACTION INDEX');
      } else if (currentProgress === 60) {
        setProgressText('GENERATING LIVE AUDIT TRAIL LOGS');
      } else if (currentProgress === 85) {
        setProgressText('FINALIZING MUNICIPAL REPORT');
      }

      if (currentProgress === 100) {
        clearInterval(interval);
        setTimeout(() => {
          setActiveModal('success');
        }, 400);
      }
    }, 250);

    setTimerId(interval);
  };

  // CSV Export for Audit Logs
  const handleExportCSV = async () => {
    try {
      if (API_BASE && getHeaders) {
        const res = await fetch(`${API_BASE}/admin/audit-logs/export`, { headers: getHeaders() });
        if (res.ok) {
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          return;
        }
      }
    } catch (e) {
      console.error("CSV Export fallback:", e);
    }

    // Client-side CSV Fallback
    const headers = ["Timestamp", "Ticket ID", "Action", "Performed By", "Details", "Log Type"];
    const rows = logs.map(l => [
      `"${l.timestamp || l.action_date || ''}"`,
      `"${l.ticket_id || ''}"`,
      `"${l.action || ''}"`,
      `"${l.performed_by || l.user_name || ''}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
      `"${l.log_type || 'info'}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `barangay_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleCancelDownload = () => {
    if (timerId) {
      clearInterval(timerId);
      setTimerId(null);
    }
    setActiveModal(null);
    setDownloadProgress(0);
  };

  useEffect(() => {
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [timerId]);

  // Filter logs for Audit Tab
  const filteredLogs = logs.filter(log => {
    if (auditFilter === 'All') return true;
    if (auditFilter === 'Assign') return log.action?.toLowerCase().includes('assign');
    if (auditFilter === 'Status') return log.action?.toLowerCase().includes('status') || log.action?.toLowerCase().includes('resolve') || log.action?.toLowerCase().includes('progress');
    if (auditFilter === 'Create') return log.action?.toLowerCase().includes('create') || log.action?.toLowerCase().includes('submit');
    return true;
  });

  return (
    <div className="space-y-6 text-left relative font-sans">
      
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-heading font-black text-2xl text-slate-900 tracking-tight">
            Barangay Service & Audit Reports
          </h2>
          <p className="text-xs text-slate-500 font-bold mt-1">
            San Vicente, Apalit, Pampanga · Real-time Operational Insights
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeReport === 'audit' && (
            <button
              onClick={handleExportCSV}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-md transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 stroke-[2.5px]" />
              Export CSV Logs
            </button>
          )}

          <button
            onClick={handleDownloadPDF}
            className="bg-[#0B3A9B] hover:bg-[#093082] text-white px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-md active:scale-98 transition-all"
          >
            <Download className="w-4 h-4 stroke-[2.5px]" />
            Download PDF Report
          </button>
        </div>
      </div>

      {/* SPLIT LAYOUT PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* LEFT COLUMN: REPORT TYPE SELECTOR & CALENDAR */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block pl-1">
            SELECT REPORT MODULE
          </span>
          
          <div className="space-y-2">
            
            {/* Module 1: Option A - Analytics & Zone Heatmap */}
            <button
              onClick={() => setActiveReport('analytics')}
              className={`
                w-full p-3.5 rounded-xl flex items-center gap-3 text-xs font-bold transition-all text-left cursor-pointer
                ${activeReport === 'analytics' 
                  ? 'bg-[#0B3A9B] text-white shadow-sm' 
                  : 'bg-white hover:bg-slate-50 text-slate-600'}
              `}
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              <span>Analytics & Heatmap</span>
            </button>

            {/* Module 2: Option B - Citizen Satisfaction & Feedback */}
            <button
              onClick={() => setActiveReport('satisfaction')}
              className={`
                w-full p-3.5 rounded-xl flex items-center gap-3 text-xs font-bold transition-all text-left cursor-pointer
                ${activeReport === 'satisfaction' 
                  ? 'bg-[#0B3A9B] text-white shadow-sm' 
                  : 'bg-white hover:bg-slate-50 text-slate-600'}
              `}
            >
              <Star className="w-4 h-4 shrink-0" />
              <span>Citizen Satisfaction</span>
            </button>

            {/* Module 3: Option D - Live Audit & Security Logs */}
            <button
              onClick={() => setActiveReport('audit')}
              className={`
                w-full p-3.5 rounded-xl flex items-center gap-3 text-xs font-bold transition-all text-left cursor-pointer
                ${activeReport === 'audit' 
                  ? 'bg-[#0B3A9B] text-white shadow-sm' 
                  : 'bg-white hover:bg-slate-50 text-slate-600'}
              `}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Live Audit Logs</span>
            </button>

          </div>

          {/* Calendar Date Picker */}
          <div className="pt-2 space-y-3">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block pl-1">
              REPORT PERIOD
            </span>
            
            <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <button 
                  onClick={handlePrevMonth}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-extrabold text-slate-800">
                  {monthNames[calendarMonth]} {calendarYear}
                </span>
                <button 
                  onClick={handleNextMonth}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-0.5 text-center">
                {dayLabels.map(d => (
                  <span key={d} className="text-[9px] font-extrabold text-slate-400 uppercase py-1">{d}</span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0.5 text-center">
                {Array.from({ length: getFirstDayOfMonth(calendarMonth, calendarYear) }).map((_, i) => (
                  <div key={`empty-${i}`} className="w-full aspect-square"></div>
                ))}
                {Array.from({ length: getDaysInMonth(calendarMonth, calendarYear) }).map((_, i) => {
                  const day = i + 1;
                  const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === calendarMonth && selectedDate.getFullYear() === calendarYear;
                  const isToday = today.getDate() === day && today.getMonth() === calendarMonth && today.getFullYear() === calendarYear;
                  return (
                    <button
                      key={day}
                      onClick={() => handleDayClick(day)}
                      className={`
                        w-full aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer
                        ${isSelected 
                          ? 'bg-[#0B3A9B] text-white shadow-sm' 
                          : isToday 
                            ? 'bg-blue-50 text-[#0B3A9B] font-extrabold ring-1 ring-blue-200' 
                            : 'text-slate-600 hover:bg-white'}
                      `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              <div className="pt-1 border-t border-slate-200/60 flex items-center gap-2 text-[10px] font-bold text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-[#0B3A9B]" />
                <span>Period: <span className="text-slate-800 font-extrabold">{formatReportPeriod()}</span></span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: MAIN REPORT VIEW PANEL */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
          
          {/* ========================================== */}
          {/* MODULE A: ANALYTICS & ZONE HEATMAP         */}
          {/* ========================================== */}
          {activeReport === 'analytics' && (
            <div className="space-y-6">
              
              {/* Document Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-slate-100 text-left">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 bg-[#0B3A9B] rounded flex items-center justify-center text-white shrink-0">
                      <Grid className="w-3 h-3 text-white" />
                    </div>
                    <span className="font-heading font-black text-xs text-slate-900 tracking-wider">
                      BARANGAY <span className="text-[#0B3A9B]">LINK ANALYTICS</span>
                    </span>
                  </div>
                  <h3 className="font-heading font-black text-xl text-slate-900 tracking-tight leading-none">
                    Barangay San Vicente Zone & Service Heatmap
                  </h3>
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block">
                    MUNICIPAL PERFORMANCE REPORT #B-LINK-{selectedDate.getFullYear()}-A
                  </span>
                </div>

                <div className="text-left md:text-right space-y-1 text-[11px] font-semibold text-slate-400">
                  <div>Period: <span className="text-slate-800 font-extrabold">{formatReportPeriod()}</span></div>
                  <div>Location: <span className="text-slate-800 font-extrabold">San Vicente, Apalit, Pampanga</span></div>
                </div>
              </div>

              {/* KPI Cards Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4.5 bg-white border border-slate-200 rounded-2xl shadow-sm text-left space-y-1">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    TOTAL TICKETS
                  </span>
                  <h4 className="font-heading font-black text-2xl text-slate-900">
                    {totalTicketsCount}
                  </h4>
                  <div className="flex items-center gap-1 text-[9px] text-emerald-600 font-bold">
                    <TrendingUp className="w-3 h-3" />
                    <span>Live Context Sync</span>
                  </div>
                </div>

                <div className="p-4.5 bg-white border border-slate-200 rounded-2xl shadow-sm text-left space-y-1">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    RESOLUTION RATE
                  </span>
                  <h4 className="font-heading font-black text-2xl text-slate-900">
                    {resolutionRate}%
                  </h4>
                  <span className="text-[9px] text-emerald-600 font-bold block">
                    {resolvedCount} Tickets Completed
                  </span>
                </div>

                <div className="p-4.5 bg-white border border-slate-200 rounded-2xl shadow-sm text-left space-y-1">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    AVG. RESPONSE TIME
                  </span>
                  <h4 className="font-heading font-black text-2xl text-slate-900">
                    3.8h
                  </h4>
                  <span className="text-[9px] text-blue-600 font-bold block">
                    Within 4h Target SLA
                  </span>
                </div>

                <div className="p-4.5 bg-white border border-slate-200 rounded-2xl shadow-sm text-left space-y-1">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    SLA WARNINGS
                  </span>
                  <h4 className="font-heading font-black text-2xl text-amber-600">
                    {urgentCount}
                  </h4>
                  <span className="text-[9px] text-amber-600 font-bold block">
                    High/Urgent Priority
                  </span>
                </div>
              </div>

              {/* Department Comparison & Zone Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Department Distribution */}
                <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                      Department Workload Distribution
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400">4 Active Sectors</span>
                  </div>

                  <div className="space-y-3 text-xs font-bold text-slate-700">
                    <div>
                      <div className="flex justify-between text-slate-700 pb-1">
                        <span>Infrastructure & Public Works</span>
                        <span>42%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#0B3A9B] h-full rounded-full" style={{ width: '42%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-700 pb-1">
                        <span>Sanitation & Waste Management</span>
                        <span>28%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#1E5AE6] h-full rounded-full" style={{ width: '28%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-700 pb-1">
                        <span>Public Safety & Security</span>
                        <span>18%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '18%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-700 pb-1">
                        <span>Administrative Services</span>
                        <span>12%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: '12%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Zone Density Heatmap */}
                <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <span>San Vicente Ticket Density Heatmap</span>
                    </h4>
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">High Activity</span>
                  </div>

                  <div className="space-y-3 text-xs font-bold">
                    {[
                      { zone: 'Main St. & 4th Ave Crossing', count: '48 tickets', pct: 35, alert: 'Street light repair' },
                      { zone: 'Green Valley Sector 4', count: '34 tickets', pct: 25, alert: 'Water line leakage' },
                      { zone: 'Lincoln Residential District', count: '28 tickets', pct: 20, alert: 'Drainage clearing' },
                      { zone: 'Heritage Park North Gate', count: '16 tickets', pct: 12, alert: 'Graffiti removal' },
                      { zone: 'Industrial Zone Lot B', count: '11 tickets', pct: 8, alert: 'Illegal dumping' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="space-y-0.5">
                          <span className="text-slate-800 font-extrabold block text-[11px]">{item.zone}</span>
                          <span className="text-[9px] text-slate-400 block font-medium">{item.alert}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-900 font-extrabold text-xs block">{item.count}</span>
                          <span className="text-[9px] text-[#0B3A9B] font-bold block">{item.pct}% density</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Weekly Trend Bar Chart */}
              <div className="border border-slate-200 rounded-2xl p-5 space-y-3 text-left">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Weekly Ticket Volume Trend</h4>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 text-[9px] font-extrabold uppercase">
                    San Vicente Sector Overview
                  </span>
                </div>
                
                <div className="p-6 border border-slate-100 rounded-2xl bg-[#F8FAFC]/50 flex flex-col justify-end h-52 space-y-4">
                  <div className="flex items-end justify-between h-36 px-6 relative border-b border-slate-200">
                    <div className="w-10 bg-[#CBD5E1] h-2/5 rounded-t-sm z-10 hover:bg-[#0B3A9B] transition-all"></div>
                    <div className="w-10 bg-[#94A3B8] h-3/5 rounded-t-sm z-10 hover:bg-[#0B3A9B] transition-all"></div>
                    <div className="w-10 bg-[#475569] h-4/5 rounded-t-sm z-10 hover:bg-[#0B3A9B] transition-all"></div>
                    <div className="w-10 bg-[#0B3A9B] h-full rounded-t-sm z-10 hover:bg-[#0B3A9B] transition-all"></div>
                    <div className="w-10 bg-[#1E5AE6] h-3/4 rounded-t-sm z-10 hover:bg-[#0B3A9B] transition-all"></div>
                    <div className="w-10 bg-[#64748B] h-1/2 rounded-t-sm z-10 hover:bg-[#0B3A9B] transition-all"></div>
                  </div>

                  <div className="flex justify-between text-[10px] font-bold text-slate-400 px-6">
                    <span className="w-10 text-center">Week 1</span>
                    <span className="w-10 text-center">Week 2</span>
                    <span className="w-10 text-center">Week 3</span>
                    <span className="w-10 text-center">Week 4</span>
                    <span className="w-10 text-center">Week 5</span>
                    <span className="w-10 text-center">Week 6</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================== */}
          {/* MODULE B: CITIZEN SATISFACTION & FEEDBACK  */}
          {/* ========================================== */}
          {activeReport === 'satisfaction' && (
            <div className="space-y-6">
              
              {/* Document Header */}
              <div className="pb-5 border-b border-slate-100 text-left flex justify-between items-center">
                <div>
                  <h3 className="font-heading font-black text-xl text-slate-900 leading-none">
                    Citizen Satisfaction & Feedback Audit
                  </h3>
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block pt-1.5">
                    BARANGAY SAN VICENTE RESIDENT SERVICE EVALUATION
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full text-amber-700 font-black text-sm">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>4.9 / 5.0 Rating</span>
                </div>
              </div>

              {/* Overview Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50/40 border border-blue-100 rounded-2xl text-left space-y-1">
                  <span className="text-[10px] font-extrabold text-blue-900 uppercase tracking-wider block">
                    POSITIVE SATISFACTION SCORE
                  </span>
                  <h4 className="font-heading font-black text-3xl text-[#0B3A9B]">
                    96.4%
                  </h4>
                  <p className="text-[10px] text-blue-800 font-bold">
                    Based on verified resident resolution reviews
                  </p>
                </div>

                <div className="p-5 bg-white border border-slate-200 rounded-2xl text-left space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    TOTAL FEEDBACK RESPONSES
                  </span>
                  <h4 className="font-heading font-black text-3xl text-slate-900">
                    142
                  </h4>
                  <p className="text-[10px] text-slate-500 font-bold">
                    Citizen responses recorded this month
                  </p>
                </div>

                <div className="p-5 bg-white border border-slate-200 rounded-2xl text-left space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    RESOLUTION APPROVAL RATE
                  </span>
                  <h4 className="font-heading font-black text-3xl text-emerald-600">
                    98.1%
                  </h4>
                  <p className="text-[10px] text-emerald-600 font-bold">
                    Tickets verified & confirmed resolved
                  </p>
                </div>
              </div>

              {/* Star Rating Breakdown & Category Satisfaction */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Star Ratings */}
                <div className="border border-slate-200 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider text-left">
                    Star Rating Distribution
                  </h4>

                  <div className="space-y-2 text-xs font-bold">
                    {[
                      { stars: '5 Stars', pct: 84, color: 'bg-amber-400' },
                      { stars: '4 Stars', pct: 12, color: 'bg-blue-500' },
                      { stars: '3 Stars', pct: 3, color: 'bg-[#0B3A9B]' },
                      { stars: '2 Stars', pct: 1, color: 'bg-amber-500' },
                      { stars: '1 Star', pct: 0, color: 'bg-red-500' },
                    ].map((r, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="w-14 text-slate-600 shrink-0 text-left font-extrabold">{r.stars}</span>
                        <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div className={`${r.color} h-full rounded-full`} style={{ width: `${r.pct}%` }}></div>
                        </div>
                        <span className="w-10 text-right text-slate-800 font-black">{r.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category Satisfaction Index */}
                <div className="border border-slate-200 rounded-2xl p-5 space-y-3 text-left">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Satisfaction Index by Category
                  </h4>

                  <div className="space-y-3 text-xs font-bold">
                    {[
                      { category: 'Sanitation & Garbage Collection', score: '98% Positive', badge: 'Excellent' },
                      { category: 'Public Safety & Street Patrol', score: '96% Positive', badge: 'High' },
                      { category: 'Administrative Services & Permits', score: '95% Positive', badge: 'High' },
                      { category: 'Road & Infrastructure Repair', score: '94% Positive', badge: 'Good' },
                    ].map((cat, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-800 font-extrabold text-xs">{cat.category}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-600 font-black">{cat.score}</span>
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">{cat.badge}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Resident Testimonials / Feedback List */}
              <div className="space-y-3 text-left">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span>Recent Citizen Feedback Comments</span>
                </h4>

                <div className="space-y-3">
                  {[
                    { name: 'Maria Santos', ticket: '#TC-2026-00042', subject: 'Street Light Repair', date: 'Jul 24, 2026', stars: 5, comment: 'Field officer Marcus Sterling arrived quickly and fixed the flickering street light on Main St. Great job Barangay San Vicente team!' },
                    { name: 'Juan Dela Cruz', ticket: '#TC-2026-00015', subject: 'Main Line Leakage', date: 'Jul 22, 2026', stars: 5, comment: 'Prompt response on the mainline water leak in Lincoln District. Appreciate the fast repair before road erosion.' },
                    { name: 'Pedro Penduko', ticket: '#TC-2026-00088', subject: 'Graffiti Removal', date: 'Jul 19, 2026', stars: 4, comment: 'Cleaned the brick sign at Heritage Park gate thoroughly. Thank you for maintaining public spaces.' },
                  ].map((f, idx) => (
                    <div key={idx} className="p-4 border border-slate-200 rounded-2xl bg-white shadow-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-[#0B3A9B] flex items-center justify-center font-black text-xs">
                            {f.name.charAt(0)}
                          </div>
                          <div>
                            <span className="text-xs font-extrabold text-slate-900 block leading-tight">{f.name}</span>
                            <span className="text-[10px] text-blue-600 font-bold">{f.ticket} · {f.subject}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {Array.from({ length: f.stars }).map((_, sIdx) => (
                            <Star key={sIdx} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                          <span className="text-[10px] font-extrabold text-slate-400 ml-1">{f.date}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        "{f.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ========================================== */}
          {/* MODULE D: REAL-TIME LIVE AUDIT LOGS        */}
          {/* ========================================== */}
          {activeReport === 'audit' && (
            <div className="space-y-6">
              
              {/* Document Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-slate-100 text-left">
                <div>
                  <h3 className="font-heading font-black text-xl text-slate-900 leading-none">
                    Real-Time System Audit & Activity Logs
                  </h3>
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block pt-1.5">
                    BARANGAY SAN VICENTE ADMINISTRATIVE SECURITY LOGS
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full text-emerald-700 text-xs font-extrabold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Context Connected ({logs.length} Entries)
                  </span>
                </div>
              </div>

              {/* Action Filters Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-extrabold text-slate-700">Filter Log Category:</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {['All', 'Assign', 'Status', 'Create'].map(category => (
                    <button
                      key={category}
                      onClick={() => setAuditFilter(category)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
                        auditFilter === category
                          ? 'bg-[#0B3A9B] text-white shadow-sm'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {category === 'All' ? 'All Activity' : category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Audit Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-inner text-left">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider text-[9px]">
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Ticket ID</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Performed By</th>
                      <th className="py-3 px-4">Details</th>
                      <th className="py-3 px-4 text-right">Severity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredLogs.map((log, idx) => {
                      const logType = log.log_type || 'info';
                      const badgeStyle = 
                        logType === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        logType === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        logType === 'error' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        'bg-blue-50 text-blue-700 border-blue-200';

                      return (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4 text-slate-400 font-semibold whitespace-nowrap text-[11px]">
                            {log.timestamp || log.action_date || 'Just now'}
                          </td>
                          <td className="py-3 px-4 text-blue-600 font-extrabold whitespace-nowrap">
                            {log.ticket_id ? `#${log.ticket_id}` : 'System'}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                            {log.action}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-700 whitespace-nowrap">
                            {log.performed_by || log.user_name || 'Admin Officer'}
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-medium leading-normal max-w-xs truncate">
                            {log.details || log.action}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${badgeStyle}`}>
                              {logType.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredLogs.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                          No audit log records found for this filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* DOWNLOAD FLOW MODALS CONTROLLER */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          
          {activeModal === 'generating' && (
            <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col p-8 items-center text-center animate-scale-up shrink-0 space-y-6">
              
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-[#0B3A9B] animate-spin"></div>
                <BarChart3 className="w-5 h-5 text-[#0B3A9B]" />
              </div>

              <div className="space-y-2 text-center w-full">
                <h4 className="font-heading font-extrabold text-lg text-slate-900">
                  Compiling Report...
                </h4>
                <p className="text-xs text-slate-400 font-semibold leading-relaxed max-w-xs mx-auto">
                  Generating official municipal PDF document for Barangay San Vicente.
                </p>
              </div>

              <div className="w-full space-y-2.5">
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/40">
                  <div 
                    className="bg-[#0B3A9B] h-full rounded-full transition-all duration-300"
                    style={{ width: `${downloadProgress}%` }}
                  ></div>
                </div>
                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block text-center">
                  {progressText}
                </span>
              </div>

              <div className="w-full border-t border-slate-100 pt-5">
                <button
                  onClick={handleCancelDownload}
                  className="w-full py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-650 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>

            </div>
          )}

          {activeModal === 'success' && (
            <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col p-8 items-center text-center animate-scale-up shrink-0 relative">
              
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>

              <div className="w-14 h-14 rounded-full bg-blue-50 border-4 border-blue-100 flex items-center justify-center text-blue-900 shadow-md">
                <Check className="w-7 h-7 text-[#0B3A9B] stroke-[3px]" />
              </div>
              
              <div className="space-y-2 text-center pt-5">
                <h4 className="font-heading font-extrabold text-lg text-slate-900">
                  PDF Download Successful
                </h4>
                <div className="text-xs text-slate-500 font-semibold leading-relaxed max-w-xs mx-auto">
                  <p>Your official report document</p>
                  <p className="font-extrabold text-slate-800 pt-0.5">"Barangay_SanVicente_Report.pdf"</p>
                  <p className="pt-0.5">has been generated and saved.</p>
                </div>
              </div>

              <button
                onClick={() => setActiveModal(null)}
                className="w-full mt-6 py-3 rounded-xl bg-[#0B3A9B] hover:bg-[#093082] text-sm font-extrabold text-white transition-all shadow-md cursor-pointer"
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

export default ReportBuilder;
