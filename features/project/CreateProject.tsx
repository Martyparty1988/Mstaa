import React, { useState, useMemo, useRef } from 'react';
import { ProjectMode, Table, TableSize, parseRawTableInput, generateTableRange, parseCSVImport } from '../../app/domain';
import { Layout } from '../../ui/Layout';
import { Button } from '../../ui/Button';

interface CreateProjectProps {
  onBack: () => void;
  onSubmit: (name: string, mode: ProjectMode, tables: Table[]) => void;
}

type CreationMethod = 'TEXT' | 'GENERATOR' | 'IMPORT';

export const CreateProject: React.FC<CreateProjectProps> = ({ onBack, onSubmit }) => {
  const [name, setName] = useState('');
  const [method, setMethod] = useState<CreationMethod>('GENERATOR');
  
  // Master List of Tables
  const [tables, setTables] = useState<Table[]>([]);

  // Generator State
  const [genPrefix, setGenPrefix] = useState('');
  const [genStart, setGenStart] = useState<number>(1);
  const [genEnd, setGenEnd] = useState<number>(20);
  const [genSuffix, setGenSuffix] = useState('');
  const [genSize, setGenSize] = useState<TableSize | undefined>(undefined);

  // Text Input State (for Quick Edit)
  const [rawText, setRawText] = useState('');

  // Import State
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- ACTIONS ---

  const handleGenerate = () => {
    const newTables = generateTableRange(
      genPrefix, 
      genStart, 
      genEnd, 
      genSuffix, 
      genSize, 
      tables.length // offset index
    );
    setTables(prev => [...prev, ...newTables]);
  };

  const handleClear = () => {
    if (confirm("Opravdu smazat všechny stoly?")) {
      setTables([]);
      setRawText('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        const imported = parseCSVImport(text);
        // adjust order index
        const adjustedImport = imported.map((t, i) => ({ ...t, orderIndex: tables.length + i }));
        setTables(prev => [...prev, ...adjustedImport]);
      }
    };
    reader.readAsText(file);
  };

  const handleTextSync = () => {
    // If user switches FROM Text mode, parse the text back to tables
    if (rawText.trim()) {
      const { parsedTables } = parseRawTableInput(rawText);
      setTables(parsedTables);
    }
  };

  const updateRawFromTables = () => {
     // If user switches TO Text mode, convert tables to string
     const text = tables.map(t => t.label).join('\n');
     setRawText(text);
  };

  // --- SUBMIT ---

  const handleSubmit = () => {
    if (!name.trim()) return;
    // Determine mode: If any table has a size, use Strict B, else Flexible A
    const mode = tables.some(t => t.size) ? ProjectMode.B_STRICT : ProjectMode.A_FLEXIBLE;
    onSubmit(name, mode, tables);
  };

  return (
    <Layout title="Nový Projekt" showBack onBack={onBack}>
      <div className="flex flex-col h-full pt-2 pb-6 space-y-6">
        
        {/* 1. PROJECT NAME */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest ml-1 mb-2 block text-white/40">
            Název stavby
          </label>
          <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
             <input
               type="text"
               value={name}
               onChange={(e) => setName(e.target.value)}
               placeholder="Např. FVE Brno - Jih"
               className="w-full bg-transparent p-4 text-xl font-bold text-white placeholder-white/10 focus:outline-none"
             />
          </div>
        </div>

        {/* 2. METHOD SWITCHER */}
        <div className="glass-base p-1 rounded-2xl flex">
           {(['GENERATOR', 'TEXT', 'IMPORT'] as const).map(m => (
             <button
               key={m}
               onClick={() => {
                 if (method === 'TEXT' && m !== 'TEXT') handleTextSync();
                 if (m === 'TEXT') updateRawFromTables();
                 setMethod(m);
               }}
               className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${method === m ? 'bg-white/10 text-white shadow-sm border border-white/10' : 'text-white/40 hover:text-white/60'}`}
             >
               {m === 'GENERATOR' ? 'Generátor' : m === 'TEXT' ? 'Editor' : 'Import'}
             </button>
           ))}
        </div>

        {/* 3. WORKSPACE AREA */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          
          {/* A) GENERATOR UI */}
          {method === 'GENERATOR' && (
            <div className="space-y-4 animate-fade-in">
               <div className="glass-base p-5 rounded-[24px] border border-white/10 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-[10px] text-white/40 font-bold uppercase pl-1">Prefix</label>
                       <input value={genPrefix} onChange={e => setGenPrefix(e.target.value)} placeholder="2E" className="w-full bg-black/20 rounded-xl p-3 text-white font-bold border border-white/5 focus:border-solar-start/50 outline-none" />
                     </div>
                     <div>
                       <label className="text-[10px] text-white/40 font-bold uppercase pl-1">Suffix</label>
                       <input value={genSuffix} onChange={e => setGenSuffix(e.target.value)} placeholder="-A" className="w-full bg-black/20 rounded-xl p-3 text-white font-bold border border-white/5 focus:border-solar-start/50 outline-none" />
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                     <div className="flex-1">
                        <label className="text-[10px] text-white/40 font-bold uppercase pl-1">Od</label>
                        <input type="number" value={genStart} onChange={e => setGenStart(parseInt(e.target.value))} className="w-full bg-black/20 rounded-xl p-3 text-white font-bold border border-white/5 outline-none" />
                     </div>
                     <span className="text-white/20 pt-5">➝</span>
                     <div className="flex-1">
                        <label className="text-[10px] text-white/40 font-bold uppercase pl-1">Do</label>
                        <input type="number" value={genEnd} onChange={e => setGenEnd(parseInt(e.target.value))} className="w-full bg-black/20 rounded-xl p-3 text-white font-bold border border-white/5 outline-none" />
                     </div>
                  </div>

                  <div>
                     <label className="text-[10px] text-white/40 font-bold uppercase pl-1 mb-2 block">Velikost (Volitelné)</label>
                     <div className="flex gap-2">
                        {[TableSize.SMALL, TableSize.MEDIUM, TableSize.LARGE].map(s => (
                           <button 
                             key={s} 
                             onClick={() => setGenSize(genSize === s ? undefined : s)}
                             className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all ${genSize === s ? 'bg-solar-start text-midnight border-solar-start' : 'bg-white/5 text-white/40 border-white/5'}`}
                           >
                             {s}
                           </button>
                        ))}
                     </div>
                  </div>

                  <button 
                    onClick={handleGenerate}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-solar-start font-bold uppercase tracking-widest text-xs active:scale-[0.98] transition-all"
                  >
                    + Přidat rozsah
                  </button>
               </div>
            </div>
          )}

          {/* B) TEXT EDITOR UI */}
          {method === 'TEXT' && (
            <div className="flex-1 flex flex-col animate-fade-in">
               <textarea
                 value={rawText}
                 onChange={(e) => setRawText(e.target.value)}
                 className="flex-1 w-full bg-black/20 rounded-[24px] border border-white/10 p-4 text-sm font-mono text-white/80 focus:outline-none resize-none"
                 placeholder={"Vložte seznam stolů, každý na nový řádek.\n\nNapř:\n2E01\n2E02\n3R15 L"}
               />
               <div className="text-[10px] text-white/30 text-center mt-2">
                 Změny v textu se uloží při přepnutí zpět.
               </div>
            </div>
          )}

          {/* C) IMPORT UI */}
          {method === 'IMPORT' && (
             <div className="flex-1 flex flex-col items-center justify-center animate-fade-in glass-base rounded-[24px] border-2 border-dashed border-white/10 p-6">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white/40"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                </div>
                <p className="text-white/60 font-bold mb-6 text-center">Nahrajte CSV soubor<br/><span className="text-[10px] font-normal opacity-50">(Formát: Label, Size[S/M/L])</span></p>
                <input 
                  type="file" 
                  accept=".csv,.txt" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
                <Button onClick={() => fileInputRef.current?.click()} variant="secondary">Vybrat soubor</Button>
             </div>
          )}

          {/* PREVIEW BAR (Always visible unless empty) */}
          {(tables.length > 0 || (method === 'TEXT' && rawText)) && (
             <div className="mt-4 glass-hero p-4 rounded-2xl flex items-center justify-between animate-slide-up">
                <div>
                   <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Celkem stolů</div>
                   <div className="text-2xl font-black text-white">{method === 'TEXT' ? rawText.split('\n').filter(Boolean).length : tables.length}</div>
                </div>
                <button onClick={handleClear} className="px-4 py-2 bg-white/5 hover:bg-danger/20 hover:text-danger rounded-xl text-xs font-bold text-white/40 transition-colors">
                   Smazat vše
                </button>
             </div>
          )}
        </div>

        <div className="pt-2">
          <Button 
            onClick={handleSubmit} 
            disabled={!name.trim() || (method !== 'TEXT' && tables.length === 0)}
            fullWidth
            size="lg"
            variant="primary"
            className={name.trim() ? "shadow-glow" : "opacity-50 grayscale"}
          >
             Vytvořit projekt
          </Button>
        </div>
      </div>
    </Layout>
  );
};