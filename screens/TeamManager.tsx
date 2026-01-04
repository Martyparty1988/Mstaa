import React, { useState } from 'react';
import { Worker, WorkerRole } from '../types';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';

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
  const [showAdd, setShowAdd] = useState(false);
  const [newWorker, setNewWorker] = useState<Partial<Worker>>({ role: WorkerRole.MONTEUR, isActive: true });

  const handleToggleActive = (worker: Worker) => {
    onUpdateWorker({ ...worker, isActive: !worker.isActive });
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const saveNewWorker = () => {
    if (!newWorker.name) return;
    onAddWorker({
      id: Date.now().toString(),
      name: newWorker.name,
      role: newWorker.role || WorkerRole.MONTEUR,
      isActive: true,
      rateHourly: newWorker.rateHourly || 0,
      avatarColor: `hsl(${Math.random() * 360}, 70%, 50%)`
    });
    setShowAdd(false);
    setNewWorker({ role: WorkerRole.MONTEUR, isActive: true });
  };

  return (
    <Layout title="Správa Týmu" showBack onBack={onBack}>
      <div className="space-y-4 pt-4">
        
        {/* Active Workers */}
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Aktivní tým</h3>
          <span className="text-xs font-bold text-white/30 bg-white/5 px-2 py-0.5 rounded">{workers.filter(w => w.isActive).length} lidí</span>
        </div>

        <div className="space-y-2">
          {workers.filter(w => w.isActive).map(worker => (
            <div key={worker.id} className="glass-card p-4 rounded-2xl flex items-center justify-between group active:scale-[0.99] transition-transform">
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-slate-900 shadow-lg text-lg" style={{ backgroundColor: worker.avatarColor || '#ccc' }}>
                   {worker.name.charAt(0)}
                 </div>
                 <div>
                   <div className="font-bold text-white text-lg leading-tight">{worker.name}</div>
                   <div className="flex items-center gap-2 mt-1">
                     <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${ROLES.find(r => r.id === worker.role)?.bg} ${ROLES.find(r => r.id === worker.role)?.color}`}>
                       {ROLES.find(r => r.id === worker.role)?.label}
                     </span>
                     {worker.rateHourly && <span className="text-[10px] text-white/40 font-mono">{worker.rateHourly} €/h</span>}
                   </div>
                 </div>
              </div>
              <button onClick={() => handleToggleActive(worker)} className="p-3 bg-white/5 rounded-full text-success border border-white/5 active:bg-danger/20 active:text-danger active:border-danger/30 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Inactive Workers */}
        <div className="flex justify-between items-center px-1 mt-8">
          <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Neaktivní / Historie</h3>
        </div>
        <div className="space-y-2 opacity-50 grayscale hover:grayscale-0 transition-all">
          {workers.filter(w => !w.isActive).map(worker => (
            <div key={worker.id} className="bg-white/5 border border-white/5 p-3 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-white/20">
                   {worker.name.charAt(0)}
                 </div>
                 <div className="text-white/50 font-bold">{worker.name}</div>
              </div>
              <button onClick={() => handleToggleActive(worker)} className="text-xs font-bold px-3 py-1 bg-white/10 rounded-lg text-white/60">Aktivovat</button>
            </div>
          ))}
        </div>

        <div className="h-20" /> {/* Spacer */}
      </div>

      {/* Floating Add Button */}
      <button 
        onClick={() => setShowAdd(true)}
        className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 w-14 h-14 bg-solar-gradient text-white rounded-full shadow-glow flex items-center justify-center z-40 active:scale-90 transition-transform"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
          <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Add Worker Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setShowAdd(false)}>
          <div className="bg-surface w-full rounded-t-3xl p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] border-t border-white/10 space-y-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-white">Nový pracovník</h3>
            
            <input 
              type="text" 
              placeholder="Jméno a příjmení" 
              className="w-full bg-black/20 p-4 rounded-2xl text-white border border-white/10 focus:border-solar-start focus:outline-none text-lg"
              value={newWorker.name || ''}
              onChange={e => setNewWorker({...newWorker, name: e.target.value})}
              autoFocus
            />

            <div className="grid grid-cols-2 gap-3">
              {ROLES.map(role => (
                <button 
                  key={role.id}
                  onClick={() => setNewWorker({...newWorker, role: role.id})}
                  className={`p-4 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${newWorker.role === role.id ? 'bg-solar-gradient text-white border-transparent shadow-glow' : 'bg-white/5 text-white/50 border-white/5'}`}
                >
                  {role.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 bg-black/20 p-4 rounded-2xl border border-white/10">
               <span className="text-white/50 text-sm pl-2 font-bold uppercase">Sazba</span>
               <div className="flex-1" />
               <input 
                  type="number" 
                  placeholder="0" 
                  className="bg-transparent text-white font-mono font-bold w-20 text-right focus:outline-none text-xl"
                  value={newWorker.rateHourly || ''}
                  onChange={e => setNewWorker({...newWorker, rateHourly: parseFloat(e.target.value)})}
               />
               <span className="text-solar-start font-bold">€ / hod</span>
            </div>

            <Button onClick={saveNewWorker} disabled={!newWorker.name} fullWidth size="lg">Uložit pracovníka</Button>
          </div>
        </div>
      )}
    </Layout>
  );
};