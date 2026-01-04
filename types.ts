export enum ProjectMode {
  A_FLEXIBLE = 'A', // Pouze čísla, velikost se zadává při práci
  B_STRICT = 'B',   // Velikosti definovány předem
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

export interface Worker {
  id: string;
  name: string;
  role: WorkerRole;
  rateHourly?: number;
  rateString?: number; // Sazba za "jednotku výkonu"
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
  currency: string;
}

export interface Table {
  id: string;
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
  settings?: ProjectSettings; // New: custom rules per project
}

export interface WorkLog {
  id: string;
  projectId: string;
  workerId: string; // References Worker.id
  type: WorkType;
  tableId?: string;
  tableIds?: string[];
  size?: TableSize; 
  note?: string;
  timestamp: number;
  startTime?: number;
  endTime?: number;
  durationMinutes: number;
  synced: boolean;
}