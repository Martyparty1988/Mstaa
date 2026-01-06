

// --- TYPES ---
export * from './domain/types';

// --- RULES & CALCULATIONS ---
export {
  getStringsForSize,
  stringsToKwp,
  calculateLogStrings,
  calculateTotalStringsFromTables
} from './domain/rules';

// --- TABLE LOGIC ---
export {
  parseTableId,
  groupTablesBySection,
  parseRawTableInput,
  sortTablesByOrder,
  generateTableRange,
  parseCSVImport
} from './domain/tables';

// --- PERFORMANCE & METRICS ---
export {
  calculatePerformance,
  createPerformanceSnapshot,
  forecastCompletion
} from './domain/performance';

// --- ECONOMICS ---
export {
  calculateLogEarnings,
  calculateEarnings
} from './domain/economics';
