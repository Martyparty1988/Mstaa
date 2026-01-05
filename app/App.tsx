import React from 'react';
import { useAppEngine } from './useAppEngine';

// Feature Imports
import { Dashboard } from '../features/dashboard/Dashboard';
import { CreateProject } from '../features/project/CreateProject';
import { FieldMap } from '../features/field/FieldMap';
import { ProjectLog } from '../features/chat/ProjectLog';
import { TeamManager } from '../features/team/TeamManager';
import { Stats } from '../features/stats/Stats';
import { Settings } from '../features/settings/Settings';
import { TabBar } from '../ui/TabBar';

const App = () => {
  const {
    view, setView,
    projectTab, setProjectTab,
    projects, activeProject,
    workers, workLogs,
    todaySnapshot,
    actions
  } = useAppEngine();

  if (view === 'CREATE') {
    return <CreateProject onBack={() => setView('DASHBOARD')} onSubmit={actions.createProject} />;
  }

  if (view === 'PROJECT_VIEW' && activeProject) {
    const renderContent = () => {
      switch (projectTab) {
        case 'MAP':
          return <FieldMap key={activeProject.id} project={activeProject} onBack={() => setView('DASHBOARD')} onSave={actions.saveWork} />;
        case 'TEAM':
          return <TeamManager workers={workers} onUpdateWorker={actions.updateWorker} onAddWorker={actions.addWorker} onBack={() => setProjectTab('MAP')} />;
        case 'STATS':
          return <Stats logs={workLogs} workers={workers} onBack={() => setProjectTab('MAP')} />;
        case 'CHAT':
          return <ProjectLog logs={workLogs} projectId={activeProject.id} projectName={activeProject.name} onBack={() => setProjectTab('MAP')} onAddNote={actions.addNote} />;
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
      onSelectProject={actions.selectProject} 
      onCreateNew={() => setView('CREATE')} 
      onLogHourly={actions.logHourly}
      snapshot={todaySnapshot}
    />
  );
};

export default App;