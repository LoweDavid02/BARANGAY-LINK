import React, { createContext, useContext, useState, useEffect } from 'react';

const TicketContext = createContext();

const getApiBase = () => {
  let base = import.meta.env.VITE_API_BASE;
  if (base) {
    if (!base.endsWith('/api') && !base.endsWith('/api/')) {
      base = base.replace(/\/$/, '') + '/api';
    }
    return base;
  }
  const hostname = window.location.hostname;
  if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
    if (hostname.includes('barangay-link-project')) {
      return 'https://barangay-link-backend.onrender.com/api';
    }
  }
  return 'http://localhost:8000/api';
};

const API_BASE = getApiBase();

// Mock Initial Fallbacks (used as fallback or pre-login placeholders)
const initialTickets = [
  {
    id: "#TC-2026-00042",
    category: "Complaint",
    department: "Infrastructure",
    subject: "Street Light Repair",
    description: "Multiple residents reported a malfunctioning street light at the corner of Oak Drive and Pine Lane in Green Valley, Sector 4. The unit flickers intermittently throughout the night, causing poor visibility for motorists and pedestrians. Local residents have noted this as a safety concern due to the high volume of traffic during evening hours.",
    status: "In Progress",
    priority: "High",
    location: { lat: 14.9490, lng: 120.7608, address: "Main St. Corner 4th Ave" },
    submitter: { name: "Maria Santos", email: "maria.santos@example.com", phone: "+63 917 123 4567" },
    dateSubmitted: "2026-07-10T10:30:00Z",
    assignee: "Marcus Sterling",
    progress: 40,
    assetId: "SL-992-GV",
    lastInspection: "Mar 12, 2024",
    source: "Mobile App",
    evidencePhoto: null,
    history: [
      { date: "2026-07-10T10:30:00Z", action: "Ticket Submitted", user: "Maria Santos (Resident)" },
      { date: "2026-07-11T09:15:00Z", action: "Assigned to Marcus Sterling", user: "Admin Officer" },
      { date: "2026-07-11T14:00:00Z", action: "Status updated to In Progress", user: "Marcus Sterling" }
    ]
  }
];

const initialPersonnel = [
  {
    id: 1,
    name: "Marcus Sterling",
    role: "Lead Field Engineer",
    department: "Infrastructure",
    status: "Busy",
    activeTicketsCount: 2,
    email: "m.sterling@barangaylink.gov",
    phone: "+63 917 777 8888",
    rating: 4.8,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
  }
];

const initialLogs = [];

// Helper to determine department by personnel role
const getDepartmentByRole = (role) => {
  if (!role) return 'Administrative Services';
  const r = role.toLowerCase();
  if (r.includes('engineer') || r.includes('infrastructure')) return 'Infrastructure';
  if (r.includes('relations') || r.includes('admin') || r.includes('desk')) return 'Administrative Services';
  if (r.includes('safety') || r.includes('security') || r.includes('public')) return 'Public Safety';
  if (r.includes('sanitation') || r.includes('waste') || r.includes('coordinator')) return 'Sanitation';
  return 'Administrative Services';
};

// Maps backend ticket response to frontend expected structure
const mapTicket = (t) => {
  if (!t) return null;
  const rawId = String(t.id || '');
  return {
    id: rawId.startsWith('#') ? rawId : '#' + rawId,
    category: t.category,
    department: t.department,
    subject: t.subject,
    description: t.description,
    status: t.status,
    priority: t.priority,
    progress: t.progress,
    location: {
      lat: t.location ? parseFloat(t.location.latitude) : 0,
      lng: t.location ? parseFloat(t.location.longitude) : 0,
      address: t.location ? t.location.address : '',
    },
    submitter: {
      name: t.resident ? t.resident.name : '',
      email: t.resident ? t.resident.email : '',
      phone: t.resident ? t.resident.phone : '',
    },
    dateSubmitted: t.created_at,
    assignee: t.assigned_personnel && t.assigned_personnel.user ? t.assigned_personnel.user.name : (t.assignee || null),
    assetId: t.asset_id,
    lastInspection: t.last_inspection,
    source: t.source,
    evidencePhoto: t.evidence_photo,
    history: t.history ? t.history.map(h => ({
      date: h.action_date || h.created_at || new Date().toISOString(),
      action: h.action,
      user: h.performed_by || 'System',
    })) : [],
  };
};

