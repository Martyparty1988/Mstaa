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
  // If grouping fails, we return a generic "List".
  
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
    
    return { 
      id: safeId,
      label: line, // The visual source of truth
      orderIndex: index, // The sorting source of truth
      status: TableStatus.PENDING,
      size: undefined // We default to undefined, user must select (Variant A)
    };
  });

  return { 
    parsedTables: tables, 
    detectedMode: ProjectMode.A_FLEXIBLE // We force A because we want manual size selection
  };
};

// --- SORTING & GROUPING ---

export const sortTablesByOrder = (tables: Table[]): Table[] => {
  return [...tables].sort((a, b) => a.orderIndex - b.orderIndex);
};

export const groupTablesBySection = (tables: Table[]) => {
  // Sort by orderIndex first to ensure strict sequence
  const sorted = sortTablesByOrder(tables);
  
  const groups: Record<string, Table[]> = {};
  
  // Grouping logic: We still group for UI clarity, but we don't re-sort inside the group
  sorted.forEach(t => {
    // Simple heuristic: Try to grab the "Row" or "Section" prefix
    // E.g., "1.05" -> prefix "1"
    const { prefix } = parseTableId(t.label); 
    if (!groups[prefix]) groups[prefix] = [];
    groups[prefix].push(t);
  });
  
  // We return the groups in the order their first elements appear in the master list
  // This preserves the "Section order" as typed by the user
  const groupKeys = Object.keys(groups).sort((a, b) => {
    const firstA = groups[a][0].orderIndex;
    const firstB = groups[b][0].orderIndex;
    return firstA - firstB;
  });
  
  return groupKeys.map(key => [key, groups[key]] as [string, Table[]]);
};