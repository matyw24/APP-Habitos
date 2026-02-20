
import React from 'react';
import { HabitStats } from '../types';

interface HorizontalCalendarProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  stats: HabitStats;
}

export const HorizontalCalendar: React.FC<HorizontalCalendarProps> = ({ 
  selectedDate, 
  onSelectDate,
  stats
}) => {
  const daysOfWeek = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  
  const getMonday = (d: Date) => {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
    return new Date(d.setDate(diff));
  };

  const monday = getMonday(new Date());
  
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const isToday = dateStr === new Date().toISOString().split('T')[0];
    const isSelected = dateStr === selectedDate;
    
    const completions = stats.dailyCompletions[dateStr] || [];
    const isCompleted = stats.history.includes(dateStr);
    const hasProgress = completions.length > 0;
    
    let dotColor = 'bg-zinc-800';
    if (isCompleted) {
      dotColor = 'bg-white';
    } else if (hasProgress) {
      dotColor = 'bg-zinc-500';
    }

    return {
      dateStr,
      label: daysOfWeek[i],
      num: d.getDate(),
      isToday,
      isSelected,
      dotColor
    };
  });

  return (
    <div className="flex justify-between items-center px-2 py-4 mb-4">
      {weekDays.map((day) => (
        <button 
          key={day.dateStr} 
          onClick={() => onSelectDate(day.dateStr)}
          className="flex flex-col items-center gap-2 group outline-none"
        >
          <div className={`
            w-8 h-8 flex items-center justify-center rounded-full text-[10px] font-black transition-all
            ${day.isSelected 
              ? 'bg-white text-black scale-110 shadow-lg shadow-white/10' 
              : day.isToday ? 'bg-zinc-800 text-white border border-white/20' : 'text-zinc-500 hover:text-zinc-300'}
          `}>
            {day.label}
          </div>
          <span className={`text-sm font-bold transition-colors ${day.isSelected ? 'text-white' : 'text-zinc-600 group-hover:text-zinc-400'}`}>
            {day.num}
          </span>
          <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${day.dotColor} ${day.isSelected ? 'scale-125' : ''}`} />
        </button>
      ))}
    </div>
  );
};
