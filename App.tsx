import React, { useState, useEffect } from 'react';
import { Project, ProjectMode, TableSize, WorkLog, WorkType, Table, TableStatus, Worker, WorkerRole } from './types';
import { Dashboard } from './screens/Dashboard';
import { CreateProject } from './screens/CreateProject';
import { FieldMap } from './screens/FieldMap';
import { ProjectLog } from './screens/ProjectLog'; // Treating as Chat for now
import { TeamManager } from './screens/TeamManager';
import { Stats } from './screens/Stats';
import { Settings } from './screens/Settings';
import { TabBar } from './components/TabBar';

const App = () => {
  // State
  const [view, setView] = useState<'DASHBOARD' | 'CREATE' | 'PROJECT_VIEW'>('DASHBOARD');
  const [projectTab, setProjectTab] = useState<'MAP' | 'TEAM' | 'STATS' | 'CHAT' | 'MENU'>('MAP');
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  
  // Workers State (Global for now, could be per project)
  const [workers, setWorkers] = useState<Worker[]>([]);

  // Load Persistence
  useEffect(() => {
    const savedP = localStorage.getItem('mst_projects');
    if (savedP) setProjects(JSON.parse(savedP));
    else {
      // Demo Data
      setProjects([
        { id: '1', name: 'FVE Demo Park A', mode: ProjectMode.A_FLEXIBLE, createdAt: Date.now(), completedTables: 12 },
        { id: '2', name: 'FVE Demo Park B', mode: ProjectMode.B_STRICT, createdAt: Date.now(), completedTables: 45 },
      ]);
    }

    const savedL = localStorage.getItem('mst_logs');
    if (savedL) setWorkLogs(JSON.parse(savedL));

    const savedW = localStorage.getItem('mst_workers');
    if (savedW) {
      setWorkers(JSON.parse(savedW));
    } else {
      // Demo Workers
      setWorkers([
        { id: 'CURRENT_USER', name: 'Já', role: WorkerRole.LEADER, isActive: true, avatarColor: '#f59e0b' },
        { id: 'w2', name: 'Karel Novák', role: WorkerRole.MONTEUR, isActive: true, avatarColor: '#3b82f6', rateHourly: 15 },
        { id: 'w3', name: 'Petr Svoboda', role: WorkerRole.STRINGER, isActive: true, avatarColor: '#22c55e', rateHourly: 18 },
      ]);
    }
  }, []);

  // Save Persistence
  useEffect(() => {
    localStorage.setItem('mst_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('mst_logs', JSON.stringify(workLogs));
  }, [workLogs]);

  useEffect(() => {
    localStorage.setItem('mst_workers', JSON.stringify(workers));
  }, [workers]);

  // --- Handlers ---

  const handleCreateProject = (name: string, mode: ProjectMode, tables: Table[]) => {
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

  const handleSelectProject = (project: Project, targetTab: 'MAP' | 'TEAM' | 'STATS' | 'CHAT' | 'MENU' = 'MAP') => {
    setActiveProject(project);
    setProjectTab(targetTab);
    setView('PROJECT_VIEW');
  };

  const handleSaveWork = (data: { type: WorkType; tableId?: string; tableIds?: string[]; size?: TableSize; duration: number; startTime?: number; endTime?: number; note?: string; status?: TableStatus }, targetProjectId?: string) => {
    const pId = targetProjectId || activeProject?.id;
    if (!pId) return;

    const newLog: WorkLog = {
      id: Date.now().toString(),
      projectId: pId,
      workerId: localStorage.getItem('mst_last_worker') || 'CURRENT_USER', 
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

  const handleAddNote = (text: string) => {
    handleSaveWork({
      type: WorkType.HOURLY,
      duration: 0,
      note: text,
    });
  };

  const handleDashboardLog = (activity: string, duration: number, startStr: string, endStr: string) => {
    if (projects.length > 0) {
      const today = new Date();
      const [sh, sm] = startStr.split(':').map(Number);
      const [eh, em] = endStr.split(':').map(Number);
      const startDate = new Date(today); startDate.setHours(sh, sm, 0, 0);
      const endDate = new Date(today); endDate.setHours(eh, em, 0, 0);

      handleSaveWork({
        type: WorkType.HOURLY,
        duration: duration,
        startTime: startDate.getTime(),
        endTime: endDate.getTime(),
        note: activity,
        status: TableStatus.DONE
      }, projects[0].id);
    }
  };

  // --- Worker Handlers ---
  const handleUpdateWorker = (updated: Worker) => {
    setWorkers(prev => prev.map(w => w.id === updated.id ? updated : w));
  };
  const handleAddWorker = (newW: Worker) => {
    setWorkers(prev => [...prev, newW]);
  };

  // --- Render Logic ---

  if (view === 'CREATE') {
    return <CreateProject onBack={() => setView('DASHBOARD')} onSubmit={handleCreateProject} />;
  }

  if (view === 'PROJECT_VIEW' && activeProject) {
    const renderContent = () => {
      switch (projectTab) {
        case 'MAP':
          return <FieldMap key={activeProject.id} project={activeProject} onBack={() => setView('DASHBOARD')} onSave={handleSaveWork} />;
        case 'TEAM':
          return <TeamManager workers={workers} onUpdateWorker={handleUpdateWorker} onAddWorker={handleAddWorker} onBack={() => setProjectTab('MAP')} />;
        case 'STATS':
          return <Stats logs={workLogs} workers={workers} onBack={() => setProjectTab('MAP')} />;
        case 'CHAT':
          return <ProjectLog logs={workLogs} projectId={activeProject.id} projectName={activeProject.name} onBack={() => setProjectTab('MAP')} onAddNote={handleAddNote} />;
        case 'MENU':
          return <Settings onBack={() => setProjectTab('MAP')} />;
        default:
          return null;
      }
    };

    return (
      <div className="relative h-[100dvh] flex flex-col">
        {renderContent()}
        <TabBar activeTab={projectTab} onSwitch={setProjectTab} />
      </div>
    );
  }

  return (
    <Dashboard 
      projects={projects} 
      onSelectProject={handleSelectProject} 
      onCreateNew={() => setView('CREATE')} 
      onLogHourly={handleDashboardLog}
      todayStats={{ count: 0, timeStr: '0h' }} // TODO: Re-integrate getTodayStats logic
    />
  );
};

export default App;