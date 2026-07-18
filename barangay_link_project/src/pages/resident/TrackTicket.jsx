import React, { useState, useEffect, useRef } from 'react';
import { useTickets } from '../../context/TicketContext';
import jsQR from 'jsqr';
import { 
  Search, 
  MapPin, 
  Calendar, 
  ShieldAlert, 
  Activity, 
  CheckCircle, 
  ChevronDown,
  ChevronUp,
  Clock,
  Shield,
  Zap,
  Users,
  Target,
  Lock,
  Camera,
  Plus,
  HelpCircle
} from 'lucide-react';

const TrackTicket = () => {
  const { tickets, trackingId, setTrackingId, updateTicketStatus, trackByContact } = useTickets();
  const [searchVal, setSearchVal] = useState(trackingId || '');
  const [errorMsg, setErrorMsg] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [scanningQr, setScanningQr] = useState(false);
  const [qrProgress, setQrProgress] = useState(0);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };
  const [searchMode, setSearchMode] = useState('id'); // 'id' | 'contact'
  const [contactSearched, setContactSearched] = useState(false);
  const fileInputRef = useRef(null);

  // Handle QR code scan - automatically set tracking ID from URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const idFromUrl = urlParams.get('id');
    if (idFromUrl) {
      setTrackingId(idFromUrl);
      setSearchVal(idFromUrl);
      setShowDetails(true); // Automatically show details when coming from QR code
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [setTrackingId]);

  useEffect(() => {
    if (trackingId) {
      setSearchVal(trackingId);
    }
  }, [trackingId]);

  const currentTicket = tickets.find(
    t => trackingId && t.id.replace(/^#/, '').toLowerCase() === trackingId.replace(/^#/, '').toLowerCase().trim()
  );

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchVal.trim()) {
      setErrorMsg(searchMode === 'id' ? 'Please enter a ticket reference number.' : 'Please enter your email or phone number.');
      return;
    }
    setErrorMsg('');
    if (searchMode === 'id') {
      setTrackingId(searchVal.trim());
    } else {
      setContactSearched(true);
      if (trackByContact) {
        trackByContact(searchVal.trim());
      }
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-500 text-white';
      case 'High': return 'bg-red-500 text-white';
      case 'Medium': return 'bg-amber-500 text-white';
      default: return 'bg-slate-400 text-white';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return 'text-emerald-600';
      case 'In Progress': return 'text-blue-600';
      default: return 'text-amber-600';
    }
  };

  // Status timeline steps
  const getTimelineSteps = (ticket) => {
    const steps = [
      { label: 'CREATED', icon: CheckCircle, done: true, date: new Date(ticket.dateSubmitted).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' + new Date(ticket.dateSubmitted).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true }) },
      { label: 'ASSIGNED', icon: Users, done: !!ticket.assignee, date: ticket.assignee ? 'Assigned' : 'Pending' },
      { label: 'IN PROGRESS', icon: Zap, done: ticket.status === 'In Progress' || ticket.status === 'Resolved' || ticket.status === 'Completed', date: ticket.status === 'In Progress' || ticket.status === 'Resolved' || ticket.status === 'Completed' ? 'Active' : 'Pending' },
      { label: 'RESOLVED / COMPLETED', icon: CheckCircle, done: ticket.status === 'Resolved' || ticket.status === 'Completed', date: ticket.status === 'Resolved' || ticket.status === 'Completed' ? (ticket.status === 'Completed' ? 'Completed' : 'Resolved') : 'Pending' },
    ];
    return steps;
  };

  // Build Google Maps static image URL
  const getMapUrl = (ticket) => {
    const addr = ticket.location?.address || '';
    return `https://maps.google.com/maps?q=${encodeURIComponent(addr + ', San Vicente, Apalit, Pampanga')}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  };

  // Standard 2D map view using Google Maps Embed API
  const getMapEmbed = (ticket) => {
    const addr = ticket.location?.address || '';
    return `https://maps.google.com/maps?q=${encodeURIComponent(addr + ', San Vicente, Apalit, Pampanga')}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  };

  return (
    <div className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 flex flex-col gap-8 relative">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-55 bg-[#0B3A9B] text-white px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in">
          <CheckCircle className="w-5 h-5 shrink-0 text-white" />
          <span className="text-sm font-extrabold tracking-wide text-left">{toastMessage}</span>
        </div>
      )}
      
      {/* Title Section */}
      <div className="text-center space-y-3">
        <h2 className="font-heading font-extrabold text-2xl md:text-3xl text-slate-900 tracking-tight">
          Track your Ticket
        </h2>
        <p className="text-sm text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
          Enter your reference code below to view the status and details of your submitted ticket.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-xl mx-auto w-full">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center bg-white border border-slate-200 rounded-lg p-1.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all shadow-sm">
          <input 
            type="text" 
            value={searchVal}
            onChange={(e) => {
              setSearchVal(e.target.value);
              if (errorMsg) setErrorMsg('');
              if (searchMode === 'contact') setContactSearched(false);
            }}
            placeholder={searchMode === 'id' ? "Search by Ticket ID or Subject..." : "example@email.com"} 
            className="w-full bg-transparent border-0 outline-none text-slate-900 placeholder-slate-400 text-sm font-medium py-2 pl-4"
          />
          <button 
            type="submit"
            className="px-6 py-2 rounded-md bg-[#1E5AE6] hover:bg-[#1650D0] active:scale-98 text-xs font-bold text-white transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Search className="w-3.5 h-3.5" />
            Track Now
          </button>
        </form>
        {errorMsg && <p className="text-red-500 text-xs font-semibold mt-2 text-center">{errorMsg}</p>}
      </div>

      {/* TRACKING RESULTS CONTENT */}
      {currentTicket ? (
        <div className="space-y-6">

          {/* Main Ticket Detail Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-5">
            
            {/* Top row: Status badge + content + map */}
            <div className="flex flex-col md:flex-row gap-6">
              
              {/* Left: Ticket details */}
              <div className="flex-1 space-y-4 text-left">
                {/* Status pill */}
                {currentTicket.status !== 'Submitted' ? (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-extrabold uppercase tracking-wider ${
                    currentTicket.status === 'Completed' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                    currentTicket.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                    currentTicket.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                    'bg-slate-50 text-slate-505 border-slate-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      currentTicket.status === 'Completed' ? 'bg-teal-650' :
                      currentTicket.status === 'Resolved' ? 'bg-emerald-500' :
                      currentTicket.status === 'In Progress' ? 'bg-blue-500' :
                      'bg-amber-500'
                    }`}></span>
                    {currentTicket.status}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-extrabold uppercase tracking-wider bg-slate-50 text-slate-500 border-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-350"></span>
                    Pending Review
                  </span>
                )}

                {/* Reference Code */}
                <div className="space-y-1">
                  <span className="text-xs font-extrabold text-[#1E5AE6] uppercase tracking-wider block">Reference Code</span>
                  <h3 className="font-heading font-black text-2xl md:text-3xl text-slate-900 tracking-tight">
                    {currentTicket.id}
                  </h3>
                </div>

                {/* Subject / Description */}
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  {currentTicket.subject}
                </p>

                {/* Category & Priority badges */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1E5AE6] text-white text-[10px] font-extrabold">
                    <Target className="w-3 h-3" />
                    {currentTicket.category.replace(/ /g, '_')}
                  </span>
                  {currentTicket.status !== 'Submitted' && currentTicket.priority && (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold ${getPriorityStyle(currentTicket.priority)}`}>
                      <ShieldAlert className="w-3 h-3" />
                      {currentTicket.priority} Priority
                    </span>
                  )}
                </div>

                {/* Additional description */}
                <p className="text-xs text-slate-500 font-medium leading-relaxed pt-1">
                  {currentTicket.description}
                </p>
              </div>

              {/* Right: Map preview */}
              <div className="w-full md:w-64 h-48 md:h-auto rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                <iframe
                  src={getMapEmbed(currentTicket)}
                  className="w-full h-full min-h-[180px]"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  title="Ticket Location"
                ></iframe>
              </div>
            </div>

            {/* Resident Verification Block */}
            {currentTicket.status === 'Resolved' && (
              <div className="bg-emerald-50/50 border border-emerald-150 rounded-xl p-5 space-y-4 text-left animate-fade-in">
                <div className="space-y-1">
                  <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wide block">Resolution Notice</span>
                  <p className="text-xs text-emerald-700 font-semibold leading-relaxed">
                    This ticket has been marked as <strong>Resolved</strong> by the assigned personnel. Please review the uploaded photo evidence below. If the concern or complaint is fully fixed and resolved, please click <strong>Verify</strong> to complete the ticket.
                  </p>
                </div>

                {/* Show Evidence Photo */}
                {currentTicket.evidencePhoto && (
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-450 font-extrabold uppercase tracking-wider block">Uploaded Evidence:</span>
                    <div className="rounded-xl overflow-hidden border border-emerald-100 max-w-xs bg-white shadow-sm">
                      <img src={currentTicket.evidencePhoto} alt="Resolution Evidence" className="w-full h-auto max-h-40 object-cover" />
                    </div>
                  </div>
                )}

                <div className="pt-1 flex justify-start">
                  <button
                    type="button"
                    onClick={() => {
                      updateTicketStatus(currentTicket.id, 'Completed', 'Resident Submitter', 'Resident verified that the concern is fully fixed and resolved.');
                      triggerToast("Thank you! The ticket is now completed.");
                    }}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Verify Resolution
                  </button>
                </div>
              </div>
            )}

            {/* Updates section */}
            <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-left">
                <Lock className="w-4 h-4 text-[#1E5AE6]" />
                <div>
                  <span className="text-xs font-extrabold text-slate-900 block">Updates</span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {currentTicket.history && currentTicket.history.length > 0 
                      ? `${currentTicket.history[currentTicket.history.length - 1].action} by ${currentTicket.history[currentTicket.history.length - 1].user.split(' (')[0]}`
                      : 'Ticket Submitted by Guest.'}
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-semibold shrink-0">
                {new Date(currentTicket.dateSubmitted).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })} at {new Date(currentTicket.dateSubmitted).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true })}
              </span>
            </div>
          </div>

          {/* Secure Data Notice */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-semibold">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>Your data is protected and encrypted</span>
          </div>

          {/* Chevron separator / Toggle Button */}
          <div className="flex justify-center">
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {showDetails ? (
                <ChevronUp className="w-8 h-8 text-slate-300" />
              ) : (
                <ChevronDown className="w-8 h-8 text-slate-300 animate-bounce" />
              )}
            </button>
          </div>

          {/* Collapsible Details Section */}
          {showDetails && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
              {/* Status Timeline Steps */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="flex items-start justify-between gap-2 md:gap-4">
                  {getTimelineSteps(currentTicket).map((step, idx) => {
                    const Icon = step.icon;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center text-center gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          step.done 
                            ? 'bg-[#1E5AE6] text-white' 
                            : 'bg-slate-100 text-slate-400'
                        }`}>
                          <Icon className="w-4.5 h-4.5" />
                        </div>
                        <div className="space-y-0.5">
                          <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${step.done ? 'text-slate-900' : 'text-slate-400'}`}>
                            {step.label}
                          </span>
                          <span className="text-[9px] text-slate-400 font-semibold block leading-tight">
                            {step.date}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Info Cards Row: Location, Date Submitted, Completion % */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Location Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 text-left shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Target className="w-3.5 h-3.5 text-[#1E5AE6]" />
                    </div>
                    <span className="text-xs font-extrabold text-[#1E5AE6]">Location</span>
                  </div>
                  <p className="text-xs text-slate-700 font-bold leading-relaxed">
                    {currentTicket.location.address || 'No address provided'}
                  </p>
                </div>

                {/* Date Submitted Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 text-left shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Calendar className="w-3.5 h-3.5 text-[#1E5AE6]" />
                    </div>
                    <span className="text-xs font-extrabold text-[#1E5AE6]">Date Submitted</span>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold">
                    {new Date(currentTicket.dateSubmitted).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })} at {new Date(currentTicket.dateSubmitted).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true })}
                  </p>
                </div>

                {/* Completion Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 text-left shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                      <CheckCircle className="w-3.5 h-3.5 text-[#1E5AE6]" />
                    </div>
                    <span className="text-xs font-extrabold text-[#1E5AE6]">Completion %</span>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold">
                    Currently at {currentTicket.progress}% Completion.
                  </p>
                </div>

              </div>
            </div>
          )}

        </div>
      ) : trackingId ? (
        /* Ticket not found State */
        <div className="bg-white border border-slate-200 rounded-2xl p-12 shadow-sm text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto shadow">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading font-extrabold text-lg text-slate-900">Reference Number Not Found</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">We couldn't locate any ticket with reference code <span className="font-bold text-slate-700">"{trackingId}"</span>. Make sure the ID matches your receipt and try again.</p>
          </div>
        </div>
      ) : (
        /* Empty state (No search yet) - Match user's screenshot exactly */
        <div className="flex flex-col items-center justify-center space-y-12 pb-8 w-full">
          
          <div className="w-full max-w-3xl mx-auto space-y-6">
            {searchMode === 'id' ? (
              <>
                {/* Upload QR Box */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-[1.5px] border-dashed border-[#1E5AE6] rounded-xl p-12 bg-white flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/png, image/jpeg, image/heic" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const file = e.target.files[0];
                        setScanningQr(true);
                        setQrProgress(0);

                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const img = new Image();
                          img.onload = () => {
                            let progress = 0;
                            const interval = setInterval(() => {
                              progress += 20;
                              setQrProgress(progress);
                              if (progress >= 100) {
                                clearInterval(interval);
                                const canvas = document.createElement("canvas");
                                canvas.width = img.width;
                                canvas.height = img.height;
                                const ctx = canvas.getContext("2d");
                                ctx.drawImage(img, 0, 0, img.width, img.height);
                                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                                const code = jsQR(imageData.data, imageData.width, imageData.height);
                                
                                setTimeout(() => {
                                  setScanningQr(false);
                                  if (code && code.data) {
                                    setSearchVal(code.data);
                                    setTrackingId(code.data);
                                  } else {
                                    triggerToast("No QR code found in the image. Please try again.");
                                  }
                                }, 500);
                              }
                            }, 100);
                          };
                          img.src = event.target.result;
                        };
                        reader.readAsDataURL(file);
                      }
                      e.target.value = '';
                    }} 
                  />
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center relative mb-4">
                    <Camera className="w-6 h-6 text-[#1E5AE6]" />
                    <div className="absolute -top-1 -right-1 bg-white rounded-full">
                      <Plus className="w-4 h-4 text-[#1E5AE6]" />
                    </div>
                  </div>
                  <h3 className="font-bold text-[#1E5AE6] text-sm mb-1">Click to upload QR Code</h3>
                  <p className="text-xs text-slate-400 font-medium">JPG, PNG or HEIC (max. 10MB)</p>
                </div>

                {/* Email Track link */}
                <p className="text-xs text-slate-600 font-medium text-center mt-6">
                  Would you like to <button onClick={() => setSearchMode('contact')} className="text-[#1E5AE6] hover:underline cursor-pointer">track your tickets by<br/>Email Address</button> instead?
                </p>
              </>
            ) : contactSearched ? (
              /* Contact Mode - Your Tickets List */
              <div className="w-full text-left space-y-4">
                <h3 className="text-lg font-medium text-slate-600 mb-4">Your Tickets</h3>
                <div className="space-y-4">
                  {(() => {
                    const userTickets = tickets.filter(ticket => {
                      const query = searchVal.trim().toLowerCase();
                      const emailMatch = ticket.submitter?.email?.toLowerCase() === query;
                      const phoneMatch = ticket.submitter?.phone?.trim() === query;
                      return emailMatch || phoneMatch;
                    });
                    
                    if (userTickets.length === 0) {
                      return (
                        <div className="p-8 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-400 font-semibold">
                          No tickets found matching "{searchVal}". Please verify your email or phone number.
                        </div>
                      );
                    }
                    
                    return userTickets.map(ticket => (
                      <div 
                        key={ticket.id} 
                        onClick={() => setTrackingId(ticket.id)} 
                        className="p-6 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-blue-400 transition-colors shadow-sm"
                      >
                        <h4 className="font-bold text-slate-900 mb-2">{ticket.id}</h4>
                        <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">{ticket.subject}</p>
                      </div>
                    ));
                  })()}
                </div>
                {/* Optional toggle back */}
                <p className="text-xs text-slate-600 font-medium text-center pt-6">
                  <button onClick={() => { setSearchMode('id'); setContactSearched(false); setSearchVal(''); }} className="text-[#1E5AE6] hover:underline cursor-pointer">Track by Ticket ID instead</button>
                </p>
              </div>
            ) : (
              /* Contact Mode - Prompt to enter email/phone */
              <div className="w-full text-center space-y-4 py-8">
                <div className="w-16 h-16 rounded-full bg-blue-50 text-[#1E5AE6] flex items-center justify-center mx-auto shadow-sm">
                  <Search className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-heading font-extrabold text-xl text-slate-900">Find Your Tickets</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">Enter your email address or cellphone number above to view all tickets associated with your account securely.</p>
                </div>
                <p className="text-xs text-slate-600 font-medium text-center pt-6">
                  <button onClick={() => { setSearchMode('id'); setContactSearched(false); setSearchVal(''); }} className="text-[#1E5AE6] hover:underline cursor-pointer">Track by Ticket ID instead</button>
                </p>
              </div>
            )}
          </div>

          {/* Footer Area */}
          <div className="w-full bg-[#f1f5f9] rounded-t-3xl rounded-b-xl border border-slate-200 mt-12 p-10 flex flex-col items-center text-center max-w-5xl mx-auto">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-[#1E5AE6] mb-6 shadow-sm">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-extrabold text-lg text-slate-900 mb-2">Need immediate assistance?</h3>
            <p className="text-xs text-slate-500 font-medium max-w-sm leading-relaxed mb-6">
              If you have an emergency or need help with the portal, our support team is available 24/7.
            </p>
            <div className="flex items-center gap-3">
              <button className="px-6 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors shadow-sm">
                View FAQs
              </button>
              <button className="px-6 py-2.5 rounded-lg bg-[#4481eb] hover:bg-[#346ac7] text-white font-bold text-xs transition-colors shadow-sm">
                Contact Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Scanning Modal */}
      {scanningQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" onClick={() => setScanningQr(false)}></div>
          <div className="relative bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-10 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-heading font-extrabold text-xl text-slate-900 mb-3">Scanning your QR Code...</h3>
            <p className="text-sm text-slate-600 font-medium mb-8 leading-relaxed max-w-[250px]">
              Please wait while we scan and verify your uploaded QR Code.
            </p>

            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-10">
              <div 
                className="h-full bg-[#173b75] transition-all duration-100 ease-linear rounded-full"
                style={{ width: `${qrProgress}%` }}
              ></div>
            </div>

            <button 
              onClick={() => setScanningQr(false)}
              className="px-8 py-3 rounded-lg border border-slate-200 text-slate-700 bg-white font-bold text-sm hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackTicket;
