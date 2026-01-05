import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, title, showBack, onBack }) => {
  return (
    <div className="min-h-[100dvh] flex flex-col relative text-white selection:bg-orange-500/30">
      
      {/* Header */}
      <header className="fixed top-0 w-full z-40 h-[calc(3.5rem+env(safe-area-inset-top))] flex items-end pb-2 px-4 bg-midnight/80 backdrop-blur-xl border-b border-white/5 transition-all">
        <div className="flex items-center w-full relative">
          {showBack && (
            <button 
              onClick={onBack}
              className="p-2 -ml-3 text-white/70 active:text-white transition-colors rounded-full active:bg-white/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          )}
          <h1 className="text-lg font-bold tracking-tight ml-1 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            {title || 'MST'}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-[calc(3.5rem+env(safe-area-inset-top))] pb-[calc(5rem+env(safe-area-inset-bottom))] px-4 overflow-y-auto">
        {children}
      </main>

      {/* Bottom fade for scrolling */}
      <div className="fixed bottom-0 w-full h-8 bg-gradient-to-t from-midnight to-transparent z-10 pointer-events-none" />
    </div>
  );
};