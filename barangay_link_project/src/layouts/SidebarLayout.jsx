import React, { useState } from 'react';
import { useTickets } from '../context/TicketContext';
import PortalPreloader from '../components/PortalPreloader';
import { 
  Shield, 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  FileText, 
  Settings, 
  LogOut, 
  Bell, 
  ChevronRight, 
  Menu, 
  X, 
  CheckCircle, 
  Eye, 
  Landmark, 
  ChevronDown, 
  Inbox,
  User,
  AlertTriangle,
  CheckSquare,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

const SidebarLayout = ({ children, pageTitle = "B-LINK Admin Portal" }) => {
  const { 
    currentRoute, 
    setCurrentRoute, 
    notifications, 
    readAllNotifications,
    bulkReadNotifications,
    bulkUnreadNotifications,
    currentUserType,
    currentUser,
    logout
  } = useTickets();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [selectedNotifIds, setSelectedNotifIds] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  const navItems = currentUserType === 'personnel'
    ? [
        { id: 'personnel-dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'personnel-worklist', label: 'Assigned Tickets', icon: Inbox },
        { id: 'personnel-notifications', label: 'Notifications', icon: CheckSquare },
      ]
    : [
        { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'admin-assign', label: 'Ticket Management', icon: Inbox },
        { id: 'admin-personnel', label: 'Personnel', icon: Users },
        { id: 'admin-reports', label: 'Reports', icon: BarChart3 },
        { id: 'admin-logs', label: 'Audit logs', icon: FileText },
      ];

  const handleLogout = async () => {
    setShowLogoutModal(false);
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
  };

  if (isLoggingOut) {
    return <PortalPreloader message="Signing out of the portal..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased font-sans">

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col p-8 items-center text-center space-y-5">
            
            {/* Warning Icon */}
            <div className="w-14 h-14 rounded-full bg-red-50 border-4 border-red-100 flex items-center justify-center">
              <LogOut className="w-6 h-6 text-red-500" />
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <h4 className="font-heading font-extrabold text-base text-slate-900">
                Confirm Sign Out
              </h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Are you sure you want to sign out of the portal? You will need to log in again to access the system.
              </p>
            </div>

            {/* Action Buttons */}
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
      
      {/* 1. TOP NAVBAR (FULL WIDTH) */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between h-16 shrink-0 shadow-sm">
        
        {/* Logo and Page Title */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-650 mr-1"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1E5AE6] flex items-center justify-center text-white shadow-sm shadow-blue-200">
              <Landmark className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-extrabold text-lg tracking-tight text-slate-900">
              Barangay Link
            </span>
          </div>

          <div className="h-5 w-px bg-slate-200 mx-4 hidden md:block"></div>

          <h1 className="font-heading font-extrabold text-base text-[#1E5AE6] tracking-tight hidden md:block">
            {pageTitle}
          </h1>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          
          {/* Notification Badge Panel */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileDropdown(false);
              }}
              className="relative p-2 rounded-xl bg-slate-100/80 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Bell className="w-4.5 h-4.5 text-slate-600" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#1E5AE6] rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-slate-150 flex items-center justify-between bg-slate-50 min-h-[48px]">
                  {selectedNotifIds.length > 0 ? (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-black text-slate-700">{selectedNotifIds.length} selected</span>
                      <div className="flex gap-2">
                        <button 
                          onClick={async () => {
                            if (bulkReadNotifications) await bulkReadNotifications(selectedNotifIds);
                            setSelectedNotifIds([]);
                          }}
                          className="text-[10px] bg-[#1E5AE6] hover:bg-blue-700 text-white px-2.5 py-1 rounded-lg font-extrabold cursor-pointer"
                        >
                          Mark Read
                        </button>
                        <button 
                          onClick={async () => {
                            if (bulkUnreadNotifications) await bulkUnreadNotifications(selectedNotifIds);
                            setSelectedNotifIds([]);
                          }}
                          className="text-[10px] bg-slate-550 hover:bg-slate-650 text-white px-2.5 py-1 rounded-lg font-extrabold cursor-pointer"
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
                          className="text-xs text-[#1E5AE6] hover:underline font-bold flex items-center gap-1 cursor-pointer"
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
                        className={`p-3.5 text-xs hover:bg-slate-50 transition-colors flex items-start gap-2.5 cursor-pointer ${!n.read ? 'bg-blue-50/10 font-semibold border-l-2 border-[#1E5AE6]' : ''}`}
                      >
                        <input 
                          type="checkbox" 
                          checked={selectedNotifIds.includes(n.id)}
                          onChange={(e) => toggleSelectNotif(n.id, e)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-0.5 w-3.5 h-3.5 accent-[#1E5AE6] cursor-pointer shrink-0"
                        />
                        <div className="flex-1 min-w-0 leading-tight text-left">
                          <p className="text-slate-800 text-[11px] font-medium leading-relaxed">{n.message}</p>
                          <span className="text-slate-404 block text-[9px] pt-1">{n.time}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>



          {/* User Profile Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileDropdown(!showProfileDropdown);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2.5 bg-[#1E293B] hover:bg-[#0F172A] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              <div className="w-6.5 h-6.5 rounded-full overflow-hidden bg-white/20 border border-white/10 shrink-0">
                <img 
                  src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80"} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="hidden sm:inline">
                {currentUserType === 'personnel' ? 'Personnel' : 'Admin'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-white/70" />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden z-50 py-1">
                <div className="px-4 py-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800 block">
                    {currentUser?.name || "Elena Santos"}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block pt-0.5">
                    {currentUser?.role || "Barangay Admin"}
                  </span>
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
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-red-650 hover:bg-red-50 transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out Portal
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* 3. SPLIT BODY SECTION */}
      <div className="flex-1 flex flex-row min-h-0 relative">
        
        {/* Left Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 bg-[#1E293B] text-slate-300 flex flex-col transition-all duration-300 ease-in-out md:static md:h-[calc(100vh-4rem)]
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'w-20' : 'w-64'}
        `}>
          {/* Navigation Items */}
          <nav className="flex-1 py-6 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentRoute(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3.5 px-6 py-3.5 rounded-none text-sm font-bold tracking-tight transition-all duration-200 cursor-pointer text-left
                    ${isActive 
                      ? 'bg-white text-slate-800' 
                      : 'hover:bg-white/5 hover:text-slate-100 text-slate-400'}
                  `}
                >
                  <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-slate-800' : 'text-slate-400'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Minimizer Toggle */}
          <div className={`border-t border-slate-700/50 p-4 shrink-0 hidden md:flex items-center ${isCollapsed ? 'justify-center' : 'justify-end'}`}>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
            >
              {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>
          </div>
        </aside>

        {/* Overlay for Mobile Sidebar */}
        {mobileMenuOpen && (
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm md:hidden"
          ></div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto md:h-[calc(100vh-4rem)] bg-slate-100 p-4 md:p-5">
          <div className="w-full pb-16">
            {children}
          </div>
        </main>

      </div>

    </div>
  );
};

export default SidebarLayout;
