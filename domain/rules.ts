import { TableSize, Table, WorkLog, WorkType } from './types';

// --- CONSTANTS ---

export const STRINGS_PER_SIZE: Record<TableSize, number> = {
  [TableSize.SMALL]: 1.0,
  [TableSize.MEDIUM]: 1.5,
  [TableSize.LARGE]: 2.0,
};

export const DEFAULT_STRINGS = 1.5;
export const DEFAULT_KWP_PER_STRING = 10.0; // Estimate

// --- CALCULATIONS ---

/**
 * Returns number of strings for a specific table size.
 */
export const getStringsForSize = (size?: TableSize): number => {
  if (!size) return DEFAULT_STRINGS;
  return STRINGS_PER_SIZE[size] || DEFAULT_STRINGS;
};

/**
 * Converts strings count to kWp based on constants.
 */
export const stringsToKwp = (strings: number): number => {
  return strings * DEFAULT_KWP_PER_STRING;
};

/**
 * Calculates total strings for a list of tables.
 */
export const calculateTotalStringsFromTables = (tables: Table[]): number => {
  return tables.reduce((acc, t) => acc + getStringsForSize(t.size), 0);
};

/**
 * Calculates strings for a specific Work Log entry.
 */
export const calculateLogStrings = (log: WorkLog): number => {
  if (log.type !== WorkType.TABLE) return 0;
  
  const count = log.tableIds ? log.tableIds.length : (log.tableId ? 1 : 0);
  return count * getStringsForSize(log.size);
};
