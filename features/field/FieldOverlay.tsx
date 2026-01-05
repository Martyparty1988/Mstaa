import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Table, TableSize, TableStatus, ProjectSettings, getStringsForSize, stringsToKwp } from '../../domain';
import { storage, KEYS } from '../../lib/storage';
import { TimeRangePicker } from '../../ui/TimeRangePicker';

interface FieldOverlayProps {
  isOpen: boolean;
  projectTables: Table[];
  settings?: ProjectSettings; // Added to support correct kWp calculations
  selectedIds: Set<string>;
  onClose: () => void;
  onClearSelection: () => void;
  onSave: (data: { 
    tableIds: string[]; 
    size?: TableSize; 
    duration: number; 
    startTime?: number; 
    endTime?: number; 
    note?: string; 
    status?: TableStatus 
  }) => void;
  focusedId?: string;
}

const ISSUE_TAGS = [
  "Chybí materiál", 
  "Poškozeno", 
  "Špatný terén", 
  "Chyba projektu", 
  "Překážka",
  "Jiné"
];

// Helper: Size Row
const SizeRow: React.FC<{ 
  label: string; 
  currentSize: TableSize; 
  onChange: (s: TableSize) => void;
  isFocused?: boolean;
}> = ({ label, currentSize, onChange, isFocused }) => (
  <div className={`flex items-center justify-between rounded-xl p-3 border transition-all duration-300 ${isFocused ? 'bg-white/10 border-solar-start/50 shadow-[0_0_15px_rgba(34,211,238,0.15)] scale-[1.02]' : 'bg-white/5 border-white/5'}`}>
    <span className={`font-bold text-lg tracking-wide pl-2 ${isFocused ? 'text-solar-start' : 'text-white'}`}>{label}</span>
    <div className="flex bg-black/40 rounded-lg p-1 gap-1">
      {[TableSize.SMALL, TableSize.MEDIUM, TableSize.LARGE].map(size => {
         const isActive = currentSize === size;
         return (
           <button
             key={size}
             onClick={() => onChange(size)}
             className={`w-10 h-8 rounded-md text-xs font-bold transition-all ${isActive ? 'bg-solar-start text-black shadow-sm' : 'text-white/40 hover:text-white/60'}`}
           >
             {size}
           </button>
         );
      })}
    </div>
  </div>
);

