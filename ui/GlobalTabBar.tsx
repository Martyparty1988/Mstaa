import React from 'react';

export type GlobalTab = 'DASHBOARD' | 'PROJECTS' | 'STATS' | 'CHAT';

interface GlobalTabBarProps {
  activeTab: GlobalTab;
  onSwitch: (tab: GlobalTab) => void;
  unreadCount?: number;
  isVisible?: boolean; 
}

export const GlobalTabBar: React.FC<GlobalTabBarProps> = ({ activeTab, onSwitch, unreadCount = 0, isVisible = true }) => {
  const getTabClass = (tab: GlobalTab) => 
    `flex-1 flex flex-col items-center justify-center h-full transition-all duration-300 relative group active:scale-90 touch-manipulation
     ${activeTab === tab ? 'text-solar-start' : 'text-white/40 hover:text-white/60'}`;

  const getIconContainerClass = (tab: GlobalTab) => 
    `mb-1.5 p-1.5 rounded-2xl transition-all duration-500 relative
     ${activeTab === tab ? 'bg-solar-start/10 shadow-[0_0_20px_rgba(34,211,238,0.3)] translate-y-[-2px]' : ''}`;

  return (
    <div 
      className={`fixed bottom-0 left-0 w-full z-50 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isVisible ? 'translate-y-0' : 'translate-y-[120%]'}`}
    >
       {/* Deep Ocean Glass Background */}
       <div className="absolute inset-0 bg-midnight/85 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.6)]" />
       
       <div className="relative flex justify-between items-center h-[calc(4rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] px-2">
      
        {/* 1. DASHBOARD */}
        <button onClick={() => onSwitch('DASHBOARD')} className={getTabClass('DASHBOARD')}>
          <div className={getIconContainerClass('DASHBOARD')}>
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 transition-transform duration-300">
               {activeTab === 'DASHBOARD' ? (
                 /* ACTIVE: Solid Home */
                 <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
               ) : (
                 /* INACTIVE: Outline Home */
                 <path fillRule="evenodd" d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69zM12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" clipRule="evenodd" opacity="0.8" />
               )}
               {activeTab === 'DASHBOARD' && <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />}
             </svg>
          </div>
          <span className={`text-[10px] font-bold tracking-widest transition-opacity duration-300 ${activeTab === 'DASHBOARD' ? 'opacity-100' : 'opacity-70'}`}>DOMŮ</span>
        </button>

        {/* 2. PROJEKTY */}
        <button onClick={() => onSwitch('PROJECTS')} className={getTabClass('PROJECTS')}>
          <div className={getIconContainerClass('PROJECTS')}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 transition-transform duration-300">
               {activeTab === 'PROJECTS' ? (
                 /* ACTIVE: Solid Stack */
                 <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625z" />
               ) : (
                 /* INACTIVE: Outline Stack */
                 <path fillRule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 013.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 013.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 01-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875zM12.75 12a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V18a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V12z" clipRule="evenodd" opacity="0.8" />
               )}
               {activeTab === 'PROJECTS' && <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />}
            </svg>
          </div>
          <span className={`text-[10px] font-bold tracking-widest transition-opacity duration-300 ${activeTab === 'PROJECTS' ? 'opacity-100' : 'opacity-70'}`}>PROJEKTY</span>
        </button>

        {/* 3. STATISTIKY */}
        <button onClick={() => onSwitch('STATS')} className={getTabClass('STATS')}>
           <div className={getIconContainerClass('STATS')}>
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 transition-transform duration-300">
               {activeTab === 'STATS' ? (
                 /* ACTIVE: Solid Bar Chart */
                 <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0zm1.5 1.5H12v7.495a6.75 6.75 0 00-8.25-7.495zM13.5 12V4.505a6.75 6.75 0 017.495 8.25H13.5z" clipRule="evenodd" />
               ) : (
                  /* INACTIVE: Outline Chart */
                 <path fillRule="evenodd" d="M3 13.75C3 16.888 3 18.457 3.975 19.432 4.95 20.407 6.518 20.407 9.656 20.407h4.688c3.138 0 4.706 0 5.681-.975C21 18.457 21 16.888 21 13.75v-3.5c0-3.138 0-4.707-.975-5.682C19.05 3.593 17.482 3.593 14.344 3.593h-4.688c-3.138 0-4.706 0-5.681.975C3 5.543 3 7.112 3 10.25v3.5zm1.5-3.5c0-2.347 0-3.52.731-4.25.731-.73 1.905-.73 4.25-.73h.27a.75.75 0 01.75.75v9.982a.75.75 0 01-.75.748h-.27c-2.345 0-3.52 0-4.25-.73-.731-.73-.731-1.904-.731-4.25v-1.52zm7.5 5.5v-6.98a.75.75 0 01.75-.75h.268c2.346 0 3.52 0 4.25.73.731.73.731 1.904.731 4.25v1.52c0 2.346 0 3.52-.73 4.25-.732.73-1.905.73-4.25.73h-.27a.75.75 0 01-.75-.748z" clipRule="evenodd" opacity="0.8" />
               )}
             </svg>
           </div>
           <span className={`text-[10px] font-bold tracking-widest transition-opacity duration-300 ${activeTab === 'STATS' ? 'opacity-100' : 'opacity-70'}`}>STATISTIKY</span>
        </button>

        {/* 4. CHAT */}
        <button onClick={() => onSwitch('CHAT')} className={getTabClass('CHAT')}>
          <div className={`${getIconContainerClass('CHAT')} relative`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 transition-transform duration-300">
              {activeTab === 'CHAT' ? (
                /* ACTIVE: Solid Bubbles */
                <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" />
              ) : (
                /* INACTIVE: Outline Bubbles */
                <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.438l-3.053 2.938a1.5 1.5 0 01-2.23 0L7.34 17.168a49.156 49.156 0 01-2.492-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97zM6.75 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H7.5z" clipRule="evenodd" opacity="0.8" />
              )}
            </svg>
            {unreadCount > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-danger rounded-full border border-midnight shadow-glow animate-pulse" />}
          </div>
          <span className={`text-[10px] font-bold tracking-widest transition-opacity duration-300 ${activeTab === 'CHAT' ? 'opacity-100' : 'opacity-70'}`}>CHAT</span>
        </button>

      </div>
    </div>
  );
};