// Maps backend personnel to frontend expected structure
const mapPersonnel = (p) => {
  if (!p) return null;
  return {
    id: p.id,
    name: p.user ? p.user.name : 'Unknown',
    role: p.detailed_role || 'Field Officer',
    department: getDepartmentByRole(p.detailed_role),
    status: p.status || 'Available',
    activeTicketsCount: p.active_tickets_count || 0,
    email: p.user ? p.user.email : '',
    phone: p.user ? p.user.phone : '',
    rating: p.rating ? parseFloat(p.rating) : 5.0,
    avatar: p.user && p.user.avatar_url ? p.user.avatar_url : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  };
};

// Maps backend audit logs to frontend expected structure
const mapAuditLog = (log) => {
  if (!log) return null;
  return {
    id: log.id.toString(),
    ticketId: log.ticket_id ? (log.ticket_id.startsWith('#') ? log.ticket_id : '#' + log.ticket_id) : '',
    action: log.action,
    details: log.details,
    timestamp: log.timestamp || log.created_at,
    user: log.user_name || 'System',
    type: log.log_type || 'info',
  };
};

// Maps backend notifications to frontend expected structure
const mapNotification = (n) => {
  if (!n) return null;
  let iconClass = 'bg-slate-50 text-slate-505 border-slate-100';
  if (n.notification_type === 'urgent') iconClass = 'bg-rose-50 text-rose-500 border-rose-100';
  else if (n.notification_type === 'assigned') iconClass = 'bg-blue-50 text-blue-600 border-blue-100';
  else if (n.notification_type === 'status') iconClass = 'bg-slate-50 text-slate-505 border-slate-100';
  else if (n.notification_type === 'maintenance') iconClass = 'bg-slate-50 text-slate-550 border-slate-100';

  // Relative time format
  const minsAgo = Math.floor((new Date() - new Date(n.created_at)) / 60000);
  let timeStr = 'Just now';
  if (minsAgo > 0) {
    if (minsAgo < 60) {
      timeStr = `${minsAgo} MINS AGO`;
    } else if (minsAgo < 1440) {
      timeStr = `${Math.floor(minsAgo / 60)} HOURS AGO`;
    } else {
      timeStr = new Date(n.created_at).toLocaleDateString();
    }
  }

  return {
    id: n.id,
    type: n.notification_type || 'info',
    title: n.title,
    message: n.message,
    read: !!n.is_read,
    time: timeStr,
    iconClass
  };
};

