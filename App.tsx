
import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { HabitStats, HabitDef, AppPage, TimeOfDay, Affirmation, VisionItem, PriorityTask } from './types';
import { getInitialStats, saveStats, saveStatsToSupabase, loadStatsFromSupabase } from './services/storageService';
import { supabase } from './lib/supabaseClient';
import { AuthPage } from './components/AuthPage';
import { PaperClipTracker } from './components/PaperClipJar';
import { PerformanceLineChart, WeeklyActivityChart } from './components/MetricCharts';
import { HabitCalendar } from './components/HabitCalendar';
import { HabitChecklist } from './components/HabitChecklist';
import { HorizontalCalendar } from './components/HorizontalCalendar';
import { StatsSummary } from './components/StatsSummary';
import { ManifestationSection } from './components/ManifestationSection';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  LayoutGrid, 
  BarChart2, 
  X,
  Trash2,
  Settings as SettingsIcon,
  Search,
  Layers,
  Trophy,
  Sparkles,
  Image as ImageIcon,
  MessageSquare,
  CheckCircle2,
  Circle,
  PlusCircle
} from 'lucide-react';

const THEME_BG = '#000000';
const ACCENT_COLOR = '#ffffff'; 

// URLs de Sonidos
const SHOPIFY_SOUND_URL = 'https://www.myinstants.com/media/sounds/sonido-shopify.mp3';
const SIMPLE_CLICK_URL = 'https://www.soundjay.com/communication/sounds/selection-sounds-04.mp3';
const MINECRAFT_LEVELUP_URL = 'https://www.myinstants.com/media/sounds/levelup_sVAqjan.mp3';

