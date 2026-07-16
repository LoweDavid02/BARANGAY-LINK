import React, { useState, useEffect } from 'react';
import { useTickets } from '../../context/TicketContext';
import {
  Check,
  MapPin,
  Upload,
  File,
  X,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  ClipboardCheck,
  CheckCircle2,
  Trash2,
  Wrench,
  Info,
  Minus,
  Lock,
  User,
  Phone,
  Edit2,
  FileText,
  Copy,
  Home,
  Crosshair,
  Plus,
  Mail,
  Target,
  Download
} from 'lucide-react';

const ALLOWED_LOCATIONS = [
  // Subdivisions, Phases, Blocks, and Lots
  'Bagong Pag-Asa Subdivision',
  '2288 Bagong Pag-Asa',
  'Royal Family Homes Subdivision',
  'San Vicente Phase I',
  'San Vicente Phase II',
  'San Vicente Phase III',
  'San Vicente West',
  'Lot 517-D-2',
  'St. Dominic Village',
  'Block 4B, Lot 13',
  'St. Peter\'s Subdivision',
  '1st Street',
  'Villena Subdivision',

  // Sitios and Puroks
  'Purok Bagong Pag-Asa',
  'Sitio Pampanga',
  'Sitio Sampaga',

  // Streets and Roads
  'Apalit to Macabebe to Masantol Road',
  'Balite Street',
  'David Street',
  'Macabebe Provincial Road',
  'MacArthur Highway',
  'San Juan Road',
  'San Vicente to Colgante Road',
  'Sucad Road',

  // Landmarks and Key Zones
  'Apalit Public Market',
  'PalengKeni Apalit',
  'Apalit Pnr Station',
  'Apalit Town Plaza',
  'Blue Arcade Building',
  'Brgy. Sulipan Junction',
  'Central Business District',
  'Poblacion',
  'Gate 1 Bagong Pag-Asa',
  'N and C Building',
  'Sampaga Elementary School',

  // Sm Savemore Apalit Directory
  'Sm Savemore Apalit',
  'Aficionado',
  'Bench',
  'Coco Fresh Tea and Juice',
  'Fruity Lemons',
  'Ian Darcy',
  'Mister Donut',
  'Eo Kids Up',
  'Ideal Vision Center',
  'Blue Box',
  'Captain Gadget',
  'Gdgt Zone',
  'Cyberzone',
  'Sm Cinema',

  // Establishments and Businesses
  'Alvin Lunita\'s Bakery',
  'Andok\'s',
  'Angel\'s Bay Food Products Trading',
  'Armenia\'s Breads Cakes and Pastries',
  'Bernabest Food Products, Inc.',
  'Bes House of Chicken Corp.',
  'Big Save Supermarket Corp.',
  'Bok Korean Fried Chicken',
  'Chowking',
  'DelishCheese Dough',
  'Domino\'s Pizza',
  'Go Foody Food Stall',
  'Jollibee',
  'Kfc',
  'Ma Celang Grill',
  'Mang Inasal',
  'McDonald\'s',
  'Mrs. J\'s Food Hub',
  'Putak Inasal and Sizzling House',
  'Red Dot Lugaw House',
  'Red Ribbon',
  'Sushi Yum Yan',
  'The Daily Coffee',
  'The Hungry Pita',
  'A\'s Mini Hardware',
  'Baiku\'s Bike Parts and Accessories Store',
  'Blue Box Enterprises',
  'Classi-Coo Apparel Store',
  'Dimpleryann Bike Shop',
  'Federic Sam Boutique',
  'Quizon General Merchandise',
  'Swish-Arki General Merchandise',
  'Thress Lady\'s Hardware Trading',
  'Yamanari Auto Supply',
  'Zsarenz Motor Parts and General Merchandise',
  'Cabrera Torres Dental Clinic',
  'DSmile Lab Dental Clinic',
  'Harold C. Sunga MD Internal Medicine Adult Clinic',
  'Oriskin Gluta Wellness Spa',
  'South Star Drug Inc.',
  'St. Thomas Eyecare Center Inc.',
  'Windve Pharmacy and Convenience Store',
  'Aqua Mergel Purified Drinking Water',
  'Blue Madonna Memorial',
  'Ermie Purified Drinking Water',
  'Hotel Impressa',
  'Hydrolife Water Purification Services',
  'K3Water Refilling Station',
  'Motor Trade Nationwide Corporation',
  'N2B Materials Testing Center and Construction',
  'PremiumBikes Corporation',
  'Royal Anne Apartment',
  'St. Louie Memorial Chapel',
  'Zarteg Gas Station'
];

