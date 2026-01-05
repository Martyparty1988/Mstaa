// --- ENUMS ---

export enum ProjectMode {
  A_FLEXIBLE = 'A', // Numbers only, size selected during work
  B_STRICT = 'B',   // Sizes defined in project structure
}

export enum TableSize {
  SMALL = 'S',
  MEDIUM = 'M',
  LARGE = 'L',
}

export enum TableStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  ISSUE = 'ISSUE',
}

export enum WorkType {
  TABLE = 'TABLE',
  HOURLY = 'HOURLY',
}

export enum WorkerRole {
  LEADER = 'LEADER',
  STRINGER = 'STRINGER',
  MONTEUR = 'MONTEUR',
  HELPER = 'HELPER'
}

// --- ENTITIES ---

export interface Worker {
  id: string;
  name: string;
  role: WorkerRole;
  rateHourly?: number;
  rateString?: number; 
  isActive: boolean;
  avatarColor?: string;
}

export interface ProjectSettings {
  stringsPerTable: {
    [TableSize.SMALL]: number;
    [TableSize.MEDIUM]: number;
    [TableSize.LARGE]: number;
    default: number;
  };
  kwpPerString: number; // Avg kWp per string
  currency: string;
}

export interface Table {
  id: string;
  label: string;      // Visual representation (exactly as entered)
  orderIndex: number; // Strict sorting order
  size?: TableSize; 
  status: TableStatus;
}

export interface Project {
  id: string;
  name: string;
  mode: ProjectMode;
  createdAt: number;
  totalTables?: number;
  completedTables: number;
  tables?: Table[]; 
  settings?: ProjectSettings;
}

export interface WorkLog {
  id: string;
  projectId: string;
  workerId: string;
  type: WorkType;
  tableId?: string; // Legacy support
  tableIds?: string[]; // Preferred
  size?: TableSize; 
  note?: string;
  timestamp: number;
  startTime?: number;
  endTime?: number;
  durationMinutes: number;
  synced: boolean;
}

// --- METRICS ---

/**
 * JEDINÝ ZDROJ PRAVDY O VÝKONU
 * Tento objekt obsahuje všechna čísla, která UI potřebuje.
 * Žádné další výpočty v komponentách.
 */
export interface PerformanceSnapshot {
  hours: number;          // Celkem hodin
  strings: number;        // Celkem stringů (podle pravidel)
  tables: number;         // Celkem stolů (ks)
  stringsPerHour: number; // Rychlost
  tablesPerDay: number;   // Tempo
  kwp: number;            // Výkon
}

export interface WorkerPerformance extends PerformanceSnapshot {
  workerId: string;
  workerName: string;
}

export interface ProjectPerformance extends PerformanceSnapshot {
  completedPercent: number;
  workers: WorkerPerformance[];
}

export interface Forecast {
  tablesRemaining: number;
  estimatedDaysLeft: number;
  estimatedCompletionDate: number | null;
}