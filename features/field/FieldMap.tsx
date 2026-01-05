import React, { useMemo, useState, useRef } from 'react';
import { Project, TableSize, Table, TableStatus, groupTablesBySection, WorkLog, Worker, WorkType } from '../../app/domain';
import { useFieldSelection } from './useFieldSelection';
import { FieldOverlay } from './FieldOverlay';

interface FieldMapProps {
  project: Project;
  logs: WorkLog[];
  workers: Worker[];
  onBack: () => void;
  onSave: (data: { 
    tableIds: string[]; 
    size?: TableSize; 
    duration: number; 
    startTime?: number; 
    endTime?: number; 
    note?: string; 
    status?: TableStatus 
  }) => void;
  onNavigate: (tab: 'TEAM' | 'STATS' | 'CHAT' | 'RECORDS' | 'MENU') => void;
}

interface TableCellProps {
  table: Table;
  isSelected: boolean;
  completionLog?: WorkLog; 
  workerName?: string;     
  onTap: (t: Table) => void;
  onLongPress: (t: Table) => void;
}

const TableCell: React.FC<TableCellProps> = ({ table, isSelected, completionLog, workerName, onTap, onLongPress }) => {
  const timerRef = useRef<number | null>(null);
  const isPressedRef = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    isPressedRef.current = true;
    timerRef.current = window.setTimeout(() => {
      if (isPressedRef.current) {
        if (navigator.vibrate) navigator.vibrate(50);
        onLongPress(table);
        isPressedRef.current = false;
      }
    }, 400); 
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (isPressedRef.current) onTap(table);
    isPressedRef.current = false;
  };

  const handlePointerCancel = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    isPressedRef.current = false;
  };

  const isDone = table.status === TableStatus.DONE;
  const isIssue = table.status === TableStatus.ISSUE;
  const isInProgress = table.status === TableStatus.IN_PROGRESS;

  const containerBase = "aspect-square rounded-2xl flex flex-col items-center justify-center relative select-none cursor-pointer overflow-hidden touch-manipulation ios-spring border active:scale-90";
  
  let stateClasses = "";
  if (isSelected) stateClasses = "bg-solar-gradient border-white/40 shadow-glow z-20 scale-[0.98] ring-4 ring-solar-start/20";
  else if (isDone) stateClasses = "bg-emerald-500/10 border-emerald-500/30 shadow-inner";
  else if (isInProgress) stateClasses = "bg-cyan-500/10 border-cyan-400/40 shadow-glow animate-pulse-slow";
  else if (isIssue) stateClasses = "bg-red-500/10 border-red-500/40";
  else stateClasses = "bg-white/5 border-white/5 hover:bg-white/10";

  let textClasses = "leading-none transition-all duration-300 z-10 ";
  if (isSelected) textClasses += "text-midnight font-black text-2xl scale-110";
  else if (isDone) textClasses += "text-emerald-400 font-black text-xl";
  else if (isInProgress) textClasses += "text-cyan-300 font-black text-xl text-glow";
  else if (isIssue) textClasses += "text-red-400 font-black text-xl";
  else textClasses += "text-white/20 font-black text-lg group-hover:text-white/40";

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerCancel}
      onPointerCancel={handlePointerCancel}
      className={`${containerBase} ${stateClasses} group`}
    >
      {isSelected && <div className="absolute inset-0 solar-shimmer opacity-40 pointer-events-none" />}
      <span className={textClasses}>{table.label || table.id}</span>
      {table.size && !isDone && !isSelected && (
        <span className="text-[10px] text-white/10 font-black absolute bottom-2 tracking-widest uppercase">{table.size}</span>
      )}
      {isDone && !isSelected && completionLog && (
        <div className="absolute bottom-1 w-full flex flex-col items-center px-1 z-10">
           <span className="text-[9px] font-black text-emerald-200/60 leading-none truncate w-full text-center tracking-tighter uppercase">
             {workerName || completionLog.workerId}
           </span>
        </div>
      )}
    </div>
  );
};

type MapFilter = 'ALL' | 'PENDING' | 'ISSUES' | 'DONE';

