import React, { useMemo, useState, useRef } from 'react';
import { Project, TableSize, Table, TableStatus, groupTablesBySection } from '../../domain';
import { useFieldSelection } from './useFieldSelection';
import { FieldOverlay } from './FieldOverlay';

interface FieldMapProps {
  project: Project;
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
  onNavigate: (tab: 'TEAM' | 'STATS' | 'CHAT' | 'MENU') => void;
}

// --- TABLE CELL (Animated Visual States) ---

interface TableCellProps {
  table: Table;
  isSelected: boolean;
  onTap: (t: Table) => void;
  onLongPress: (t: Table) => void;
}

const TableCell: React.FC<TableCellProps> = ({ table, isSelected, onTap, onLongPress }) => {
  const timerRef = useRef<number | null>(null);
  const isPressedRef = useRef(false);

  // Pointer Logic to handle Long Press vs Tap without preventing scroll
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

  // Status Logic
  const isDone = table.status === TableStatus.DONE;
  const isIssue = table.status === TableStatus.ISSUE;
  const isInProgress = table.status === TableStatus.IN_PROGRESS;

  // 1. Container Styling (Transitions & Colors)
  let containerBase = "aspect-square rounded-2xl flex flex-col items-center justify-center relative select-none cursor-pointer overflow-visible touch-manipulation backdrop-blur-sm border transform-gpu transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)";
  
  // Define states
  let stateClass = "";
  if (isSelected) {
    // Pop Effect for Selection
    stateClass = "bg-solar-gradient border-transparent shadow-glow z-20 scale-95 ring-2 ring-white/30";
  } else {
    // Standard States
    const activeHover = "active:scale-90 hover:scale-[1.02]"; // Tactile feedback
    
    if (isDone) {
      stateClass = `bg-success/10 border-success/20 shadow-[0_0_15px_rgba(16,185,129,0.15)] ${activeHover}`;
    } else if (isInProgress) {
      stateClass = `bg-solar-start/10 border-solar-start/20 shadow-[0_0_15px_rgba(34,211,238,0.15)] ${activeHover}`;
    } else if (isIssue) {
      stateClass = `bg-danger/10 border-danger/20 shadow-[0_0_15px_rgba(248,113,113,0.15)] ${activeHover}`;
    } else {
      stateClass = `bg-white/5 border-white/10 hover:bg-white/10 ${activeHover}`;
    }
  }

  // 2. Text Styling
  let textClass = "leading-none text-xl transition-all duration-300 ";
  if (isSelected) textClass += "text-white font-black scale-110";
  else if (isDone) textClass += "text-success font-bold text-shadow-sm";
  else if (isInProgress) textClass += "text-solar-start font-bold text-shadow-sm";
  else if (isIssue) textClass += "text-danger font-bold text-shadow-sm";
  else textClass += "text-white/40 group-hover:text-white/60";

  // 3. Indicator Dot (Status)
  const renderIndicator = () => {
    if (isSelected) return null;
    if (isDone) return <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-success rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse-subtle" />;
    if (isInProgress) return <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-solar-start rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse" />;
    if (isIssue) return <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-danger rounded-full shadow-[0_0_8px_rgba(248,113,113,0.8)]" />;
    return null;
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerCancel}
      onPointerCancel={handlePointerCancel}
      className={`${containerBase} ${stateClass} group`}
    >
      <span className={textClass}>
        {table.label || table.id}
      </span>
      
      {table.size && !isDone && !isSelected && (
        <span className="text-[9px] text-white/30 font-bold absolute bottom-1.5 tracking-wider transition-opacity duration-300 group-hover:text-white/50">{table.size}</span>
      )}
      
      {renderIndicator()}
      
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-white text-solar-end rounded-full w-5 h-5 flex items-center justify-center shadow-lg border-2 border-midnight z-30 animate-[zoomIn_0.2s_ease-out]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
        </div>
      )}
    </div>
  );
};

// --- MAIN SCREEN ---