const SubmitTicketWizard = () => {
  const { addTicket, setCurrentRoute, setTrackingId, setShowTermsModal, setShowPrivacyModal } = useTickets();
  const [step, setStep] = useState(1);

  const obfuscateEmail = (val) => {
    if (!val) return '';
    const parts = val.split('@');
    if (parts.length < 2) return val;
    return `${parts[0].charAt(0)}***@${parts[1]}`;
  };

  // Form State
  const [category, setCategory] = useState('Complaint');
  const [department, setDepartment] = useState('Infrastructure');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

  const handleAddressChange = (val) => {
    setAddress(val);
    if (val.trim() === '') {
      setFilteredSuggestions([]);
    } else {
      const filtered = ALLOWED_LOCATIONS.filter(loc =>
        loc.toLowerCase().includes(val.toLowerCase())
      );
      setFilteredSuggestions(filtered.slice(0, 5));
    }
  };

  // Simulated Interactive Map Coordinates
  const [coordinates, setCoordinates] = useState({ lat: 14.9490, lng: 120.7608 });
  const [address, setAddress] = useState('Brgy. Hall, San Vicente');
  const [landmark, setLandmark] = useState('');
  const [mapClicked, setMapClicked] = useState(false);

  // Subject and Description
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  // Attachments State
  const [attachments, setAttachments] = useState([]);

  // Checkbox for terms
  const [termsAgreed, setTermsAgreed] = useState(false);

  // Success ID State
  const [successTicketId, setSuccessTicketId] = useState('');
  const [copied, setCopied] = useState(false);

  // Validation States
  const [validationErrors, setValidationErrors] = useState({});

  // Submission Loader States
  const [submitting, setSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [submitProgressText, setSubmitProgressText] = useState('COMPILING TICKET DETAILS');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    // Check if there was a pre-selected category from Landing Page
    const preselected = localStorage.getItem('blink_preselected_category');
    const preselectedDept = localStorage.getItem('blink_preselected_department');
    if (preselected) {
      setCategory(preselected);
      if (preselectedDept) {
        setDepartment(preselectedDept);
      } else {
        // Auto-assign corresponding department
        if (preselected === 'Complaint') setDepartment('Public Safety');
        else if (preselected === 'Service Request') setDepartment('Sanitation');
        else setDepartment('Administrative Services');
      }

      localStorage.removeItem('blink_preselected_category');
      localStorage.removeItem('blink_preselected_department');
    }
  }, []);

  const handleCategorySelect = (selectedCat) => {
    setCategory(selectedCat);
    // Align default department to category
    if (selectedCat === 'Complaint') setDepartment('Infrastructure');
    else if (selectedCat === 'Service Request') setDepartment('Sanitation');
    else setDepartment('Administrative Services');
  };

  const handleNextStep = () => {
    const errors = {};
    if (step === 4) {
      if (!name.trim()) errors.name = 'Full name is required.';
      if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) errors.email = 'A valid email address is required.';
      if (!phone.trim() || phone.length < 7) errors.phone = 'A valid phone number is required.';
    }
    if (step === 2) {
      if (!subject.trim()) errors.subject = 'Subject line is required.';
      if (!description.trim() || description.length < 10) errors.description = 'Please provide a detailed description (at least 10 characters).';
    }
    if (step === 3) {
      if (!address.trim()) {
        errors.address = 'Street Address is required.';
      } else {
        const isValid = ALLOWED_LOCATIONS.some(loc =>
          address.toLowerCase().includes(loc.toLowerCase())
        );
        if (!isValid) {
          errors.address = 'The address must reference a valid zone, street, landmark, subdivision or establishment within Barangay San Vicente, Apalit, Pampanga.';
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setValidationErrors({});
    setStep(prev => prev - 1);
  };

  // Map Click Simulation
  const handleMapClick = (e) => {
    const mapRect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - mapRect.left;
    const clickY = e.clientY - mapRect.top;

    // Calculate a mock Lat/Lng based on click position
    const minLat = 14.9400;
    const maxLat = 14.9600;
    const minLng = 120.7500;
    const maxLng = 120.7700;

    const percentX = clickX / mapRect.width;
    const percentY = 1 - (clickY / mapRect.height); // invert Y for Lat

    const calculatedLat = minLat + (maxLat - minLat) * percentY;
    const calculatedLng = minLng + (maxLng - minLng) * percentX;

    setCoordinates({
      lat: Number(calculatedLat.toFixed(4)),
      lng: Number(calculatedLng.toFixed(4))
    });

    // Mock an address based on sector
    const sectors = ['Rizal St', 'Quezon Ave', 'Bonifacio Lane', 'Mabini St', 'Macapagal Rd'];
    const mockAddr = `${Math.floor(10 + Math.random() * 90)}, ${sectors[Math.floor(Math.random() * sectors.length)]}, Zone ${Math.floor(1 + Math.random() * 5)}, San Vicente`;
    setAddress(mockAddr);
    setMapClicked(true);
  };

  // File Upload Simulation
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async () => {
    if (!termsAgreed) return;

    setSubmitError('');
    setSubmitting(true);
    setSubmitProgress(0);
    setSubmitProgressText('COMPILING TICKET DETAILS');

    // Simulate progress increments up to 95%
    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += 5;
      if (currentProgress > 95) currentProgress = 95;
      setSubmitProgress(currentProgress);

      if (currentProgress === 25) {
        setSubmitProgressText('UPLOADING EVIDENCE & ATTACHMENTS');
      } else if (currentProgress === 50) {
        setSubmitProgressText('TRANSMITTING TO BARANGAY SERVER');
      } else if (currentProgress === 75) {
        setSubmitProgressText('GENERATING SECURE TRACKING ID');
      }
    }, 150);

    try {
      const ticketId = await addTicket({
        category,
        department,
        subject,
        description,
        location: { ...coordinates, address },
        submitter: { name, email, phone },
        attachments: attachments.map(a => a.name)
      });

      clearInterval(progressInterval);
      setSubmitProgress(100);
      setSubmitProgressText('SUBMISSION SUCCESSFUL');

      setTimeout(() => {
        setSuccessTicketId(ticketId);
        setStep(6); // Go to Success Screen
        setSubmitting(false);
      }, 500);

    } catch (err) {
      clearInterval(progressInterval);
      setSubmitting(false);
      setSubmitError(err.message || 'Failed to submit ticket. Please check your network connection and try again.');
      console.error("Failed to submit ticket:", err);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(successTicketId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [highestStep, setHighestStep] = useState(1);

  useEffect(() => {
    if (step > highestStep) {
      setHighestStep(step);
    }
  }, [step, highestStep]);

  const renderStepper = () => (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((s) => {
        const isCurrent = s === step;
        const isCompleted = s < step;
        const isClickable = s <= highestStep;

        return (
          <button
            key={s}
            onClick={() => {
              if (isClickable) setStep(s);
            }}
            disabled={!isClickable}
            className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold transition-all focus:outline-none
              ${isCurrent ? 'bg-blue-600 text-white shadow-sm' :
                isCompleted ? 'bg-blue-100 text-blue-700 cursor-pointer hover:bg-blue-200' :
                  isClickable ? 'bg-slate-100 text-slate-600 cursor-pointer hover:bg-slate-200' :
                    'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100'}
            `}
          >
            {s}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 md:py-12 flex flex-col justify-center h-full">
      {/* Wizard Box */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden flex flex-col h-[700px] max-h-[85vh]">


        {/* Form Body content */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* STEP 1: CATEGORY SELECTION */}
          {step === 1 && (
            <div className="flex flex-col h-full bg-white">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                <span className="font-bold text-slate-900 text-sm tracking-wide">Select Category</span>

                {/* Numbered stepper */}
                {renderStepper()}

                <button
                  onClick={() => setCurrentRoute('resident-home')}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar text-left">
                <div className="space-y-1">
                  <h2 className="font-heading font-extrabold text-xl text-slate-900 tracking-tight">What type of concern are you submitting?</h2>
                  <p className="text-xs text-slate-500 font-medium">Select the category that best matches your request. This helps us route it to the right department quickly.</p>
                </div>

                <div className="space-y-3 max-w-2xl mx-auto md:mx-0">
                  {[
                    { id: 'Complaint', title: 'Complaint', desc: 'Report a problem or issue within the barangay that requires immediate attention.', icon: <ShieldAlert className="w-4 h-4 text-red-600" />, iconBg: 'bg-red-50' },
                    { id: 'Service Request', title: 'Service Request', desc: 'Request a permit, certificate, clearance, or other barangay services.', icon: <Wrench className="w-4 h-4 text-blue-600" />, iconBg: 'bg-blue-50' },
                    { id: 'General Concern', title: 'General Concern', desc: 'Other feedback, inquiries, or suggestions not covered by the categories above.', icon: <Info className="w-4 h-4 text-slate-600" />, iconBg: 'bg-slate-100' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleCategorySelect(item.id)}
                      className={`
                        w-full text-left p-4 rounded-xl border flex items-center gap-4 transition-all duration-200 cursor-pointer focus:outline-none
                        ${category === item.id
                          ? 'border-blue-600 ring-1 ring-blue-600 bg-blue-50/30 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 bg-white'}
                      `}
                    >
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.iconBg}`}>
                        {item.icon}
                      </div>

                      {/* Text */}
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">{item.desc}</p>
                      </div>

                      {/* Radio button */}
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ml-2 transition-colors
                        ${category === item.id ? 'border-blue-600' : 'border-slate-300'}
                      `}>
                        {category === item.id && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-100 flex justify-end mt-auto shrink-0">
                <button
                  onClick={handleNextStep}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 active:scale-98 text-sm font-bold text-white transition-all shadow-md shadow-blue-700/20 cursor-pointer focus:outline-none"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CONCERN DETAILS */}
          {step === 2 && (
            <div className="flex flex-col h-full bg-white">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                <span className="font-bold text-slate-900 text-sm tracking-wide">Concern Details</span>

                {/* Numbered stepper */}
                {renderStepper()}

                <button
                  onClick={() => setCurrentRoute('resident-home')}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar text-left w-full mx-auto" style={{ maxWidth: '44rem' }}>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 block">Subject <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief summary of the issue"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-blue-500 transition-colors placeholder-slate-400"
                  />
                  {validationErrors.subject && <p className="text-red-500 text-xs font-semibold">{validationErrors.subject}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 block">Description <span className="text-red-500">*</span></label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Please describe the issue in detail. Include any relevant landmarks or specific context."
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-blue-500 transition-colors placeholder-slate-400 resize-none"
                  />
                  {validationErrors.description && <p className="text-red-500 text-xs font-semibold">{validationErrors.description}</p>}
                </div>

                {/* File Uploader */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-slate-800 block">Photo / Video (Optional)</label>
                  <div className="relative border-2 border-dashed border-blue-200 bg-blue-50/40 rounded-2xl hover:border-blue-400 transition-colors p-8 text-center cursor-pointer flex flex-col items-center justify-center gap-2">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="w-6 h-6 text-blue-600 mb-1" />
                    <span className="text-xs font-bold text-blue-700">Click to upload or drag and drop</span>
                    <span className="text-[11px] text-slate-500 font-medium">JPG, PNG or MP4 (max. 10MB)</span>
                  </div>

                  {/* Attached files list */}
                  {attachments.length > 0 && (
                    <div className="pt-2 divide-y divide-slate-100">
                      {attachments.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2 text-xs">
                          <div className="flex items-center gap-2 font-bold text-slate-700">
                            <File className="w-4 h-4 text-blue-500" />
                            {file.name}
                            <span className="text-slate-400 font-normal">({file.size})</span>
                          </div>
                          <button
                            onClick={() => removeAttachment(idx)}
                            className="p-1 hover:bg-red-50 hover:text-red-500 rounded text-slate-400 cursor-pointer focus:outline-none"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-100 flex justify-between mt-auto shrink-0">
                <button
                  onClick={handlePrevStep}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer focus:outline-none"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-500" />
                  Back
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={!subject || description.length < 10}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all focus:outline-none ${subject && description.length >= 10 ? 'bg-blue-700 hover:bg-blue-800 shadow-md shadow-blue-700/20 cursor-pointer active:scale-98' : 'bg-slate-400 cursor-not-allowed'}`}
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: LOCATION MAP PICKER */}
          {step === 3 && (
            <div className="flex flex-col h-full bg-white">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                <span className="font-bold text-slate-900 text-sm tracking-wide">Issue Location</span>

                {/* Numbered stepper */}
                {renderStepper()}

                <button
                  onClick={() => setCurrentRoute('resident-home')}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col w-full mx-auto" style={{ maxWidth: '44rem' }}>

                {/* Map Area */}
                <div className="relative h-64 w-full rounded-2xl border border-slate-200 overflow-hidden mb-6 flex-shrink-0">
                  {/* Google Maps Embed */}
                  <div className="absolute inset-0 bg-slate-100">
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(address + ', San Vicente, Apalit, Pampanga')}&t=m&z=15&ie=UTF8&iwloc=&output=embed`}
                    ></iframe>
                  </div>

                  {/* Top-left marker */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 z-10 text-blue-700 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm text-xs font-bold border border-blue-100">
                    <MapPin className="w-4 h-4 fill-blue-700" />
                    <span>Pin issue location</span>
                  </div>

                  {/* Top-right 'Use current location' */}
                  <button className="absolute top-4 right-4 flex items-center gap-2 z-10 text-blue-600 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm text-xs font-bold border border-blue-100 cursor-pointer hover:bg-white transition-colors focus:outline-none">
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>Use current location</span>
                  </button>

                  {/* Zoom controls right edge */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden z-10">
                    <button className="p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-b border-slate-200 cursor-pointer focus:outline-none"><Plus className="w-4 h-4" /></button>
                    <button className="p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer focus:outline-none"><Minus className="w-4 h-4" /></button>
                  </div>

                  {/* Marker Pin Center */}
                  <div className="absolute z-10 flex flex-col items-center left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <MapPin className="w-8 h-8 text-blue-600 fill-blue-100 drop-shadow-md" />
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div className="space-y-2 relative">
                    <label className="text-xs font-bold text-slate-800 block">Street Address <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => handleAddressChange(e.target.value)}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      placeholder="e.g. Bagong Pag-Asa, Jollibee, etc."
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-blue-500 transition-colors placeholder-slate-400"
                    />
                    {showSuggestions && filteredSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto divide-y divide-slate-100">
                        {filteredSuggestions.map((suggestion, idx) => (
                          <div
                            key={idx}
                            onMouseDown={() => {
                              setAddress(suggestion);
                              setShowSuggestions(false);
                              setFilteredSuggestions([]);
                              setValidationErrors(prev => ({ ...prev, address: null }));
                            }}
                            className="w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-blue-50 text-slate-700 cursor-pointer transition-colors"
                          >
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                    {validationErrors.address && <p className="text-red-500 text-xs font-semibold">{validationErrors.address}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-800 block">Nearby Landmark (Optional)</label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="e.g. Near the Central Park fountain"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-blue-500 transition-colors placeholder-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-100 flex justify-between mt-auto shrink-0">
                <button
                  onClick={handlePrevStep}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer focus:outline-none"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-500" />
                  Back
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={!address.trim()}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all focus:outline-none ${address.trim() ? 'bg-blue-700 hover:bg-blue-800 shadow-md shadow-blue-700/20 cursor-pointer active:scale-98' : 'bg-slate-400 cursor-not-allowed'}`}
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: CONTACT INFORMATION */}
          {step === 4 && (
            <div className="flex flex-col h-full bg-white">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                <span className="font-bold text-slate-900 text-sm tracking-wide">Contact Information</span>

                {/* Numbered stepper */}
                {renderStepper()}

                <button
                  onClick={() => setCurrentRoute('resident-home')}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar text-left w-full mx-auto" style={{ maxWidth: '44rem' }}>

                {/* Secure info box */}
                <div className="bg-blue-50 text-blue-700 flex items-center gap-3 px-4 py-3 rounded-xl border border-blue-100">
                  <User className="w-5 h-5 shrink-0" />
                  <span className="text-xs font-bold">Your personal details remain secure.</span>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-800 block">Full Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Juan dela Cruz"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-blue-500 transition-colors placeholder-slate-400"
                    />
                    {validationErrors.name && <p className="text-red-500 text-xs font-semibold">{validationErrors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-800 block">Email Address <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. juan@example.com"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-blue-500 transition-colors placeholder-slate-400"
                    />
                    <p className="text-[10px] font-medium text-slate-500">We will send an email confirmation using this address.</p>
                    {validationErrors.email && <p className="text-red-500 text-xs font-semibold">{validationErrors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-800 block">Contact Number <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="w-4 h-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+63 (900) 000-0000"
                        className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium outline-none focus:border-blue-500 transition-colors placeholder-slate-400"
                      />
                    </div>
                    {validationErrors.phone && <p className="text-red-500 text-xs font-semibold">{validationErrors.phone}</p>}
                  </div>
                </div>

                {/* Privacy info box */}
                <div className="flex items-start gap-3 px-1 py-4">
                  <Lock className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    This information is securely stored. We use your contact details solely for the purpose of keeping you updated on your submitted issue. We do not share your information with third parties. By proceeding you accept our <button type="button" onClick={() => setShowPrivacyModal(true)} className="text-blue-600 hover:underline font-bold focus:outline-none">Privacy Policy</button>.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-100 flex justify-between mt-auto shrink-0">
                <button
                  onClick={handlePrevStep}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer focus:outline-none"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-500" />
                  Back
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={!name.trim() || !email.trim() || !phone.trim()}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all focus:outline-none ${name.trim() && email.trim() && phone.trim() ? 'bg-blue-700 hover:bg-blue-800 shadow-md shadow-blue-700/20 cursor-pointer active:scale-98' : 'bg-slate-400 cursor-not-allowed'}`}
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: FINAL REVIEW */}
          {step === 5 && (
            <div className="flex flex-col h-full bg-white">
              {/* Header */}
              <div className="px-6 pt-6 pb-4 flex flex-col items-center justify-center text-center shrink-0 relative">
                <button
                  onClick={() => setCurrentRoute('resident-home')}
                  className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 text-blue-700 font-bold text-xs bg-blue-50 px-3 py-1.5 rounded-full mb-3">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Review & Submit</span>
                  <div className="ml-2">
                    {renderStepper()}
                  </div>
                </div>

                <h2 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">Step 5 of 5: Final Review</h2>
                <p className="text-sm text-slate-500 font-medium mt-1 max-w-md">Please review your details carefully before submitting. Once submitted, tickets cannot be changed or recalled.</p>
                <div className="w-full h-1 bg-blue-600 rounded-full mt-6"></div>
              </div>

              {/* Body */}
              <div className="px-6 py-2 pb-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar text-left w-full mx-auto" style={{ maxWidth: '44rem' }}>

                {/* Ticket Info Box */}
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                      <FileText className="w-4 h-4 text-blue-600" />
                      Ticket Info
                    </div>
                    <button onClick={() => setStep(2)} className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-full transition-colors focus:outline-none cursor-pointer">
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </button>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Subject</span>
                      <p className="text-sm font-bold text-slate-800">{subject || 'No subject provided'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Description</span>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed">{description || 'No description provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Grid for Location and Contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Location Box */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white flex flex-col">
                    <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        Location
                      </div>
                      <button onClick={() => setStep(3)} className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-full transition-colors focus:outline-none cursor-pointer">
                        <Edit2 className="w-3 h-3" />
                        Edit
                      </button>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="space-y-1 pb-4">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Address</span>
                        <p className="text-sm font-bold text-slate-800 leading-tight">{address || 'No address provided'}</p>
                      </div>
                      <div className="bg-slate-100 rounded-lg flex-1 min-h-[120px] relative overflow-hidden">
                        <iframe
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          allowFullScreen
                          src={`https://maps.google.com/maps?q=${encodeURIComponent(address + ', San Vicente, Apalit, Pampanga')}&t=m&z=15&ie=UTF8&iwloc=&output=embed`}
                        ></iframe>
                      </div>
                    </div>
                  </div>

                  {/* Contact Box */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white flex flex-col">
                    <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                        <User className="w-4 h-4 text-blue-600" />
                        Contact
                      </div>
                      <button onClick={() => setStep(4)} className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-full transition-colors focus:outline-none cursor-pointer">
                        <Edit2 className="w-3 h-3" />
                        Edit
                      </button>
                    </div>
                    <div className="p-5 space-y-4 flex-1 flex flex-col">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                          {name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Name</span>
                          <p className="text-sm font-bold text-slate-800 leading-tight">{name || 'No name provided'}</p>
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        <div>
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Email Address</span>
                          <p className="text-sm font-bold text-slate-800">{email || 'No email provided'}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Phone Number</span>
                          <p className="text-sm font-bold text-slate-800">{phone || 'No phone provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {submitError && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800 font-semibold leading-relaxed animate-shake">
                    <ShieldAlert className="w-5 h-5 text-red-650 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-extrabold text-red-900">Submission Error</p>
                      <p>{submitError}</p>
                    </div>
                  </div>
                )}

                {/* Consent & Submit Box */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mt-6 mb-2">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="agree-terms"
                      checked={termsAgreed}
                      onChange={(e) => setTermsAgreed(e.target.checked)}
                      className="w-4 h-4 accent-blue-600 mt-0.5 cursor-pointer shrink-0"
                    />
                    <label htmlFor="agree-terms" className="text-xs text-slate-700 font-medium select-none cursor-pointer leading-relaxed">
                      I confirm the above information is accurate and consent to be contacted by BLINK/LGU regarding this specific issue for further clarification or action.
                    </label>
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={!termsAgreed || submitting}
                    className={`w-full mt-4 flex justify-center items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all focus:outline-none ${termsAgreed && !submitting ? 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 cursor-pointer active:scale-98' : 'bg-slate-400 cursor-not-allowed'}`}
                  >
                    {submitting ? 'Submitting...' : 'Submit Ticket'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* STEP 6: SUCCESS SCREEN */}
          {step === 6 && (
            <div className="flex flex-col h-full bg-white overflow-y-auto custom-scrollbar pb-10">
              <div className="flex-1 flex flex-col items-center justify-center py-10 px-6 max-w-lg mx-auto w-full">

                {/* Check Icon */}
                <div className="w-20 h-20 rounded-full border-[4px] border-blue-700 flex items-center justify-center mb-6 bg-white shrink-0 shadow-sm">
                  <Check className="w-10 h-10 text-blue-700 stroke-[3]" />
                </div>

                <h2 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight text-center mb-2">Ticket Submitted</h2>
                <p className="text-sm text-slate-500 font-medium text-center mb-8 max-w-sm">
                  Thank you for reporting. Your request has been submitted.
                </p>

                {/* Info Card */}
                <div className="w-full border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm mb-6 flex flex-col text-left">
                  {/* Reference ID Area */}
                  <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Tracking Reference Number</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-2xl text-blue-700 tracking-widest uppercase select-all">{successTicketId}</span>
                        <button onClick={() => {
                          navigator.clipboard.writeText(successTicketId);
                        }} className="text-blue-700 hover:text-blue-800 p-1.5 bg-blue-100/50 hover:bg-blue-100 rounded-md transition-colors focus:outline-none cursor-pointer" title="Copy Ticket Number">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Grid details & QR */}
                  <div className="p-6 flex flex-col sm:flex-row gap-8">
                    <div className="flex-1 grid grid-cols-2 gap-y-6 gap-x-4">

                      <div>
                        <span className="text-[10px] font-medium text-slate-500 mb-1 block">Submitted On</span>
                        <span className="text-xs font-bold text-slate-900">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} &middot; {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                      </div>

                      <div>
                        <span className="text-[10px] font-medium text-slate-500 mb-1 block">Category</span>
                        <span className="text-xs font-bold text-slate-900">{category || 'Complaint'}</span>
                      </div>

                      <div>
                        <span className="text-[10px] font-medium text-slate-500 mb-1 block">Estimated Resolution</span>
                        <span className="text-xs font-bold text-slate-900">Within 48 Business Hours</span>
                      </div>

                      <div>
                        <span className="text-[10px] font-medium text-slate-500 mb-1 block">Updates</span>
                        <div className="flex items-start gap-1">
                          <Mail className="w-3.5 h-3.5 text-blue-700 mt-0.5 shrink-0" />
                          <span className="text-xs font-medium text-blue-700 break-all leading-tight">Sent to {obfuscateEmail(email)}</span>
                        </div>
                      </div>

                    </div>

                    {/* QR Code */}
                    <div className="w-32 flex flex-col items-center justify-center shrink-0 border border-slate-205 rounded-xl px-4 py-5 bg-white gap-4 mx-auto sm:mx-0 shadow-sm">
                      <div className="w-full aspect-square relative flex items-center justify-center">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(successTicketId)}`}
                          alt="Ticket QR Code"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className="text-[11px] font-medium text-[#4a6b8c] text-center leading-[1.3]">
                        Scan to track via<br />mobile
                      </span>

                      <button
                        onClick={async () => {
                          try {
                            const response = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(successTicketId)}`);
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `ticket-${successTicketId}-qr.png`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(url);
                          } catch (err) {
                            console.error("Failed to download QR code:", err);
                          }
                        }}
                        className="mt-1 flex items-center justify-center gap-1.5 w-full py-1.5 rounded bg-slate-50 hover:bg-blue-50 border border-slate-200 text-[#4a6b8c] hover:text-blue-700 text-[10px] font-bold transition-colors cursor-pointer focus:outline-none"
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => {
                      setTrackingId(successTicketId);
                      setCurrentRoute('resident-track');
                    }}
                    className="flex-[2] flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-[#0038a8] hover:bg-blue-800 shadow-sm text-sm font-medium text-white transition-all cursor-pointer focus:outline-none"
                  >
                    <Target className="w-4 h-4" />
                    Track This Ticket
                  </button>
                  <button
                    onClick={() => setCurrentRoute('resident-home')}
                    className="flex-1 flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg text-sm font-medium text-white bg-[#9CA3AF] hover:bg-slate-500 transition-all cursor-pointer focus:outline-none"
                  >
                    Close
                  </button>
                </div>

                <div className="mt-6 text-center text-[10px] font-medium text-slate-500 space-y-1">
                  <p>
                    Something went wrong? <button className="text-blue-700 hover:underline focus:outline-none cursor-pointer">Report an issue</button> Call (555) 123-4567..
                  </p>
                  <p>Blinked Citizen Services &copy; 2026</p>
                </div>
              </div>
            </div>
          )}

          {/* SUBMISSION LOADING MODAL */}
          {submitting && (
            <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col p-8 items-center text-center animate-scale-up shrink-0 space-y-6">

                {/* Spinner wheel with icon */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin"></div>
                  <FileText className="w-5 h-5 text-blue-650" />
                </div>

                <div className="space-y-2 text-center w-full">
                  <h4 className="font-heading font-extrabold text-lg text-slate-900">
                    Submitting Your Ticket...
                  </h4>
                  <p className="text-xs text-slate-455 font-semibold leading-relaxed max-w-xs mx-auto">
                    Please wait while we transmit your concern to Barangay San Vicente's server.
                  </p>
                </div>

                {/* Progress bar container */}
                <div className="w-full space-y-2.5">
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/40">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${submitProgress}%` }}
                    ></div>
                  </div>
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block text-center">
                    {submitProgressText}
                  </span>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SubmitTicketWizard;
