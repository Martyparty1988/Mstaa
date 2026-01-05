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
                         
                         {/* Rates Badges in EUR */}
                         {(worker.rateHourly || 0) > 0 && (
                            <span className="text-[10px] text-white/60 font-mono font-bold flex items-center gap-1 bg-black/20 px-1.5 py-0.5 rounded">
                              <span className="text-white/30">H:</span> {worker.rateHourly} €
                            </span>
                         )}
                         {(worker.rateString || 0) > 0 && (
                            <span className="text-[10px] text-solar-start/80 font-mono font-bold flex items-center gap-1 bg-black/20 px-1.5 py-0.5 rounded">
                              <span className="text-white/30">S:</span> {worker.rateString} €
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

      {/* EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-midnight/80 backdrop-blur-xl animate-fade-in" onClick={() => setIsModalOpen(false)}>
           <div className="glass-base w-full rounded-t-[32px] p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] border-t border-white/20 bg-midnight/95 shadow-2xl" onClick={e => e.stopPropagation()}>
              
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <h3 className="text-2xl font-black text-white tracking-tight leading-none mb-1">
                      {editingWorker.id ? 'Upravit pracovníka' : 'Nový pracovník'}
                    </h3>
                    <p className="text-white/40 text-sm font-medium">Osobní údaje a nastavení odměn</p>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="p-2 -mr-2 text-white/40 hover:text-white">Zavřít</button>
              </div>

              <div className="space-y-6">
                 {/* Name Input */}
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 pl-1">Jméno a Příjmení</label>
                    <input 
                      autoFocus
                      type="text" 
                      value={editingWorker.name || ''} 
                      onChange={e => setEditingWorker({...editingWorker, name: e.target.value})}
                      placeholder="Např. Jan Novák"
                      className="w-full h-14 bg-black/20 rounded-2xl px-4 text-lg font-bold text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-solar-start border border-white/5"
                    />
                 </div>

                 {/* Role Selector */}
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 pl-1">Pozice v týmu</label>
                    <div className="grid grid-cols-2 gap-3">
                       {ROLES.map(r => (
                         <button 
                           key={r.id}
                           onClick={() => setEditingWorker({...editingWorker, role: r.id})}
                           className={`h-12 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${editingWorker.role === r.id ? 'bg-solar-gradient text-white border-transparent shadow-glow' : 'bg-white/5 text-white/40 border-white/5'}`}
                         >
                           {r.label}
                         </button>
                       ))}
                    </div>
                 </div>

                 {/* Rates Configuration (EUR) */}
                 <div className="space-y-2 pt-2 border-t border-white/5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 pl-1">Sazby odměn</label>
                    <div className="grid grid-cols-2 gap-4">
                       
                       {/* Hourly Rate */}
                       <div className={`p-3 rounded-2xl border transition-all ${editingWorker.rateHourly ? 'bg-white/10 border-white/20' : 'bg-black/20 border-white/5'}`}>
                          <div className="flex justify-between items-center mb-1">
                             <span className="text-[10px] font-bold uppercase text-white/40">Hodinová</span>
                             <span className="text-white/20">🕒</span>
                          </div>
                          <div className="flex items-baseline gap-1">
                             <input 
                               type="number" 
                               value={editingWorker.rateHourly || ''} 
                               onChange={e => setEditingWorker({...editingWorker, rateHourly: parseFloat(e.target.value)})}
                               placeholder="0"
                               className="w-full bg-transparent font-black text-2xl text-white placeholder-white/10 focus:outline-none"
                             />
                             <span className="text-xs font-bold text-white/40">€/h</span>
                          </div>
                       </div>

                       {/* String Rate */}
                       <div className={`p-3 rounded-2xl border transition-all ${editingWorker.rateString ? 'bg-solar-start/10 border-solar-start/30' : 'bg-black/20 border-white/5'}`}>
                          <div className="flex justify-between items-center mb-1">
                             <span className={`text-[10px] font-bold uppercase ${editingWorker.rateString ? 'text-solar-start' : 'text-white/40'}`}>Úkolová (String)</span>
                             <span className={editingWorker.rateString ? 'text-solar-start' : 'text-white/20'}>⚡</span>
                          </div>
                          <div className="flex items-baseline gap-1">
                             <input 
                               type="number" 
                               value={editingWorker.rateString || ''} 
                               onChange={e => setEditingWorker({...editingWorker, rateString: parseFloat(e.target.value)})}
                               placeholder="0"
                               className={`w-full bg-transparent font-black text-2xl placeholder-white/10 focus:outline-none ${editingWorker.rateString ? 'text-solar-start' : 'text-white'}`}
                             />
                             <span className={`text-xs font-bold ${editingWorker.rateString ? 'text-solar-start/60' : 'text-white/40'}`}>€/str</span>
                          </div>
                       </div>

                    </div>
                 </div>

                 <div className="pt-4">
                    <Button 
                      onClick={handleSave} 
                      fullWidth 
                      size="lg"
                      disabled={!editingWorker.name}
                      className={editingWorker.name ? 'shadow-glow' : 'opacity-50 grayscale'}
                    >
                       {editingWorker.id ? 'Uložit změny' : 'Vytvořit pracovníka'}
                    </Button>
                 </div>
              </div>
           </div>
        </div>
      )}

    </Layout>
  );
};