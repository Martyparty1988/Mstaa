import React, { useMemo } from 'react';
import { WorkLog, Worker, Project, calculateEarnings, WorkType } from '../../domain';
import { Layout } from '../../ui/Layout';

interface WalletScreenProps {
  logs: WorkLog[];
  currentUser: Worker;
  projects: Project[];
  onBack: () => void;
}

export const WalletScreen: React.FC<WalletScreenProps> = ({ logs, currentUser, projects, onBack }) => {
  
  // 1. Calculate Periods
  const stats = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    // Start of week (Monday)
    const day = now.getDay() || 7; 
    if (day !== 1) now.setHours(-24 * (day - 1)); 
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const myLogs = logs.filter(l => l.workerId === currentUser.id);
    const todayLogs = myLogs.filter(l => l.timestamp >= startOfToday);
    const weekLogs = myLogs.filter(l => l.timestamp >= startOfWeek);

    return {
      today: calculateEarnings(todayLogs, currentUser, projects),
      week: calculateEarnings(weekLogs, currentUser, projects),
      all: calculateEarnings(myLogs, currentUser, projects),
      historyLogs: myLogs.sort((a, b) => b.timestamp - a.timestamp)
    };
  }, [logs, currentUser, projects]);

  // Group history by date
  const groupedHistory = useMemo(() => {
    const groups: Record<string, { total: number, logs: WorkLog[] }> = {};
    
    stats.historyLogs.forEach(log => {
      const dateKey = new Date(log.timestamp).toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'numeric' });
      if (!groups[dateKey]) groups[dateKey] = { total: 0, logs: [] };
      
      const earnings = calculateEarnings([log], currentUser, projects).total;
      groups[dateKey].logs.push(log);
      groups[dateKey].total += earnings;
    });
    
    return groups;
  }, [stats.historyLogs, currentUser, projects]);

  return (
    <Layout title="Moje Peněženka" showBack onBack={onBack}>
      <div className="space-y-6 pt-4 pb-24">
        
        {/* HERO CARD: THIS WEEK */}
        <div className="px-2">
           <div className="relative overflow-hidden rounded-[32px] glass-hero border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
              {/* Background Decor */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none" />
              
              <div className="relative p-8 flex flex-col items-center text-center z-10">
                 <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300 mb-2">Tento týden</div>
                 
                 <div className="flex items-baseline justify-center gap-2">
                    <span className="text-6xl font-black text-white tracking-tighter tabular-nums drop-shadow-md">
                       {stats.week.total.toFixed(0)}
                    </span>
                    <span className="text-3xl font-bold text-emerald-400">€</span>
                 </div>

                 <div className="flex gap-8 mt-6 w-full justify-center">
                    <div className="flex flex-col items-center">
                       <span className="text-xl font-bold text-white tabular-nums">{stats.week.hourlyTotal.toFixed(0)} €</span>
                       <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">Hodinová</span>
                    </div>
                    <div className="w-[1px] bg-white/10" />
                    <div className="flex flex-col items-center">
                       <span className="text-xl font-bold text-white tabular-nums">{stats.week.pieceworkTotal.toFixed(0)} €</span>
                       <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">Úkolová</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* TODAY COMPACT CARD */}
        <div className="mx-2 glass-base p-5 rounded-[24px] flex items-center justify-between border-white/10 bg-gradient-to-r from-emerald-900/10 to-transparent">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl shadow-glow">
                 💰
              </div>
              <div>
                 <div className="font-bold text-white text-sm">Dnešní výdělek</div>
                 <div className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Aktuální stav</div>
              </div>
           </div>
           <div className="text-right">
              <div className="text-2xl font-black text-emerald-300 tabular-nums">{stats.today.total.toFixed(0)} €</div>
           </div>
        </div>

        {/* HISTORY LIST */}
        <div className="px-2">
           <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.15em] ml-2 mb-3">Historie výdělků</h3>
           
           <div className="space-y-4">
              {Object.entries(groupedHistory).map(([date, data]) => (
                <div key={date} className="glass-base rounded-[24px] p-4 border border-white/5">
                   <div className="flex justify-between items-center mb-3 pb-3 border-b border-white/5">
                      <span className="font-bold text-white/70 capitalize text-sm">{date}</span>
                      <span className="font-black text-emerald-400 tabular-nums text-lg">{data.total.toFixed(0)} €</span>
                   </div>
                   
                   <div className="space-y-2">
                      {data.logs.slice(0, 5).map(log => { // Show max 5 details per day
                         const amount = calculateEarnings([log], currentUser, projects).total;
                         if (amount === 0) return null; // Skip non-paid logs
                         
                         const isHourly = log.type === WorkType.HOURLY;

                         return (
                           <div key={log.id} className="flex justify-between items-center text-xs">
                              <div className="flex items-center gap-2 text-white/50">
                                 <span className={`w-1.5 h-1.5 rounded-full ${isHourly ? 'bg-white/30' : 'bg-solar-start/50'}`} />
                                 <span className="truncate max-w-[180px]">{isHourly ? 'Hodinová práce' : 'Montáž stolů'}</span>
                              </div>
                              <span className="font-bold text-white/90 tabular-nums">{amount.toFixed(1)} €</span>
                           </div>
                         );
                      })}
                   </div>
                </div>
              ))}
              
              {stats.historyLogs.length === 0 && (
                 <div className="text-center py-10 opacity-30">
                    <p className="text-sm font-bold">Zatím žádná historie</p>
                 </div>
              )}
           </div>
        </div>

      </div>
    </Layout>
  );
};