import React, { useState, useEffect, useRef } from 'react';
import { useTickets } from '../context/TicketContext';
import PortalPreloader from '../components/PortalPreloader';
import { 
  LayoutGrid, 
  Ticket, 
  Users, 
  FileText, 
  ShieldAlert, 
  LogOut, 
  Bell, 
  Menu, 
  X, 
  CheckCircle, 
  User, 
  ChevronDown, 
  Search, 
  Building2, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';

const SidebarLayout = ({ children, pageTitle = "Dashboard" }) => {
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
  const openTicketCount = tickets.filter(t => t.status === 'Submitted' || t.status === 'Needs Attention').length;

  // Menu items exact mapping
  const menuItems = currentUserType === 'personnel'
    ? [
        { id: 'personnel-dashboard', label: 'Dashboard', icon: LayoutGrid },
        { id: 'personnel-worklist', label: 'Assigned Tickets', icon: Ticket, badge: openTicketCount },
        { id: 'personnel-notifications', label: 'Notifications', icon: Bell },
      ]
    : [
        { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutGrid },
        { id: 'admin-assign', label: 'Ticket Management', icon: Ticket, badge: openTicketCount },
        { id: 'admin-personnel', label: 'Personnel', icon: Users },
        { id: 'admin-reports', label: 'Reports', icon: FileText },
      ];

  const systemItems = currentUserType === 'personnel'
    ? []
    : [
        { id: 'admin-logs', label: 'Audit logs', icon: ShieldAlert },
      ];

  // Page title mapping for breadcrumb
  const pageTitleMap = {
    'admin-dashboard': 'Dashboard',
    'admin-assign': 'Ticket Management',
    'admin-personnel': 'Personnel',
    'admin-reports': 'Reports',
    'admin-logs': 'Audit logs',
    'personnel-dashboard': 'Dashboard',
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

  const userName = currentUser?.name || 'Admin';

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
          w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3.5 px-6'} py-3 text-sm font-medium transition-all duration-150 cursor-pointer text-left relative
          ${isActive 
            ? 'bg-[#313B4E] text-white font-semibold' 
            : 'text-slate-400 hover:text-slate-200 hover:bg-[#252E3F]'}
        `}
      >
        <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
        {!isCollapsed && <span className="truncate flex-1">{item.label}</span>}
        {!isCollapsed && item.badge > 0 && (
          <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex antialiased font-sans">

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
                Are you sure you want to sign out of the portal?
              </p>
            </div>
            <div className="flex gap-3 w-full pt-1">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition-all shadow-md cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ LEFT SIDEBAR ============ */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 bg-[#1E2433] text-slate-300 flex flex-col transition-all duration-300 ease-in-out
        md:sticky md:top-0 md:h-screen
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isCollapsed ? 'w-[70px]' : 'w-[250px]'}
      `}>
        
        {/* Sidebar Header — Logo & Title */}
        <div className={`px-5 pt-6 pb-6 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} shrink-0`}>
          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm text-[#1E2433]">
            <Building2 className="w-5 h-5 stroke-[2.2]" />
          </div>
          {!isCollapsed && (
            <div className="leading-tight text-left">
              <span className="text-white font-bold text-base block tracking-tight">Barangay Link</span>
              <span className="text-slate-400 text-[11px] font-normal block">Community Service Admin</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto pt-2">
          {/* MENU group */}
          <div className={`px-6 pt-2 pb-2 ${isCollapsed ? 'hidden' : 'block'}`}>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">MENU</span>
          </div>
          <div className="space-y-0.5">
            {menuItems.map(renderNavItem)}
          </div>

          {/* SYSTEM / AUDIT group */}
          {systemItems.length > 0 && (
            <>
              <div className={`px-6 pt-6 pb-2 ${isCollapsed ? 'hidden' : 'block'}`}>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">MENU</span>
              </div>
              <div className="space-y-0.5">
                {systemItems.map(renderNavItem)}
              </div>
            </>
          )}
        </nav>

        {/* Sidebar Footer — Barangay Identity & Collapse Toggle */}
        <div className={`p-4 border-t border-slate-700/30 shrink-0 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between gap-2'}`}>
          {!isCollapsed && (
            <div className="flex items-center gap-3 min-w-0 text-left">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm text-[#1E2433]">
                <Building2 className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="leading-tight min-w-0">
                <span className="text-white text-xs font-bold block truncate">Brgy. San Vicente</span>
                <span className="text-slate-400 text-[11px] block truncate">Apalit, Pampanga</span>
              </div>
            </div>
          )}
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-7 h-7 rounded-md bg-[#252E3F] hover:bg-[#313B4E] text-slate-300 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
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
      <div className="flex-1 flex flex-col min-h-screen min-w-0">

        {/* ============ TOP BAR ============ */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-6 h-16 flex items-center justify-between shrink-0 shadow-xs">
          
          {/* Left: Mobile hamburger + Breadcrumb */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-600"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            {/* Breadcrumb: "Admin / Dashboard" */}
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-slate-400 font-medium">
                {currentUserType === 'personnel' ? 'Personnel' : 'Admin'}
              </span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-800 font-bold">{currentPageTitle}</span>
            </div>
          </div>

          {/* Center Search Input */}
          <div ref={searchRef} className="relative hidden md:block flex-1 max-w-md mx-8">
            <div className="flex items-center bg-[#F1F3F9] border border-slate-200/60 focus-within:border-slate-400 focus-within:bg-white rounded-lg px-3.5 py-1.5 w-full transition-all">
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
                placeholder="Search ticket" 
                className="bg-transparent text-xs text-slate-700 placeholder-slate-400 outline-none w-full font-medium"
              />
              {globalSearchQuery && (
                <button 
                  onClick={() => {
                    if (setGlobalSearchQuery) setGlobalSearchQuery('');
                    setShowSearchResults(false);
                  }}
                  className="p-0.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Live Search Results Dropdown */}
            {showSearchResults && searchTerm.length > 0 && (
              <div className="absolute left-0 mt-2 w-full bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden z-50">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Results ({totalResultsCount})
                  </span>
                  <button 
                    onClick={() => setShowSearchResults(false)} 
                    className="text-[10px] text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {matchingTickets.map(ticket => (
                    <div 
                      key={ticket.id}
                      onClick={() => {
                        setShowSearchResults(false);
                        setCurrentRoute(currentUserType === 'personnel' ? 'personnel-worklist' : 'admin-assign');
                      }}
                      className="p-3 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between text-left"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-[#1E2536] block truncate">
                          {ticket.id} · {ticket.subject}
                        </span>
                        <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                          {ticket.resident?.name || 'Resident'} · {ticket.location?.address || ticket.category}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 px-2 py-0.5 rounded-full bg-slate-100">
                        {ticket.status}
                      </span>
                    </div>
                  ))}

                  {totalResultsCount === 0 && (
                    <div className="p-4 text-center text-xs text-slate-500 font-medium">
                      No matching tickets found
                    </div>
                  )}
                </div>
              </div>
            )}
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
                className="relative p-2 rounded-lg bg-slate-100 hover:bg-slate-200/80 transition-colors cursor-pointer flex items-center justify-center text-slate-600"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-slate-900 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center border border-white">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <span className="font-bold text-slate-900 text-xs">Notifications</span>
                    {unreadNotificationsCount > 0 && (
                      <button 
                        onClick={() => {
                          readAllNotifications();
                          setShowNotifications(false);
                        }}
                        className="text-[11px] text-slate-600 hover:underline font-bold cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">No notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => handleNotifClick(n.id)}
                          className={`p-3 text-xs hover:bg-slate-50 transition-colors cursor-pointer text-left ${!n.read ? 'bg-blue-50/20 font-medium' : ''}`}
                        >
                          <p className="text-slate-800 text-[11px]">{n.message}</p>
                          <span className="text-slate-400 block text-[9px] pt-1">{n.time}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Dark Pill Button */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileDropdown(!showProfileDropdown);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2.5 bg-[#1E2536] hover:bg-[#252E3F] text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                  {userName.charAt(0)}
                </div>
                <span className="text-xs font-bold text-white block">{userName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50 py-1">
                  <button
                    onClick={() => {
                      setCurrentRoute(currentUserType === 'personnel' ? 'personnel-profile' : 'admin-profile');
                      setShowProfileDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left border-b border-slate-100"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    Profile Settings
                  </button>
                  <button
                    onClick={() => {
                      setShowLogoutModal(true);
                      setShowProfileDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ============ MAIN CONTENT ============ */}
        <main className="flex-1 overflow-y-auto bg-[#F4F6F9] p-6 md:p-8">
          <div className="w-full max-w-7xl mx-auto pb-16">
            {children}
          </div>
        </main>

      </div>

      {/* Preloader Overlay on Sign Out */}
      {isLoggingOut && <PortalPreloader message="Signing out..." />}
    </div>
  );
};

export default SidebarLayout;