export const FieldOverlay: React.FC<FieldOverlayProps> = ({ 
  isOpen, 
  projectTables,
  settings, 
  selectedIds, 
  onClose, 
  onClearSelection, 
  onSave,
  focusedId
}) => {
  // Session State
  const [worker, setWorker] = useState(() => storage.get(KEYS.LAST_WORKER, "JÁ"));
  const [timeRange, setTimeRange] = useState(() => storage.get(KEYS.LAST_TIMERANGE, { start: "07:00", end: "16:00" }));
  const [pendingSizes, setPendingSizes] = useState<Record<string, TableSize>>({});
  
  // Issue State
  const [issueReason, setIssueReason] = useState<string | null>(null);
  const [issueNote, setIssueNote] = useState("");
  
  // UI Mode
  const [mode, setMode] = useState<'DEFAULT' | 'TIME' | 'ACTIONS' | 'ISSUE_DETAIL' | 'EXIT_CONFIRM'>('DEFAULT');

  // Refs
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Reset state on Open
  useEffect(() => {
    if (isOpen) {
      const newSizes: Record<string, TableSize> = {};
      selectedIds.forEach(id => {
        const t = projectTables.find(table => table.id === id);
        if (t) newSizes[id] = t.size || TableSize.MEDIUM; // Default to Medium if undefined
      });
      setPendingSizes(newSizes);
      setMode('DEFAULT');
      setIssueReason(null);
      setIssueNote("");
    }
  }, [isOpen, selectedIds, projectTables]);

  // Scroll to focus
  useEffect(() => {
    if (isOpen && focusedId && rowRefs.current[focusedId]) {
      rowRefs.current[focusedId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [focusedId, isOpen]);

  // --- Live Metrics Calculation ---
  const liveStats = useMemo(() => {
    let totalStrings = 0;
    const tableCount = selectedIds.size;

    selectedIds.forEach(id => {
      const size = pendingSizes[id] || TableSize.MEDIUM;
      totalStrings += getStringsForSize(size, settings);
    });

    const totalKwp = stringsToKwp(totalStrings, settings);

    return { tableCount, totalStrings, totalKwp };
  }, [selectedIds, pendingSizes, settings]);


  // --- Handlers ---

  const handleSizeChange = (id: string, size: TableSize) => {
    setPendingSizes(prev => ({ ...prev, [id]: size }));
  };

  const handleTimeConfirm = (start: string, end: string) => {
    const newVal = { start, end };
    setTimeRange(newVal);
    storage.set(KEYS.LAST_TIMERANGE, newVal);
    setMode('DEFAULT');
  };

  const toggleWorker = () => {
    const next = worker === "JÁ" ? "TÝM" : "JÁ";
    setWorker(next);
    storage.set(KEYS.LAST_WORKER, next);
  };

  const handleSafeClose = () => {
    // Basic "Dirty" check - simply checking if open is enough for this context as sizes are pre-filled
    // But for better UX, we assume if user opened overlay, they intended to do something.
    // We only block if they actually changed something or selected Time/Action mode.
    // For simplicity in "Core Loop", we add a lightweight confirmation if tables are selected.
    if (selectedIds.size > 0) {
      setMode('EXIT_CONFIRM');
    } else {
      onClose();
    }
  };

  const executeSave = (status: TableStatus) => {
    const getEpoch = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      return d.getTime();
    };

    const startEpoch = getEpoch(timeRange.start);
    const endEpoch = getEpoch(timeRange.end);
    const duration = Math.max(0, Math.floor((endEpoch - startEpoch) / 60000));

    // Resolve Note
    let finalNote: string | undefined = undefined;
    if (status === TableStatus.ISSUE) {
      const parts = [issueReason, issueNote].filter(Boolean);
      finalNote = parts.length > 0 ? parts.join(": ") : "Nespecifikovaný problém";
    }

    // Batch Save Logic: Group IDs by Size to optimize Reducer calls
    const idsBySize: Record<string, string[]> = {};
    selectedIds.forEach(id => {
      const size = pendingSizes[id] || TableSize.MEDIUM;
      if (!idsBySize[size]) idsBySize[size] = [];
      idsBySize[size].push(id);
    });

    Object.entries(idsBySize).forEach(([size, ids]) => {
      onSave({
        tableIds: ids,
        size: size as TableSize,
        duration,
        startTime: startEpoch,
        endTime: endEpoch,
        status,
        note: finalNote
      });
    });

    onClose();
    onClearSelection();
  };

  // List of tables being edited
  const selectedList = projectTables.filter(t => selectedIds.has(t.id));

  // --- RENDER ---
  return (
    <div 
      className={`fixed bottom-0 left-0 w-full bg-midnight/95 backdrop-blur-xl rounded-t-[32px] border-t border-white/10 shadow-[0_-20px_60px_rgba(0,0,0,0.6)] transition-transform duration-300 z-50 flex flex-col max-h-[92vh] ${isOpen ? 'translate-y-0' : 'translate-y-[110%]'}`}
      style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
    >
      {/* Handle / Drag Indicator */}
      <div className="w-full flex justify-center pt-3 pb-2 cursor-pointer active:opacity-50 flex-shrink-0" onClick={handleSafeClose}>
        <div className="w-12 h-1.5 bg-white/20 rounded-full" />
      </div>

      <div className="px-5 pt-1 space-y-5 flex-col flex h-full overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-end min-h-[2rem] flex-shrink-0">
          <h3 className="text-3xl font-black text-white leading-none tracking-tight text-shadow-sm">
            {mode === 'EXIT_CONFIRM' ? 'Zahodit změny?' : (
              <>
                {selectedIds.size} <span className="text-lg font-bold text-white/40">vybráno</span>
              </>
            )}
          </h3>
          {mode !== 'EXIT_CONFIRM' && (
            <button onClick={handleSafeClose} className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-3 py-1 bg-white/5 rounded-lg border border-white/5 active:bg-white/10 transition-colors">
              Zrušit
            </button>
          )}
        </div>

        {/* --- EXIT CONFIRMATION MODE --- */}
        {mode === 'EXIT_CONFIRM' ? (
           <div className="flex-1 flex flex-col justify-center gap-4 animate-fade-in pb-8">
              <p className="text-white/60 text-center font-medium">Máte rozpracovaný záznam. Chcete jej zahodit a zavřít okno?</p>
              <div className="grid grid-cols-2 gap-4">
                 <button 
                   onClick={() => setMode('DEFAULT')} 
                   className="py-4 rounded-2xl bg-white/5 font-bold text-white border border-white/10 active:bg-white/10"
                 >
                   Zpět k úpravám
                 </button>
                 <button 
                   onClick={() => { onClose(); onClearSelection(); }} 
                   className="py-4 rounded-2xl bg-danger/10 font-bold text-danger border border-danger/20 shadow-glow active:bg-danger/20"
                 >
                   Zahodit a zavřít
                 </button>
              </div>
           </div>
        ) : mode === 'DEFAULT' ? (
          <>
            {/* 1. SCROLLABLE LIST OF TABLES */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 -mr-1 min-h-[100px] mask-gradient-bottom">
              {selectedList.map(t => (
                <div key={t.id} ref={(el) => { rowRefs.current[t.id] = el; }}>
                    <SizeRow 
                      label={t.label} 
                      currentSize={pendingSizes[t.id] || t.size || TableSize.MEDIUM} 
                      onChange={(s) => handleSizeChange(t.id, s)}
                      isFocused={t.id === focusedId}
                    />
                </div>
              ))}
            </div>

            {/* 2. LIVE METRICS (New Core Loop Feature) */}
            <div className="glass-base rounded-2xl p-4 flex justify-between items-center border border-white/10 bg-black/20 flex-shrink-0">
               <div className="flex flex-col items-center flex-1 border-r border-white/5">
                  <span className="text-2xl font-black text-white tabular-nums tracking-tight">{liveStats.tableCount}</span>
                  <span className="text-[9px] font-bold text-white/30 uppercase tracking-wider">Stolů</span>
               </div>
               <div className="flex flex-col items-center flex-1 border-r border-white/5">
                  <span className="text-2xl font-black text-solar-start tabular-nums tracking-tight">{liveStats.totalStrings}</span>
                  <span className="text-[9px] font-bold text-solar-start/60 uppercase tracking-wider">Stringů</span>
               </div>
               <div className="flex flex-col items-center flex-1">
                  <span className="text-2xl font-black text-amber-400 tabular-nums tracking-tight">{Math.round(liveStats.totalKwp)}</span>
                  <span className="text-[9px] font-bold text-amber-400/60 uppercase tracking-wider">kWp</span>
               </div>
            </div>

            {/* 3. CONTEXT ACTIONS (Who & When) */}
            <div className="flex gap-3 flex-shrink-0">
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
                onClick={() => setMode('TIME')}
                className="flex-1 glass-base rounded-2xl p-3 flex flex-col items-start active:bg-white/10 transition-colors relative overflow-hidden border-white/10 hover:border-white/20"
              >
                <div className="text-[10px] uppercase text-white/40 font-bold tracking-widest mb-1">Kdy</div>
                <div className="flex items-center gap-2">
                   <span className="text-lg font-bold text-white font-mono tracking-tight">{timeRange.start}-{timeRange.end}</span>
                </div>
              </button>
            </div>

            {/* 4. MAIN ACTION (Save) */}
            <button 
              onClick={() => executeSave(TableStatus.DONE)}
              className="w-full h-16 rounded-2xl font-black text-xl shadow-glow transition-all flex items-center justify-center gap-3 relative overflow-hidden group bg-solar-gradient text-white active:scale-[0.98] flex-shrink-0"
            >
              <div className="absolute inset-0 bg-white/20 group-hover:bg-white/10 transition-colors" />
              <span className="tracking-wide text-shadow-sm">DOKONČIT</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-white/80"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
            </button>

            {/* 5. SECONDARY TRIGGER */}
            <div className="flex justify-center pt-1 pb-2 flex-shrink-0">
               <button 
                 onClick={() => setMode('ACTIONS')}
                 className="text-[10px] font-bold text-white/30 uppercase tracking-widest py-2 px-4 rounded-lg active:bg-white/5 hover:text-white/50 transition-colors"
               >
                 Nahlásit problém / Rozděláno
               </button>
            </div>
          </>
        ) : mode === 'TIME' ? (
          // --- TIME PICKER MODE ---
          <div className="animate-fade-in space-y-4 flex-1">
             <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-lg tracking-tight">Upravit čas</h4>
                <button onClick={() => setMode('DEFAULT')} className="text-xs text-white/50 font-bold px-3 py-1 bg-white/5 rounded-lg border border-white/5">Zpět</button>
             </div>
             <TimeRangePicker 
               initialStart={timeRange.start}
               initialEnd={timeRange.end}
               onConfirm={(s, e) => handleTimeConfirm(s, e)}
               onCancel={() => setMode('DEFAULT')}
             />
          </div>
        ) : mode === 'ISSUE_DETAIL' ? (
          // --- ISSUE REPORTING MODE ---
          <div className="animate-fade-in space-y-4 flex-1 flex flex-col">
             <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-lg tracking-tight">Nahlásit problém</h4>
                <button onClick={() => setMode('ACTIONS')} className="text-xs text-white/50 font-bold px-3 py-1 bg-white/5 rounded-lg border border-white/5">Zpět</button>
             </div>
             
             <div className="flex-1 overflow-y-auto space-y-4">
               <div className="grid grid-cols-2 gap-2">
                  {ISSUE_TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setIssueReason(tag)}
                      className={`p-3 rounded-xl text-xs font-bold transition-all border ${issueReason === tag ? 'bg-danger text-white border-danger shadow-[0_0_15px_rgba(248,113,113,0.4)]' : 'bg-white/5 text-white/40 border-white/5'}`}
                    >
                      {tag}
                    </button>
                  ))}
               </div>
               
               <div className="bg-black/20 rounded-2xl p-4 border border-white/10">
                  <textarea
                    value={issueNote}
                    onChange={(e) => setIssueNote(e.target.value)}
                    placeholder="Doplňující poznámka (volitelné)..."
                    className="w-full bg-transparent text-white placeholder-white/20 focus:outline-none resize-none text-sm min-h-[80px]"
                  />
               </div>
             </div>

             <button 
                onClick={() => executeSave(TableStatus.ISSUE)}
                disabled={!issueReason}
                className="w-full h-14 rounded-2xl font-black text-white bg-danger shadow-[0_0_20px_rgba(248,113,113,0.4)] disabled:opacity-50 disabled:grayscale transition-all active:scale-[0.98] flex items-center justify-center gap-2 mb-2"
              >
                NAHLÁSIT
             </button>
          </div>
        ) : (
          // --- SECONDARY ACTIONS MODE ---
          <div className="animate-fade-in space-y-4 flex-1">
             <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-lg tracking-tight">Další možnosti</h4>
                <button onClick={() => setMode('DEFAULT')} className="text-xs text-white/50 font-bold px-3 py-1 bg-white/5 rounded-lg border border-white/5">Zpět</button>
             </div>
             <div className="grid grid-cols-2 gap-3">
               <button 
                 onClick={() => executeSave(TableStatus.IN_PROGRESS)}
                 className="py-5 rounded-2xl glass-base text-white/50 text-xs font-bold uppercase tracking-wider active:bg-white/10 flex flex-col items-center justify-center gap-3 border-white/10 hover:border-solar-start/30 transition-colors"
               >
                 <div className="w-3 h-3 rounded-full bg-solar-start shadow-[0_0_10px_rgba(34,211,238,0.5)]" /> Rozdělané
               </button>
               <button 
                 onClick={() => setMode('ISSUE_DETAIL')}
                 className="py-5 rounded-2xl glass-base text-white/50 text-xs font-bold uppercase tracking-wider active:bg-white/10 flex flex-col items-center justify-center gap-3 border-white/10 hover:border-danger/30 transition-colors"
               >
                 <div className="w-3 h-3 rounded-full bg-danger shadow-[0_0_10px_rgba(248,113,113,0.5)]" /> Problém
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};