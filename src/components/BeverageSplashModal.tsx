import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X, Wine, Sparkles, GlassWater } from 'lucide-react';
import { MenuItem } from '@/data/menuData';
import { getDishImage } from '@/data/dishImages';
import { cn } from '@/lib/utils';

interface BeverageSplashModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  type: 'wine' | 'spirit' | 'cocktail';
}

export function BeverageSplashModal({ item, isOpen, onClose, type }: BeverageSplashModalProps) {
  if (!item) return null;

  const image = getDishImage(item.id);
  
  const bgGradient = type === 'wine' 
    ? 'from-[#2a1f3d] via-[#1a1525] to-[#0d0a12]'
    : type === 'cocktail'
    ? 'from-[#1a2a3d] via-[#101a25] to-[#080d12]'
    : 'from-[#2d2318] via-[#1a1510] to-[#0d0a08]';
  
  const accentColor = type === 'wine' 
    ? 'text-rose-300' 
    : type === 'cocktail' 
    ? 'text-cyan-300' 
    : 'text-amber-300';
  const glowColor = type === 'wine' 
    ? 'shadow-rose-500/20' 
    : type === 'cocktail' 
    ? 'shadow-cyan-500/20' 
    : 'shadow-amber-500/20';

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Close if dragged down more than 100px or with sufficient velocity
    if (info.offset.y > 100 || info.velocity.y > 500) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Content - Swipeable */}
          <motion.div
            className={cn(
              "relative w-full max-w-2xl max-h-[90vh] mx-4 rounded-3xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing",
              glowColor
            )}
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.1, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
          >
            {/* Background Gradient */}
            <div className={cn("absolute inset-0 bg-gradient-to-b", bgGradient)} />
            
            {/* Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-copper/10 blur-3xl"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.div
                className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-copper/10 blur-3xl"
                animate={{ 
                  scale: [1.2, 1, 1.2],
                  opacity: [0.5, 0.3, 0.5]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            </div>

            {/* Close Button - Fixed position outside scrollable area */}
            <motion.button
              className="absolute top-4 right-4 z-50 p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors border border-white/20"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.button>

            {/* Scrollable Content */}
            <div className="relative z-10 overflow-y-auto max-h-[90vh] p-6 md:p-8 pt-16">
              {/* Bottle Image */}
              <motion.div
                className="flex justify-center mb-8"
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <div className="relative">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-copper/20 blur-2xl rounded-full scale-150" />
                  
                  {image ? (
                    <motion.img
                      src={image}
                      alt={item.name}
                      className="relative w-auto h-48 md:h-64 object-contain drop-shadow-2xl"
                      initial={{ rotateY: -15 }}
                      animate={{ rotateY: 0 }}
                      transition={{ duration: 0.6 }}
                    />
                  ) : (
                    <div className="relative w-32 h-48 md:h-64 flex items-center justify-center">
                      {type === 'wine' ? (
                        <Wine className="w-16 h-16 text-copper/50" />
                      ) : type === 'cocktail' ? (
                        <GlassWater className="w-16 h-16 text-copper/50" />
                      ) : (
                        <span className="text-6xl">🥃</span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Title */}
              <motion.div
                className="text-center mb-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <h2 className="font-serif text-2xl md:text-4xl font-bold text-white mb-2">
                  {item.name}
                </h2>
                <p className={cn("text-lg font-serif italic", accentColor)}>
                  {item.shortDescription}
                </p>
              </motion.div>

              {/* Divider */}
              <motion.div
                className="flex items-center justify-center gap-4 mb-6"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-copper/50" />
                <Sparkles className="w-4 h-4 text-copper" />
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-copper/50" />
              </motion.div>

              {/* Description */}
              <motion.div
                className="space-y-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                {/* Long Description */}
                <div>
                  <p className="text-white/80 leading-relaxed text-center md:text-lg">
                    {item.longDescription}
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Origin/Ingredients */}
                  {item.ingredientsText && (
                    <motion.div
                      className="bg-white/5 rounded-2xl p-4 backdrop-blur-sm"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.4 }}
                    >
                      <h3 className="text-copper text-sm font-semibold uppercase tracking-wide mb-2">
                        {type === 'wine' ? 'Origin & Grape' : type === 'cocktail' ? 'Ingredients' : 'Details'}
                      </h3>
                      <p className="text-white/70 text-sm leading-relaxed">
                        {item.ingredientsText}
                      </p>
                    </motion.div>
                  )}

                  {/* Selling Points */}
                  {item.sellingPointsText && (
                    <motion.div
                      className="bg-white/5 rounded-2xl p-4 backdrop-blur-sm"
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.6, duration: 0.4 }}
                    >
                      <h3 className="text-copper text-sm font-semibold uppercase tracking-wide mb-2">
                        Tasting Notes
                      </h3>
                      <p className="text-white/70 text-sm leading-relaxed">
                        {item.sellingPointsText}
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Pairing/Prep Notes */}
                {item.prepNotes && (
                  <motion.div
                    className="bg-copper/10 rounded-2xl p-4 backdrop-blur-sm"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.4 }}
                  >
                    <h3 className="text-copper text-sm font-semibold uppercase tracking-wide mb-2">
                      {type === 'wine' ? 'Pairing Suggestions' : type === 'cocktail' ? 'Bartender Notes' : 'Serving Notes'}
                    </h3>
                    <p className="text-white/70 text-sm leading-relaxed italic">
                      {item.prepNotes}
                    </p>
                  </motion.div>
                )}
              </motion.div>

              {/* Bottom Padding for scroll */}
              <div className="h-4" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
