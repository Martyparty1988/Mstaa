import React, { useState, useRef } from 'react';
import { Layout } from '../../ui/Layout';
import { Worker, WorkerRole, Project } from '../../domain';

interface SettingsProps {
  onBack: () => void;
  currentUser: Worker;
  onUpdateUser: (w: Worker) => void;
  activeProject: Project | null;
  onResetApp: () => void;
  onImportApp: (json: string, mode: 'REPLACE' | 'MERGE') => void;
  onGetExportData: () => string;
  // New:
  onDownloadBackup?: () => void;
}

const ROLES = [
  { id: WorkerRole.LEADER, label: 'Leader' },
  { id: WorkerRole.MONTEUR, label: 'Montér' },
  { id: WorkerRole.STRINGER, label: 'Stringař' },
  { id: WorkerRole.HELPER, label: 'Pomocník' },
];

export const Settings: React.FC<SettingsProps> = ({ 
  onBack, 
  currentUser, 
  onUpdateUser, 
  activeProject, 
  onResetApp,
  onImportApp,
  onGetExportData,
  onDownloadBackup
}) => {
  // State for Name Edit
  const [name, setName] = useState(currentUser.name);
  const [tapCount, setTapCount] = useState(0);
  const [showAdmin, setShowAdmin] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMode, setImportMode] = useState<'REPLACE' | 'MERGE'>('MERGE');

  const handleNameBlur = () => {
    if (name.trim() !== currentUser.name) {
      onUpdateUser({ ...currentUser, name: name.trim() });
    }
  };

  const handleRoleChange = (role: WorkerRole) => {
    onUpdateUser({ ...currentUser, role });
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const handleVersionTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    if (newCount === 5) {
      setShowAdmin(true);
      if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    }
  };

  const handleDownloadBackup = () => {
    if (onDownloadBackup) {
      onDownloadBackup();
    } else {
      // Fallback if not provided (legacy)
      const data = onGetExportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `MST_Legacy_Backup_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Confirm action based on mode
    if (importMode === 'REPLACE') {
      if (!confirm("POZOR! Režim 'Nahradit' SMAŽE všechna současná data a nahradí je zálohou. Pokračovat?")) {
        // Reset file input so user can try again
        e.target.value = '';
        return;
      }
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) onImportApp(content, importMode);
    };
    reader.readAsText(file);
  };

  const triggerImport = (mode: 'REPLACE' | 'MERGE') => {
    setImportMode(mode);
    // Tiny delay to ensure state update before click
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 50);
  };

  const handleReset = () => {
    if (confirm("OPRAVDU SMAZAT VŠECHNA DATA? Tato akce je nevratná.")) {
      if (confirm("Jste si naprosto jistí? Aplikace bude jako nová.")) {
         onResetApp();
      }
    }
  };

  return (
    <Layout title="Nastavení" showBack onBack={onBack}>
       <div className="space-y-8 pt-6 pb-20">
          
          {/* 1. USER PROFILE */}
          <section>
             <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.15em] px-2 mb-3">Můj Profil</h3>
             <div className="glass-base rounded-[32px] p-6 border border-white/10 space-y-6">
                
                {/* Avatar & Name */}
                <div className="flex items-center gap-4">
                   <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-slate-900 shadow-lg" style={{ backgroundColor: currentUser.avatarColor || '#f59e0b' }}>
                      {currentUser.name.charAt(0)}
                   </div>
                   <div className="flex-1">
                      <label className="text-[10px] font-bold uppercase text-white/40 tracking-wider">Jméno</label>
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={handleNameBlur}
                        className="w-full bg-transparent text-xl font-bold text-white focus:outline-none border-b border-transparent focus:border-solar-start transition-colors placeholder-white/20"
                      />
                   </div>
                </div>

                {/* Role Selector */}
                <div>
                   <label className="text-[10px] font-bold uppercase text-white/40 tracking-wider mb-2 block">Role</label>
                   <div className="grid grid-cols-2 gap-2">
                      {ROLES.map(r => (
                        <button 
                          key={r.id}
                          onClick={() => handleRoleChange(r.id)}
                          className={`p-3 rounded-xl text-xs font-bold transition-all border ${currentUser.role === r.id ? 'bg-solar-gradient text-white border-transparent shadow-glow' : 'bg-white/5 text-white/40 border-white/5'}`}
                        >
                          {r.label}
                        </button>
                      ))}
                   </div>
                </div>
             </div>
          </section>

          {/* 2. PROJECT RULES (READ ONLY) */}
          <section>
             <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.15em] px-2 mb-3">Pravidla (Read-Only)</h3>
             <div className="glass-base rounded-[32px] overflow-hidden border border-white/10 opacity-80 select-none grayscale-[0.3]">
                <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
                   <span className="text-sm font-bold text-white">1 Panel</span>
                   <span className="font-mono text-solar-start font-bold">700 W</span>
                </div>
                <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
                   <span className="text-sm font-bold text-white">1 String</span>
                   <span className="font-mono text-solar-start font-bold">28 Panelů (19.6 kWp)</span>
                </div>
                
                <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
                   <span className="text-sm font-bold text-white">Velký stůl (L)</span>
                   <span className="font-mono text-white/60 font-bold">2.0 Stringy</span>
                </div>
                <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
                   <span className="text-sm font-bold text-white">Střední stůl (M)</span>
                   <span className="font-mono text-white/60 font-bold">1.5 Stringy</span>
                </div>
                <div className="p-4 bg-white/5 flex justify-between items-center">
                   <span className="text-sm font-bold text-white">Malý stůl (S)</span>
                   <span className="font-mono text-white/60 font-bold">1.0 String</span>
                </div>
             </div>
             <p className="px-4 mt-2 text-[10px] text-white/30 italic">
               Tato pravidla jsou pevně daná strukturou projektu a nelze je měnit pracovníkem.
             </p>
          </section>

          {/* 3. APP INFO */}
          <section>
             <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.15em] px-2 mb-3">Aplikace</h3>
             <div className="glass-base rounded-[32px] overflow-hidden border border-white/10">
                <div className="flex justify-between items-center p-5 border-b border-white/5">
                   <span className="text-white font-bold tracking-wide">Aktivní Projekt</span>
                   <span className="text-white/60 text-xs font-bold truncate max-w-[150px]">{activeProject ? activeProject.name : 'Žádný'}</span>
                </div>
                 <div className="flex justify-between items-center p-5">
                   <span className="text-white font-bold tracking-wide">Data</span>
                   <span className="text-success text-[10px] font-bold bg-success/10 px-2 py-1 rounded-lg border border-success/20 flex items-center gap-1.5 uppercase tracking-wider">
                     <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shadow-[0_0_5px_currentColor]" />
                     Offline Storage
                   </span>
                </div>
             </div>
          </section>

          {/* 4. ADMIN AREA (Hidden or Active) */}
          {showAdmin && (
            <section className="animate-fade-in pt-4 border-t border-white/10 mt-8">
               <h3 className="text-xs font-bold text-danger uppercase tracking-[0.15em] px-2 mb-3 flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
                 Admin: Správa dat
               </h3>
               
               <div className="glass-base rounded-[32px] p-6 border border-white/10 space-y-6">
                  
                  {/* Backup */}
                  <div>
                    <h4 className="text-white font-bold text-sm mb-2">Záloha</h4>
                    <button onClick={handleDownloadBackup} className="w-full glass-base p-4 rounded-2xl border border-white/10 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.965 3.129V2.75z" /><path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" /></svg>
                      Stáhnout zálohu (JSON)
                    </button>
                    <p className="text-[10px] text-white/30 mt-2 px-1">Obsahuje projekty, logy i nastavení týmu.</p>
                  </div>

                  {/* Import */}
                  <div>
                    <h4 className="text-white font-bold text-sm mb-2">Obnova & Import</h4>
                    <div className="grid grid-cols-2 gap-3">
                       <button onClick={() => triggerImport('MERGE')} className="glass-base p-4 rounded-2xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 font-bold text-xs uppercase tracking-wider shadow-lg">
                          Sloučit<br/>(Merge)
                       </button>
                       <button onClick={() => triggerImport('REPLACE')} className="glass-base p-4 rounded-2xl border border-danger/30 bg-danger/10 hover:bg-danger/20 text-danger font-bold text-xs uppercase tracking-wider shadow-lg">
                          Nahradit<br/>(Replace)
                       </button>
                    </div>
                    <p className="text-[10px] text-white/30 mt-2 px-1">
                      <strong className="text-blue-300">Sloučit:</strong> Přidá nová data k současným.<br/>
                      <strong className="text-danger">Nahradit:</strong> SMAŽE současná data a nahraje zálohu (Recovery).
                    </p>
                  </div>

                  {/* Reset */}
                  <div className="pt-4 border-t border-white/5">
                     <button onClick={handleReset} className="w-full py-4 text-danger/60 hover:text-danger font-bold text-xs uppercase tracking-widest transition-colors">
                        Resetovat celou aplikaci
                     </button>
                  </div>

                  <input type="file" ref={fileInputRef} onChange={handleImportFile} className="hidden" accept=".json" />
               </div>
            </section>
          )}

          {/* Footer / Version Trigger */}
          <div className="text-center py-8" onClick={handleVersionTap}>
             <div className="text-xs font-bold text-white/30 mb-1 tracking-widest">MST – Marty Solar Tracker</div>
             <div className="text-[10px] text-white/20 font-mono">v2.3.0 • Offline Data Layer</div>
          </div>
       </div>
    </Layout>
  );
};
