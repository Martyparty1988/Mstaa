import React, { useState } from 'react';
import { Project, ProjectMode, PerformanceSnapshot } from '../../domain';
import { Layout } from '../../ui/Layout';
import { TimeRangePicker } from '../../ui/TimeRangePicker';

const HOURLY_ACTIVITIES = ['Roznos', 'Montáž', 'Výkop', 'Úklid', 'Čekání', 'Oprava', 'Kabely'];

interface DashboardProps {
  projects: Project[];
  onSelectProject: (p: Project, tab?: 'MAP' | 'TEAM' | 'STATS' | 'CHAT') => void;
  onCreateNew: () => void;
  onLogHourly: (activity: string, duration: number, start: string, end: string) => void;
  snapshot: PerformanceSnapshot;
}

export const Dashboard: React.FC<DashboardProps> = ({ projects, onSelectProject, onCreateNew, onLogHourly, snapshot }) => {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  // Filter top 3 activities for the compact toolbox
  const topActivities = HOURLY_ACTIVITIES.slice(0, 3);
  const otherActivities = HOURLY_ACTIVITIES.slice(3);
  const [showAllActivities, setShowAllActivities] = useState(false);

  const handleTimeConfirm = (start: string, end: string, duration: number) => {
    if (!selectedActivity) return;
    onLogHourly(selectedActivity, duration, start, end);
    setSelectedActivity(null);
    if (navigator.vibrate) navigator.vibrate([50, 50]);
  };

  const activeActivities = showAllActivities ? HOURLY_ACTIVITIES : topActivities;

  return (
    <Layout>
      <div className="flex flex-col h-full space-y-8 pb-10"> 
        
        {/* 1. HERO SECTION: PERFORMANCE INDICATOR */}
        <div className="pt-6 flex flex-col items-center justify-center min-h-[180px]">
          <div className="flex flex-col items-center animate-fade-in">
             <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">Dnešní výkon</span>
             
             {/* Main Metric */}
             <div className="relative">
                <h1 className="text-[6rem] leading-[0.85] font-black text-white tracking-tighter tabular-nums drop-shadow-2xl">
                  {Math.round(snapshot.strings)}
                </h1>
                <div className="absolute -right-8 top-4 flex flex-col items-start">
                   <span className="text-xl font-bold text-solar-start">STR</span>
                   <span className="text-[10px] text-white/30 font-mono mt-1">{Math.round(snapshot.kwp)} kWp</span>
                </div>
             </div>

             {/* Sub Metrics */}
             <div className="flex gap-8 mt-6">
                <div className="flex flex-col items-center">
                   <span className="text-xl font-bold text-white tabular-nums">{snapshot.hours.toFixed(1)}<span className="text-sm text-white/30 ml-0.5">h</span></span>
                </div>
                <div className="w-[1px] h-8 bg-white/10" />
                <div className="flex flex-col items-center">
                   <span className="text-xl font-bold text-success tabular-nums">{Math.round(snapshot.stringsPerHour)}</span>
                   <span className="text-[9px] font-bold uppercase tracking-widest text-white/20 -mt-1">/ h</span>
                </div>
             </div>
          </div>
        </div>

        {/* 2. PRIMARY ACTION: PROJECTS (The "Ticket" to work) */}
        <div className="flex-1 px-1">
          <div className="flex justify-between items-baseline mb-4 px-2">
             <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Stavba</h3>
             <button onClick={onCreateNew} className="text-[10px] font-bold text-solar-start uppercase tracking-widest bg-solar-start/10 px-3 py-1.5 rounded-lg active:bg-solar-start/20 transition-colors">
               + Nová
             </button>
          </div>

          <div className="space-y-4">
            {projects.length === 0 ? (
              <button 
                onClick={onCreateNew}
                className="w-full py-16 border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center text-white/30 active:bg-white/5 transition-colors gap-3"
              >
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-3xl grayscale opacity-50">🏗</div>
                <span className="text-sm font-bold">Založit první projekt</span>
              </button>
            ) : (
              projects.map(p => {
                 const isStrict = p.mode === ProjectMode.B_STRICT;
                 const progress = p.totalTables ? Math.round((p.completedTables / p.totalTables) * 100) : 0;
                 
                 return (
                  <div 
                    key={p.id}
                    onClick={() => onSelectProject(p, 'MAP')}
                    className="group relative bg-[#1e293b] rounded-[2rem] p-1 overflow-hidden shadow-2xl transition-transform active:scale-[0.98] border border-white/5"
                  >
                    {/* Status Strip */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isStrict ? 'bg-purple-500' : 'bg-blue-500'}`} />

                    <div className="relative p-5 pl-6 bg-gradient-to-br from-white/5 to-transparent rounded-[1.8rem]">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex flex-col">
                          <span className={`text-[9px] font-bold uppercase tracking-widest mb-2 px-2 py-1 rounded w-max ${isStrict ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
                            {isStrict ? 'Strict Mode' : 'Flexi Mode'}
                          </span>
                          <h4 className="font-bold text-2xl text-white leading-tight max-w-[80%]">{p.name}</h4>
                        </div>
                        
                        {/* Big Counter Badge */}
                        <div className="flex flex-col items-end">
                           <span className="text-3xl font-black text-white">{p.completedTables}</span>
                           <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Hotovo</span>
                        </div>
                      </div>

                      {/* Action Footer */}
                      <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/5">
                         <div className="flex items-center gap-2">
                            <div className="h-1.5 w-24 bg-black/40 rounded-full overflow-hidden">
                               <div className={`h-full rounded-full ${isStrict ? 'bg-purple-500' : 'bg-blue-500'}`} style={{ width: `${progress}%` }} />
                            </div>
                            <span className="text-[10px] font-mono text-white/40">{progress}%</span>
                         </div>
                         
                         <div className="flex items-center gap-2 text-white/60 group-active:text-white transition-colors">
                            <span className="text-xs font-bold uppercase tracking-widest">Otevřít mapu</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                            </svg>
                         </div>
                      </div>
                    </div>
                  </div>
                 );
              })
            )}
          </div>
        </div>

        {/* 3. SECONDARY ACTION: QUICK LOG (Compact Toolbox) */}
        <div className="px-3">
           <div className="bg-[#0f172a] rounded-3xl p-1.5 border border-white/5 shadow-lg flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {/* Label as a non-clickable item */}
              <div className="pl-4 pr-2 flex-shrink-0 flex flex-col justify-center">
                 <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest block transform -rotate-180" style={{ writingMode: 'vertical-rl' }}>Zapsat</span>
              </div>

              {topActivities.map(act => (
                <button
                  key={act}
                  onClick={() => setSelectedActivity(act)}
                  className="flex-1 min-w-[80px] h-14 bg-white/5 rounded-2xl flex flex-col items-center justify-center active:bg-white/10 active:scale-95 transition-all border border-white/5"
                >
                   <span className="text-[10px] font-bold text-white/80">{act}</span>
                </button>
              ))}
              
              <button 
                onClick={() => setShowAllActivities(!showAllActivities)}
                className="w-14 h-14 flex-shrink-0 bg-white/5 rounded-2xl flex items-center justify-center active:bg-white/10 text-white/40 active:text-white transition-colors"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                   <path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM10 8.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM11.5 15.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z" />
                 </svg>
              </button>
           </div>
           
           {/* Expanded list (if toggled) */}
           {showAllActivities && (
             <div className="grid grid-cols-3 gap-2 mt-2 animate-fade-in p-2">
                {otherActivities.map(act => (
                  <button
                    key={act}
                    onClick={() => { setSelectedActivity(act); setShowAllActivities(false); }}
                    className="h-12 bg-surfaceHighlight rounded-xl flex items-center justify-center text-xs font-bold text-white/60 active:bg-white/10 active:text-white"
                  >
                    {act}
                  </button>
                ))}
             </div>
           )}
        </div>

        {/* HOURLY LOG MODAL */}
        {selectedActivity && (
         <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => setSelectedActivity(null)}>
            <div className="bg-[#0f172a] w-full rounded-t-[2rem] p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] border-t border-white/10 shadow-2xl space-y-6" onClick={e => e.stopPropagation()}>
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-2xl font-black text-white flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-electric/20 flex items-center justify-center text-electric text-lg">⏱</div>
                   {selectedActivity}
                 </h3>
                 <button onClick={() => setSelectedActivity(null)} className="p-2 bg-white/5 rounded-full text-white/40">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
                 </button>
               </div>
               
               <TimeRangePicker 
                 onConfirm={handleTimeConfirm}
                 onCancel={() => setSelectedActivity(null)}
               />
            </div>
         </div>
      )}
      </div>
    </Layout>
  );
};