import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Project, ProjectMode, TableSize, WorkType, Table, TableStatus, groupTablesBySection } from '../../domain';
import { TimeRangePicker } from '../../ui/TimeRangePicker';
import { storage, KEYS } from '../../lib/storage';

interface FieldMapProps {
  project: Project;
  onBack: () => void;
  onSave: (data: { type: WorkType; tableId?: string; tableIds?: string[]; size?: TableSize; duration: number; startTime?: number; endTime?: number; note?: string; status?: TableStatus }) => void;
  onNavigate: (tab: 'TEAM' | 'STATS' | 'CHAT' | 'MENU') => void;
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

  // Visual Logic: Glass Base for everything, colored tints for status
  let bgClass = 'bg-white/5 border-white/10 hover:bg-white/10'; // Default Glass Cell
  let textClass = 'text-white/40'; 
  let statusIndicator = null;

  if (isDone) {
    bgClass = 'bg-success/10 border-success/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]';
    textClass = 'text-success font-bold text-shadow-sm';
    statusIndicator = <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-success rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />;
  } else if (isInProgress) {
    bgClass = 'bg-solar-start/10 border-solar-start/20 shadow-[0_0_15px_rgba(34,211,238,0.15)]';
    textClass = 'text-solar-start font-bold text-shadow-sm';
    statusIndicator = <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-solar-start rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]" />;
  } else if (isIssue) {
    bgClass = 'bg-danger/10 border-danger/20 shadow-[0_0_15px_rgba(248,113,113,0.15)]';
    textClass = 'text-danger font-bold text-shadow-sm';
    statusIndicator = <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-danger rounded-full shadow-[0_0_8px_rgba(248,113,113,0.8)]" />;
  }

  // Selected State: High contrast gradient
  const selectionClass = isSelected 
    ? 'bg-solar-gradient border-transparent shadow-glow z-20 scale-[0.96] text-white ring-1 ring-white/30' 
    : `border backdrop-blur-sm ${bgClass} active:scale-95 transition-all duration-200`;

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerCancel}
      onPointerCancel={handlePointerCancel}
      className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative select-none cursor-pointer overflow-visible touch-manipulation ${selectionClass}`}
    >
      <span className={`leading-none text-xl transition-transform ${isSelected ? 'scale-110 font-black' : 'font-bold'} ${!isSelected && textClass}`}>
        {table.label || table.id}
      </span>
      
      {table.size && !isDone && !isSelected && (
        <span className="text-[9px] text-white/30 font-bold absolute bottom-1.5 tracking-wider">{table.size}</span>
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

// --- SIZE TOGGLE ROW COMPONENT ---

interface SizeRowProps {
  table: Table;
  currentSize: TableSize | undefined;
  onChange: (id: string, size: TableSize) => void;
}

const SizeRow: React.FC<SizeRowProps> = ({ table, currentSize, onChange }) => {
  return (
    <div className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/5">
      <span className="font-bold text-white text-lg tracking-wide pl-2">{table.label}</span>
      <div className="flex bg-black/40 rounded-lg p-1 gap-1">
        {[TableSize.SMALL, TableSize.MEDIUM, TableSize.LARGE].map(size => {
           const isActive = currentSize === size;
           return (
             <button
               key={size}
               onClick={() => onChange(table.id, size)}
               className={`w-10 h-8 rounded-md text-xs font-bold transition-all ${isActive ? 'bg-solar-start text-black shadow-sm' : 'text-white/40 hover:text-white/60'}`}
             >
               {size}
             </button>
           );
        })}
      </div>
    </div>
  );
};

// --- MAIN SCREEN ---

export const FieldMap: React.FC<FieldMapProps> = ({ project, onBack, onSave, onNavigate }) => {
  const tables = project.tables || [];

  // Local Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // Pending Sizes for Selection (ID -> Size)
  const [pendingSizes, setPendingSizes] = useState<Record<string, TableSize>>({});

  // Workflow State: 'SELECTING' vs 'EDITING'
  // Nejdřív výběr (isEditing = false), potom editace (isEditing = true)
  const [isEditing, setIsEditing] = useState(false);

  const [worker, setWorker] = useState(() => storage.get(KEYS.LAST_WORKER, "JÁ"));
  const [timeRange, setTimeRange] = useState(() => storage.get(KEYS.LAST_TIMERANGE, { start: "07:00", end: "16:00" }));
  const [sheetMode, setSheetMode] = useState<'DEFAULT' | 'TIME' | 'MORE_ACTIONS'>('DEFAULT');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const tableGroups = useMemo(() => groupTablesBySection(tables), [tables]);
  const totalTables = tables.length;
  const completedTables = tables.filter(t => t.status === TableStatus.DONE).length;
  const progressPercent = totalTables > 0 ? Math.round((completedTables / totalTables) * 100) : 0;
  
  // Selection Handlers
  const handleTap = (table: Table) => {
    const newSet = new Set(selectedIds);
    const newSizes = { ...pendingSizes };

    if (newSet.has(table.id)) {
      newSet.delete(table.id);
      delete newSizes[table.id];
    } else {
      newSet.add(table.id);
      // Initialize with existing size or default to Medium
      if (!newSizes[table.id]) {
        newSizes[table.id] = table.size || TableSize.MEDIUM;
      }
    }
    
    // IMPORTANT: Interaction never opens edit sheet automatically
    setSelectedIds(newSet);
    setPendingSizes(newSizes);
    
    // If we deselected everything, ensure we exit edit mode
    if (newSet.size === 0) {
      setIsEditing(false);
    }
  };

  const handleGroupSelect = (groupTables: Table[]) => {
    const newSet = new Set(selectedIds);
    const newSizes = { ...pendingSizes };
    let allSelected = true;
    for (const t of groupTables) {
      if (!newSet.has(t.id)) { allSelected = false; break; }
    }
    
    if (allSelected) {
        groupTables.forEach(t => {
          newSet.delete(t.id);
          delete newSizes[t.id];
        });
    } else { 
        groupTables.forEach(t => {
          newSet.add(t.id);
          if (!newSizes[t.id]) {
             newSizes[t.id] = t.size || TableSize.MEDIUM;
          }
        }); 
        if (navigator.vibrate) navigator.vibrate(50); 
    }
    
    setSelectedIds(newSet);
    setPendingSizes(newSizes);
    if (newSet.size === 0) setIsEditing(false);
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setPendingSizes({});
    setSheetMode('DEFAULT');
    setIsEditing(false); // Reset workflow
  };

  const handleSizeChange = (id: string, size: TableSize) => {
    setPendingSizes(prev => ({ ...prev, [id]: size }));
  };

  // Execution
  const executeSave = (status: TableStatus) => {
    const startEpoch = getEpoch(timeRange.start);
    const endEpoch = getEpoch(timeRange.end);
    const duration = Math.max(0, Math.floor((endEpoch - startEpoch) / 60000));

    // Group tables by their selected size to save efficiently
    const idsBySize: Record<string, string[]> = {};

    Array.from(selectedIds).forEach(id => {
      const size = pendingSizes[id] || TableSize.MEDIUM;
      if (!idsBySize[size]) idsBySize[size] = [];
      idsBySize[size].push(id);
    });

    // Execute save for each size group
    Object.entries(idsBySize).forEach(([size, ids]) => {
      onSave({
        type: WorkType.TABLE,
        tableIds: ids,
        size: size as TableSize,
        duration, 
        startTime: startEpoch,
        endTime: endEpoch,
        status,
        note: status === TableStatus.ISSUE ? 'Nahlášen problém' : undefined
      });
    });

    clearSelection();
    if (navigator.vibrate) navigator.vibrate([50]);
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

  const selectedCount = selectedIds.size;
  const hasSelection = selectedCount > 0;
  
  // Get selected table objects for the list
  const selectedTablesList = tables.filter(t => selectedIds.has(t.id));

  return (
    <div className="min-h-[100dvh] flex flex-col relative text-white bg-midnight">
      
      {/* 1. COMPACT HEADER */}
      <div className="fixed top-0 left-0 w-full z-40 bg-midnight/30 backdrop-blur-xl border-b border-white/10 pt-[env(safe-area-inset-top)] shadow-lg flex flex-col transition-all duration-300">
        <div className="flex justify-between items-center h-12 px-4">
          <button onClick={onBack} className="p-2 -ml-2 text-white/60 active:text-white rounded-full active:bg-white/10 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div className="flex flex-col items-center">
             <span className="text-sm font-bold text-white tracking-wide text-shadow-sm">{project.name}</span>
             <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{completedTables} / {totalTables} HOTOVO</span>
          </div>
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-2 -mr-2 text-white/60 active:text-white rounded-full active:bg-white/10 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="w-full h-[2px] bg-white/5 relative overflow-hidden">
           <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-success to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.8)] transition-all duration-700 ease-out" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* 2. SCROLLABLE MAP */}
      <div 
        onClick={(e) => { 
          // Clicking empty space clears selection
          if(e.target === e.currentTarget) clearSelection(); 
        }}
        // PB-32 ENSURES STICKY BAR DOES NOT OVERLAP CONTENT
        className="flex-1 pt-[calc(4rem+env(safe-area-inset-top))] pb-32 px-2 overflow-y-auto"
      >
         <div className="space-y-6 mt-4">
            {tableGroups.map(([prefix, groupItems]) => {
              const groupDone = groupItems.filter(t => t.status === TableStatus.DONE).length;
              const groupTotal = groupItems.length;
              const isGroupDone = groupDone === groupTotal;
              const isGroupSelected = groupItems.every(t => selectedIds.has(t.id));
              
              return (
                <div key={prefix} className="relative glass-base rounded-[32px] p-4 transition-all">
                  <div className="flex justify-between items-center px-2 mb-4 mt-1">
                    <div className="flex items-center gap-3">
                       <span className={`text-sm font-black tracking-wider ${isGroupDone ? 'text-success' : 'text-white/80'}`}>{prefix}</span>
                       <span className="text-[9px] font-bold text-white/30 bg-white/5 px-2 py-1 rounded-lg tracking-widest">{groupDone}/{groupTotal}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleGroupSelect(groupItems); }} className={`text-[10px] px-3 py-1.5 rounded-lg border font-bold uppercase tracking-wide transition-all ${isGroupSelected ? 'bg-solar-gradient text-white border-transparent shadow-glow' : 'bg-white/5 text-white/40 border-white/5 active:bg-white/10'}`}>{isGroupSelected ? 'Zrušit' : 'Vybrat'}</button>
                  </div>
                  
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
      </div>

      {/* 3. MENU OVERLAY */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end bg-midnight/90 backdrop-blur-xl animate-fade-in" onClick={() => setIsMenuOpen(false)}>
           <div className="p-6 pb-[calc(3rem+env(safe-area-inset-bottom))] space-y-4" onClick={e => e.stopPropagation()}>
              <h3 className="text-white/50 text-xs font-bold uppercase tracking-[0.2em] mb-4 text-center">Navigace Projektu</h3>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => onNavigate('TEAM')} className="glass-base p-6 rounded-[24px] flex flex-col items-center gap-3 active:scale-95 transition-all border-white/10 hover:bg-white/5">
                   <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-2xl shadow-glow">👷</div>
                   <span className="text-white font-bold tracking-wide">Tým</span>
                </button>
                <button onClick={() => onNavigate('STATS')} className="glass-base p-6 rounded-[24px] flex flex-col items-center gap-3 active:scale-95 transition-all border-white/10 hover:bg-white/5">
                   <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl shadow-glow">📊</div>
                   <span className="text-white font-bold tracking-wide">Statistiky</span>
                </button>
              </div>
              <button onClick={() => onNavigate('CHAT')} className="w-full glass-base p-5 rounded-[24px] flex items-center justify-between px-8 active:scale-[0.98] transition-all border-white/10 hover:bg-white/5">
                 <span className="text-white font-bold tracking-wide">Deník & Chat</span>
                 <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-lg shadow-glow">💬</div>
              </button>
              <div className="pt-4">
                 <button onClick={() => setIsMenuOpen(false)} className="w-full py-4 text-white/40 font-bold text-sm tracking-widest uppercase rounded-2xl border border-white/5 active:bg-white/5">Zavřít</button>
              </div>
           </div>
        </div>
      )}

      {/* 4. SELECTION STICKY BAR (Visible when selecting but NOT editing) */}
      {/* This is the lightweight interaction layer. */}
      {hasSelection && !isEditing && (
        <div className="fixed bottom-0 left-0 w-full p-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] z-40 animate-slide-up">
           <div className="glass-base rounded-[24px] p-2 pl-5 pr-2 flex items-center justify-between border-white/10 bg-midnight/90 shadow-2xl">
               <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-white">{selectedCount}</span>
                  <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Vybráno</span>
               </div>
               <div className="flex items-center gap-2">
                   {/* Compact Cancel Button */}
                   <button 
                     onClick={clearSelection}
                     className="w-12 h-12 rounded-2xl flex items-center justify-center text-white/40 hover:text-white active:bg-white/10 transition-colors"
                   >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                   </button>
                   
                   {/* Edit Trigger Button */}
                   <button 
                     onClick={() => setIsEditing(true)}
                     className="h-12 px-6 bg-solar-gradient rounded-xl font-bold text-white shadow-glow active:scale-95 transition-all flex items-center gap-2"
                   >
                     <span>Upravit</span>
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" /><path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" /></svg>
                   </button>
               </div>
           </div>
        </div>
      )}

      {/* 5. WORKFLOW BOTTOM SHEET (Visible ONLY when editing) */}
      <div 
        className={`fixed bottom-0 left-0 w-full bg-midnight/90 backdrop-blur-xl rounded-t-[32px] border-t border-white/10 shadow-[0_-20px_60px_rgba(0,0,0,0.6)] transition-transform duration-300 z-50 flex flex-col max-h-[85vh] ${hasSelection && isEditing ? 'translate-y-0' : 'translate-y-[110%]'} `}
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        {hasSelection && (
          <div className="flex flex-col h-full">
            
            {/* Handle minimizes back to selection bar */}
            <div className="w-full flex justify-center pt-3 pb-2 cursor-pointer active:opacity-50 flex-shrink-0" onClick={() => setIsEditing(false)}>
              <div className="w-12 h-1.5 bg-white/20 rounded-full" />
            </div>

            <div className="px-5 pt-1 space-y-5 flex-col flex h-full overflow-hidden">
              
              <div className="flex justify-between items-end min-h-[2rem] flex-shrink-0">
                <h3 className="text-3xl font-black text-white leading-none tracking-tight text-shadow-sm">
                  {selectedCount} <span className="text-lg font-bold text-white/40">vybráno</span>
                </h3>
                <button onClick={clearSelection} className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-3 py-1 bg-white/5 rounded-lg border border-white/5">Zrušit</button>
              </div>

              {sheetMode === 'DEFAULT' ? (
                <>
                  {/* INDIVIDUAL SIZE SELECTOR LIST */}
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 -mr-1 min-h-[100px]">
                    {selectedTablesList.map(table => (
                      <SizeRow 
                        key={table.id} 
                        table={table} 
                        currentSize={pendingSizes[table.id]} 
                        onChange={handleSizeChange}
                      />
                    ))}
                  </div>

                  {/* CONTEXT ROW */}
                  <div className="flex gap-3 flex-shrink-0 mt-3">
                    <button 
                      onClick={toggleWorker}
                      className="flex-1 glass-base rounded-2xl p-3 flex flex-col items-start active:bg-white/10 transition-colors relative overflow-hidden border-white/10 hover:border-white/20"
                    >
                      <div className="text-[10px] uppercase text-white/40 font-bold tracking-widest mb-1">Kdo</div>
                      <div className="flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full shadow-glow ${worker === 'JÁ' ? 'bg-solar-start' : 'bg-electric'}`} />
                         <span className="text-lg font-bold text-white">{worker}</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => setSheetMode('TIME')}
                      className="flex-1 glass-base rounded-2xl p-3 flex flex-col items-start active:bg-white/10 transition-colors relative overflow-hidden border-white/10 hover:border-white/20"
                    >
                      <div className="text-[10px] uppercase text-white/40 font-bold tracking-widest mb-1">Kdy</div>
                      <div className="flex items-center gap-2">
                         <span className="text-lg font-bold text-white font-mono tracking-tight">{timeRange.start}-{timeRange.end}</span>
                      </div>
                    </button>
                  </div>

                  <button 
                    onClick={() => executeSave(TableStatus.DONE)}
                    className="w-full h-16 rounded-2xl font-black text-xl shadow-glow transition-all flex items-center justify-center gap-3 relative overflow-hidden group bg-solar-gradient text-white active:scale-[0.98] flex-shrink-0 mt-2"
                  >
                    <div className="absolute inset-0 bg-white/20 group-hover:bg-white/10 transition-colors" />
                    <span className="tracking-wide text-shadow-sm">DOKONČIT</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-white/80"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                  </button>

                  <div className="flex justify-center pt-2 pb-2 flex-shrink-0">
                     <button 
                       onClick={() => setSheetMode('MORE_ACTIONS')}
                       className="text-[10px] font-bold text-white/30 uppercase tracking-widest py-2 px-4 rounded-lg active:bg-white/5 hover:text-white/50 transition-colors"
                     >
                       Další možnosti
                     </button>
                  </div>
                </>
              ) : sheetMode === 'TIME' ? (
                /* TIME PICKER MODE */
                <div className="animate-fade-in space-y-4 flex-1">
                   <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-lg tracking-tight">Upravit čas</h4>
                      <button onClick={() => setSheetMode('DEFAULT')} className="text-xs text-white/50 font-bold px-3 py-1 bg-white/5 rounded-lg border border-white/5">Zpět</button>
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
                <div className="animate-fade-in space-y-4 flex-1">
                  <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-lg tracking-tight">Další možnosti</h4>
                      <button onClick={() => setSheetMode('DEFAULT')} className="text-xs text-white/50 font-bold px-3 py-1 bg-white/5 rounded-lg border border-white/5">Zpět</button>
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                     <button 
                       onClick={() => executeSave(TableStatus.IN_PROGRESS)}
                       className="py-5 rounded-2xl glass-base text-white/50 text-xs font-bold uppercase tracking-wider active:bg-white/10 flex flex-col items-center justify-center gap-3 border-white/10"
                     >
                       <div className="w-3 h-3 rounded-full bg-solar-start shadow-[0_0_10px_rgba(34,211,238,0.5)]" /> Rozdělané
                     </button>
                     <button 
                       onClick={() => executeSave(TableStatus.ISSUE)}
                       className="py-5 rounded-2xl glass-base text-white/50 text-xs font-bold uppercase tracking-wider active:bg-white/10 flex flex-col items-center justify-center gap-3 border-white/10"
                     >
                       <div className="w-3 h-3 rounded-full bg-danger shadow-[0_0_10px_rgba(248,113,113,0.5)]" /> Problém
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