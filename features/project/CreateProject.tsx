import React, { useState, useMemo } from 'react';
import { ProjectMode, Table, parseRawTableInput } from '../../domain';
import { Layout } from '../../ui/Layout';
import { Button } from '../../ui/Button';

interface CreateProjectProps {
  onBack: () => void;
  onSubmit: (name: string, mode: ProjectMode, tables: Table[]) => void;
}

export const CreateProject: React.FC<CreateProjectProps> = ({ onBack, onSubmit }) => {
  const [name, setName] = useState('');
  const [rawInput, setRawInput] = useState('');
  const [focusedField, setFocusedField] = useState<'name' | 'tables' | null>(null);

  const { parsedTables, detectedMode } = useMemo(() => {
    return parseRawTableInput(rawInput);
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
          </div>
        </div>

        {/* --- 2. SMART EDITOR (Floating Glass Panel) --- */}
        <div className="flex-1 flex flex-col relative group">
           <div className="flex justify-between items-end mb-2 px-1">
             <label className={`text-xs font-bold uppercase tracking-widest transition-colors ${focusedField === 'tables' ? 'text-blue-400' : 'text-white/40'}`}>
               Seznam stolů
             </label>
             <div className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${parsedTables.length > 0 ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-white/5 text-white/20 border-white/5'}`}>
               {parsedTables.length} DETEKOVÁNO
             </div>
           </div>

           <div className={`absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-0 transition duration-500 ${focusedField === 'tables' ? 'opacity-30' : ''}`} />

           <div className="relative flex-1 bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
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
              </div>

              <textarea
                value={rawInput}
                onFocus={() => setFocusedField('tables')}
                onBlur={() => setFocusedField(null)}
                onChange={(e) => setRawInput(e.target.value)}
                placeholder={"Vložte čísla stolů...\n\nNapř:\n2E37-1\n2E37-2\n2E60-1 S\n2E60-2 L"}
                className="flex-1 w-full bg-transparent p-5 text-sm font-mono text-white/90 placeholder-white/20 focus:outline-none resize-none leading-relaxed"
                spellCheck={false}
              />
           </div>
        </div>

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
          </Button>
        </div>
      </div>
    </Layout>
  );
};