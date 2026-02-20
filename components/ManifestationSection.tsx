
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { VisionItem } from '../types';

interface ManifestationSectionProps {
  visionBoard: VisionItem[];
  onUpdateVision: (items: VisionItem[]) => void;
  accentColor: string;
}

export const ManifestationSection: React.FC<ManifestationSectionProps> = ({
  visionBoard,
  onUpdateVision,
  accentColor
}) => {
  const removeImage = (index: number) => {
    onUpdateVision(visionBoard.filter((_, i) => i !== index));
  };

  return (
    <div className="pb-24 pt-6">
      {/* Vision Board Area - Minimalist Grid */}
      <section className="space-y-6">
        <div className="columns-2 gap-4 space-y-6">
          <AnimatePresence>
            {visionBoard.map((item, idx) => (
              <motion.div 
                key={item.url + idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative group mb-4"
              >
                <div className="rounded-[2rem] overflow-hidden border border-white/5 bg-stone-900/20 shadow-2xl">
                  <img 
                    src={item.url} 
                    alt={item.caption} 
                    className="w-full object-cover" 
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => removeImage(idx)}
                      className="bg-red-500/80 backdrop-blur-md text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                {item.caption && (
                  <p className="mt-3 px-3 text-[10px] font-black text-stone-600 uppercase tracking-[0.25em] text-center leading-relaxed">
                    {item.caption}
                  </p>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};
