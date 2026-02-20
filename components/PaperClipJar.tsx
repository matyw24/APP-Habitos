
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paperclip, MoreVertical, RefreshCcw } from 'lucide-react';

interface PaperClipTrackerProps {
  count: number;
  total: number;
  onMove: () => void;
  onSetTotal: (total: number) => void;
  onReset: () => void;
  accentColor: string;
}

const PaperClip: React.FC<{ id: string | number; color: string; isMoving?: boolean }> = ({ id, color }) => {
  const randomX = useMemo(() => Math.random() * 50 - 25, []);
  const randomY = useMemo(() => Math.random() * 40 - 20, []);
  const randomRotate = useMemo(() => Math.random() * 360, []);

  return (
    <motion.div
      layoutId={`clip-${id}`}
      initial={{ scale: 0, opacity: 0, y: -50 }}
      animate={{ 
        scale: 1, 
        opacity: 1, 
        x: randomX, 
        y: randomY, 
        rotate: randomRotate 
      }}
      exit={{ scale: 0.5, opacity: 0, x: 100, transition: { duration: 0.3 } }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="absolute pointer-events-none"
      style={{ color }}
    >
      <Paperclip size={24} strokeWidth={1.5} />
    </motion.div>
  );
};

export const PaperClipTracker: React.FC<PaperClipTrackerProps> = ({ 
  count, 
  total, 
  onMove, 
  onSetTotal, 
  onReset,
  accentColor 
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const remaining = Math.max(0, total - count);

  const handleSetTotal = (val: number) => {
    onSetTotal(val);
    setShowSettings(false);
  };

  return (
    <div className="relative flex flex-col items-center py-4">
      {/* Settings Menu Button */}
      <button 
        onClick={() => setShowSettings(!showSettings)}
        className="absolute top-0 right-0 p-2 text-zinc-600 hover:text-white transition-colors z-20"
      >
        <MoreVertical size={20} />
      </button>

      {/* Settings Dropdown */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute top-10 right-0 w-48 bg-black border border-white/20 rounded-2xl p-4 shadow-2xl z-30 space-y-4"
          >
            <div className="space-y-2">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Cantidad Total</span>
              <div className="grid grid-cols-3 gap-2">
                {[10, 20, 50, 100].map(val => (
                  <button 
                    key={val}
                    onClick={() => handleSetTotal(val)}
                    className={`text-[10px] font-black py-1.5 rounded-lg border transition-all ${total === val ? 'bg-white border-white text-black' : 'border-zinc-800 text-zinc-400 hover:border-zinc-600'}`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
            <button 
              onClick={() => { onReset(); setShowSettings(false); }}
              className="w-full flex items-center justify-center gap-2 text-[10px] font-black text-zinc-400 hover:text-white py-2 border border-zinc-800 rounded-lg transition-colors"
            >
              <RefreshCcw size={12} />
              REINICIAR
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-center gap-12 sm:gap-16 py-6 w-full">
        {/* Source Jar */}
        <div className="flex flex-col items-center gap-4">
          <div 
            onClick={remaining > 0 ? onMove : undefined}
            className={`relative w-24 h-36 sm:w-28 sm:h-44 border border-zinc-700 rounded-b-[2.5rem] rounded-t-xl bg-zinc-950/40 flex items-center justify-center cursor-pointer transition-all active:scale-95 group hover:border-zinc-500 ${remaining === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="absolute top-0 inset-x-0 h-4 bg-zinc-900 rounded-t-lg border-b border-white/10" />
            <AnimatePresence>
              {Array.from({ length: Math.min(30, remaining) }).map((_, i) => (
                <PaperClip key={`remaining-${i}`} id={`rem-${i}`} color="#52525b" /> // Zinc-600
              ))}
            </AnimatePresence>
            {remaining > 30 && (
              <span className="absolute bottom-4 text-[10px] font-black text-zinc-500">+{remaining - 30}</span>
            )}
            {remaining === 0 && (
              <span className="text-[10px] font-black text-zinc-800 uppercase tracking-widest">Vacío</span>
            )}
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors pointer-events-none" />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Pendientes</span>
            <span className="text-sm font-black text-zinc-400">{remaining}</span>
          </div>
        </div>

        {/* Done Jar */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-24 h-36 sm:w-28 sm:h-44 border border-white/20 rounded-b-[2.5rem] rounded-t-xl bg-white/5 flex items-center justify-center transition-all overflow-hidden group">
            <div className="absolute top-0 inset-x-0 h-4 bg-zinc-800/50 rounded-t-lg border-b border-white/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent pointer-events-none" />
            <AnimatePresence>
              {Array.from({ length: Math.min(30, count) }).map((_, i) => (
                <PaperClip key={`done-${i}`} id={`done-${i}`} color="#ffffff" />
              ))}
            </AnimatePresence>
            {count > 30 && (
              <span className="absolute bottom-4 text-[10px] font-black text-white/40">+{count - 30}</span>
            )}
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Logrados</span>
            <span className="text-sm font-black text-white">{count}</span>
          </div>
        </div>
      </div>

      <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mt-4">
        Toca el frasco de la izquierda para mover un clip manualmente
      </p>
    </div>
  );
};
