import React from 'react';

interface TabBarProps {
  activeTab: 'MAP' | 'TEAM' | 'STATS' | 'CHAT' | 'MENU';
  onSwitch: (tab: 'MAP' | 'TEAM' | 'STATS' | 'CHAT' | 'MENU') => void;
  unreadCount?: number;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onSwitch, unreadCount = 0 }) => {
  const getTabClass = (tab: string) => 
    `flex-1 flex flex-col items-center justify-center h-full transition-all duration-200 relative group active:scale-95
     ${activeTab === tab ? 'text-solar-start' : 'text-white/30 hover:text-white/50'}`;

  const getIconContainerClass = (tab: string) =>
    `mb-1 p-1 rounded-xl transition-colors duration-300 ${activeTab === tab ? 'bg-solar-start/10' : ''}`;

  return (
    <div className="fixed bottom-0 left-0 w-full z-50">
       {/* Solid Background for clear separation */}
       <div className="absolute inset-0 bg-[#020617] border-t border-white/10 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]" />
       
       <div className="relative flex justify-between items-center h-[calc(3.5rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] px-1">
      
        <button onClick={() => onSwitch('MAP')} className={getTabClass('MAP')}>
          <div className={getIconContainerClass('MAP')}>
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
               <path fillRule="evenodd" d="M8.161 2.58a1.875 1.875 0 011.678 0l4.993 2.498c.106.052.23.052.336 0l3.869-1.935A1.875 1.875 0 0121.75 4.82v12.485c0 .71-.401 1.36-1.037 1.677l-4.875 2.437a1.875 1.875 0 01-1.676 0l-4.994-2.497a.375.375 0 00-.336 0l-3.868 1.935A1.875 1.875 0 012.25 19.18V6.695c0-.71.401-1.36 1.036-1.677l4.875-2.437zM9.6 14.857a.75.75 0 01.75-.75h2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-.75.75h-2.25a.75.75 0 01-.75-.75v-2.25z" clipRule="evenodd" />
             </svg>
          </div>
          <span className="text-[9px] font-bold tracking-wider">MAPA</span>
        </button>

        <button onClick={() => onSwitch('TEAM')} className={getTabClass('TEAM')}>
          <div className={getIconContainerClass('TEAM')}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-4.422 1.002 1.002 0 00.153-.553V15a5.996 5.996 0 00-4.979-5.943z" />
            </svg>
          </div>
          <span className="text-[9px] font-bold tracking-wider">TÝM</span>
        </button>

        {/* Center Action Button - Recessed & Glowing */}
        <button onClick={() => onSwitch('STATS')} className="relative -top-6 group z-10">
           <div className={`
             w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 transform rotate-45 border-4 border-[#020617]
             ${activeTab === 'STATS' 
               ? 'bg-solar-gradient text-white scale-110 shadow-glow' 
               : 'bg-surfaceHighlight text-white/80 group-active:scale-95'}
           `}>
              <div className="-rotate-45">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0zm1.5 1.5H12v7.495a6.75 6.75 0 00-8.25-7.495zM13.5 12V4.505a6.75 6.75 0 017.495 8.25H13.5z" clipRule="evenodd" />
                </svg>
              </div>
           </div>
        </button>

        <button onClick={() => onSwitch('CHAT')} className={getTabClass('CHAT')}>
          <div className={`${getIconContainerClass('CHAT')} relative`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" />
            </svg>
            {unreadCount > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-danger rounded-full border border-[#020617] animate-pulse" />}
          </div>
          <span className="text-[9px] font-bold tracking-wider">CHAT</span>
        </button>

        <button onClick={() => onSwitch('MENU')} className={getTabClass('MENU')}>
          <div className={getIconContainerClass('MENU')}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-[9px] font-bold tracking-wider">MENU</span>
        </button>
      </div>
    </div>
  );
};