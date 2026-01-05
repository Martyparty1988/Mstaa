import React, { useState, useMemo } from 'react';
import { WorkLog, Worker, WorkType, Project, calculateLogStrings, stringsToKwp } from '../../app/domain';
import { Layout } from '../../ui/Layout';
import { RecordDetail } from './RecordDetail';

interface RecordsScreenProps {
  logs: WorkLog[];
  workers: Worker[];
  project: Project;
  onBack: () => void;
  onUpdate: (id: string, updates: Partial<WorkLog>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export const RecordsScreen: React.FC<RecordsScreenProps> = ({ 
  logs, 
  workers, 
  project, 
  onBack,
  onUpdate,
  onDelete,
  onDuplicate
}) => {
  const [filterWorker, setFilterWorker] = useState<string>('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  const filteredLogs = useMemo(() => {
    let result = logs.filter(l => l.projectId === project.id);
    result = result.filter(l => {
        if (l.type === WorkType.HOURLY && l.durationMinutes === 0 && l.note) return false;
        return true;
    });
    if (filterWorker !== 'ALL') result = result.filter(l => l.workerId === filterWorker);
    return result.sort((a, b) => b.timestamp - a.timestamp);
  }, [logs, project.id, filterWorker]);

  const groupedLogs = useMemo(() => {
    const groups: Record<string, WorkLog[]> = {};
    filteredLogs.forEach(log => {
      const dateKey = new Date(log.timestamp).toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(log);
    });
    return groups;
  }, [filteredLogs]);

  const lastRecord = filteredLogs[0];
  const getWorkerName = (id: string) => id === 'CURRENT_USER' ? 'Já' : (id === 'TEAM' ? 'Tým' : workers.find(w => w.id === id)?.name || id);

  const renderLogItem = (log: WorkLog) => {
    const isTable = log.type === WorkType.TABLE;
    const count = log.tableIds?.length || (log.tableId ? 1 : 0);
    const strings = calculateLogStrings(log, project.settings);
    const timeStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <button 
        key={log.id} 
        onClick={() => setSelectedLogId(log.id)}
        className="w-full glass-base p-4 rounded-2xl flex items-center gap-4 active:scale-[0.98] transition-all border-white/5 hover:bg-white/5 mb-3 text-left group animate-fade-in"
      >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border relative overflow-hidden flex-shrink-0 ${isTable ? 'bg-solar-start/10 border-solar-start/20 text-solar-start' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
           {isTable ? '🏗' : '⏱'}
        </div>
        <div className="flex-1 min-w-0">
           <div className="flex justify-between items-start">
              <span className="font-bold text-white text-sm truncate">{getWorkerName(log.workerId)}</span>
              <span className="text-[10px] text-white/30 font-mono">{timeStr}</span>
           </div>
           <div className="flex items-center gap-2 mt-1">
              {isTable ? (
                <>
                  <span className="text-xs font-black text-white">{count} <span className="text-[9px] font-normal text-white/50 uppercase">Stolů</span></span>
                  <div className="w-1 h-1 rounded-full bg-white/20" />
                  <span className="text-xs font-bold text-white/60">{strings.toFixed(1)} <span className="text-[9px] font-normal text-white/30 uppercase">Str</span></span>
                </>
              ) : (
                <span className="text-xs font-black text-white">{log.durationMinutes} <span className="text-[9px] font-normal text-white/50 uppercase">min</span></span>
              )}
           </div>
           {log.note && <div className="mt-1.5 text-[10px] text-white/40 truncate italic pr-4 border-l-2 border-white/10 pl-2">{log.note}</div>}
        </div>
      </button>
    );
  };

  return (
    <Layout title="Deník Prací" showBack onBack={onBack}>
       <div className="flex flex-col h-full pt-4 pb-24">
         
         <div className="mb-6 space-y-4">
            <div className="flex justify-between items-center px-1">
               <h2 className="text-white/40 text-xs font-bold uppercase tracking-[0.2em]">Historie</h2>
               <button onClick={() => setShowFilters(!showFilters)} className={`p-2 rounded-lg transition-all ${showFilters ? 'bg-white/10 text-white' : 'text-white/40'}`}>
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 01.628.74v2.288a2.25 2.25 0 01-.659 1.59l-4.682 4.683a2.25 2.25 0 00-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 018 18.25v-5.757a2.25 2.25 0 00-.659-1.591L2.659 6.22A2.25 2.25 0 012 4.629V2.34a.75.75 0 01.628-.74z" clipRule="evenodd" /></svg>
               </button>
            </div>
            {showFilters && (
              <div className="glass-base p-4 rounded-2xl animate-fade-in border border-white/10">
                 <label className="text-[10px] font-bold text-white/40 uppercase mb-2 block">Filtr: Pracovník</label>
                 <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    <button onClick={() => setFilterWorker('ALL')} className={`px-4 py-1.5 rounded-lg text-xs font-bold border ${filterWorker === 'ALL' ? 'bg-white text-midnight' : 'bg-white/5 text-white/50'}`}>Všichni</button>
                    {workers.map(w => (
                       <button key={w.id} onClick={() => setFilterWorker(w.id)} className={`px-4 py-1.5 rounded-lg text-xs font-bold border whitespace-nowrap ${filterWorker === w.id ? 'bg-solar-start text-midnight' : 'bg-white/5 text-white/50'}`}>{w.name}</button>
                    ))}
                 </div>
              </div>
            )}
            {lastRecord && !showFilters && (
               <div className="glass-hero p-3 rounded-2xl flex items-center justify-between border border-white/10" onClick={() => setSelectedLogId(lastRecord.id)}>
                  <div>
                     <div className="text-[9px] font-bold text-solar-start uppercase tracking-wider">Naposledy</div>
                     <div className="font-bold text-white text-sm truncate max-w-[150px]">{lastRecord.note || 'Záznam práce'}</div>
                  </div>
                  <button className="px-4 py-2 bg-white/10 rounded-xl text-xs font-bold text-white">Upravit</button>
               </div>
            )}
         </div>

         <div className="space-y-6 flex-1 overflow-y-auto mask-gradient-bottom no-scrollbar">
            {Object.entries(groupedLogs).map(([dateLabel, dayLogs]) => (
               <div key={dateLabel}>
                  <div className="sticky top-0 bg-midnight/95 backdrop-blur-md z-10 py-2 mb-2 border-b border-white/5">
                     <h3 className="text-sm font-bold text-white/60 capitalize tracking-wide">{dateLabel}</h3>
                  </div>
                  <div>{(dayLogs as WorkLog[]).map(renderLogItem)}</div>
               </div>
            ))}
            {filteredLogs.length === 0 && <div className="text-center py-20 opacity-20 text-sm font-bold">Žádné záznamy</div>}
         </div>

       </div>

       {selectedLogId && (
          <RecordDetail log={logs.find(l => l.id === selectedLogId)!} workers={workers} project={project} onClose={() => setSelectedLogId(null)} onUpdate={onUpdate} onDelete={onDelete} onDuplicate={onDuplicate} />
       )}
    </Layout>
  );
};