export const FieldMap: React.FC<FieldMapProps> = ({ project, logs, workers, onBack, onSave, onNavigate }) => {
  const tables = project.tables || [];
  const { selectedIds, lastInteractedId, toggle, focus, selectGroup, clear, count, hasSelection } = useFieldSelection();
  const [isEditing, setIsEditing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<MapFilter>('ALL');

  const handleTap = (t: Table) => {
    toggle(t.id);
  };

  const completionMap = useMemo(() => {
    const map: Record<string, WorkLog> = {};
    const doneIds = new Set(tables.filter(t => t.status === TableStatus.DONE).map(t => t.id));
    logs.forEach(log => {
      if (log.type === WorkType.TABLE && log.status === TableStatus.DONE && log.tableIds) {
         log.tableIds.forEach(tId => {
            if (doneIds.has(tId)) {
               if (!map[tId] || map[tId].timestamp < log.timestamp) map[tId] = log;
            }
         });
      }
    });
    return map;
  }, [tables, logs]);

  const filteredTables = useMemo(() => {
    let result = tables;
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(t => t.label.toLowerCase().includes(lowerQuery));
    }
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'PENDING') result = result.filter(t => t.status === TableStatus.PENDING || t.status === TableStatus.IN_PROGRESS);
      if (statusFilter === 'ISSUES') result = result.filter(t => t.status === TableStatus.ISSUE);
      if (statusFilter === 'DONE') result = result.filter(t => t.status === TableStatus.DONE);
    }
    return result;
  }, [tables, searchQuery, statusFilter]);

  const tableGroups = useMemo(() => groupTablesBySection(filteredTables), [filteredTables]);

  const closeSearch = () => {
    setSearchQuery("");
    setIsSearchActive(false);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col relative text-white bg-midnight">
      
      <div className="fixed top-0 left-0 w-full z-40 bg-midnight/30 backdrop-blur-2xl border-b border-white/10 pt-[env(safe-area-inset-top)] shadow-2xl flex flex-col">
        
        {isSearchActive ? (
          <div className="flex items-center h-16 px-4 animate-fade-in">
             <div className="flex-1 bg-white/10 rounded-2xl flex items-center px-4 mx-2 border border-white/10 focus-within:border-solar-start/50 transition-all">
                <input autoFocus type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Hledat stůl..." className="w-full bg-transparent border-none text-white font-black placeholder-white/20 focus:ring-0 py-3 text-lg" />
             </div>
             <button onClick={closeSearch} className="px-4 text-sm font-black text-white/40 uppercase tracking-widest">Zrušit</button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center h-16 px-6">
              <button onClick={onBack} className="p-2 -ml-2 text-white/40 active:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
              </button>
              <div className="flex flex-col items-center">
                 <span className="text-sm font-black text-white tracking-tight uppercase tracking-[0.05em]">{project.name}</span>
                 <span className="text-[10px] text-solar-start font-black uppercase tracking-[0.2em] mt-0.5">{tables.filter(t=>t.status===TableStatus.DONE).length} / {tables.length} HOTOVO</span>
              </div>
              <div className="flex items-center -mr-2 gap-2">
                <button onClick={() => setIsSearchActive(true)} className="p-2 text-white/40"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" /></svg></button>
                <button onClick={() => setIsMenuOpen(true)} className="p-2 text-white/40"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clipRule="evenodd" /></svg></button>
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar px-6 pb-4 pt-1 mask-gradient-bottom">
               {(['ALL', 'PENDING', 'ISSUES', 'DONE'] as MapFilter[]).map(f => (
                 <button
                   key={f}
                   onClick={() => setStatusFilter(f)}
                   className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all border ${statusFilter === f ? 'bg-solar-start text-midnight border-solar-start shadow-glow' : 'bg-white/5 text-white/30 border-white/5'}`}
                 >
                   {f === 'ALL' ? 'Vše' : f === 'PENDING' ? 'Čeká' : f === 'ISSUES' ? 'Chyba' : 'Hotovo'}
                 </button>
               ))}
            </div>
          </>
        )}
      </div>

      <div 
        onClick={(e) => { if(e.target === e.currentTarget && !isEditing) clear(); }}
        className="flex-1 pt-[calc(9rem+env(safe-area-inset-top))] pb-32 px-4 overflow-y-auto"
      >
         {filteredTables.length === 0 ? (
           <div className="flex flex-col items-center justify-center pt-20 opacity-20 text-center">
              <div className="text-6xl mb-6">🔍</div>
              <p className="text-xs font-black uppercase tracking-widest">Žádné shody</p>
           </div>
         ) : (
           <div className="space-y-10">
              {tableGroups.map(([prefix, groupItems]) => (
                <div key={prefix} className="animate-fade-in">
                  <div className="flex justify-between items-center px-2 mb-4">
                     <span className="text-xs font-black tracking-[0.2em] text-white/20 uppercase">{prefix}</span>
                     <button onClick={() => selectGroup(groupItems)} className={`text-[9px] px-4 py-2 rounded-full border font-black uppercase tracking-widest transition-all ${groupItems.every(t => selectedIds.has(t.id)) ? 'bg-solar-gradient text-midnight border-transparent' : 'bg-white/5 text-white/20 border-white/5'}`}>{groupItems.every(t => selectedIds.has(t.id)) ? 'Zrušit' : 'Vše'}</button>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {groupItems.map(t => (
                      <TableCell key={t.id} table={t} isSelected={selectedIds.has(t.id)} completionLog={completionMap[t.id]} workerName={completionMap[t.id] ? (completionMap[t.id].workerId === 'CURRENT_USER' ? 'Já' : workers.find(w=>w.id===completionMap[t.id].workerId)?.name.split(' ')[0]) : undefined} onTap={handleTap} onLongPress={handleTap} />
                    ))}
                  </div>
                </div>
              ))}
           </div>
         )}
      </div>

      {hasSelection && !isEditing && (
        <div className="fixed bottom-0 left-0 w-full p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] z-40 animate-slide-up">
           <div className="glass-base rounded-[32px] p-3 pl-8 pr-3 flex items-center justify-between border-white/10 shadow-glow">
               <div className="flex items-center gap-4">
                  <span className="text-3xl font-black text-white text-glow tabular-nums">{count}</span>
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Vybráno</span>
               </div>
               <div className="flex items-center gap-3">
                   <button onClick={clear} className="p-3 text-white/30 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                   <button onClick={() => setIsEditing(true)} className="h-14 px-10 bg-solar-gradient rounded-2xl font-black text-white text-sm tracking-widest uppercase shadow-glow hover:scale-105 active:scale-95 ios-spring">Upravit</button>
               </div>
           </div>
        </div>
      )}

      <FieldOverlay isOpen={isEditing} selectedIds={selectedIds} projectTables={tables} settings={project.settings} onClose={() => setIsEditing(false)} onClearSelection={clear} onSave={onSave} focusedId={lastInteractedId} />

      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end" onClick={() => setIsMenuOpen(false)}>
           <div className="absolute inset-0 bg-midnight/90 backdrop-blur-2xl animate-fade-in" />
           <div className="p-8 pb-[calc(4rem+env(safe-area-inset-bottom))] space-y-6 relative z-10 animate-slide-up" onClick={e => e.stopPropagation()}>
              <h3 className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-center">Navigační menu</h3>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => onNavigate('TEAM')} className="glass-base p-8 rounded-[32px] flex flex-col items-center gap-4 ios-spring"><div className="text-3xl">👷</div><span className="font-black text-xs uppercase tracking-widest">Tým</span></button>
                <button onClick={() => onNavigate('STATS')} className="glass-base p-8 rounded-[32px] flex flex-col items-center gap-4 ios-spring"><div className="text-3xl">📊</div><span className="font-black text-xs uppercase tracking-widest">Staty</span></button>
                <button onClick={() => onNavigate('RECORDS')} className="glass-base p-6 rounded-[32px] flex flex-col items-center gap-4 ios-spring"><div className="text-2xl">📝</div><span className="font-black text-xs uppercase tracking-widest">Deník</span></button>
                <button onClick={() => onNavigate('CHAT')} className="glass-base p-6 rounded-[32px] flex flex-col items-center gap-4 ios-spring"><div className="text-2xl">💬</div><span className="font-black text-xs uppercase tracking-widest">Chat</span></button>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="w-full py-5 text-white/30 font-black text-[10px] tracking-[0.3em] uppercase rounded-3xl border border-white/5 mt-4">Zavřít</button>
           </div>
        </div>
      )}
    </div>
  );
};