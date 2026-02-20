
export type TimeOfDay = 'MAÑANA' | 'TARDE / NOCHE';

export interface HabitDef {
  id: string;
  name: string;
  subtitle?: string;
  timeOfDay: TimeOfDay;
  streak: number;
}

export type AppPage = 'habits' | 'clips' | 'stats' | 'manifestation' | 'auth';

export interface Affirmation {
  id: string;
  text: string;
}

export interface VisionItem {
  url: string;
  caption: string;
}

export interface PriorityTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface HabitStats {
  totalClips: number;
  clipsMovedToday: number;
  currentStreak: number;
  lastCompletedDate: string | null;
  history: string[]; 
  availableHabits: HabitDef[];
  dailyCompletions: { [date: string]: string[] };
  visionBoard: VisionItem[];
  affirmations: Affirmation[];
  priorityTasks: PriorityTask[];
}

export interface HabitStack {
  id: string;
  trigger: string;
  action: string;
}
