import React from 'react';
import { TicketProvider, useTickets } from './context/TicketContext';
import ResidentLayout from './layouts/ResidentLayout';
import SidebarLayout from './layouts/SidebarLayout';

// Resident Pages
import LandingPage from './pages/resident/LandingPage';
import SubmitTicketWizard from './pages/resident/SubmitTicketWizard';
import TrackTicket from './pages/resident/TrackTicket';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AssignmentCenter from './pages/admin/AssignmentCenter';
import AuditLog from './pages/admin/AuditLog';
import ReportBuilder from './pages/admin/ReportBuilder';
import AdminSettings from './pages/admin/AdminSettings';
import PersonnelCenter from './pages/admin/PersonnelCenter';

// Personnel Pages
import PersonnelDashboard from './pages/personnel/PersonnelDashboard';
import PersonnelWorklist from './pages/personnel/PersonnelWorklist';
import PersonnelNotifications from './pages/personnel/PersonnelNotifications';

const AppContent = () => {
  const { currentRoute } = useTickets();

  // Router dispatcher
  if (currentRoute === 'resident-home') {
    return (
      <ResidentLayout>
        <LandingPage />
      </ResidentLayout>
    );
  }
  
  if (currentRoute === 'resident-submit') {
    return (
      <ResidentLayout>
        <LandingPage />
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm overflow-y-auto flex flex-col items-center justify-center">
          <SubmitTicketWizard />
        </div>
      </ResidentLayout>
    );
  }

  if (currentRoute === 'resident-track') {
    return (
      <ResidentLayout>
        <TrackTicket />
      </ResidentLayout>
    );
  }

  if (currentRoute === 'admin-login') {
    return <AdminLogin />;
  }

  if (currentRoute === 'admin-dashboard') {
    return (
      <SidebarLayout pageTitle="Dashboard Overview">
        <AdminDashboard />
      </SidebarLayout>
    );
  }

  if (currentRoute === 'admin-assign') {
    return (
      <SidebarLayout pageTitle="Task Assignments">
        <AssignmentCenter />
      </SidebarLayout>
    );
  }

  if (currentRoute === 'admin-reports') {
    return (
      <SidebarLayout pageTitle="Reports Generator">
        <ReportBuilder />
      </SidebarLayout>
    );
  }

  if (currentRoute === 'admin-logs') {
    return (
      <SidebarLayout pageTitle="System Audit Logs">
        <AuditLog />
      </SidebarLayout>
    );
  }

  if (currentRoute === 'admin-settings' || currentRoute === 'admin-profile' || currentRoute === 'personnel-profile') {
    return (
      <SidebarLayout pageTitle="Profile Settings">
        <AdminSettings />
      </SidebarLayout>
    );
  }

  if (currentRoute === 'admin-personnel') {
    return (
      <SidebarLayout pageTitle="Personnel Center">
        <PersonnelCenter />
      </SidebarLayout>
    );
  }

  if (currentRoute === 'personnel-dashboard') {
    return (
      <SidebarLayout pageTitle="Personnel Dashboard">
        <PersonnelDashboard />
      </SidebarLayout>
    );
  }

  if (currentRoute === 'personnel-worklist') {
    return (
      <SidebarLayout pageTitle="Assigned Tickets">
        <PersonnelWorklist />
      </SidebarLayout>
    );
  }

  if (currentRoute === 'personnel-notifications') {
    return (
      <SidebarLayout pageTitle="Notifications Center">
        <PersonnelNotifications />
      </SidebarLayout>
    );
  }

  // Fallback
  return (
    <ResidentLayout>
      <LandingPage />
    </ResidentLayout>
  );
};

function App() {
  return (
    <TicketProvider>
      <AppContent />
    </TicketProvider>
  );
}

export default App;
