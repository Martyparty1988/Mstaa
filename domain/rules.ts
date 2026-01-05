import { TableSize, Table, WorkLog, WorkType, ProjectSettings } from './types';

// --- CONSTANTS ---

export const DEFAULT_STRINGS_PER_SIZE: Record<TableSize, number> = {
  [TableSize.SMALL]: 1.0,
  [TableSize.MEDIUM]: 1.5,
  [TableSize.LARGE]: 2.0,
};

export const DEFAULT_STRINGS = 1.5;
// 1 Panel = 700W
// 1 String = 28 Panels = 19,600W = 19.6 kWp
export const DEFAULT_KWP_PER_STRING = 19.6;

// --- CALCULATIONS ---

/**
 * Returns number of strings for a specific table size, respecting project settings.
 */
export const getStringsForSize = (size: TableSize | undefined, settings?: ProjectSettings): number => {
  if (!size) {
    return settings?.stringsPerTable?.default ?? DEFAULT_STRINGS;
  }
  
  if (settings?.stringsPerTable) {
    return settings.stringsPerTable[size] ?? settings.stringsPerTable.default ?? DEFAULT_STRINGS;
  }

  return DEFAULT_STRINGS_PER_SIZE[size] ?? DEFAULT_STRINGS;
};

/**
 * Converts strings count to kWp based on settings.
 */
export const stringsToKwp = (strings: number, settings?: ProjectSettings): number => {
  const factor = settings?.kwpPerString ?? DEFAULT_KWP_PER_STRING;
  return strings * factor;
};

/**
 * Calculates total strings for a list of tables.
 */
export const calculateTotalStringsFromTables = (tables: Table[], settings?: ProjectSettings): number => {
  return tables.reduce((acc, t) => acc + getStringsForSize(t.size, settings), 0);
};

/**
 * Calculates strings for a specific Work Log entry.
 */
export const calculateLogStrings = (log: WorkLog, settings?: ProjectSettings): number => {
  if (log.type !== WorkType.TABLE) return 0;
  
  const count = log.tableIds ? log.tableIds.length : (log.tableId ? 1 : 0);
  return count * getStringsForSize(log.size, settings);
};