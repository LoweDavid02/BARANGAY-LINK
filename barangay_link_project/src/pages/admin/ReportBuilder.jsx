import React, { useState, useEffect } from 'react';
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
  ChevronRight
} from 'lucide-react';

const ReportBuilder = () => {
  const [activeReport, setActiveReport] = useState('performance');
  
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

  // Trigger simulated PDF download flow
  const handleDownloadPDF = () => {
    setActiveModal('generating');
    setDownloadProgress(0);
    setProgressText('COMPILING DATA');

    // Simulate progress increments
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      if (currentProgress > 100) currentProgress = 100;
      
      setDownloadProgress(currentProgress);

      if (currentProgress === 30) {
        setProgressText('OPTIMIZING DATA POINTS');
      } else if (currentProgress === 60) {
        setProgressText('GENERATING PREVIEW FILE');
      } else if (currentProgress === 85) {
        setProgressText('FINALIZING DOCUMENT');
      }

      if (currentProgress === 100) {
        clearInterval(interval);
        setTimeout(() => {
          setActiveModal('success');
        }, 400);
      }
    }, 300);

    setTimerId(interval);
  };

  // Cancel download handler
  const handleCancelDownload = () => {
    if (timerId) {
      clearInterval(timerId);
      setTimerId(null);
    }
    setActiveModal(null);
    setDownloadProgress(0);
  };

  useEffect(() => {
    // Cleanup timer on unmount
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [timerId]);

  return (
    <div className="space-y-6 text-left relative font-sans">
      
      {/* Top Action Row (Download PDF) */}
      <div className="flex justify-end shrink-0">
        <button
          onClick={handleDownloadPDF}
          className="bg-[#0B3A9B] hover:bg-[#093082] text-white px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-md active:scale-98 transition-all"
        >
          <Download className="w-4 h-4 stroke-[2.5px]" />
          Download PDF
        </button>
      </div>

      {/* SPLIT LAYOUT PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* LEFT COLUMN: REPORT TYPE SELECTOR (1 column) */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block pl-1">
            REPORT TYPE
          </span>
          
          <div className="space-y-2">
            
            {/* Type 1: Ticket Performance */}
            <button
              onClick={() => setActiveReport('performance')}
              className={`
                w-full p-3.5 rounded-xl flex items-center gap-3 text-xs font-bold transition-all text-left cursor-pointer
                ${activeReport === 'performance' 
                  ? 'bg-[#1E5AE6] text-white shadow-sm' 
                  : 'bg-white hover:bg-slate-50 text-slate-600'}
              `}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>Ticket Performance</span>
            </button>

            {/* Type 2: Response Times */}
            <button
              onClick={() => setActiveReport('response')}
              className={`
                w-full p-3.5 rounded-xl flex items-center gap-3 text-xs font-bold transition-all text-left cursor-pointer
                ${activeReport === 'response' 
                  ? 'bg-[#1E5AE6] text-white shadow-sm' 
                  : 'bg-white hover:bg-slate-50 text-slate-650'}
              `}
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span>Response Times</span>
            </button>

            {/* Type 3: Assigned Officer Efficiency */}
            <button
              onClick={() => setActiveReport('efficiency')}
              className={`
                w-full p-3.5 rounded-xl flex items-center gap-3 text-xs font-bold transition-all text-left cursor-pointer
                ${activeReport === 'efficiency' 
                  ? 'bg-[#1E5AE6] text-white shadow-sm' 
                  : 'bg-white hover:bg-slate-50 text-slate-650'}
              `}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>Assigned Officer Efficiency</span>
            </button>

          </div>

          {/* Calendar Date Picker */}
          <div className="pt-2 space-y-3">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block pl-1">
              SELECT PERIOD
            </span>
            
            {/* Calendar widget */}
            <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
              {/* Month/Year navigation */}
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

              {/* Day labels row */}
              <div className="grid grid-cols-7 gap-0.5 text-center">
                {dayLabels.map(d => (
                  <span key={d} className="text-[9px] font-extrabold text-slate-400 uppercase py-1">{d}</span>
                ))}
              </div>

              {/* Day number grid */}
              <div className="grid grid-cols-7 gap-0.5 text-center">
                {/* Empty cells for offset */}
                {Array.from({ length: getFirstDayOfMonth(calendarMonth, calendarYear) }).map((_, i) => (
                  <div key={`empty-${i}`} className="w-full aspect-square"></div>
                ))}
                {/* Actual day cells */}
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

              {/* Selected date label */}
              <div className="pt-1 border-t border-slate-200/60 flex items-center gap-2 text-[10px] font-bold text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-[#0B3A9B]" />
                <span>Report: <span className="text-slate-800 font-extrabold">{formatReportPeriod()}</span></span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: MAIN REPORT PANEL (3 columns) */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
          
          {/* A. REPORT TYPE: PERFORMANCE ANALYSIS */}
          {activeReport === 'performance' && (
            <div className="space-y-6">
              
              {/* Report Document Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-slate-100 text-left">
                
                {/* Logo and title */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 bg-[#0B3A9B] rounded flex items-center justify-center text-white shrink-0">
                      <Grid className="w-3 h-3 text-white" />
                    </div>
                    <span className="font-heading font-black text-xs text-slate-900 tracking-wider">
                      BLINKED <span className="text-[#1E5AE6]">CIVIC</span>
                    </span>
                  </div>
                  <h3 className="font-heading font-black text-xl text-slate-900 tracking-tight leading-none">
                    Ticket Performance Analysis
                  </h3>
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block">
                    INTERNAL AUDIT DOCUMENT #BT-2024-10-21-A
                  </span>
                </div>

                {/* Sub meta values */}
                <div className="text-left md:text-right space-y-1 text-[11px] font-semibold text-slate-400">
                  <div>
                    Period: <span className="text-slate-800 font-extrabold">{formatReportPeriod()}</span>
                  </div>
                  <div>Generated: Oct 21, 2024, 09:42 AM</div>
                  <div>Prepared by: Alex Rivera</div>
                </div>

              </div>

              {/* KPI Cards Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                {/* KPI 1: Total Tickets */}
                <div className="p-4.5 bg-white border border-slate-200 rounded-2xl shadow-sm text-left space-y-1">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    TOTAL TICKETS
                  </span>
                  <h4 className="font-heading font-black text-2xl text-slate-850">
                    1,284
                  </h4>
                  <div className="flex items-center gap-1 text-[9px] text-emerald-600 font-bold">
                    <TrendingUp className="w-3 h-3" />
                    <span>+12% from Sept</span>
                  </div>
                </div>

                {/* KPI 2: Resolved */}
                <div className="p-4.5 bg-white border border-slate-200 rounded-2xl shadow-sm text-left space-y-1">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    RESOLVED
                  </span>
                  <h4 className="font-heading font-black text-2xl text-slate-850">
                    942
                  </h4>
                  <span className="text-[9px] text-slate-400 font-bold block">
                    73% Efficiency
                  </span>
                </div>

                {/* KPI 3: Avg Response */}
                <div className="p-4.5 bg-white border border-slate-200 rounded-2xl shadow-sm text-left space-y-1">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    AVG. RESPONSE
                  </span>
                  <h4 className="font-heading font-black text-2xl text-slate-850">
                    4.2h
                  </h4>
                  <div className="flex items-center gap-1 text-[9px] text-rose-600 font-bold">
                    <TrendingDown className="w-3 h-3" />
                    <span>-0.4h target</span>
                  </div>
                </div>

                {/* KPI 4: User Rating */}
                <div className="p-4.5 bg-white border border-slate-200 rounded-2xl shadow-sm text-left space-y-1">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    USER RATING
                  </span>
                  <h4 className="font-heading font-black text-2xl text-slate-850">
                    4.8
                  </h4>
                  <span className="text-[9px] text-slate-400 font-bold block">
                    Out of 5.0
                  </span>
                </div>

              </div>

              {/* Weekly Volume Trends Chart card */}
              <div className="space-y-3 text-left">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-extrabold text-slate-900">Weekly Volume Trends</h4>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-450 text-[9px] font-extrabold uppercase tracking-wider">
                    DATA VIZ UNIT
                  </span>
                </div>
                
                {/* CSS Bar Chart */}
                <div className="p-6 border border-slate-200 rounded-2xl bg-[#F8FAFC]/50 flex flex-col justify-end h-60 space-y-4">
                  <div className="flex items-end justify-between h-40 px-6 relative border-b border-slate-100">
                    
                    {/* Horizontal gridlines */}
                    <div className="absolute left-0 right-0 top-1/4 border-t border-slate-100/40 pointer-events-none"></div>
                    <div className="absolute left-0 right-0 top-2/4 border-t border-slate-100/40 pointer-events-none"></div>
                    <div className="absolute left-0 right-0 top-3/4 border-t border-slate-100/40 pointer-events-none"></div>

                    {/* Bars */}
                    <div className="w-9 bg-[#CBD5E1] h-1/3 rounded-t-sm z-10 hover:bg-[#1E5AE6] transition-all"></div>
                    <div className="w-9 bg-[#CBD5E1] h-2/3 rounded-t-sm z-10 hover:bg-[#1E5AE6] transition-all"></div>
                    <div className="w-9 bg-[#94A3B8] h-4/5 rounded-t-sm z-10 hover:bg-[#1E5AE6] transition-all"></div>
                    <div className="w-9 bg-[#0B3A9B] h-full rounded-t-sm z-10 hover:bg-[#1E5AE6] transition-all"></div>
                    <div className="w-9 bg-[#475569] h-2/3 rounded-t-sm z-10 hover:bg-[#1E5AE6] transition-all"></div>
                    <div className="w-9 bg-[#94A3B8] h-2/5 rounded-t-sm z-10 hover:bg-[#1E5AE6] transition-all"></div>
                    <div className="w-9 bg-[#CBD5E1] h-1/5 rounded-t-sm z-10 hover:bg-[#1E5AE6] transition-all"></div>

                  </div>

                  {/* X Axis labels */}
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 px-6">
                    <span className="w-12 text-left">Wk 1</span>
                    <span className="w-12 text-center">Wk 2</span>
                    <span className="w-12 text-center">Wk 3</span>
                    <span className="w-12 text-right">Wk 4</span>
                  </div>

                </div>
              </div>

              {/* Priority Incident Log Table card */}
              <div className="space-y-3 text-left">
                <h4 className="text-xs font-extrabold text-slate-900">Priority Incident Log</h4>
                
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-inner">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider text-[9px]">
                        <th className="py-2.5 px-4">Ticket ID</th>
                        <th className="py-2.5 px-4">Category</th>
                        <th className="py-2.5 px-4">Department</th>
                        <th className="py-2.5 px-4 text-right">Response</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-bold text-slate-650">
                      {[
                        { id: '#ЛЧ-9921', category: 'Road Hazard', dept: 'Public Works', resp: '1.2h' },
                        { id: '#ПП-4512', category: 'Missed Pickup', dept: 'Sanitation', resp: '3.8h' },
                        { id: '#ФГ-1209', category: 'Graffiti', dept: 'Maintenance', resp: '5.1h' },
                        { id: '#ЛЧ-9811', category: 'Broken Signal', dept: 'Public Works', resp: '0.8h' },
                        { id: '#ПП-4660', category: 'Hazardous Waste', dept: 'Sanitation', resp: '2.5h' }
                      ].map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                          <td className="py-3 px-4 text-blue-650 font-extrabold">{item.id}</td>
                          <td className="py-3 px-4 font-semibold text-slate-700">{item.category}</td>
                          <td className="py-3 px-4 font-semibold text-slate-500">{item.dept}</td>
                          <td className="py-3 px-4 text-right text-slate-800 font-extrabold">{item.resp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* B. REPORT TYPE: RESPONSE TIMES */}
          {activeReport === 'response' && (
            <div className="space-y-6">
              <div className="pb-5 border-b border-slate-100 text-left">
                <h3 className="font-heading font-black text-xl text-slate-900 leading-none">
                  Response Time Audit
                </h3>
                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block pt-1.5">
                  SYSTEM RESPONSE VELOCITY ANALYSIS
                </span>
              </div>
              <div className="p-8 text-center text-xs text-slate-400 font-bold bg-slate-50 rounded-2xl border border-slate-100">
                Additional detailed charts for Response Times are active. Under PDF view, this generates dynamic velocity summaries.
              </div>
            </div>
          )}

          {/* C. REPORT TYPE: OFFICER EFFICIENCY */}
          {activeReport === 'efficiency' && (
            <div className="space-y-6">
              <div className="pb-5 border-b border-slate-100 text-left">
                <h3 className="font-heading font-black text-xl text-slate-900 leading-none">
                  Assigned Officer Efficiency
                </h3>
                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block pt-1.5">
                  FIELD PERSONNEL TASK LOAD DISTRIBUTION
                </span>
              </div>
              <div className="p-8 text-center text-xs text-slate-400 font-bold bg-slate-50 rounded-2xl border border-slate-100">
                Additional detailed metrics for Officer Efficiency are active. Under PDF view, this generates individual field performance cards.
              </div>
            </div>
          )}

        </div>

      </div>

      {/* DOWNLOAD FLOW MODALS CONTROLLER */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          
          {/* 1. GENERATING PREVIEW MODAL */}
          {activeModal === 'generating' && (
            <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col p-8 items-center text-center animate-scale-up shrink-0 space-y-6">
              
              {/* Spinner wheel with icon */}
              <div className="relative w-16 h-16 flex items-center justify-center">
                {/* Spinner border animation */}
                <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-[#0B3A9B] animate-spin"></div>
                {/* Bar chart icon in center */}
                <BarChart3 className="w-5 h-5 text-[#0B3A9B]" />
              </div>

              <div className="space-y-2 text-center w-full">
                <h4 className="font-heading font-extrabold text-lg text-slate-900">
                  Generating Preview...
                </h4>
                <p className="text-xs text-slate-400 font-semibold leading-relaxed max-w-xs mx-auto">
                  Please wait while we compile the latest ticket performance data for October 2024.
                </p>
              </div>

              {/* Progress bar container */}
              <div className="w-full space-y-2.5">
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/40">
                  <div 
                    className="bg-[#0B3A9B] h-full rounded-full transition-all duration-300"
                    style={{ width: `${downloadProgress}%` }}
                  ></div>
                </div>
                {/* Progress Status Text */}
                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block text-center">
                  {progressText}
                </span>
              </div>

              {/* Separator line */}
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

          {/* 2. DOWNLOAD SUCCESS MODAL */}
          {activeModal === 'success' && (
            <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col p-8 items-center text-center animate-scale-up shrink-0 relative">
              
              {/* Close X button */}
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
                  <p>Your report</p>
                  <p className="font-extrabold text-slate-800 pt-0.5">"Ticket_Oct_2024.pdf"</p>
                  <p className="pt-0.5">has been successfully downloaded to your device.</p>
                </div>
              </div>

              {/* Show in folder action link */}
              <button
                onClick={() => alert("Simulation: Opening download directory...")}
                className="mt-4 flex items-center gap-1.5 text-xs font-extrabold text-blue-650 hover:underline cursor-pointer"
              >
                <Folder className="w-4 h-4 text-blue-650" />
                <span>Show in Folder</span>
              </button>

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
