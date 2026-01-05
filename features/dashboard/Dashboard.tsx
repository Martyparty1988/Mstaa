import React, { useState, useMemo } from 'react';
import { Project, ProjectMode, PerformanceSnapshot, TableStatus, WorkLog, Worker, calculateEarnings } from '../../app/domain';
import { Layout } from '../../ui/Layout';
import { Button } from '../../ui/Button';

interface DashboardProps {
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (p: Project, tab?: 'MAP' | 'TEAM' | 'STATS' | 'CHAT') => void;
  onCreateNew: () => void;
  onLogHourly: (activity: string, duration: number, start: string, end: string) => void;
  onOpenSettings: () => void;
  onOpenTeam: () => void;
  onOpenWallet: () => void;
  snapshot: PerformanceSnapshot;
  viewMode?: 'OVERVIEW' | 'PROJECTS_LIST';
  currentUser?: Worker;
  workLogs?: WorkLog[]; 
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  projects, 
  activeProject,
  onSelectProject, 
  onCreateNew, 
  onLogHourly, 
  onOpenSettings,
  onOpenTeam,
  onOpenWallet,
  snapshot,
  viewMode = 'OVERVIEW',
  currentUser,
  workLogs = []
}) => {
  
  const todayEarnings = useMemo(() => {
     if (!currentUser) return 0;
     const now = new Date();
     const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
     const todayLogs = workLogs.filter(l => l.workerId === currentUser.id && l.timestamp >= startOfToday);
     return calculateEarnings(todayLogs, currentUser, projects).total;
  }, [currentUser, workLogs, projects]);

  const SettingsButton = (
    <button 
      onClick={onOpenSettings}
      className="p-2.5 rounded-2xl text-white/40 hover:text-white active:bg-white/10 transition-all glass-base border-white/5"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
      </svg>
    </button>
  );

  if (viewMode === 'OVERVIEW') {
    const progress = activeProject 
      ? Math.round((activeProject.completedTables / (activeProject.totalTables || 1)) * 100) 
      : 0;

    return (
      <Layout title="MST" action={SettingsButton}>
        <div className="flex flex-col h-full space-y-5 pb-10 pt-2"> 
          
          {/* HUB PERFORMANCE */}
          <div className="px-1">
             <div className="relative overflow-hidden rounded-[36px] glass-hero transition-all group shadow-xl">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="absolute inset-0 solar-shimmer opacity-20 pointer-events-none" />
                
                <div className="relative p-7 flex flex-col items-center">
                   <div className="w-full flex justify-between items-center mb-5">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-solar-start text-glow">Dnešní výkon</span>
                      <div className="flex items-center gap-1.5 bg-solar-start/10 px-2 py-0.5 rounded-lg border border-solar-start/10">
                         <span className="w-1 h-1 rounded-full bg-solar-start animate-pulse" />
                         <span className="text-[9px] font-black text-solar-start uppercase">Live</span>
                      </div>
                   </div>

                   <div className="w-full flex items-center justify-between">
                      <div className="flex flex-col items-start">
                         <div className="flex items-baseline gap-1">
                            <span className="text-6xl font-black text-white tabular-nums tracking-tighter drop-shadow-lg">
                               {snapshot.hours.toFixed(1)}
                            </span>
                            <span className="text-lg font-black text-white/30 uppercase tracking-widest relative -top-1">h</span>
                         </div>
                         <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">Odpracováno</span>
                      </div>

                      <div className="flex flex-col gap-4 pl-6 border-l border-white/5">
                         <div className="flex flex-col">
                            <span className="text-2xl font-black text-white tabular-nums tracking-tight">
                               {Math.round(snapshot.strings)}
                            </span>
                            <span className="text-[9px] font-bold text-white/20 uppercase tracking-wider">Stringů</span>
                         </div>
                         <div className="flex flex-col">
                            <span className="text-2xl font-black text-gold text-glow tabular-nums tracking-tight">
                               {Math.round(snapshot.kwp)}
                            </span>
                            <span className="text-[9px] font-bold text-gold/30 uppercase tracking-wider">kWp Výkon</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* ACTIVE PROJECT */}
          <div className="px-1">
            <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-4 mb-3">Aktivní stavba</h3>
            
            {activeProject ? (
              <div className="glass-base rounded-[36px] p-6 relative overflow-hidden group border-white/5 shadow-lg animate-fade-in">
                 <div className="absolute top-0 right-0 w-28 h-28 bg-solar-start/5 rounded-full blur-3xl opacity-30" />
                 
                 <div className="relative z-10 flex flex-col gap-5">
                   <div className="flex justify-between items-center">
                      <div className="min-w-0 pr-4">
                        <h2 className="text-xl font-black text-white tracking-tight leading-tight truncate">{activeProject.name}</h2>
                        <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-1">Režim: {activeProject.mode}</div>
                      </div>
                      <div className="w-12 h-12 rounded-2xl glass-base flex flex-shrink-0 items-center justify-center text-xl shadow-inner-light shadow-specular">
                        🏗
                      </div>
                   </div>

                   <div>
                      <div className="flex justify-between text-[10px] font-black mb-2.5 px-1">
                        <span className="text-white/30 uppercase tracking-widest">Postup prací</span>
                        <span className="text-solar-start text-glow font-black">{progress}%</span>
                      </div>
                      <div className="h-3 bg-black/40 rounded-full p-0.5 border border-white/5 shadow-inner">
                        <div className="h-full bg-solar-gradient rounded-full transition-all duration-1000 relative overflow-hidden" style={{ width: `${progress}%` }}>
                           <div className="absolute inset-0 solar-shimmer opacity-40" />
                        </div>
                      </div>
                      <div className="flex justify-between mt-2.5 px-1">
                         <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Zbývá: {activeProject.totalTables ? activeProject.totalTables - activeProject.completedTables : 0} st.</span>
                         <span className="text-[9px] font-mono text-white/40">{activeProject.completedTables} / {activeProject.totalTables}</span>
                      </div>
                   </div>

                   <Button 
                     onClick={() => onSelectProject(activeProject, 'MAP')}
                     variant="primary"
                     fullWidth
                     size="md"
                     className="shadow-glow h-13 rounded-2xl text-xs uppercase tracking-widest font-black"
                   >
                     Mapa stavby
                   </Button>
                 </div>
              </div>
            ) : (
              <div className="glass-base rounded-[36px] p-8 text-center border-white/5 bg-white/5 animate-fade-in">
                 <div className="w-14 h-14 rounded-3xl bg-white/5 mx-auto flex items-center justify-center text-3xl mb-3 opacity-30">🏗</div>
                 <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">Žádný aktivní projekt</p>
                 <span className="text-[9px] text-white/10 font-bold mt-1 inline-block uppercase tracking-widest">Vyberte v projektech</span>
              </div>
            )}
          </div>

          {/* BENTO GRID ACTIONS */}
          <div className="px-1 grid grid-cols-2 gap-4">
             <button 
                onClick={() => {
                   const now = new Date();
                   const startH = now.getHours().toString().padStart(2,'0');
                   const endH = (now.getHours()+1).toString().padStart(2,'0');
                   const m = now.getMinutes().toString().padStart(2,'0');
                   onLogHourly('Hodinová práce', 60, `${startH}:${m}`, `${endH}:${m}`);
                }}
                className="glass-base p-5 rounded-[32px] flex flex-col items-center text-center gap-3 ios-spring border-white/5 active:scale-95 shadow-md"
             >
                <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-500 flex flex-shrink-0 items-center justify-center border border-amber-500/10 text-xl shadow-specular">⏱</div>
                <div>
                   <div className="text-xs font-black text-white">Hodinová</div>
                   <div className="text-[8px] text-white/20 font-black uppercase tracking-widest mt-0.5">Rychlý log</div>
                </div>
             </button>
             
             <button 
                onClick={onOpenWallet}
                className="glass-base p-5 rounded-[32px] flex flex-col items-center text-center gap-3 ios-spring border-white/5 active:scale-95 shadow-md"
             >
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-400 flex flex-shrink-0 items-center justify-center border border-emerald-500/10 text-xl shadow-glow">💰</div>
                <div>
                   <div className="text-xs font-black text-white">Peněženka</div>
                   <div className="text-[9px] text-emerald-400 font-black uppercase tracking-widest mt-0.5">{todayEarnings.toFixed(0)}€</div>
                </div>
             </button>

             <button 
                onClick={onOpenTeam}
                className="glass-base p-4.5 rounded-[32px] flex items-center gap-5 ios-spring border-white/5 col-span-2 px-7 active:scale-[0.98] shadow-md"
             >
                <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-500 flex flex-shrink-0 items-center justify-center border border-blue-500/10 text-xl shadow-specular">👷</div>
                <div className="text-left flex-1">
                   <div className="text-sm font-black text-white tracking-tight">Správa týmu</div>
                   <div className="text-[9px] text-white/20 font-black uppercase tracking-widest">Odměny a lidé</div>
                </div>
                <div className="opacity-10">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" /></svg>
                </div>
             </button>
          </div>

        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Projekty" action={SettingsButton}>
      <div className="flex flex-col h-full pt-4 pb-24 px-1 space-y-5">
        
        <div className="flex justify-between items-center mb-1 px-3">
             <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Moje stavby</h3>
             <button onClick={onCreateNew} className="text-[9px] font-black text-white uppercase tracking-widest bg-solar-gradient px-4 py-2 rounded-xl shadow-glow border border-white/20 active:scale-95 transition-all">
               + Nový projekt
             </button>
        </div>

        {projects.length === 0 ? (
           <div className="flex-1 flex flex-col items-center justify-center space-y-5 pt-10">
              <button 
                onClick={() => onCreateNew()}
                className="w-full glass-base rounded-[36px] p-10 border-2 border-white/5 border-dashed flex flex-col items-center gap-5 text-white/20 hover:text-white hover:bg-white/5 transition-all group active:scale-95"
              >
                <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-3xl group-hover:bg-solar-start/10 transition-colors">➕</div>
                <span className="font-black uppercase tracking-widest text-xs">Vytvořit první projekt</span>
              </button>
           </div>
        ) : (
          <div className="space-y-4">
            {projects.map(p => {
                const isStrict = p.mode === ProjectMode.B_STRICT;
                const isActive = activeProject?.id === p.id;
                
                return (
                <button 
                  key={p.id}
                  onClick={() => onSelectProject(p, 'MAP')}
                  className={`w-full group relative overflow-hidden rounded-[32px] p-6 transition-all duration-300 active:scale-[0.98] border text-left animate-fade-in ${isActive ? 'bg-surfaceHighlight/30 border-solar-start/30 shadow-glow' : 'glass-base border-white/5'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col items-start gap-2.5">
                        <div className="flex items-center gap-2">
                          <div className={`px-2 py-0.5 rounded-lg border text-[8px] font-black uppercase tracking-widest ${isStrict ? 'bg-purple-500/10 border-purple-500/20 text-purple-300' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300'}`}>
                            {isStrict ? 'Strict' : 'Flex'}
                          </div>
                          {isActive && <span className="text-[8px] font-black text-solar-start uppercase tracking-widest animate-pulse">Aktivní</span>}
                        </div>
                        <h4 className="font-black text-xl tracking-tight text-white truncate max-w-[210px]">{p.name}</h4>
                    </div>
                    <div className="flex items-center gap-4 pl-2">
                        <div className="flex flex-col items-end">
                          <span className="text-2xl font-black text-white tabular-nums tracking-tighter">{p.completedTables}</span>
                          <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Stolů</span>
                        </div>
                    </div>
                  </div>
                </button>
                );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}