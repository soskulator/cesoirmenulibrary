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
        imageBg: '#2d1f1f',
        imageGradient: 'from-[#2d1f1f] via-transparent to-[#2d1f1f]',
      };
    case 'spirits':
      return {
        frontBg: 'bg-gradient-to-b from-[#f8f6f3] via-[#f0ebe4] to-[#e8e2d9]',
        backBg: 'bg-gradient-to-b from-[#1a1a2e] via-[#232340] to-[#0f0f1a]',
        frontTextColor: 'text-charcoal',
        accentColor: 'text-gold',
        icon: GlassWater,
        imageBg: '#f8f6f3',
        imageGradient: 'from-[#f8f6f3] via-transparent to-[#f8f6f3]',
      };
    case 'cocktails':
      return {
        frontBg: 'bg-gradient-to-b from-[#1f2d2d] via-[#283d3d] to-[#141a1a]',
        backBg: 'bg-gradient-to-b from-[#1f2d2d] via-[#283d3d] to-[#141a1a]',
        frontTextColor: 'text-cream',
        accentColor: 'text-jade-light',
        icon: GlassWater,
        imageBg: '#1f2d2d',
        imageGradient: 'from-[#1f2d2d] via-transparent to-[#1f2d2d]',
      };
    default:
      return {
        frontBg: 'bg-gradient-to-b from-charcoal via-charcoal-light to-charcoal',
        backBg: 'bg-gradient-to-b from-charcoal via-charcoal-light to-charcoal',
        frontTextColor: 'text-cream',
        accentColor: 'text-copper',
        icon: Wine,
        imageBg: '#2a2a2a',
        imageGradient: 'from-charcoal via-transparent to-charcoal',
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
  const dishImage = getDishImage(item.id, item.imageUrl);
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
          {/* Bottle Display Area - Maximized for clear visibility */}
          <div className="flex-1 relative flex items-center justify-center overflow-hidden min-h-0">
            {/* Clean background */}
            <div 
              className="absolute inset-0"
              style={{ backgroundColor: beverageType.imageBg }}
            />
            
            {dishImage ? (
              <div className="relative w-full h-full flex items-center justify-center py-3 px-6 sm:py-4 sm:px-8">
                {/* Bottle image - sized to fill the card while maintaining aspect ratio */}
                <img
                  src={dishImage}
                  alt={item.name}
                  className="max-h-full max-w-full object-contain pointer-events-none"
                  style={{ 
                    filter: `drop-shadow(0 4px 20px ${beverageType.imageBg === '#f8f6f3' ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.5)'})`,
                    height: '100%',
                    width: 'auto',
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

          {/* Compact name bar at bottom */}
          <div className={cn(
            "px-4 py-3 sm:px-5 sm:py-4 shrink-0",
            item.categoryId === 'spirits' 
              ? "bg-charcoal" 
              : "bg-black/90"
          )}>
            <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] text-cream/40 mb-1 text-center">
              Swipe up to flip
            </p>
            <h2 className="font-serif text-base sm:text-lg md:text-xl font-semibold text-cream text-center leading-tight truncate">
              {item.name}
            </h2>
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
              {/* Recipe / Ingredients with measurements - prominent for cocktails */}
              <div className="bg-white/5 rounded-lg p-2.5 sm:p-3">
                <h3 className={cn("text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1", beverageType.accentColor)}>
                  {item.categoryId === 'cocktails' ? 'Recipe' : item.categoryId === 'wine' ? 'Grape & Region' : 'Profile'}
                </h3>
                <p className="text-cream/90 text-xs sm:text-sm font-medium">
                  {item.ingredientsText}
                </p>
              </div>

              {/* Method / Prep Notes - always show for cocktails */}
              {item.prepNotes && (
                <div className="bg-white/5 rounded-lg p-2.5 sm:p-3">
                  <h3 className={cn("text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1", 
                    item.categoryId === 'cocktails' ? beverageType.accentColor : "text-cream/60"
                  )}>
                    {item.categoryId === 'cocktails' ? 'Method' : 'Notes'}
                  </h3>
                  <p className="text-cream/90 text-xs sm:text-sm">
                    {item.prepNotes}
                  </p>
                </div>
              )}

              {/* Selling Points */}
              <div className="bg-white/5 rounded-lg p-2.5 sm:p-3">
                <h3 className={cn("text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1", beverageType.accentColor)}>
                  Selling Points
                </h3>
                <p className="text-cream/90 text-xs sm:text-sm">
                  {item.sellingPointsText}
                </p>
              </div>
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
