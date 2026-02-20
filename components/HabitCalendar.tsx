
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface HabitCalendarProps {
  dailyCompletions: { [date: string]: string[] };
  history: string[];
  totalHabits: number;
}

export const HabitCalendar: React.FC<HabitCalendarProps> = ({ dailyCompletions, history, totalHabits }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const todayStr = new Date().toISOString().split('T')[0];

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const monthYearLabel = viewDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const numDays = daysInMonth(year, month);
  const startOffset = firstDayOfMonth(year, month);

  // Generate calendar grid
  const calendarDays = [];
  // Padding for start of month
  for (let i = 0; i < startOffset; i++) {
    calendarDays.push(null);
  }
  // Days of month
  for (let d = 1; d <= numDays; d++) {
    const dObj = new Date(year, month, d);
    const dateStr = dObj.toISOString().split('T')[0];
    const completions = dailyCompletions[dateStr] || [];
    const numCompleted = completions.length;
    const isPerfect = history.includes(dateStr) || (numCompleted === totalHabits && totalHabits > 0);
    const progress = totalHabits > 0 ? (numCompleted / totalHabits) : 0;
    
    calendarDays.push({
      dayNum: d,
      dateStr,
      progress,
      isPerfect,
      isToday: dateStr === todayStr
    });
  }

  return (
    <div className="bg-zinc-900/30 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
      {/* Calendar Header */}
      <div className="p-6 flex items-center justify-between border-b border-white/5">
        <h3 className="text-sm font-black text-white uppercase tracking-widest">
          {monthYearLabel}
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={handlePrevMonth}
            className="p-2 bg-black hover:bg-zinc-800 rounded-xl text-zinc-400 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={handleNextMonth}
            className="p-2 bg-black hover:bg-zinc-800 rounded-xl text-zinc-400 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Days Labels */}
      <div className="grid grid-cols-7 gap-px bg-white/5 px-2 py-3">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
          <div key={d} className="text-center text-[10px] font-black text-zinc-600 uppercase tracking-tighter">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 p-4">
        {calendarDays.map((day, i) => (
          <div key={i} className="aspect-square relative flex items-center justify-center">
            {!day ? (
              <div className="w-full h-full" />
            ) : (
              <div className="relative group w-full h-full flex items-center justify-center">
                {/* Background Ring / Progress Visualizer */}
                <div className="absolute inset-0 flex items-center justify-center">
                   <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="50%"
                        cy="50%"
                        r="35%"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="transparent"
                        className="text-zinc-800"
                      />
                      {day.progress > 0 && (
                        <circle
                          cx="50%"
                          cy="50%"
                          r="35%"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="transparent"
                          strokeDasharray="100"
                          strokeDashoffset={100 - (day.progress * 100)}
                          strokeLinecap="round"
                          className={day.isPerfect ? 'text-white' : 'text-zinc-500'}
                          style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                        />
                      )}
                   </svg>
                </div>

                {/* Day Number */}
                <div className={`
                  z-10 text-[11px] font-black transition-all
                  ${day.isPerfect ? 'text-white' : day.progress > 0 ? 'text-zinc-300' : 'text-zinc-600'}
                  ${day.isToday ? 'bg-white text-black w-6 h-6 rounded-full flex items-center justify-center scale-110 shadow-lg' : ''}
                `}>
                  {day.isPerfect ? <Check size={12} strokeWidth={4} /> : day.dayNum}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="px-6 py-4 bg-black/50 flex justify-center gap-6 border-t border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Perfecto</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-zinc-500" />
          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">En curso</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-zinc-800" />
          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Pendiente</span>
        </div>
      </div>
    </div>
  );
};
