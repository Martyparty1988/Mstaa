import React, { useState, useMemo } from 'react';
import { ProjectMode, Table, TableSize, TableStatus } from '../types';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';

interface CreateProjectProps {
  onBack: () => void;
  onSubmit: (name: string, mode: ProjectMode, tables: Table[]) => void;
}

export const CreateProject: React.FC<CreateProjectProps> = ({ onBack, onSubmit }) => {
  const [name, setName] = useState('');
  const [rawInput, setRawInput] = useState('');
  const [focusedField, setFocusedField] = useState<'name' | 'tables' | null>(null);

  // Smart Parsing Logic & Mode Detection
  const { parsedTables, detectedMode } = useMemo(() => {
    if (!rawInput.trim()) return { parsedTables: [], detectedMode: ProjectMode.A_FLEXIBLE };

    const lines = rawInput.split(/[\n,]+/).map(l => l.trim()).filter(Boolean);
    let sizeDetected = false;
    
    const tables = lines.map(line => {
      const tableBase = { status: TableStatus.PENDING };
      
      // Try to parse "ID SIZE" pattern (split by whitespace)
      const parts = line.split(/\s+/);
      
      if (parts.length > 1) {
        const lastPart = parts[parts.length - 1].toUpperCase();
        
        // Check if the last part is a valid size indicator
        if (['S', 'M', 'L'].includes(lastPart)) {
          sizeDetected = true;
          let size: TableSize = TableSize.MEDIUM;
          if (lastPart === 'S') size = TableSize.SMALL;
          if (lastPart === 'M') size = TableSize.MEDIUM;
          if (lastPart === 'L') size = TableSize.LARGE;
          
          // Remove the size part from ID, join the rest back
          parts.pop();
          return { ...tableBase, id: parts.join(' '), size } as Table;
        }
      }
      
      // Fallback: Treat whole line as ID
      return { ...tableBase, id: line } as Table;
    });

    return { 
      parsedTables: tables, 
      detectedMode: sizeDetected ? ProjectMode.B_STRICT : ProjectMode.A_FLEXIBLE 
    };
  }, [rawInput]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit(name, detectedMode, parsedTables);
  };

  const isModeB = detectedMode === ProjectMode.B_STRICT;

  return (
    <Layout title="Nový Projekt" showBack onBack={onBack}>
      <div className="flex flex-col h-full pt-2 pb-6 space-y-6">
        
        {/* --- 1. NAME INPUT (Glowing Glass) --- */}
        <div className="relative group">
          <label className={`text-xs font-bold uppercase tracking-widest ml-1 mb-2 block transition-colors ${focusedField === 'name' ? 'text-primary' : 'text-white/40'}`}>
            Název stavby
          </label>
          
          {/* Glow Effect behind input */}
          <div className={`absolute -inset-0.5 bg-gradient-to-r from-primary to-orange-600 rounded-2xl blur opacity-0 transition duration-500 group-hover:opacity-20 ${focusedField === 'name' ? 'opacity-40' : ''}`} />
          
          <div className="relative bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden flex items-center">
             <input
               type="text"
               value={name}
               onFocus={() => setFocusedField('name')}
               onBlur={() => setFocusedField(null)}
               onChange={(e) => setName(e.target.value)}
               placeholder="Např. FVE Brno - Jih"
               className="w-full bg-transparent p-4 text-xl font-bold text-white placeholder-white/10 focus:outline-none"
             />
             <div className="pr-4 text-white/20">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
               </svg>
             </div>
          </div>
        </div>

        {/* --- 2. SMART EDITOR (Floating Glass Panel) --- */}
        <div className="flex-1 flex flex-col relative group">
           <div className="flex justify-between items-end mb-2 px-1">
             <label className={`text-xs font-bold uppercase tracking-widest transition-colors ${focusedField === 'tables' ? 'text-blue-400' : 'text-white/40'}`}>
               Seznam stolů
             </label>
             
             {/* Counter Badge */}
             <div className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${parsedTables.length > 0 ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-white/5 text-white/20 border-white/5'}`}>
               {parsedTables.length} DETEKOVÁNO
             </div>
           </div>

           {/* Glow Effect behind Editor */}
           <div className={`absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-0 transition duration-500 ${focusedField === 'tables' ? 'opacity-30' : ''}`} />

           <div className="relative flex-1 bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
              
              {/* Dynamic Status Bar */}
              <div className={`
                 h-12 border-b flex items-center justify-between px-4 transition-colors duration-500
                 ${isModeB 
                    ? 'bg-purple-500/10 border-purple-500/20' 
                    : 'bg-white/5 border-white/5'
                 }
              `}>
                  <div className="flex items-center gap-2">
                     <div className={`w-2 h-2 rounded-full shadow-[0_0_10px_currentColor] ${isModeB ? 'bg-purple-400 text-purple-400' : 'bg-blue-400 text-blue-400'}`} />
                     <span className={`text-xs font-bold tracking-wider ${isModeB ? 'text-purple-300' : 'text-blue-300'}`}>
                        {isModeB ? 'ADVANCED MODE' : 'BASIC MODE'}
                     </span>
                  </div>
                  
                  {isModeB && (
                    <span className="text-[10px] text-purple-300/60 font-mono">Velikosti načteny</span>
                  )}
              </div>

              {/* Textarea */}
              <textarea
                value={rawInput}
                onFocus={() => setFocusedField('tables')}
                onBlur={() => setFocusedField(null)}
                onChange={(e) => setRawInput(e.target.value)}
                placeholder={"Vložte čísla stolů...\n\nNapř:\n2E37-1\n2E37-2\n2E60-1 S\n2E60-2 L"}
                className="flex-1 w-full bg-transparent p-5 text-sm font-mono text-white/90 placeholder-white/20 focus:outline-none resize-none leading-relaxed"
                spellCheck={false}
              />
              
              {/* Helper Footer */}
              <div className="bg-black/20 p-3 text-center">
                <p className="text-[10px] text-white/30">
                  {isModeB 
                    ? '✨ Skvělé! Nalezli jsme velikosti (S/M/L). Při práci se vyplní automaticky.' 
                    : '💡 Tip: Pokud za číslo stolu napíšete S, M nebo L, přepnete se do Advanced režimu.'}
                </p>
              </div>
           </div>
        </div>

        {/* --- 3. SUBMIT BUTTON --- */}
        <div className="pt-2">
          <Button 
            onClick={handleSubmit} 
            disabled={!name.trim()}
            fullWidth
            size="lg"
            variant="primary"
            className={name.trim() ? "animate-pulse-subtle" : "opacity-50 grayscale"}
          >
             <span className="mr-2">Vytvořit projekt</span>
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
               <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
             </svg>
          </Button>
        </div>

      </div>
    </Layout>
  );
};