
import React from 'react';
import { Trophy, Target, Zap, TrendingUp } from 'lucide-react';

interface StatsSummaryProps {
  currentStreak: number;
  totalCompletedDays: number;
  totalHabitsCompleted: number;
  completionRate: number;
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({
  currentStreak,
  totalCompletedDays,
  totalHabitsCompleted,
  completionRate
}) => {
  const cards = [
    { label: 'Racha Actual', value: `${currentStreak}d`, icon: Zap },
    { label: 'Días Perfectos', value: totalCompletedDays, icon: Trophy },
    { label: 'Total Hábitos', value: totalHabitsCompleted, icon: Target },
    { label: 'Tasa Éxito', value: `${completionRate}%`, icon: TrendingUp },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {cards.map((card, i) => (
        <div key={i} className="bg-zinc-900/30 border border-white/10 p-4 rounded-3xl flex flex-col gap-3 hover:bg-zinc-900/50 transition-colors">
          <div className="w-8 h-8 bg-black border border-white/10 rounded-xl flex items-center justify-center">
            <card.icon size={16} className="text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{card.label}</p>
            <p className="text-xl font-black text-white">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
