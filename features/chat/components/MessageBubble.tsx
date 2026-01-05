import React from 'react';
import { WorkLog } from '../../../domain';

interface MessageBubbleProps {
  log: WorkLog;
  isMe: boolean;
  showAvatar: boolean;
  showName: boolean;
  avatarColor: string;
}

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

export const MessageBubble: React.FC<MessageBubbleProps> = ({ log, isMe, showAvatar, showName, avatarColor }) => {
  const formatTime = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex w-full mb-1 ${isMe ? 'justify-end' : 'justify-start'} animate-slide-up group px-2`}>
      {!isMe && (
        <div className="w-8 flex flex-col justify-end mr-2 pb-1 flex-shrink-0">
          {showAvatar ? (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg ${avatarColor}`}>
              {getInitials(log.workerId)}
            </div>
          ) : <div className="w-8" />}
        </div>
      )}

      <div className={`flex flex-col max-w-[75%]`}>
        {!isMe && showName && (
          <span className="text-[10px] font-bold text-white/40 ml-3 mb-1 mt-2">{log.workerId}</span>
        )}
        
        <div className={`
          relative px-3 py-2 text-sm leading-relaxed break-words shadow-sm transition-all
          ${isMe 
            ? 'bg-solar-gradient text-white rounded-[20px] rounded-tr-sm shadow-[0_4px_15px_rgba(34,211,238,0.15)]' 
            : 'bg-surfaceHighlight/90 backdrop-blur-md text-white/95 rounded-[20px] rounded-tl-sm border border-white/5'
          }
        `}>
           {/* Image Attachments */}
           {log.attachments && log.attachments.length > 0 && (
             <div className="mb-2 -mx-1 -mt-1">
               {log.attachments.map((src, i) => (
                 <img key={i} src={src} alt="attachment" className="rounded-xl w-full h-auto object-cover max-h-60 border border-black/10" />
               ))}
             </div>
           )}

           {/* Text Content */}
           {log.note && <span>{log.note}</span>}

           {/* Metadata */}
           <div className={`text-[9px] text-right font-bold mt-1 opacity-70 flex justify-end items-center gap-1 select-none ${isMe ? 'text-black/60' : 'text-white/30'}`}>
              {formatTime(log.timestamp)}
              {isMe && <span>{log.synced ? '✓✓' : '✓'}</span>}
           </div>
        </div>
      </div>
    </div>
  );
};
