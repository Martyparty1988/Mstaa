import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Project, ProjectMode, TableSize, WorkType, Table, TableStatus } from '../types';
import { TimeRangePicker } from '../components/TimeRangePicker';

interface FieldMapProps {
  project: Project;
  onBack: () => void;
  onSave: (data: { type: WorkType; tableId?: string; tableIds?: string[]; size?: TableSize; duration: number; startTime?: number; endTime?: number; note?: string; status?: TableStatus }) => void;
}

// --- LOGIC HELPERS ---
const parseTableId = (id: string) => {
  const parts = id.split(/[-_ ]/); 
  if (parts.length > 1) {
    const main = parts.pop()!;
    const prefix = parts.join('-');
    const numVal = parseInt(main.replace(/\D/g, '')) || 0;
    return { prefix, main, numVal };
  }
  const numVal = parseInt(id.replace(/\D/g, '')) || 0;
  return { prefix: 'Ostatní', main: id, numVal };
};

const groupTables = (tables: Table[]) => {
  const groups: Record<string, Table[]> = {};
  tables.forEach(t => {
    const { prefix } = parseTableId(t.id);
    if (!groups[prefix]) groups[prefix] = [];
    groups[prefix].push(t);
  });
  Object.keys(groups).forEach(key => {
    groups[key].sort((a, b) => {
      const pa = parseTableId(a.id);
      const pb = parseTableId(b.id);
      return pa.numVal - pb.numVal;
    });
  });
  return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }));
};

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
    }, 500); 
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
  let textClass = 'text-white/80';
  let indicator = null;

  if (isDone) {
    bgClass = 'bg-success/10 border-success/30';
    textClass = 'text-success';
  } else if (isInProgress) {
    bgClass = 'bg-solar-start/10 border-solar-start/30';
    textClass = 'text-solar-start';
  } else if (isIssue) {
    bgClass = 'bg-danger/10 border-danger/30';
    textClass = 'text-danger';
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
      className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all duration-200 select-none cursor-pointer overflow-visible touch-manipulation backdrop-blur-sm ${bgClass} ${selectionClass}`}
    >
      <span className={`font-bold leading-none text-xl transition-transform ${isSelected ? 'scale-110' : ''} ${!isSelected && textClass}`}>{main}</span>
      
      {table.size && !isDone && !isSelected && (
        <span className="text-[10px] text-white/30 font-bold absolute bottom-1.5">{table.size}</span>
      )}
      
      {/* Status Indicators */}
      {isDone && !isSelected && <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-success rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />}
      {isIssue && !isSelected && <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />}
      
      {/* Selection Checkmark */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-white text-solar-end rounded-full w-6 h-6 flex items-center justify-center shadow-lg border-2 border-midnight z-30 animate-bounce">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
        </div>
      )}
    </div>
  );
};

// --- MAIN SCREEN ---

export const FieldMap: React.FC<FieldMapProps> = ({ project, onBack, onSave }) => {
  // --- STATE ---
  const [tables, setTables] = useState<Table[]>(() => {
    if (project.tables && project.tables.length > 0) return [...project.tables];
    const mockTables: Table[] = [];
    ['Řada A', 'Řada B', 'Řada C', 'Řada D'].forEach(prefix => {
      for (let i = 1; i <= 12; i++) {
        mockTables.push({
          id: `${prefix}-${i}`,
          status: Math.random() > 0.9 ? TableStatus.DONE : TableStatus.PENDING,
          size: project.mode === ProjectMode.B_STRICT ? (i % 2 === 0 ? TableSize.LARGE : TableSize.MEDIUM) : undefined
        });
      }
    });
    return mockTables;
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Sticky Settings
  const [worker, setWorker] = useState(() => localStorage.getItem('mst_last_worker') || "JÁ");
  
  // Time Range Sticky
  const [timeRange, setTimeRange] = useState(() => {
    const saved = localStorage.getItem('mst_last_timerange');
    return saved ? JSON.parse(saved) : { start: "07:00", end: "16:00" };
  });

  const [lastSize, setLastSize] = useState<TableSize | null>(null);

  // UI Modes
  const [step, setStep] = useState<'MAIN' | 'SIZE_SELECT' | 'TIME_PICKER' | 'MORE_ACTIONS'>('MAIN');

  // --- MEMOIZED DATA ---
  const tableGroups = useMemo(() => groupTables(tables), [tables]);
  const totalTables = tables.length;
  const completedTables = tables.filter(t => t.status === TableStatus.DONE).length;
  const progressPercent = totalTables > 0 ? Math.round((completedTables / totalTables) * 100) : 0;

  // Range Detection
  const rangeOffer = useMemo(() => {
    if (selectedIds.size !== 2) return null;
    const ids = Array.from(selectedIds);
    const t1 = tables.find(t => t.id === ids[0]);
    const t2 = tables.find(t => t.id === ids[1]);
    if (!t1 || !t2) return null;
    const p1 = parseTableId(t1.id);
    const p2 = parseTableId(t2.id);
    if (p1.prefix !== p2.prefix) return null;
    const min = Math.min(p1.numVal, p2.numVal);
    const max = Math.max(p1.numVal, p2.numVal);
    const diff = max - min;
    if (diff > 1 && diff < 50) {
      const rangeIds: string[] = [];
      tables.forEach(t => {
        const p = parseTableId(t.id);
        if (p.prefix === p1.prefix && p.numVal > min && p.numVal < max) rangeIds.push(t.id);
      });
      if (rangeIds.length > 0) return { rangeIds, min, max, prefix: p1.prefix };
    }
    return null;
  }, [selectedIds, tables]);

  // --- ACTIONS ---

  const handleTap = (table: Table) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(table.id)) newSet.delete(table.id);
    else newSet.add(table.id);
    setSelectedIds(newSet);
    setStep('MAIN'); 
  };

  const handleGroupSelect = (groupTables: Table[]) => {
    const newSet = new Set(selectedIds);
    let allSelected = true;
    for (const t of groupTables) {
      if (!newSet.has(t.id)) { allSelected = false; break; }
    }
    if (allSelected) groupTables.forEach(t => newSet.delete(t.id));
    else { groupTables.forEach(t => newSet.add(t.id)); if (navigator.vibrate) navigator.vibrate(50); }
    setSelectedIds(newSet);
  };

  const handleFillRange = () => {
    if (!rangeOffer) return;
    const newSet = new Set(selectedIds);
    rangeOffer.rangeIds.forEach(id => newSet.add(id));
    setSelectedIds(newSet);
    if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setStep('MAIN');
  };

  const changeWorker = (w: string) => {
    setWorker(w);
    localStorage.setItem('mst_last_worker', w);
  };

  // --- TIME HANDLING ---

  const handleTimeConfirm = (start: string, end: string) => {
    const newVal = { start, end };
    setTimeRange(newVal);
    localStorage.setItem('mst_last_timerange', JSON.stringify(newVal));
    setStep('MAIN');
  };

  // Convert HH:MM to Epoch for today
  const getEpoch = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d.getTime();
  };

  // --- SAVE LOGIC ---

  const completeTableSave = (action: string, sizeOverride?: TableSize) => {
    let status = TableStatus.PENDING;
    if (action === 'DONE') status = TableStatus.DONE;
    if (action === 'IN_PROGRESS') status = TableStatus.IN_PROGRESS;
    if (action === 'ISSUE') status = TableStatus.ISSUE;

    const ids = Array.from(selectedIds);
    
    if (sizeOverride) setLastSize(sizeOverride);

    setTables(prev => prev.map(t => {
      if (selectedIds.has(t.id)) {
        return { ...t, status, size: sizeOverride || t.size };
      }
      return t;
    }));

    // Calculate duration
    const startEpoch = getEpoch(timeRange.start);
    const endEpoch = getEpoch(timeRange.end);
    const duration = Math.max(0, Math.floor((endEpoch - startEpoch) / 60000));

    onSave({
      type: WorkType.TABLE,
      tableIds: ids,
      size: sizeOverride,
      duration,
      startTime: startEpoch,
      endTime: endEpoch,
      note: `Action: ${action}`,
      status
    });

    clearSelection();
  };

  const handleMainAction = (action: 'DONE' | 'IN_PROGRESS' | 'ISSUE') => {
    if (action === 'DONE') {
      const selectedTables = tables.filter(t => selectedIds.has(t.id));
      const needsSize = selectedTables.some(t => !t.size);
      
      if (needsSize) {
        setStep('SIZE_SELECT');
        return;
      }
    }
    completeTableSave(action);
  };

  // --- RENDER ---
  const selectedCount = selectedIds.size;
  const isSelectionActive = selectedCount > 0;
  const firstSelectedId = selectedIds.values().next().value;

  return (
    <div className="min-h-[100dvh] flex flex-col relative text-white">
      
      {/* 1. HEADER */}
      <div className="fixed top-0 left-0 w-full z-40 bg-midnight/80 backdrop-blur-xl border-b border-white/5 pt-[env(safe-area-inset-top)] shadow-lg flex flex-col">
        <div className="flex justify-between items-center h-14 px-4">
          <button onClick={onBack} className="p-2 -ml-2 text-white/60 active:text-white rounded-full active:bg-white/10 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          </button>
          <div className="text-[11px] text-white/40 font-bold font-mono tracking-widest">{completedTables} / {totalTables} HOTOVO</div>
          <div className="w-8" /> 
        </div>
        {/* Animated Progress Line */}
        <div className="w-full h-[2px] bg-white/5 relative overflow-hidden">
           <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-success to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-700 ease-out" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* 2. GROUPED MAP */}
      <div 
        onClick={(e) => { if(e.target === e.currentTarget) clearSelection(); }}
        className="flex-1 pt-[calc(4.5rem+env(safe-area-inset-top))] pb-[calc(28rem)] px-2 overflow-y-auto"
      >
         <div className="mb-6 ml-2 mr-2 mt-4 flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/70 mb-1 leading-tight">{project.name}</h2>
              <div className="text-xs text-white/40 font-bold uppercase tracking-widest">Přehled pole</div>
            </div>
            <div className="text-right">
              <span className="text-4xl font-black text-success text-shadow leading-none">{progressPercent}%</span>
            </div>
         </div>
         
         <div className="space-y-6">
            {tableGroups.map(([prefix, groupItems]) => {
              const groupDone = groupItems.filter(t => t.status === TableStatus.DONE).length;
              const groupTotal = groupItems.length;
              const isGroupDone = groupDone === groupTotal;
              const isGroupSelected = groupItems.every(t => selectedIds.has(t.id));
              return (
                <div key={prefix} className="relative bg-surface/50 backdrop-blur-md rounded-3xl p-3 border border-white/5 shadow-sm">
                  <div className="flex justify-between items-center px-2 mb-3 mt-1">
                    <div className="flex items-center gap-2">
                       <span className={`text-sm font-bold tracking-wider ${isGroupDone ? 'text-success' : 'text-white/70'}`}>{prefix}</span>
                       <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded-md font-mono">{groupDone}/{groupTotal}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleGroupSelect(groupItems); }} className={`text-[10px] px-3 py-1.5 rounded-lg border font-bold uppercase tracking-wide transition-all ${isGroupSelected ? 'bg-solar-gradient text-white border-transparent shadow-glow' : 'bg-white/5 text-white/40 border-white/5 active:bg-white/10'}`}>{isGroupSelected ? 'Zrušit' : 'Vybrat'}</button>
                  </div>
                  <div className="grid grid-cols-4 gap-2.5">
                    {groupItems.map(t => <TableCell key={t.id} table={t} isSelected={selectedIds.has(t.id)} onTap={handleTap} onLongPress={(t) => { handleTap(t); }} />)}
                  </div>
                </div>
              );
            })}
         </div>
         <div className="text-center text-white/20 text-sm py-12 font-medium">Kliknutím do prázdna zrušíte výběr.</div>
      </div>

      {/* 3. SHEET: TABLE ACTIONS (Floating Glass) */}
      <div 
        className={`fixed bottom-0 left-0 w-full bg-surface/90 backdrop-blur-2xl rounded-t-[2.5rem] border-t border-white/10 shadow-[0_-10px_60px_rgba(0,0,0,0.5)] transition-transform duration-300 z-50 flex flex-col ${isSelectionActive ? 'translate-y-0' : 'translate-y-[120%]'} `}
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        {isSelectionActive && (
          <>
            <div className="w-full flex justify-center pt-3 pb-1" onClick={clearSelection}><div className="w-12 h-1 bg-white/10 rounded-full" /></div>
            <div className="p-5 pt-2 space-y-5">
              <div className="flex justify-between items-baseline">
                <h3 className="text-2xl font-black text-white">{selectedCount === 1 ? firstSelectedId : `${selectedCount} stolů`}</h3>
                {selectedCount > 1 && <span className="text-xs text-solar-start font-bold uppercase tracking-widest bg-solar-start/10 px-2 py-1 rounded">Hromadná akce</span>}
              </div>

              {rangeOffer && step === 'MAIN' && (
                <div className="animate-fade-in bg-gradient-to-r from-electric/20 to-blue-600/10 border border-electric/30 rounded-2xl p-4 flex justify-between items-center">
                  <div className="text-xs text-blue-200"><span className="block font-bold text-sm text-white mb-1">Doplnit mezeru?</span>Chybí vybrat {rangeOffer.rangeIds.length} stolů ({rangeOffer.min + 1}-{rangeOffer.max - 1})</div>
                  <button onClick={handleFillRange} className="bg-electric text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg active:scale-95 hover:bg-blue-400 transition-colors">Vybrat vše</button>
                </div>
              )}

              {step === 'MAIN' ? (
                <>
                  {/* ACTIONS FIRST */}
                  <div className="grid grid-cols-3 gap-3">
                    <button onClick={() => handleMainAction('DONE')} className="col-span-2 bg-solar-gradient text-white h-16 rounded-2xl font-bold text-xl shadow-glow active:scale-[0.98] transition-transform flex items-center justify-center gap-2 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-white/20 group-hover:bg-white/10 transition-colors" />
                      <span className="relative z-10">HOTOVO</span>
                    </button>
                    
                    {/* More Actions Button */}
                    <button 
                      onClick={() => setStep('MORE_ACTIONS')}
                      className="bg-white/5 text-white/70 border border-white/5 h-16 rounded-2xl font-bold text-sm active:bg-white/10 transition-colors flex flex-col items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mb-0.5 opacity-60">
                         <path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM10 8.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM11.5 15.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z" />
                      </svg>
                      Další
                    </button>
                  </div>

                  {/* SETTINGS SECOND */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <div className="flex justify-between items-center mb-1 px-1">
                      <span className="text-[10px] uppercase text-white/30 font-bold tracking-widest">Parametry zápisu</span>
                    </div>
                    <div className="flex gap-2">
                       {/* Worker Select */}
                       <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1">
                        {['JÁ', 'Tým A', 'Tým B'].map(w => (
                          <button key={w} onClick={() => changeWorker(w)} className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-colors whitespace-nowrap ${worker === w ? 'bg-white text-slate-900 border-white shadow-lg' : 'bg-white/5 border-white/5 text-white/40'}`}>{w}</button>
                        ))}
                       </div>
                       
                       {/* New Time Button */}
                       <button 
                         onClick={() => setStep('TIME_PICKER')}
                         className="flex items-center gap-2 bg-white/5 border border-white/5 px-4 py-2 rounded-xl active:bg-white/10 transition-colors flex-shrink-0"
                       >
                         <div className="w-8 h-8 rounded-full bg-solar-start/20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-solar-start">
                              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
                            </svg>
                         </div>
                         <div className="text-left leading-none">
                            <div className="text-[9px] text-white/40 uppercase tracking-widest font-bold mb-0.5">Kdy?</div>
                            <div className="font-bold text-sm text-white font-mono">{timeRange.start}-{timeRange.end}</div>
                         </div>
                       </button>
                    </div>
                  </div>
                </>
              ) : step === 'MORE_ACTIONS' ? (
                 /* MORE ACTIONS MENU */
                 <div className="animate-fade-in space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <h4 className="font-bold text-white text-lg">Další možnosti</h4>
                      <button onClick={() => setStep('MAIN')} className="p-2 bg-white/5 rounded-full text-white/50 active:text-white active:bg-white/10">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                       <button 
                         onClick={() => handleMainAction('IN_PROGRESS')} 
                         className="bg-solar-start/10 text-solar-start border border-solar-start/20 h-24 rounded-2xl font-bold text-base flex flex-col items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                       >
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 opacity-50"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" /></svg>
                         ROZDĚLANÉ
                       </button>
                       <button 
                         onClick={() => handleMainAction('ISSUE')} 
                         className="bg-danger/10 text-danger border border-danger/20 h-24 rounded-2xl font-bold text-base flex flex-col items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                       >
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 opacity-50"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                         PROBLÉM
                       </button>
                    </div>
                 </div>
              ) : step === 'TIME_PICKER' ? (
                /* TIME PICKER MODAL inside Sheet */
                <div className="animate-fade-in space-y-4">
                   <h4 className="text-center font-bold text-white text-lg">Upravit čas</h4>
                   <TimeRangePicker 
                     initialStart={timeRange.start}
                     initialEnd={timeRange.end}
                     onConfirm={(s, e) => handleTimeConfirm(s, e)}
                     onCancel={() => setStep('MAIN')}
                   />
                </div>
              ) : (
                /* SIZE SELECT */
                <div className="animate-fade-in space-y-4">
                  <div className="text-center text-white/60 text-sm font-medium">Vyberte velikost pro {selectedCount} stolů</div>
                  <div className="grid grid-cols-3 gap-3 h-32">
                     {[TableSize.SMALL, TableSize.MEDIUM, TableSize.LARGE].map(size => (
                       <button 
                         key={size}
                         onClick={() => completeTableSave('DONE', size)} 
                         className={`
                           border rounded-2xl font-black text-2xl active:scale-95 transition-all relative overflow-hidden
                           ${size === TableSize.SMALL ? 'bg-success/10 border-success/30 text-success hover:bg-success/20' : ''}
                           ${size === TableSize.MEDIUM ? 'bg-electric/10 border-electric/30 text-electric hover:bg-electric/20' : ''}
                           ${size === TableSize.LARGE ? 'bg-solar-start/10 border-solar-start/30 text-solar-start hover:bg-solar-start/20' : ''}
                           ${lastSize === size ? 'ring-2 ring-white scale-105' : ''}
                         `}
                       >
                         {size}
                         {lastSize === size && <div className="text-[9px] uppercase mt-1 text-white/50 font-bold absolute bottom-2 w-full text-center">Naposledy</div>}
                       </button>
                     ))}
                  </div>
                  <button onClick={() => setStep('MAIN')} className="w-full py-4 text-white/40 text-sm font-bold active:text-white transition-colors">Zpět</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}