import { useState, useCallback } from 'react';
import { Table } from '../../domain';

export type FieldSelection = {
  ids: Set<string>;
  lastInteractedId?: string;
};

export const useFieldSelection = () => {
  const [selection, setSelection] = useState<FieldSelection>({ ids: new Set() });

  const toggle = useCallback((tableId: string) => {
    setSelection(prev => {
      const newIds = new Set(prev.ids);
      if (newIds.has(tableId)) {
        newIds.delete(tableId);
      } else {
        newIds.add(tableId);
      }
      return { ids: newIds, lastInteractedId: tableId };
    });
  }, []);

  // New method to force selection and set focus (for Grid -> Overlay navigation)
  const focus = useCallback((tableId: string) => {
    setSelection(prev => {
      const newIds = new Set(prev.ids);
      newIds.add(tableId); // Ensure it is selected
      return { ids: newIds, lastInteractedId: tableId };
    });
  }, []);

  const selectGroup = useCallback((tables: Table[]) => {
    setSelection(prev => {
      const newIds = new Set(prev.ids);
      const allInGroupSelected = tables.every(t => newIds.has(t.id));

      if (allInGroupSelected) {
        // Deselect all in group
        tables.forEach(t => newIds.delete(t.id));
      } else {
        // Select all in group
        tables.forEach(t => newIds.add(t.id));
      }
      
      return { ids: newIds, lastInteractedId: tables[0]?.id };
    });
  }, []);

  const clear = useCallback(() => {
    setSelection({ ids: new Set() });
  }, []);

  return {
    selectedIds: selection.ids,
    lastInteractedId: selection.lastInteractedId,
    count: selection.ids.size,
    hasSelection: selection.ids.size > 0,
    toggle,
    focus,
    selectGroup,
    clear
  };
};