import React from 'react';
import { Landmark } from 'lucide-react';
import logo from '../assets/Blinked.png';

const PortalPreloader = ({ message = "Loading portal..." }) => {
  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center gap-8 animate-fade-in">
      
      {/* Animated Logo */}
      <div className="relative">
        <div className="w-28 h-28 flex items-center justify-center animate-pulse p-2 drop-shadow-lg">
          <img src={logo} alt="Barangay Link Logo" className="w-full h-full object-contain" />
        </div>
        {/* Outer rotating ring */}
        <div className="absolute -inset-3 rounded-3xl border-2 border-transparent border-t-blue-400 border-r-blue-400/40 animate-spin"></div>
      </div>

      {/* Text */}
      <div className="text-center space-y-1.5 drop-shadow-md">
        <h3 className="text-white font-heading font-extrabold text-xl tracking-tight">
          Barangay Link
        </h3>
        <p className="text-blue-200 text-xs font-semibold tracking-wide animate-pulse">
          {message}
        </p>
      </div>

      {/* Loading bar */}
      <div className="w-48 h-1.5 bg-white/20 rounded-full overflow-hidden shadow-inner">
        <div className="h-full bg-gradient-to-r from-blue-500 via-blue-400 to-sky-300 rounded-full animate-loading-bar"></div>
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes loading-bar {
          0% { width: 0%; margin-left: 0%; }
          50% { width: 70%; margin-left: 15%; }
          100% { width: 0%; margin-left: 100%; }
        }
        .animate-loading-bar {
          animation: loading-bar 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default PortalPreloader;
