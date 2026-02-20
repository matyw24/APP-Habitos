
import React from 'react';
import { Check, MoreVertical } from 'lucide-react';
import { HabitDef, TimeOfDay } from '../types';

interface HabitChecklistProps {
  habits: HabitDef[];
  completedIds: string[];
  onToggle: (id: string) => void;
  onEdit: (habit: HabitDef) => void;
}

export const HabitChecklist: React.FC<HabitChecklistProps> = ({ 
  habits, 
  completedIds, 
  onToggle,
  onEdit
}) => {
  const renderSection = (title: TimeOfDay) => {
    const sectionHabits = habits.filter(h => h.timeOfDay === title);
    if (sectionHabits.length === 0) return null;

    return (
      <div key={title} className="space-y-6 mb-10">
        <h3 className="text-[10px] font-extrabold text-zinc-600 tracking-[0.3em] uppercase px-2">{title}</h3>
        <div className="space-y-2">
          {sectionHabits.map((habit) => {
            const isDone = completedIds.includes(habit.id);
            return (
              <div 
                key={habit.id}
                className="group relative flex items-center justify-between p-4 bg-zinc-900/40 hover:bg-zinc-900/80 rounded-3xl transition-all duration-300 border border-white/5"
              >
                <div 
                  className="flex-1 flex flex-col items-start gap-1 cursor-pointer pr-4"
                  onClick={() => onToggle(habit.id)}
                >
                  <span className={`text-base font-semibold leading-tight transition-colors ${isDone ? 'text-zinc-600 line-through' : 'text-white'}`}>
                    {habit.name}
                  </span>
                  {habit.subtitle && !isDone && (
                    <span className="text-xs text-zinc-500 font-medium">{habit.subtitle}</span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(habit);
                    }}
                    className="p-2 text-zinc-600 hover:text-white transition-colors rounded-full hover:bg-zinc-800"
                  >
                    <MoreVertical size={16} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggle(habit.id);
                    }}
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
                      isDone 
                        ? 'bg-white text-black scale-100 shadow-[0_4px_12px_rgba(255,255,255,0.2)]' 
                        : 'bg-zinc-800 border border-white/5 text-transparent scale-95 hover:border-white/20'
                    }`}
                  >
                    <Check size={20} strokeWidth={3} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="pb-20">
      {renderSection('MAÑANA')}
      {renderSection('TARDE / NOCHE')}
    </div>
  );
};
