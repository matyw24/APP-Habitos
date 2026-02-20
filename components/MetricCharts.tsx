
import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

interface ChartProps {
  data: any[];
  accentColor: string;
}

export const PerformanceLineChart: React.FC<ChartProps> = ({ data, accentColor }) => {
  return (
    <div className="w-full bg-white/5 rounded-[2.5rem] p-6 border border-white/10 shadow-xl">
      <div className="mb-4">
        <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Rendimiento (Últimos 7 días)</h3>
        <p className="text-[10px] font-bold text-zinc-600">% de completitud diaria</p>
      </div>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffffff" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
            <XAxis 
              dataKey="label" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#71717a', fontSize: 10, fontWeight: 800}} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#71717a', fontSize: 10, fontWeight: 800}}
              domain={[0, 100]}
              width={25}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}
              itemStyle={{ color: '#ffffff' }}
              labelStyle={{ color: '#71717a' }}
              formatter={(value: number) => [`${value}%`, 'Completado']}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#ffffff" 
              strokeWidth={2} 
              fillOpacity={1} 
              fill="url(#lineGrad)" 
              dot={{ r: 4, fill: '#000', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const WeeklyActivityChart: React.FC<ChartProps> = ({ data, accentColor }) => {
  return (
    <div className="w-full bg-white/5 rounded-[2.5rem] p-6 border border-white/10 shadow-xl">
      <div className="mb-6">
        <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Actividad Semanal</h3>
        <p className="text-[10px] font-bold text-zinc-600">Hábitos terminados por día</p>
      </div>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#71717a', fontSize: 10, fontWeight: 800}} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#71717a', fontSize: 10, fontWeight: 800}}
              allowDecimals={false}
            />
            <Tooltip 
              cursor={{fill: '#ffffff05'}} 
              contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}
              itemStyle={{ color: '#ffffff' }}
            />
            <Bar dataKey="value" fill="#ffffff" radius={[6, 6, 6, 6]} barSize={20} name="Hábitos" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
