import React from 'react';
import { useTickets } from '../context/TicketContext';
import { Shield, MapPin, Send, HelpCircle, User, LogIn, X, Users, Layers, Activity, Lock, Mail, Phone, Eye } from 'lucide-react';
import logo from '../assets/Blinked.png';

const ResidentLayout = ({ children }) => {
  const { 
    currentRoute,
    setCurrentRoute, 
    showTermsModal, 
    setShowTermsModal, 
    showPrivacyModal, 
    setShowPrivacyModal 
  } = useTickets();

  const handleNavClick = (sectionId) => {
    if (currentRoute !== 'resident-home') {
      setCurrentRoute('resident-home');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-4 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo (Left Column, 1/3 width) */}
          <div 
            onClick={() => setCurrentRoute('resident-home')} 
            className="flex items-center gap-3 cursor-pointer group w-1/3 justify-start"
          >
            <div className="w-14 h-14 flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shrink-0">
              <img src={logo} alt="B-LINK Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-violet-600 transition-colors">B-LINK</span>
              <span className="text-xs block text-slate-500 font-medium">Barangay Citizen Portal</span>
            </div>
          </div>

          {/* Navigation (Center Column, 1/3 width, centered content) */}
          <nav className="hidden md:flex items-center justify-center gap-8 w-1/3">
            <button 
              onClick={() => {
                setCurrentRoute('resident-home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
              className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
            >
              Home
            </button>
            <button 
              onClick={() => handleNavClick('services-section')} 
              className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
            >
              Services
            </button>
            <button 
              onClick={() => handleNavClick('how-it-works-section')} 
              className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
            >
              How it Works
            </button>
            <button 
              onClick={() => handleNavClick('faq-section')} 
              className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
            >
              FAQ
            </button>
            <button 
              onClick={() => handleNavClick('contact-section')} 
              className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
            >
              Contact
            </button>
          </nav>

          {/* Empty Space (Right Column, 1/3 width, to balance the flex row) */}
          <div className="w-1/3 hidden md:block"></div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Branding Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center shrink-0">
                  <img src={logo} alt="B-LINK Logo" className="w-full h-full object-contain" />
                </div>
                <span className="font-heading font-extrabold text-lg text-white">B-LINK</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Empowering communities with seamless citizen service and modern public governance.
              </p>
            </div>

            {/* Quick Links Column */}
            <div>
              <h4 className="font-heading font-bold text-sm text-white uppercase tracking-wider mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button onClick={() => setCurrentRoute('resident-home')} className="hover:text-white transition-colors cursor-pointer">
                    Home / FAQs
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentRoute('resident-submit')} className="hover:text-white transition-colors cursor-pointer">
                    Submit New Concern
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentRoute('resident-track')} className="hover:text-white transition-colors cursor-pointer">
                    Track Existing Ticket
                  </button>
                </li>
              </ul>
            </div>

            {/* Services Column */}
            <div>
              <h4 className="font-heading font-bold text-sm text-white uppercase tracking-wider mb-4">Service Sectors</h4>
              <ul className="space-y-2 text-sm">
                <li>Infrastructure Maintenance</li>
                <li>Sanitation & Waste Clean-up</li>
                <li>Public Safety & Security</li>
                <li>Administrative Clearances</li>
              </ul>
            </div>

            {/* Support Column */}
            <div>
              <h4 className="font-heading font-bold text-sm text-white uppercase tracking-wider mb-4">Help & Support</h4>
              <p className="text-sm leading-relaxed mb-3">
                Need direct assistance? Get in touch with our office.
              </p>
              <div className="text-sm font-semibold text-white">
                Email: contact@sanvicentebarangay.gov.ph<br />
                Hotline: +63 (045) 123-4567
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <p>&copy; {new Date().getFullYear()} Barangay San Vicente, Apalit. All rights reserved. B-LINK v2.0</p>
            <div className="flex gap-6">
              <button onClick={() => setShowTermsModal(true)} className="hover:text-white transition-colors cursor-pointer">Terms of Service</button>
              <button onClick={() => setShowPrivacyModal(true)} className="hover:text-white transition-colors cursor-pointer">Privacy Policy</button>
              <a href="#" className="hover:text-white transition-colors">Accessibility Guidelines</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Terms of Service Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col text-left animate-scale-up">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-heading font-extrabold text-slate-950 text-base">Terms of Service</h3>
              <button 
                onClick={() => setShowTermsModal(false)}
                className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
              {/* Banner */}
              <div className="bg-blue-900 text-white rounded-2xl p-6 text-center space-y-1 shadow-md">
                <h4 className="font-heading font-black text-xl tracking-tight">B-LINK</h4>
                <p className="text-[10px] text-blue-200 uppercase tracking-widest font-bold">Connecting communities digitally</p>
              </div>

              {/* Section 1 */}
              <div className="space-y-1.5 text-xs leading-relaxed">
                <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-blue-600 shrink-0" />
                  1. System Purpose
                </h5>
                <p className="text-slate-500 font-medium">
                  Welcome to B-LINK, the official citizen concern reporting dashboard. This system is designed to provide transparent, efficient, and direct communication channels between residents, barangay officers, and field personnel. By signing in, submitting reports, or tracking concerns, you agree to these Terms of Use.
                </p>
              </div>

              {/* Section 2 */}
              <div className="space-y-2 text-xs leading-relaxed font-medium">
                <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-600 shrink-0" />
                  2. Resident & Officer Responsibility
                </h5>
                <div className="bg-slate-50/80 border border-slate-150 p-4 rounded-xl space-y-1">
                  <span className="font-bold text-blue-600 uppercase text-[9px] tracking-wider block">Residents</span>
                  <p className="text-slate-650 font-semibold">
                    Ensure all reports, coordinates, and attachments submitted are accurate, truthful, and representative of actual issues.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4.5 bg-slate-50 border-t border-slate-100 flex flex-col items-center gap-3">
              <button
                onClick={() => setShowTermsModal(false)}
                className="w-full py-3 rounded-xl bg-blue-900 hover:bg-blue-950 text-xs font-extrabold tracking-wide text-white transition-all shadow-md cursor-pointer text-center"
              >
                I Agree and Close
              </button>
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                Last Updated: 5 October 2025
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col text-left animate-scale-up">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-heading font-extrabold text-slate-950 text-base">Privacy Policy</h3>
              <button 
                onClick={() => setShowPrivacyModal(false)}
                className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
              {/* Banner */}
              <div className="bg-blue-900 text-white rounded-2xl p-6 text-center space-y-1 shadow-md">
                <h4 className="font-heading font-black text-xl tracking-tight">B-LINK</h4>
                <p className="text-[10px] text-blue-200 uppercase tracking-widest font-bold">Protecting your privacy and data</p>
              </div>

              {/* Section 1 */}
              <div className="space-y-1.5 text-xs leading-relaxed">
                <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600 shrink-0" />
                  1. Data Collection
                </h5>
                <p className="text-slate-500 font-medium">
                  We collect information such as name, email address, phone number, and location coordinates to verify and address reported issues.
                </p>
              </div>

              {/* Section 2 */}
              <div className="space-y-1.5 text-xs leading-relaxed">
                <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-blue-600 shrink-0" />
                  2. How We Use Data
                </h5>
                <p className="text-slate-500 font-medium">
                  Collected data is used strictly for routing concerns to the appropriate department and coordinating field assignments.
                </p>
              </div>

              {/* Section 3 */}
              <div className="space-y-1.5 text-xs leading-relaxed">
                <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-blue-600 shrink-0" />
                  3. Data Security
                </h5>
                <p className="text-slate-500 font-medium">
                  We implement industry-standard security measures to protect your personal data from unauthorized access or disclosure.
                </p>
              </div>

              {/* Section 4 */}
              <div className="space-y-1.5 text-xs leading-relaxed">
                <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-blue-600 shrink-0" />
                  4. Resident Rights
                </h5>
                <p className="text-slate-500 font-medium">
                  Residents have the right to request access, correction, or deletion of their submitted personal data by contacting the Barangay Hall.
                </p>
              </div>

              {/* Roster / Contacts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px] font-bold">
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center gap-2 text-slate-650">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="truncate">contact@sanvicentebarangay.gov.ph</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center gap-2 text-slate-650">
                  <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>+63 (045) 123-4567</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4.5 bg-slate-50 border-t border-slate-100 flex flex-col items-center gap-3">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="w-full py-3 rounded-xl bg-blue-900 hover:bg-blue-950 text-xs font-extrabold tracking-wide text-white transition-all shadow-md cursor-pointer text-center"
              >
                I Agree and Close
              </button>
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                Last Updated: 5 October 2025
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentLayout;
