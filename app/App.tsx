import React, { useState } from 'react';
import { useAppEngine } from './useAppEngine';

// Feature Imports
import { Dashboard } from '../features/dashboard/Dashboard';
import { CreateProject } from '../features/project/CreateProject';
import { FieldMap } from '../features/field/FieldMap';
import { ChatScreen } from '../features/chat/ChatScreen';
import { TeamManager } from '../features/team/TeamManager';
import { Stats } from '../features/stats/Stats';
import { Settings } from '../features/settings/Settings';
import { ProjectSettings } from '../features/project/ProjectSettings';
import { GlobalTabBar, GlobalTab } from '../ui/GlobalTabBar';
import { WorkType } from '../domain';

// Extend GlobalTab type locally or just use string literal in state
type ExtendedGlobalTab = GlobalTab | 'TEAM_GLOBAL';

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
  const [globalTab, setGlobalTab] = useState<ExtendedGlobalTab>('DASHBOARD');

  // Helper to handle routing
  const setView = (v: typeof view) => {
    setEngineView(v);
    setIsSettingsOpen(false);
  };

  const currentUser = workers.find(w => w.id === 'CURRENT_USER') || workers[0];

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
              logs={workLogs.filter(l => l.projectId === activeProject.id)}
              workers={workers}
              onBack={() => setView('DASHBOARD')} 
              onSave={(data) => actions.saveWork({ ...data, type: WorkType.TABLE })}
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
            <ChatScreen 
              logs={workLogs}
              currentUser={currentUser}
              allWorkers={workers}
              projects={projects}
              initialChannelId={activeProject.id}
              onClose={() => setProjectTab('MAP')} 
              onAddMessage={actions.addNote} 
            />
          );
        case 'MENU':
          // Project Settings Context
          return (
            <ProjectSettings 
              project={activeProject}
              onUpdate={actions.updateProject}
              onBack={() => setProjectTab('MAP')}
              onExportLogs={() => actions.exportProjectData(activeProject.id)}
            />
          );
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
  
  const isGlobalChatOpen = globalTab === 'CHAT';
  // Cast back to specific type for TabBar props
  const activeTabBarTab = (globalTab === 'TEAM_GLOBAL' ? 'DASHBOARD' : globalTab) as GlobalTab;

  const renderGlobalContent = () => {
    // If Global Chat is open, render it ON TOP of dashboard/projects
    if (isGlobalChatOpen) {
      return (
        <ChatScreen 
           logs={workLogs} 
           currentUser={currentUser}
           allWorkers={workers}
           projects={projects}
           onClose={() => setGlobalTab('DASHBOARD')}
           onAddMessage={actions.addNote}
        />
      );
    }

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
            onOpenTeam={() => setGlobalTab('TEAM_GLOBAL')}
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
            onOpenTeam={() => setGlobalTab('TEAM_GLOBAL')}
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
      case 'TEAM_GLOBAL':
        return (
          <TeamManager 
             workers={workers} 
             onUpdateWorker={actions.updateWorker} 
             onAddWorker={actions.addWorker} 
             onBack={() => setGlobalTab('DASHBOARD')} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative h-[100dvh] flex flex-col">
      {renderGlobalContent()}
      
      {/* Tab Bar slides down when chat is open OR when viewing global team manager */}
      <GlobalTabBar 
        activeTab={activeTabBarTab} 
        onSwitch={(t) => setGlobalTab(t)} 
        unreadCount={0} 
        isVisible={!isGlobalChatOpen && globalTab !== 'TEAM_GLOBAL'}
      />
    </div>
  );
};

export default App;