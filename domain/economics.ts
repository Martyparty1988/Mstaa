import { WorkLog, Worker, Project, WorkType } from './types';
import { calculateLogStrings } from './rules';

export interface EarningsSummary {
  total: number;
  hourlyTotal: number;
  pieceworkTotal: number;
  currency: string;
}

/**
 * Calculates earnings for a single log entry.
 */
export const calculateLogEarnings = (log: WorkLog, worker: Worker, projects: Project[]): number => {
  if (log.workerId !== worker.id) return 0;

  // 1. Hourly Work
  if (log.type === WorkType.HOURLY) {
    const rate = worker.rateHourly || 0;
    const hours = log.durationMinutes / 60;
    return hours * rate;
  }

  // 2. Piecework (Tables -> Strings)
  if (log.type === WorkType.TABLE) {
    const rate = worker.rateString || 0;
    // Find project to get specific size definitions (S/M/L mapping)
    const project = projects.find(p => p.id === log.projectId);
    const strings = calculateLogStrings(log, project?.settings);
    return strings * rate;
  }

  return 0;
};

/**
 * Aggregates earnings for a set of logs.
 */
export const calculateEarnings = (logs: WorkLog[], worker: Worker, projects: Project[]): EarningsSummary => {
  let hourlyTotal = 0;
  let pieceworkTotal = 0;

  logs.forEach(log => {
    const amount = calculateLogEarnings(log, worker, projects);
    if (log.type === WorkType.HOURLY) {
      hourlyTotal += amount;
    } else {
      pieceworkTotal += amount;
    }
  });

  return {
    total: hourlyTotal + pieceworkTotal,
    hourlyTotal,
    pieceworkTotal,
    currency: 'EUR'
  };
};