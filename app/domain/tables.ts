import { Table, TableStatus, TableSize, ProjectMode } from './types';

export interface ParsedTableId {
  prefix: string;
  main: string;
  numVal: number;
}

// --- PARSING ---

export const parseTableId = (id: string): ParsedTableId => {
  // Parsing for Prefix grouping only. 
  // We try to find the first part (e.g., "1" from "1.12" or "R1" from "R1-05")
  const parts = id.split(/[-_ .]/); 
  if (parts.length > 1) {
    return { prefix: parts[0], main: id, numVal: 0 };
  }
  return { prefix: 'Zóna 1', main: id, numVal: 0 };
};

export const parseRawTableInput = (input: string) => {
  if (!input.trim()) return { parsedTables: [], detectedMode: ProjectMode.A_FLEXIBLE };

  const lines = input.split(/[\n,]+/).map(l => l.trim()).filter(Boolean);
  
  // We strictly respect the order of input.
  const tables: Table[] = lines.map((line, index) => {
    // Generate a safe ID but keep the Label exactly as user typed
    const safeId = line.replace(/[^a-zA-Z0-9-]/g, '_') + `_${index}`;
    
    // Simple detection for size in label (e.g. "2E01 L")
    let size: TableSize | undefined = undefined;
    const upperLine = line.toUpperCase();
    if (upperLine.endsWith(' L') || upperLine.endsWith('-L')) size = TableSize.LARGE;
    else if (upperLine.endsWith(' M') || upperLine.endsWith('-M')) size = TableSize.MEDIUM;
    else if (upperLine.endsWith(' S') || upperLine.endsWith('-S')) size = TableSize.SMALL;

    return { 
      id: safeId,
      label: line, // The visual source of truth
      orderIndex: index, // The sorting source of truth
      status: TableStatus.PENDING,
      size: size
    };
  });

  // If any table has a pre-defined size, we suggest Strict Mode
  const hasDefinedSizes = tables.some(t => t.size !== undefined);

  return { 
    parsedTables: tables, 
    detectedMode: hasDefinedSizes ? ProjectMode.B_STRICT : ProjectMode.A_FLEXIBLE 
  };
};

// --- GENERATORS ---

export const generateTableRange = (
  prefix: string, 
  start: number, 
  end: number, 
  suffix: string = '', 
  size?: TableSize,
  startIndexOffset: number = 0
): Table[] => {
  const tables: Table[] = [];
  
  // Ensure correct direction
  const step = start <= end ? 1 : -1;
  let current = start;
  let safetyCounter = 0;

  while ((step > 0 ? current <= end : current >= end) && safetyCounter < 1000) {
    const numStr = current.toString().padStart(2, '0'); // Auto-pad simple numbers
    const label = `${prefix}${numStr}${suffix}`;
    const safeId = `${label.replace(/[^a-zA-Z0-9-]/g, '_')}_${Date.now()}_${safetyCounter}`;

    tables.push({
      id: safeId,
      label: label,
      orderIndex: startIndexOffset + safetyCounter,
      status: TableStatus.PENDING,
      size: size
    });

    current += step;
    safetyCounter++;
  }

  return tables;
};

// --- IMPORT HELPERS ---

export const parseCSVImport = (csvContent: string): Table[] => {
  const lines = csvContent.split('\n');
  const tables: Table[] = [];
  
  lines.forEach((line, idx) => {
    const cleanLine = line.trim();
    if (!cleanLine || cleanLine.startsWith('ID') || cleanLine.startsWith('id')) return; // Skip empty or header

    // Expected format: ID/Label, [Size]
    const parts = cleanLine.split(/[,;]/);
    const label = parts[0].trim();
    let size: TableSize | undefined = undefined;

    if (parts[1]) {
       const s = parts[1].trim().toUpperCase();
       if (s === 'L' || s === 'LARGE') size = TableSize.LARGE;
       if (s === 'M' || s === 'MEDIUM') size = TableSize.MEDIUM;
       if (s === 'S' || s === 'SMALL') size = TableSize.SMALL;
    }

    tables.push({
      id: `${label.replace(/[^a-zA-Z0-9-]/g, '_')}_${idx}`,
      label: label,
      orderIndex: idx,
      status: TableStatus.PENDING,
      size: size
    });
  });

  return tables;
};

// --- SORTING & GROUPING ---

export const sortTablesByOrder = (tables: Table[]): Table[] => {
  return [...tables].sort((a, b) => a.orderIndex - b.orderIndex);
};

export const groupTablesBySection = (tables: Table[]) => {
  // Sort by orderIndex first to ensure strict sequence
  const sorted = sortTablesByOrder(tables);
  
  const groups: Record<string, Table[]> = {};
  
  // Grouping logic
  sorted.forEach(t => {
    const { prefix } = parseTableId(t.label); 
    if (!groups[prefix]) groups[prefix] = [];
    groups[prefix].push(t);
  });
  
  // Return groups respecting the original order of appearance
  const groupKeys = Object.keys(groups).sort((a, b) => {
    const firstA = groups[a][0].orderIndex;
    const firstB = groups[b][0].orderIndex;
    return firstA - firstB;
  });
  
  return groupKeys.map(key => [key, groups[key]] as [string, Table[]]);
};