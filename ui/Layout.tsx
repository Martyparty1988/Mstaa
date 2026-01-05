import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  action?: React.ReactNode; // New prop for right-side header action
}

export const Layout: React.FC<LayoutProps> = ({ children, title, showBack, onBack, action }) => {
  return (
    <div className="min-h-[100dvh] flex flex-col relative text-white selection:bg-solar-start/30">
      
      {/* Header - Transparent Glass */}
      <header className="fixed top-0 w-full z-40 h-[calc(3.5rem+env(safe-area-inset-top))] flex items-end pb-3 px-4 bg-midnight/30 backdrop-blur-xl border-b border-white/10 transition-all shadow-sm">
        <div className="flex items-center justify-between w-full relative">
          
          {/* Left Side: Back & Title */}
          <div className="flex items-center">
            {showBack && (
              <button 
                onClick={onBack}
                className="p-2 -ml-3 mr-1 text-white/70 active:text-white transition-colors rounded-full active:bg-white/10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
            )}
            <h1 className="text-xl font-bold tracking-tight text-white drop-shadow-md truncate max-w-[200px]">
              {title || 'MST'}
            </h1>
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
      <main className="flex-1 pt-[calc(3.5rem+env(safe-area-inset-top))] pb-[calc(6rem+env(safe-area-inset-bottom))] px-4 overflow-y-auto">
        {children}
      </main>

      {/* Bottom fade for scrolling */}
      <div className="fixed bottom-0 w-full h-12 bg-gradient-to-t from-midnight to-transparent z-10 pointer-events-none" />
    </div>
  );
};