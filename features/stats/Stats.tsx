import React, { useMemo, useState } from 'react';
import { WorkLog, Worker, calculatePerformance, Project, forecastCompletion } from '../../app/domain';
import { Layout } from '../../ui/Layout';

interface StatsProps {
  logs: WorkLog[];
  workers: Worker[];
  project?: Project; // Optional: If provided, we show project-specific forecast
  onBack: () => void;
}

export const Stats: React.FC<StatsProps> = ({ logs, workers, project, onBack }) => {
  const [range, setRange] = useState<'DAY' | 'WEEK' | 'ALL'>('WEEK');

  const stats = useMemo(() => {
    return calculatePerformance(logs, workers, range, project);
  }, [logs, workers, range, project]);

  const forecast = useMemo(() => {
    if (!project) return null;
    return forecastCompletion(project, logs);
  }, [project, logs]);

  const formatDate = (ts: number | null) => {
    if (!ts) return '---';
    return new Date(ts).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long' });
  };

  return (
    <Layout title={project ? "Výkon Projektu" : "Celkové Statistiky"} showBack onBack={onBack}>
      <div className="space-y-6 pt-4 pb-20">
        
        {/* Range Selector */}
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

        {/* --- 1. PRIMARY METRICS (Grid) --- */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: Performance (String/kWp) */}
          <div className="glass-hero p-5 rounded-[28px] relative overflow-hidden group col-span-2">
            <div className="absolute top-0 right-0 w-32 h-32 bg-solar-start/10 rounded-full blur-2xl -mr-8 -mt-8 group-hover:bg-solar-start/20 transition-colors" />
            
            <div className="flex justify-between items-start mb-2 relative z-10">
               <div className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em]">Instalovaný Výkon</div>
               <div className="text-[10px] font-bold text-solar-start bg-solar-start/10 px-2 py-0.5 rounded border border-solar-start/20">
                 {range === 'DAY' ? 'Dnes' : range === 'WEEK' ? 'Posledních 7 dní' : 'Celková suma'}
               </div>
            </div>

            <div className="flex items-baseline gap-2 relative z-10">
               <span className="text-5xl font-black text-white tracking-tighter text-shadow-hero tabular-nums">
                 {Math.round(stats.kwp)}
               </span>
               <span className="text-sm font-bold text-white/50">kWp</span>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-4 relative z-10">
               <div>
                  <div className="text-2xl font-bold text-white tabular-nums leading-none">{Math.round(stats.strings)}</div>
                  <div className="text-[9px] text-white/40 font-bold uppercase tracking-wider mt-1">Stringů</div>
               </div>
               <div>
                  <div className="text-2xl font-bold text-white tabular-nums leading-none">{stats.tables}</div>
                  <div className="text-[9px] text-white/40 font-bold uppercase tracking-wider mt-1">Stolů</div>
               </div>
            </div>
          </div>

          {/* Card 2: Speed (Efficiency) */}
          <div className="glass-base p-5 rounded-[28px] flex flex-col justify-between border border-white/10 bg-black/20">
             <div className="text-white/50 text-[10px] font-bold uppercase tracking-wider mb-2">Rychlost</div>
             <div>
                <div className="text-3xl font-black text-white tabular-nums tracking-tight">
                  {stats.stringsPerHour > 0 ? stats.stringsPerHour.toFixed(1) : '-'}
                </div>
                <div className="text-[9px] text-white/40 font-bold uppercase mt-1">String / Hod</div>
             </div>
          </div>

          {/* Card 3: Hours */}
          <div className="glass-base p-5 rounded-[28px] flex flex-col justify-between border border-white/10 bg-black/20">
             <div className="text-white/50 text-[10px] font-bold uppercase tracking-wider mb-2">Čas</div>
             <div>
                <div className="text-3xl font-black text-white tabular-nums tracking-tight">
                  {stats.hours.toFixed(1)}
                </div>
                <div className="text-[9px] text-white/40 font-bold uppercase mt-1">Odprac. Hodin</div>
             </div>
          </div>
        </div>

        {/* --- 2. FORECAST (Only if Project is Active) --- */}
        {project && forecast && (
          <div className="glass-base p-6 rounded-[32px] relative overflow-hidden border border-white/10">
             <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
             
             <div className="flex items-center gap-4 mb-4 relative z-10">
               <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-[0_0_20px_rgba(251,191,36,0.1)] border border-amber-500/20">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" /></svg>
               </div>
               <div>
                 <div className="font-black text-white text-xl tracking-tight">Predikce</div>
                 <div className="text-[10px] text-amber-500/80 font-bold uppercase tracking-wider">Odhad dokončení</div>
               </div>
             </div>

             {project.totalTables ? (
               forecast.estimatedCompletionDate ? (
                 <div className="relative z-10">
                    <div className="flex items-end gap-2 mb-2">
                       <span className="text-4xl font-black text-white tracking-tighter">{formatDate(forecast.estimatedCompletionDate)}</span>
                       <span className="text-xs font-bold text-white/40 mb-1.5">({forecast.estimatedDaysLeft} dní)</span>
                    </div>
                    
                    {/* Visual Progress Bar to Target */}
                    <div className="w-full h-2 bg-white/5 rounded-full mt-4 overflow-hidden">
                       <div 
                         className="h-full bg-amber-500 shadow-[0_0_10px_rgba(251,191,36,0.5)]" 
                         style={{ width: `${(project.completedTables / project.totalTables) * 100}%` }} 
                       />
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] font-bold text-white/30 uppercase tracking-wider">
                       <span>Hotovo: {project.completedTables}</span>
                       <span>Cíl: {project.totalTables}</span>
                    </div>
                 </div>
               ) : (
                 <div className="text-sm text-white/40 font-bold pl-1">
                   Nedostatek dat pro výpočet. (Je potřeba alespoň týden práce)
                 </div>
               )
             ) : (
               <div className="text-sm text-white/40 pl-1">
                 <span className="font-bold text-white">Projekt nemá nastavený cíl.</span>
                 <br />Upravte projekt a zadejte počet stolů.
               </div>
             )}
          </div>
        )}

        {/* --- 3. WORKER LEADERBOARD --- */}
        <div className="glass-base rounded-[32px] p-6 border border-white/10">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-xs font-bold text-white/50 uppercase tracking-[0.15em]">Žebříček pracovníků</h3>
             <span className="text-[9px] font-bold text-white/30 bg-white/5 px-2 py-1 rounded border border-white/5">Seřazeno dle objemu</span>
          </div>

          <div className="space-y-6">
            {stats.workers.length === 0 ? (
               <div className="text-center py-8 text-white/20 font-bold">Žádná data pro toto období</div>
            ) : (
              stats.workers.map((w, idx) => {
                const maxStrings = stats.workers[0].strings || 1;
                const percent = (w.strings / maxStrings) * 100;
                const isTop = idx === 0;
                const isSecond = idx === 1;
                const isThird = idx === 2;
                
                let rankColor = "bg-white/5 text-white/30 border-white/5";
                if (isTop) rankColor = "bg-solar-start text-black shadow-glow";
                if (isSecond) rankColor = "bg-white/20 text-white border-white/30";
                if (isThird) rankColor = "bg-amber-700/40 text-amber-200 border-amber-600/30";

                return (
                  <div key={w.workerId} className="relative group">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] w-6 h-6 flex items-center justify-center rounded-lg font-bold border ${rankColor}`}>
                           {idx + 1}
                        </span>
                        <div>
                           <div className="font-bold text-white text-base leading-none">{w.workerName}</div>
                           <div className="text-[10px] text-white/30 mt-0.5 font-mono">
                              Efektivita: <span className="text-white/60 font-bold">{w.stringsPerHour.toFixed(1)}</span> str/h
                           </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                         <div className="text-sm font-black font-mono text-white/90 tracking-tight">{Math.round(w.strings)} <span className="text-white/30 text-[9px] font-sans font-bold uppercase tracking-wider">STR</span></div>
                         <div className="text-[9px] font-bold text-amber-400/80">{Math.round(w.kwp)} kWp</div>
                      </div>
                    </div>
                    
                    {/* Bar Chart */}
                    <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
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

      </div>
    </Layout>
  );
};