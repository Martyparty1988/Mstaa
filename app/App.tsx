import React, { useState } from 'react';
import { useAppEngine } from './useAppEngine';

// Feature Imports
import { Dashboard } from '../features/dashboard/Dashboard';
import { CreateProject } from '../features/project/CreateProject';
import { FieldMap } from '../features/field/FieldMap';
import { ProjectLog } from '../features/chat/ProjectLog';
import { TeamManager } from '../features/team/TeamManager';
import { Stats } from '../features/stats/Stats';
import { Settings } from '../features/settings/Settings';
import { GlobalTabBar, GlobalTab } from '../ui/GlobalTabBar';

const App = () => {
  const {
    view, setView: setEngineView,
    projectTab, setProjectTab,
    projects, activeProject,
    workers, workLogs,
    todaySnapshot,
    actions
  } = useAppEngine();

  // Extend the view state to include SETTINGS which is handled at the app level
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [globalTab, setGlobalTab] = useState<GlobalTab>('DASHBOARD');

  // Helper to handle routing
  const setView = (v: typeof view) => {
    setEngineView(v);
    setIsSettingsOpen(false);
  };

  // --- 1. SETTINGS OVERLAY (Modal) ---
  if (isSettingsOpen) {
    return <Settings onBack={() => setIsSettingsOpen(false)} />;
  }

  // --- 2. PROJECT CREATION FLOW ---
  if (view === 'CREATE') {
    return <CreateProject onBack={() => setView('DASHBOARD')} onSubmit={actions.createProject} />;
  }

  // --- 3. SINGLE PROJECT WORKFLOW (Deep Dive - NO BOTTOM BAR) ---
  if (view === 'PROJECT_VIEW' && activeProject) {
    const renderProjectContent = () => {
      switch (projectTab) {
        case 'MAP':
          return (
            <FieldMap 
              key={activeProject.id} 
              project={activeProject} 
              onBack={() => setView('DASHBOARD')} 
              onSave={actions.saveWork}
              onNavigate={(target) => setProjectTab(target)}
            />
          );
        case 'TEAM':
          return (
            <TeamManager 
              workers={workers} 
              onUpdateWorker={actions.updateWorker} 
              onAddWorker={actions.addWorker} 
              onBack={() => setProjectTab('MAP')} 
            />
          );
        case 'STATS':
          return (
            <Stats 
              logs={workLogs.filter(l => l.projectId === activeProject.id)} 
              workers={workers} 
              onBack={() => setProjectTab('MAP')} 
            />
          );
        case 'CHAT':
          return (
            <ProjectLog 
              logs={workLogs} 
              projectId={activeProject.id} 
              projectName={activeProject.name} 
              onBack={() => setProjectTab('MAP')} 
              onAddNote={actions.addNote} 
            />
          );
        case 'MENU':
          // Project Settings Context
          return <Settings onBack={() => setProjectTab('MAP')} />;
        default:
          return null;
      }
    };

    return (
      <div className="relative h-[100dvh] flex flex-col bg-midnight">
        {renderProjectContent()}
      </div>
    );
  }

  // --- 4. GLOBAL APP NAVIGATION (Root - WITH BOTTOM BAR) ---
  
  const renderGlobalContent = () => {
    switch (globalTab) {
      case 'DASHBOARD':
        return (
          <Dashboard 
            projects={projects} 
            activeProject={activeProject}
            onSelectProject={actions.selectProject} 
            onCreateNew={() => setView('CREATE')} 
            onLogHourly={actions.logHourly}
            onOpenSettings={() => setIsSettingsOpen(true)}
            snapshot={todaySnapshot}
            viewMode="OVERVIEW"
          />
        );
      case 'PROJECTS':
        return (
          <Dashboard 
            projects={projects} 
            activeProject={activeProject}
            onSelectProject={actions.selectProject} 
            onCreateNew={() => setView('CREATE')} 
            onLogHourly={actions.logHourly}
            onOpenSettings={() => setIsSettingsOpen(true)}
            snapshot={todaySnapshot}
            viewMode="PROJECTS_LIST"
          />
        );
      case 'STATS':
        // Global Stats
        return (
          <Stats 
            logs={workLogs} 
            workers={workers} 
            onBack={() => setGlobalTab('DASHBOARD')} 
          />
        );
      case 'CHAT':
        // Global Chat
        return (
          <ProjectLog 
            logs={workLogs} 
            onAddNote={actions.addNote}
            // No Back button in main tab
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative h-[100dvh] flex flex-col">
      {renderGlobalContent()}
      <GlobalTabBar activeTab={globalTab} onSwitch={setGlobalTab} unreadCount={0} />
    </div>
  );
};

export default App;