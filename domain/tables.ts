import { Table, TableStatus, TableSize, ProjectMode } from './types';

export interface ParsedTableId {
  prefix: string;
  main: string;
  numVal: number;
}

// --- PARSING ---

export const parseTableId = (id: string): ParsedTableId => {
  const parts = id.split(/[-_ ]/); 
  if (parts.length > 1) {
    const main = parts.pop()!;
    const prefix = parts.join('-');
    const numVal = parseInt(main.replace(/\D/g, '')) || 0;
    return { prefix, main, numVal };
  }
  const numVal = parseInt(id.replace(/\D/g, '')) || 0;
  return { prefix: 'Ostatní', main: id, numVal };
};

export const parseRawTableInput = (input: string) => {
  if (!input.trim()) return { parsedTables: [], detectedMode: ProjectMode.A_FLEXIBLE };

  const lines = input.split(/[\n,]+/).map(l => l.trim()).filter(Boolean);
  let sizeDetected = false;
  
  const tables = lines.map(line => {
    const tableBase = { status: TableStatus.PENDING };
    
    // Try to parse "ID SIZE" pattern (split by whitespace)
    const parts = line.split(/\s+/);
    
    if (parts.length > 1) {
      const lastPart = parts[parts.length - 1].toUpperCase();
      
      // Check if the last part is a valid size indicator
      if (['S', 'M', 'L'].includes(lastPart)) {
        sizeDetected = true;
        let size: TableSize = TableSize.MEDIUM;
        if (lastPart === 'S') size = TableSize.SMALL;
        if (lastPart === 'M') size = TableSize.MEDIUM;
        if (lastPart === 'L') size = TableSize.LARGE;
        
        // Remove the size part from ID, join the rest back
        parts.pop();
        return { ...tableBase, id: parts.join(' '), size } as Table;
      }
    }
    
    // Fallback: Treat whole line as ID
    return { ...tableBase, id: line } as Table;
  });

  return { 
    parsedTables: tables, 
    detectedMode: sizeDetected ? ProjectMode.B_STRICT : ProjectMode.A_FLEXIBLE 
  };
};

// --- SORTING & GROUPING ---

export const sortTablesById = (tables: Table[]): Table[] => {
  return [...tables].sort((a, b) => {
    const pa = parseTableId(a.id);
    const pb = parseTableId(b.id);
    if (pa.prefix !== pb.prefix) return pa.prefix.localeCompare(pb.prefix, undefined, { numeric: true });
    return pa.numVal - pb.numVal;
  });
};

export const groupTablesBySection = (tables: Table[]) => {
  const groups: Record<string, Table[]> = {};
  tables.forEach(t => {
    const { prefix } = parseTableId(t.id);
    if (!groups[prefix]) groups[prefix] = [];
    groups[prefix].push(t);
  });
  
  // Sort internals
  Object.keys(groups).forEach(key => {
    groups[key] = sortTablesById(groups[key]);
  });
  
  // Sort sections
  return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }));
};