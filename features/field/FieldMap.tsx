import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Project, ProjectMode, TableSize, WorkType, Table, TableStatus, parseTableId, groupTablesBySection } from '../../domain';
import { TimeRangePicker } from '../../ui/TimeRangePicker';
import { storage, KEYS } from '../../lib/storage';

interface FieldMapProps {
  project: Project;
  onBack: () => void;
  onSave: (data: { type: WorkType; tableId?: string; tableIds?: string[]; size?: TableSize; duration: number; startTime?: number; endTime?: number; note?: string; status?: TableStatus }) => void;
}

// --- COMPONENTS ---

interface TableCellProps {
  table: Table;
  isSelected: boolean;
  onTap: (t: Table) => void;
  onLongPress: (t: Table) => void;
}

const TableCell: React.FC<TableCellProps> = ({ table, isSelected, onTap, onLongPress }) => {
  const timerRef = useRef<number | null>(null);
  const isPressedRef = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    isPressedRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    
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
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handlePointerCancel = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    isPressedRef.current = false;
  };

  const isDone = table.status === TableStatus.DONE;
  const isIssue = table.status === TableStatus.ISSUE;
  const isInProgress = table.status === TableStatus.IN_PROGRESS;

  let bgClass = 'bg-white/5 border-white/5';
  let textClass = 'text-white/40'; 
  let statusIndicator = null;

  if (isDone) {
    bgClass = 'bg-success/10 border-success/30';
    textClass = 'text-success font-bold';
    statusIndicator = <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-success rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />;
  } else if (isInProgress) {
    bgClass = 'bg-solar-start/10 border-solar-start/30';
    textClass = 'text-solar-start font-bold';
    statusIndicator = <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-solar-start rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)]" />;
  } else if (isIssue) {
    bgClass = 'bg-danger/10 border-danger/30';
    textClass = 'text-danger font-bold';
    statusIndicator = <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-danger rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />;
  }

  const selectionClass = isSelected 
    ? 'bg-solar-gradient border-transparent shadow-glow z-20 scale-[0.96] text-white ring-2 ring-white/20' 
    : 'active:scale-95 border hover:bg-white/10';

  const { main } = parseTableId(table.id);

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerCancel}
      onPointerCancel={handlePointerCancel}
      className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all duration-200 select-none cursor-pointer overflow-visible touch-manipulation backdrop-blur-sm ${bgClass} ${selectionClass}`}
    >
      <span className={`leading-none text-xl transition-transform ${isSelected ? 'scale-110 font-black' : 'font-bold'} ${!isSelected && textClass}`}>{main}</span>
      
      {table.size && !isDone && !isSelected && (
        <span className="text-[9px] text-white/30 font-bold absolute bottom-1.5">{table.size}</span>
      )}
      
      {!isSelected && statusIndicator}
      
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-white text-solar-end rounded-full w-5 h-5 flex items-center justify-center shadow-lg border-2 border-midnight z-30 animate-bounce">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
        </div>
      )}
    </div>
  );
};

// --- MAIN SCREEN ---

export const FieldMap: React.FC<FieldMapProps> = ({ project, onBack, onSave }) => {
  // Domain data directly from props
  const tables = project.tables || [];

  // Local Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Sticky Settings (Context)
  const [worker, setWorker] = useState(() => storage.get(KEYS.LAST_WORKER, "JÁ"));
  const [timeRange, setTimeRange] = useState(() => storage.get(KEYS.LAST_TIMERANGE, { start: "07:00", end: "16:00" }));

  // Transient State (Per Action)
  const [selectedSize, setSelectedSize] = useState<TableSize | null>(null);
  
  // UI Flow State
  const [sheetMode, setSheetMode] = useState<'DEFAULT' | 'TIME' | 'MORE_ACTIONS'>('DEFAULT');

  // Computed Values
  const tableGroups = useMemo(() => groupTablesBySection(tables), [tables]);
  const totalTables = tables.length;
  const completedTables = tables.filter(t => t.status === TableStatus.DONE).length;
  const progressPercent = totalTables > 0 ? Math.round((completedTables / totalTables) * 100) : 0;
  
  // Logic: Needs Size Input?
  const isFlexibleMode = project.mode === ProjectMode.A_FLEXIBLE;
  
  // Reset transient state when selection clears
  useEffect(() => {
    if (selectedIds.size === 0) {
      setSelectedSize(null);
      setSheetMode('DEFAULT');
    }
  }, [selectedIds.size]);

  // --- INTERACTION HANDLERS ---

  const handleTap = (table: Table) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(table.id)) newSet.delete(table.id);
    else newSet.add(table.id);
    
    setSelectedIds(newSet);
  };

  const handleGroupSelect = (groupTables: Table[]) => {
    const newSet = new Set(selectedIds);
    let allSelected = true;
    for (const t of groupTables) {
      if (!newSet.has(t.id)) { allSelected = false; break; }
    }
    
    if (allSelected) {
        groupTables.forEach(t => newSet.delete(t.id));
    } else { 
        groupTables.forEach(t => newSet.add(t.id)); 
        if (navigator.vibrate) navigator.vibrate(50); 
    }
    setSelectedIds(newSet);
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const toggleWorker = () => {
    const next = worker === "JÁ" ? "TÝM" : "JÁ";
    setWorker(next);
    storage.set(KEYS.LAST_WORKER, next);
  };

  const handleTimeConfirm = (start: string, end: string) => {
    const newVal = { start, end };
    setTimeRange(newVal);
    storage.set(KEYS.LAST_TIMERANGE, newVal);
    setSheetMode('DEFAULT');
  };

  const getEpoch = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d.getTime();
  };

  // --- FINALIZATION ---

  const executeSave = (status: TableStatus) => {
    const ids = Array.from(selectedIds);
    const startEpoch = getEpoch(timeRange.start);
    const endEpoch = getEpoch(timeRange.end);
    const duration = Math.max(0, Math.floor((endEpoch - startEpoch) / 60000));

    // Size logic: Only pass size if in Flexible mode and user selected one
    const sizeToSave = isFlexibleMode && selectedSize ? selectedSize : undefined;

    onSave({
      type: WorkType.TABLE,
      tableIds: ids,
      size: sizeToSave,
      duration,
      startTime: startEpoch,
      endTime: endEpoch,
      status,
      note: status === TableStatus.ISSUE ? 'Nahlášen problém' : undefined
    });

    clearSelection();
    if (navigator.vibrate) navigator.vibrate([50]);
  };

  const isActionDisabled = isFlexibleMode && !selectedSize;

  // --- RENDER HELPERS ---
  const selectedCount = selectedIds.size;
  const hasSelection = selectedCount > 0;
  
  return (
    <div className="min-h-[100dvh] flex flex-col relative text-white bg-midnight">
      
      {/* 1. COMPACT HEADER */}
      <div className="fixed top-0 left-0 w-full z-40 bg-midnight/80 backdrop-blur-md border-b border-white/5 pt-[env(safe-area-inset-top)] shadow-sm flex flex-col transition-transform duration-300">
        <div className="flex justify-between items-center h-12 px-4">
          <button onClick={onBack} className="p-2 -ml-2 text-white/60 active:text-white rounded-full active:bg-white/10 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div className="flex flex-col items-center">
             <span className="text-sm font-bold text-white">{project.name}</span>
             <span className="text-[10px] text-white/40 font-mono tracking-wider">{completedTables} / {totalTables} HOTOVO</span>
          </div>
          <div className="w-8" /> 
        </div>
        {/* Progress Line */}
        <div className="w-full h-[2px] bg-white/5 relative overflow-hidden">
           <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-success to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-700 ease-out" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* 2. SCROLLABLE MAP */}
      <div 
        onClick={(e) => { if(e.target === e.currentTarget) clearSelection(); }}
        className="flex-1 pt-[calc(4rem+env(safe-area-inset-top))] pb-[calc(24rem)] px-2 overflow-y-auto"
      >
         <div className="space-y-6 mt-4">
            {tableGroups.map(([prefix, groupItems]) => {
              const groupDone = groupItems.filter(t => t.status === TableStatus.DONE).length;
              const groupTotal = groupItems.length;
              const isGroupDone = groupDone === groupTotal;
              const isGroupSelected = groupItems.every(t => selectedIds.has(t.id));
              
              return (
                <div key={prefix} className="relative bg-surface/50 backdrop-blur-sm rounded-3xl p-3 border border-white/5">
                  {/* Group Header */}
                  <div className="flex justify-between items-center px-2 mb-3 mt-1">
                    <div className="flex items-center gap-2">
                       <span className={`text-sm font-bold tracking-wider ${isGroupDone ? 'text-success' : 'text-white/70'}`}>{prefix}</span>
                       <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded-md font-mono">{groupDone}/{groupTotal}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleGroupSelect(groupItems); }} className={`text-[10px] px-3 py-1.5 rounded-lg border font-bold uppercase tracking-wide transition-all ${isGroupSelected ? 'bg-solar-gradient text-white border-transparent shadow-glow' : 'bg-white/5 text-white/40 border-white/5 active:bg-white/10'}`}>{isGroupSelected ? 'Zrušit' : 'Vybrat'}</button>
                  </div>
                  
                  {/* Grid */}
                  <div className="grid grid-cols-4 gap-2.5">
                    {groupItems.map(t => (
                      <TableCell 
                        key={t.id} 
                        table={t} 
                        isSelected={selectedIds.has(t.id)} 
                        onTap={handleTap} 
                        onLongPress={(t) => { handleTap(t); }} 
                      />
                    ))}
                  </div>
                </div>
              );
            })}
         </div>
         <div className="h-32" /> 
      </div>

      {/* 3. WORKFLOW BOTTOM SHEET */}
      <div 
        className={`fixed bottom-0 left-0 w-full bg-[#0f172a] rounded-t-[2.5rem] border-t border-white/10 shadow-[0_-10px_60px_rgba(0,0,0,0.7)] transition-transform duration-300 z-50 flex flex-col ${hasSelection ? 'translate-y-0' : 'translate-y-[110%]'} `}
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        {hasSelection && (
          <div className="flex flex-col">
            
            {/* Drag Handle */}
            <div className="w-full flex justify-center pt-3 pb-2 cursor-pointer active:opacity-50" onClick={clearSelection}>
              <div className="w-12 h-1.5 bg-white/20 rounded-full" />
            </div>

            <div className="px-5 pt-1 space-y-5">
              
              {/* HEADER: Count */}
              <div className="flex justify-between items-end min-h-[2rem]">
                <h3 className="text-2xl font-black text-white leading-none">
                  {selectedCount} <span className="text-lg font-bold text-white/40">vybráno</span>
                </h3>
                {isFlexibleMode && (
                  <span className="text-xs font-bold text-solar-start uppercase tracking-widest bg-solar-start/10 px-2 py-1 rounded">Vyberte velikost</span>
                )}
              </div>

              {/* DYNAMIC CONTENT AREA */}
              {sheetMode === 'DEFAULT' ? (
                <>
                  {/* SCENARIO B: SIZE SELECTOR (Only in Flexible Mode) */}
                  {isFlexibleMode && (
                    <div className="grid grid-cols-3 gap-3">
                       {[TableSize.SMALL, TableSize.MEDIUM, TableSize.LARGE].map(size => {
                         const isActive = selectedSize === size;
                         return (
                           <button 
                             key={size}
                             onClick={() => setSelectedSize(size)}
                             className={`
                               h-14 rounded-2xl font-black text-xl border transition-all relative overflow-hidden active:scale-95
                               ${isActive 
                                  ? 'bg-solar-gradient text-white border-transparent shadow-glow ring-2 ring-white/20' 
                                  : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                               }
                             `}
                           >
                             {size}
                           </button>
                         );
                       })}
                    </div>
                  )}

                  {/* CONTEXT ROW: WHO & WHEN */}
                  <div className="flex gap-3">
                    {/* WORKER TOGGLE */}
                    <button 
                      onClick={toggleWorker}
                      className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-start active:bg-white/10 transition-colors relative overflow-hidden"
                    >
                      <div className="text-[10px] uppercase text-white/40 font-bold tracking-widest mb-1">Kdo</div>
                      <div className="flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full ${worker === 'JÁ' ? 'bg-solar-start' : 'bg-electric'}`} />
                         <span className="text-lg font-bold text-white">{worker}</span>
                      </div>
                    </button>

                    {/* TIME TOGGLE */}
                    <button 
                      onClick={() => setSheetMode('TIME')}
                      className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-start active:bg-white/10 transition-colors relative overflow-hidden"
                    >
                      <div className="text-[10px] uppercase text-white/40 font-bold tracking-widest mb-1">Kdy</div>
                      <div className="flex items-center gap-2">
                         <span className="text-lg font-bold text-white font-mono">{timeRange.start}-{timeRange.end}</span>
                      </div>
                    </button>
                  </div>

                  {/* PRIMARY ACTION: DONE */}
                  <button 
                    onClick={() => !isActionDisabled && executeSave(TableStatus.DONE)}
                    disabled={isActionDisabled}
                    className={`
                      w-full h-16 rounded-2xl font-black text-xl shadow-glow transition-all flex items-center justify-center gap-3 relative overflow-hidden group
                      ${isActionDisabled 
                        ? 'bg-white/5 text-white/20 grayscale cursor-not-allowed border border-white/5' 
                        : 'bg-solar-gradient text-white active:scale-[0.98]'
                      }
                    `}
                  >
                    {!isActionDisabled && <div className="absolute inset-0 bg-white/20 group-hover:bg-white/10 transition-colors" />}
                    <span>{isActionDisabled ? 'VYBERTE VELIKOST' : 'DOKONČIT'}</span>
                    {!isActionDisabled && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-white/80"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                    )}
                  </button>

                  {/* SECONDARY ACTIONS */}
                  <div className="flex justify-center pt-2">
                     <button 
                       onClick={() => setSheetMode('MORE_ACTIONS')}
                       className="text-[10px] font-bold text-white/30 uppercase tracking-widest py-2 px-4 rounded-lg active:bg-white/5"
                     >
                       Další možnosti
                     </button>
                  </div>
                </>
              ) : sheetMode === 'TIME' ? (
                /* TIME PICKER MODE */
                <div className="animate-fade-in space-y-4">
                   <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-lg">Upravit čas</h4>
                      <button onClick={() => setSheetMode('DEFAULT')} className="text-xs text-white/50 font-bold px-3 py-1 bg-white/5 rounded-lg">Zpět</button>
                   </div>
                   <TimeRangePicker 
                     initialStart={timeRange.start}
                     initialEnd={timeRange.end}
                     onConfirm={(s, e) => handleTimeConfirm(s, e)}
                     onCancel={() => setSheetMode('DEFAULT')}
                   />
                </div>
              ) : (
                /* MORE ACTIONS MODE */
                <div className="animate-fade-in space-y-4">
                  <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-lg">Další možnosti</h4>
                      <button onClick={() => setSheetMode('DEFAULT')} className="text-xs text-white/50 font-bold px-3 py-1 bg-white/5 rounded-lg">Zpět</button>
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                     <button 
                       onClick={() => !isActionDisabled && executeSave(TableStatus.IN_PROGRESS)}
                       disabled={isActionDisabled}
                       className="py-4 rounded-xl border border-white/5 text-white/40 text-xs font-bold uppercase tracking-wider active:bg-white/5 flex flex-col items-center justify-center gap-2 disabled:opacity-30"
                     >
                       <div className="w-2 h-2 rounded-full bg-solar-start" /> Rozdělané
                     </button>
                     <button 
                       onClick={() => executeSave(TableStatus.ISSUE)}
                       // Issue can be reported without size
                       className="py-4 rounded-xl border border-white/5 text-white/40 text-xs font-bold uppercase tracking-wider active:bg-white/5 flex flex-col items-center justify-center gap-2"
                     >
                       <div className="w-2 h-2 rounded-full bg-danger" /> Problém
                     </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}