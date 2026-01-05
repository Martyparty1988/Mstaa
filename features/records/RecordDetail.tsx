import React, { useState } from 'react';
import { WorkLog, Worker, Project, TableSize, WorkType, calculateLogStrings, stringsToKwp } from '../../app/domain';
import { Button } from '../../ui/Button';

interface RecordDetailProps {
  log: WorkLog;
  workers: Worker[];
  project: Project;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<WorkLog>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export const RecordDetail: React.FC<RecordDetailProps> = ({ 
  log, 
  workers, 
  project, 
  onClose,
  onUpdate,
  onDelete,
  onDuplicate
}) => {
  const [note, setNote] = useState(log.note || '');
  const [duration, setDuration] = useState(log.durationMinutes);
  const [workerId, setWorkerId] = useState(log.workerId);
  const [isDeleting, setIsDeleting] = useState(false);

  // Derived Info
  const isTable = log.type === WorkType.TABLE;
  const strings = calculateLogStrings(log, project.settings);
  const kwp = stringsToKwp(strings, project.settings);
  const tableCount = log.tableIds?.length || (log.tableId ? 1 : 0);

  const handleSave = () => {
    onUpdate(log.id, {
      note,
      durationMinutes: duration,
      workerId
    });
    onClose();
  };

  const handleDelete = () => {
    if (isDeleting) {
      onDelete(log.id);
      onClose();
    } else {
      setIsDeleting(true);
    }
  };

  const handleDuplicate = () => {
    onDuplicate(log.id);
    onClose(); // Close detail, user will see new log at top
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-midnight/80 backdrop-blur-xl animate-fade-in" onClick={onClose}>
       <div className="glass-base w-full max-h-[90vh] rounded-t-[32px] p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] border-t border-white/20 bg-midnight/95 flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
          
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
             <div>
                <h3 className="text-2xl font-black text-white tracking-tight">{isTable ? 'Práce na stolech' : 'Hodinová práce'}</h3>
                <p className="text-white/40 text-sm font-medium">{new Date(log.timestamp).toLocaleString()}</p>
             </div>
             <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-6 pr-1">
             
             {/* Stats Card (Read Only) */}
             {isTable && (
               <div className="glass-base p-4 rounded-2xl bg-black/20 border border-white/10 flex justify-around items-center">
                  <div className="text-center">
                     <div className="text-2xl font-black text-white">{tableCount}</div>
                     <div className="text-[9px] font-bold text-white/40 uppercase">Stolů</div>
                  </div>
                  <div className="w-[1px] h-8 bg-white/10" />
                  <div className="text-center">
                     <div className="text-2xl font-black text-solar-start">{strings.toFixed(1)}</div>
                     <div className="text-[9px] font-bold text-solar-start/60 uppercase">Stringů</div>
                  </div>
                  <div className="w-[1px] h-8 bg-white/10" />
                  <div className="text-center">
                     <div className="text-2xl font-black text-amber-400">{kwp.toFixed(1)}</div>
                     <div className="text-[9px] font-bold text-amber-400/60 uppercase">kWp</div>
                  </div>
               </div>
             )}

             {/* Edit: Worker */}
             <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 pl-1">Pracovník</label>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                   <button 
                      onClick={() => setWorkerId('CURRENT_USER')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${workerId === 'CURRENT_USER' ? 'bg-white text-midnight border-white' : 'bg-white/5 text-white/40 border-white/10'}`}
                   >
                     Já
                   </button>
                   {workers.filter(w => w.id !== 'CURRENT_USER').map(w => (
                      <button 
                        key={w.id}
                        onClick={() => setWorkerId(w.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${workerId === w.id ? 'bg-white text-midnight border-white' : 'bg-white/5 text-white/40 border-white/10'}`}
                      >
                        {w.name}
                      </button>
                   ))}
                </div>
             </div>

             {/* Edit: Duration */}
             <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 pl-1">Trvání (minuty)</label>
                <div className="flex items-center gap-4 bg-black/20 p-2 rounded-2xl border border-white/10">
                   <button onClick={() => setDuration(Math.max(0, duration - 15))} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60 text-xl font-bold active:bg-white/10">-</button>
                   <input 
                     type="number" 
                     value={duration} 
                     onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                     className="flex-1 bg-transparent text-center text-2xl font-black text-white focus:outline-none"
                   />
                   <button onClick={() => setDuration(duration + 15)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60 text-xl font-bold active:bg-white/10">+</button>
                </div>
             </div>

             {/* Edit: Note */}
             <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 pl-1">Poznámka</label>
                <textarea 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full h-24 bg-black/20 rounded-2xl border border-white/10 p-4 text-white text-sm focus:outline-none focus:border-solar-start/50 transition-colors resize-none"
                  placeholder="Žádná poznámka..."
                />
             </div>

             {/* Action Buttons */}
             <div className="grid grid-cols-2 gap-3 pt-2">
                <button 
                  onClick={handleDuplicate}
                  className="py-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-bold text-xs uppercase tracking-widest hover:bg-white/10 active:scale-[0.98]"
                >
                  Duplikovat
                </button>
                <button 
                  onClick={handleDelete}
                  className={`py-4 rounded-2xl border font-bold text-xs uppercase tracking-widest active:scale-[0.98] transition-all ${isDeleting ? 'bg-danger text-white border-danger shadow-glow' : 'bg-danger/10 text-danger border-danger/20 hover:bg-danger/20'}`}
                >
                  {isDeleting ? 'Potvrdit smazání' : 'Smazat záznam'}
                </button>
             </div>

             {/* Table ID List (Info Only) */}
             {isTable && log.tableIds && (
               <div className="mt-4 pt-4 border-t border-white/5">
                  <div className="text-[10px] font-bold text-white/30 uppercase mb-2">Seznam ID stolů</div>
                  <div className="flex flex-wrap gap-1">
                     {log.tableIds.map(id => (
                       <span key={id} className="text-[10px] bg-white/5 px-2 py-1 rounded text-white/60 font-mono">{id}</span>
                     ))}
                  </div>
               </div>
             )}

          </div>

          <div className="mt-6">
             <Button onClick={handleSave} fullWidth size="lg">Uložit změny</Button>
          </div>

       </div>
    </div>
  );
};