import React, { useState, useEffect, useMemo } from 'react';
import { WorkLog, WorkType, Worker, Project } from '../../domain';
import { ChannelList } from './components/ChannelList';
import { ChatConversation } from './components/ChatConversation';

interface ChatScreenProps {
  logs: WorkLog[];
  currentUser: Worker;
  allWorkers: Worker[];
  projects: Project[];
  initialChannelId?: string; 
  onClose: () => void;
  onAddMessage: (text: string, channelId: string) => void;
  // New prop to notify parent when user enters/leaves a conversation
  onChannelSwitch?: (channelId: string | null) => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ 
  logs, 
  currentUser, 
  allWorkers, 
  projects, 
  initialChannelId, 
  onClose, 
  onAddMessage,
  onChannelSwitch
}) => {
  const [activeChannelId, setActiveChannelId] = useState<string | null>(initialChannelId || null);

  useEffect(() => {
    if (initialChannelId) {
      setActiveChannelId(initialChannelId);
      // Notify parent if initial channel is set
      if (onChannelSwitch) onChannelSwitch(initialChannelId);
    }
  }, [initialChannelId, onChannelSwitch]);

  // Wrapper to sync local state and parent notification
  const handleChannelSwitch = (id: string | null) => {
    setActiveChannelId(id);
    if (onChannelSwitch) onChannelSwitch(id);
  };

  // --- DERIVED STATE FOR CONVERSATION ---
  
  const filteredLogs = useMemo(() => {
    if (!activeChannelId) return [];
    return logs
      .filter(l => l.projectId === activeChannelId) 
      .filter(l => l.note && (l.durationMinutes || 0) === 0 && l.type === WorkType.HOURLY)
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [logs, activeChannelId]);

  const { title, subTitle } = useMemo(() => {
     let title = "Chat";
     let subTitle = "Konverzace";
     
     if (!activeChannelId) return { title, subTitle };

     const project = projects.find(p => p.id === activeChannelId);
     if (project) {
       title = project.name;
       subTitle = "Projektový tým";
     } else if (activeChannelId.startsWith('dm_')) {
       // Find the other user
       // ID Format: dm_id1_id2 (sorted)
       const ids = activeChannelId.replace('dm_', '').split('_');
       const otherId = ids.find(id => id !== currentUser.id);
       const otherUser = allWorkers.find(w => w.id === otherId);
       
       if (otherUser) {
         title = otherUser.name;
         subTitle = "Soukromá zpráva";
       }
     }
     return { title, subTitle };
  }, [activeChannelId, projects, allWorkers, currentUser]);


  // --- RENDER ---

  return (
    // Changed from fixed z-[100] to relative h-full to allow GlobalTabBar (z-50) to sit on top in List View
    <div className="relative h-full bg-midnight flex flex-col overflow-hidden">
       {activeChannelId ? (
         <ChatConversation 
            logs={filteredLogs}
            currentUser={currentUser}
            channelName={title}
            subTitle={subTitle}
            onBack={() => handleChannelSwitch(null)}
            onClose={onClose}
            onAddMessage={(text) => onAddMessage(text, activeChannelId)}
         />
       ) : (
         <ChannelList 
            projects={projects}
            allWorkers={allWorkers}
            currentUser={currentUser}
            onSelect={handleChannelSwitch}
            onClose={onClose}
         />
       )}
    </div>
  );
};