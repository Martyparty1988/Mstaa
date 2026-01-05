import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  action?: React.ReactNode; 
}

const LogoBranding = () => (
  <div className="flex items-center gap-3 select-none group cursor-default">
    {/* Solar Core Hexagon Icon */}
    <div className="relative w-9 h-9 flex items-center justify-center">
      {/* Glow Pulse Background */}
      <div className="absolute inset-0 bg-solar-start/20 rounded-xl blur-xl group-hover:bg-solar-start/40 transition-all duration-700 animate-pulse-slow" />
      
      {/* Hexagon Body */}
      <svg viewBox="0 0 24 24" className="w-8 h-8 drop-shadow-glow filter transition-transform duration-500 group-hover:scale-110">
        <path 
          fill="url(#solar-grad)" 
          d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z" 
          className="stroke-white/20 stroke-1"
        />
        {/* Tracking Axis Line */}
        <rect x="4" y="11.5" width="16" height="1" rx="0.5" fill="white" className="shadow-glow animate-shimmer" />
        
        <defs>
          <linearGradient id="solar-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>
    </div>

    {/* Typography Branding */}
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <span className="text-2xl font-black tracking-[-0.05em] text-white leading-none drop-shadow-lg">
          MST
        </span>
        <div className="w-[1px] h-4 bg-white/10 mx-1" />
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] leading-none mb-0.5">
            Marty Solar
          </span>
          <span className="text-[9px] font-black text-solar-start uppercase tracking-[0.2em] leading-none">
            Tracker
          </span>
        </div>
      </div>
    </div>
  </div>
);

export const Layout: React.FC<LayoutProps> = ({ children, title, showBack, onBack, action }) => {
  const isDefaultLogo = title === 'MST' || title === 'Projekty'; // Show logo on primary screens

  return (
    <div className="min-h-[100dvh] flex flex-col relative text-white selection:bg-solar-start/30">
      
      {/* Header - Premium Midnight Glass */}
      <header className="fixed top-0 w-full z-40 h-[calc(4rem+env(safe-area-inset-top))] flex items-end pb-3 px-4 bg-midnight/40 backdrop-blur-2xl border-b border-white/10 transition-all shadow-xl">
        <div className="flex items-center justify-between w-full relative">
          
          {/* Left Side: Back & Title/Logo */}
          <div className="flex items-center">
            {showBack && (
              <button 
                onClick={onBack}
                className="p-2 -ml-3 mr-2 text-white/50 active:text-white transition-colors rounded-full active:bg-white/10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
            )}
            
            {isDefaultLogo ? (
              <LogoBranding />
            ) : (
              <h1 className="text-xl font-black tracking-tight text-white drop-shadow-md truncate max-w-[220px]">
                {title}
              </h1>
            )}
          </div>

          {/* Right Side: Action (Settings, etc.) */}
          {action && (
            <div className="flex items-center">
              {action}
            </div>
          )}
          
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-[calc(4rem+env(safe-area-inset-top))] pb-[calc(6rem+env(safe-area-inset-bottom))] px-4 overflow-y-auto overflow-x-hidden">
        {children}
      </main>

      {/* Aesthetic bottom fade */}
      <div className="fixed bottom-0 w-full h-16 bg-gradient-to-t from-midnight to-transparent z-10 pointer-events-none" />
    </div>
  );
};