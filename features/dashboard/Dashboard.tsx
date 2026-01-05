import React, { useState } from 'react';
import { Project, ProjectMode, PerformanceSnapshot, TableStatus } from '../../domain';
import { Layout } from '../../ui/Layout';
import { Button } from '../../ui/Button';

interface DashboardProps {
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (p: Project, tab?: 'MAP' | 'TEAM' | 'STATS' | 'CHAT') => void;
  onCreateNew: () => void;
  onLogHourly: (activity: string, duration: number, start: string, end: string) => void;
  onOpenSettings: () => void;
  onOpenTeam: () => void; // New prop
  snapshot: PerformanceSnapshot;
  viewMode?: 'OVERVIEW' | 'PROJECTS_LIST';
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  projects, 
  activeProject,
  onSelectProject, 
  onCreateNew, 
  onLogHourly, 
  onOpenSettings,
  onOpenTeam,
  snapshot,
  viewMode = 'OVERVIEW'
}) => {
  
  // Settings Icon Component
  const SettingsButton = (
    <button 
      onClick={onOpenSettings}
      className="p-2 rounded-full text-white/40 hover:text-white active:bg-white/10 transition-all border border-transparent hover:border-white/10"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
      </svg>
    </button>
  );

  // --- RENDER: DASHBOARD (OVERVIEW) ---
  if (viewMode === 'OVERVIEW') {
    const progress = activeProject 
      ? Math.round((activeProject.completedTables / (activeProject.totalTables || 1)) * 100) 
      : 0;

    return (
      <Layout title="MST" action={SettingsButton}>
        <div className="flex flex-col h-full space-y-6 pb-10 pt-4"> 
          
          {/* 1. HERO CARD: DNES */}
          <div className="px-2">
             <div className="relative overflow-hidden rounded-[32px] glass-hero transition-all">
                {/* Ambient Glows */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#06b6d4]/20 rounded-full blur-[80px] pointer-events-none mix-blend-screen" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#3b82f6]/20 rounded-full blur-[80px] pointer-events-none mix-blend-screen" />
                
                <div className="relative p-8 flex flex-col items-center text-center">
                   <div className="flex items-center gap-2 mb-2 opacity-60">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white text-shadow-sm">Dnešní výkon</span>
                   </div>

                   <div className="flex items-baseline justify-center gap-1 relative z-10 -mt-2">
                      <span className="text-[7rem] leading-[1] font-extrabold text-white tracking-tighter tabular-nums text-shadow-hero">
                         {snapshot.hours.toFixed(1)}
                      </span>
                      <span className="text-2xl font-bold text-white/50 relative -top-8">h</span>
                   </div>

                   <div className="w-16 h-[2px] bg-white/10 my-6 shadow-[0_1px_0_rgba(255,255,255,0.1)]" />

                   <div className="flex items-center gap-12">
                      <div className="flex flex-col items-center gap-1">
                         <span className="text-3xl font-extrabold text-white/95 tabular-nums tracking-tight drop-shadow-md">
                            {Math.round(snapshot.strings)}
                         </span>
                         <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.15em]">
                            Stringů
                         </span>
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20 shadow-inner-light" />
                      <div className="flex flex-col items-center gap-1">
                         <span className="text-3xl font-extrabold text-[#fbbf24] tabular-nums tracking-tight drop-shadow-md">
                            {Math.round(snapshot.kwp)}
                         </span>
                         <span className="text-[10px] font-bold text-[#fbbf24]/60 uppercase tracking-[0.15em]">
                            kWp
                         </span>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* 2. ACTIVE WORK CONTEXT */}
          <div className="px-2">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.15em] ml-2 mb-3">Právě se děje</h3>
            
            {activeProject ? (
              <div className="glass-base rounded-[32px] p-6 border border-white/10 relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50" />
                 
                 <div className="relative z-10">
                   <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-[10px] font-bold text-solar-start uppercase tracking-wider mb-1">Aktivní projekt</div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">{activeProject.name}</h2>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-xl shadow-inner-light">
                        🚧
                      </div>
                   </div>

                   {/* Progress */}
                   <div className="mb-6">
                      <div className="flex justify-between text-xs font-bold mb-2">
                        <span className="text-white/60">Postup</span>
                        <span className="text-white">{progress}%</span>
                      </div>
                      <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-solar-gradient rounded-full shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all duration-1000" style={{ width: `${progress}%` }} />
                      </div>
                      <div className="text-right mt-1.5">
                         <span className="text-[10px] font-mono text-white/40">{activeProject.completedTables} / {activeProject.totalTables} stolů</span>
                      </div>
                   </div>

                   <Button 
                     onClick={() => onSelectProject(activeProject, 'MAP')}
                     variant="primary"
                     fullWidth
                     size="lg"
                     className="shadow-glow"
                   >
                     Pokračovat v práci
                   </Button>
                 </div>
              </div>
            ) : (
              <button 
                onClick={() => onCreateNew()}
                className="w-full glass-base rounded-[32px] p-8 border border-white/10 border-dashed flex flex-col items-center gap-4 text-white/40 hover:text-white hover:bg-white/5 transition-all active:scale-[0.98]"
              >
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-3xl">🏗</div>
                <span className="font-bold">Vybrat nebo založit projekt</span>
              </button>
            )}
          </div>

          {/* 3. QUICK ACTIONS */}
          <div className="px-4 grid grid-cols-2 gap-3">
             <button 
                onClick={() => {
                   const now = new Date();
                   const startH = now.getHours().toString().padStart(2,'0');
                   const endH = (now.getHours()+1).toString().padStart(2,'0');
                   const m = now.getMinutes().toString().padStart(2,'0');
                   onLogHourly('Hodinová práce', 60, `${startH}:${m}`, `${endH}:${m}`);
                }}
                className="glass-base p-4 rounded-2xl flex items-center gap-3 active:scale-95 transition-all hover:bg-white/5 border-white/10"
             >
                <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">⏱</div>
                <div className="text-left">
                   <div className="text-sm font-bold text-white">Zapsat hodiny</div>
                   <div className="text-[9px] text-white/40 font-bold uppercase tracking-wider">Rychlý záznam</div>
                </div>
             </button>
             
             {/* Team Management Shortcut */}
             <button 
                onClick={onOpenTeam}
                className="glass-base p-4 rounded-2xl flex items-center gap-3 active:scale-95 transition-all hover:bg-white/5 border-white/10"
             >
                <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">👷</div>
                <div className="text-left">
                   <div className="text-sm font-bold text-white">Správa týmu</div>
                   <div className="text-[9px] text-white/40 font-bold uppercase tracking-wider">Karty & Platy</div>
                </div>
             </button>
          </div>

        </div>
      </Layout>
    );
  }

  // --- RENDER: PROJECTS LIST (SEPARATE VIEW) ---
  return (
    <Layout title="Projekty" action={SettingsButton}>
      <div className="flex flex-col h-full pt-4 pb-24 px-2 space-y-4">
        
        <div className="flex justify-end mb-2">
             <button onClick={onCreateNew} className="text-[10px] font-bold text-white uppercase tracking-widest bg-solar-gradient px-4 py-2 rounded-xl shadow-lg border border-white/20 active:scale-95 transition-all hover:brightness-110 flex items-center gap-2">
               <span className="text-lg leading-none mb-0.5">+</span> Nový Projekt
             </button>
        </div>

        {projects.length === 0 ? (
           <div className="flex-1 flex flex-col items-center justify-center text-white/30 space-y-4 min-h-[50vh]">
              <div className="text-5xl grayscale opacity-50">📂</div>
              <p className="font-bold">Žádné projekty</p>
           </div>
        ) : (
          projects.map(p => {
              const isStrict = p.mode === ProjectMode.B_STRICT;
              const isActive = activeProject?.id === p.id;
              
              return (
              <button 
                key={p.id}
                onClick={() => onSelectProject(p, 'MAP')}
                className={`w-full group relative overflow-hidden rounded-[28px] p-6 transition-all duration-300 active:scale-[0.98] border text-left ${isActive ? 'bg-gradient-to-br from-surfaceHighlight/80 to-surface/80 border-solar-start/30 shadow-[0_0_20px_rgba(34,211,238,0.1)]' : 'glass-base border-white/10 hover:bg-white/5'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col items-start gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`backdrop-blur-md px-2.5 py-1 rounded-lg border shadow-sm ${isStrict ? 'bg-purple-500/10 border-purple-500/20 text-purple-300' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300'}`}>
                          <span className="text-[9px] font-bold uppercase tracking-wider">
                            {isStrict ? 'Strict' : 'Flexi'}
                          </span>
                        </div>
                        {isActive && <span className="text-[9px] font-bold text-solar-start uppercase tracking-wider animate-pulse">Aktivní</span>}
                      </div>
                      
                      <h4 className={`font-bold text-xl tracking-tight leading-tight ${isActive ? 'text-white text-shadow-sm' : 'text-white/90'}`}>{p.name}</h4>
                  </div>

                  <div className="flex items-center gap-4 pl-4">
                      <div className="flex flex-col items-end">
                        <span className="text-2xl font-black text-white tabular-nums tracking-tight">{p.completedTables}</span>
                        <span className="text-[8px] font-bold text-white/40 uppercase tracking-[0.2em]">Stolů</span>
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-solar-start text-black shadow-glow' : 'bg-white/5 text-white/20 group-hover:bg-white/10'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                        </svg>
                      </div>
                  </div>
                </div>
              </button>
              );
          })
        )}
      </div>
    </Layout>
  );
}