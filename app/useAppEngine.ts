import { useState, useEffect, useMemo } from 'react';
import { Project, ProjectMode, TableSize, WorkLog, WorkType, Table, TableStatus, Worker, WorkerRole, createPerformanceSnapshot, PerformanceSnapshot, AppBackup } from './domain';
import { storage, KEYS } from '../lib/storage';
import { dataManager } from '../lib/dataManager';

export const useAppEngine = () => {
  const [view, setView] = useState<'DASHBOARD' | 'CREATE' | 'PROJECT_VIEW'>('DASHBOARD');
  const [projectTab, setProjectTab] = useState<'MAP' | 'TEAM' | 'STATS' | 'CHAT' | 'RECORDS' | 'MENU'>('MAP');
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [lastReadChat, setLastReadChat] = useState<number>(() => storage.get(KEYS.LAST_READ_CHAT, 0));

  // Load Persistence
  useEffect(() => {
    const savedP = storage.get<Project[]>(KEYS.PROJECTS, []);
    if (savedP.length > 0) setProjects(savedP);
    else {
      setProjects([
        { id: '1', name: 'FVE Demo Park A', mode: ProjectMode.A_FLEXIBLE, createdAt: Date.now(), completedTables: 0, tables: [] },
      ]);
    }

    const savedLogs = storage.get<WorkLog[]>(KEYS.LOGS, []);
    
    // Inject Demo Chat if empty (for visualization purposes)
    if (savedLogs.length === 0) {
      const now = Date.now();
      const hour = 3600000;
      const demoLogs: WorkLog[] = [
        { id: 'msg1', projectId: '1', workerId: 'Karel Novák', type: WorkType.HOURLY, timestamp: now - 4 * hour, durationMinutes: 0, synced: true, note: 'Zdravím tým, na sekci 2E chybí profily. Může to někdo dovézt?' },
        { id: 'msg2', projectId: '1', workerId: 'Petr Svoboda', type: WorkType.HOURLY, timestamp: now - 3.8 * hour, durationMinutes: 0, synced: true, note: 'Jedu tam s ještěrkou, vezmu celou paletu.' },
        { id: 'msg3', projectId: '1', workerId: 'CURRENT_USER', type: WorkType.HOURLY, timestamp: now - 3.5 * hour, durationMinutes: 0, synced: true, note: 'Super, díky Petře. Já zatím dodělám řadu 15.' },
        { id: 'msg4', projectId: '1', workerId: 'Karel Novák', type: WorkType.HOURLY, timestamp: now - 1 * hour, durationMinutes: 0, synced: true, note: 'POZOR! Na konci řady 18 je díra v plotě, nechoďte tam.' },
      ];
      setWorkLogs(demoLogs);
    } else {
      setWorkLogs(savedLogs);
    }

    const savedW = storage.get<Worker[]>(KEYS.WORKERS, []);
    if (savedW.length > 0) setWorkers(savedW);
    else {
      setWorkers([
        { id: 'CURRENT_USER', name: 'Já', role: WorkerRole.LEADER, isActive: true, avatarColor: '#f59e0b' },
        { id: 'w2', name: 'Karel Novák', role: WorkerRole.MONTEUR, isActive: true, avatarColor: '#3b82f6', rateHourly: 15 },
        { id: 'w3', name: 'Petr Svoboda', role: WorkerRole.STRINGER, isActive: true, avatarColor: '#22c55e', rateHourly: 18 },
      ]);
    }
  }, []);

  // Save Persistence
  useEffect(() => { storage.set(KEYS.PROJECTS, projects); }, [projects]);
  useEffect(() => { storage.set(KEYS.LOGS, workLogs); }, [workLogs]);
  useEffect(() => { storage.set(KEYS.WORKERS, workers); }, [workers]);
  useEffect(() => { storage.set(KEYS.LAST_READ_CHAT, lastReadChat); }, [lastReadChat]);

  // --- Computed ---
  
  const todaySnapshot: PerformanceSnapshot = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const todaysLogs = workLogs.filter(l => l.timestamp >= startOfToday);
    
    return createPerformanceSnapshot(todaysLogs, activeProject?.settings);
  }, [workLogs, activeProject]);

  const unreadChatCount = useMemo(() => {
    return workLogs.filter(l => 
      l.type === WorkType.HOURLY && 
      (l.durationMinutes || 0) === 0 && 
      l.note && 
      l.workerId !== 'CURRENT_USER' &&
      l.timestamp > lastReadChat
    ).length;
  }, [workLogs, lastReadChat]);

  // --- Actions ---

  const markChatAsRead = () => {
    setLastReadChat(Date.now());
  };

  const createProject = (name: string, mode: ProjectMode, tables: Table[]) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      mode,
      createdAt: Date.now(),
      completedTables: 0,
      totalTables: tables.length,
      tables: tables, 
    };
    setProjects(prev => [newProject, ...prev]);
    setActiveProject(newProject);
    setProjectTab('MAP');
    setView('PROJECT_VIEW');
  };

  const updateProject = (updated: Project) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    if (activeProject?.id === updated.id) {
      setActiveProject(updated);
    }
  };

  const selectProject = (project: Project, targetTab: 'MAP' | 'TEAM' | 'STATS' | 'CHAT' = 'MAP') => {
    setActiveProject(project);
    setProjectTab(targetTab);
    setView('PROJECT_VIEW');
  };

  const saveWork = (data: { type: WorkType; tableId?: string; tableIds?: string[]; size?: TableSize; duration: number; startTime?: number; endTime?: number; note?: string; status?: TableStatus }) => {
    if (!activeProject) return;

    const newLog: WorkLog = {
      id: Date.now().toString(),
      projectId: activeProject.id,
      workerId: storage.get<string>(KEYS.LAST_WORKER, 'CURRENT_USER') === 'TÝM' ? 'TEAM' : 'CURRENT_USER', // Simplified logic
      type: data.type,
      timestamp: Date.now(),
      synced: false,
      durationMinutes: data.duration,
      startTime: data.startTime,
      endTime: data.endTime,
      note: data.note,
      tableId: data.tableId,
      tableIds: data.tableIds,
      size: data.size,
      status: data.status,
    };

    setWorkLogs(prev => [newLog, ...prev]);

    // If table update, update project state locally
    if (data.type === WorkType.TABLE && (data.tableIds || data.tableId) && data.status) {
      const idsToUpdate = new Set(data.tableIds || [data.tableId!]);
      
      const updatedTables = (activeProject.tables || []).map(t => {
        if (idsToUpdate.has(t.id)) {
           return { ...t, status: data.status!, size: data.size || t.size };
        }
        return t;
      });

      const completedCount = updatedTables.filter(t => t.status === TableStatus.DONE).length;

      const updatedProject = {
        ...activeProject,
        tables: updatedTables,
        completedTables: completedCount
      };

      updateProject(updatedProject);
    }
  };

  // --- LOG MANAGEMENT ACTIONS ---

  const updateLog = (logId: string, updates: Partial<WorkLog>) => {
    setWorkLogs(prev => prev.map(log => {
      if (log.id === logId) {
        return { ...log, ...updates, synced: false }; // Mark as unsynced on edit
      }
      return log;
    }));
  };

  const deleteLog = (logId: string) => {
    const logToDelete = workLogs.find(l => l.id === logId);
    setWorkLogs(prev => prev.filter(l => l.id !== logId));

    // Revert table status if it was a table log
    if (logToDelete && logToDelete.type === WorkType.TABLE && activeProject && (logToDelete.tableIds || logToDelete.tableId)) {
       const idsToRevert = new Set(logToDelete.tableIds || [logToDelete.tableId!]);
       const updatedTables = (activeProject.tables || []).map(t => {
         if (idsToRevert.has(t.id)) {
            // Revert to Pending. Real-world app might need "Previous Status" logic or just generic PENDING.
            return { ...t, status: TableStatus.PENDING };
         }
         return t;
       });
       
       const completedCount = updatedTables.filter(t => t.status === TableStatus.DONE).length;
       updateProject({ ...activeProject, tables: updatedTables, completedTables: completedCount });
    }
  };

  const duplicateLog = (logId: string) => {
    const log = workLogs.find(l => l.id === logId);
    if (!log) return;

    const newLog: WorkLog = {
      ...log,
      id: Date.now().toString(),
      timestamp: Date.now(),
      synced: false,
      startTime: undefined,
      endTime: undefined, 
    };
    
    setWorkLogs(prev => [newLog, ...prev]);
  };

  const logHourly = (activity: string, duration: number, start: string, end: string) => {
    if (!activeProject) return;
    const now = new Date();
    // Simplified parsing for demo
    const startTime = new Date(now.setHours(parseInt(start.split(':')[0]), parseInt(start.split(':')[1]))).getTime();
    const endTime = new Date(now.setHours(parseInt(end.split(':')[0]), parseInt(end.split(':')[1]))).getTime();

    const newLog: WorkLog = {
      id: Date.now().toString(),
      projectId: activeProject.id,
      workerId: 'CURRENT_USER',
      type: WorkType.HOURLY,
      timestamp: Date.now(),
      synced: false,
      durationMinutes: duration,
      startTime,
      endTime,
      note: activity
    };
    setWorkLogs(prev => [newLog, ...prev]);
  };

  const addNote = (text: string, channelId?: string) => {
    const newLog: WorkLog = {
      id: Date.now().toString(),
      projectId: channelId || activeProject?.id || 'GLOBAL',
      workerId: 'CURRENT_USER',
      type: WorkType.HOURLY,
      timestamp: Date.now(),
      synced: false,
      durationMinutes: 0,
      note: text
    };
    setWorkLogs(prev => [newLog, ...prev]);
  };

  const updateWorker = (worker: Worker) => {
    setWorkers(prev => prev.map(w => w.id === worker.id ? worker : w));
  };

  const addWorker = (worker: Worker) => {
    setWorkers(prev => [...prev, worker]);
  };

  const exportProjectData = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const logs = workLogs.filter(l => l.projectId === projectId);
    const headers = "Timestamp,Date,Time,Worker,Type,TableIDs,Size,Status,Duration(min),Note\n";
    
    const rows = logs.map(l => {
      const date = new Date(l.timestamp).toLocaleDateString();
      const time = new Date(l.timestamp).toLocaleTimeString();
      const tables = l.tableIds ? l.tableIds.join(';') : (l.tableId || '');
      const cleanNote = (l.note || '').replace(/[\n,]/g, ' ');
      
      return `${l.timestamp},${date},${time},${l.workerId},${l.type},"${tables}",${l.size || ''},${l.status || ''},${l.durationMinutes},"${cleanNote}"`;
    }).join("\n");

    const csvContent = headers + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${project.name.replace(/\s+/g, '_')}_export.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- DATA MANAGEMENT ---

  const fullReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  const importAppState = (jsonData: string, mode: 'REPLACE' | 'MERGE' = 'REPLACE') => {
    try {
      // 1. Parse Data
      let backup: AppBackup;
      
      try {
        const parsed = JSON.parse(jsonData);
        // Simple heuristic to check if it's our format
        if (parsed.meta && parsed.data) {
          backup = parsed;
        } else {
          // Legacy format fallback (direct storage dump)
          console.warn("Legacy format detected, wrapping...");
          backup = {
            meta: { version: 0, timestamp: Date.now(), appName: 'MST_SOLAR_TRACKER', exportedBy: 'UNKNOWN' },
            data: parsed
          };
        }
      } catch (e) {
        alert("Chyba: Neplatný JSON formát.");
        return;
      }

      // 2. Perform Restore using DataManager
      const success = dataManager.restoreBackup(backup, mode);

      if (success) {
        window.location.reload();
      } else {
        alert("Chyba při obnově dat.");
      }
    } catch (e) {
      alert("Kritická chyba při importu.");
      console.error(e);
    }
  };

  const getExportData = () => {
    // Legacy support wrapper, preferring DataManager
    return JSON.stringify(dataManager.createBackup(), null, 2);
  };

  const downloadBackup = () => {
    dataManager.downloadBackup();
  };

  return {
    view, setView,
    projectTab, setProjectTab,
    projects, activeProject,
    workers, workLogs,
    todaySnapshot,
    unreadChatCount,
    actions: {
      createProject,
      selectProject,
      saveWork,
      logHourly,
      addNote,
      updateWorker,
      addWorker,
      updateProject,
      exportProjectData,
      updateLog,
      deleteLog,
      duplicateLog,
      fullReset,
      importAppState,
      getExportData,
      downloadBackup,
      markChatAsRead
    }
  };
};