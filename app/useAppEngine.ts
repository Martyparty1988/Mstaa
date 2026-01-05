import { useState, useEffect, useMemo } from 'react';
import { Project, ProjectMode, TableSize, WorkLog, WorkType, Table, TableStatus, Worker, WorkerRole, createPerformanceSnapshot, PerformanceSnapshot } from '../domain';
import { storage, KEYS } from '../lib/storage';

export const useAppEngine = () => {
  const [view, setView] = useState<'DASHBOARD' | 'CREATE' | 'PROJECT_VIEW'>('DASHBOARD');
  const [projectTab, setProjectTab] = useState<'MAP' | 'TEAM' | 'STATS' | 'CHAT' | 'MENU'>('MAP');
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);

  // Load Persistence
  useEffect(() => {
    const savedP = storage.get<Project[]>(KEYS.PROJECTS, []);
    if (savedP.length > 0) setProjects(savedP);
    else {
      setProjects([
        { id: '1', name: 'FVE Demo Park A', mode: ProjectMode.A_FLEXIBLE, createdAt: Date.now(), completedTables: 12 },
        { id: '2', name: 'FVE Demo Park B', mode: ProjectMode.B_STRICT, createdAt: Date.now(), completedTables: 45 },
      ]);
    }

    setWorkLogs(storage.get<WorkLog[]>(KEYS.LOGS, []));

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

  // --- Computed ---
  
  const todaySnapshot: PerformanceSnapshot = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const todaysLogs = workLogs.filter(l => l.timestamp >= startOfToday);
    return createPerformanceSnapshot(todaysLogs);
  }, [workLogs]);

  // --- Actions ---

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

  const selectProject = (project: Project, targetTab: 'MAP' | 'TEAM' | 'STATS' | 'CHAT' | 'MENU' = 'MAP') => {
    setActiveProject(project);
    setProjectTab(targetTab);
    setView('PROJECT_VIEW');
  };

  const saveWork = (data: { type: WorkType; tableId?: string; tableIds?: string[]; size?: TableSize; duration: number; startTime?: number; endTime?: number; note?: string; status?: TableStatus }, targetProjectId?: string) => {
    const pId = targetProjectId || activeProject?.id;
    if (!pId) return;

    const newLog: WorkLog = {
      id: Date.now().toString(),
      projectId: pId,
      workerId: storage.get(KEYS.LAST_WORKER, 'CURRENT_USER'),
      type: data.type,
      tableId: data.tableId,
      tableIds: data.tableIds,
      size: data.size,
      note: data.note,
      timestamp: Date.now(),
      startTime: data.startTime,
      endTime: data.endTime,
      durationMinutes: data.duration,
      synced: false 
    };

    setWorkLogs(prev => [newLog, ...prev]);

    if (data.type === WorkType.TABLE) {
      const idsToUpdate = new Set(data.tableIds || (data.tableId ? [data.tableId] : []));
      const updatedProject = projects.find(p => p.id === pId);
      if (updatedProject) {
         const newP = { 
            ...updatedProject, 
            completedTables: updatedProject.completedTables + idsToUpdate.size,
            tables: updatedProject.tables?.map(t => 
               idsToUpdate.has(t.id) 
               ? { ...t, status: data.status || TableStatus.DONE, size: data.size || t.size } 
               : t
            )
         };
         setProjects(prev => prev.map(p => p.id === newP.id ? newP : p));
         if (activeProject?.id === newP.id) setActiveProject(newP);
      }
      if (navigator.vibrate) navigator.vibrate(50);
    }
  };

  const addNote = (text: string) => {
    saveWork({
      type: WorkType.HOURLY,
      duration: 0,
      note: text,
    });
  };

  const logHourly = (activity: string, duration: number, startStr: string, endStr: string) => {
    if (projects.length > 0) {
      const today = new Date();
      const [sh, sm] = startStr.split(':').map(Number);
      const [eh, em] = endStr.split(':').map(Number);
      const startDate = new Date(today); startDate.setHours(sh, sm, 0, 0);
      const endDate = new Date(today); endDate.setHours(eh, em, 0, 0);

      saveWork({
        type: WorkType.HOURLY,
        duration: duration,
        startTime: startDate.getTime(),
        endTime: endDate.getTime(),
        note: activity,
        status: TableStatus.DONE
      }, projects[0].id);
    }
  };

  const updateWorker = (updated: Worker) => {
    setWorkers(prev => prev.map(w => w.id === updated.id ? updated : w));
  };
  
  const addWorker = (newW: Worker) => {
    setWorkers(prev => [...prev, newW]);
  };

  return {
    view, setView,
    projectTab, setProjectTab,
    projects, activeProject,
    workers, workLogs,
    todaySnapshot,
    actions: {
      createProject,
      selectProject,
      saveWork,
      addNote,
      logHourly,
      updateWorker,
      addWorker
    }
  };
};