import React from 'react';

export type GlobalTab = 'DASHBOARD' | 'PROJECTS' | 'STATS' | 'CHAT';

interface GlobalTabBarProps {
  activeTab: GlobalTab;
  onSwitch: (tab: GlobalTab) => void;
  unreadCount?: number;
  isVisible?: boolean; // New prop for visibility animation
}

export const GlobalTabBar: React.FC<GlobalTabBarProps> = ({ activeTab, onSwitch, unreadCount = 0, isVisible = true }) => {
  const getTabClass = (tab: GlobalTab) => 
    `flex-1 flex flex-col items-center justify-center h-full transition-all duration-300 relative group active:scale-95
     ${activeTab === tab ? 'text-solar-start' : 'text-white/40 hover:text-white/60'}`;

  const getIconClass = (tab: GlobalTab) => 
    `mb-1.5 p-1.5 rounded-xl transition-all duration-500 ${activeTab === tab ? 'bg-solar-start/10 shadow-[0_0_15px_rgba(34,211,238,0.25)] scale-110' : ''}`;

  return (
    <div 
      className={`fixed bottom-0 left-0 w-full z-50 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isVisible ? 'translate-y-0' : 'translate-y-[120%]'}`}
    >
       {/* Deep Ocean Glass Background */}
       <div className="absolute inset-0 bg-midnight/85 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.6)]" />
       
       <div className="relative flex justify-between items-center h-[calc(3.5rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] px-2">
      
        {/* 1. DASHBOARD */}
        <button onClick={() => onSwitch('DASHBOARD')} className={getTabClass('DASHBOARD')}>
          <div className={getIconClass('DASHBOARD')}>
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
               <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
               <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
             </svg>
          </div>
          <span className="text-[10px] font-bold tracking-widest">DOMŮ</span>
        </button>

        {/* 2. PROJEKTY */}
        <button onClick={() => onSwitch('PROJECTS')} className={getTabClass('PROJECTS')}>
          <div className={getIconClass('PROJECTS')}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15zM1.5 10.146V6a3 3 0 013-3h5.379a2.25 2.25 0 011.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 013 3v1.146A4.483 4.483 0 0019.5 9h-15a4.483 4.483 0 00-1.8.372c-.9.45-1.57.45-1.2 1.346.774z" />
            </svg>
          </div>
          <span className="text-[10px] font-bold tracking-widest">PROJEKTY</span>
        </button>

        {/* 3. STATISTIKY */}
        <button onClick={() => onSwitch('STATS')} className={getTabClass('STATS')}>
           <div className={getIconClass('STATS')}>
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
               <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0zm1.5 1.5H12v7.495a6.75 6.75 0 00-8.25-7.495zM13.5 12V4.505a6.75 6.75 0 017.495 8.25H13.5z" clipRule="evenodd" />
             </svg>
           </div>
           <span className="text-[10px] font-bold tracking-widest">STATISTIKY</span>
        </button>

        {/* 4. CHAT */}
        <button onClick={() => onSwitch('CHAT')} className={getTabClass('CHAT')}>
          <div className={`${getIconClass('CHAT')} relative`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" />
            </svg>
            {unreadCount > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-danger rounded-full border border-midnight shadow-glow animate-pulse" />}
          </div>
          <span className="text-[10px] font-bold tracking-widest">CHAT</span>
        </button>

      </div>
    </div>
  );
};
