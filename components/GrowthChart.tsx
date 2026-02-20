
import React from 'react';
import { 
  AreaChart,
  Area,
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

interface GrowthChartProps {
  history: string[];
  streak: number;
  accentColor: string;
}

export const GrowthChart: React.FC<GrowthChartProps> = ({ history, streak, accentColor }) => {
  const data = React.useMemo(() => {
    const points = [];
    let cumulativeProgress = 1.0;
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const wasCompleted = history.includes(dateStr);
      if (wasCompleted) {
        cumulativeProgress *= 1.01;
      }
      points.push({
        day: 30 - i,
        progress: parseFloat(cumulativeProgress.toFixed(4)),
        date: dateStr
      });
    }
    return points;
  }, [history]);

  return (
    <div className="w-full h-64 mt-8 bg-neutral-900 p-4 rounded-3xl border border-neutral-800 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Curva de Interés Compuesto (1%)</h3>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
          <span className="text-xs font-bold text-neutral-400">Total: {(data[data.length-1].progress * 100 - 100).toFixed(1)}% mejor</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={accentColor} stopOpacity={0.4}/>
              <stop offset="95%" stopColor={accentColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Tooltip 
            contentStyle={{ backgroundColor: '#171717', borderRadius: '12px', border: '1px solid #262626', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
            itemStyle={{ color: accentColor }}
            labelClassName="text-neutral-500 text-[10px] font-black uppercase mb-1"
          />
          <Area 
            type="monotone" 
            dataKey="progress" 
            stroke={accentColor} 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorProgress)"
            animationDuration={2000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
