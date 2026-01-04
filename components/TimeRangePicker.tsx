import React, { useState, useEffect } from 'react';

interface TimeRangePickerProps {
  initialStart?: string;
  initialEnd?: string;
  onConfirm: (start: string, end: string, durationMinutes: number) => void;
  onCancel: () => void;
}

export const TimeRangePicker: React.FC<TimeRangePickerProps> = ({ 
  initialStart = "07:00", 
  initialEnd = "16:00", 
  onConfirm, 
  onCancel 
}) => {
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);

  // Helper to calculate duration
  const getDuration = (s: string, e: string) => {
    const [h1, m1] = s.split(':').map(Number);
    const [h2, m2] = e.split(':').map(Number);
    const mins1 = h1 * 60 + m1;
    const mins2 = h2 * 60 + m2;
    return Math.max(0, mins2 - mins1);
  };

  const duration = getDuration(start, end);
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  const handlePreset = (type: 'ALL_DAY' | 'MORNING' | 'AFTERNOON' | 'LAST_HOUR') => {
    if (type === 'ALL_DAY') { setStart('07:00'); setEnd('16:00'); }
    if (type === 'MORNING') { setStart('07:00'); setEnd('12:00'); }
    if (type === 'AFTERNOON') { setStart('12:30'); setEnd('16:30'); }
    if (type === 'LAST_HOUR') {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      const prevH = (now.getHours() - 1).toString().padStart(2, '0');
      setStart(`${prevH}:${m}`);
      setEnd(`${h}:${m}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Presets Row */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        <button onClick={() => handlePreset('ALL_DAY')} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold whitespace-nowrap active:bg-white/10">Celý den (7-16)</button>
        <button onClick={() => handlePreset('MORNING')} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold whitespace-nowrap active:bg-white/10">Dopoledne</button>
        <button onClick={() => handlePreset('AFTERNOON')} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold whitespace-nowrap active:bg-white/10">Odpoledne</button>
        <button onClick={() => handlePreset('LAST_HOUR')} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold whitespace-nowrap active:bg-white/10">Teď (1h)</button>
      </div>

      {/* Manual Inputs */}
      <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-2xl border border-white/5">
        <div className="flex flex-col">
           <label className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Začátek</label>
           <input 
             type="time" 
             value={start} 
             onChange={(e) => setStart(e.target.value)}
             className="bg-transparent text-3xl font-bold text-white focus:outline-none focus:text-primary"
           />
        </div>
        
        <div className="h-10 w-[1px] bg-white/10" />

        <div className="flex flex-col text-right">
           <label className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Konec</label>
           <input 
             type="time" 
             value={end} 
             onChange={(e) => setEnd(e.target.value)}
             className="bg-transparent text-3xl font-bold text-white focus:outline-none focus:text-primary text-right"
           />
        </div>
      </div>

      {/* Summary & Actions */}
      <div className="space-y-3">
        <div className="text-center text-sm text-white/60">
           Celkem: <span className="text-white font-bold text-lg">{hours}h {minutes}m</span>
        </div>

        <button 
          onClick={() => onConfirm(start, end, duration)}
          disabled={duration <= 0}
          className="w-full bg-primary text-slate-900 py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 disabled:opacity-50 disabled:grayscale active:scale-[0.98] transition-transform"
        >
          Potvrdit čas
        </button>
        
        <button onClick={onCancel} className="w-full py-3 text-white/40 text-sm font-bold">Zrušit</button>
      </div>
    </div>
  );
};