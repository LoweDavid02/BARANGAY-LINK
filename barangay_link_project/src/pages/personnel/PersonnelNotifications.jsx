import React, { useState } from 'react';
import { useTickets } from '../../context/TicketContext';
import { 
  Bell, 
  Check, 
  AlertCircle, 
  Ticket, 
  RefreshCw, 
  Info, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  SlidersHorizontal,
  MailOpen,
  Mail
} from 'lucide-react';

const PersonnelNotifications = () => {
  const { notifications, bulkReadNotifications, bulkUnreadNotifications, dismissNotification } = useTickets();

  // Tab Filtering & Selection States
  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Unread' | 'Read'
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Filter list based on selected tab
  const filteredList = notifications.filter(n => {
    if (activeTab === 'Unread') return !n.read;
    if (activeTab === 'Read') return n.read;
    return true; // 'All'
  });

  // Toggle selection for a single notification
  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Toggle selection for all currently filtered notifications
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredList.map(n => n.id));
    }
  };

  // Bulk Actions
  const markSelectedAsRead = async () => {
    if (selectedIds.length === 0) return;
    await bulkReadNotifications(selectedIds);
    setSelectedIds([]);
    triggerToast("Selected notifications marked as read!");
  };

  const markSelectedAsUnread = async () => {
    if (selectedIds.length === 0) return;
    await bulkUnreadNotifications(selectedIds);
    setSelectedIds([]);
    triggerToast("Selected notifications marked as unread!");
  };

  const deleteSelected = async () => {
    if (selectedIds.length === 0) return;
    await Promise.all(selectedIds.map(id => dismissNotification(id)));
    setSelectedIds([]);
    triggerToast("Selected notifications dismissed!");
  };

  const dismissSingle = async (id) => {
    await dismissNotification(id);
    setSelectedIds(prev => prev.filter(x => x !== id));
    triggerToast("Notification dismissed!");
  };

  return (
    <div className="space-y-6 text-left relative font-sans">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#0B3A9B] text-white px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in">
          <Check className="w-5 h-5 shrink-0" />
          <span className="text-sm font-extrabold tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* Header section matching style of dashboard */}
      <div className="space-y-1 shrink-0">
        <h2 className="font-heading font-extrabold text-2xl tracking-tight text-slate-900">
          Notifications
        </h2>
        <p className="text-xs text-slate-400 font-semibold leading-relaxed">
          Stay updated with the latest service requests and infrastructure tasks.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 space-y-6 min-h-[70vh] flex flex-col justify-between">
        
        {/* Navigation Tabs and Controls Wrapper */}
        <div className="space-y-4 shrink-0">
          
          {/* Tabs Filter Row */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-0.5">
            <div className="flex gap-6">
              {[
                { id: 'All', label: `All (${notifications.length})` },
                { id: 'Unread', label: `Unread (${notifications.filter(n => !n.read).length})` },
                { id: 'Read', label: `Read (${notifications.filter(n => n.read).length})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSelectedIds([]);
                  }}
                  className={`pb-3 text-xs font-bold transition-all relative cursor-pointer ${
                    activeTab === tab.id 
                      ? 'text-[#0B3A9B] font-extrabold' 
                      : 'text-slate-450 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0B3A9B] rounded-full animate-fade-in" />
                  )}
                </button>
              ))}
            </div>

            {/* Select All Toggle for checkboxes */}
            {filteredList.length > 0 && (
              <button 
                onClick={toggleSelectAll}
                className="text-[11px] font-extrabold text-slate-450 hover:text-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                {selectedIds.length === filteredList.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>

          {/* Bulk Actions Banner (appears only when items are checked) */}
          {selectedIds.length > 0 && (
            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-3.5 flex items-center justify-between flex-wrap gap-3 animate-fade-in">
              <span className="text-xs font-extrabold text-[#1E4E7C]">
                Selected {selectedIds.length} item(s)
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={markSelectedAsRead}
                  className="px-3.5 py-1.5 bg-white border border-blue-100 hover:bg-slate-50 text-[#0B3A9B] rounded-xl text-[10px] font-extrabold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                >
                  <MailOpen className="w-3.5 h-3.5" />
                  Mark as Read
                </button>
                <button
                  onClick={markSelectedAsUnread}
                  className="px-3.5 py-1.5 bg-white border border-blue-100 hover:bg-slate-50 text-[#0B3A9B] rounded-xl text-[10px] font-extrabold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Mark as Unread
                </button>
                <button
                  onClick={deleteSelected}
                  className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-650 rounded-xl text-[10px] font-extrabold flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Dismiss
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Notifications Roster list */}
        <div className="flex-1 space-y-3.5 mt-2 overflow-y-auto max-h-[50vh] pr-2">
          {filteredList.length === 0 ? (
            <div className="py-24 text-center text-xs text-slate-400 font-extrabold">
              No notifications in this folder.
            </div>
          ) : (
            filteredList.map((n) => {
              const getIconComponent = (type) => {
                if (type === 'urgent') return AlertCircle;
                if (type === 'assigned') return Ticket;
                if (type === 'status') return RefreshCw;
                return Info;
              };
              const Icon = getIconComponent(n.type);
              const isSelected = selectedIds.includes(n.id);
              
              return (
                <div 
                  key={n.id} 
                  className={`
                    w-full flex items-start gap-4 p-5 bg-white border rounded-3xl transition-all shadow-sm relative text-left hover:border-slate-300
                    ${n.type === 'urgent' ? 'border-l-4 border-l-red-500 pl-4.5' : 'border-slate-205'}
                    ${!n.read ? 'bg-[#EFF6FF]/10' : ''}
                  `}
                >
                  {/* Selection Checkbox */}
                  <div className="pt-2">
                    <input 
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(n.id)}
                      className="w-4 h-4 accent-[#0B3A9B] rounded border-slate-300 cursor-pointer shrink-0"
                    />
                  </div>

                  {/* Notification Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${n.iconClass}`}>
                    <Icon className="w-4.5 h-4.5 stroke-[2.5]" />
                  </div>

                  {/* Middle Content */}
                  <div className="flex-1 min-w-0 space-y-1.5 text-left">
                    <div className="flex items-center justify-between gap-4">
                      <h4 className="font-heading font-extrabold text-sm text-slate-900 leading-snug truncate">
                        {n.title}
                      </h4>
                      <span className="bg-slate-100 text-slate-500 text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase shrink-0">
                        {n.time}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                      {n.message}
                    </p>

                    {/* View details or action links for Urgent alerts */}
                    {n.type === 'urgent' && (
                      <div className="flex gap-4 pt-1 text-[11px]">
                        <button 
                          onClick={() => triggerToast("Navigating to ticket details...")}
                          className="text-[#1E5AE6] hover:underline font-extrabold cursor-pointer"
                        >
                          View Details
                        </button>
                        <button 
                          onClick={() => dismissSingle(n.id)}
                          className="text-slate-400 hover:underline font-bold cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right side unread dot */}
                  {!n.read && (
                    <div className="pt-2 shrink-0">
                      <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

        {/* Footer Pagination Controls */}
        <div className="border-t border-slate-100 pt-5 mt-4 flex items-center justify-between shrink-0 flex-wrap gap-3">
          <span className="text-[11px] text-slate-400 font-bold">
            Showing {filteredList.length} of {notifications.length} notifications
          </span>

          <div className="flex items-center gap-1.5">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <button 
              onClick={() => setCurrentPage(1)}
              className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                currentPage === 1 
                  ? 'bg-[#0B3A9B] text-white shadow-sm font-extrabold' 
                  : 'border border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              1
            </button>

            <button 
              onClick={() => setCurrentPage(2)}
              className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                currentPage === 2 
                  ? 'bg-[#0B3A9B] text-white shadow-sm font-extrabold' 
                  : 'border border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              2
            </button>

            <button 
              disabled={currentPage === 2}
              onClick={() => setCurrentPage(2)}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default PersonnelNotifications;
