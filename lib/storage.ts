
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.warn('Storage read error', e);
      return defaultValue;
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage write error', e);
    }
  }
};

export const KEYS = {
  PROJECTS: 'mst_projects',
  LOGS: 'mst_logs',
  WORKERS: 'mst_workers',
  LAST_WORKER: 'mst_last_worker',
  LAST_TIMERANGE: 'mst_last_timerange'
};
