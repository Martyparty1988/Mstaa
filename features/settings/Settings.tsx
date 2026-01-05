import React from 'react';
import { Layout } from '../../ui/Layout';

export const Settings = ({ onBack }: { onBack: () => void }) => {
  return (
    <Layout title="Nastavení" showBack onBack={onBack}>
       <div className="space-y-8 pt-4">
          
          {/* Section: Project Rules */}
          <section>
             <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.15em] px-2 mb-3">Pravidla Projektu</h3>
             <div className="glass-base rounded-[32px] overflow-hidden border border-white/10">
                {[
                  { label: 'Velký stůl (L)', val: '2.0 stringy' },
                  { label: 'Střední stůl (M)', val: '1.5 stringy' },
                  { label: 'Malý stůl (S)', val: '1.0 string' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-5 border-b border-white/5 last:border-0 active:bg-white/5 transition-colors group">
                     <span className="text-white font-bold tracking-wide">{item.label}</span>
                     <span className="text-solar-start font-mono font-black bg-solar-start/10 px-3 py-1 rounded-lg border border-solar-start/20 shadow-[0_0_10px_rgba(34,211,238,0.1)]">{item.val}</span>
                  </div>
                ))}
             </div>
             <p className="px-5 mt-3 text-[10px] text-white/30 leading-relaxed font-medium">
               Změna pravidel automaticky přepočítá statistiky a výplaty zpětně pro celý projekt.
             </p>
          </section>

          {/* Section: App */}
          <section>
             <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.15em] px-2 mb-3">Aplikace</h3>
             <div className="glass-base rounded-[32px] overflow-hidden border border-white/10">
                <div className="flex justify-between items-center p-5 border-b border-white/5">
                   <span className="text-white font-bold tracking-wide">Tmavý režim</span>
                   <div className="w-12 h-7 bg-success/20 rounded-full relative border border-success/30 shadow-inner-light"><div className="absolute right-1 top-1 w-5 h-5 bg-success rounded-full shadow-lg" /></div>
                </div>
                <div className="flex justify-between items-center p-5 border-b border-white/5">
                   <span className="text-white font-bold tracking-wide">Jazyk</span>
                   <span className="text-white/50 text-sm font-bold">Čeština</span>
                </div>
                 <div className="flex justify-between items-center p-5">
                   <span className="text-white font-bold tracking-wide">Offline Data</span>
                   <span className="text-success text-[10px] font-bold bg-success/10 px-2 py-1 rounded-lg border border-success/20 flex items-center gap-1.5 uppercase tracking-wider">
                     <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shadow-[0_0_5px_currentColor]" />
                     Synchronizováno
                   </span>
                </div>
             </div>
          </section>

          {/* Section: Data */}
          <button className="w-full bg-danger/10 text-danger p-5 rounded-[32px] font-black text-sm uppercase tracking-widest mt-4 border border-danger/20 active:scale-[0.98] transition-transform shadow-lg shadow-danger/5 hover:bg-danger/15">
             Odhlásit se z projektu
          </button>
          
          <div className="text-center py-8">
             <div className="text-xs font-bold text-white/30 mb-1 tracking-widest">MST – Marty Solar Tracker</div>
             <div className="text-[10px] text-white/20 font-mono">v2.2.0 • Deep Ocean Glass</div>
          </div>
       </div>
    </Layout>
  );
};