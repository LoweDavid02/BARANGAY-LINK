import React, { useState, useEffect } from 'react';
import { useTickets } from '../../context/TicketContext';
import { 
  FileText, 
  Shield, 
  AlertTriangle, 
  Filter, 
  RotateCw, 
  Download, 
  User, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Edit3, 
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  X,
  Mail,
  Phone,
  Info,
  Folder,
  BarChart3
} from 'lucide-react';

const AuditLog = () => {
  const { logs, refreshData } = useTickets();
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Download simulation states
  const [downloadState, setDownloadState] = useState(null); // 'generating' | 'success' | null
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [progressText, setProgressText] = useState('COMPILING DATA');
  const [downloadFilename, setDownloadFilename] = useState('');
  const [downloadTargetText, setDownloadTargetText] = useState('');
  const [downloadTimerId, setDownloadTimerId] = useState(null);

  // Toast alert triggering
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Start simulated download helper
  const startDownloadSim = (filename, targetText) => {
    setDownloadState('generating');
    setDownloadProgress(0);
    setProgressText('COMPILING DATA');
    setDownloadFilename(filename);
    setDownloadTargetText(targetText);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress > 100) progress = 100;
      setDownloadProgress(progress);

      if (progress === 30) {
        setProgressText('OPTIMIZING DATA POINTS');
      } else if (progress === 60) {
        setProgressText('GENERATING PREVIEW FILE');
      } else if (progress === 85) {
        setProgressText('FINALIZING DOCUMENT');
      }

      if (progress === 100) {
        clearInterval(interval);
        setTimeout(() => {
          setDownloadState('success');
        }, 400);
      }
    }, 250);

    setDownloadTimerId(interval);
  };

  // Cancel download handler
  const cancelDownloadSim = () => {
    if (downloadTimerId) {
      clearInterval(downloadTimerId);
      setDownloadTimerId(null);
    }
    setDownloadState(null);
    setDownloadProgress(0);
  };

  useEffect(() => {
    return () => {
      if (downloadTimerId) clearInterval(downloadTimerId);
    };
  }, [downloadTimerId]);


  // Map API logs to the expected shape of AuditLog.jsx
  const auditLogs = logs.map((log) => {
    const t = new Date(log.timestamp);
    const dateStr = t.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = t.toLocaleTimeString(undefined, { hour12: false });
    
    const isResident = log.user.toLowerCase().includes('resident');
    const isAdmin = log.user.toLowerCase().includes('admin');
    
    const actorType = isAdmin ? 'admin' : (isResident ? 'resident' : 'personnel');
    const role = isAdmin ? 'Barangay Admin' : (isResident ? 'Citizen Resident' : 'Field Personnel');

    const actionLower = log.action.toLowerCase();
    const actionType = actionLower.includes('resolve') ? 'resolve' : (actionLower.includes('create') ? 'create' : 'update');

    return {
      id: log.id,
      date: dateStr,
      time: timeStr,
      actor: log.user.split(' (')[0],
      role: role,
      actorType: actorType,
      action: log.action,
      actionType: actionType,
      module: log.ticketId ? 'TICKET_ENGINE' : 'SYSTEM_API',
      details: log.details,
      ip: '127.0.0.1',
      severity: 'normal'
    };
  });

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('blink_access_token');
      const getApiBase = () => {
        let base = import.meta.env.VITE_API_BASE;
        if (base) return base.endsWith('/api') ? base : base.replace(/\/$/, '') + '/api';
        if (window.location.hostname && !['localhost', '127.0.0.1'].includes(window.location.hostname)) {
          return 'https://barangay-link-backend.onrender.com/api';
        }
        return 'http://localhost:8000/api';
      };
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/admin/audit-logs/export`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        triggerToast('Audit logs exported successfully!');
      } else {
        triggerToast('Failed to export audit logs.');
      }
    } catch (err) {
      console.error(err);
      triggerToast('Error exporting logs.');
    }
  };

  // Pagination bounds
  const logsPerPage = 5;
  const startIndex = (currentPage - 1) * logsPerPage;
  const paginatedLogs = auditLogs.slice(startIndex, startIndex + logsPerPage);

  const toggleExpandLog = (id, e) => {
    e.stopPropagation(); // Stop click propagation to prevent modal trigger
    if (expandedLogId === id) {
      setExpandedLogId(null);
    } else {
      setExpandedLogId(id);
    }
  };

  return (
    <div className="space-y-6 text-left relative font-sans">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in">
          <Check className="w-5 h-5" />
          <span className="text-sm font-extrabold tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* Top Action Buttons */}
      <div className="flex justify-end gap-3 shrink-0">
        <button
          onClick={async () => {
            if (refreshData) await refreshData();
            triggerToast('Log database refreshed!');
          }}
          className="bg-[#0B3A9B] hover:bg-[#093082] text-white px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-all shadow-sm"
        >
          <RotateCw className="w-4 h-4 text-white" />
          Refresh Data
        </button>

        <button
          onClick={handleExportCSV}
          className="bg-[#0B3A9B] hover:bg-[#093082] text-white px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-all shadow-sm"
        >
          <Download className="w-4 h-4 text-white" />
          Export csv.
        </button>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* KPI 1: Total Logs */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 flex items-center gap-4 shadow-sm">
          <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center text-[#1E5AE6] shrink-0">
            <FileText className="w-5 h-5 text-[#1E5AE6]" />
          </div>
          <div className="space-y-0.5 text-left">
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Total Logs
            </span>
            <span className="font-heading font-black text-xl text-slate-800">
              15
            </span>
          </div>
        </div>

        {/* KPI 2: Admin Actions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 flex items-center gap-4 shadow-sm">
          <div className="w-11 h-11 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-555 shrink-0">
            <Shield className="w-5 h-5 text-slate-555" />
          </div>
          <div className="space-y-0.5 text-left">
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Admin Actions
            </span>
            <span className="font-heading font-black text-xl text-slate-800">
              5
            </span>
          </div>
        </div>

        {/* KPI 3: Critical Deletions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 flex items-center gap-4 shadow-sm">
          <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center text-rose-500 shrink-0">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
          <div className="space-y-0.5 text-left">
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Critical Deletions
            </span>
            <span className="font-heading font-black text-xl text-slate-800">
              9
            </span>
          </div>
        </div>

        {/* KPI 4: Filter Active */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 flex items-center gap-4 shadow-sm">
          <div className="w-11 h-11 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-555 shrink-0">
            <Filter className="w-5 h-5 text-slate-555" />
          </div>
          <div className="space-y-0.5 text-left">
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Filter Active
            </span>
            <span className="font-heading font-black text-sm text-slate-805 block pt-0.5">
              Last 24h
            </span>
          </div>
        </div>

      </div>

      {/* Main Audit Log Table Card */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider text-[9px]">
              <th className="py-4 px-6">Timestamp</th>
              <th className="py-4 px-6">Actor</th>
              <th className="py-4 px-6">Action</th>
              <th className="py-4 px-6">Module</th>
              <th className="py-4 px-6 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-bold text-slate-655">
            {paginatedLogs.map((log) => (
              <React.Fragment key={log.id}>
                <tr 
                  onClick={() => setSelectedLog(log)}
                  className="hover:bg-slate-50/20 transition-colors cursor-pointer"
                >
                  
                  {/* Timestamp column */}
                  <td className="py-4 px-6 text-left">
                    <span className="text-xs font-extrabold text-slate-800 block">{log.date}</span>
                    <span className="text-[9.5px] text-slate-400 font-semibold block pt-0.5">{log.time}</span>
                  </td>

                  {/* Actor Column */}
                  <td className="py-4 px-6 text-left">
                    <div className="flex items-center gap-3">
                      {/* circular icon wrapper */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${log.actorType === 'admin' ? 'bg-[#1E5AE6] text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {log.actorType === 'admin' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-xs font-extrabold text-slate-800 block leading-none">{log.actor}</span>
                        <span className="text-[9.5px] text-slate-400 font-semibold block">{log.role}</span>
                      </div>
                    </div>
                  </td>

                  {/* Action Column */}
                  <td className="py-4 px-6 text-left">
                    <div className="flex items-center gap-2">
                      {log.actionType === 'resolve' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Edit3 className="w-4 h-4 text-[#1E5AE6] shrink-0" />
                      )}
                      <span className="text-xs font-semibold text-slate-700">{log.action}</span>
                    </div>
                  </td>

                  {/* Module Column */}
                  <td className="py-4 px-6 text-left">
                    <span className="bg-[#ECECF4] text-slate-650 font-mono text-[9px] font-bold px-2 py-1 uppercase rounded-md tracking-wider">
                      {log.module}
                    </span>
                  </td>

                  {/* Details chevron column */}
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={(e) => toggleExpandLog(log.id, e)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                    >
                      {expandedLogId === log.id ? (
                        <ChevronUp className="w-4.5 h-4.5" />
                      ) : (
                        <ChevronDown className="w-4.5 h-4.5" />
                      )}
                    </button>
                  </td>

                </tr>

                {/* Collapsible Details Row */}
                {expandedLogId === log.id && (
                  <tr className="bg-slate-50/50">
                    <td colSpan={5} className="py-3.5 px-8 text-left text-xs font-semibold text-slate-600 leading-relaxed border-t border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{log.details}</span>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {/* Footer Paginate Row */}
        <div className="px-6 py-4.5 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 font-bold text-slate-450">
          <span className="text-xs">
            Showing {startIndex + 1} to {Math.min(startIndex + logsPerPage, auditLogs.length)} of {auditLogs.length} entries
          </span>
          
          <div className="flex items-center gap-1">
            {/* Prev button */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-655 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4.5 h-4.5" />
            </button>
            
            {/* Page 1 */}
            <button
              onClick={() => setCurrentPage(1)}
              className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-extrabold cursor-pointer transition-all ${currentPage === 1 ? 'bg-[#1E5AE6] text-white' : 'text-slate-650 hover:bg-slate-100'}`}
            >
              1
            </button>
            
            {/* Page 2 */}
            <button
              onClick={() => setCurrentPage(2)}
              className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-extrabold cursor-pointer transition-all ${currentPage === 2 ? 'bg-[#1E5AE6] text-white' : 'text-slate-655 hover:bg-slate-100'}`}
            >
              2
            </button>

            {/* Next button */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, 2))}
              disabled={currentPage === 2}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-655 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

      </div>

      {/* AUDIT LOG DETAILS MODAL (OVERLAY BACKDROP) */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col animate-scale-up text-left">
            
            {/* Header */}
            <div className="px-6 py-4.5 bg-white border-b border-slate-250 flex justify-between items-center shrink-0">
              <div className="space-y-1 text-left">
                <span className="text-[9px] font-extrabold text-slate-450 uppercase tracking-wider flex items-center gap-1.5 leading-none">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Audit Log Detail
                </span>
                <h4 className="font-heading font-extrabold text-base text-slate-805 leading-none">
                  Log Entry #AL-99238{selectedLog.id}
                </h4>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-655 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content split grid (Left: ticket info, Right: actor info) */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto">
              
              {/* Left Side (2 columns span) */}
              <div className="lg:col-span-2 space-y-5">
                
                {/* Resolved Support Ticket Top Card */}
                <div className="p-5 bg-[#F8FAFC] border border-slate-200 rounded-2xl flex gap-4 items-start shadow-sm text-left">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1E5AE6] shrink-0 shadow-sm border border-blue-100">
                    {selectedLog.actionType === 'resolve' ? (
                      <Check className="w-5 h-5 text-[#1E5AE6] stroke-[3px]" />
                    ) : (
                      <Edit3 className="w-5 h-5 text-[#1E5AE6]" />
                    )}
                  </div>
                  <div className="space-y-1.5 text-left">
                    <h5 className="font-heading font-extrabold text-sm text-slate-850">
                      {selectedLog.actionType === 'resolve' 
                        ? `Resolved Support Ticket ${selectedLog.ticketId}` 
                        : selectedLog.action}
                    </h5>
                    <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                      {selectedLog.actionType === 'resolve' 
                        ? `The support ticket regarding "${selectedLog.ticketName}" was marked as resolved following a successful field technician visit and verified system ping.` 
                        : selectedLog.details}
                    </p>
                  </div>
                </div>

                {/* Ticket Details Panel */}
                <div className="space-y-3 text-left">
                  <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 pl-1">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    Ticket Details
                  </h5>
                  
                  {/* Detailed card block (split internal grid) */}
                  <div className="border border-slate-200 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white shadow-sm">
                    
                    {/* Left sub-column */}
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Ticket Name</span>
                        <span className="text-xs font-bold text-slate-800 block">{selectedLog.ticketName || 'System Configurations'}</span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Ticket ID</span>
                        <span className="text-xs font-extrabold text-[#1E5AE6] block">{selectedLog.ticketId || '#SYS-CONFIG'}</span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Description</span>
                        <p className="text-[11px] text-slate-500 font-semibold leading-relaxed whitespace-pre-line">
                          {selectedLog.longDesc || selectedLog.details}
                        </p>
                      </div>
                    </div>

                    {/* Right sub-column */}
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Priority Level</span>
                        <div>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold text-white tracking-wider ${selectedLog.priority === 'HIGH' ? 'bg-rose-500' : selectedLog.priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-slate-400'}`}>
                            {selectedLog.priority || 'LOW'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Category</span>
                        <span className="text-xs font-bold text-slate-800 block">{selectedLog.category || 'System Action'}</span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Status</span>
                        <span className="text-xs font-bold text-[#1E5AE6] block">{selectedLog.status || 'Applied'}</span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Personnel Assigned</span>
                        <span className="text-xs font-bold text-slate-850 block">Officer {selectedLog.actor}</span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              {/* Right Side (1 column span) */}
              <div className="space-y-5">
                
                {/* Actor Card info block */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col text-center">
                  {/* Top section */}
                  <div className="p-5 bg-white space-y-3 flex flex-col items-center">
                    {/* Circle avatar */}
                    <div className="w-16 h-16 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 relative">
                      <User className="w-7 h-7" />
                    </div>
                    <div className="space-y-0.5">
                      <h5 className="font-heading font-extrabold text-sm text-slate-900 leading-none">
                        {selectedLog.actor}
                      </h5>
                      <span className="text-[10.5px] text-slate-400 font-bold block pt-1">
                        {selectedLog.role}
                      </span>
                    </div>
                  </div>
                  {/* Bottom section */}
                  <div className="border-t border-slate-200 p-4.5 bg-slate-50/50 space-y-2 text-left text-[11px] font-semibold text-slate-555">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{selectedLog.actorType === 'admin' ? 'admin@bblink.gov' : 'j.ramirez@bblink.gov'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>+63 921 555 1234</span>
                    </div>
                  </div>
                </div>

                {/* Log Context Card (Grey bg card) */}
                <div className="bg-[#EAEAEA]/50 border border-slate-200 rounded-2xl p-5 space-y-4 text-xs font-semibold text-slate-555 shadow-inner">
                  <span className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider block">Log Context</span>
                  
                  <div className="flex justify-between items-center py-0.5">
                    <span>Action Done</span>
                    <span className="text-[#1E5AE6] font-extrabold">{selectedLog.status || 'Applied'}</span>
                  </div>

                  <div className="flex justify-between items-center py-0.5">
                    <span>Timestamp</span>
                    <span className="text-slate-805 font-extrabold">{selectedLog.date} {selectedLog.time}</span>
                  </div>
                </div>

              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4.5 bg-white border-t border-slate-200 flex justify-between items-center shrink-0">
              <button 
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-655 rounded-xl transition-all cursor-pointer"
              >
                Close Details
              </button>

              <button 
                onClick={() => {
                  startDownloadSim(`Log_Entry_AL_99238${selectedLog.id}.csv`, `Please wait while we compile the audit log detail data for log entry #AL-99238${selectedLog.id}.`);
                }}
                className="bg-[#0B3A9B] hover:bg-[#093082] text-white px-4.5 py-2 text-xs font-extrabold flex items-center gap-2 cursor-pointer rounded-xl transition-all shadow-md"
              >
                <Download className="w-4 h-4 text-white" />
                Export Log (.csv)
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DOWNLOAD FLOW MODALS CONTROLLER */}
      {downloadState && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          
          {/* 1. GENERATING PREVIEW MODAL */}
          {downloadState === 'generating' && (
            <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col p-8 items-center text-center animate-scale-up shrink-0 space-y-6">
              
              {/* Spinner wheel with icon */}
              <div className="relative w-16 h-16 flex items-center justify-center">
                {/* Spinner border animation */}
                <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-[#0B3A9B] animate-spin"></div>
                {/* FileText icon in center */}
                <FileText className="w-5 h-5 text-[#0B3A9B]" />
              </div>

              <div className="space-y-2 text-center w-full">
                <h4 className="font-heading font-extrabold text-lg text-slate-900">
                  Generating Preview...
                </h4>
                <p className="text-xs text-slate-400 font-semibold leading-relaxed max-w-xs mx-auto">
                  {downloadTargetText}
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
                  onClick={cancelDownloadSim}
                  className="w-full py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-655 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>

            </div>
          )}

          {/* 2. DOWNLOAD SUCCESS MODAL */}
          {downloadState === 'success' && (
            <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col p-8 items-center text-center animate-scale-up shrink-0 relative">
              
              {/* Close X button */}
              <button 
                onClick={() => setDownloadState(null)}
                className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>

              <div className="w-14 h-14 rounded-full bg-blue-50 border-4 border-blue-100 flex items-center justify-center text-blue-900 shadow-md">
                <Check className="w-7 h-7 text-[#0B3A9B] stroke-[3px]" />
              </div>
              
              <div className="space-y-2 text-center pt-5">
                <h4 className="font-heading font-extrabold text-lg text-slate-900">
                  CSV Download Successful
                </h4>
                <div className="text-xs text-slate-500 font-semibold leading-relaxed max-w-xs mx-auto">
                  <p>Your log file</p>
                  <p className="font-extrabold text-slate-800 pt-0.5">"{downloadFilename}"</p>
                  <p className="pt-0.5">has been successfully downloaded to your device.</p>
                </div>
              </div>

              {/* Show in folder action link */}
              <button
                onClick={() => alert("Simulation: Opening downloads folder...")}
                className="mt-4 flex items-center gap-1.5 text-xs font-extrabold text-blue-650 hover:underline cursor-pointer"
              >
                <Folder className="w-4 h-4 text-blue-650" />
                <span>Show in Folder</span>
              </button>

              <button
                onClick={() => {
                  setDownloadState(null);
                  setSelectedLog(null); // Dismiss details modal together when done is clicked
                }}
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

export default AuditLog;