const App: React.FC = () => {
  const [stats, setStats] = useState<HabitStats>(getInitialStats());
  const [currentPage, setCurrentPage] = useState<AppPage>('habits');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'habit' | 'vision' | 'affirmation' | 'priority'>('habit');
  const [editingHabit, setEditingHabit] = useState<HabitDef | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const notificationTimerRef = useRef<number | null>(null);
  const lastCelebratedDateRef = useRef<string | null>(null);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadStatsFromSupabase(session.user.id).then(remoteStats => {
          if (remoteStats) {
            setStats(remoteStats);
            saveStats(remoteStats); // Update local storage too
          }
        });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadStatsFromSupabase(session.user.id).then(remoteStats => {
          if (remoteStats) {
            setStats(remoteStats);
            saveStats(remoteStats);
          }
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync to Supabase when stats change (debounced)
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        saveStatsToSupabase(user.id, stats).catch(console.error);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [stats, user]);

  // Helper local para guardar y actualizar estado
  const updateStats = (updater: (prev: HabitStats) => HabitStats) => {
    setStats(prev => {
      const updated = updater(prev);
      saveStats(updated);
      return updated;
    });
  };

  const calculateStreak = useCallback((history: string[]) => {
    if (history.length === 0) return 0;
    const sortedDates = [...history].sort().reverse();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    let current = today;
    if (!sortedDates.includes(today)) {
      if (sortedDates.includes(yesterday)) {
        current = yesterday;
      } else {
        return 0;
      }
    }

    let streak = 0;
    let checkDate = new Date(current);
    
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (sortedDates.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }, []);

  const triggerConfetti = useCallback(() => {
    const launch = () => {
      if ((window as any).confetti) {
        (window as any).confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ffffff', '#a1a1aa', '#52525b'], // Grayscale confetti
          zIndex: 1000
        });
      }
    };
    if ((window as any).confetti) launch();
    else {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
      script.onload = launch;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const completions = stats.dailyCompletions[selectedDate] || [];
    const total = stats.availableHabits.length;
    const is100Percent = total > 0 && completions.length === total;

    if (is100Percent && lastCelebratedDateRef.current !== selectedDate) {
      lastCelebratedDateRef.current = selectedDate;
      setTimeout(() => {
        const audio = new Audio(MINECRAFT_LEVELUP_URL);
        audio.volume = 0.6;
        audio.play().catch(() => {});
        triggerConfetti();
      }, 600);
    } else if (!is100Percent && lastCelebratedDateRef.current === selectedDate) {
      lastCelebratedDateRef.current = null;
    }
  }, [stats.dailyCompletions, selectedDate, stats.availableHabits.length, triggerConfetti]);

  const playHabitSound = useCallback(() => {
    const audio = new Audio(SHOPIFY_SOUND_URL);
    audio.volume = 0.5;
    audio.currentTime = 0;
    audio.play().catch(() => {});
    if (window.navigator.vibrate) window.navigator.vibrate([15, 5, 15]);
  }, []);

  const playClipSound = useCallback(() => {
    const audio = new Audio(SIMPLE_CLICK_URL);
    audio.volume = 0.4;
    audio.currentTime = 0;
    audio.play().catch(() => {});
    if (window.navigator.vibrate) window.navigator.vibrate(10);
  }, []);

  const playSoftFeedback = useCallback(() => {
    if (window.navigator.vibrate) window.navigator.vibrate(5);
  }, []);

  const triggerNotification = useCallback(() => {
    if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
    setShowNotification(true);
    notificationTimerRef.current = window.setTimeout(() => {
      setShowNotification(false);
    }, 3500) as unknown as number;
  }, []);

  const updateVision = (items: VisionItem[]) => {
    updateStats(prev => ({ ...prev, visionBoard: items }));
  };

  const updateAffirmations = (affs: Affirmation[]) => {
    updateStats(prev => ({ ...prev, affirmations: affs }));
  };

  const togglePriorityTask = (id: string) => {
    updateStats(prev => {
      const newTasks = prev.priorityTasks.map(t => {
        if (t.id === id) {
          if (!t.completed) playHabitSound();
          return { ...t, completed: !t.completed };
        }
        return t;
      });
      return { ...prev, priorityTasks: newTasks };
    });
  };

  const deletePriorityTask = (id: string) => {
    updateStats(prev => {
      const newTasks = prev.priorityTasks.filter(t => t.id !== id);
      return { ...prev, priorityTasks: newTasks };
    });
    playSoftFeedback();
  };

  const lineChartData = useMemo(() => {
    const result = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const completionsCount = stats.dailyCompletions[dateStr]?.length || 0;
      const totalAvailable = stats.availableHabits.length || 1;
      const percentage = (completionsCount / totalAvailable) * 100;
      result.push({
        label: d.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase(),
        value: Math.round(percentage)
      });
    }
    return result;
  }, [stats.dailyCompletions, stats.availableHabits]);

  const weeklyData = useMemo(() => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const totalHabits = stats.availableHabits.length;
    
    return days.map((dayName, index) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (currentDayOfWeek - index));
      const dateStr = d.toISOString().split('T')[0];
      const completionsCount = stats.dailyCompletions[dateStr]?.length || 0;
      return { 
        day: dayName, 
        value: completionsCount, 
        goal: totalHabits || 1 
      };
    });
  }, [stats.dailyCompletions, stats.availableHabits]);

  const processedStats = useMemo(() => {
    const totalHabitsDone = Object.values(stats.dailyCompletions).reduce((acc: number, curr: string[]) => acc + curr.length, 0);
    const perfectDays = stats.history.length;
    
    let possibleCompletions = 0;
    let actualCompletions = 0;
    const totalAvailable = stats.availableHabits.length;
    
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      possibleCompletions += totalAvailable;
      const completions = stats.dailyCompletions[dateStr];
      actualCompletions += (completions ? completions.length : 0);
    }
    
    const successRate = possibleCompletions > 0 
      ? Math.round((actualCompletions / possibleCompletions) * 100) 
      : 0;

    return {
      currentStreak: calculateStreak(stats.history),
      perfectDays,
      totalHabitsDone,
      successRate
    };
  }, [stats.dailyCompletions, stats.history, stats.availableHabits, calculateStreak]);

  const toggleHabit = (id: string) => {
    const completionsForDate = stats.dailyCompletions[selectedDate] || [];
    const isCurrentlyCompleted = completionsForDate.includes(id);
    if (!isCurrentlyCompleted) {
      playHabitSound();
      triggerNotification();
    } else {
      playSoftFeedback();
    }
    
    updateStats(prev => {
      const currentCompletions = prev.dailyCompletions[selectedDate] || [];
      const isAlreadyCompleted = currentCompletions.includes(id);
      const newCompletions = isAlreadyCompleted 
        ? currentCompletions.filter(hid => hid !== id)
        : [...currentCompletions, id];
      const nextDaily = { ...prev.dailyCompletions, [selectedDate]: newCompletions };
      
      const isPerfect = newCompletions.length === prev.availableHabits.length && prev.availableHabits.length > 0;
      let nextHistory = [...prev.history];
      if (isPerfect && !nextHistory.includes(selectedDate)) nextHistory.push(selectedDate);
      else if (!isPerfect && nextHistory.includes(selectedDate)) nextHistory = nextHistory.filter(d => d !== selectedDate);
      
      return { 
        ...prev, 
        dailyCompletions: nextDaily, 
        history: nextHistory,
        currentStreak: calculateStreak(nextHistory),
        clipsMovedToday: selectedDate === new Date().toISOString().split('T')[0] ? Math.min(prev.totalClips, newCompletions.length) : prev.clipsMovedToday 
      };
    });
  };

  const manualMoveClip = useCallback(() => {
    updateStats(prev => {
      const nextClips = Math.min(prev.totalClips, prev.clipsMovedToday + 1);
      if (nextClips > prev.clipsMovedToday) {
        playClipSound();
        return { ...prev, clipsMovedToday: nextClips };
      }
      return prev;
    });
  }, [playClipSound]);

  const setTotalClips = (newTotal: number) => {
    updateStats(prev => ({ 
      ...prev, 
      totalClips: newTotal, 
      clipsMovedToday: Math.min(prev.clipsMovedToday, newTotal) 
    }));
  };

  const resetClips = () => {
    updateStats(prev => ({ ...prev, clipsMovedToday: 0 }));
    playSoftFeedback();
  };

  const handleModalSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (modalMode === 'habit') {
      const name = formData.get('name') as string;
      const subtitle = formData.get('subtitle') as string;
      const timeOfDay = formData.get('timeOfDay') as TimeOfDay;
      if (!name.trim()) return;
      updateStats(prev => {
        let newHabits = [...prev.availableHabits];
        if (editingHabit) newHabits = newHabits.map(h => h.id === editingHabit.id ? { ...h, name, subtitle, timeOfDay } : h);
        else newHabits.push({ id: Math.random().toString(36).substr(2, 9), name, subtitle, timeOfDay, streak: 0 });
        return { ...prev, availableHabits: newHabits };
      });
    } else if (modalMode === 'vision') {
      const url = formData.get('url') as string;
      const caption = formData.get('caption') as string;
      if (!url.trim()) return;
      updateVision([{ url, caption }, ...stats.visionBoard]);
    } else if (modalMode === 'affirmation') {
      const text = formData.get('text') as string;
      if (!text.trim()) return;
      updateAffirmations([...stats.affirmations, { id: Math.random().toString(), text }]);
    } else if (modalMode === 'priority') {
      const text = formData.get('text') as string;
      if (!text.trim()) return;
      updateStats(prev => {
        const newTask: PriorityTask = { id: Math.random().toString(), text, completed: false };
        return { ...prev, priorityTasks: [...prev.priorityTasks, newTask] };
      });
    }
    
    setIsModalOpen(false);
    setEditingHabit(null);
  };

  const selectedDayCompletions = stats.dailyCompletions[selectedDate] || [];
  const progressPercentage = Math.round((stats.availableHabits.length > 0 ? selectedDayCompletions.length / stats.availableHabits.length : 0) * 100);

  return (
    <div className="flex flex-col h-screen overflow-hidden text-white" style={{ backgroundColor: THEME_BG }}>
      <AnimatePresence>
        {showNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 z-[200] flex justify-center px-6 pointer-events-none"
          >
            <div className="bg-white border border-white px-6 py-4 rounded-[2rem] shadow-[0_10px_30px_rgba(255,255,255,0.1)] flex items-center gap-4 max-w-sm pointer-events-auto">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white">
                <Trophy size={14} />
              </div>
              <p className="text-xs font-bold text-black leading-tight">¡Objetivo alcanzado! Sigue así.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="px-6 pt-12 pb-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10">
             <SettingsIcon size={16} className="text-zinc-400" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tighter uppercase text-zinc-500">Atomic Clips</h1>
            <p className="text-xs font-bold text-zinc-300 uppercase tracking-widest">{selectedDate === new Date().toISOString().split('T')[0] ? 'Hoy' : selectedDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-zinc-500"><Search size={20}/></button>
          <button 
            onClick={() => setCurrentPage('auth')}
            className="w-9 h-9 rounded-full bg-zinc-900 border border-white/10 overflow-hidden grayscale opacity-80 hover:opacity-100 transition-opacity"
          >
            {user ? (
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="User" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-xs font-bold text-zinc-400">?</div>
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pt-4 pb-32">
        {currentPage === 'auth' && (
          <AuthPage 
            onBack={() => setCurrentPage('habits')} 
            onAuthSuccess={() => setCurrentPage('habits')} 
          />
        )}

        {currentPage === 'habits' && (
          <div className="animate-fade animate-slide space-y-8">
            <HorizontalCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} stats={stats} />
            <div className="space-y-1">
              <h2 className="text-3xl font-black tracking-tight text-white">Inbox</h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-black bg-white px-2 py-0.5 rounded-full uppercase tracking-wider">Racha: {processedStats.currentStreak}d</span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Día de {selectedDate}</span>
              </div>
            </div>
            <div className="bg-zinc-900/40 p-5 rounded-[2.5rem] border border-white/10 space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-xs font-extrabold text-zinc-500 uppercase tracking-widest">Progreso del Día</span>
                <span className="text-2xl font-black text-white">{progressPercentage}%</span>
              </div>
              <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-white transition-all duration-700 ease-out" style={{ width: `${progressPercentage}%` }} />
              </div>
            </div>
            <HabitChecklist habits={stats.availableHabits} completedIds={selectedDayCompletions} onToggle={toggleHabit} onEdit={(habit) => { setEditingHabit(habit); setModalMode('habit'); setIsModalOpen(true); }} />
          </div>
        )}

        {currentPage === 'manifestation' && (
          <div className="animate-fade animate-slide">
            <ManifestationSection 
              visionBoard={stats.visionBoard} 
              onUpdateVision={updateVision}
              accentColor={ACCENT_COLOR}
            />
          </div>
        )}

        {currentPage === 'clips' && (
          <div className="animate-fade animate-slide space-y-12">
            <div className="space-y-1">
              <h2 className="text-3xl font-black tracking-tight text-white">Clip Strategy</h2>
              <p className="text-sm text-zinc-500 font-medium leading-relaxed">Mueve los clips al completar tus tareas diarias.</p>
            </div>
            <section className="bg-zinc-900/30 p-4 rounded-[2.5rem] border border-white/10 relative">
              <PaperClipTracker count={selectedDate === new Date().toISOString().split('T')[0] ? stats.clipsMovedToday : selectedDayCompletions.length} total={stats.totalClips} onMove={manualMoveClip} onSetTotal={setTotalClips} onReset={resetClips} accentColor={ACCENT_COLOR} />
            </section>

            {/* MITs Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="space-y-1">
                  <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Prioridades (MITs)</h3>
                  <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest">Las 3 tareas importantes</p>
                </div>
                <button 
                  onClick={() => { setModalMode('priority'); setIsModalOpen(true); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                >
                  <PlusCircle size={14} /> AGREGAR
                </button>
              </div>

              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {stats.priorityTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`group flex items-center justify-between p-5 bg-zinc-900/40 rounded-[1.75rem] border border-white/5 transition-all ${task.completed ? 'opacity-50' : 'opacity-100'}`}
                    >
                      <div 
                        className="flex-1 flex items-center gap-4 cursor-pointer"
                        onClick={() => togglePriorityTask(task.id)}
                      >
                        <div className={`transition-colors ${task.completed ? 'text-white' : 'text-zinc-600'}`}>
                          {task.completed ? <CheckCircle2 size={24} strokeWidth={3} /> : <Circle size={24} strokeWidth={2} />}
                        </div>
                        <span className={`text-sm font-bold tracking-tight transition-all ${task.completed ? 'text-zinc-500 line-through' : 'text-white'}`}>
                          {task.text}
                        </span>
                      </div>
                      <button 
                        onClick={() => deletePriorityTask(task.id)}
                        className="p-2 text-zinc-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </motion.div>
                  ))}
                  {stats.priorityTasks.length === 0 && (
                    <div className="text-center py-10 border border-dashed border-white/10 rounded-[2.5rem]">
                      <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Sin tareas prioritarias</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </section>
          </div>
        )}

        {currentPage === 'stats' && (
          <div className="animate-fade animate-slide space-y-6 pt-2 pb-10">
            <h1 className="text-3xl font-black tracking-tight mb-2 text-white">Métricas</h1>
            <PerformanceLineChart data={lineChartData} accentColor={ACCENT_COLOR} />
            <WeeklyActivityChart data={weeklyData} accentColor={ACCENT_COLOR} />
            <div className="mt-8 space-y-4">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2">Resumen General</h3>
              <StatsSummary 
                currentStreak={processedStats.currentStreak} 
                totalCompletedDays={processedStats.perfectDays} 
                totalHabitsCompleted={processedStats.totalHabitsDone} 
                completionRate={processedStats.successRate} 
              />
            </div>
            <section className="space-y-4 mt-8">
              <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2">Frecuencia</h2>
              <HabitCalendar dailyCompletions={stats.dailyCompletions} history={stats.history} totalHabits={stats.availableHabits.length} />
            </section>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 h-24 bg-black/90 backdrop-blur-xl border-t border-white/10 px-6 flex justify-between items-center z-50">
        <button onClick={() => setCurrentPage('habits')} className={`flex flex-col items-center gap-1 transition-all ${currentPage === 'habits' ? 'text-white' : 'text-zinc-700 hover:text-zinc-500'}`}>
          <LayoutGrid size={22} strokeWidth={currentPage === 'habits' ? 2.5 : 2} />
          <span className="text-[9px] font-black uppercase tracking-widest">Inbox</span>
        </button>
        <button onClick={() => setCurrentPage('manifestation')} className={`flex flex-col items-center gap-1 transition-all ${currentPage === 'manifestation' ? 'text-white' : 'text-zinc-700 hover:text-zinc-500'}`}>
          <Sparkles size={22} strokeWidth={currentPage === 'manifestation' ? 2.5 : 2} />
          <span className="text-[9px] font-black uppercase tracking-widest">Vision</span>
        </button>
        <div className="relative -top-8">
          <button 
            onClick={() => {
              setModalMode('habit');
              setEditingHabit(null);
              setIsModalOpen(true);
            }} 
            className="w-14 h-14 bg-white rounded-[1.25rem] flex items-center justify-center text-black shadow-[0_8px_24px_rgba(255,255,255,0.2)] active:scale-90 transition-transform"
          >
            <Plus size={28} strokeWidth={3} />
          </button>
        </div>
        <button onClick={() => setCurrentPage('clips')} className={`flex flex-col items-center gap-1 transition-all ${currentPage === 'clips' ? 'text-white' : 'text-zinc-700 hover:text-zinc-500'}`}>
          <Layers size={22} strokeWidth={currentPage === 'clips' ? 2.5 : 2} />
          <span className="text-[9px] font-black uppercase tracking-widest">Clips</span>
        </button>
        <button onClick={() => setCurrentPage('stats')} className={`flex flex-col items-center gap-1 transition-all ${currentPage === 'stats' ? 'text-white' : 'text-zinc-700 hover:text-zinc-500'}`}>
          <BarChart2 size={22} strokeWidth={currentPage === 'stats' ? 2.5 : 2} />
          <span className="text-[9px] font-black uppercase tracking-widest">Stats</span>
        </button>
      </nav>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 space-y-6 animate-slide">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Agregar Nuevo</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-zinc-600 hover:text-white"><X size={24} /></button>
            </div>
            
            <div className="flex gap-2 p-1 bg-black rounded-2xl border border-white/5">
              <button onClick={() => setModalMode('habit')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${modalMode === 'habit' ? 'bg-white text-black' : 'text-zinc-600'}`}>
                <LayoutGrid size={14} /> Hábito
              </button>
              <button onClick={() => setModalMode('vision')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${modalMode === 'vision' ? 'bg-white text-black' : 'text-zinc-600'}`}>
                <ImageIcon size={14} /> Imagen
              </button>
              <button onClick={() => setModalMode('affirmation')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${modalMode === 'affirmation' ? 'bg-white text-black' : 'text-zinc-600'}`}>
                <MessageSquare size={14} /> Frase
              </button>
              <button onClick={() => setModalMode('priority')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${modalMode === 'priority' ? 'bg-white text-black' : 'text-zinc-600'}`}>
                <CheckCircle2 size={14} /> Prioridad
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-6 pt-2">
              {modalMode === 'habit' && (
                <>
                  <input name="name" defaultValue={editingHabit?.name || ''} placeholder="Ej: Meditar" className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-1 focus:ring-white/50 outline-none placeholder:text-zinc-700" required />
                  <input name="subtitle" defaultValue={editingHabit?.subtitle || ''} placeholder="Ej: 10 minutos" className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-white outline-none placeholder:text-zinc-700" />
                  <select name="timeOfDay" className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-white outline-none">
                    <option value="MAÑANA">Mañana</option>
                    <option value="TARDE / NOCHE">Tarde / Noche</option>
                  </select>
                </>
              )}
              {modalMode === 'vision' && (
                <>
                  <input name="url" placeholder="URL de la imagen..." className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-white outline-none placeholder:text-zinc-700" required />
                  <input name="caption" placeholder="Texto descriptivo..." className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-white outline-none placeholder:text-zinc-700" />
                </>
              )}
              {modalMode === 'affirmation' && (
                <input name="text" placeholder="Escribe tu afirmación..." className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-white outline-none placeholder:text-zinc-700" required />
              )}
              {modalMode === 'priority' && (
                <input name="text" placeholder="Tarea más importante..." className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-white outline-none placeholder:text-zinc-700" required />
              )}
              <button type="submit" className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors">Confirmar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
