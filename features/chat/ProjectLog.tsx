import React, { useState } from 'react';
import { WorkLog, WorkType } from '../../domain';
import { Layout } from '../../ui/Layout';

interface ProjectLogProps {
  logs: WorkLog[];
  projectId?: string;
  projectName?: string;
  onBack?: () => void;
  onAddNote: (text: string) => void;
}

export const ProjectLog: React.FC<ProjectLogProps> = ({ logs, projectId, projectName, onBack, onAddNote }) => {
  const [note, setNote] = useState('');

  const projectLogs = logs
    .filter(l => projectId ? l.projectId === projectId : true)
    .sort((a, b) => b.timestamp - a.timestamp);

  const handleSubmitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    onAddNote(note);
    setNote('');
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getDayLabel = (ts: number) => {
    const date = new Date(ts);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'Dnes';
    return date.toLocaleDateString();
  };

  const getStatusStyles = (note?: string) => {
    if (note?.includes('ISSUE') || note?.includes('PROBLÉM')) {
      return { 
        bg: 'bg-danger/10 border-danger/20 shadow-[0_0_15px_rgba(248,113,113,0.1)]', 
        text: 'text-danger',
        label: 'Problém'
      };
    }
    if (note?.includes('IN_PROGRESS') || note?.includes('ROZDĚLANÉ') || note?.includes('IN PROGRESS')) {
      return { 
        bg: 'bg-solar-start/10 border-solar-start/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]', 
        text: 'text-solar-start',
        label: 'Rozpracováno'
      };
    }
    return { 
      bg: 'bg-success/10 border-success/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]', 
      text: 'text-success',
      label: 'Dokončeno'
    };
  };

  const isGlobal = !projectId;
  const title = projectName || 'Globální Chat';
  const subtitle = isGlobal ? 'Všechny projekty' : 'Deník stavby';

  return (
    <div className="min-h-[100dvh] bg-midnight flex flex-col text-white">
       {/* Custom Header matching Layout but with specific content */}
       <div className="fixed top-0 left-0 w-full z-40 bg-midnight/30 backdrop-blur-xl border-b border-white/10 pt-[env(safe-area-inset-top)] flex items-center h-[calc(3.5rem+env(safe-area-inset-top))] px-4 shadow-lg">
          {onBack && (
            <button onClick={onBack} className="p-2 -ml-2 text-white/60 active:text-white rounded-full active:bg-white/10 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          )}
          <div className={onBack ? "ml-2" : ""}>
             <h1 className="font-bold text-white leading-none text-shadow-sm">{title}</h1>
             <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">{subtitle}</span>
          </div>
       </div>

       <div className="flex-1 pt-[calc(4rem+env(safe-area-inset-top))] pb-[calc(8rem+env(safe-area-inset-bottom))] px-4 overflow-y-auto">
          {projectLogs.length === 0 ? (
            <div className="text-center py-20 opacity-30">
               <div className="text-6xl mb-4 grayscale">📝</div>
               <p className="font-bold">Zatím žádné záznamy.</p>
            </div>
          ) : (
            <div className="space-y-6">
               {projectLogs.map((log, index) => {
                 const prevLog = projectLogs[index + 1];
                 const showDayLabel = !prevLog || getDayLabel(log.timestamp) !== getDayLabel(prevLog.timestamp);
                 const statusStyle = getStatusStyles(log.note);

                 return (
                   <React.Fragment key={log.id}>
                     {showDayLabel && (
                       <div className="sticky top-4 z-10 flex justify-center my-8">
                         <span className="bg-midnight/60 backdrop-blur-md text-white/50 text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border border-white/10 shadow-lg">
                           {getDayLabel(log.timestamp)}
                         </span>
                       </div>
                     )}
                     
                     <div className="flex gap-4 animate-fade-in group">
                        <div className="flex-shrink-0 mt-1">
                           {log.note && !log.tableIds ? (
                              <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 shadow-glow">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                  <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 001.28.53l3.58-3.579a.78.78 0 01.527-.224 41.202 41.202 0 003.444-.33c1.436-.23 2.429-1.487 2.429-1.487V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2zm0 8.875a.75.75 0 110-1.5.75.75 0 010 1.5zm2.25-.75a.75.75 0 10-1.5 0 .75.75 0 001.5 0zm3.75.75a.75.75 0 110-1.5.75.75 0 010 1.5z" clipRule="evenodd" />
                                </svg>
                              </div>
                           ) : (
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border text-sm font-black shadow-sm ${statusStyle.bg} ${statusStyle.text}`}>
                                 {log.tableIds ? log.tableIds.length : 1}
                              </div>
                           )}
                        </div>

                        <div className="flex-1 glass-base rounded-2xl rounded-tl-none p-4 border border-white/10 group-active:bg-white/10 transition-colors">
                           <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-black text-white/80 tracking-wide">
                                {log.workerId === 'CURRENT_USER' ? 'Já' : log.workerId}
                              </span>
                              <span className="text-[10px] text-white/30 font-mono font-bold">{formatTime(log.timestamp)}</span>
                           </div>
                           
                           <div className="text-sm text-white/90">
                              {log.type === WorkType.TABLE && log.tableIds ? (
                                <>
                                  <div className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-2 ${statusStyle.text}`}>
                                    {statusStyle.label}
                                    {log.size && <span className="text-[9px] text-white/40 bg-white/10 px-1.5 py-0.5 rounded border border-white/5">Vel. {log.size}</span>}
                                  </div>
                                  <span className="font-mono text-white/70 text-xs leading-relaxed block tracking-tight">
                                    {log.tableIds.length > 5
                                      ? `${log.tableIds.slice(0, 5).join(', ')} ... +${log.tableIds.length - 5} dalších`
                                      : log.tableIds.join(', ')
                                    }
                                  </span>
                                </>
                              ) : (
                                <span className="font-medium">{log.note}</span>
                              )}
                           </div>
                        </div>
                     </div>
                   </React.Fragment>
                 );
               })}
            </div>
          )}
       </div>

       {/* Chat Input */}
       <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 w-full p-3 bg-midnight/80 backdrop-blur-xl border-t border-white/10">
          <form onSubmit={handleSubmitNote} className="flex gap-3 relative">
             <input 
               type="text" 
               value={note}
               onChange={(e) => setNote(e.target.value)}
               placeholder="Napsat poznámku..." 
               className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-solar-start/50 focus:bg-white/10 transition-all font-medium"
             />
             <button 
               type="submit"
               disabled={!note.trim()}
               className="bg-solar-gradient text-white rounded-2xl px-5 font-bold disabled:opacity-50 disabled:grayscale transition-all shadow-glow active:scale-95"
             >
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                 <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
               </svg>
             </button>
          </form>
       </div>
    </div>
  );
};