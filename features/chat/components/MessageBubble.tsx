import React from 'react';
import { WorkLog } from '../../../app/domain';

export type GroupPosition = 'single' | 'top' | 'middle' | 'bottom';

interface MessageBubbleProps {
  log: WorkLog;
  isMe: boolean;
  groupPosition: GroupPosition;
  showAvatar: boolean; // Only shown at the bottom of the group for 'other'
  showName: boolean;   // Only shown at the top of the group for 'other'
  avatarColor: string;
}

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  log, 
  isMe, 
  groupPosition, 
  showAvatar, 
  showName, 
  avatarColor 
}) => {
  const formatTime = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // --- BUBBLE SHAPE LOGIC ---
  // iOS Style:
  // - Standard radius: 18px (rounded-2xl or [18px])
  // - Grouped side radius: 4px (rounded-sm)
  
  let borderRadiusClass = "";
  
  if (isMe) {
    // Right side messages
    switch (groupPosition) {
      case 'single': borderRadiusClass = "rounded-[20px] rounded-br-sm"; break;
      case 'top':    borderRadiusClass = "rounded-[20px] rounded-br-[4px]"; break;
      case 'middle': borderRadiusClass = "rounded-[20px] rounded-r-[4px]"; break;
      case 'bottom': borderRadiusClass = "rounded-[20px] rounded-tr-[4px] rounded-br-sm"; break;
    }
  } else {
    // Left side messages
    switch (groupPosition) {
      case 'single': borderRadiusClass = "rounded-[20px] rounded-bl-sm"; break;
      case 'top':    borderRadiusClass = "rounded-[20px] rounded-bl-[4px]"; break;
      case 'middle': borderRadiusClass = "rounded-[20px] rounded-l-[4px]"; break;
      case 'bottom': borderRadiusClass = "rounded-[20px] rounded-tl-[4px] rounded-bl-sm"; break;
    }
  }

  // Margin spacing based on grouping
  const marginBottom = (groupPosition === 'bottom' || groupPosition === 'single') ? 'mb-2' : 'mb-[2px]';

  return (
    <div className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} ${marginBottom} px-3 group relative animate-slide-up`}>
      
      {/* Avatar Column (Left side only) */}
      {!isMe && (
        <div className="w-8 flex flex-col justify-end mr-2 flex-shrink-0" style={{ height: 'auto' }}>
          {showAvatar ? (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${avatarColor}`}>
              {getInitials(log.workerId)}
            </div>
          ) : <div className="w-8" />}
        </div>
      )}

      <div className={`flex flex-col max-w-[75%] relative items-${isMe ? 'end' : 'start'}`}>
        
        {/* Sender Name (Only top of group for others) */}
        {!isMe && showName && (
          <span className="text-[10px] font-medium text-white/40 ml-3 mb-1 mt-1">{log.workerId}</span>
        )}
        
        {/* THE BUBBLE */}
        <div className={`
          relative px-4 py-2 text-[15px] leading-snug break-words shadow-sm transition-all text-white
          ${borderRadiusClass}
          ${isMe 
            ? 'bg-solar-gradient text-white' 
            : 'bg-[#26262a] text-white/95 border border-white/5' // Dark gray iOS style
          }
        `}>
           {/* Text Content */}
           <span>{log.note}</span>

           {/* Hidden Timestamp (Visible on drag/hover in desktop, simplified here) */}
           {/* In a real PWA, swipe-to-reveal time is complex. We put time in the footer of the last message. */}
        </div>

        {/* Tail Effect (CSS Tricks or SVG) - Optional for pure CSS approach, using border-radius manipulation above is often cleaner for React */}
        
        {/* Status / Time (Only bottom of group) */}
        {(groupPosition === 'bottom' || groupPosition === 'single') && (
          <div className={`text-[9px] font-bold mt-1 opacity-0 group-hover:opacity-60 transition-opacity flex items-center gap-1 select-none ${isMe ? 'text-white/50 pr-1' : 'text-white/30 pl-1'}`}>
             {formatTime(log.timestamp)}
             {isMe && <span>{log.synced ? 'Doručeno' : 'Odesláno'}</span>}
          </div>
        )}

      </div>
    </div>
  );
};