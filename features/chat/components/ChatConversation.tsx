import React, { useState, useRef, useEffect } from 'react';
import { WorkLog, Worker } from '../../../domain';
import { MessageBubble } from './MessageBubble';

interface ChatConversationProps {
  logs: WorkLog[];
  currentUser: Worker;
  channelName: string;
  subTitle: string;
  onBack: () => void;
  onClose: () => void;
  onAddMessage: (text: string, attachments?: string[]) => void;
}

const QUICK_REPLIES = ["Rozumím 👍", "Hotovo ✅", "Jdu na to 🏃", "Potřebuji pomoc 🆘", "Chybí materiál 🧱", "Díky 🙏", "Zavolám 📞"];

const getAvatarColor = (name: string) => {
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500', 'bg-pink-500', 'bg-cyan-500'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

// Date helper
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
  const [attachment, setAttachment] = useState<string | null>(null); // Single attachment for now
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = (smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [logs.length]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!note.trim() && !attachment) return;
    
    onAddMessage(note, attachment ? [attachment] : undefined);
    setNote('');
    setAttachment(null);
    setTimeout(() => scrollToBottom(true), 100);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachment(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-midnight relative">
      {/* Header */}
      <div className="absolute top-0 left-0 w-full z-40 bg-midnight/90 backdrop-blur-xl border-b border-white/10 pt-[env(safe-area-inset-top)] shadow-lg">
         <div className="flex items-center justify-between h-14 px-4">
            <div className="flex items-center gap-3">
               <button onClick={onBack} className="p-2 -ml-2 text-white/60 active:text-white rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
               </button>
               <div>
                  <h1 className="text-base font-bold text-white leading-none">{channelName}</h1>
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{subTitle}</span>
               </div>
            </div>
            <button onClick={onClose} className="p-2 -mr-2 text-white/40 active:text-white rounded-full">
               <span className="text-xs font-bold uppercase tracking-widest">Zavřít</span>
            </button>
         </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto pt-[calc(4rem+env(safe-area-inset-top))] pb-[calc(4rem+env(safe-area-inset-bottom))] px-0">
         {logs.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 opacity-30 select-none h-full">
              <div className="text-5xl mb-4 grayscale">💬</div>
              <p className="text-sm font-bold">Začátek konverzace</p>
              <p className="text-xs mt-2 text-white/50">Všechny zprávy a hlášení se objeví zde.</p>
           </div>
         ) : (
           <div className="pb-2 pt-4">
             {logs.map((log, idx) => {
               const isMe = log.workerId === currentUser.id;
               const prevLog = logs[idx - 1];
               const isSameUser = prevLog && prevLog.workerId === log.workerId && log.type === prevLog.type;
               
               const showDateSeparator = !prevLog || !isSameDay(prevLog.timestamp, log.timestamp);

               return (
                 <React.Fragment key={log.id}>
                    {showDateSeparator && (
                      <div className="flex justify-center my-6 opacity-50">
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5 text-white/80">
                          {formatDateSeparator(log.timestamp)}
                        </span>
                      </div>
                    )}
                    <MessageBubble 
                        log={log} 
                        isMe={isMe} 
                        showAvatar={!isSameUser} 
                        showName={!isSameUser} 
                        avatarColor={getAvatarColor(log.workerId)}
                    />
                 </React.Fragment>
               );
             })}
             <div ref={bottomRef} />
           </div>
         )}
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 w-full bg-midnight/80 backdrop-blur-xl border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
         
         {/* Image Preview */}
         {attachment && (
           <div className="px-4 pt-2 flex items-center gap-2 animate-slide-up">
              <div className="relative group">
                <img src={attachment} alt="preview" className="h-16 w-16 object-cover rounded-xl border border-white/20" />
                <button 
                  onClick={() => setAttachment(null)}
                  className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1 border border-white/20 shadow-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
                </button>
              </div>
           </div>
         )}

         {/* Quick Replies */}
         {!attachment && !note && (
           <div className="flex gap-2 overflow-x-auto no-scrollbar px-3 py-2 border-b border-white/5">
            {QUICK_REPLIES.map(reply => (
              <button key={reply} onClick={() => { onAddMessage(reply); setTimeout(() => scrollToBottom(true), 100); }} className="flex-shrink-0 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10 text-[10px] font-bold text-white/80 whitespace-nowrap active:bg-solar-start/20 transition-colors">
                {reply}
              </button>
            ))}
           </div>
         )}
         
         <form onSubmit={handleSubmit} className="p-2 px-3 flex items-end gap-2">
            
            {/* Attachment Button */}
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="w-11 h-11 mb-1 rounded-full bg-white/5 text-white/60 flex items-center justify-center hover:text-white active:bg-white/10 border border-white/5 transition-colors"
            >
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" /></svg>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              hidden 
              accept="image/*"
              onChange={handleFileSelect}
            />

            <div className="flex-1 bg-surfaceHighlight/50 rounded-[24px] border border-white/5 flex items-center min-h-[44px] my-1">
               <textarea 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }}}
                  rows={1}
                  placeholder="Napište zprávu..."
                  className="w-full bg-transparent text-white placeholder-white/30 text-sm px-4 py-3 focus:outline-none resize-none max-h-24"
                  style={{ minHeight: '44px' }}
               />
            </div>
            <button type="submit" disabled={!note.trim() && !attachment} className="w-11 h-11 mb-1 rounded-full bg-solar-gradient text-white flex items-center justify-center shadow-glow disabled:opacity-50 disabled:grayscale active:scale-90 transition-transform">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 translate-x-0.5 -translate-y-0.5"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>
            </button>
         </form>
      </div>
    </div>
  );
};