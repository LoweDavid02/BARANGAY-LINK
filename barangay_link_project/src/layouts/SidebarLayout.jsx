import React, { useState, useEffect, useRef } from 'react';
import { useTickets } from '../context/TicketContext';
import PortalPreloader from '../components/PortalPreloader';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  FileText, 
  LogOut, 
  Bell, 
  Menu, 
  X, 
  CheckCircle, 
  Inbox,
  User,
  ChevronDown,
  Search,
  CheckSquare,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import logo from '../assets/Blinked.png';

const SidebarLayout = ({ children, pageTitle = "Overview" }) => {
  const { 
    currentRoute, 
    setCurrentRoute, 
    tickets,
    personnel,
    notifications, 
    readAllNotifications,
    bulkReadNotifications,
    bulkUnreadNotifications,
    currentUserType,
    currentUser,
    globalSearchQuery,
    setGlobalSearchQuery,
    logout
  } = useTickets();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [selectedNotifIds, setSelectedNotifIds] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);

  // Close search results dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchTerm = (globalSearchQuery || '').trim().toLowerCase();

  const matchingTickets = searchTerm ? (tickets || []).filter(t => 
    (t.id && t.id.toLowerCase().includes(searchTerm)) ||
    (t.subject && t.subject.toLowerCase().includes(searchTerm)) ||
    (t.description && t.description.toLowerCase().includes(searchTerm)) ||
    (t.category && t.category.toLowerCase().includes(searchTerm)) ||
    (t.resident?.name && t.resident.name.toLowerCase().includes(searchTerm)) ||
    (t.submitter?.name && t.submitter.name.toLowerCase().includes(searchTerm)) ||
    (t.location?.address && t.location.address.toLowerCase().includes(searchTerm)) ||
    (t.status && t.status.toLowerCase().includes(searchTerm))
  ).slice(0, 5) : [];

  const matchingPersonnel = searchTerm ? (personnel || []).filter(p =>
    (p.name && p.name.toLowerCase().includes(searchTerm)) ||
    (p.role && p.role.toLowerCase().includes(searchTerm)) ||
    (p.detailed_role && p.detailed_role.toLowerCase().includes(searchTerm)) ||
    (p.department && p.department.toLowerCase().includes(searchTerm)) ||
    (p.email && p.email.toLowerCase().includes(searchTerm))
  ).slice(0, 3) : [];

  const totalResultsCount = matchingTickets.length + matchingPersonnel.length;

  const toggleSelectNotif = (id, e) => {
    e.stopPropagation();
    setSelectedNotifIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleNotifClick = async (id) => {
    if (bulkReadNotifications) {
      await bulkReadNotifications([id]);
    }
    if (currentUserType === 'personnel') {
      setCurrentRoute('personnel-worklist');
    } else {
      setCurrentRoute('admin-assign');
    }
    setShowNotifications(false);
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // Ticket badge count for sidebar
  const openTicketCount = tickets.filter(t => t.status === 'Submitted' || t.status === 'Needs Attention').length;

  // Menu items split into groups
  const menuItems = currentUserType === 'personnel'
    ? [
        { id: 'personnel-dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'personnel-worklist', label: 'Assigned Tickets', icon: Inbox, badge: openTicketCount },
        { id: 'personnel-notifications', label: 'Notifications', icon: CheckSquare },
      ]
    : [
        { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'admin-assign', label: 'Ticket Management', icon: Inbox, badge: openTicketCount },
        { id: 'admin-personnel', label: 'Personnel', icon: Users },
        { id: 'admin-reports', label: 'Reports', icon: BarChart3 },
      ];

  const systemItems = currentUserType === 'personnel'
    ? []
    : [
        { id: 'admin-logs', label: 'Audit Logs', icon: FileText },
      ];

  // Page title mapping for breadcrumb
  const pageTitleMap = {
    'admin-dashboard': 'Overview',
    'admin-assign': 'Ticket Management',
    'admin-personnel': 'Personnel',
    'admin-reports': 'Reports',
    'admin-logs': 'Audit Logs',
    'personnel-dashboard': 'Overview',
    'personnel-worklist': 'Assigned Tickets',
    'personnel-notifications': 'Notifications',
  };

  const currentPageTitle = pageTitleMap[currentRoute] || pageTitle;

  const handleLogout = async () => {
    setShowLogoutModal(false);
    setIsLoggingOut(true);
    try {
      if (typeof logout === 'function') {
        await logout();
      } else {
        localStorage.removeItem('blink_access_token');
        localStorage.removeItem('blink_current_user');
        if (setCurrentRoute) setCurrentRoute('admin-login');
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Initials for avatar
  const userInitials = (currentUser?.name || 'JC').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const userName = currentUser?.name || 'Juan Dela Cruz';
  const userRole = currentUser?.role || (currentUserType === 'personnel' ? 'Field Personnel' : 'Barangay Admin');

  const renderNavItem = (item) => {
    const Icon = item.icon;
    const isActive = currentRoute === item.id;
    return (
      <button
        key={item.id}
        onClick={() => {
          setCurrentRoute(item.id);
          setMobileMenuOpen(false);
        }}
        title={isCollapsed ? item.label : undefined}
        className={`
          w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-5'} py-3 text-[13px] font-semibold tracking-tight transition-all duration-200 cursor-pointer text-left relative
          ${isActive 
            ? 'bg-[#1a3a5c] text-white' 
            : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'}
        `}
      >
        {/* Gold active indicator bar */}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 bg-[#D4A843] rounded-r-full" />
        )}
        <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
        {!isCollapsed && <span className="truncate flex-1">{item.label}</span>}
        {!isCollapsed && item.badge > 0 && (
          <span className="bg-[#D4A843]/20 text-[#D4A843] text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[22px] text-center">
            {item.badge}
          </span>
        )}
        {isCollapsed && item.badge > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#D4A843] rounded-full" />
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex antialiased font-sans">

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col p-8 items-center text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-red-50 border-4 border-red-100 flex items-center justify-center">
              <LogOut className="w-6 h-6 text-red-500" />
            </div>
            <div className="space-y-1.5">
              <h4 className="font-heading font-extrabold text-base text-slate-900">
                Confirm Sign Out
              </h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Are you sure you want to sign out of the portal? You will need to log in again to access the system.
              </p>
            </div>
            <div className="flex gap-3 w-full pt-1">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-extrabold text-slate-700 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-extrabold text-white transition-all shadow-md cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ LEFT SIDEBAR ============ */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 bg-[#0B2545] text-slate-300 flex flex-col transition-all duration-300 ease-in-out
        md:sticky md:top-0 md:h-screen
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isCollapsed ? 'w-[70px]' : 'w-[260px]'}
      `}>
        
        {/* Sidebar Header — Logo */}
        <div className={`px-4 pt-5 pb-6 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} shrink-0`}>
          <div className="w-9 h-9 rounded-full bg-[#1a3a5c] flex items-center justify-center shrink-0 overflow-hidden">
            <img src={logo} alt="BLinked" className="w-7 h-7 object-contain" />
          </div>
          {!isCollapsed && (
            <div className="leading-tight">
              <span className="text-white font-bold text-sm block">Barangay Link</span>
              <span className="text-slate-500 text-[10px] font-medium block">Community Services Admin</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto">
          {/* MENU group */}
          <div className={`px-5 pt-2 pb-2 ${isCollapsed ? 'hidden' : 'block'}`}>
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Menu</span>
          </div>
          <div className="space-y-0.5">
            {menuItems.map(renderNavItem)}
          </div>

          {/* SYSTEM group */}
          {systemItems.length > 0 && (
            <>
              <div className={`px-5 pt-6 pb-2 ${isCollapsed ? 'hidden' : 'block'}`}>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">System</span>
              </div>
              <div className="space-y-0.5">
                {systemItems.map(renderNavItem)}
              </div>
            </>
          )}
        </nav>

        {/* Sidebar Footer — Barangay Identity & Collapse Toggle */}
        <div className={`px-4 py-4 border-t border-slate-700/40 shrink-0 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between gap-2'}`}>
          {!isCollapsed && (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#1a3a5c] flex items-center justify-center text-[10px] font-black text-[#D4A843] shrink-0">
                SV
              </div>
              <div className="leading-tight min-w-0">
                <span className="text-white text-xs font-bold block truncate">Brgy. San Vicente</span>
                <span className="text-slate-500 text-[10px] font-medium block truncate">Apalit, Pampanga</span>
              </div>
            </div>
          )}
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-[#1a3a5c] text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
            title={isCollapsed ? "Expand sidebar" : "Minimize sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen className="w-4.5 h-4.5" /> : <PanelLeftClose className="w-4.5 h-4.5" />}
          </button>
        </div>
      </aside>

      {/* Overlay for Mobile Sidebar */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm md:hidden"
        />
      )}

      {/* ============ RIGHT CONTENT COLUMN ============ */}
      <div className="flex-1 flex flex-col min-h-screen">

        {/* ============ TOP BAR ============ */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 h-14 flex items-center justify-between shrink-0">
          
          {/* Left: Mobile hamburger + Breadcrumb */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-600"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            {/* Breadcrumb: "Admin / Overview" */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400 font-medium">
                {currentUserType === 'personnel' ? 'Personnel' : 'Admin'}
              </span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 font-bold">{currentPageTitle}</span>
            </div>

            {/* Functional Search Field with Live Results */}
            <div ref={searchRef} className="relative hidden md:block ml-4">
              <div className="flex items-center bg-slate-50 border border-slate-200 focus-within:border-[#0B2545] focus-within:ring-2 focus-within:ring-[#0B2545]/10 rounded-xl px-3 py-1.5 w-72 lg:w-80 transition-all">
                <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
                <input 
                  type="text" 
                  value={globalSearchQuery || ''}
                  onChange={(e) => {
                    if (setGlobalSearchQuery) setGlobalSearchQuery(e.target.value);
                    setShowSearchResults(true);
                  }}
                  onFocus={() => {
                    if (globalSearchQuery && globalSearchQuery.trim()) {
                      setShowSearchResults(true);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setShowSearchResults(false);
                      setCurrentRoute(currentUserType === 'personnel' ? 'personnel-worklist' : 'admin-assign');
                    }
                  }}
                  placeholder="Search residents, tickets, records..." 
                  className="bg-transparent text-xs text-slate-700 placeholder-slate-400 outline-none w-full font-medium"
                />
                {globalSearchQuery && (
                  <button 
                    onClick={() => {
                      if (setGlobalSearchQuery) setGlobalSearchQuery('');
                      setShowSearchResults(false);
                    }}
                    className="p-1 hover:bg-slate-200/60 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Live Search Results Dropdown */}
              {showSearchResults && searchTerm.length > 0 && (
                <div className="absolute left-0 mt-2 w-96 bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                      Search Results ({totalResultsCount})
                    </span>
                    <button 
                      onClick={() => setShowSearchResults(false)} 
                      className="text-[10px] text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
                    >
                      Close
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {/* Tickets Section */}
                    {matchingTickets.length > 0 && (
                      <div className="p-2">
                        <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="w-3 h-3 text-slate-400" />
                          Tickets ({matchingTickets.length})
                        </div>
                        {matchingTickets.map(ticket => (
                          <div 
                            key={ticket.id}
                            onClick={() => {
                              setShowSearchResults(false);
                              setCurrentRoute(currentUserType === 'personnel' ? 'personnel-worklist' : 'admin-assign');
                            }}
                            className="p-2.5 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group flex items-start justify-between gap-3 text-left"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-extrabold text-[#0B2545] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                                  {ticket.id}
                                </span>
                                <span className="text-xs font-bold text-slate-800 truncate group-hover:text-[#0B2545] transition-colors">
                                  {ticket.subject}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                                {ticket.resident?.name || ticket.submitter?.name || 'Resident'} · {ticket.location?.address || ticket.category}
                              </p>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 px-2 py-0.5 rounded-full bg-slate-100 shrink-0">
                              {ticket.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Personnel Section */}
                    {matchingPersonnel.length > 0 && (
                      <div className="p-2 bg-slate-50/50">
                        <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Users className="w-3 h-3 text-slate-400" />
                          Personnel ({matchingPersonnel.length})
                        </div>
                        {matchingPersonnel.map(p => (
                          <div 
                            key={p.id}
                            onClick={() => {
                              setShowSearchResults(false);
                              setCurrentRoute('admin-personnel');
                            }}
                            className="p-2.5 hover:bg-white rounded-xl transition-colors cursor-pointer group flex items-center justify-between gap-3 text-left"
                          >
                            <div className="min-w-0 flex-1">
                              <span className="text-xs font-bold text-slate-800 block truncate group-hover:text-[#0B2545]">
                                {p.name}
                              </span>
                              <span className="text-[11px] text-slate-400 font-medium block truncate">
                                {p.role || p.detailed_role} · {p.department}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 shrink-0">
                              {p.status || 'Active'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* No Results Fallback */}
                    {totalResultsCount === 0 && (
                      <div className="p-6 text-center space-y-2">
                        <Search className="w-8 h-8 text-slate-300 mx-auto stroke-[1.5]" />
                        <p className="text-xs font-bold text-slate-700">No matching records found</p>
                        <p className="text-[11px] text-slate-400">
                          No tickets or personnel matched "<span className="font-semibold text-slate-600">{globalSearchQuery}</span>"
                        </p>
                      </div>
                    )}
                  </div>

                  {totalResultsCount > 0 && (
                    <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                      <button
                        onClick={() => {
                          setShowSearchResults(false);
                          setCurrentRoute(currentUserType === 'personnel' ? 'personnel-worklist' : 'admin-assign');
                        }}
                        className="text-[11px] font-extrabold text-[#0B2545] hover:underline cursor-pointer"
                      >
                        View all ticket matches in Ticket Management →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Notifications + Profile */}
          <div className="flex items-center gap-3">
            
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileDropdown(false);
                }}
                className="relative p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Bell className="w-[18px] h-[18px] text-slate-500" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#D4A843] rounded-full ring-2 ring-white" />
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50 min-h-[48px]">
                    {selectedNotifIds.length > 0 ? (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-black text-slate-700">{selectedNotifIds.length} selected</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={async () => {
                              if (bulkReadNotifications) await bulkReadNotifications(selectedNotifIds);
                              setSelectedNotifIds([]);
                            }}
                            className="text-[10px] bg-[#0B2545] hover:bg-[#081d36] text-white px-2.5 py-1 rounded-lg font-extrabold cursor-pointer"
                          >
                            Mark Read
                          </button>
                          <button 
                            onClick={async () => {
                              if (bulkUnreadNotifications) await bulkUnreadNotifications(selectedNotifIds);
                              setSelectedNotifIds([]);
                            }}
                            className="text-[10px] bg-slate-500 hover:bg-slate-600 text-white px-2.5 py-1 rounded-lg font-extrabold cursor-pointer"
                          >
                            Mark Unread
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="font-bold text-slate-900 text-sm">Notifications</span>
                        {unreadNotificationsCount > 0 && (
                          <button 
                            onClick={() => {
                              readAllNotifications();
                              setShowNotifications(false);
                            }}
                            className="text-xs text-[#0B2545] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Mark all read
                          </button>
                        )}
                      </>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500 font-semibold">No notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => handleNotifClick(n.id)}
                          className={`p-3.5 text-xs hover:bg-slate-50 transition-colors flex items-start gap-2.5 cursor-pointer ${!n.read ? 'bg-blue-50/10 font-semibold border-l-2 border-[#D4A843]' : ''}`}
                        >
                          <input 
                            type="checkbox" 
                            checked={selectedNotifIds.includes(n.id)}
                            onChange={(e) => toggleSelectNotif(n.id, e)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-0.5 w-3.5 h-3.5 accent-[#0B2545] cursor-pointer shrink-0"
                          />
                          <div className="flex-1 min-w-0 leading-tight text-left">
                            <p className="text-slate-800 text-[11px] font-medium leading-relaxed">{n.message}</p>
                            <span className="text-slate-400 block text-[9px] pt-1">{n.time}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileDropdown(!showProfileDropdown);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2.5 hover:bg-slate-50 px-2 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#0B2545] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                  {userInitials}
                </div>
                <div className="hidden sm:block text-left leading-tight">
                  <span className="text-xs font-bold text-slate-800 block">{userName}</span>
                  <span className="text-[10px] text-slate-400 font-medium block">{userRole}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* Profile Dropdown */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden z-50 py-1">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800 block">{userName}</span>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block pt-0.5">{userRole}</span>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentRoute(currentUserType === 'personnel' ? 'personnel-profile' : 'admin-profile');
                      setShowProfileDropdown(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left border-b border-slate-100"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    View Profile
                  </button>
                  <button
                    onClick={() => {
                      setShowLogoutModal(true);
                      setShowProfileDropdown(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out Portal
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ============ MAIN CONTENT ============ */}
        <main className="flex-1 overflow-y-auto bg-[#F1F5F9] p-5 md:p-6">
          <div className="w-full pb-16">
            {children}
          </div>
        </main>

      </div>

      {/* Preloader Overlay on Sign Out */}
      {isLoggingOut && <PortalPreloader message="Signing out of the portal..." />}
    </div>
  );
};

export default SidebarLayout;
