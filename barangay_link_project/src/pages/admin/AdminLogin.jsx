import React, { useState, useEffect, useRef } from 'react';
import { useTickets } from '../../context/TicketContext';
import { Shield, Mail, Lock, Landmark, ChevronDown } from 'lucide-react';
import PortalPreloader from '../../components/PortalPreloader';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const AdminLogin = () => {
  const { login, googleLogin, setCurrentRoute } = useTickets();
  const [portal, setPortal] = useState('Select');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const googleBtnRef = useRef(null);

  const portalRef = useRef(portal);

  // Keep portalRef updated with current portal value
  useEffect(() => {
    portalRef.current = portal;
  }, [portal]);

  // Initialize Google Identity Services once on mount
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const initGoogle = () => {
      if (window.google?.accounts?.id) {
        if (!window.google_initialized) {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
            auto_select: false,
          });
          window.google_initialized = true;
        }
        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'pill',
            width: '320',
          });
        }
      }
    };
    // Wait for the script to load
    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          initGoogle();
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, []);

  const handleGoogleResponse = async (response) => {
    if (!response.credential) return;
    const selectedPortal = portalRef.current !== 'Select' ? portalRef.current : 'Admin';
    setIsLoading(true);
    setErrorMsg('');
    try {
      await googleLogin(response.credential, selectedPortal);
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Google sign-in failed.');
    }
  };

  const handlePortalChange = (e) => {
    const val = e.target.value;
    setPortal(val);
    if (val === 'Admin') {
      setEmail('admin@example.com');
      setPassword('admin123');
    } else if (val === 'Personnel') {
      setEmail('m.sterling@barangaylink.gov');
      setPassword('personnel123');
    } else {
      setEmail('');
      setPassword('');
    }
    setErrorMsg('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (portal === 'Select') {
      setErrorMsg('Please select which portal to sign-in to continue.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      await login(email, password);
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Invalid credentials.');
    }
  };

  const isFormFilled = portal !== 'Select' && email.trim() !== '' && password.trim() !== '';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center antialiased font-sans p-6 md:p-12">
      
      {/* SPLIT LAYOUT BODY */}
      <div className="max-w-7xl w-full flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20">
        
        {/* Left Column: Portal Info and Asset */}
        <div className="flex-1 flex flex-col space-y-6 text-left w-full">
          <div className="space-y-3">
            <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-slate-900 tracking-tight leading-tight">
              BLinked Admin Portal
            </h2>
            <p className="text-sm md:text-base text-slate-550 leading-relaxed font-semibold max-w-md">
              Empowering city officials with real-time insights and efficient ticket management for a smarter urban environment.
            </p>
          </div>

          {/* Grid Graphic */}
          <div className="flex justify-start">
            <img 
              src="/tech_grid_login.png" 
              alt="Grid Network Illustration" 
              className="w-full max-w-sm rounded-2xl border border-slate-250/80 shadow-md object-cover aspect-square bg-[#030712]"
            />
          </div>

          {/* Infrastructure Disclaimer */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <Shield className="w-4.5 h-4.5 fill-emerald-600/10 text-emerald-600" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">Trusted Infrastructure</span>
              <span className="text-[11px] text-slate-500 font-semibold block">Encrypted end-to-end civic data</span>
            </div>
          </div>
        </div>

        {/* Right Column: Portal Sign-in Card */}
        <div className="flex-1 flex justify-center lg:justify-end w-full">
          <div className="w-full max-w-lg bg-white border border-slate-205 rounded-3xl shadow-xl p-8 space-y-6 text-left">
            
            {/* Header */}
            <div className="space-y-1.5">
              <h3 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
                Welcome Back!
              </h3>
              <p className="text-xs text-slate-500 font-bold">
                Select your portal and sign-in to continue
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              
              {/* Select Portal Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 tracking-wide block">
                  Select Portal:
                </label>
                <div className="relative">
                  <select
                    value={portal}
                    onChange={handlePortalChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-sm cursor-pointer appearance-none"
                  >
                    <option value="Select">Select which Portal</option>
                    <option value="Admin">Administrator Portal</option>
                    <option value="Personnel">Barangay Personnel Portal</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold block pl-1">
                  Admin or Personnel Portal
                </span>
              </div>

              {/* Email Input */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-bold text-slate-700 tracking-wide">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 focus-within:border-blue-650 focus-within:bg-white transition-all shadow-sm">
                  <Mail className="w-4.5 h-4.5 text-slate-400 shrink-0 mr-3" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter Admin or Personnel Email Address"
                    className="w-full bg-transparent border-0 outline-none py-3.5 text-sm font-semibold text-slate-800 placeholder-slate-400"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-bold text-slate-700 tracking-wide">
                    Password <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 focus-within:border-blue-650 focus-within:bg-white transition-all shadow-sm">
                  <Lock className="w-4.5 h-4.5 text-slate-400 shrink-0 mr-3" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Admin or Personnel Password"
                    className="w-full bg-transparent border-0 outline-none py-3.5 text-sm font-semibold text-slate-800 placeholder-slate-400"
                    required
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-650 text-xs font-bold">
                  {errorMsg}
                </div>
              )}

              {/* Sign In Button */}
              <button
                type="submit"
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-extrabold text-white transition-all shadow-md cursor-pointer mt-2 ${
                  isFormFilled 
                    ? 'bg-[#1E5AE6] hover:bg-[#1546B8]' 
                    : 'bg-[#6B7280] hover:bg-[#5A606C]'
                }`}
              >
                Sign-in
              </button>
            </form>

              {/* Divider */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex-1 h-px bg-slate-200"></div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>

              {/* Google Sign-In Button */}
              {GOOGLE_CLIENT_ID ? (
                <div className="flex justify-center">
                  <div ref={googleBtnRef} className="w-full flex justify-center"></div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setErrorMsg('Google Sign-In is not configured. Please set up VITE_GOOGLE_CLIENT_ID in your .env file.')}
                  className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-bold text-slate-700 transition-all shadow-sm cursor-pointer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign in with Google
                </button>
              )}

            {/* Disclaimer Notice */}
            <div className="pt-6 border-t border-slate-100 text-center space-y-1.5">
              <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest block">
                🛡️ AUTHORIZED PERSONNEL ONLY
              </span>
              <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                This system is restricted to Blinked City Management personnel.
              </p>
            </div>

            {/* Quick link back to citizen portal (Dev/testing helper) */}
            <div className="text-center pt-1">
              <button
                onClick={() => setCurrentRoute('resident-home')}
                className="text-[11px] text-slate-400 hover:text-blue-650 font-bold underline focus:outline-none cursor-pointer"
              >
                Go back to Citizen Portal
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Preloader Overlay on Sign In */}
      {isLoading && <PortalPreloader message={`Signing into ${portal !== 'Select' ? portal : 'Admin'} Portal...`} />}
    </div>
  );
};

export default AdminLogin;
