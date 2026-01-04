import React, { useMemo, useState } from 'react';
import { WorkLog, Worker, WorkType } from '../types';
import { Layout } from '../components/Layout';

interface StatsProps {
  logs: WorkLog[];
  workers: Worker[];
  onBack: () => void;
}

export const Stats: React.FC<StatsProps> = ({ logs, workers, onBack }) => {
  const [range, setRange] = useState<'DAY' | 'WEEK' | 'ALL'>('DAY');

  // Logic to aggregate data
  const stats = useMemo(() => {
    // Filter by time
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = startOfToday - (now.getDay() * 24 * 60 * 60 * 1000);

    const filteredLogs = logs.filter(l => {
      if (range === 'DAY') return l.timestamp >= startOfToday;
      if (range === 'WEEK') return l.timestamp >= startOfWeek;
      return true;
    });

    // Aggregations
    let totalStrings = 0;
    let totalHours = 0;
    const workerStats: Record<string, { name: string, strings: number, hours: number }> = {};

    filteredLogs.forEach(log => {
      // Init worker stat
      const wId = log.workerId;
      const wName = workers.find(w => w.name === wId || w.id === wId)?.name || wId;
      
      if (!workerStats[wId]) workerStats[wId] = { name: wName, strings: 0, hours: 0 };

      // Add metrics
      if (log.type === WorkType.TABLE) {
        const count = log.tableIds ? log.tableIds.length : (log.tableId ? 1 : 0);
        // Simple heuristic: 1 table ~ 1.5 strings (this should come from settings)
        const strings = count * 1.5; 
        totalStrings += strings;
        workerStats[wId].strings += strings;
      }
      
      if (log.durationMinutes) {
        const hours = log.durationMinutes / 60;
        totalHours += hours;
        workerStats[wId].hours += hours;
      }
    });

    const sortedWorkers = Object.values(workerStats).sort((a, b) => b.strings - a.strings);

    return { totalStrings, totalHours, sortedWorkers };
  }, [logs, workers, range]);

  return (
    <Layout title="Výkon & Statistiky" showBack onBack={onBack}>
      <div className="space-y-6 pt-4">
        
        {/* Range Selector */}
        <div className="bg-black/20 p-1 rounded-2xl flex border border-white/5">
          {(['DAY', 'WEEK', 'ALL'] as const).map(r => (
            <button 
              key={r} 
              onClick={() => setRange(r)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${range === r ? 'bg-white/10 text-white shadow-sm border border-white/5' : 'text-white/40 hover:text-white/60'}`}
            >
              {r === 'DAY' ? 'DNES' : r === 'WEEK' ? 'TÝDEN' : 'CELKEM'}
            </button>
          ))}
        </div>

        {/* Big Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-5 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full blur-xl -mr-6 -mt-6" />
            <div className="text-success text-xs font-bold uppercase tracking-widest mb-1">Stringů</div>
            <div className="text-4xl font-black text-white tracking-tight">{Math.round(stats.totalStrings)}</div>
            <div className="text-[10px] text-white/40 mt-1 font-medium">~ {Math.round(stats.totalStrings * 15)} € obrat</div>
          </div>
          <div className="glass-card p-5 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-xl -mr-6 -mt-6" />
            <div className="text-electric text-xs font-bold uppercase tracking-widest mb-1">Hodin</div>
            <div className="text-4xl font-black text-white tracking-tight">{stats.totalHours.toFixed(1)}</div>
            <div className="text-[10px] text-white/40 mt-1 font-medium">Odpracováno</div>
          </div>
        </div>

        {/* Worker Leaderboard */}
        <div className="bg-surface/30 rounded-3xl p-5 border border-white/5">
          <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Žebříček {range === 'DAY' ? 'dne' : ''}</h3>
          <div className="space-y-5">
            {stats.sortedWorkers.length === 0 ? (
               <div className="text-center py-8 text-white/20 font-bold">Žádná data pro toto období</div>
            ) : (
              stats.sortedWorkers.map((w, idx) => {
                const maxStrings = stats.sortedWorkers[0].strings || 1;
                const percent = (w.strings / maxStrings) * 100;
                const isTop = idx === 0;
                
                return (
                  <div key={w.name} className="relative group">
                    <div className="flex justify-between items-end mb-2">
                      <span className="font-bold text-white text-sm flex items-center gap-3">
                        <span className={`text-[10px] w-5 h-5 flex items-center justify-center rounded-md ${isTop ? 'bg-solar-start text-black' : 'bg-white/10 text-white/50'}`}>
                           {idx + 1}
                        </span>
                        {w.name}
                      </span>
                      <span className="text-xs font-mono font-bold text-white/80">{Math.round(w.strings)} <span className="text-white/30 text-[10px]">STR</span></span>
                    </div>
                    {/* Bar Chart */}
                    <div className="h-2.5 bg-black/30 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${isTop ? 'bg-solar-gradient shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-white/20'}`} 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Forecast (Mock) */}
        <div className="glass-card p-6 rounded-3xl mt-4 relative overflow-hidden border border-purple-500/20">
           <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent pointer-events-none" />
           <div className="flex items-center gap-3 mb-3 relative z-10">
             <div className="w-10 h-10 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" /></svg>
             </div>
             <div>
               <div className="font-bold text-white text-lg">Predikce dokončení</div>
               <div className="text-xs text-purple-300/60 font-medium">Při současném tempu</div>
             </div>
           </div>
           <div className="text-2xl font-black text-purple-200 tracking-tight">14. Listopadu</div>
           <div className="text-xs font-bold text-purple-400 mt-0.5 mb-3 uppercase tracking-wider">Zbývá 8 dní</div>
           
           <div className="mt-2 h-1.5 bg-black/30 w-full rounded-full overflow-hidden">
             <div className="h-full bg-purple-500 w-[65%] shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
           </div>
        </div>

      </div>
    </Layout>
  );
};