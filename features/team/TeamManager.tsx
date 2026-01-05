import React, { useState } from 'react';
import { Worker, WorkerRole } from '../../domain';
import { Layout } from '../../ui/Layout';
import { Button } from '../../ui/Button';

interface TeamManagerProps {
  workers: Worker[];
  onUpdateWorker: (worker: Worker) => void;
  onAddWorker: (worker: Worker) => void;
  onBack: () => void;
}

const ROLES = [
  { id: WorkerRole.LEADER, label: 'Leader', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  { id: WorkerRole.STRINGER, label: 'Stringař', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { id: WorkerRole.MONTEUR, label: 'Montér', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  { id: WorkerRole.HELPER, label: 'Pomocník', color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20' },
];

export const TeamManager: React.FC<TeamManagerProps> = ({ workers, onUpdateWorker, onAddWorker, onBack }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Partial<Worker>>({ role: WorkerRole.MONTEUR, isActive: true });

  const handleOpenNew = () => {
    setEditingWorker({ 
      role: WorkerRole.MONTEUR, 
      isActive: true, 
      rateHourly: 0, 
      rateString: 0,
      avatarColor: `hsl(${Math.random() * 360}, 70%, 50%)`
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (worker: Worker) => {
    setEditingWorker({ ...worker });
    setIsModalOpen(true);
  };

  const handleToggleActive = (e: React.MouseEvent, worker: Worker) => {
    e.stopPropagation();
    onUpdateWorker({ ...worker, isActive: !worker.isActive });
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const handleSave = () => {
    if (!editingWorker.name) return;

    if (editingWorker.id) {
      // Update existing
      onUpdateWorker(editingWorker as Worker);
    } else {
      // Create new
      onAddWorker({
        id: Date.now().toString(),
        name: editingWorker.name,
        role: editingWorker.role || WorkerRole.MONTEUR,
        isActive: true,
        rateHourly: editingWorker.rateHourly || 0,
        rateString: editingWorker.rateString || 0,
        avatarColor: editingWorker.avatarColor
      });
    }
    setIsModalOpen(false);
  };

  // Sort: Active first, then by Name
  const sortedWorkers = [...workers].sort((a, b) => {
    if (a.isActive === b.isActive) return a.name.localeCompare(b.name);
    return a.isActive ? -1 : 1;
  });

  return (
    <Layout title="Karty Zaměstnanců" showBack onBack={onBack}>
      <div className="space-y-6 pt-4 pb-24">
        
        {/* Active / Inactive Counts */}
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-bold text-white/50 uppercase tracking-[0.15em]">Seznam pracovníků</h3>
          <span className="text-[10px] font-bold text-white/30 bg-white/5 px-2 py-1 rounded border border-white/5">
            {workers.filter(w => w.isActive).length} Aktivních
          </span>
        </div>

        <div className="space-y-3">
          {sortedWorkers.map(worker => {
            const roleConfig = ROLES.find(r => r.id === worker.role);
            const isInactive = !worker.isActive;

            return (
              <div 
                key={worker.id} 
                onClick={() => handleOpenEdit(worker)}
                className={`glass-base p-4 rounded-[24px] group active:scale-[0.99] transition-all border-white/10 hover:border-white/20 relative overflow-hidden ${isInactive ? 'opacity-60 grayscale' : ''}`}
              >
                {/* Visual Status Indicator Strip */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isInactive ? 'bg-white/10' : 'bg-solar-gradient'}`} />

                <div className="flex items-center justify-between pl-3">
                  <div className="flex items-center gap-4">
                     {/* Avatar */}
                     <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-slate-900 shadow-lg text-xl" style={{ backgroundColor: worker.avatarColor || '#ccc' }}>
                       {worker.name.charAt(0)}
                     </div>
                     
                     {/* Info */}
                     <div>
                       <div className="font-black text-white text-lg leading-tight tracking-tight text-shadow-sm flex items-center gap-2">
                         {worker.name}
                         {isInactive && <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-white/50 uppercase">Neaktivní</span>}
                       </div>
                       
                       <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                         <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${roleConfig?.bg} ${roleConfig?.color}`}>
                           {roleConfig?.label}
                         </span>
                         
                         {/* Rates Badges */}
                         {(worker.rateHourly || 0) > 0 && (
                            <span className="text-[10px] text-white/60 font-mono font-bold flex items-center gap-1 bg-black/20 px-1.5 py-0.5 rounded">
                              <span className="text-white/30">H:</span> {worker.rateHourly}
                            </span>
                         )}
                         {(worker.rateString || 0) > 0 && (
                            <span className="text-[10px] text-solar-start/80 font-mono font-bold flex items-center gap-1 bg-black/20 px-1.5 py-0.5 rounded">
                              <span className="text-white/30">S:</span> {worker.rateString}
                            </span>
                         )}
                       </div>
                     </div>
                  </div>

                  {/* Toggle Button */}
                  <button 
                    onClick={(e) => handleToggleActive(e, worker)} 
                    className={`p-3 rounded-full border transition-all ${isInactive ? 'bg-white/5 text-white/30 border-white/5 hover:bg-success/10 hover:text-success' : 'bg-white/5 text-success border-white/5 hover:bg-danger/10 hover:text-danger hover:border-danger/30'}`}
                  >
                    {isInactive ? (
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                    ) : (
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAB: Add Worker */}
      <button 
        onClick={handleOpenNew}
        className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] right-4 w-14 h-14 bg-solar-gradient text-white rounded-full shadow-glow flex items-center justify-center z-40 active:scale-90 transition-transform border border-white/20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
          <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
        </svg>
      </button>

      {/* EDIT/ADD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-midnight/90 backdrop-blur-xl animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <div className="glass-base w-full rounded-t-[32px] p-8 pb-[calc(2rem+env(safe-area-inset-bottom))] border-t border-white/20 space-y-6 bg-midnight/95 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            
            {/* Header */}
            <div>
              <h3 className="text-3xl font-black text-white tracking-tight mb-1">
                {editingWorker.id ? 'Upravit kartu' : 'Nový pracovník'}
              </h3>
              <p className="text-white/40 text-sm font-medium">Osobní údaje a nastavení odměn</p>
            </div>
            
            {/* Name Input */}
            <div className="space-y-2">
               <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 pl-2">Jméno a Příjmení</label>
               <input 
                 type="text" 
                 placeholder="Např. Jan Novák" 
                 className="w-full bg-black/30 p-4 rounded-2xl text-white border border-white/10 focus:border-solar-start focus:outline-none text-xl font-bold placeholder-white/20"
                 value={editingWorker.name || ''}
                 onChange={e => setEditingWorker({...editingWorker, name: e.target.value})}
                 autoFocus={!editingWorker.id}
               />
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 pl-2">Pozice v týmu</label>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map(role => (
                  <button 
                    key={role.id}
                    onClick={() => setEditingWorker({...editingWorker, role: role.id})}
                    className={`p-4 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2 transition-all uppercase tracking-wide ${editingWorker.role === role.id ? 'bg-solar-gradient text-white border-transparent shadow-glow' : 'bg-white/5 text-white/50 border-white/5 active:bg-white/10'}`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pay Rates */}
            <div className="space-y-3 pt-2">
               <div className="flex items-center gap-2 mb-1">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 pl-2">Sazby odměn</label>
                 <div className="h-[1px] flex-1 bg-white/5"></div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  {/* Hourly */}
                  <div className="glass-base p-4 rounded-2xl border border-white/10 bg-black/20">
                     <div className="flex justify-between mb-2">
                        <span className="text-[10px] font-bold text-white/40 uppercase">Hodinová</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white/20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" /></svg>
                     </div>
                     <div className="flex items-baseline gap-2">
                        <input 
                           type="number" 
                           placeholder="0"
                           className="w-full bg-transparent text-2xl font-black text-white focus:outline-none placeholder-white/10"
                           value={editingWorker.rateHourly || ''}
                           onChange={e => setEditingWorker({...editingWorker, rateHourly: parseFloat(e.target.value)})}
                        />
                        <span className="text-xs font-bold text-white/40">Kč/h</span>
                     </div>
                  </div>

                  {/* Task/String */}
                  <div className="glass-base p-4 rounded-2xl border border-white/10 bg-black/20">
                     <div className="flex justify-between mb-2">
                        <span className="text-[10px] font-bold text-solar-start/60 uppercase">Úkolová (String)</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-solar-start/40"><path d="M11.983 1.907a.75.75 0 00-1.292-.657l-8.5 9.5A.75.75 0 002.75 12h6.572l-1.283 6.093a.75.75 0 001.292.657l8.5-9.5A.75.75 0 0017.25 8h-6.572l1.305-6.093z" /></svg>
                     </div>
                     <div className="flex items-baseline gap-2">
                        <input 
                           type="number" 
                           placeholder="0"
                           className="w-full bg-transparent text-2xl font-black text-solar-start focus:outline-none placeholder-white/10"
                           value={editingWorker.rateString || ''}
                           onChange={e => setEditingWorker({...editingWorker, rateString: parseFloat(e.target.value)})}
                        />
                        <span className="text-xs font-bold text-solar-start/60">Kč/str</span>
                     </div>
                  </div>
               </div>
            </div>

            <Button onClick={handleSave} disabled={!editingWorker.name} fullWidth size="lg">
              {editingWorker.id ? 'Uložit změny' : 'Vytvořit pracovníka'}
            </Button>
          </div>
        </div>
      )}
    </Layout>
  );
};