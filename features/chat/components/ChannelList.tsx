import React from 'react';
import { Project, Worker } from '../../../domain';

interface ChannelListProps {
  projects: Project[];
  allWorkers: Worker[];
  currentUser: Worker;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export const getDmChannelId = (id1: string, id2: string) => {
  return `dm_${[id1, id2].sort().join('_')}`;
};

export const ChannelList: React.FC<ChannelListProps> = ({ projects, allWorkers, currentUser, onSelect, onClose }) => {
  return (
    <div className="flex flex-col h-full pt-[calc(1rem+env(safe-area-inset-top))] px-4 pb-20 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black text-white tracking-tight">Zprávy</h1>
        <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-white/60 active:bg-white/10">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Projects Section */}
      <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.15em] mb-3 ml-1">Projekty</h3>
      <div className="space-y-2 mb-6">
        {projects.map(p => (
          <button 
            key={p.id} 
            onClick={() => onSelect(p.id)}
            className="w-full glass-base p-4 rounded-2xl flex items-center gap-4 active:scale-[0.98] transition-all text-left border-white/10 hover:bg-white/5"
          >
             <div className="w-12 h-12 rounded-xl bg-solar-start/10 text-solar-start border border-solar-start/20 flex items-center justify-center font-bold text-lg shadow-glow">
               {p.name.substring(0, 2).toUpperCase()}
             </div>
             <div className="flex-1">
               <div className="font-bold text-white text-base">{p.name}</div>
               <div className="text-xs text-white/40 font-medium truncate">Klikni pro otevření chatu...</div>
             </div>
          </button>
        ))}
      </div>

      {/* Direct Messages Section */}
      <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.15em] mb-3 ml-1">Soukromé zprávy</h3>
      <div className="space-y-2">
        {allWorkers.filter(w => w.id !== currentUser.id).map(w => {
           const dmId = getDmChannelId(currentUser.id, w.id);
           return (
            <button 
              key={w.id} 
              onClick={() => onSelect(dmId)}
              className="w-full glass-base p-3 rounded-2xl flex items-center gap-3 active:scale-[0.98] transition-all text-left border-white/5 hover:bg-white/5"
            >
               <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-white shadow-inner-light" style={{ backgroundColor: w.avatarColor }}>
                 {w.name.substring(0, 1)}
               </div>
               <div className="flex-1">
                 <div className="font-bold text-white text-sm">{w.name}</div>
                 <div className="text-[10px] text-white/30 uppercase tracking-wider font-bold">{w.role}</div>
               </div>
            </button>
           );
        })}
      </div>
    </div>
  );
};
