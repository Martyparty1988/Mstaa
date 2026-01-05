import { WorkLog, Worker, ProjectPerformance, Forecast, WorkType, Project, PerformanceSnapshot, WorkerPerformance } from './types';
import { calculateLogStrings, stringsToKwp } from './rules';

/**
 * Creates a unified PerformanceSnapshot from a set of logs.
 * This is the CORE CALCULATION function for the entire app.
 */
export const createPerformanceSnapshot = (logs: WorkLog[]): PerformanceSnapshot => {
  let hours = 0;
  let strings = 0;
  let tables = 0;
  const activeDays = new Set<string>();

  logs.forEach(log => {
    // Hours Calculation
    if (log.durationMinutes) {
      hours += log.durationMinutes / 60;
    }

    // Strings & Tables Calculation
    if (log.type === WorkType.TABLE) {
       strings += calculateLogStrings(log);
       const logTables = log.tableIds ? log.tableIds.length : (log.tableId ? 1 : 0);
       tables += logTables;
    }

    // Days Calculation (for Average)
    const dateStr = new Date(log.timestamp).toDateString();
    activeDays.add(dateStr);
  });

  const stringsPerHour = hours > 0 ? strings / hours : 0;
  const dayCount = activeDays.size || 1;
  const tablesPerDay = tables / dayCount;

  return {
    hours,
    strings,
    tables,
    stringsPerHour,
    tablesPerDay,
    kwp: stringsToKwp(strings)
  };
};

/**
 * Calculates detailed performance stats for a set of logs (Project Level).
 */
export const calculatePerformance = (logs: WorkLog[], workers: Worker[], timeRange: 'DAY' | 'WEEK' | 'ALL'): ProjectPerformance => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfWeek = startOfToday - (now.getDay() === 0 ? 6 : now.getDay() - 1) * 24 * 60 * 60 * 1000;

  // 1. Filter Logs
  const filteredLogs = logs.filter(l => {
    if (timeRange === 'DAY') return l.timestamp >= startOfToday;
    if (timeRange === 'WEEK') return l.timestamp >= startOfWeek;
    return true;
  });

  // 2. Calculate Global Snapshot
  const globalSnapshot = createPerformanceSnapshot(filteredLogs);

  // 3. Group by Worker
  const workerLogs: Record<string, WorkLog[]> = {};
  filteredLogs.forEach(log => {
    if (!workerLogs[log.workerId]) workerLogs[log.workerId] = [];
    workerLogs[log.workerId].push(log);
  });

  // 4. Calculate Worker Snapshots
  const workerPerformances: WorkerPerformance[] = Object.entries(workerLogs).map(([wId, wLogs]) => {
    const wSnapshot = createPerformanceSnapshot(wLogs);
    const workerInfo = workers.find(w => w.id === wId);
    return {
      workerId: wId,
      workerName: workerInfo ? workerInfo.name : wId,
      ...wSnapshot
    };
  }).sort((a, b) => b.strings - a.strings);

  // 5. Return Project Performance
  return {
    ...globalSnapshot,
    completedPercent: 0, // Requires project total context, handled in UI or Forecast
    workers: workerPerformances
  };
};

/**
 * Forecasts completion based on current velocity.
 */
export const forecastCompletion = (project: Project, logs: WorkLog[]): Forecast => {
  if (!project.totalTables) return { tablesRemaining: 0, estimatedDaysLeft: 0, estimatedCompletionDate: null };

  const remainingTables = project.totalTables - project.completedTables;
  if (remainingTables <= 0) return { tablesRemaining: 0, estimatedDaysLeft: 0, estimatedCompletionDate: Date.now() };

  // Calculate velocity using the Snapshot logic on recent logs
  const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const recentLogs = logs.filter(l => l.projectId === project.id && l.type === WorkType.TABLE && l.timestamp > oneWeekAgo);
  
  const recentSnapshot = createPerformanceSnapshot(recentLogs);
  
  // Velocity: Tables per Actual Active Day (in last 7 days) implies intensity
  // But for forecast, we care about absolute time. 
  // Simple heuristic: Tables completed recently / 7 days.
  const velocity = recentSnapshot.tables / 7;

  if (velocity <= 0.1) {
     return { tablesRemaining: remainingTables, estimatedDaysLeft: -1, estimatedCompletionDate: null };
  }

  const daysLeft = Math.ceil(remainingTables / velocity);
  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + daysLeft);

  return {
    tablesRemaining: remainingTables,
    estimatedDaysLeft: daysLeft,
    estimatedCompletionDate: completionDate.getTime()
  };
};