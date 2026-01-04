import React, { useState } from 'react';
import { Project, ProjectMode, WorkType, TableStatus } from '../types';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { TimeRangePicker } from '../components/TimeRangePicker';

// --- CONFIG ---
const HOURLY_ACTIVITIES = ['Roznos', 'Montáž', 'Výkop', 'Úklid', 'Čekání', 'Oprava', 'Kabely'];

interface DashboardProps {
  projects: Project[];
  onSelectProject: (p: Project, tab?: 'MAP' | 'TEAM' | 'STATS' | 'CHAT') => void;
  onCreateNew: () => void;
  onLogHourly: (activity: string, duration: number, start: string, end: string) => void;
  todayStats?: { count: number; timeStr: string };
}

export const Dashboard: React.FC<DashboardProps> = ({ projects, onSelectProject, onCreateNew, onLogHourly, todayStats }) => {
  const lastProject = projects.length > 0 ? projects[0] : null;
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  const handleTimeConfirm = (start: string, end: string, duration: number) => {
    if (!selectedActivity) return;
    onLogHourly(selectedActivity, duration, start, end);
    setSelectedActivity(null);
    if (navigator.vibrate) navigator.vibrate([50, 50]);
  };

  return (
    <Layout>
      <div className="space-y-8 pb-8"> 
        
        {/* 1. TOP SECTION: Today's Context (Hero) */}
        <div className="pt-4 relative">
          <div className="flex justify-between items-end mb-4 px-1">
            <div>
              <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 tracking-tight">Dnes</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2.5 py-1 rounded-lg bg-electric/10 text-[11px] font-bold text-electric border border-electric/20">
                  7:00 – 17:00
                </span>
                <span className="text-xs text-white/40 font-medium">Standardní směna</span>
              </div>
            </div>
            <div className="text-right">
               <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Výkon</div>
               <div className="text-3xl font-black text-solar-start text-shadow">{todayStats?.count || 0} <span className="text-sm font-bold text-white/40">st.</span></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
             <div className="glass-card p-4 rounded-3xl flex flex-col justify-center items-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
                <span className="text-3xl font-bold text-white relative z-10">{todayStats?.timeStr || "0h"}</span>
                <span className="text-[10px] uppercase text-white/40 tracking-widest font-bold mt-1 relative z-10">Odpracováno</span>
             </div>
             <div className="glass-card p-4 rounded-3xl flex flex-col justify-center items-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
                 <span className="text-3xl font-bold text-success relative z-10">100%</span>
                 <span className="text-[10px] uppercase text-white/40 tracking-widest font-bold mt-1 relative z-10">Efektivita</span>
             </div>
          </div>
        </div>

        {/* 2. HOURLY WORK SHORTCUTS */}
        <div>
           <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-1 h-1 rounded-full bg-electric" />
              <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest">Rychlý zápis</h3>
           </div>
           
           <div className="grid grid-cols-4 gap-2">
              {HOURLY_ACTIVITIES.map(act => (
                <button
                  key={act}
                  onClick={() => setSelectedActivity(act)}
                  className="glass p-0 rounded-2xl py-3 flex flex-col items-center justify-center active:bg-electric active:border-electric transition-all group hover:bg-white/5"
                >
                   <span className="text-[11px] font-bold text-white/80 group-active:text-white">{act}</span>
                </button>
              ))}
           </div>
        </div>

        {/* 3. MIDDLE: Projects List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
             <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-solar-start" />
                <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest">Moje Projekty</h3>
             </div>
            <button onClick={onCreateNew} className="text-solar-start text-xs font-bold px-3 py-1.5 bg-solar-start/10 rounded-lg border border-solar-start/20 active:bg-solar-start/20 transition-colors">+ Nový</button>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-16 text-white/20 border-2 border-dashed border-white/5 rounded-3xl bg-white/5">
              <div className="text-4xl mb-2">🏗</div>
              Žádné aktivní stavby
            </div>
          ) : (
            projects.map(p => (
              <div 
                key={p.id}
                className="group relative overflow-hidden bg-surface rounded-3xl border border-white/5 transition-all shadow-lg hover:border-white/10"
              >
                {/* Gradient Top Border */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />

                {/* Main Card Area - Opens Map */}
                <div 
                   onClick={() => onSelectProject(p, 'MAP')}
                   className="p-6 pb-4 active:bg-white/5 cursor-pointer relative z-10"
                >
                  <div className="flex justify-between items-start">
                     <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <h4 className="font-bold text-xl text-white group-active:text-solar-start transition-colors leading-tight">{p.name}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${p.mode === ProjectMode.B_STRICT ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                             {p.mode === ProjectMode.B_STRICT ? 'PROJEKTOVÝ' : 'FLEXIBILNÍ'}
                          </span>
                          <span className="text-xs text-white/40">35% hotovo</span>
                        </div>
                     </div>
                     {/* Circular Progress Badge */}
                     <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center justify-center">
                        <span className="text-lg font-bold text-white">12</span>
                     </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-5 h-1.5 bg-slate-900 rounded-full w-full overflow-hidden shadow-inner">
                     <div className="h-full bg-gradient-to-r from-solar-start to-solar-end w-[35%] shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                  </div>
                </div>

                {/* Quick Action Bar (Glass style) */}
                <div className="grid grid-cols-4 border-t border-white/5 bg-black/20 divide-x divide-white/5 backdrop-blur-sm">
                   {[
                     { id: 'MAP', icon: <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308.066l.002-.001.006.003.018.008a5.741 5.741 0 00.281.14c.186.096.446.24.757.433.62.384 1.45.96 2.144 1.832a.75.75 0 001.173-.896c-.663-.833-1.424-1.378-1.99-1.728a4.241 4.241 0 00-.63-.332l-.02-.009a.75.75 0 00-.75 0l-4.5 2.5a.75.75 0 00.75 1.298l3.636-2.02zM10 2a6 6 0 100 12 6 6 0 000-12zm-3.25 6a.75.75 0 01.75-.75h5a.75.75 0 010 1.5h-5a.75.75 0 01-.75-.75z" /> },
                     { id: 'TEAM', icon: <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z" /> },
                     { id: 'STATS', icon: <path d="M15.5 2A1.5 1.5 0 0014 3.5v13a1.5 1.5 0 001.5 1.5h1a1.5 1.5 0 001.5-1.5v-13A1.5 1.5 0 0016.5 2h-1zM9.5 6A1.5 1.5 0 008 7.5v9A1.5 1.5 0 009.5 18h1a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0010.5 6h-1zM3.5 10A1.5 1.5 0 002 11.5v5A1.5 1.5 0 003.5 18h1A1.5 1.5 0 006 16.5v-5A1.5 1.5 0 004.5 10h-1z" /> },
                     { id: 'CHAT', icon: <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 001.28.53l3.58-3.579a.78.78 0 01.527-.224 41.202 41.202 0 003.444-.33c1.436-.23 2.429-1.487 2.429-2.902V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2zm0 8.875a.75.75 0 110-1.5.75.75 0 010 1.5zm2.25-.75a.75.75 0 10-1.5 0 .75.75 0 001.5 0zm3.75.75a.75.75 0 110-1.5.75.75 0 010 1.5z" clipRule="evenodd" /> }
                   ].map(btn => (
                     <button 
                       key={btn.id} 
                       onClick={(e) => { e.stopPropagation(); onSelectProject(p, btn.id as any); }} 
                       className="py-4 flex items-center justify-center active:bg-white/10 hover:bg-white/5 transition-colors group/icon"
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-white/40 group-hover/icon:text-white group-hover/icon:scale-110 transition-all">
                          {btn.icon}
                        </svg>
                     </button>
                   ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. MODAL: TIME SELECTION FOR HOURLY */}
      {selectedActivity && (
         <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedActivity(null)}>
            <div className="bg-surface w-full rounded-t-3xl p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] border-t border-white/10 shadow-2xl space-y-6" onClick={e => e.stopPropagation()}>
               <div className="flex justify-between items-center">
                 <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                   <span className="w-8 h-8 rounded-full bg-electric/20 flex items-center justify-center text-electric text-sm">⏱</span>
                   {selectedActivity}
                 </h3>
               </div>
               
               <TimeRangePicker 
                 onConfirm={handleTimeConfirm}
                 onCancel={() => setSelectedActivity(null)}
               />
               
               {lastProject && (
                  <div className="text-center text-[10px] text-white/30 uppercase tracking-widest font-bold">
                    Zapíše se do: <span className="text-white">{lastProject.name}</span>
                  </div>
               )}
            </div>
         </div>
      )}
    </Layout>
  );
};