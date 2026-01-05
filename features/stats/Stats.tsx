import React, { useMemo, useState } from 'react';
import { WorkLog, Worker, calculatePerformance } from '../../domain';
import { Layout } from '../../ui/Layout';

interface StatsProps {
  logs: WorkLog[];
  workers: Worker[];
  onBack: () => void;
}

export const Stats: React.FC<StatsProps> = ({ logs, workers, onBack }) => {
  const [range, setRange] = useState<'DAY' | 'WEEK' | 'ALL'>('DAY');

  const stats = useMemo(() => {
    return calculatePerformance(logs, workers, range);
  }, [logs, workers, range]);

  return (
    <Layout title="Výkon & Statistiky" showBack onBack={onBack}>
      <div className="space-y-6 pt-4">
        
        {/* Range Selector - Glass Pill */}
        <div className="glass-base p-1 rounded-2xl flex">
          {(['DAY', 'WEEK', 'ALL'] as const).map(r => (
            <button 
              key={r} 
              onClick={() => setRange(r)}
              className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all tracking-wide ${range === r ? 'bg-white/10 text-white shadow-sm border border-white/10' : 'text-white/40 hover:text-white/60'}`}
            >
              {r === 'DAY' ? 'DNES' : r === 'WEEK' ? 'TÝDEN' : 'CELKEM'}
            </button>
          ))}
        </div>

        {/* Big Cards - Hero Style */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-hero p-6 rounded-[32px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-solar-start/20 rounded-full blur-2xl -mr-6 -mt-6 group-hover:bg-solar-start/30 transition-colors" />
            <div className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] mb-1 relative z-10">Stringů</div>
            <div className="text-4xl font-black text-white tracking-tighter text-shadow-hero relative z-10">{Math.round(stats.strings)}</div>
            <div className="text-[10px] text-white/40 mt-1 font-bold tracking-wide relative z-10">~ {Math.round(stats.kwp)} kWp</div>
          </div>
          <div className="glass-hero p-6 rounded-[32px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl -mr-6 -mt-6 group-hover:bg-blue-500/30 transition-colors" />
            <div className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] mb-1 relative z-10">Hodin</div>
            <div className="text-4xl font-black text-white tracking-tighter text-shadow-hero relative z-10">{stats.hours.toFixed(1)}</div>
            <div className="text-[10px] text-white/40 mt-1 font-bold tracking-wide relative z-10">Odpracováno</div>
          </div>
        </div>

        {/* Worker Leaderboard */}
        <div className="glass-base rounded-[32px] p-6 border border-white/10">
          <h3 className="text-xs font-bold text-white/50 uppercase tracking-[0.15em] mb-5">Žebříček {range === 'DAY' ? 'dne' : ''}</h3>
          <div className="space-y-6">
            {stats.workers.length === 0 ? (
               <div className="text-center py-8 text-white/20 font-bold">Žádná data pro toto období</div>
            ) : (
              stats.workers.map((w, idx) => {
                const maxStrings = stats.workers[0].strings || 1;
                const percent = (w.strings / maxStrings) * 100;
                const isTop = idx === 0;
                
                return (
                  <div key={w.workerId} className="relative group">
                    <div className="flex justify-between items-end mb-2">
                      <span className="font-bold text-white text-base flex items-center gap-3">
                        <span className={`text-[10px] w-6 h-6 flex items-center justify-center rounded-lg font-bold ${isTop ? 'bg-solar-start text-black shadow-glow' : 'bg-white/5 text-white/30 border border-white/5'}`}>
                           {idx + 1}
                        </span>
                        {w.workerName}
                      </span>
                      <span className="text-sm font-black font-mono text-white/90 tracking-tight">{Math.round(w.strings)} <span className="text-white/30 text-[9px] font-sans font-bold uppercase tracking-wider">STR</span></span>
                    </div>
                    {/* Bar Chart */}
                    <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${isTop ? 'bg-solar-gradient shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 'bg-white/20'}`} 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Forecast */}
        <div className="glass-base p-6 rounded-[32px] mt-4 relative overflow-hidden border-white/10">
           <div className="absolute inset-0 bg-gradient-to-r from-[#fbbf24]/5 to-transparent pointer-events-none" />
           <div className="flex items-center gap-4 mb-3 relative z-10">
             <div className="w-12 h-12 rounded-2xl bg-[#fbbf24]/10 flex items-center justify-center text-[#fbbf24] shadow-[0_0_20px_rgba(251,191,36,0.1)]">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" /></svg>
             </div>
             <div>
               <div className="font-black text-white text-xl tracking-tight">Predikce</div>
               <div className="text-[10px] text-[#fbbf24]/60 font-bold uppercase tracking-wider">Odhad dle tempa</div>
             </div>
           </div>
           {/* Placeholder Forecast UI */}
           <div className="text-sm text-white/40 font-medium pl-1">Data dostupná po 7 dnech práce.</div>
        </div>

      </div>
    </Layout>
  );
};