
import { HabitStats } from '../types';
import { supabase } from '../lib/supabaseClient';

const STORAGE_KEY = 'atomic_clips_data_v7'; 

export const defaultStats: HabitStats = {
  totalClips: 6,
  clipsMovedToday: 0,
  currentStreak: 0,
  lastCompletedDate: null,
  history: [],
  availableHabits: [
    { id: '1', name: 'Beber 2 litros de agua', subtitle: 'Hidratación constante', timeOfDay: 'MAÑANA', streak: 0 },
    { id: '2', name: 'Meditación 10 min', subtitle: 'Mente clara', timeOfDay: 'MAÑANA', streak: 0 },
    { id: '3', name: 'Leer 10 páginas', subtitle: 'Atomic Habits', timeOfDay: 'TARDE / NOCHE', streak: 0 },
    { id: '4', name: 'Ejercicio 30 min', subtitle: 'Cuerpo sano', timeOfDay: 'TARDE / NOCHE', streak: 0 },
    { id: '5', name: 'No pantallas antes de dormir', subtitle: 'Sueño profundo', timeOfDay: 'TARDE / NOCHE', streak: 0 },
    { id: '6', name: 'Revisar agenda', subtitle: 'Planificar el mañana', timeOfDay: 'TARDE / NOCHE', streak: 0 }
  ],
  dailyCompletions: {},
  visionBoard: [
    { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80', caption: 'Paz Interior' },
    { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80', caption: 'Nuevos Horizontes' }
  ],
  affirmations: [
    { id: 'a1', text: 'Soy constante en mis procesos.' },
    { id: 'a2', text: 'Atraigo el éxito con cada acción diaria.' }
  ],
  priorityTasks: [
    { id: 'p1', text: 'Tarea prioritaria 1', completed: false },
    { id: 'p2', text: 'Tarea prioritaria 2', completed: false },
    { id: 'p3', text: 'Tarea prioritaria 3', completed: false }
  ]
};

export const getInitialStats = (): HabitStats => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return defaultStats;
  
  try {
    const parsed = JSON.parse(saved) as HabitStats;
    if (!parsed.dailyCompletions) parsed.dailyCompletions = {};
    if (!parsed.priorityTasks) parsed.priorityTasks = defaultStats.priorityTasks;
    if (!parsed.visionBoard) parsed.visionBoard = defaultStats.visionBoard;
    return parsed;
  } catch (e) {
    return defaultStats;
  }
};

export const saveStats = (stats: HabitStats) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
};

export const saveStatsToSupabase = async (userId: string, stats: HabitStats) => {
  const { error } = await supabase
    .from('user_data')
    .upsert({ user_id: userId, data: stats, updated_at: new Date().toISOString() });
  
  if (error) {
    console.error('Error saving to Supabase:', error);
    throw error;
  }
};

export const loadStatsFromSupabase = async (userId: string): Promise<HabitStats | null> => {
  const { data, error } = await supabase
    .from('user_data')
    .select('data')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error loading from Supabase:', error);
    return null;
  }

  if (data && data.data) {
    return data.data as HabitStats;
  }
  return null;
};
