import React from 'react';
import { Landmark } from 'lucide-react';

const PortalPreloader = ({ message = "Loading portal..." }) => {
  return (
    <div className="fixed inset-0 z-[200] bg-gradient-to-br from-slate-900 via-[#0B2545] to-slate-900 flex flex-col items-center justify-center gap-8">
      
      {/* Animated Logo */}
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center backdrop-blur-sm animate-pulse">
          <Landmark className="w-10 h-10 text-white" />
        </div>
        {/* Outer rotating ring */}
        <div className="absolute -inset-3 rounded-3xl border-2 border-transparent border-t-blue-400 border-r-blue-400/30 animate-spin"></div>
      </div>

      {/* Text */}
      <div className="text-center space-y-2">
        <h3 className="text-white font-heading font-extrabold text-lg tracking-tight">
          Barangay Link
        </h3>
        <p className="text-blue-300/70 text-xs font-semibold tracking-wide animate-pulse">
          {message}
        </p>
      </div>

      {/* Loading bar */}
      <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 to-blue-300 rounded-full animate-loading-bar"></div>
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