export const FieldMap: React.FC<FieldMapProps> = ({ project, onBack, onSave, onNavigate }) => {
  const tables = project.tables || [];
  const { selectedIds, lastInteractedId, toggle, focus, selectGroup, clear, count, hasSelection } = useFieldSelection();
  const [isEditing, setIsEditing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Search State
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter Tables based on Search
  const filteredTables = useMemo(() => {
    if (!searchQuery.trim()) return tables;
    const lowerQuery = searchQuery.toLowerCase();
    return tables.filter(t => t.label.toLowerCase().includes(lowerQuery));
  }, [tables, searchQuery]);

  // Grouping logic (always runs on filtered tables)
  const tableGroups = useMemo(() => groupTablesBySection(filteredTables), [filteredTables]);

  const totalTables = tables.length;
  const completedTables = tables.filter(t => t.status === TableStatus.DONE).length;
  const progressPercent = totalTables > 0 ? Math.round((completedTables / totalTables) * 100) : 0;

  // Handlers
  const handleTap = (t: Table) => {
    if (isEditing) {
      // Logic Improvement: If editing, tapping a table brings it into focus in the Overlay
      focus(t.id);
    } else {
      toggle(t.id);
    }
  };

  const handleGroupTap = (group: Table[]) => {
    if (isEditing) return;
    selectGroup(group);
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const closeSearch = () => {
    setSearchQuery("");
    setIsSearchActive(false);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col relative text-white bg-midnight">
      
      {/* 1. HEADER */}
      <div className="fixed top-0 left-0 w-full z-40 bg-midnight/30 backdrop-blur-xl border-b border-white/10 pt-[env(safe-area-inset-top)] shadow-lg flex flex-col transition-all duration-300">
        
        {isSearchActive ? (
          // SEARCH MODE HEADER
          <div className="flex items-center h-12 px-2 animate-fade-in">
             <div className="flex-1 bg-white/10 rounded-xl flex items-center px-3 mx-2 border border-white/10 focus-within:border-solar-start/50 focus-within:bg-white/15 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white/40">
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                </svg>
                <input 
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Hledat stůl (např. 2E...)"
                  className="w-full bg-transparent border-none text-white font-bold placeholder-white/30 focus:ring-0 px-2 py-2.5 text-sm"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="p-1 rounded-full bg-white/10 text-white/50">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                )}
             </div>
             <button onClick={closeSearch} className="px-3 text-sm font-bold text-white/50 active:text-white">
                Zrušit
             </button>
          </div>
        ) : (
          // NORMAL HEADER
          <div className="flex justify-between items-center h-12 px-4 animate-fade-in">
            <button onClick={onBack} className="p-2 -ml-2 text-white/60 active:text-white rounded-full active:bg-white/10 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <div className="flex flex-col items-center">
               <span className="text-sm font-bold text-white tracking-wide text-shadow-sm">{project.name}</span>
               <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{completedTables} / {totalTables} HOTOVO</span>
            </div>
            <div className="flex items-center -mr-2">
              <button 
                onClick={() => setIsSearchActive(true)}
                className="p-2 text-white/60 active:text-white rounded-full active:bg-white/10 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
                </svg>
              </button>
              <button 
                onClick={() => setIsMenuOpen(true)}
                className="p-2 text-white/60 active:text-white rounded-full active:bg-white/10 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        {/* Progress bar hidden during search to reduce noise */}
        {!isSearchActive && (
          <div className="w-full h-[2px] bg-white/5 relative overflow-hidden">
             <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-success to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.8)] transition-all duration-700 ease-out" style={{ width: `${progressPercent}%` }} />
          </div>
        )}
      </div>

      {/* 2. GRID (The Work Surface) */}
      <div 
        onClick={(e) => { 
          if(e.target === e.currentTarget && !isEditing) clear(); 
        }}
        className="flex-1 pt-[calc(4rem+env(safe-area-inset-top))] pb-32 px-2 overflow-y-auto"
      >
         {filteredTables.length === 0 ? (
           <div className="flex flex-col items-center justify-center pt-20 opacity-50 space-y-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-white/50">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <div className="text-sm font-bold text-white/50">Žádný stůl nenalezen</div>
           </div>
         ) : (
           <div className="space-y-6 mt-4">
              {tableGroups.map(([prefix, groupItems]) => {
                const groupDone = groupItems.filter(t => t.status === TableStatus.DONE).length;
                const groupTotal = groupItems.length;
                const isGroupDone = groupDone === groupTotal;
                const isGroupSelected = groupItems.every(t => selectedIds.has(t.id));
                
                return (
                  <div key={prefix} className="relative glass-base rounded-[32px] p-4 transition-all animate-fade-in">
                    <div className="flex justify-between items-center px-2 mb-4 mt-1 sticky top-0 bg-midnight/50 backdrop-blur-sm z-10 py-2 -mx-2 px-4 rounded-xl">
                      <div className="flex items-center gap-3">
                         <span className={`text-sm font-black tracking-wider ${isGroupDone ? 'text-success' : 'text-white/80'}`}>{prefix}</span>
                         <span className="text-[9px] font-bold text-white/30 bg-white/5 px-2 py-1 rounded-lg tracking-widest">{groupDone}/{groupTotal}</span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); handleGroupTap(groupItems); }} className={`text-[10px] px-3 py-1.5 rounded-lg border font-bold uppercase tracking-wide transition-all ${isGroupSelected ? 'bg-solar-gradient text-white border-transparent shadow-glow' : 'bg-white/5 text-white/40 border-white/5 active:bg-white/10'}`}>{isGroupSelected ? 'Zrušit' : 'Vybrat'}</button>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2.5">
                      {groupItems.map(t => (
                        <TableCell 
                          key={t.id} 
                          table={t} 
                          isSelected={selectedIds.has(t.id)} 
                          onTap={handleTap} 
                          onLongPress={handleTap} 
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
           </div>
         )}
      </div>

      {/* 3. STICKY ACTION BAR (Trigger for Editing) */}
      {hasSelection && !isEditing && (
        <div className="fixed bottom-0 left-0 w-full p-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] z-40 animate-slide-up">
           <div className="glass-base rounded-[24px] p-2 pl-5 pr-2 flex items-center justify-between border-white/10 bg-midnight/90 shadow-2xl">
               <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-white">{count}</span>
                  <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Vybráno</span>
               </div>
               <div className="flex items-center gap-2">
                   <button 
                     onClick={clear}
                     className="w-12 h-12 rounded-2xl flex items-center justify-center text-white/40 hover:text-white active:bg-white/10 transition-colors"
                   >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                   </button>
                   
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

      {/* 4. OVERLAY (The Editing Surface) */}
      <FieldOverlay 
        isOpen={isEditing}
        selectedIds={selectedIds}
        projectTables={tables}
        onClose={() => setIsEditing(false)}
        onClearSelection={clear}
        onSave={onSave}
        focusedId={lastInteractedId} // Pass focus state
      />

      {/* 5. MENU */}
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

    </div>
  );
};
