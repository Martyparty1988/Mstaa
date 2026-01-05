import { AppBackup, AppSchema, Project, WorkLog, Worker } from '../app/domain';
import { storage, KEYS } from './storage';

const CURRENT_SCHEMA_VERSION = 1;
const APP_NAME = "MST_SOLAR_TRACKER";

export const dataManager = {
  
  /**
   * Creates a full backup object of the current state.
   */
  createBackup: (): AppBackup => {
    const data: AppSchema = {
      projects: storage.get<Project[]>(KEYS.PROJECTS, []),
      logs: storage.get<WorkLog[]>(KEYS.LOGS, []),
      workers: storage.get<Worker[]>(KEYS.WORKERS, [])
    };

    return {
      meta: {
        version: CURRENT_SCHEMA_VERSION,
        timestamp: Date.now(),
        appName: APP_NAME,
        exportedBy: storage.get<string>(KEYS.LAST_WORKER, 'UNKNOWN')
      },
      data
    };
  },

  /**
   * Generates a download link for the backup JSON.
   */
  downloadBackup: () => {
    const backup = dataManager.createBackup();
    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const dateStr = new Date().toISOString().split('T')[0];
    const link = document.createElement('a');
    link.href = url;
    link.download = `MST_Backup_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Restores data from a backup object.
   * @param backup The backup object
   * @param mode 'REPLACE' wipes local data, 'MERGE' adds unique items and updates conflicts.
   */
  restoreBackup: (backup: AppBackup, mode: 'REPLACE' | 'MERGE'): boolean => {
    try {
      if (backup.meta.appName !== APP_NAME) {
        console.warn("Nekompatibilní záloha");
      }

      const incoming = backup.data;

      if (mode === 'REPLACE') {
        storage.set(KEYS.PROJECTS, incoming.projects);
        storage.set(KEYS.LOGS, incoming.logs);
        storage.set(KEYS.WORKERS, incoming.workers);
        return true;
      }

      if (mode === 'MERGE') {
        // MERGE STRATEGY:
        // Incoming data overwrites local data if IDs match (Assuming backup is "Truth").
        // New IDs are appended.
        
        // 1. Projects
        const currentProjects = storage.get<Project[]>(KEYS.PROJECTS, []);
        const mergedProjects = mergeArrays(currentProjects, incoming.projects);
        storage.set(KEYS.PROJECTS, mergedProjects);

        // 2. Logs
        const currentLogs = storage.get<WorkLog[]>(KEYS.LOGS, []);
        const mergedLogs = mergeArrays(currentLogs, incoming.logs);
        storage.set(KEYS.LOGS, mergedLogs);

        // 3. Workers
        const currentWorkers = storage.get<Worker[]>(KEYS.WORKERS, []);
        const mergedWorkers = mergeArrays(currentWorkers, incoming.workers);
        storage.set(KEYS.WORKERS, mergedWorkers);

        return true;
      }

      return false;
    } catch (e) {
      console.error("Restore failed", e);
      return false;
    }
  }
};

/**
 * Generic merge helper.
 * Map-based merge: Incoming items overwrite existing items with same ID.
 */
function mergeArrays<T extends { id: string }>(current: T[], incoming: T[]): T[] {
  const map = new Map<string, T>();
  
  // Load current
  current.forEach(item => map.set(item.id, item));
  
  // Overlay incoming
  incoming.forEach(item => map.set(item.id, item));
  
  return Array.from(map.values());
}