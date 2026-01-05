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
  onAddMessage: (text: string, channelId: string, attachments?: string[]) => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ 
  logs, 
  currentUser, 
  allWorkers, 
  projects, 
  initialChannelId, 
  onClose, 
  onAddMessage 
}) => {
  const [activeChannelId, setActiveChannelId] = useState<string | null>(initialChannelId || null);

  useEffect(() => {
    if (initialChannelId) setActiveChannelId(initialChannelId);
  }, [initialChannelId]);

  // --- DERIVED STATE FOR CONVERSATION ---
  
  const filteredLogs = useMemo(() => {
    if (!activeChannelId) return [];
    return logs
      .filter(l => l.projectId === activeChannelId) 
      .filter(l => (l.note || (l.attachments && l.attachments.length > 0)) && (l.durationMinutes || 0) === 0 && l.type === WorkType.HOURLY)
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
    <div className="fixed inset-0 z-[100] bg-midnight flex flex-col">
       {activeChannelId ? (
         <ChatConversation 
            logs={filteredLogs}
            currentUser={currentUser}
            channelName={title}
            subTitle={subTitle}
            onBack={() => setActiveChannelId(null)}
            onClose={onClose}
            onAddMessage={(text, attachments) => onAddMessage(text, activeChannelId, attachments)}
         />
       ) : (
         <ChannelList 
            projects={projects}
            allWorkers={allWorkers}
            currentUser={currentUser}
            onSelect={setActiveChannelId}
            onClose={onClose}
         />
       )}
    </div>
  );
};