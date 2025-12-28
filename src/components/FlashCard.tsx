import { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { MenuItem } from '@/data/menuData';
import { getDishImage } from '@/data/dishImages';
import { AllergenList } from './AllergenBadge';
import { cn } from '@/lib/utils';

interface FlashCardProps {
  item: MenuItem;
  showAllergens?: boolean;
  showPrepNotes?: boolean;
  className?: string;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

// Category background themes
const categoryBackgrounds: Record<string, string> = {
  appetizers: 'bg-gradient-to-br from-copper/20 via-rose-gold/10 to-cream',
  entrees: 'bg-gradient-to-br from-jade/20 via-jade-light/10 to-cream',
  desserts: 'bg-gradient-to-br from-rose-gold/25 via-copper-light/10 to-cream',
  sides: 'bg-gradient-to-br from-wood/15 via-wood-light/10 to-cream',
  specials: 'bg-gradient-to-br from-gold/20 via-copper/10 to-cream',
};

const categoryAccents: Record<string, string> = {
  appetizers: 'border-copper/30',
  entrees: 'border-jade/30',
  desserts: 'border-rose-gold/30',
  sides: 'border-wood/30',
  specials: 'border-gold/30',
};

const SWIPE_THRESHOLD = 50;

export function FlashCard({ 
  item, 
  showAllergens = true, 
  showPrepNotes = false, 
  className,
  onSwipeLeft,
  onSwipeRight 
}: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const dishImage = getDishImage(item.id);

  const bgClass = categoryBackgrounds[item.categoryId] || categoryBackgrounds.appetizers;
  const borderClass = categoryAccents[item.categoryId] || categoryAccents.appetizers;

  // Swipe gesture handling
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  const handleFlip = () => setIsFlipped((prev) => !prev);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;
    
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
      className={cn('flip-card w-full max-w-lg mx-auto cursor-pointer select-none touch-none h-[520px] sm:h-[560px] md:h-[600px]', className)}
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
        {/* Front: Image + Name */}
        <div
          className={cn(
            'flip-card-front absolute inset-0 rounded-xl border-2 overflow-hidden shadow-elevated flex flex-col',
            bgClass,
            borderClass
          )}
        >
          {/* Image area */}
          <div className="flex-1 relative">
            {dishImage ? (
              <img
                src={dishImage}
                alt={item.name}
                className="w-full h-full object-cover pointer-events-none"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <span className="text-7xl opacity-40">🍽️</span>
              </div>
            )}
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent pointer-events-none" />
          </div>

          {/* Name overlay with larger touch target */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 md:p-6 text-center">
            <p className="text-[10px] sm:text-xs uppercase tracking-widest text-cream/70 mb-1">
              Swipe up to flip • Left/right to navigate
            </p>
            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-semibold text-cream drop-shadow-md">
              {item.name}
            </h2>
          </div>
        </div>

        {/* Back: Bento Grid Detail View */}
        <div
          className={cn(
            'flip-card-back absolute inset-0 rounded-xl border-2 overflow-hidden shadow-elevated p-4 flex flex-col',
            bgClass,
            borderClass
          )}
        >
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {/* Bento Grid Layout */}
            <div className="grid grid-cols-3 gap-4 h-full auto-rows-fr">
              {/* Main Image - spans 2 columns, 2 rows */}
              <div className="col-span-2 row-span-2 rounded-xl overflow-hidden relative">
                {dishImage ? (
                  <img
                    src={dishImage}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted rounded-xl">
                    <span className="text-5xl opacity-40">🍽️</span>
                  </div>
                )}
                {/* Name overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-charcoal/90 to-transparent">
                  <h2 className="font-serif text-lg sm:text-xl font-semibold text-cream leading-tight">{item.name}</h2>
                  <p className="text-copper text-xs sm:text-sm mt-0.5">{item.shortDescription}</p>
                </div>
              </div>

              {/* Allergen Card - small square */}
              <div className="col-span-1 row-span-1 rounded-xl bg-destructive/10 border border-destructive/20 p-3 flex flex-col">
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-destructive mb-2">Allergens</h3>
                {item.allergens.length > 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <AllergenList allergens={item.allergens} size="sm" />
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">None</span>
                  </div>
                )}
              </div>

              {/* Selling Points Card - small square */}
              <div className="col-span-1 row-span-1 rounded-xl bg-copper/10 border border-copper/20 p-3 flex flex-col">
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-copper mb-1">Why It's Great</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-4 flex-1">{item.sellingPointsText}</p>
              </div>

              {/* Description Card - tall vertical, spans full width */}
              <div className="col-span-2 row-span-1 rounded-xl bg-card/50 border border-border/30 p-3 flex flex-col">
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-jade mb-1">Description</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3">{item.longDescription}</p>
              </div>

              {/* Ingredients Card */}
              <div className="col-span-1 row-span-1 rounded-xl bg-jade/10 border border-jade/20 p-3 flex flex-col">
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-jade mb-1">Ingredients</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-5 flex-1">{item.ingredientsText}</p>
              </div>

              {/* Prep Notes Card (if available) */}
              {showPrepNotes && item.prepNotes && (
                <div className="col-span-3 row-span-1 rounded-xl bg-muted/50 border border-border/30 p-3">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Prep Notes</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.prepNotes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Flip hint */}
          <p className="text-[10px] text-center text-muted-foreground mt-2 pt-2 border-t border-border/50">
            Swipe down to flip back
          </p>
        </div>
      </div>
    </motion.div>
  );
}
