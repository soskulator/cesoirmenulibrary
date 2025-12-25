import { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { MenuItem } from '@/data/menuData';
import { getDishImage } from '@/data/dishImages';
import { cn } from '@/lib/utils';
import { Wine, GlassWater } from 'lucide-react';

interface BeverageFlashCardProps {
  item: MenuItem;
  className?: string;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

const SWIPE_THRESHOLD = 50;

// Determine beverage type for styling
const getBeverageType = (categoryId: string) => {
  switch (categoryId) {
    case 'wine':
      return {
        frontBg: 'bg-gradient-to-b from-[#2d1f1f] via-[#3d2828] to-[#1a1414]',
        backBg: 'bg-gradient-to-b from-[#2d1f1f] via-[#3d2828] to-[#1a1414]',
        frontTextColor: 'text-cream',
        accentColor: 'text-copper',
        icon: Wine,
      };
    case 'spirits':
      return {
        frontBg: 'bg-gradient-to-b from-white via-cream to-cream-dark',
        backBg: 'bg-gradient-to-b from-[#1a1a2e] via-[#232340] to-[#0f0f1a]',
        frontTextColor: 'text-charcoal',
        accentColor: 'text-gold',
        icon: GlassWater,
      };
    case 'cocktails':
      return {
        frontBg: 'bg-gradient-to-b from-[#1f2d2d] via-[#283d3d] to-[#141a1a]',
        backBg: 'bg-gradient-to-b from-[#1f2d2d] via-[#283d3d] to-[#141a1a]',
        frontTextColor: 'text-cream',
        accentColor: 'text-jade-light',
        icon: GlassWater,
      };
    default:
      return {
        frontBg: 'bg-gradient-to-b from-charcoal via-charcoal-light to-charcoal',
        backBg: 'bg-gradient-to-b from-charcoal via-charcoal-light to-charcoal',
        frontTextColor: 'text-cream',
        accentColor: 'text-copper',
        icon: Wine,
      };
  }
};

export function BeverageFlashCard({ 
  item, 
  className,
  onSwipeLeft,
  onSwipeRight 
}: BeverageFlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const dishImage = getDishImage(item.id);
  const beverageType = getBeverageType(item.categoryId);
  const BeverageIcon = beverageType.icon;

  // Swipe gesture handling
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  const handleFlip = () => setIsFlipped((prev) => !prev);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset } = info;
    
    // Check for vertical swipe to flip
    if (Math.abs(offset.y) > SWIPE_THRESHOLD && Math.abs(offset.y) > Math.abs(offset.x)) {
      handleFlip();
    }
    // Check for horizontal swipe to navigate
    else if (Math.abs(offset.x) > SWIPE_THRESHOLD) {
      if (offset.x > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (offset.x < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
  };

  return (
    <motion.div
      className={cn('flip-card w-full max-w-md mx-auto cursor-pointer select-none touch-none h-[320px] sm:h-[380px] md:h-[460px]', className)}
      style={{ x, y, rotateX, rotateY, perspective: 1000 }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 0.98 }}
      tabIndex={0}
      role="button"
      aria-label={`Flash card for ${item.name}. Swipe up/down to flip, left/right to navigate.`}
    >
      <div
        className={cn('flip-card-inner relative w-full h-full', isFlipped && 'flipped')}
        onClick={handleFlip}
        onKeyDown={(e) => e.key === 'Enter' && handleFlip()}
      >
        {/* Front: Bottle Image + Name */}
        <div
          className={cn(
            'flip-card-front absolute inset-0 rounded-2xl overflow-hidden shadow-elevated flex flex-col border border-border/20',
            beverageType.frontBg
          )}
        >
          {/* Bottle Display Area - Fixed height for uniformity */}
          <div className="flex-1 relative flex items-center justify-center p-4 sm:p-6">
            {/* Subtle radial gradient backdrop */}
            <div className="absolute inset-0 bg-gradient-radial from-copper/5 via-transparent to-transparent" />
            
            {dishImage ? (
              <div className="relative h-full flex items-center justify-center">
                {/* Bottle shadow/glow effect */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-charcoal/5 blur-3xl" />
                </div>
                
                {/* Bottle image - constrained to show label clearly */}
                <img
                  src={dishImage}
                  alt={item.name}
                  className="relative z-10 h-full max-h-[180px] sm:max-h-[220px] md:max-h-[280px] w-auto object-contain drop-shadow-2xl pointer-events-none"
                  style={{ 
                    filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.15))'
                  }}
                />
              </div>
            ) : (
              <div className={cn("flex flex-col items-center justify-center gap-3", 
                item.categoryId === 'spirits' ? 'text-charcoal/30' : 'text-cream/30'
              )}>
                <BeverageIcon className="w-16 h-16 sm:w-20 sm:h-20" />
                <span className="text-sm">No image</span>
              </div>
            )}
          </div>

          {/* Name overlay with elegant styling */}
          <div className={cn(
            "p-4 sm:p-5 md:p-6",
            item.categoryId === 'spirits' 
              ? "bg-gradient-to-t from-charcoal via-charcoal/90 to-charcoal/70" 
              : "bg-gradient-to-t from-black/90 via-black/60 to-transparent"
          )}>
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-cream/50 mb-1.5 text-center">
              Swipe up to flip
            </p>
            <h2 className="font-serif text-lg sm:text-xl md:text-2xl font-semibold text-cream text-center leading-tight">
              {item.name}
            </h2>
            <p className={cn("text-xs sm:text-sm text-center mt-1 truncate", beverageType.accentColor)}>
              {item.shortDescription}
            </p>
          </div>
        </div>

        {/* Back: Details */}
        <div
          className={cn(
            'flip-card-back absolute inset-0 rounded-2xl overflow-hidden shadow-elevated flex flex-col',
            beverageType.backBg
          )}
        >
          <div className="flex-1 overflow-y-auto scrollbar-hide p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
            {/* Title */}
            <div className="text-center pb-3 border-b border-white/10">
              <h2 className="font-serif text-lg sm:text-xl md:text-2xl font-semibold text-cream leading-tight">
                {item.name}
              </h2>
              <p className={cn("text-xs sm:text-sm mt-1", beverageType.accentColor)}>
                {item.shortDescription}
              </p>
            </div>

            {/* Description */}
            <p className="text-cream/80 text-xs sm:text-sm leading-relaxed">
              {item.longDescription}
            </p>

            {/* Details Grid */}
            <div className="space-y-2.5">
              {/* Grape/Spirit/Ingredients */}
              <div className="bg-white/5 rounded-lg p-2.5 sm:p-3">
                <h3 className={cn("text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1", beverageType.accentColor)}>
                  {item.categoryId === 'wine' ? 'Grape & Region' : 'Profile'}
                </h3>
                <p className="text-cream/90 text-xs sm:text-sm">
                  {item.ingredientsText}
                </p>
              </div>

              {/* Selling Points */}
              <div className="bg-white/5 rounded-lg p-2.5 sm:p-3">
                <h3 className={cn("text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1", beverageType.accentColor)}>
                  Selling Points
                </h3>
                <p className="text-cream/90 text-xs sm:text-sm">
                  {item.sellingPointsText}
                </p>
              </div>

              {/* Prep Notes if available */}
              {item.prepNotes && (
                <div className="bg-white/5 rounded-lg p-2.5 sm:p-3">
                  <h3 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1 text-cream/60">
                    Notes
                  </h3>
                  <p className="text-cream/80 text-xs sm:text-sm">
                    {item.prepNotes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Flip hint */}
          <div className="p-3 text-center border-t border-white/10">
            <p className="text-[10px] sm:text-xs text-cream/40 tracking-wide">
              Swipe down to flip back
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
