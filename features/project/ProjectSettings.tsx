import React, { useState } from 'react';
import { Project, TableSize } from '../../domain';
import { Layout } from '../../ui/Layout';
import { Button } from '../../ui/Button';

interface ProjectSettingsProps {
  project: Project;
  onUpdate: (project: Project) => void;
  onBack: () => void;
  onExportLogs: () => void;
}

export const ProjectSettings: React.FC<ProjectSettingsProps> = ({ project, onUpdate, onBack, onExportLogs }) => {
  // Initialize with current settings or defaults
  const [settings, setSettings] = useState({
    kwp: project.settings?.kwpPerString ?? 19.6,
    s: project.settings?.stringsPerTable?.[TableSize.SMALL] ?? 1.0,
    m: project.settings?.stringsPerTable?.[TableSize.MEDIUM] ?? 1.5,
    l: project.settings?.stringsPerTable?.[TableSize.LARGE] ?? 2.0,
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (key: keyof typeof settings, val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return;
    setSettings(prev => ({ ...prev, [key]: num }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdate({
      ...project,
      settings: {
        currency: 'EUR', // Force EUR
        kwpPerString: settings.kwp,
        stringsPerTable: {
          default: 1.5,
          [TableSize.SMALL]: settings.s,
          [TableSize.MEDIUM]: settings.m,
          [TableSize.LARGE]: settings.l,
        }
      }
    });
    setHasChanges(false);
    onBack(); // Optional: go back on save, or just show success toast
  };

  return (
    <Layout title="Nastavení Projektu" showBack onBack={onBack}>
      <div className="space-y-8 pt-4 pb-20">
        
        {/* SECTION: Calculation Rules */}
        <section className="space-y-4">
           <div className="px-1">
             <h3 className="text-xs font-bold text-white/50 uppercase tracking-[0.15em] mb-1">Pravidla Výpočtů</h3>
             <p className="text-[10px] text-white/30">Definuje, jak se počítá výkon pro různé velikosti stolů.</p>
           </div>

           <div className="glass-base rounded-[24px] p-6 space-y-6 border border-white/10">
              {/* String Counts */}
              <div className="space-y-4">
                {[
                  { id: 'l', label: 'Velký stůl (L)', def: 2.0 },
                  { id: 'm', label: 'Střední stůl (M)', def: 1.5 },
                  { id: 's', label: 'Malý stůl (S)', def: 1.0 },
                ].map(item => (
                  <div key={item.id} className="flex items-center justify-between">
                     <span className="font-bold text-white/80 text-sm">{item.label}</span>
                     <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          step="0.1"
                          value={settings[item.id as keyof typeof settings]}
                          onChange={(e) => handleChange(item.id as keyof typeof settings, e.target.value)}
                          className="w-16 bg-black/20 rounded-lg p-2 text-right font-mono font-bold text-solar-start focus:outline-none focus:ring-1 focus:ring-solar-start border border-white/5"
                        />
                        <span className="text-[10px] text-white/30 font-bold uppercase w-8">Str</span>
                     </div>
                  </div>
                ))}
              </div>

              <div className="h-[1px] bg-white/5" />

              {/* kWp Config */}
              <div className="flex items-center justify-between">
                 <div>
                   <div className="font-bold text-white/80 text-sm">Výkon na String</div>
                   <div className="text-[10px] text-white/30">Průměrný výkon panelů</div>
                 </div>
                 <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      step="0.1"
                      value={settings.kwp}
                      onChange={(e) => handleChange('kwp', e.target.value)}
                      className="w-20 bg-black/20 rounded-lg p-2 text-right font-mono font-bold text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 border border-white/5"
                    />
                    <span className="text-[10px] text-white/30 font-bold uppercase w-8">kWp</span>
                 </div>
              </div>
           </div>
        </section>

        {/* SECTION: Data Export */}
        <section className="space-y-4">
           <div className="px-1">
             <h3 className="text-xs font-bold text-white/50 uppercase tracking-[0.15em] mb-1">Data & Export</h3>
           </div>
           
           <button 
             onClick={onExportLogs}
             className="w-full glass-base p-5 rounded-[24px] flex items-center justify-between group active:scale-[0.98] transition-all border border-white/10 hover:bg-white/5"
           >
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center text-lg border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                    📥
                 </div>
                 <div className="text-left">
                    <div className="font-bold text-white">Exportovat CSV</div>
                    <div className="text-[10px] text-white/40">Stáhnout kompletní deník prací</div>
                 </div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-white/30 group-hover:text-white transition-colors"><path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" /></svg>
           </button>
        </section>

        {/* Footer Actions */}
        <div className="fixed bottom-0 left-0 w-full p-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] bg-midnight/90 backdrop-blur-xl border-t border-white/10">
           <Button 
             onClick={handleSave} 
             fullWidth 
             size="lg" 
             disabled={!hasChanges}
             className={hasChanges ? 'shadow-glow animate-pulse-subtle' : 'opacity-50 grayscale'}
           >
             Uložit nastavení
           </Button>
        </div>

      </div>
    </Layout>
  );
};