export const TicketProvider = ({ children }) => {
  const [tickets, setTickets] = useState(initialTickets);
  const [personnel, setPersonnel] = useState(initialPersonnel);
  const [logs, setLogs] = useState(initialLogs);
  const [notifications, setNotifications] = useState([]);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  const [currentRoute, setCurrentRoute] = useState(() => {
    if (typeof window !== 'undefined') {
      // Check for QR code scan with tracking ID parameter
      const urlParams = new URLSearchParams(window.location.search);
      const trackingIdParam = urlParams.get('id');
      if (trackingIdParam) {
        return 'resident-track';
      }
      
      if (window.location.pathname === '/login') {
        return 'admin-login';
      }
      if (window.location.pathname === '/admin') {
        return 'admin-dashboard';
      }
      if (window.location.pathname === '/personnel') {
        return 'personnel-dashboard';
      }
    }
    return 'resident-home';
  });

  const [trackingId, setTrackingId] = useState(() => {
    // Check for tracking ID from QR code scan on initial load
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('id') || '';
    }
    return '';
  });
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [currentUserType, setCurrentUserType] = useState('resident');
  
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('blink_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Get Auth Headers helper
  const getHeaders = () => {
    const token = localStorage.getItem('blink_access_token');
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // Fetch all relevant data based on user role
  const fetchData = async (userType = currentUserType) => {
    if (!localStorage.getItem('blink_access_token')) return;
    try {
      if (userType === 'admin') {
        const [ticketsRes, personnelRes, logsRes, notificationsRes] = await Promise.all([
          fetch(`${API_BASE}/admin/tickets`, { headers: getHeaders() }).then(r => r.json()),
          fetch(`${API_BASE}/admin/personnel`, { headers: getHeaders() }).then(r => r.json()),
          fetch(`${API_BASE}/admin/audit-logs`, { headers: getHeaders() }).then(r => r.json()),
          fetch(`${API_BASE}/notifications`, { headers: getHeaders() }).then(r => r.json()),
        ]);

        if (Array.isArray(ticketsRes)) setTickets(ticketsRes.map(mapTicket));
        if (Array.isArray(personnelRes)) setPersonnel(personnelRes.map(mapPersonnel));
        if (Array.isArray(logsRes)) setLogs(logsRes.map(mapAuditLog));
        if (Array.isArray(notificationsRes)) setNotifications(notificationsRes.map(mapNotification));
      } else if (userType === 'personnel') {
        const [ticketsRes, notificationsRes] = await Promise.all([
          fetch(`${API_BASE}/personnel/tickets`, { headers: getHeaders() }).then(r => r.json()),
          fetch(`${API_BASE}/notifications`, { headers: getHeaders() }).then(r => r.json()),
        ]);

        if (Array.isArray(ticketsRes)) setTickets(ticketsRes.map(mapTicket));
        if (Array.isArray(notificationsRes)) setNotifications(notificationsRes.map(mapNotification));
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  // Track ticket by contact (email/phone)
  const trackByContact = async (contact) => {
    try {
      const res = await fetch(`${API_BASE}/tickets/track-by-contact?contact=${encodeURIComponent(contact)}`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setTickets(data.map(mapTicket));
        }
      }
    } catch (err) {
      console.error("Error tracking by contact:", err);
    }
  };

  // Load profile and fetch data on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('blink_access_token');
      if (token) {
        try {
          const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
          if (res.ok) {
            const user = await res.json();
            setCurrentUser(user);
            setCurrentUserType(user.user_type);
            localStorage.setItem('blink_current_user', JSON.stringify(user));
            
            // Route synchronization based on URL path on load
            if (window.location.pathname === '/admin') {
              setCurrentRoute(user.user_type === 'admin' ? 'admin-dashboard' : 'personnel-dashboard');
            } else if (window.location.pathname === '/personnel') {
              setCurrentRoute(user.user_type === 'personnel' ? 'personnel-dashboard' : 'admin-dashboard');
            }

            fetchData(user.user_type);
          } else {
            // Token expired or invalid
            localStorage.removeItem('blink_access_token');
            localStorage.removeItem('blink_current_user');
            setCurrentUser(null);
            setCurrentUserType('resident');
            if (window.location.pathname === '/admin' || window.location.pathname === '/personnel') {
              setCurrentRoute('admin-login');
            }
          }
        } catch (err) {
          console.error("Auth initialization failed:", err);
          if (window.location.pathname === '/admin' || window.location.pathname === '/personnel') {
            setCurrentRoute('admin-login');
          }
        }
      } else {
        // No token, redirect to login if attempting to access admin/personnel path
        if (window.location.pathname === '/admin' || window.location.pathname === '/personnel') {
          setCurrentRoute('admin-login');
        }
      }
    };
    initializeAuth();
  }, []);

  // Set up route state history synchronization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (currentRoute === 'admin-login') {
        if (window.location.pathname !== '/login') {
          window.history.pushState({}, '', '/login');
        }
      } else if (currentRoute.startsWith('admin-')) {
        if (window.location.pathname !== '/admin') {
          window.history.pushState({}, '', '/admin');
        }
      } else if (currentRoute.startsWith('personnel-')) {
        if (window.location.pathname !== '/personnel') {
          window.history.pushState({}, '', '/personnel');
        }
      } else if (currentRoute.startsWith('resident-')) {
        if (window.location.pathname !== '/') {
          window.history.pushState({}, '', '/');
        }
      }
    }
  }, [currentRoute]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handlePopState = () => {
        if (window.location.pathname === '/login') {
          setCurrentRoute('admin-login');
        } else if (window.location.pathname === '/admin') {
          setCurrentRoute('admin-dashboard');
        } else if (window.location.pathname === '/personnel') {
          setCurrentRoute('personnel-dashboard');
        } else {
          setCurrentRoute('resident-home');
        }
      };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, []);

  // Real-time Echo listener
  useEffect(() => {
    import('../echo').then(({ echo }) => {
      echo.channel('tickets')
        .listen('.TicketUpdated', (e) => {
          console.log('Real-time Ticket Updated:', e.ticket);
          setTickets(prevTickets => {
            const mappedTicket = mapTicket(e.ticket);
            if (!mappedTicket) return prevTickets;
            const exists = prevTickets.find(t => t.id === mappedTicket.id);
            if (exists) {
              return prevTickets.map(t => t.id === mappedTicket.id ? mappedTicket : t);
            }
            return [mappedTicket, ...prevTickets];
          });
        });
    });

    return () => {
      import('../echo').then(({ echo }) => {
        echo.leaveChannel('tickets');
      });
    };
  }, []);

  // Fetch tracked ticket details when tracking ID is loaded
  useEffect(() => {
    const fetchTrackedTicket = async () => {
      const cleanId = trackingId.replace('#', '').trim();
      if (!cleanId) return;
      try {
        const res = await fetch(`${API_BASE}/tickets/track/${cleanId}`, { headers: getHeaders() });
        if (res.ok) {
          const ticket = await res.json();
          const mapped = mapTicket(ticket);
          setTickets(prev => {
            const filtered = prev.filter(t => t.id.toLowerCase() !== mapped.id.toLowerCase());
            return [mapped, ...filtered];
          });
        }
      } catch (err) {
        console.error("Error fetching tracked ticket details:", err);
      }
    };
    fetchTrackedTicket();
  }, [trackingId]);

  // Actions
  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Invalid credentials");
      }

      const data = await res.json();
      localStorage.setItem('blink_access_token', data.access_token);
      localStorage.setItem('blink_current_user', JSON.stringify(data.user));
      
      setCurrentUser(data.user);
      setCurrentUserType(data.user.user_type);
      
      const nextRoute = data.user.user_type === 'admin' ? 'admin-dashboard' : 'personnel-dashboard';
      setCurrentRoute(nextRoute);

      await fetchData(data.user.user_type);
      return true;
    } catch (err) {
      console.error("Login failed:", err);
      throw err;
    }
  };

  const googleLogin = async (credential, portal) => {
    try {
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ credential, portal }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Google sign-in failed");
      }

      const data = await res.json();
      localStorage.setItem('blink_access_token', data.access_token);
      localStorage.setItem('blink_current_user', JSON.stringify(data.user));
      
      setCurrentUser(data.user);
      setCurrentUserType(data.user.user_type);
      
      const nextRoute = data.user.user_type === 'admin' ? 'admin-dashboard' : 'personnel-dashboard';
      setCurrentRoute(nextRoute);

      await fetchData(data.user.user_type);
      return true;
    } catch (err) {
      console.error("Google login failed:", err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: getHeaders(),
      });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.removeItem('blink_access_token');
      localStorage.removeItem('blink_current_user');
      setCurrentUser(null);
      setCurrentUserType('resident');
      setCurrentRoute('admin-login');
      setTickets(initialTickets);
      setPersonnel(initialPersonnel);
      setLogs([]);
      setNotifications([]);
    }
  };

  const addTicket = async (ticketData) => {
    try {
      const payload = {
        category: ticketData.category,
        department: ticketData.department,
        subject: ticketData.subject,
        description: ticketData.description,
        location: {
          lat: ticketData.location.lat,
          lng: ticketData.location.lng,
          address: ticketData.location.address,
        },
        submitter: {
          name: ticketData.submitter.name,
          email: ticketData.submitter.email,
          phone: ticketData.submitter.phone,
        },
        asset_id: ticketData.assetId || null,
        last_inspection: ticketData.lastInspection || null,
        source: ticketData.source || 'Web Portal',
        evidence_photo: ticketData.evidencePhoto || null,
      };

      const res = await fetch(`${API_BASE}/tickets`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to submit ticket");
      }

      const data = await res.json();
      fetchData();
      return data.ticket_id;
    } catch (err) {
      console.error("Error submitting ticket:", err);
      throw err;
    }
  };

  const assignPersonnel = async (ticketId, personnelName) => {
    try {
      const cleanTicketId = ticketId.replace('#', '').trim();
      const selectedPers = personnel.find(p => p.name === personnelName);
      const personnelId = selectedPers ? selectedPers.id : null;

      const res = await fetch(`${API_BASE}/admin/tickets/${cleanTicketId}/assign`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ personnel_id: personnelId }),
      });

      if (res.ok) {
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error assigning personnel:", err);
      return false;
    }
  };

  const addPersonnel = async (personnelData) => {
    try {
      const res = await fetch(`${API_BASE}/admin/personnel`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(personnelData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add personnel");
      }

      fetchData();
      return true;
    } catch (err) {
      console.error("Error adding personnel:", err);
      throw err;
    }
  };

  const removePersonnel = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/admin/personnel/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      if (res.ok) {
        fetchData();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error removing personnel:", err);
      return false;
    }
  };

  const updateTicketStatus = async (ticketId, status, user, comment = '', priority = null, evidencePhoto = null) => {
    try {
      const cleanTicketId = ticketId.replace('#', '').trim();
      
      const payload = {};
      if (status) payload.status = status;
      if (priority) payload.priority = priority;
      if (comment) payload.comment = comment;
      if (evidencePhoto) payload.evidence_photo = evidencePhoto;

      if (status === 'Resolved' || status === 'Completed') {
        payload.progress = 100;
      }

      let url = `${API_BASE}/admin/tickets/${cleanTicketId}/status`;
      if (status === 'Completed' && user === 'Resident Submitter') {
        url = `${API_BASE}/tickets/${cleanTicketId}/verify`;
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        fetchData();
        // Force refresh the tracked ticket details if currently tracked
        if (trackingId.replace('#', '').trim() === cleanTicketId) {
          const trackRes = await fetch(`${API_BASE}/tickets/track/${cleanTicketId}`, { headers: getHeaders() });
          if (trackRes.ok) {
            const ticket = await trackRes.json();
            const mapped = mapTicket(ticket);
            setTickets(prev => {
              const filtered = prev.filter(t => t.id.toLowerCase() !== mapped.id.toLowerCase());
              return [mapped, ...filtered];
            });
          }
        }
      }
    } catch (err) {
      console.error("Error updating ticket status:", err);
    }
  };

  const updateTicketProgress = async (ticketId, progress, user) => {
    try {
      const cleanTicketId = ticketId.replace('#', '').trim();
      const res = await fetch(`${API_BASE}/admin/tickets/${cleanTicketId}/status`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ progress }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Error updating ticket progress:", err);
    }
  };

  const deleteTicket = async (ticketId) => {
    try {
      const cleanTicketId = ticketId.replace('#', '').trim();
      const res = await fetch(`${API_BASE}/admin/tickets/${cleanTicketId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Error deleting ticket:", err);
    }
  };

  const readAllNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE}/notifications/bulk-read`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({}),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  const bulkReadNotifications = async (ids) => {
    try {
      const res = await fetch(`${API_BASE}/notifications/bulk-read`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ ids }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Error marking notifications as read:", err);
    }
  };

  const bulkUnreadNotifications = async (ids) => {
    try {
      const res = await fetch(`${API_BASE}/notifications/bulk-unread`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ ids }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Error marking notifications as unread:", err);
    }
  };

  const dismissNotification = async (notificationId) => {
    try {
      const res = await fetch(`${API_BASE}/notifications/${notificationId}/dismiss`, {
        method: 'POST',
        headers: getHeaders(),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Error dismissing notification:", err);
    }
  };

  return (
    <TicketContext.Provider value={{
      tickets,
      personnel,
      logs,
      currentRoute,
      setCurrentRoute,
      trackingId,
      setTrackingId,
      currentUserType,
      setCurrentUserType,
      currentUser,
      setCurrentUser,
      showTermsModal,
      setShowTermsModal,
      showPrivacyModal,
      setShowPrivacyModal,
      notifications,
      setNotifications,
      readAllNotifications,
      bulkReadNotifications,
      bulkUnreadNotifications,
      dismissNotification,
      addTicket,
      assignPersonnel,
      addPersonnel,
      removePersonnel,
      updateTicketStatus,
      updateTicketProgress,
      deleteTicket,
      login,
      googleLogin,
      logout,
      trackByContact,
      globalSearchQuery,
      setGlobalSearchQuery,
      refreshData: fetchData
    }}>
      {children}
    </TicketContext.Provider>
  );
};

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
};
