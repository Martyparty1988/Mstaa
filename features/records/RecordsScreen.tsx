import React, { useState, useMemo } from 'react';
import { WorkLog, Worker, WorkType, Project, calculateLogStrings, stringsToKwp } from '../../domain';
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
  // Filters
  const [filterWorker, setFilterWorker] = useState<string>('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  // --- FILTER & SORT LOGIC ---
  const filteredLogs = useMemo(() => {
    let result = logs.filter(l => l.projectId === project.id);

    // Exclude Chat messages (0 duration hourly with notes)
    // We only want "Work" records.
    result = result.filter(l => {
        if (l.type === WorkType.HOURLY && l.durationMinutes === 0 && l.note) return false;
        return true;
    });

    if (filterWorker !== 'ALL') {
      result = result.filter(l => l.workerId === filterWorker);
    }

    // Sort: Newest first
    return result.sort((a, b) => b.timestamp - a.timestamp);
  }, [logs, project.id, filterWorker]);

  // Group by Date
  const groupedLogs = useMemo(() => {
    const groups: Record<string, WorkLog[]> = {};
    filteredLogs.forEach(log => {
      const dateKey = new Date(log.timestamp).toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(log);
    });
    return groups;
  }, [filteredLogs]);

  // Quick Action: Last Record
  const lastRecord = filteredLogs[0];

  const getWorkerName = (id: string) => {
    if (id === 'CURRENT_USER') return 'Já';
    if (id === 'TEAM') return 'Tým';
    return workers.find(w => w.id === id)?.name || id;
  };

  const renderLogItem = (log: WorkLog) => {
    const isTable = log.type === WorkType.TABLE;
    const count = log.tableIds?.length || (log.tableId ? 1 : 0);
    const strings = calculateLogStrings(log, project.settings);
    const kwp = stringsToKwp(strings, project.settings);
    const timeStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <button 
        key={log.id} 
        onClick={() => setSelectedLogId(log.id)}
        className="w-full glass-base p-4 rounded-2xl flex items-center gap-4 active:scale-[0.98] transition-all border-white/5 hover:bg-white/5 mb-3 text-left group"
      >
        {/* Icon / Type Indicator */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border relative overflow-hidden flex-shrink-0 ${isTable ? 'bg-solar-start/10 border-solar-start/20 text-solar-start' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
           {isTable ? '🏗' : '⏱'}
        </div>

        {/* Content */}
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

           {log.note && (
             <div className="mt-1.5 text-[10px] text-white/40 truncate italic pr-4 border-l-2 border-white/10 pl-2">
               {log.note}
             </div>
           )}
        </div>

        {/* Edit Arrow */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white/30">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" /></svg>
        </div>
      </button>
    );
  };

  return (
    <Layout title="Deník Prací" showBack onBack={onBack}>
       <div className="flex flex-col h-full pt-4 pb-24">
         
         {/* --- 1. HEADER SUMMARY & FILTERS --- */}
         <div className="mb-6 space-y-4">
            <div className="flex justify-between items-center px-1">
               <h2 className="text-white/40 text-xs font-bold uppercase tracking-[0.2em]">Historie záznamů</h2>
               <button 
                 onClick={() => setShowFilters(!showFilters)}
                 className={`p-2 rounded-lg transition-all ${showFilters ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
               >
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 01.628.74v2.288a2.25 2.25 0 01-.659 1.59l-4.682 4.683a2.25 2.25 0 00-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 018 18.25v-5.757a2.25 2.25 0 00-.659-1.591L2.659 6.22A2.25 2.25 0 012 4.629V2.34a.75.75 0 01.628-.74z" clipRule="evenodd" /></svg>
               </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="glass-base p-4 rounded-2xl animate-fade-in border border-white/10 space-y-3">
                 <div>
                   <label className="text-[10px] font-bold text-white/40 uppercase mb-1 block">Pracovník</label>
                   <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                      <button onClick={() => setFilterWorker('ALL')} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border ${filterWorker === 'ALL' ? 'bg-white text-midnight border-white' : 'bg-transparent text-white/50 border-white/10'}`}>Všichni</button>
                      {workers.map(w => (
                         <button 
                           key={w.id} 
                           onClick={() => setFilterWorker(w.id)}
                           className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border ${filterWorker === w.id ? 'bg-solar-start text-midnight border-solar-start' : 'bg-transparent text-white/50 border-white/10'}`}
                         >
                           {w.name}
                         </button>
                      ))}
                   </div>
                 </div>
              </div>
            )}
            
            {/* Quick Edit Card */}
            {lastRecord && !showFilters && (
               <div className="glass-hero p-1 rounded-2xl border border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-solar-start/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                  <div className="flex items-center justify-between p-3 pl-4">
                     <div>
                        <div className="text-[9px] font-bold text-solar-start uppercase tracking-wider mb-0.5">Poslední aktivita</div>
                        <div className="font-bold text-white text-sm truncate max-w-[150px]">{lastRecord.note || 'Bez poznámky'}</div>
                        <div className="text-[10px] text-white/40">{new Date(lastRecord.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {getWorkerName(lastRecord.workerId)}</div>
                     </div>
                     <button 
                       onClick={() => setSelectedLogId(lastRecord.id)}
                       className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-white transition-colors border border-white/5 shadow-lg active:scale-95"
                     >
                        Upravit
                     </button>
                  </div>
               </div>
            )}
         </div>

         {/* --- 2. LOG LIST --- */}
         <div className="space-y-6">
            {Object.entries(groupedLogs).map(([dateLabel, dayLogs]) => (
               <div key={dateLabel}>
                  <div className="sticky top-0 bg-midnight/95 backdrop-blur-md z-10 py-2 mb-2 border-b border-white/5 px-2 -mx-2">
                     <h3 className="text-sm font-bold text-white/60 capitalize tracking-wide">{dateLabel}</h3>
                  </div>
                  <div>
                     {(dayLogs as WorkLog[]).map(renderLogItem)}
                  </div>
               </div>
            ))}

            {filteredLogs.length === 0 && (
               <div className="text-center py-10 opacity-40">
                  <div className="text-4xl mb-2">📭</div>
                  <p className="text-sm font-bold">Žádné záznamy</p>
               </div>
            )}
         </div>

       </div>

       {/* --- DETAIL OVERLAY --- */}
       {selectedLogId && (
          <RecordDetail 
            log={logs.find(l => l.id === selectedLogId)!}
            workers={workers}
            project={project}
            onClose={() => setSelectedLogId(null)}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
          />
       )}
    </Layout>
  );
};
