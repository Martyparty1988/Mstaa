import React, { useState, useRef, useEffect } from 'react';
import { WorkLog, Worker } from '../../../app/domain';
import { MessageBubble, GroupPosition } from './MessageBubble';

interface ChatConversationProps {
  logs: WorkLog[];
  currentUser: Worker;
  channelName: string;
  subTitle: string;
  onBack: () => void;
  onClose: () => void;
  onAddMessage: (text: string) => void;
}

const getAvatarColor = (name: string) => {
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500', 'bg-pink-500', 'bg-cyan-500'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const isSameDay = (d1: number, d2: number) => {
  return new Date(d1).toDateString() === new Date(d2).toDateString();
};

const formatDateSeparator = (ts: number) => {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Dnes";
  if (d.toDateString() === yesterday.toDateString()) return "Včera";
  return d.toLocaleDateString();
};

const validateMessage = (text: string): { valid: boolean; error?: string } => {
  const t = text.trim();
  if (!t) return { valid: false };

  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;
  if (urlRegex.test(t)) {
    return { valid: false, error: "Odkazy nejsou povoleny. Chat je pouze textový." };
  }

  const fileRegex = /\.(jpg|jpeg|png|gif|pdf|doc|docx|zip|rar)$/i;
  const words = t.split(/\s+/);
  if (words.some(w => fileRegex.test(w))) {
    return { valid: false, error: "Názvy souborů nejsou povoleny. Posílejte pouze text." };
  }

  return { valid: true };
};

export const ChatConversation: React.FC<ChatConversationProps> = ({ 
  logs, 
  currentUser, 
  channelName, 
  subTitle, 
  onBack, 
  onClose, 
  onAddMessage 
}) => {
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [logs.length]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    
    const validation = validateMessage(note);
    if (!validation.valid) {
      if (validation.error) {
        setErrorMsg(validation.error);
        if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
        setTimeout(() => setErrorMsg(null), 3000);
      }
      return;
    }
    
    onAddMessage(note);
    setNote('');
    setTimeout(() => scrollToBottom(true), 100);
  };

  return (
    <div className="flex flex-col h-full bg-midnight relative">
      {/* Header */}
      <div className="absolute top-0 left-0 w-full z-40 bg-midnight/80 backdrop-blur-xl border-b border-white/10 pt-[env(safe-area-inset-top)] shadow-sm">
         <div className="flex items-center justify-between h-14 px-4">
            <div className="flex items-center gap-3">
               <button onClick={onBack} className="p-2 -ml-2 text-solar-start active:text-white rounded-full flex items-center gap-1 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
               </button>
               <div className="flex flex-col items-center">
                  <h1 className="text-sm font-bold text-white leading-tight">{channelName}</h1>
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{subTitle}</span>
               </div>
            </div>
            <div className="w-8" />
         </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto pt-[calc(4rem+env(safe-area-inset-top))] pb-[calc(4rem+env(safe-area-inset-bottom))] px-0 no-scrollbar">
         {logs.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 opacity-30 select-none h-full">
              <div className="text-6xl mb-6 grayscale">💬</div>
              <p className="text-base font-bold">Začátek konverzace</p>
              <p className="text-xs mt-2 text-white/50 max-w-[200px] text-center">Zde můžete bezpečně komunikovat s kolegy.</p>
           </div>
         ) : (
           <div className="pb-2 pt-4">
             {logs.map((log, idx) => {
               const isMe = log.workerId === currentUser.id;
               const prevLog = logs[idx - 1];
               const nextLog = logs[idx + 1];
               const isSameUserPrev = prevLog && prevLog.workerId === log.workerId;
               const isSameUserNext = nextLog && nextLog.workerId === log.workerId;
               const timeDiffPrev = prevLog ? (log.timestamp - prevLog.timestamp) / 1000 / 60 : 0;
               const timeDiffNext = nextLog ? (nextLog.timestamp - log.timestamp) / 1000 / 60 : 0;
               const isGroupStart = !isSameUserPrev || timeDiffPrev > 5 || !isSameDay(prevLog.timestamp, log.timestamp);
               const isGroupEnd = !isSameUserNext || timeDiffNext > 5 || !isSameDay(nextLog.timestamp, log.timestamp);

               let pos: GroupPosition = 'middle';
               if (isGroupStart && isGroupEnd) pos = 'single';
               else if (isGroupStart) pos = 'top';
               else if (isGroupEnd) pos = 'bottom';
               
               const showDateSeparator = !prevLog || !isSameDay(prevLog.timestamp, log.timestamp);

               return (
                 <React.Fragment key={log.id}>
                    {showDateSeparator && (
                      <div className="flex justify-center my-6 opacity-40">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">
                          {formatDateSeparator(log.timestamp)}
                        </span>
                      </div>
                    )}
                    <MessageBubble 
                        log={log} 
                        isMe={isMe} 
                        groupPosition={pos}
                        showAvatar={!isMe && isGroupEnd} 
                        showName={!isMe && isGroupStart} 
                        avatarColor={getAvatarColor(log.workerId)}
                    />
                 </React.Fragment>
               );
             })}
             <div ref={bottomRef} />
           </div>
         )}
      </div>

      {/* Input Area - Redesigned to match Midnight palette */}
      <div className="absolute bottom-0 left-0 w-full bg-midnight/80 backdrop-blur-3xl border-t border-white/10 pb-[env(safe-area-inset-bottom)] z-50">
         
         {errorMsg && (
            <div className="absolute -top-14 left-0 w-full px-4 flex justify-center animate-slide-up">
              <div className="bg-danger text-white text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-2xl shadow-glow border border-white/20">
                {errorMsg}
              </div>
            </div>
         )}

         <form onSubmit={handleSubmit} className="p-3 px-4 flex items-end gap-3">
            
            <div className="flex-1 bg-white/5 backdrop-blur-md rounded-[24px] border border-white/10 flex items-center min-h-[44px] my-1.5 px-1 focus-within:border-solar-start/30 transition-all shadow-inner">
               <textarea 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }}}
                  rows={1}
                  placeholder="Napište zprávu..."
                  className="w-full bg-transparent text-white placeholder-white/20 text-[15px] px-4 py-2.5 focus:outline-none resize-none max-h-32 leading-relaxed"
                  style={{ minHeight: '44px' }}
               />
            </div>
            
            {note.trim().length > 0 && (
              <button 
                type="submit" 
                className="w-11 h-11 mb-2 rounded-2xl bg-solar-gradient text-white flex items-center justify-center shadow-glow active:scale-90 transition-transform ios-spring border border-white/20"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 translate-x-0.5"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>
              </button>
            )}
         </form>
      </div>
    </div>
  );
};