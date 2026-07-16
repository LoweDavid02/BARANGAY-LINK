import React, { useState } from 'react';
import { useTickets } from '../../context/TicketContext';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  Wrench, 
  Trash2, 
  ShieldAlert, 
  FileText, 
  HelpCircle,
  Shield,
  Layers,
  Clock,
  Eye,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  X,
  Lock
} from 'lucide-react';

const LandingPage = () => {
  const { 
    setCurrentRoute, 
    setTrackingId, 
    setShowTermsModal, 
    setShowPrivacyModal 
  } = useTickets();
  const [activeFaq, setActiveFaq] = useState(null);
  
  // Consent Modal States
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [pendingRouteParams, setPendingRouteParams] = useState(null);

  // FAQ Data matching the design
  const faqData = [
    {
      id: 0,
      question: "How do I submit a new concern?",
      answer: "Click the 'Submit a Concern' button in the hero section or select one of the Quick Access Services. You will be guided through a 5-step wizard to specify the category, department, coordinates, description, and attachments."
    },
    {
      id: 1,
      question: "Do I need to pay any fees to use B-LINK?",
      answer: "No, submitting and tracking concerns or public safety reports on B-LINK is completely free for all residents of Barangay San Vicente."
    },
    {
      id: 2,
      question: "How can I track my request's progress?",
      answer: "After submission, copy your unique Ticket Reference ID. Enter this ID in the track bar on the homepage or click 'Track My Request' to view the live timeline, assignee updates, and completion percentage."
    },
    {
      id: 3,
      question: "Who will handle my reported concerns?",
      answer: "Your tickets are dynamically routed to specialized departments (Infrastructure, Sanitation, Public Safety, Admin). The administrator assigns them to skilled field personnel (e.g. Lead Field Engineers)."
    },
    {
      id: 4,
      question: "What happens once my concern is resolved?",
      answer: "The assigned officer will update the status to 'Resolved' and provide action details. You will be able to review their final notes on your tracking page and verify the resolution."
    },
    {
      id: 5,
      question: "Can I delete or edit a ticket after submission?",
      answer: "To preserve audit trail integrity, tickets cannot be modified or deleted by guests. If you need to supply additional details, contact the barangay hall directly with your Reference ID."
    }
  ];

  const handleStartSubmit = (category = 'Complaint', department = 'Infrastructure') => {
    setPendingRouteParams({ category, department });
    setConsentChecked(false);
    setShowConsentModal(true);
  };

  const handleConsentConfirm = () => {
    if (!consentChecked) return;
    
    // Save selections
    if (pendingRouteParams) {
      localStorage.setItem('blink_preselected_category', pendingRouteParams.category);
      localStorage.setItem('blink_preselected_department', pendingRouteParams.department);
    }
    
    setShowConsentModal(false);
    setCurrentRoute('resident-submit');
  };

  return (
    <div className="flex-1 flex flex-col text-slate-800 bg-white relative">
      
      {/* 1. HERO SECTION */}
      <section className="relative bg-white px-6 py-20 md:py-28 text-left border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          
          {/* Left Text content */}
          <div className="max-w-4xl space-y-6">
            <h1 className="font-heading font-extrabold text-4xl md:text-6xl tracking-tight text-slate-900 leading-tight">
              Submit, Track, and Resolve<br className="hidden md:inline" /> 
              Barangay Concerns <span className="text-blue-600">Efficiently</span>
            </h1>
            
            <p className="text-base md:text-lg text-slate-500 max-w-2xl leading-relaxed font-medium">
              This system is designed to bridge the gap between residents and local government systems that enable residents to submit concerns, track status, and receive support in a transparent way. Choose a service sector below to start.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={() => handleStartSubmit('Complaint', 'Infrastructure')}
                className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-sm font-extrabold tracking-wide text-white transition-all shadow-md shadow-blue-600/10 cursor-pointer"
              >
                Submit a Concern
              </button>
              <button
                onClick={() => setCurrentRoute('resident-track')}
                className="px-8 py-3.5 rounded-xl border-2 border-blue-600 text-sm font-extrabold tracking-wide text-blue-600 hover:bg-blue-50/50 active:scale-98 transition-all cursor-pointer"
              >
                Track My Request
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 2. SIMPLE 3-STEP PROCESS SECTION */}
      <section className="bg-blue-50/40 border-b border-slate-100 px-6 py-16 text-center" id="how-it-works-section">
        <div className="max-w-7xl mx-auto space-y-12">
          <h2 className="font-heading font-extrabold text-2xl md:text-3xl text-slate-900 tracking-tight">Simple 3-Step Process</h2>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Stepper connecting line */}
            <div className="hidden md:block absolute top-6 left-1/6 right-1/6 h-0.5 bg-blue-100 z-0"></div>

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-900 text-white flex items-center justify-center text-sm font-bold shadow-md shadow-blue-900/10">
                1
              </div>
              <div className="space-y-1 max-w-xs">
                <h4 className="font-bold text-slate-900 text-base">Submit a Concern</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">Choose the sector and details of your concern and get a reference ID.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-900 text-white flex items-center justify-center text-sm font-bold shadow-md shadow-blue-900/10">
                2
              </div>
              <div className="space-y-1 max-w-xs">
                <h4 className="font-bold text-slate-900 text-base">Track Progress</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">Enter your reference number in the track page to watch your request move in real-time.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-900 text-white flex items-center justify-center text-sm font-bold shadow-md shadow-blue-900/10">
                3
              </div>
              <div className="space-y-1 max-w-xs">
                <h4 className="font-bold text-slate-900 text-base">Verify Resolution</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">Review the final action completed by our staff and confirm details.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. SERVICE SECTORS */}
      <section className="max-w-7xl mx-auto px-6 py-20 w-full space-y-12" id="services-section">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-2 text-left">
            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest block">Service Sectors</span>
            <h2 className="font-heading font-extrabold text-3xl text-slate-900 tracking-tight">What can we help you with today?</h2>
          </div>
          <button 
            onClick={() => handleStartSubmit('Service Request', 'Infrastructure')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer shrink-0"
          >
            See All Services
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          
          {/* Card 1: Infrastructure */}
          <div 
            onClick={() => handleStartSubmit('Service Request', 'Infrastructure')}
            className="p-6 bg-white border border-slate-200 rounded-2xl hover:border-blue-400 hover:shadow-md transition-all cursor-pointer space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Wrench className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">Infrastructure</h4>
                <h5 className="font-extrabold text-blue-600 text-xs uppercase tracking-wider">Roads & Lights</h5>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">Report potholes, damaged light posts, drainage blockages, or street obstructions.</p>
              </div>
            </div>
          </div>

          {/* Card 2: Sanitation */}
          <div 
            onClick={() => handleStartSubmit('Service Request', 'Sanitation')}
            className="p-6 bg-white border border-slate-200 rounded-2xl hover:border-blue-400 hover:shadow-md transition-all cursor-pointer space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">Sanitation</h4>
                <h5 className="font-extrabold text-blue-600 text-xs uppercase tracking-wider">Waste & Cleanup</h5>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">Send reports about uncollected trash, illegal dumpings, or request cleanup operations.</p>
              </div>
            </div>
          </div>

          {/* Card 3: Public Safety */}
          <div 
            onClick={() => handleStartSubmit('Service Request', 'Public Safety')}
            className="p-6 bg-white border border-slate-200 rounded-2xl hover:border-blue-400 hover:shadow-md transition-all cursor-pointer space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">Public Safety</h4>
                <h5 className="font-extrabold text-blue-600 text-xs uppercase tracking-wider">Security & Hazards</h5>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">Report standard peace and order concerns, emergency street hazards, or security issues.</p>
              </div>
            </div>
          </div>

          {/* Card 4: Administrative */}
          <div 
            onClick={() => handleStartSubmit('Service Request', 'Administrative Services')}
            className="p-6 bg-white border border-slate-200 rounded-2xl hover:border-blue-400 hover:shadow-md transition-all cursor-pointer space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <FileText className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">Administrative</h4>
                <h5 className="font-extrabold text-blue-600 text-xs uppercase tracking-wider">Permit & Certs</h5>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">Request administrative documents, clearances, residency permits, or certificates.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. QUICK ACCESS SERVICES */}
      <section className="bg-slate-50/50 border-y border-slate-100 px-6 py-20 text-center">
        <div className="max-w-7xl mx-auto space-y-12">
          <h2 className="font-heading font-extrabold text-2xl md:text-3xl text-slate-900 tracking-tight">Quick Access Services</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            
            {/* Box 1: Submit Complaint */}
            <div 
              onClick={() => handleStartSubmit('Complaint', 'Public Safety')}
              className="p-8 bg-white border border-slate-200/80 rounded-3xl hover:border-blue-400 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer space-y-4 text-center flex flex-col items-center justify-center h-52"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">Submit Complaint</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">File an official complaint to Barangay mediators.</p>
              </div>
            </div>

            {/* Box 2: Request Service */}
            <div 
              onClick={() => handleStartSubmit('Service Request', 'Sanitation')}
              className="p-8 bg-white border border-slate-200/80 rounded-3xl hover:border-blue-400 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer space-y-4 text-center flex flex-col items-center justify-center h-52"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Wrench className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">Request Service</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">Ask for active assistance from maintenance crews.</p>
              </div>
            </div>

            {/* Box 3: General Concern */}
            <div 
              onClick={() => handleStartSubmit('General Concern', 'Administrative Services')}
              className="p-8 bg-white border border-slate-200/80 rounded-3xl hover:border-blue-400 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer space-y-4 text-center flex flex-col items-center justify-center h-52"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">General Concern</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">Provide general suggestions or ask admin questions.</p>
              </div>
            </div>

            {/* Box 4: Track My Ticket */}
            <div 
              onClick={() => setCurrentRoute('resident-track')}
              className="p-8 bg-white border border-slate-200/80 rounded-3xl hover:border-blue-400 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer space-y-4 text-center flex flex-col items-center justify-center h-52"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Search className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">Track My Ticket</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">Find status updates using your Reference ID.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-6 py-20 w-full space-y-8 text-center" id="faq-section">
        <div className="space-y-2">
          <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest block">FAQ</span>
          <h2 className="font-heading font-extrabold text-3xl text-slate-900 tracking-tight">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-500 font-medium">Find answers to the most common questions regarding B-LINK.</p>
        </div>

        <div className="space-y-4">
          {faqData.map((faq) => {
            const isOpen = activeFaq === faq.id;
            return (
              <div 
                key={faq.id} 
                className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden text-left"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : faq.id)}
                  className="w-full flex items-center justify-between px-6 py-4.5 text-left font-bold text-slate-800 hover:text-blue-600 cursor-pointer transition-colors"
                >
                  <span className="text-xs md:text-sm font-semibold">{faq.question}</span>
                  {isOpen ? <ChevronUp className="w-4.5 h-4.5 shrink-0 text-slate-400" /> : <ChevronDown className="w-4.5 h-4.5 shrink-0 text-slate-400" />}
                </button>
                {isOpen && (
                  <div className="px-6 pb-4.5 pt-1.5 border-t border-slate-100 text-xs text-slate-500 leading-relaxed font-medium">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. ABOUT SECTION */}
      <section className="bg-slate-900 text-slate-400 px-6 py-20" id="about-section">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <h2 className="font-heading font-extrabold text-3xl text-white tracking-tight leading-tight">About B-LINKed</h2>
            <p className="text-sm text-slate-400 leading-relaxed font-medium max-w-xl">
              B-LINK was designed to bridge the gap between residents and local government, ensuring every voice is heard and every concern is addressed systematically.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              
              {/* Feature 1 */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-blue-500 flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">Centralized Reporting</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">One portal for all your concerns.</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-blue-500 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">Real-Time Tracking</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">Watch updates move in real-time.</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-blue-500 flex items-center justify-center shrink-0">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">Transparency</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">Open logs for all actions completed.</p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-blue-500 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">Efficient Service Delivery</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">Clear paths for staff assignments.</p>
                </div>
              </div>

            </div>
          </div>

          {/* Right Image */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md h-64 md:h-80 rounded-3xl overflow-hidden border-4 border-blue-900/30 shadow-2xl relative">
              <img 
                src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600" 
                alt="Watch Team" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent"></div>
            </div>
          </div>

        </div>
      </section>

      {/* 7. GET IN TOUCH SECTION */}
      <section className="bg-white px-6 py-20 border-b border-slate-100" id="contact-section">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left contact info */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="space-y-2">
              <h2 className="font-heading font-extrabold text-3xl text-slate-900 tracking-tight">Get in Touch</h2>
              <p className="text-xs text-slate-400 font-semibold">Have questions or feedback? Reach out to our administrative office.</p>
            </div>

            <div className="space-y-4 pt-4 text-xs font-semibold">
              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Barangay Hall Address</span>
                  <p className="text-slate-800 font-bold leading-snug">Barangay Hall, San Vicente, Apalit, Pampanga, 2016</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Office Hours</span>
                  <p className="text-slate-800 font-bold">Monday - Friday: 8:00 AM - 5:00 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">General Hotline</span>
                  <p className="text-slate-800 font-bold">+63 (045) 123-4567</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Mail className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Email Address</span>
                  <p className="text-slate-800 font-bold">contact@sanvicentebarangay.gov.ph</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right SVG Map Mock widget */}
          <div className="lg:col-span-6 flex justify-center w-full">
            <div className="w-full max-w-xl h-80 md:h-96 rounded-xl overflow-hidden relative shadow-lg border border-slate-200">
              <iframe
                title="Barangay San Vicente Google Map"
                src="https://maps.google.com/maps?q=Barangay%20San%20Vicente,%20Apalit,%20Pampanga&t=&z=16&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

        </div>
      </section>

      {/* 8. PRIVACY CONSENT MODAL */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col animate-scale-up">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <h3 className="font-heading font-extrabold text-slate-950 text-base">Privacy Consent & Data Usage</h3>
              </div>
              <button 
                onClick={() => setShowConsentModal(false)}
                className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 text-left overflow-y-auto max-h-[75vh]">
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                To assist with your concern promptly, this form collects personal data and issue details. Agreeing to this allows us to routing, verify, and resolve your reports.
              </p>

              {/* 2x2 Grid of details collected */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                
                {/* 1. Location */}
                <div className="bg-slate-50/50 border border-slate-150 p-4 rounded-2xl flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-slate-900">Geographical Location</h4>
                    <p className="text-[10px] text-slate-400 font-medium leading-snug">Map pin coordinates, barangay zone, and approximate address.</p>
                  </div>
                </div>

                {/* 2. Contact */}
                <div className="bg-slate-50/50 border border-slate-150 p-4 rounded-2xl flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-slate-900">Contact Information</h4>
                    <p className="text-[10px] text-slate-400 font-medium leading-snug">Full name, email address, and mobile number for updates.</p>
                  </div>
                </div>

                {/* 3. Details & Media */}
                <div className="bg-slate-50/50 border border-slate-150 p-4 rounded-2xl flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-slate-900">Issue Details & Media</h4>
                    <p className="text-[10px] text-slate-400 font-medium leading-snug">Subject, description, and optional photo attachments.</p>
                  </div>
                </div>

                {/* 4. History logs */}
                <div className="bg-slate-50/50 border border-slate-150 p-4 rounded-2xl flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-slate-900">Service History</h4>
                    <p className="text-[10px] text-slate-400 font-medium leading-snug">Action timeline logs of your reported concern.</p>
                  </div>
                </div>

              </div>

              {/* Alert notice box */}
              <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex gap-3 items-start text-xs text-blue-800">
                <Lock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed font-medium">
                  We handle details in accordance with the Data Privacy Act. We will never share your personal information with third parties without consent.
                </p>
              </div>

              {/* Consent Checkbox */}
              <div className="pt-2 flex items-start gap-3 select-none">
                <input 
                  type="checkbox" 
                  id="consent-check" 
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 mt-0.5 cursor-pointer"
                />
                <label 
                  htmlFor="consent-check"
                  className="text-xs text-slate-650 font-semibold cursor-pointer"
                >
                  I have read and agree to the <button type="button" onClick={() => setShowTermsModal(true)} className="text-blue-600 hover:underline font-bold focus:outline-none cursor-pointer">Terms of Use</button> and <button type="button" onClick={() => setShowPrivacyModal(true)} className="text-blue-600 hover:underline font-bold focus:outline-none cursor-pointer">Privacy Policy</button>.
                </label>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4.5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setShowConsentModal(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConsentConfirm}
                disabled={!consentChecked}
                className={`
                  px-6 py-2.5 rounded-xl text-xs font-extrabold text-white transition-all shadow-md cursor-pointer
                  ${consentChecked 
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/10 active:scale-98' 
                    : 'bg-slate-350 cursor-not-allowed shadow-none'}
                `}
              >
                Continue
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default LandingPage;
